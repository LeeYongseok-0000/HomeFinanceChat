#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
통합 챗봇 시스템
부동산 관련 질문에 대한 지능형 응답 제공
"""

import json
import re
from datetime import datetime
from typing import Dict, List, Any, Optional
from openai import OpenAI
from voice_service import VoiceService
from database_service import DatabaseService

class IntegratedChatbot:
    """통합 챗봇 클래스"""
    
    def __init__(self, openai_api_key: str, backend_url: str = "http://localhost:8080"):
        self.client = OpenAI(api_key=openai_api_key)
        self.voice_service = VoiceService()
        self.database_service = DatabaseService(backend_url)
        self.conversation_history = []
        
        # 부동산 관련 시스템 프롬프트
        self.system_prompt = """
당신은 부동산 전문가 AI 어시스턴트입니다. 다음 기능들을 제공합니다:

1. **아파트 정보 검색**: 지역, 가격대, 면적 등으로 아파트 추천
2. **부동산 시장 분석**: 현재 시장 동향과 전망 분석
3. **대출 상담**: 주택담보대출, 전세자금대출 등 상담
4. **투자 조언**: 부동산 투자 전략과 리스크 분석
5. **법률 상담**: 부동산 거래 관련 법적 주의사항
6. **음성 상담**: 음성으로 질문하고 음성으로 답변

**중요**: 사용자의 질문에 답변할 때는 실제 데이터베이스의 부동산 정보를 활용하세요.
아파트 추천, 시세 정보, 실거래 데이터 등이 요청되면 반드시 데이터베이스에서 실제 정보를 조회하여 제공하세요.

