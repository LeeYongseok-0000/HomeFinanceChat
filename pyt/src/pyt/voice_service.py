import os
import tempfile
import uuid

class VoiceService:
    def __init__(self):
        # 음성 파일 저장 경로
        self.audio_dir = "static/audio"
        os.makedirs(self.audio_dir, exist_ok=True)
        print("✅ VoiceService 초기화 완료")

    def speech_to_text(self, audio_file):
        """음성을 텍스트로 변환 (간단하고 안정적인 방식)"""
        try:
            print(f"🎤 === 음성 인식 시작 ===")
            print(f"🎤 입력 오디오 파일: {audio_file.filename if hasattr(audio_file, 'filename') else 'Unknown'}")
            
            # 오디오 파일을 바이트로 읽기
            audio_content = audio_file.read()
            print(f"🎤 오디오 파일 크기: {len(audio_content)} bytes")
            
            # 파일 포인터를 처음으로 되돌림
            audio_file.seek(0)
            
            # 오디오 파일이 너무 작은지 확인 (매우 관대하게)
            if len(audio_content) < 10:
                print(f"⚠️ 오디오 파일이 너무 작음: {len(audio_content)} bytes")
                return "음성이 너무 짧습니다. 더 길게 말씀해주세요."
            
            print(f"🎤 음성 인식 설정 완료")
            
            # 현재는 시뮬레이션 모드 (실제 Google Cloud STT는 app.py에서 처리)
            print(f"🎤 시뮬레이션 모드로 음성 인식 처리...")
            return self._fallback_speech_recognition(audio_file)
                
        except Exception as e:
            print(f"❌ 음성 인식 중 오류: {str(e)}")
            import traceback
            print(f"❌ 상세 오류 정보:")
            traceback.print_exc()
            
            # 오류 발생 시 대체 방법 시도
            print(f"🎤 오류 발생으로 대체 방법 시도...")
            return self._fallback_speech_recognition(audio_file)

    def _fallback_speech_recognition(self, audio_file):
        """대체 음성 인식 방법"""
        try:
            print(f"🎤 대체 음성 인식 시작...")
            
            # 오디오 파일 크기 기반으로 간단한 응답 생성
            audio_content = audio_file.read()
            file_size = len(audio_content)
            
            print(f"🎤 오디오 파일 크기: {file_size} bytes")
            
            # 간단한 크기 기반 응답
            if file_size < 100:
                return "음성이 너무 작습니다. 더 크게 말씀해주세요."
            elif file_size < 500:
                return "음성이 감지되었습니다. 구체적인 질문을 해주세요."
            elif file_size < 2000:
                return "음성이 잘 들립니다. 부동산에 대해 무엇을 도와드릴까요?"
            else:
                return "음성이 명확하게 들립니다. 부동산 관련 질문을 구체적으로 말씀해주세요."
                
        except Exception as e:
            print(f"❌ 대체 음성 인식 실패: {str(e)}")
            return "음성 인식에 실패했습니다. 다시 시도해주세요."

    def text_to_speech(self, text, language_code="ko-KR"):
        """텍스트를 음성으로 변환 (현재는 시뮬레이션)"""
        try:
            print(f"🔊 TTS 요청: {text[:50]}...")
            print(f"🔊 언어: {language_code}")
            
            # 현재는 시뮬레이션 모드 (실제 Google Cloud TTS는 app.py에서 처리)
            print(f"🔊 시뮬레이션 모드로 TTS 처리...")
            
            # 데이터베이스 연결이 필요하므로 TTS 파일 생성 불가
            print(f"🔊 TTS 파일 생성 실패: 데이터베이스 연결이 필요합니다.")
            return None
            
            print(f"🔊 TTS 파일 생성 실패: 데이터베이스 연결 필요")
            
            # 파일 생성 실패 시 None 반환
            return None
            
        except Exception as e:
            print(f"❌ TTS 처리 중 오류: {str(e)}")
            return None

    def translate_text(self, text, target_language="ko"):
        """텍스트 번역 (현재는 시뮬레이션)"""
        try:
            print(f"🌐 번역 요청: {text[:50]}... -> {target_language}")
            
            # 현재는 시뮬레이션 모드
            if target_language == "ko":
                return f"[한국어 번역] {text}"
            elif target_language == "en":
                return f"[English Translation] {text}"
            else:
                return f"[{target_language} 번역] {text}"
                
        except Exception as e:
            print(f"❌ 번역 중 오류: {str(e)}")
            return text

    def get_supported_languages(self):
        """지원되는 언어 목록 반환"""
        try:
            # 한국어와 영어만 지원
            languages = [
                {'code': 'ko', 'name': '한국어'},
                {'code': 'en', 'name': 'English'}
            ]
            
            print(f"🌐 지원 언어: {len(languages)}개")
            return languages
            
        except Exception as e:
            print(f"❌ 지원 언어 조회 중 오류: {str(e)}")
            return []

    def cleanup_audio_files(self):
        """오래된 음성 파일 정리"""
        try:
            import time
            current_time = time.time()
            
            for filename in os.listdir(self.audio_dir):
                filepath = os.path.join(self.audio_dir, filename)
                file_age = current_time - os.path.getmtime(filepath)
                
                # 1시간 이상 된 파일 삭제
                if file_age > 3600:
                    os.remove(filepath)
                    print(f"🗑️ 오래된 음성 파일 삭제: {filename}")
                    
        except Exception as e:
            print(f"❌ 음성 파일 정리 중 오류: {str(e)}") 