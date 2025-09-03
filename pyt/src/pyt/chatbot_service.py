import openai
import os
from database_service import DatabaseService
import json
from config import OPENAI_API_KEY, CHATBOT_CONFIG

class ChatbotService:
    def __init__(self):
        # OpenAI API 키 설정
        self.api_key = OPENAI_API_KEY
        openai.api_key = self.api_key
        
        # 데이터베이스 서비스 초기화
        self.db_service = DatabaseService()
        
        # 시스템 프롬프트 설정
        self.system_prompt = """
당신은 부동산 정보를 제공하는 도움이 되는 AI 어시스턴트입니다.
사용자의 질문에 대해 데이터베이스의 실제 정보를 바탕으로 정확하고 유용한 답변을 제공해야 합니다.

다음 규칙을 따라주세요:
1. 항상 정확하고 사실에 기반한 정보만 제공하세요
2. 데이터베이스에 있는 정보를 우선적으로 사용하세요
3. 사용자가 모르는 정보에 대해서는 "해당 정보를 찾을 수 없습니다"라고 답변하세요
4. 답변은 친근하고 이해하기 쉽게 작성하세요
5. 한국어로 답변하세요

데이터베이스 스키마 정보:
{db_schema}
"""

    def get_response(self, user_message):
        """사용자 메시지에 대한 챗봇 응답 생성"""
        try:
            # 데이터베이스 스키마 정보 가져오기
            db_schema = self.db_service.get_database_schema()
            
            # 시스템 프롬프트에 스키마 정보 추가
            system_prompt = self.system_prompt.format(db_schema=db_schema)
            
            # 사용자 메시지 분석하여 데이터베이스 쿼리 필요 여부 판단
            if self._needs_database_query(user_message):
                # 데이터베이스에서 관련 정보 조회
                db_info = self._get_relevant_database_info(user_message)
                user_message_with_context = f"{user_message}\n\n데이터베이스 정보: {db_info}"
            else:
                user_message_with_context = user_message
            
            # OpenAI API 호출
            response = openai.ChatCompletion.create(
                model=CHATBOT_CONFIG['model'],
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message_with_context}
                ],
                max_tokens=CHATBOT_CONFIG['max_tokens'],
                temperature=CHATBOT_CONFIG['temperature']
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"챗봇 응답 생성 중 오류: {str(e)}")
            return "죄송합니다. 응답을 생성하는 중 오류가 발생했습니다."

    def _needs_database_query(self, message):
        """메시지가 데이터베이스 쿼리가 필요한지 판단"""
        db_keywords = [
            '매물', '부동산', '아파트', '오피스텔', '빌라', '단독주택',
            '매매', '전세', '월세', '가격', '면적', '위치', '주소',
            '방 개수', '층수', '건물', '시설', '교통', '학교'
        ]
        
        return any(keyword in message for keyword in db_keywords)

    def _get_relevant_database_info(self, message):
        """메시지와 관련된 데이터베이스 정보 조회"""
        try:
            # 간단한 키워드 기반 쿼리
            if '매물' in message or '부동산' in message:
                return self.db_service.get_property_summary()
            elif '가격' in message or '매매' in message:
                return self.db_service.get_price_info()
            elif '위치' in message or '주소' in message:
                return self.db_service.get_location_info()
            else:
                return self.db_service.get_general_info()
        except Exception as e:
            print(f"데이터베이스 정보 조회 중 오류: {str(e)}")
            return "데이터베이스 정보를 가져올 수 없습니다."

    def get_database_schema_info(self):
        """데이터베이스 스키마 정보 반환"""
        try:
            return self.db_service.get_database_schema()
        except Exception as e:
            print(f"스키마 정보 조회 중 오류: {str(e)}")
            return "스키마 정보를 가져올 수 없습니다." 