한국어로 친근하고 전문적으로 답변하세요. 
사용자의 질문을 분석하여 가장 적절한 정보를 제공하세요.
"""
    
    def process_text_message(self, message: str, user_id: str = None) -> Dict[str, Any]:
        """텍스트 메시지 처리"""
        try:
            # 대화 기록에 사용자 메시지 추가
            self.conversation_history.append({
                "role": "user",
                "content": message,
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id
            })
            
            # 데이터베이스에서 관련 정보 조회
            db_data = self._get_relevant_database_data(message)
            
            # 데이터베이스 정보를 포함한 시스템 프롬프트 생성
            enhanced_prompt = self._create_enhanced_prompt(message, db_data)
            
            # OpenAI GPT에게 질문 전달
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": enhanced_prompt},
                    *[{"role": msg["role"], "content": msg["content"]} 
                      for msg in self.conversation_history[-10:]]  # 최근 10개 메시지만 사용
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            ai_answer = response.choices[0].message.content
            
            # 대화 기록에 AI 응답 추가
            self.conversation_history.append({
                "role": "assistant",
                "content": ai_answer,
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id
            })
            
            # 응답 데이터 구성
            response_data = {
                "success": True,
                "answer": ai_answer,
                "message_type": "text",
                "timestamp": datetime.now().isoformat(),
                "conversation_id": len(self.conversation_history) // 2,
                "data": self._extract_relevant_data(message, ai_answer),
                "database_data": db_data
            }
            
            return response_data
            
        except Exception as e:
            print(f"텍스트 메시지 처리 오류: {str(e)}")
            return {
                "success": False,
                "error": f"메시지 처리 중 오류가 발생했습니다: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    def process_voice_message(self, audio_file_path: str, user_id: str = None) -> Dict[str, Any]:
        """음성 메시지 처리"""
        try:
            # 음성을 텍스트로 변환
            transcript, confidence = self.voice_service.speech_to_text(audio_file_path)
            
            if not transcript:
                return {
                    "success": False,
                    "error": "음성을 인식할 수 없습니다.",
                    "timestamp": datetime.now().isoformat()
                }
            
            # 텍스트 메시지로 처리
            text_response = self.process_text_message(transcript, user_id)
            
            if not text_response["success"]:
                return text_response
            
            # AI 응답을 음성으로 변환
            voice_audio = self.voice_service.create_voice_response(text_response["answer"])
            
            # 음성 응답 데이터 구성
            response_data = {
                "success": True,
                "transcript": transcript,
                "confidence": confidence,
                "answer": text_response["answer"],
                "voice_response": voice_audio,
                "message_type": "voice",
                "timestamp": datetime.now().isoformat(),
                "conversation_id": text_response["conversation_id"],
                "data": text_response["data"]
            }
            
            return response_data
            
        except Exception as e:
            print(f"음성 메시지 처리 오류: {str(e)}")
            return {
                "success": False,
                "error": f"음성 처리 중 오류가 발생했습니다: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    def _extract_relevant_data(self, message: str, answer: str) -> Dict[str, Any]:
        """메시지에서 관련 데이터 추출"""
        data = {}
        
        # 지역 정보 추출
        location_patterns = [
            r'([가-힣]+시|[가-힣]+구|[가-힣]+동|[가-힣]+읍|[가-힣]+면)',
            r'([가-힣]+아파트|[가-힣]+단지)'
        ]
        
        for pattern in location_patterns:
            matches = re.findall(pattern, message)
            if matches:
                data["locations"] = matches
                break
        
        # 가격 정보 추출
        price_patterns = [
            r'(\d+)억',
            r'(\d+)천만원',
            r'(\d+)만원'
        ]
        
        for pattern in price_patterns:
            matches = re.findall(pattern, message)
            if matches:
                data["prices"] = [int(match) for match in matches]
                break
        
        # 면적 정보 추출
        area_patterns = [
            r'(\d+)평',
            r'(\d+)㎡',
            r'(\d+)제곱미터'
        ]
        
        for pattern in area_patterns:
            matches = re.findall(pattern, message)
            if matches:
                data["areas"] = [int(match) for match in matches]
                break
        
        # 질문 유형 분류
        question_types = {
            "아파트_검색": ["아파트", "단지", "추천", "찾기", "검색"],
            "가격_정보": ["가격", "시세", "매매가", "전세가", "월세"],
            "대출_상담": ["대출", "담보", "전세자금", "주택담보"],
            "투자_조언": ["투자", "수익률", "리스크", "전망"],
            "법률_상담": ["계약", "법적", "주의사항", "분쟁"]
        }
        
        for q_type, keywords in question_types.items():
            if any(keyword in message for keyword in keywords):
                data["question_type"] = q_type
                break
        
        return data
    
    def _get_relevant_database_data(self, message: str) -> Dict[str, Any]:
        """메시지에 관련된 데이터베이스 정보 조회"""
        try:
            db_data = {}
            
            # 지역 정보 추출
            locations = self._extract_locations(message)
            if locations:
                # 해당 지역의 아파트 정보 조회
                apartments = self.database_service.get_apartments({'location': locations[0]})
                if apartments:
                    db_data['apartments'] = apartments[:5]  # 상위 5개만
                
                # 해당 지역의 시장 동향 조회
                market_trends = self.database_service.get_market_trends(locations[0])
                if market_trends:
                    db_data['market_trends'] = market_trends
                
                # 해당 지역의 최근 실거래 정보 조회
                recent_transactions = self.database_service.get_recent_transactions(locations[0], 5)
                if recent_transactions:
                    db_data['recent_transactions'] = recent_transactions
            
            # 아파트 검색 관련 키워드가 있는 경우
            if any(keyword in message for keyword in ['아파트', '단지', '추천', '찾기', '검색']):
                if not db_data.get('apartments'):
                    # 전체 아파트 목록 조회
                    apartments = self.database_service.get_apartments()
                    if apartments:
                        db_data['apartments'] = apartments[:10]  # 상위 10개만
            
            # 가격 관련 키워드가 있는 경우
            if any(keyword in message for keyword in ['가격', '시세', '매매가', '전세가', '월세']):
                if locations:
                    price_analysis = self.database_service.get_price_analysis(locations[0])
                    if price_analysis:
                        db_data['price_analysis'] = price_analysis
            
            # 대출 관련 키워드가 있는 경우
            if any(keyword in message for keyword in ['대출', '담보', '전세자금', '주택담보']):
                loan_info = self.database_service.get_loan_info()
                if loan_info:
                    db_data['loan_info'] = loan_info
            
            return db_data
            
        except Exception as e:
            print(f"데이터베이스 데이터 조회 오류: {str(e)}")
            return {}
    
    def _create_enhanced_prompt(self, message: str, db_data: Dict[str, Any]) -> str:
        """데이터베이스 정보를 포함한 향상된 프롬프트 생성"""
        enhanced_prompt = self.system_prompt + "\n\n"
        
        if db_data:
            enhanced_prompt += "**현재 사용 가능한 데이터베이스 정보:**\n"
            
            if 'apartments' in db_data:
                enhanced_prompt += f"- 아파트 정보: {len(db_data['apartments'])}개\n"
                for apt in db_data['apartments'][:3]:  # 상위 3개만 표시
                    enhanced_prompt += f"  * {apt.get('name', 'N/A')} - {apt.get('location', 'N/A')} - {apt.get('price', 'N/A')}\n"
            
            if 'market_trends' in db_data:
                enhanced_prompt += f"- 시장 동향 정보: {len(db_data['market_trends'])}개 항목\n"
            
            if 'recent_transactions' in db_data:
                enhanced_prompt += f"- 최근 실거래 정보: {len(db_data['recent_transactions'])}개\n"
            
            if 'price_analysis' in db_data:
                enhanced_prompt += "- 가격 분석 정보: 사용 가능\n"
            
            if 'loan_info' in db_data:
                enhanced_prompt += "- 대출 정보: 사용 가능\n"
            
            enhanced_prompt += "\n**중요**: 위의 실제 데이터를 바탕으로 구체적이고 정확한 답변을 제공하세요.\n"
        else:
            enhanced_prompt += "\n**참고**: 현재 데이터베이스에서 관련 정보를 찾을 수 없습니다. 일반적인 부동산 지식으로 답변하세요.\n"
        
        return enhanced_prompt
    
    def _extract_locations(self, message: str) -> List[str]:
        """메시지에서 지역 정보 추출"""
        location_patterns = [
            r'([가-힣]+시|[가-힣]+구|[가-힣]+동|[가-힣]+읍|[가-힣]+면)',
            r'([가-힣]+아파트|[가-힣]+단지)'
        ]
        
        locations = []
        for pattern in location_patterns:
            matches = re.findall(pattern, message)
            if matches:
                locations.extend(matches)
        
        return list(set(locations))  # 중복 제거
    
    def get_conversation_history(self, user_id: str = None, limit: int = 20) -> List[Dict[str, Any]]:
        """대화 기록 조회"""
        if user_id:
            user_messages = [msg for msg in self.conversation_history if msg.get("user_id") == user_id]
        else:
            user_messages = self.conversation_history
        
        return user_messages[-limit:]
    
    def clear_conversation_history(self, user_id: str = None):
        """대화 기록 삭제"""
        if user_id:
            self.conversation_history = [msg for msg in self.conversation_history if msg.get("user_id") != user_id]
        else:
            self.conversation_history = []
    
    def get_chatbot_stats(self) -> Dict[str, Any]:
        """챗봇 통계 정보"""
        total_messages = len(self.conversation_history)
        user_messages = len([msg for msg in self.conversation_history if msg["role"] == "user"])
        bot_messages = len([msg for msg in self.conversation_history if msg["role"] == "assistant"])
        
        return {
            "total_messages": total_messages,
            "user_messages": user_messages,
            "bot_messages": bot_messages,
            "active_conversations": total_messages // 2,
            "timestamp": datetime.now().isoformat()
        }

# 전역 챗봇 인스턴스
integrated_chatbot = None

def get_chatbot_instance(openai_api_key: str = None, backend_url: str = "http://localhost:8080") -> IntegratedChatbot:
    """챗봇 인스턴스 반환 (싱글톤 패턴)"""
    global integrated_chatbot
    
    if integrated_chatbot is None:
        if not openai_api_key:
            raise ValueError("OpenAI API 키가 필요합니다.")
        integrated_chatbot = IntegratedChatbot(openai_api_key, backend_url)
    
    return integrated_chatbot 