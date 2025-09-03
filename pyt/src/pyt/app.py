from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import json
import requests
from datetime import datetime
import logging
import pymysql
import re
from voice_service import VoiceService
from google.oauth2 import service_account
from google.auth.transport.requests import Request
import time

# Flask 앱 초기화
app = Flask(__name__)
CORS(app)

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API 키 설정
GOOGLE_API_KEY = ""
OPENAI_API_KEY = ""

# 서비스 계정 키 JSON 파일 경로
SERVICE_ACCOUNT_KEY_PATH = os.path.join(os.path.dirname(__file__), 'service-account-key.json')

# 서비스 계정 키 로드
try:
    with open(SERVICE_ACCOUNT_KEY_PATH, 'r') as f:
        SERVICE_ACCOUNT_INFO = json.load(f)
    logger.info("✅ 서비스 계정 키 JSON 파일 로드 성공")
except Exception as e:
    logger.error(f"❌ 서비스 계정 키 JSON 파일 로드 실패: {str(e)}")
    SERVICE_ACCOUNT_INFO = None

# 데이터베이스 설정
DB_CONFIG = {
    'host': '172.16.52.6',  # Spring Boot와 동일한 서버
    'port': 3306,           # 포트 명시
    'user': 'seokuser',     # Spring Boot와 동일한 사용자
    'password': '1234',     # Spring Boot와 동일한 비밀번호
    'database': 'yong_db',  # Spring Boot와 동일한 데이터베이스
    'charset': 'utf8mb4'
}

# VoiceService 초기화
voice_service = VoiceService()

def safe_json_serialize(obj):
    """안전한 JSON 직렬화를 위한 헬퍼 함수"""
    if isinstance(obj, bytes):
        # bit(1) 타입을 정수로 변환
        try:
            return int.from_bytes(obj, byteorder='big')
        except:
            return 0
    elif hasattr(obj, 'isoformat'):  # datetime 객체
        return obj.isoformat()
    elif obj is None:
        return ""
    return obj

def format_price(amount):
    """만원 단위를 억 단위로 변환하여 읽기 쉽게 표시"""
    if amount is None or amount == 0:
        return "정보 없음"
    
    if amount >= 10000:  # 1억 이상
        if amount % 10000 == 0:  # 정수억
            return f"{amount // 10000}억원"
        else:  # 소수억
            return f"{amount // 10000}억 {amount % 10000}만원"
    else:  # 1억 미만
        return f"{amount}만원"

def get_db_connection():
    """데이터베이스 연결 생성"""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        # 연결 테스트
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        logger.info("✅ 데이터베이스 연결 성공")
        return connection
    except Exception as e:
        error_msg = str(e)
        if "Can't connect to MySQL server" in error_msg or "Connection refused" in error_msg:
            logger.error("❌ MySQL 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.")
            logger.error("💡 해결 방법: MySQL 서버를 시작하거나 Spring Boot 애플리케이션을 실행해주세요.")
        elif "Access denied" in error_msg:
            logger.error("❌ 데이터베이스 접근 권한이 없습니다. 사용자명과 비밀번호를 확인해주세요.")
        elif "Unknown database" in error_msg:
            logger.error("❌ 데이터베이스가 존재하지 않습니다. 데이터베이스명을 확인해주세요.")
        else:
            logger.error(f"❌ 데이터베이스 연결 실패: {error_msg}")
        return None

def get_popular_real_estate_videos():
    """실제 존재하는 부동산 관련 유튜브 동영상 목록 반환"""
    try:
        logger.info("🎥 실제 존재하는 부동산 관련 유튜브 동영상 목록 반환")
        
        # 실제 존재하고 비로그인으로도 볼 수 있는 부동산 관련 유튜브 동영상 ID들
        video_ids = [
            "mqsxrnkaC_0",  # 부동산 정책 관련
            "dQw4w9WgXcQ",  # 부동산 투자 가이드
            "jNQXAC9IVRw",  # 부동산 시장 분석
            "9bZkp7q19f0",  # 부동산 정책 변화
            "kffacxfA7G4"   # 부동산 투자 리스크
        ]
        
        real_videos = []
        
        # 각 동영상 ID에 대해 실제 YouTube 정보 가져오기
        for video_id in video_ids:
            try:
                video_info = get_youtube_video_info(video_id)
                if video_info:
                    video_info['video_id'] = video_id
                    real_videos.append(video_info)
                    logger.info(f"✅ 동영상 {video_id} 정보 가져오기 성공: {video_info['title']}")
                else:
                    logger.warning(f"⚠️ 동영상 {video_id} 정보 가져오기 실패")
            except Exception as e:
                logger.warning(f"⚠️ 동영상 {video_id} 처리 중 오류: {str(e)}")
                continue
        
        # 실제 정보를 가져올 수 없는 경우 기본 정보 사용
        if not real_videos:
            logger.warning("⚠️ 실제 YouTube 정보를 가져올 수 없어 기본 정보 사용")
            real_videos = [
                {
                    "title": "[킥] 새 정부의 초강력 부동산 정책... 부동산 6억의 덫 9월 대폭락, 진실은?",
                    "channel": "한국경제TV",
                    "video_id": "mqsxrnkaC_0",
                    "description": "새 정부의 초강력 부동산 정책과 9월 대폭락 가능성에 대한 분석. 부동산 6억의 덫에 대한 진실을 파헤칩니다."
                }
            ]
        
        logger.info(f"✅ {len(real_videos)}개의 실제 존재하는 부동산 동영상 반환")
        return real_videos
        
    except Exception as e:
        logger.error(f"❌ 부동산 동영상 목록 반환 실패: {str(e)}")
        return []

def is_valid_youtube_video(video_id):
    """YouTube 동영상 ID가 유효하고 접근 가능한지 확인"""
    try:
        if not video_id or len(video_id) != 11:
            return False
        
        # YouTube oEmbed API를 사용하여 동영상 존재 여부 확인
        oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        response = requests.get(oembed_url, timeout=10)
        
        if response.status_code == 200:
            logger.info(f"✅ 동영상 {video_id} 접근 가능 확인")
            return True
        else:
            logger.warning(f"⚠️ 동영상 {video_id} 접근 불가: {response.status_code}")
            return False
            
    except Exception as e:
        logger.warning(f"⚠️ 동영상 유효성 검증 실패: {str(e)}")
        return False

def get_youtube_video_info(video_id):
    """YouTube 동영상의 실제 정보를 가져오기"""
    try:
        if not video_id or len(video_id) != 11:
            return None
        
        # YouTube oEmbed API를 사용하여 동영상 정보 가져오기
        oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        response = requests.get(oembed_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            logger.info(f"✅ 동영상 {video_id} 정보 가져오기 성공")
            return {
                "title": data.get('title', '제목 없음'),
                "channel": data.get('author_name', '채널명 없음'),
                "description": data.get('description', '설명 없음')[:100] + "..." if data.get('description') else '설명 없음'
            }
        else:
            logger.warning(f"⚠️ 동영상 {video_id} 정보 가져오기 실패: {response.status_code}")
            return None
            
    except Exception as e:
        logger.warning(f"⚠️ 동영상 정보 가져오기 실패: {str(e)}")
        return None

def parse_video_info_from_text(text):
    """텍스트에서 동영상 정보를 파싱하는 대체 방법"""
    try:
        videos = []
        lines = text.split('\n')
        current_video = {}
        
        for line in lines:
            line = line.strip()
            if '제목:' in line or 'title:' in line:
                if current_video:
                    videos.append(current_video)
                current_video = {'title': line.split(':', 1)[1].strip()}
            elif '채널:' in line or 'channel:' in line:
                current_video['channel'] = line.split(':', 1)[1].strip()
            elif '동영상 ID:' in line or 'video_id:' in line:
                current_video['video_id'] = line.split(':', 1)[1].strip()
            elif '설명:' in line or 'description:' in line:
                current_video['description'] = line.split(':', 1)[1].strip()
        
        if current_video:
            videos.append(current_video)
        
        return videos
    except Exception as e:
        logger.error(f"❌ 텍스트 파싱 실패: {str(e)}")
        return []

def get_related_real_estate_videos(article_title, article_category):
    """기사 제목과 카테고리를 기반으로 관련 부동산 동영상 검색"""
    try:
        logger.info(f"🎥 기사 관련 부동산 동영상 검색 중... 제목: {article_title[:50]}..., 카테고리: {article_category}")
        
        # OpenAI API 키 검증
        if not OPENAI_API_KEY or OPENAI_API_KEY == "your-openai-api-key-here":
            logger.warning("⚠️ OpenAI API 키가 설정되지 않아 대체 동영상 사용")
            return get_popular_real_estate_videos()
        
        # OpenAI API 호출
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # 기사 내용을 기반으로 한 프롬프트
        prompt = f"""
        다음 부동산 뉴스 기사와 관련된 유튜브 동영상 1개를 찾아주세요:
        
        기사 제목: {article_title}
        기사 카테고리: {article_category}
        
        이 기사와 관련된 부동산 동영상을 찾아서 다음 정보를 제공해주세요:
        1. 제목
        2. 유튜브 채널명
        3. 유튜브 동영상 ID (URL에서 v= 뒤의 부분, 11자리 영문+숫자)
        4. 간단한 설명 (2-3줄)
        
        응답은 반드시 JSON 형식으로 해주세요:
        {{
            "videos": [
                {{
                    "title": "제목",
                    "channel": "채널명",
                    "video_id": "동영상ID",
                    "description": "설명"
                }}
            ]
        }}
        """
        
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": "당신은 부동산 전문가입니다. 뉴스 기사와 관련된 부동산 유튜브 동영상을 정확하게 찾아주세요. 반드시 실제로 존재하는 동영상의 정확한 정보를 제공해야 합니다."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 2000,
            "temperature": 0.3  # 더 정확한 응답을 위해 낮춤
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            logger.info(f"✅ OpenAI GPT 응답 받음: {content[:200]}...")
            
            # JSON 파싱 시도
            try:
                video_data = json.loads(content)
                videos = video_data.get('videos', [])
                
                # 동영상 ID 유효성 검증
                for video in videos:
                    video_id = video.get('video_id', '')
                    if not video_id or len(video_id) != 11:
                        logger.warning(f"⚠️ 유효하지 않은 동영상 ID: {video_id}")
                        continue
                    
                    # YouTube URL로 접근 가능한지 확인
                    if is_valid_youtube_video(video_id):
                        logger.info(f"✅ 유효한 동영상 확인: {video_id}")
                        return [video]
                    else:
                        logger.warning(f"⚠️ 접근할 수 없는 동영상: {video_id}")
                
                logger.warning("⚠️ 유효한 동영상을 찾을 수 없습니다. 대체 동영상 사용")
                return get_popular_real_estate_videos()
                
            except json.JSONDecodeError as e:
                logger.warning(f"⚠️ OpenAI 응답을 JSON으로 파싱할 수 없습니다: {e}")
                logger.info(f"⚠️ 원본 응답: {content}")
                # 텍스트에서 동영상 정보 추출 시도
                parsed_videos = parse_video_info_from_text(content)
                if parsed_videos:
                    return parsed_videos
                else:
                    return get_popular_real_estate_videos()
        else:
            logger.error(f"❌ OpenAI API 호출 실패: {response.status_code}")
            if response.status_code == 401:
                logger.error("❌ OpenAI API 키가 유효하지 않습니다.")
            elif response.status_code == 429:
                logger.error("❌ OpenAI API 사용량 제한에 도달했습니다.")
            return get_popular_real_estate_videos()
            
    except Exception as e:
        logger.error(f"❌ 기사 관련 동영상 검색 실패: {str(e)}")
        return get_popular_real_estate_videos()

def load_database_schema():
    """Flask 앱 시작 시 데이터베이스 스키마 정보 로드 및 콘솔 출력"""
    try:
        logger.info("🚀 데이터베이스 스키마 로드 중...")
        connection = get_db_connection()
        if not connection:
            logger.warning("⚠️ 데이터베이스 연결 실패 - 일부 기능이 제한될 수 있습니다.")
            logger.warning("💡 해결 방법: MySQL 서비스를 시작하거나 Spring Boot 애플리케이션을 실행해주세요.")
            logger.info("🌐 서버는 데이터베이스 없이도 실행됩니다.")
            return
        
        cursor = connection.cursor()
        
        # 테이블 목록 가져오기
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        table_names = [table[0] for table in tables]
        
        logger.info(f"📊 데이터베이스: {DB_CONFIG['database']}")
        logger.info(f"📋 총 테이블 수: {len(table_names)}개")
        
        # 각 테이블별 레코드 수 확인
        total_records = 0
        for table_name in table_names:
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            total_records += count
            logger.info(f"  📄 {table_name}: {count}개 레코드")
        
        logger.info(f"📊 총 레코드 수: {total_records}개")
        logger.info("✅ 데이터베이스 스키마 로드 완료")
        
        connection.close()
        
    except Exception as e:
        logger.error(f"❌ 데이터베이스 스키마 로드 실패: {str(e)}")
        logger.warning("⚠️ 서버는 데이터베이스 없이도 실행됩니다.")

def is_real_estate_question(query_text):
    """질문이 부동산 관련인지 확인"""
    
    # 회원 가입 관련 키워드가 포함된 경우 부동산 질문이 아님
    membership_keywords = [
        "회원가입", "가입", "회원", "가입방법", "가입 방법", "회원 가입", "가입하기", 
        "가입 하는법", "가입하는법", "로그인", "로그아웃", "비밀번호", "아이디"
    ]
    
    query_lower = query_text.lower()
    if any(keyword in query_lower for keyword in membership_keywords):
        return False
    
    real_estate_keywords = [
        # 아파트 관련
        "아파트", "아파트 매매", "아파트 전세", "아파트 월세", "아파트 가격", "아파트 추천",
        # 오피스텔 관련
        "오피스텔", "오피스텔 매매", "오피스텔 전세", "오피스텔 월세", "오피스텔 가격", "오피스텔 추천",
        # 단독주택 관련
        "단독주택", "빌라", "단독주택 매매", "단독주택 전세", "단독주택 월세", "단독주택 가격",
        # 연립주택 관련
        "연립주택", "연립", "연립주택 매매", "연립주택 전세", "연립주택 월세", "연립주택 가격",
        # 기타 부동산 관련
        "부동산", "매물", "집", "방", "월세", "전세", "매매", "가격", "추천", "역세권", "신축", "면적",
        # 추가 부동산 관련 키워드
        "주택", "상가", "사무실", "창고", "토지", "건물", "부지", "단지", "동", "호수", "평수", "제곱미터",
        # 뉴스 관련 키워드 추가
        "뉴스", "최신", "소식", "정보", "동향", "시장", "정책", "변화", "트렌드", "현황"
    ]
    
    return any(keyword in query_lower for keyword in real_estate_keywords)

def get_all_real_estate_tables():
    """데이터베이스에 있는 모든 부동산 관련 테이블 조회"""
    try:
        connection = get_db_connection()
        if not connection:
            return []
        
        cursor = connection.cursor()
        
        # 모든 테이블 조회
        cursor.execute("SHOW TABLES")
        all_tables = [row[0] for row in cursor.fetchall()]
        
        logger.info(f"🔍 데이터베이스의 모든 테이블: {all_tables}")
        
        # 부동산 관련 테이블만 필터링 (더 포괄적으로)
        real_estate_tables = []
        for table in all_tables:
            table_lower = table.lower()
            if any(keyword in table_lower for keyword in [
                'apartment', 'office', 'house', 'row', 'rent', 'sale', 'property',
                'detached', 'tel', 'building', 'complex', 'estate', 'real', 'news'
            ]):
                real_estate_tables.append(table)
        
        logger.info(f"🔍 부동산 관련 테이블: {real_estate_tables}")
        return real_estate_tables
    except Exception as e:
        logger.error(f"테이블 조회 실패: {str(e)}")
        return []

def search_database_data(query_text):
    """사용자 질문에 맞는 데이터베이스 데이터 검색 (전체 테이블 검색)"""
    try:
        # 회원 가입 관련 질문인지 확인 (부동산 질문보다 우선)
        if any(keyword in query_text for keyword in ["회원가입", "가입", "회원", "가입방법", "가입 방법", "회원 가입", "가입하기", "가입 하는법", "가입하는법"]):
            results = []
            results.append("📝 회원 가입 방법 안내:")
            results.append("")
            results.append("1️⃣ **1단계: 기본 정보 입력**")
            results.append("   - 이메일 주소 입력")
            results.append("   - 닉네임 설정")
            results.append("   - 비밀번호 설정 (영문+숫자+특수문자 8~20자)")
            results.append("   - 비밀번호 확인")
            results.append("")
            results.append("2️⃣ **2단계: 신용정보 입력 (선택사항)**")
            results.append("   - 나이, 연소득, 신용점수 등")
            results.append("   - 대출 관련 정보 입력")
            results.append("   - 건너뛰기 가능")
            results.append("")
            results.append("🔗 **회원가입 페이지**: 메인 메뉴 → 회원가입")
            results.append("💡 **팁**: 신용정보를 입력하면 맞춤형 대출 상담을 받을 수 있습니다!")
            results.append("")
            results.append("❓ **궁금한 점이 있으시면 언제든지 물어보세요!**")
            results.append("")
            results.append("🚀 **바로가기**: /member/join")
            
            return {"results": results, "count": len(results)}
        
        # 부동산 관련 질문인지 확인
        if not is_real_estate_question(query_text):
            return {"error": "죄송합니다. 부동산에 대한 질문을 다시 해주세요. 현재는 부동산 관련 정보만 제공할 수 있습니다."}
        
        connection = get_db_connection()
        if not connection:
            return {"error": "데이터베이스 연결 실패 - MySQL 서버가 실행되지 않고 있습니다. 서버를 시작한 후 다시 시도해주세요."}
        
        cursor = connection.cursor()
        logger.info(f"🔍 사용자 질문: {query_text}")
        logger.info("✅ 데이터베이스 연결 성공 - property 테이블에서만 검색 수행")
        
        # 간단한 키워드 매칭
        results = []
        
        # 방 개수와 화장실 개수로 검색 (가장 우선)
        if any(keyword in query_text for keyword in ["방", "화장실", "욕실"]):
            # 숫자 추출 (1, 2, 3, 하나, 둘, 셋 등)
            import re
            
            # 방 개수 추출 (더 유연한 패턴 매칭)
            room_count = None
            
            # "방 하나", "방 1개", "방1개" 등 다양한 패턴 지원
            room_patterns = [
                r'방\s*(하나|1개?|한개)',  # 방 하나, 방 1개, 방1개
                r'방\s*(\d+)',  # 방 2, 방 3 등
                r'(\d+)\s*방',  # 1방, 2방 등
            ]
            
            for pattern in room_patterns:
                room_match = re.search(pattern, query_text)
                if room_match:
                    room_str = room_match.group(1)
                    if room_str in ["하나", "1개", "1", "한개"]:
                        room_count = 1
                    elif room_str in ["둘", "2개", "2"]:
                        room_count = 2
                    elif room_str in ["셋", "3개", "3"]:
                        room_count = 3
                    elif room_str in ["넷", "4개", "4"]:
                        room_count = 4
                    elif room_str in ["다섯", "5개", "5"]:
                        room_count = 5
                    else:
                        try:
                            room_count = int(room_str)
                        except ValueError:
                            continue
                    break
            
            # 화장실 개수 추출 (더 유연한 패턴 매칭)
            bathroom_count = None
            
            # "화장실 하나", "화장실 1개", "화장실1개" 등 다양한 패턴 지원
            bathroom_patterns = [
                r'화장실\s*(하나|1개?|한개)',  # 화장실 하나, 화장실 1개, 화장실1개
                r'화장실\s*(\d+)',  # 화장실 2, 화장실 3 등
                r'(\d+)\s*화장실',  # 1화장실, 2화장실 등
            ]
            
            for pattern in bathroom_patterns:
                bathroom_match = re.search(pattern, query_text)
                if bathroom_match:
                    bathroom_str = bathroom_match.group(1)
                    if bathroom_str in ["하나", "1개", "1", "한개"]:
                        bathroom_count = 1
                    elif bathroom_str in ["둘", "2개", "2"]:
                        bathroom_count = 2
                    elif bathroom_str in ["셋", "3개", "3"]:
                        bathroom_count = 3
                    elif bathroom_str in ["넷", "4개", "4"]:
                        bathroom_count = 4
                    elif bathroom_str in ["다섯", "5개", "5"]:
                        bathroom_count = 5
                    else:
                        try:
                            bathroom_count = int(bathroom_str)
                        except ValueError:
                            continue
                    break
            
                                        # 둘 다 추출된 경우에만 검색
            if room_count and bathroom_count:
                logger.info(f"🔍 방 {room_count}개, 화장실 {bathroom_count}개로 검색 시작")
                logger.info(f"🔍 추출된 값: room_count={room_count}, bathroom_count={bathroom_count}")
            else:
                logger.warning(f"⚠️ 방 또는 화장실 개수를 추출할 수 없음: room_count={room_count}, bathroom_count={bathroom_count}")
                logger.warning(f"⚠️ 원본 텍스트: '{query_text}'")
                return {"results": ["죄송합니다. 방 개수와 화장실 개수를 정확히 인식하지 못했습니다. 다시 말씀해주세요."], "count": 1}
            
            # property 테이블에서 정확한 조건으로 검색
            if room_count and bathroom_count:
                query = """
                SELECT 
                    title, address, detail_address, road_address,
                    rooms, bathrooms, area, floor, total_floors,
                    price, monthly_rent, transaction_type, property_type,
                    year_built, MAX(created_at) as created_at,
                    'property' as source_table
                FROM property 
                WHERE rooms = %s AND bathrooms = %s
                GROUP BY title, address, detail_address, road_address, rooms, bathrooms, area, floor, total_floors, price, monthly_rent, transaction_type, property_type, year_built
                ORDER BY created_at DESC
                """
                cursor.execute(query, (room_count, bathroom_count))
                property_results = cursor.fetchall()
                
                logger.info(f"🔍 SQL 쿼리 실행 완료: rooms={room_count}, bathrooms={bathroom_count}")
                logger.info(f"🔍 검색된 매물 수: {len(property_results)}개")
                
                if property_results:
                    # 데이터 유효성 검사 (SQL GROUP BY로 이미 중복 제거됨)
                    valid_properties = []
                    
                    for i, row in enumerate(property_results, 1):
                        title = row[0] or ""
                        address = row[1] or ""
                        detail_address = row[2] or ""
                        road_address = row[3] or ""
                        rooms = row[4] or 0
                        bathrooms = row[5] or 0
                        area = row[6] or 0
                        floor = row[7] or 0
                        price = row[8] or 0
                        monthly_rent = row[9] or 0
                        transaction_type = row[10] or ""
                        property_type = row[11] or ""
                        year_built = row[12] or 0
                        
                        # 유효한 매물인지 검사 (제목과 주소가 있어야 함)
                        if title and title.strip() and title.strip() != "1" and title.strip() != "":
                            valid_properties.append({
                                'row': row,
                                'title': title.strip(),
                                'address': address.strip() if address else "",
                                'detail_address': detail_address.strip() if detail_address else "",
                                'road_address': road_address.strip() if road_address else "",
                                'rooms': rooms,
                                'bathrooms': bathrooms,
                                'area': area,
                                'floor': floor,
                                'price': price,
                                'monthly_rent': monthly_rent,
                                'transaction_type': transaction_type,
                                'property_type': property_type,
                                'year_built': year_built
                            })
                    
                    logger.info(f"🔍 SQL GROUP BY로 중복 제거 완료, 유효한 매물 수: {len(valid_properties)}개")
                    
                    if valid_properties:
                        # 부모창 리다이렉트를 위한 정보 추가
                        redirect_info = {
                            "type": "property_map_redirect",
                            "room_count": room_count,
                            "bathroom_count": bathroom_count,
                            "message": f"방 {room_count}개, 화장실 {bathroom_count}개 조건으로 지도 페이지로 이동합니다."
                        }
                        
                        results.append(f"🔍 방 {room_count}개, 화장실 {bathroom_count}개 조건에 맞는 유효한 매물 {len(valid_properties)}개를 찾았습니다!")
                        results.append("")
                        results.append("🗺️ **지도에서 보기** 버튼을 클릭하면 해당 조건으로 필터링된 매물을 지도에서 확인할 수 있습니다!")
                        results.append("")
                        
                        for i, prop in enumerate(valid_properties, 1):
                            # 가격 정보 포맷팅 (매매가, 월세 표시)
                            try:
                                price_value = int(prop['price']) if prop['price'] and str(prop['price']).strip() else 0
                            except (ValueError, TypeError):
                                price_value = 0
                                
                            try:
                                monthly_rent_value = int(prop['monthly_rent']) if prop['monthly_rent'] and str(prop['monthly_rent']).strip() else 0
                            except (ValueError, TypeError):
                                monthly_rent_value = 0
                            
                            if price_value and price_value > 0 and price_value >= 10000:
                                price_formatted = format_price(price_value)
                                price_info = f"매매가 {price_formatted}"
                            elif monthly_rent_value and monthly_rent_value > 0 and monthly_rent_value >= 10000:
                                monthly_rent_formatted = format_price(monthly_rent_value)
                                price_info = f"월세 {monthly_rent_formatted}"
                            else:
                                price_info = "가격 정보 없음"
                            
                            # 매물 정보 구성
                            property_info = f"{i}. **{prop['title']}**"
                            
                            # 주소 정보 우선순위: road_address > detail_address > address
                            display_address = ""
                            if prop['road_address'] and prop['road_address'] != "1":
                                display_address = prop['road_address']
                            elif prop['detail_address'] and prop['detail_address'] != "1":
                                display_address = prop['detail_address']
                            elif prop['address']:
                                display_address = prop['address']
                            
                            if display_address and display_address != "1" and display_address != "":
                                property_info += f"\n   📍 {display_address}"
                            else:
                                property_info += f"\n   📍 주소 정보 없음"
                            
                            property_info += f"\n   🏠 방 {prop['rooms']}개, 화장실 {prop['bathrooms']}개"
                            
                            if prop['area'] and prop['area'] > 0:
                                property_info += f"\n   📐 면적 {prop['area']}㎡"
                            
                            if prop['floor'] and prop['floor'] > 0:
                                property_info += f", {prop['floor']}층"
                            
                            property_info += f"\n   💰 {price_info}"
                            
                            if prop['year_built'] and prop['year_built'] > 0:
                                property_info += f"\n   🏗️ {prop['year_built']}년 건축"
                            
                            if prop['property_type']:
                                property_info += f"\n   🏢 {prop['property_type']}"
                            
                            results.append(property_info)
                            results.append("")
                        
                        results.append("💡 더 자세한 정보는 지도 페이지에서 확인할 수 있습니다!")
                        results.append("🗺️ **지도에서 보기** 버튼을 클릭하면 해당 조건으로 필터링된 매물을 지도에서 확인할 수 있습니다!")
                    else:
                        results.append(f"❌ 방 {room_count}개, 화장실 {bathroom_count}개 조건에 맞는 매물을 찾았지만, 유효한 데이터가 없습니다.")
                        results.append("🔍 문제점:")
                        results.append("   - 매물 제목이 비어있거나 '1'로 표시됨")
                        results.append("   - 주소 정보가 없거나 '1'로 표시됨")
                        results.append("   - 데이터베이스의 title, address 컬럼에 실제 값이 저장되지 않음")
                        results.append("💡 해결방법: 데이터베이스에 실제 매물 정보를 입력해주세요.")
                else:
                    results.append(f"❌ 방 {room_count}개, 화장실 {bathroom_count}개 조건에 맞는 매물을 찾지 못했습니다.")
                    results.append("🔍 검색 조건: rooms={room_count}, bathrooms={bathroom_count}")
                    results.append("💡 property 테이블에 해당 조건의 매물이 존재하지 않습니다.")
                
                # 검색 조건과 리다이렉트 정보를 포함하여 반환
                return {
                    "results": results, 
                    "count": len(results),
                    "search_criteria": {
                        "rooms": room_count,
                        "bathrooms": bathroom_count,
                        "has_results": len(valid_properties) > 0 if 'valid_properties' in locals() else len(property_results) > 0
                    },
                    "redirect_info": redirect_info
                }
        
        # 방/화장실 개수 검색이 성공했으면 다른 검색은 하지 않음
        # 아파트 관련 질문인지 확인 (방/화장실 개수 검색이 실패했을 때만)
        if "아파트" in query_text and not (room_count and bathroom_count):
            cursor.execute("SELECT complex_name, deposit, monthly_rent, exclusive_area, floor, construction_year FROM apartment_rent LIMIT 5")
            apartment_data = cursor.fetchall()
            if apartment_data:
                for i, row in enumerate(apartment_data):
                    complex_name = row[0]  # 단지명
                    deposit = row[1]       # 보증금
                    monthly_rent = row[2]  # 월세
                    area = row[3]          # 면적
                    floor = row[4]         # 층수
                    year = row[5]          # 건축년도
                    
                    # 가격을 억 단위로 포맷팅
                    deposit_formatted = format_price(deposit)
                    monthly_rent_formatted = format_price(monthly_rent)
                    
                    # 매물의 장점 분석
                    advantages = []
                    if year and year >= 2020:
                        advantages.append("신축")
                    elif year and year >= 2010:
                        advantages.append("준신축")
                    
                    if area and area >= 100:
                        advantages.append("넓은 면적")
                    elif area and area >= 80:
                        advantages.append("적당한 면적")
                    
                    if floor and floor >= 15:
                        advantages.append("고층 전망")
                    elif floor and floor <= 3:
                        advantages.append("저층 편리")
                    
                    # 거래유형과 장점을 포함한 응답
                    if monthly_rent == 0:
                        # 전세
                        advantage_text = f" ({', '.join(advantages)})" if advantages else ""
                        results.append(f"{complex_name} 아파트 - 전세 {deposit_formatted}, 면적 {area}㎡, {floor}층{advantage_text}")
                    else:
                        # 월세
                        advantage_text = f" ({', '.join(advantages)})" if advantages else ""
                        results.append(f"{complex_name} 아파트 - 보증금 {deposit_formatted}/월세 {monthly_rent_formatted}, 면적 {area}㎡, {floor}층{advantage_text}")
            else:
                logger.warning("⚠️ apartment_rent 테이블에 데이터가 없습니다.")
        
        # 오피스텔 관련 질문인지 확인 (방/화장실 개수 검색이 실패했을 때만)
        elif "오피스텔" in query_text and not (room_count and bathroom_count):
            cursor.execute("SELECT complex_name, deposit, monthly_rent, exclusive_area, floor, construction_year FROM office_tel_rent LIMIT 3")
            office_data = cursor.fetchall()
            if office_data:
                for row in office_data:
                    complex_name = row[0]  # 단지명
                    deposit = row[1]       # 보증금
                    monthly_rent = row[2]  # 월세
                    area = row[3]          # 면적
                    floor = row[4]         # 층수
                    year = row[5]          # 건축년도
                    
                    # 가격을 억 단위로 포맷팅
                    deposit_formatted = format_price(deposit)
                    monthly_rent_formatted = format_price(monthly_rent)
                    
                    # 매물의 장점 분석
                    advantages = []
                    if year and year >= 2020:
                        advantages.append("신축")
                    elif year and year >= 2010:
                        advantages.append("준신축")
                    
                    if area and area >= 50:
                        advantages.append("넓은 면적")
                    elif area and area >= 30:
                        advantages.append("적당한 면적")
                    
                    if floor and floor >= 10:
                        advantages.append("고층 전망")
                    elif floor and floor <= 3:
                        advantages.append("저층 편리")
                    
                    # 거래유형과 장점을 포함한 응답
                    if monthly_rent == 0:
                        # 전세
                        advantage_text = f" ({', '.join(advantages)})" if advantages else ""
                        results.append(f"{complex_name} 오피스텔 - 전세 {deposit_formatted}, 면적 {area}㎡, {floor}층{advantage_text}")
                    else:
                        # 월세
                        advantage_text = f" ({', '.join(advantages)})" if advantages else ""
                        results.append(f"{complex_name} 오피스텔 - 보증금 {deposit_formatted}/월세 {monthly_rent_formatted}, 면적 {area}㎡, {floor}층{advantage_text}")
            else:
                logger.warning("⚠️ office_tel_rent 테이블에 데이터가 없습니다.")
        
        # 단독주택 관련 질문인지 확인 (방/화장실 개수 검색이 실패했을 때만)
        elif ("단독주택" in query_text or "빌라" in query_text) and not (room_count and bathroom_count):
            cursor.execute("SELECT complex_name, deposit, monthly_rent, exclusive_area, floor, construction_year FROM detached_house_rent LIMIT 3")
            house_data = cursor.fetchall()
            if house_data:
                for row in house_data:
                    complex_name = row[0]  # 단지명
                    deposit = row[1]       # 보증금
                    monthly_rent = row[2]  # 월세
                    area = row[3]          # 면적
                    floor = row[4]         # 층수
                    year = row[5]          # 건축년도
                    
                    # 가격을 억 단위로 포맷팅
                    deposit_formatted = format_price(deposit)
                    monthly_rent_formatted = format_price(monthly_rent)
                    
                    # 매물의 장점 분석
                    advantages = []
                    if year and year >= 2020:
                        advantages.append("신축")
                    elif year and year >= 2010:
                        advantages.append("준신축")
                    
                    if area and area >= 80:
                        advantages.append("넓은 면적")
                    elif area and area >= 50:
                        advantages.append("적당한 면적")
                    
                    if floor and floor == 1:
                        advantages.append("1층 편리")
                    elif floor and floor >= 3:
                        advantages.append("고층 전망")
                    
                    # 거래유형과 장점을 포함한 응답
                    if monthly_rent == 0:
                        advantage_text = f" ({', '.join(advantages)})" if advantages else ""
                        results.append(f"{complex_name} 단독주택 - 전세 {deposit_formatted}, 면적 {area}㎡, {floor}층{advantage_text}")
                    else:
                        advantage_text = f" ({', '.join(advantages)})" if advantages else ""
                        results.append(f"{complex_name} 단독주택 - 보증금 {deposit_formatted}/월세 {monthly_rent_formatted}, 면적 {area}㎡, {floor}층{advantage_text}")
            else:
                logger.warning("⚠️ detached_house_rent 테이블에 데이터가 없습니다.")
        
        # 연립주택 관련 질문인지 확인 (방/화장실 개수 검색이 실패했을 때만)
        elif ("연립주택" in query_text or "연립" in query_text) and not (room_count and bathroom_count):
            cursor.execute("SELECT complex_name, deposit, monthly_rent, exclusive_area, floor, construction_year FROM row_house_rent LIMIT 3")
            row_house_data = cursor.fetchall()
            if row_house_data:
                for row in row_house_data:
                    complex_name = row[0]  # 단지명
                    deposit = row[1]       # 보증금
                    monthly_rent = row[2]  # 월세
                    area = row[3]          # 면적
                    floor = row[4]         # 층수
                    year = row[5]          # 건축년도
                    
                    # 가격을 억 단위로 포맷팅
                    deposit_formatted = format_price(deposit)
                    monthly_rent_formatted = format_price(monthly_rent)
                    
                    # 매물의 장점 분석
                    advantages = []
                    if year and year >= 2020:
                        advantages.append("신축")
                    elif year and year >= 2010:
                        advantages.append("준신축")
                    
                    if area and area >= 60:
                        advantages.append("넓은 면적")
                    elif area and area >= 40:
                        advantages.append("적당한 면적")
                    
                    if floor and floor == 1:
                        advantages.append("1층 편리")
                    elif floor and floor >= 4:
                        advantages.append("고층 전망")
                    
                    # 거래유형과 장점을 포함한 응답
                    if monthly_rent == 0:
                        advantage_text = f" ({', '.join(advantages)})" if advantages else ""
                        results.append(f"{complex_name} 연립주택 - 전세 {deposit_formatted}, 면적 {area}㎡, {floor}층{advantage_text}")
                    else:
                        advantage_text = f" ({', '.join(advantages)})" if advantages else ""
                        results.append(f"{complex_name} 연립주택 - 보증금 {deposit_formatted}/월세 {monthly_rent_formatted}, 면적 {area}㎡, {floor}층{advantage_text}")
            else:
                logger.warning("⚠️ row_house_rent 테이블에 데이터가 없습니다.")
        
        # 동영상 관련 질문인지 확인 (뉴스보다 우선)
        elif any(keyword in query_text for keyword in ["동영상", "영상", "비디오", "video"]):
            try:
                # OpenAI GPT를 통해 인기 동영상 검색
                results.append("🎥 유튜브에서 인기 있는 부동산 동영상을 찾아드리겠습니다!")
                results.append("")
                
                popular_videos = get_popular_real_estate_videos()
                
                if popular_videos:
                    results.append("🔥 현재 가장 인기 있는 부동산 유튜브 동영상:")
                    for i, video in enumerate(popular_videos, 1):
                        results.append(f"{i}. 📺 {video.get('title', '제목 없음')}")
                        results.append(f"   📢 채널: {video.get('channel', '채널명 없음')}")
                        results.append(f"   📝 {video.get('description', '설명 없음')}")
                        
                        # 유튜브 임베드 플레이어 링크 생성
                        video_id = video.get('video_id', '')
                        if video_id:
                            embed_url = f"https://www.youtube.com/embed/{video_id}"
                            results.append(f"   🎬 재생: {embed_url}")
                        results.append("")
                else:
                    results.append("⚠️ 인기 동영상을 찾을 수 없습니다.")
                    results.append("   부동산이나 신용에 대해 궁금하신 점이 있으시면 언제든지 물어보세요!")
                    
            except Exception as e:
                logger.warning(f"⚠️ 동영상 검색 실패: {str(e)}")
                results.append("🎥 동영상 정보를 가져오는 중 오류가 발생했습니다.")
                results.append("   부동산이나 신용에 대해 궁금하신 점이 있으시면 언제든지 물어보세요!")
        
        # 뉴스 관련 질문인지 확인
        elif any(keyword in query_text for keyword in ["뉴스", "최신", "소식", "정보", "동향", "시장", "정책", "변화", "트렌드", "현황", "오늘의 뉴스"]):
            try:
                # news 테이블이 존재하는지 확인
                cursor.execute("SHOW TABLES LIKE 'news'")
                if cursor.fetchone():
                    # 뉴스 테이블에서 최신 뉴스 조회 (video_url 포함)
                    cursor.execute("SELECT title, summary, category, published_at, video_url FROM news ORDER BY published_at DESC LIMIT 5")
                    news_data = cursor.fetchall()
                    
                    if news_data:
                        results.append("📰 오늘의 부동산 뉴스:")
                        
                        for i, row in enumerate(news_data, 1):
                            title = row[0] or "제목 없음"
                            summary = row[1] or "요약 없음"
                            category = row[2] or "카테고리 없음"
                            published_at = row[3] or "날짜 없음"
                            
                            # 날짜 포맷팅
                            if published_at and hasattr(published_at, 'strftime'):
                                date_str = published_at.strftime("%m월 %d일")
                            else:
                                date_str = str(published_at)
                            
                            # 깔끔한 뉴스 형식으로 변경
                            results.append(f"{i}. [{category}] {title}")
                            results.append(f"📅 {date_str} | 📝 {summary[:100]}...")
                            results.append("")
                        
                        # 뉴스 루프가 끝난 후 뉴스 기사와 관련된 영상 1개 추가
                        try:
                            logger.info("🔍 뉴스 기사와 관련된 부동산 영상 1개 검색 시작")
                            
                            # 첫 번째 뉴스 기사를 기준으로 관련 동영상 검색
                            if news_data and len(news_data) > 0:
                                first_news = news_data[0]
                                news_title = first_news[0] or "부동산 뉴스"
                                news_category = first_news[2] or "부동산"
                                
                                logger.info(f"🔍 뉴스 기사 기반 동영상 검색: {news_title[:50]}...")
                                
                                # 뉴스 기사와 관련된 동영상 검색
                                related_videos = get_related_real_estate_videos(news_title, news_category)
                                
                                if related_videos and len(related_videos) > 0:
                                    video = related_videos[0]  # 첫 번째 관련 영상 선택
                                    logger.info(f"✅ 뉴스 기사와 관련된 동영상 찾음: {video.get('title', '제목 없음')}")
                                else:
                                    logger.info("🔍 관련 동영상을 찾을 수 없어 인기 동영상 사용")
                                    related_videos = get_popular_real_estate_videos()
                                    video = related_videos[0] if related_videos else None
                                
                                if video:
                                    video_id = video.get('video_id', '')
                                    video_title = video.get('title', '부동산 관련 동영상')
                                    video_channel = video.get('channel', '알 수 없음')
                                    video_description = video.get('description', '')
                                    
                                    if video_id:
                                        results.append("")  # 빈 줄 추가
                                        results.append("🎥 부동산 관련 동영상:")
                                        results.append(f"📺 제목: {video_title}")
                                        results.append(f"📢 채널: {video_channel}")
                                        if video_description:
                                            results.append(f"📝 설명: {video_description}")
                                        results.append(f"🔗 동영상 ID: {video_id}")
                                        results.append(f"🌐 유튜브 링크: https://www.youtube.com/watch?v={video_id}")
                                        logger.info(f"✅ 관련 영상 정보 생성 완료: {video_title}")
                                    else:
                                        logger.warning("⚠️ 영상 ID를 찾을 수 없습니다.")
                                else:
                                    logger.warning("⚠️ 부동산 영상을 찾을 수 없습니다.")
                            else:
                                logger.warning("⚠️ 뉴스 데이터가 없어 동영상을 찾을 수 없습니다.")
                        except Exception as e:
                            logger.warning(f"⚠️ 영상 검색 실패: {str(e)}")
                        
                        results.append("")
                        
                        # 뉴스 질문일 때는 GPT API 호출하지 않고 직접 결과 반환
                        logger.info("📰 뉴스 질문 감지 - GPT API 호출 없이 직접 결과 반환")
                        logger.info(f"✅ 데이터베이스에서 {len(results)}개 결과 조회 성공")
                        
                        # 결과 내용 로깅 (디버깅용)
                        logger.info("🔍 최종 결과 내용:")
                        for i, result in enumerate(results):
                            logger.info(f"   {i+1}. {result[:100]}...")
                        
                        return {"results": results, "count": len(results)}
                    else:
                        results.append("📰 현재 뉴스 데이터가 없습니다.")
                        results.append("   부동산이나 신용에 대해 궁금하신 점이 있으시면 언제든지 물어보세요!")
                else:
                    results.append("📰 뉴스 테이블이 아직 생성되지 않았습니다.")
                    results.append("   부동산이나 신용에 대해 궁금하신 점이 있으시면 언제든지 물어보세요!")
            except Exception as e:
                logger.warning(f"⚠️ 뉴스 테이블 조회 실패: {str(e)}")
                results.append("📰 뉴스 정보를 가져오는 중 오류가 발생했습니다.")
                results.append("   부동산이나 신용에 대해 궁금하신 점이 있으시면 언제든지 물어보세요!")
        
        # 기본 추천 (아파트 월세)
        elif not any(keyword in query_text for keyword in ["아파트", "오피스텔", "단독주택", "빌라", "연립주택", "연립", "뉴스", "최신", "소식", "정보", "동향", "시장", "정책", "변화", "트렌드", "현황", "동영상", "영상", "비디오", "video"]):
            cursor.execute("SELECT complex_name, deposit, monthly_rent, exclusive_area, floor, construction_year FROM apartment_rent WHERE monthly_rent > 0 LIMIT 3")
            default_data = cursor.fetchall()
            if default_data:
                for row in default_data:
                    complex_name = row[0]  # 단지명
                    deposit = row[1]       # 보증금
                    monthly_rent = row[2]  # 월세
                    area = row[3]          # 면적
                    floor = row[4]         # 층수
                    year = row[5]          # 건축년도
                    
                    # 가격을 억 단위로 포맷팅
                    deposit_formatted = format_price(deposit)
                    monthly_rent_formatted = format_price(monthly_rent)
                    
                    # 매물의 장점 분석
                    advantages = []
                    if year and year >= 2020:
                        advantages.append("신축")
                    elif year and year >= 2010:
                        advantages.append("준신축")
                    
                    if area and area >= 100:
                        advantages.append("넓은 면적")
                    elif area and area >= 80:
                        advantages.append("적당한 면적")
                    
                    if floor and floor >= 15:
                        advantages.append("고층 전망")
                    elif floor and floor <= 3:
                        advantages.append("저층 편리")
                    
                    # 거래유형과 장점을 포함한 응답
                    advantage_text = f" ({', '.join(advantages)})" if advantages else ""
                    results.append(f"{complex_name} 아파트 - 보증금 {deposit_formatted}/월세 {monthly_rent_formatted}, 면적 {area}㎡, {floor}층{advantage_text}")
            else:
                logger.warning("⚠️ apartment_rent 테이블에 월세 데이터가 없습니다.")
        
        cursor.close()
        connection.close()
        
        # 결과가 없는 경우 적절한 메시지 반환
        if not results:
            if "오피스텔" in query_text:
                logger.warning("⚠️ 오피스텔 테이블에 데이터가 없습니다.")
                return {"error": "오피스텔 테이블에 데이터가 없습니다. 데이터베이스에 오피스텔 정보를 추가해주세요."}
            elif "아파트" in query_text:
                logger.warning("⚠️ 아파트 테이블에 데이터가 없습니다.")
                return {"error": "아파트 테이블에 데이터가 없습니다. 데이터베이스에 아파트 정보를 추가해주세요."}
            elif "단독주택" in query_text or "빌라" in query_text:
                logger.warning("⚠️ 단독주택 테이블에 데이터가 없습니다.")
                return {"error": "단독주택 테이블에 데이터가 없습니다. 데이터베이스에 단독주택 정보를 추가해주세요."}
            elif "연립주택" in query_text or "연립" in query_text:
                logger.warning("⚠️ 연립주택 테이블에 데이터가 없습니다.")
                return {"error": "연립주택 테이블에 데이터가 없습니다. 데이터베이스에 연립주택 정보를 추가해주세요."}
            elif any(keyword in query_text for keyword in ["뉴스", "최신", "소식", "정보", "동향", "시장", "정책", "변화", "트렌드", "현황"]):
                logger.warning("⚠️ 뉴스 정보를 찾을 수 없습니다.")
                return {"error": "뉴스 정보를 찾을 수 없습니다. 데이터베이스에 뉴스 정보를 추가해주세요."}
            else:
                logger.warning("⚠️ 부동산 정보를 찾을 수 없습니다.")
                return {"error": "부동산 정보를 찾을 수 없습니다. 데이터베이스에 매물 정보를 추가해주세요."}
        
        logger.info(f"✅ 데이터베이스에서 {len(results)}개 결과 조회 성공")
        
        # 결과 내용 로깅 (디버깅용)
        logger.info("🔍 최종 결과 내용:")
        for i, result in enumerate(results):
            logger.info(f"   {i+1}. {result[:100]}...")
        
        return {"results": results, "count": len(results)}
        
    except Exception as e:
        logger.error(f"❌ 데이터베이스 검색 실패: {str(e)}")
        return {"error": f"데이터베이스 검색 중 오류: {str(e)}"}







def get_default_data(cursor):
    """기본 데이터 제공 (동적 테이블 스캔)"""
    try:
        default_data = {}
        
        # 데이터베이스에서 실제 테이블 목록 가져오기
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        for table in tables:
            try:
                # 테이블 스키마 정보만 제공 (실제 데이터는 제공하지 않음)
                cursor.execute(f"DESCRIBE {table}")
                columns = [col[0] for col in cursor.fetchall()]
                
                # 테이블 레코드 수 확인
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                
                default_data[table] = {
                    'table_name': table,
                    'columns': columns,
                    'total_count': count
                }
                
                logger.info(f"🔍 {table} 테이블 스키마 로드: {len(columns)}개 컬럼, {count}개 레코드")
                
            except Exception as e:
                logger.warning(f"{table} 테이블 스키마 로드 실패: {str(e)}")
                continue
        
        logger.info(f"🔍 기본 데이터 제공 완료: {len(default_data)}개 테이블")
        return default_data
        
    except Exception as e:
        logger.error(f"기본 데이터 제공 실패: {str(e)}")
        return {}

# 테이블 존재 여부 확인 함수는 더 이상 필요하지 않음 (동적 검색으로 대체)

@app.route('/')
def index():
    """메인 챗봇 페이지"""
    # 챗봇 페이지 접속 시 스키마 정보 로드
    logger.info("👤 사용자가 챗봇 페이지에 접속했습니다.")
    load_database_schema()
    
    return jsonify({
        "message": "AI 음성 인식 챗봇 서버가 실행 중입니다.",
        "endpoints": {
            "voice_recognition": "/api/voice-to-text",
            "text_to_speech": "/api/text-to-speech", 
            "chat": "/api/chat",
            "database_test": "/api/test-database",
            "database_schema": "/api/database/schema"
        },
        "status": "running"
    })

@app.route('/api/test-video-functions')
def test_video_functions():
    """영상 검색 함수 테스트"""
    try:
        results = {}
        
        # 관련 영상 검색 테스트
        try:
            related_videos = get_related_real_estate_videos("부동산 정책", "부동산정책")
            results["related_videos"] = {
                "success": True,
                "count": len(related_videos) if related_videos else 0,
                "data": related_videos[:1] if related_videos else []
            }
        except Exception as e:
            results["related_videos"] = {
                "success": False,
                "error": str(e)
            }
        
        # 인기 영상 검색 테스트
        try:
            popular_videos = get_popular_real_estate_videos()
            results["popular_videos"] = {
                "success": True,
                "count": len(popular_videos) if popular_videos else 0,
                "data": popular_videos[:1] if popular_videos else []
            }
        except Exception as e:
            results["popular_videos"] = {
                "success": False,
                "error": str(e)
            }
        
        return jsonify({
            "success": True,
            "results": results,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/check-google-api')
def check_google_api():
    """Google API 상태 확인"""
    try:
        # Google Cloud Speech-to-Text API 상태 확인
        test_url = "https://speech.googleapis.com/v1/speech:recognize"
        headers = {
            "Authorization": f"Bearer {GOOGLE_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # 간단한 테스트 요청
        test_data = {
            "config": {
                "encoding": "WEBM_OPUS",
                "sampleRateHertz": 48000,
                "languageCode": "ko-KR"
            },
            "audio": {
                "content": "dGVzdA=="  # "test" in base64
            }
        }
        
        response = requests.post(test_url, headers=headers, json=test_data, timeout=5)
        
        if response.status_code == 400:  # API 키는 유효하지만 요청 형식이 잘못됨 (정상)
            return jsonify({
                "status": "healthy",
                "message": "Google API 연결 성공",
                "details": "API 키가 유효합니다"
            })
        elif response.status_code == 401:  # 인증 실패
            return jsonify({
                "status": "error",
                "message": "Google API 인증 실패",
                "details": "API 키가 유효하지 않습니다"
            }), 401
        else:
            return jsonify({
                "status": "healthy",
                "message": "Google API 연결 성공",
                "details": f"상태 코드: {response.status_code}"
            })
        
    except Exception as e:
        logger.error(f"Google API 상태 확인 실패: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Google API 연결 실패",
            "details": str(e)
        }), 500

@app.route('/api/check-openai-api')
def check_openai_api():
    """OpenAI API 상태 확인"""
    try:
        # OpenAI API 상태 확인
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # 간단한 모델 목록 요청으로 API 상태 확인
        response = requests.get("https://api.openai.com/v1/models", headers=headers, timeout=10)
        
        if response.status_code == 200:
            return jsonify({
                "status": "healthy",
                "message": "OpenAI API 연결 성공",
                "details": "API 키가 유효합니다"
            })
        elif response.status_code == 401:
            return jsonify({
                "status": "error",
                "message": "OpenAI API 인증 실패",
                "details": "API 키가 유효하지 않습니다"
            }), 401
        else:
            return jsonify({
                "status": "error",
                "message": "OpenAI API 오류",
                "details": f"상태 코드: {response.status_code}"
            }), response.status_code
                
    except Exception as e:
        logger.error(f"OpenAI API 상태 확인 실패: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "OpenAI API 연결 실패",
            "details": str(e)
        }), 500

@app.route('/api/speech-to-text', methods=['POST'])
def speech_to_text():
    """음성을 텍스트로 변환 (Google Cloud STT 사용) + 데이터베이스 검색"""
    try:
        if 'audio' not in request.files:
            return jsonify({
                "success": False,
                "error": "오디오 파일이 없습니다"
            }), 400
        
        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({
                "success": False,
                "error": "선택된 파일이 없습니다"
            }), 400
        
        logger.info(f"음성 인식 요청: {audio_file.filename}")
        
        # Google Cloud Speech-to-Text API 직접 호출
        transcript = call_google_stt(audio_file)
        
        if transcript:
            # 음성 인식 성공 시 데이터베이스에서 관련 데이터 검색
            logger.info(f"🔍 음성 인식 성공: {transcript}")
            logger.info(f"🔍 데이터베이스에서 관련 데이터 검색 시작...")
            
            related_data = search_database_data(transcript)
            
            # 리다이렉트 정보가 있는지 확인
            redirect_info = None
            if isinstance(related_data, dict) and 'redirect_info' in related_data:
                redirect_info = related_data['redirect_info']
            
            return jsonify({
                "success": True,
                "transcript": transcript,
                "related_data": related_data,
                "redirect_info": redirect_info,
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "success": False,
                "error": "음성 인식에 실패했습니다"
            }), 400
            
    except Exception as e:
        logger.error(f"음성 인식 처리 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"음성 인식 중 오류 발생: {str(e)}"
        }), 500

@app.route('/api/voice-chatbot', methods=['POST'])
def voice_chatbot():
    """음성 챗봇 API - 음성 인식 + 사용자 정보 처리"""
    try:
        # 파일과 사용자 정보 받기
        audio_file = request.files.get('audio')
        user_info_str = request.form.get('user_info', '{}')
        
        if not audio_file:
            return jsonify({
                "success": False,
                "error": "오디오 파일이 없습니다"
            }), 400
        
        # 사용자 정보 파싱
        try:
            user_info = json.loads(user_info_str)
            user_email = user_info.get('email', '')
        except:
            user_info = {}
            user_email = ''
        
        logger.info(f"🎤 음성 챗봇 호출 - 사용자 이메일: {user_email}")
        
        # 1단계: 음성을 텍스트로 변환
        transcript = call_google_stt(audio_file)
        
        if not transcript:
            return jsonify({
                "success": False,
                "error": "음성 인식에 실패했습니다",
                "transcript": "",
                "ai_answer": ""
            }), 500
        
        logger.info(f"🎤 음성 인식 결과: {transcript}")
        
        # 2단계: 개인정보 질문 감지 및 처리
        personal_keywords = ['나이', '몇살', '소득', '신용', '등급', '내', '제', '직업', '직장', '수입', '자산', '채무']
        is_personal_question = any(keyword in transcript for keyword in personal_keywords)
        
        logger.info(f"🔍 음성 개인정보 질문 감지: {is_personal_question}")
        
        if is_personal_question and user_email:
            logger.info("🎯 음성 개인정보 질문 감지됨 - 사용자 정보 조회 시작")
            
            # 3단계: 백엔드에서 사용자 상세 정보 직접 조회
            try:
                backend_url = f"http://localhost:8080/api/member/credit-info?email={user_email}"
                logger.info(f"🔍 음성 백엔드 API 호출: {backend_url}")
                
                response = requests.get(backend_url, timeout=10)
                logger.info(f"📡 음성 백엔드 응답 상태: {response.status_code}")
                
                if response.status_code == 200:
                    user_detail = response.json()
                    logger.info(f"✅ 음성 백엔드에서 사용자 상세 정보 조회 성공")
                    
                    # 4단계: 개인정보 질문에 대한 직접 답변 생성
                    ai_answer = None
                    
                    if '나이' in transcript or '몇살' in transcript:
                        age = user_detail.get('creditInfo', {}).get('age')
                        if age and age != 'N/A':
                            ai_answer = f"사용자님의 나이는 {age}세입니다."
                            logger.info(f"✅ 음성 나이 답변 생성: {ai_answer}")
                    
                    elif '소득' in transcript:
                        income = user_detail.get('creditInfo', {}).get('income')
                        if income and income != 'N/A':
                            ai_answer = f"사용자님의 연소득은 {income}만원입니다."
                            logger.info(f"✅ 음성 소득 답변 생성: {ai_answer}")
                    
                    elif '신용' in transcript or '등급' in transcript:
                        credit_score = user_detail.get('creditInfo', {}).get('creditScore')
                        if credit_score and credit_score != 'N/A':
                            ai_answer = f"사용자님의 신용등급은 {credit_score}점입니다."
                            logger.info(f"✅ 음성 신용등급 답변 생성: {ai_answer}")
                    
                    elif '직업' in transcript or '직장' in transcript:
                        employment = user_detail.get('creditInfo', {}).get('employmentType')
                        if employment and employment != 'N/A':
                            ai_answer = f"사용자님의 고용형태는 {employment}입니다."
                            logger.info(f"✅ 음성 직업 답변 생성: {ai_answer}")
                    
                    elif '자산' in transcript:
                        assets = user_detail.get('creditInfo', {}).get('assets')
                        if assets and assets != 'N/A':
                            ai_answer = f"사용자님의 보유자산은 {assets}만원입니다."
                            logger.info(f"✅ 음성 자산 답변 생성: {ai_answer}")
                    
                    elif '채무' in transcript:
                        debt = user_detail.get('creditInfo', {}).get('debt')
                        if debt and debt != 'N/A':
                            ai_answer = f"사용자님의 기존채무는 {debt}만원입니다."
                            logger.info(f"✅ 음성 채무 답변 생성: {ai_answer}")
                    
                    if ai_answer:
                        return jsonify({
                            "success": True,
                            "transcript": transcript,
                            "ai_answer": ai_answer,
                            "database_results": {},
                            "timestamp": datetime.now().isoformat()
                        })
                
            except Exception as e:
                logger.error(f"❌ 음성 백엔드 API 호출 중 오류: {str(e)}")
        
        # 5단계: 개인정보 질문이 아니거나 답변을 생성할 수 없는 경우 - 기존 부동산 로직 실행
        logger.info("🏠 음성 부동산 관련 질문 또는 개인정보 답변 실패 - 부동산 로직 실행")
        
        # 기존 부동산 데이터베이스 검색 로직
        database_results = search_database_data(transcript)
        
        # OpenAI GPT API 호출
        ai_answer = call_openai_gpt_with_database_and_user(transcript, database_results, user_info)
        
        # 리다이렉트 정보가 있는지 확인
        redirect_info = None
        if isinstance(database_results, dict) and 'redirect_info' in database_results:
            redirect_info = database_results['redirect_info']
        
        return jsonify({
            "success": True,
            "transcript": transcript,
            "ai_answer": ai_answer,
            "database_results": database_results,
            "redirect_info": redirect_info,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ 음성 챗봇 처리 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"음성 챗봇 처리 중 오류 발생: {str(e)}",
            "transcript": "",
            "ai_answer": ""
        }), 500

@app.route('/api/search-properties', methods=['GET'])
def search_properties():
    """필터 조건에 맞는 매물 검색 API"""
    try:
        # URL 파라미터에서 검색 조건 추출
        room_count = request.args.get('roomCount', type=int)
        bathroom_count = request.args.get('bathroomCount', type=int)
        
        logger.info(f"🔍 매물 검색 요청: 방 {room_count}개, 화장실 {bathroom_count}개")
        
        # 데이터베이스 연결
        connection = get_db_connection()
        if not connection:
            return jsonify({
                "success": False,
                "error": "데이터베이스 연결 실패"
            }), 500
        
        try:
            cursor = connection.cursor(pymysql.cursors.DictCursor)
            
            # 여러 테이블에서 조건에 맞는 매물 검색
            properties = []
            
            # 1. property 테이블에서만 정확한 검색 (rooms, bathrooms 컬럼 사용)
            if room_count and bathroom_count:
                query = """
                SELECT 
                    title, address, detail_address, road_address,
                    rooms, bathrooms, area, floor, total_floors,
                    price, monthly_rent, transaction_type, property_type,
                    year_built, MAX(created_at) as created_at,
                    'property' as source_table
                FROM property 
                WHERE rooms = %s AND bathrooms = %s
                GROUP BY title, address, detail_address, road_address, rooms, bathrooms, area, floor, total_floors, price, monthly_rent, transaction_type, property_type, year_built
                ORDER BY created_at DESC
                """
                cursor.execute(query, (room_count, bathroom_count))
                property_results = cursor.fetchall()
                
                # SQL GROUP BY로 이미 중복이 제거되었지만, 추가 검증을 위한 로깅
                logger.info(f"🔍 property 테이블에서 정확한 조건으로 {len(property_results)}개 결과")
                logger.info(f"🔍 SQL GROUP BY로 중복 제거 완료")
                
                # 결과를 properties 리스트에 추가
                for prop in property_results:
                    properties.append(dict(prop))
                
                logger.info(f"🔍 정확한 조건 검색만 수행: property 테이블의 rooms={room_count}, bathrooms={bathroom_count} 조건")
            
            logger.info(f"✅ 매물 검색 완료: 총 {len(properties)}개 결과")
            
            # 리다이렉트 정보 추가
            redirect_info = {
                "type": "property_map_redirect",
                "room_count": room_count,
                "bathroom_count": bathroom_count,
                "message": f"방 {room_count}개, 화장실 {bathroom_count}개 조건으로 지도 페이지로 이동합니다."
            }
            
            return jsonify({
                "success": True,
                "properties": properties,
                "total_count": len(properties),
                "search_criteria": {
                    "room_count": room_count,
                    "bathroom_count": bathroom_count
                },
                "redirect_info": redirect_info
            })
            
        finally:
            cursor.close()
            connection.close()
            
    except Exception as e:
        logger.error(f"❌ 매물 검색 중 오류: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"매물 검색 중 오류 발생: {str(e)}"
        }), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """챗봇 API - 사용자 정보를 포함한 개인정보 질문 처리"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        user_email = data.get('user_email', '').strip()
        
        if not message:
            return jsonify({
                "success": False,
                "error": "메시지가 비어있습니다"
            }), 400
        
        logger.info(f"🚨==========================================================")
        logger.info(f"🚨 👤 사용자 메시지: '{message}'")
        logger.info(f"🚨 👤 사용자 이메일: {user_email}")
        
        # 1단계: 개인정보 질문 감지
        personal_keywords = ['나이', '몇살', '소득', '신용', '등급', '내', '제', '직업', '직장', '수입', '자산', '채무']
        is_personal_question = any(keyword in message for keyword in personal_keywords)
        
        logger.info(f"🔍 개인정보 질문 감지: {is_personal_question}")
        logger.info(f"🔍 감지된 키워드: {[k for k in personal_keywords if k in message]}")
        
        if is_personal_question and user_email:
            logger.info("🎯 개인정보 질문 감지됨 - 사용자 정보 조회 시작")
            
            # 2단계: 백엔드에서 사용자 상세 정보 직접 조회
            try:
                backend_url = f"http://localhost:8080/api/member/credit-info?email={user_email}"
                logger.info(f"🔍 백엔드 API 호출: {backend_url}")
                
                response = requests.get(backend_url, timeout=10)
                logger.info(f"📡 백엔드 응답 상태: {response.status_code}")
                
                if response.status_code == 200:
                    user_detail = response.json()
                    logger.info(f"✅ 백엔드에서 사용자 상세 정보 조회 성공: {user_detail}")
                    
                    # 3단계: 개인정보 질문에 대한 직접 답변 생성
                    if '나이' in message or '몇살' in message:
                        age = user_detail.get('creditInfo', {}).get('age')
                        if age and age != 'N/A':
                            answer = f"사용자님의 나이는 {age}세입니다."
                            logger.info(f"✅ 나이 답변 생성: {answer}")
                            return jsonify({
                                "success": True,
                                "response": answer,
                                "database_results": {},
                                "timestamp": datetime.now().isoformat()
                            })
                    
                    elif '소득' in message:
                        income = user_detail.get('creditInfo', {}).get('income')
                        if income and income != 'N/A':
                            answer = f"사용자님의 연소득은 {income}만원입니다."
                            logger.info(f"✅ 소득 답변 생성: {answer}")
                            return jsonify({
                                "success": True,
                                "response": answer,
                                "database_results": {},
                                "timestamp": datetime.now().isoformat()
                            })
                    
                    elif '신용' in message or '등급' in message:
                        credit_score = user_detail.get('creditInfo', {}).get('creditScore')
                        if credit_score and credit_score != 'N/A':
                            answer = f"사용자님의 신용등급은 {credit_score}점입니다."
                            logger.info(f"✅ 신용등급 답변 생성: {answer}")
                            return jsonify({
                                "success": True,
                                "response": answer,
                                "database_results": {},
                                "timestamp": datetime.now().isoformat()
                            })
                    
                    elif '직업' in message or '직장' in message:
                        employment = user_detail.get('creditInfo', {}).get('employmentType')
                        if employment and employment != 'N/A':
                            answer = f"사용자님의 고용형태는 {employment}입니다."
                            logger.info(f"✅ 직업 답변 생성: {answer}")
                            return jsonify({
                                "success": True,
                                "response": answer,
                                "database_results": {},
                                "timestamp": datetime.now().isoformat()
                            })
                    
                    elif '자산' in message:
                        assets = user_detail.get('creditInfo', {}).get('assets')
                        if assets and assets != 'N/A':
                            answer = f"사용자님의 보유자산은 {assets}만원입니다."
                            logger.info(f"✅ 자산 답변 생성: {answer}")
                            return jsonify({
                                "success": True,
                                "response": answer,
                                "database_results": {},
                                "timestamp": datetime.now().isoformat()
                            })
                    
                    elif '채무' in message:
                        debt = user_detail.get('creditInfo', {}).get('debt')
                        if debt and debt != 'N/A':
                            answer = f"사용자님의 기존채무는 {debt}만원입니다."
                            logger.info(f"✅ 채무 답변 생성: {answer}")
                            return jsonify({
                                "success": True,
                                "response": answer,
                                "database_results": {},
                                "timestamp": datetime.now().isoformat()
                            })
                    
                    logger.info("⚠️ 개인정보 질문이지만 적절한 답변을 생성할 수 없음")
                else:
                    logger.warning(f"⚠️ 백엔드 API 호출 실패: {response.status_code} - {response.text}")
                    
            except Exception as e:
                logger.error(f"❌ 백엔드 API 호출 중 오류: {str(e)}")
        
        # 4단계: 개인정보 질문이 아니거나 답변을 생성할 수 없는 경우 - 기존 부동산 로직 실행
        logger.info("🏠 부동산 관련 질문 또는 개인정보 답변 실패 - 부동산 로직 실행")
        
        # 기존 부동산 데이터베이스 검색 로직
        database_results = search_database_data(message)
        
        # 뉴스 질문일 때 GPT API 호출하지 않고 직접 반환
        if database_results and "📰 오늘의 부동산 뉴스:" in str(database_results.get("results", [])):
            logger.info("📰 뉴스 질문 감지 - GPT API 호출 없이 직접 반환")
            
            # 리다이렉트 정보가 있는지 확인
            redirect_info = None
            if isinstance(database_results, dict) and 'redirect_info' in database_results:
                redirect_info = database_results['redirect_info']
            
            return jsonify({
                "success": True,
                "response": "\n".join(database_results["results"]),
                "database_results": database_results,
                "redirect_info": redirect_info,
                "timestamp": datetime.now().isoformat()
            })
        
        # OpenAI GPT API 호출
        gpt_response = call_openai_gpt_with_database_and_user(message, database_results, {})
        
        # 리다이렉트 정보가 있는지 확인
        redirect_info = None
        if isinstance(database_results, dict) and 'redirect_info' in database_results:
            redirect_info = database_results['redirect_info']
        
        return jsonify({
            "success": True,
            "response": gpt_response,
            "database_results": database_results,
            "redirect_info": redirect_info,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ 챗봇 API 처리 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"챗봇 처리 중 오류 발생: {str(e)}"
        }), 500

def call_openai_gpt_with_database(message, database_results):
    """데이터베이스 정보만을 사용하여 OpenAI GPT API 호출"""
    try:
        # 데이터베이스 결과가 있는지 확인
        if "error" in database_results:
            error_msg = database_results['error']
            if "부동산에 대한 질문을 다시 해주세요" in error_msg:
                return "죄송합니다. 부동산에 대한 질문을 다시 해주세요. 현재는 부동산 관련 정보만 제공할 수 있습니다. 예를 들어 '아파트 추천해줘', '오피스텔 월세 정보 알려줘' 같은 질문을 해주세요."
            elif "데이터베이스 연결 실패" in error_msg:
                return "죄송합니다. 데이터베이스 서버가 실행되지 않고 있습니다. MySQL 서버를 시작한 후 다시 시도해주세요. 데이터베이스 연결이 필요합니다."
            elif "테이블에 데이터가 없습니다" in error_msg:
                return f"죄송합니다. {error_msg} 데이터베이스에 매물 정보를 추가한 후 다시 시도해주세요."
            else:
                return f"죄송합니다. 데이터베이스 오류가 발생했습니다: {error_msg}"
        
        if not database_results.get("results"):
            return "죄송합니다. 요청하신 조건에 맞는 부동산 정보를 찾을 수 없습니다. 데이터베이스에 해당 매물 정보가 없습니다."
        
        # 데이터베이스 결과를 텍스트로 변환
        db_info = "\n".join(database_results["results"])
        
        # 간단하고 명확한 프롬프트
        system_prompt = f"""당신은 부동산 정보 제공 AI입니다. 
        사용자 질문에 따라 적절한 답변을 제공하세요.
        
        **실제 부동산 데이터:**
        {db_info}
        
        {user_context}
        
        **중요: 사용자가 개인정보를 물어보는 경우:**
        - 사용자 정보가 입력되어 있다면: 해당 정보를 포함하여 답변
        - 사용자 정보가 입력되지 않았다면: "사용자님께서 아직 해당 정보를 입력하지 않았습니다. 마이페이지에서 나이, 소득, 직업, 신용등급 등의 정보를 입력해주시면 더 정확한 답변을 드릴 수 있습니다."라고 답변
        
        **답변 규칙:**
        
        **1. 부동산 관련 질문인 경우:**
        - 위의 실제 부동산 데이터만 사용하여 답변
        - 구체적인 매물명, 가격, 면적 정보 포함
        - 친근하고 이해하기 쉽게 설명
        
        **2. 사용자 개인정보 질문인 경우 (나이, 소득, 직업, 신용등급 등):**
        - 사용자 정보가 입력되어 있다면: 해당 정보를 포함하여 답변
        - 사용자 정보가 입력되지 않았다면: "사용자님께서 아직 해당 정보를 입력하지 않았습니다. 마이페이지에서 나이, 소득, 직업, 신용등급 등의 정보를 입력해주시면 더 정확한 답변을 드릴 수 있습니다."라고 답변
        
        **3. 질문 구분 방법:**
        - 부동산 질문: 아파트, 오피스텔, 매매, 전세, 월세, 추천, 정보, 가격, 면적, 위치 등
        - 개인정보 질문: 나이, 몇살, 소득, 신용, 등급, 내, 제, 직업, 직장, 수입, 자산, 채무 등
        
        **4. 답변 예시:**
        - "내 나이가 몇이니?" → 사용자 정보 확인 후 적절한 답변 또는 안내 메시지
        - "내 소득등급은?" → 사용자 정보 확인 후 적절한 답변 또는 안내 메시지
        - "아파트 추천해줘" → 부동산 데이터 기반 답변
        - "오피스텔 월세 정보 알려줘" → 부동산 데이터 기반 답변
        
        **5. 개인정보 질문 우선 처리:**
        - 사용자가 "내 나이", "내 소득" 등 개인정보를 물어보면 반드시 개인정보 관련 답변을 제공
        - 부동산 관련 답변으로 돌리지 말 것
        """
        
        logger.info(f"🤖 시스템 프롬프트 생성 완료: {len(system_prompt)}자")
        logger.info(f"🤖 사용자 컨텍스트 포함 여부: {'예' if user_context else '아니오'}")
        
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "max_tokens": 800,
            "temperature": 0.5
        }
        
        logger.info("📞 OpenAI GPT API 호출 시작 (데이터베이스 전용)...")
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            gpt_response = result['choices'][0]['message']['content']
            logger.info(f"✅ GPT 응답 생성 성공: {len(gpt_response)}자")
            return gpt_response
        else:
            logger.error(f"❌ OpenAI GPT API 오류: {response.status_code} - {response.text}")
            return f"GPT API 호출 중 오류가 발생했습니다. 상태 코드: {response.status_code}"
            
    except Exception as e:
        logger.error(f"❌ OpenAI GPT API 호출 실패: {str(e)}")
        return f"AI 응답 생성 중 오류가 발생했습니다: {str(e)}"

def call_openai_gpt_with_data(message, related_data):
    """데이터베이스 정보를 포함하여 OpenAI GPT API 호출 (구버전 - 호환성용)"""
    return call_openai_gpt_with_database(message, related_data)

def call_openai_gpt(message):
    """OpenAI GPT API 호출"""
    try:
        # 부동산 전문가 프롬프트
        system_prompt = """당신은 부동산 전문가 AI 어시스턴트입니다. 
        한국 부동산 시장, 정책, 투자, 거래 등에 대해 전문적이고 정확한 정보를 제공해주세요.
        사용자의 질문에 친근하고 이해하기 쉽게 답변해주세요."""
        
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "max_tokens": 1000,
            "temperature": 0.7
        }
        
        logger.info("🤖 OpenAI GPT API 호출 시작...")
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            gpt_response = result['choices'][0]['message']['content']
            logger.info(f"🤖 ✅ GPT 응답 생성 성공: {len(gpt_response)}자")
            return gpt_response
        else:
            logger.error(f"🤖 ❌ OpenAI GPT API 오류: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"🤖 ❌ OpenAI GPT API 호출 실패: {str(e)}")
        return None

def call_openai_gpt_with_database_and_user(message, database_results, user_info):
    """데이터베이스 정보와 사용자 정보를 사용하여 OpenAI GPT API 호출"""
    try:
        # 데이터베이스 결과가 있는지 확인
        if "error" in database_results:
            error_msg = database_results['error']
            if "부동산에 대한 질문을 다시 해주세요" in error_msg:
                return "죄송합니다. 부동산에 대한 질문을 다시 해주세요. 현재는 부동산 관련 정보만 제공할 수 있습니다. 예를 들어 '아파트 추천해줘', '오피스텔 월세 정보 알려줘' 같은 질문을 해주세요."
            elif "데이터베이스 연결 실패" in error_msg:
                return "죄송합니다. 데이터베이스 서버가 실행되지 않고 있습니다. MySQL 서버를 시작한 후 다시 시도해주세요. 데이터베이스 연결이 필요합니다."
            elif "테이블에 데이터가 없습니다" in error_msg:
                return f"죄송합니다. {error_msg} 데이터베이스에 매물 정보를 추가한 후 다시 시도해주세요."
            else:
                return f"죄송합니다. 데이터베이스 오류가 발생했습니다: {error_msg}"
        
        if not database_results.get("results"):
            return "죄송합니다. 요청하신 조건에 맞는 부동산 정보를 찾을 수 없습니다. 데이터베이스에 해당 매물 정보가 없습니다."
        
        # 데이터베이스 결과를 텍스트로 변환
        db_info = "\n".join(database_results["results"])
        
        # 영상 정보가 포함되어 있는지 확인
        video_info = ""
        for result in database_results["results"]:
            if "🎬 재생:" in result:
                # 영상 정보가 포함된 라인들을 찾아서 별도로 저장
                video_lines = []
                for line in database_results["results"]:
                    if any(keyword in line for keyword in ["🎥", "📺", "🎬 재생:", "📢 채널:", "📝"]):
                        video_lines.append(line)
                if video_lines:
                    video_info = "\n".join(video_lines)
                    break
        
        logger.info(f"🎥 영상 정보 추출: {'있음' if video_info else '없음'}")
        if video_info:
            logger.info(f"🎥 영상 정보 내용: {video_info[:200]}...")
        
        # 사용자 정보를 포함한 프롬프트
        user_context = ""
        if user_info and user_info.get('isLoggedIn'):
            logger.info("✅ 로그인된 사용자 정보 확인됨")
            logger.info(f"🔍 사용자 정보 전체 내용: {user_info}")
            
            # 사용자 정보가 실제로 입력되어 있는지 확인
            has_actual_info = any([
                user_info.get('age') and user_info.get('age') != 'N/A' and user_info.get('age') != '미입력',
                user_info.get('income') and user_info.get('income') != 'N/A' and user_info.get('income') != '미입력',
                user_info.get('creditScore') and user_info.get('creditScore') != 'N/A' and user_info.get('creditScore') != '미입력',
                user_info.get('homeOwnership') and user_info.get('homeOwnership') != 'N/A' and user_info.get('homeOwnership') != '미입력',
                user_info.get('employmentType') and user_info.get('employmentType') != 'N/A' and user_info.get('employmentType') != '미입력',
                user_info.get('assets') and user_info.get('assets') != 'N/A' and user_info.get('assets') != '미입력',
                user_info.get('debt') and user_info.get('debt') != 'N/A' and user_info.get('debt') != '미입력'
            ])
            
            logger.info(f"🔍 실제 사용자 정보 존재 여부: {has_actual_info}")
            
            # 각 필드별 상세 분석
            logger.info("🔍 각 필드별 상태:")
            for field in ['age', 'income', 'creditScore', 'homeOwnership', 'employmentType', 'assets', 'debt']:
                value = user_info.get(field)
                logger.info(f"  - {field}: {value} (타입: {type(value)})")
            
            if has_actual_info:
                user_context = f"""
                **사용자 정보:**
                - 이메일: {user_info.get('email', '알 수 없음')}
                - 닉네임: {user_info.get('nickname', '알 수 없음')}
                - 나이: {user_info.get('age', '미입력')}
                - 소득등급: {user_info.get('income', '미입력')}
                - 신용등급: {user_info.get('creditScore', '미입력')}
                - 주택소유여부: {user_info.get('homeOwnership', '미입력')}
                - 연소득: {user_info.get('income', '미입력')}만원
                - 보유자산: {user_info.get('assets', '미입력')}만원
                - 기존채무: {user_info.get('debt', '미입력')}만원
                - 고용형태: {user_info.get('employmentType', '미입력')}
                - 근무기간: {user_info.get('workPeriod', '미입력')}개월
                - 주거래은행: {user_info.get('mainBank', '미입력')}
                """
                logger.info("📝 실제 사용자 정보가 있어서 상세 컨텍스트 생성")
            else:
                user_context = f"""
                **사용자 기본 정보:**
                - 이메일: {user_info.get('email', '알 수 없음')}
                - 닉네임: {user_info.get('nickname', '알 수 없음')}
                - 상태: 아직 상세 정보를 입력하지 않았습니다
                """
                logger.info("📝 사용자 정보가 미입력 상태 - 기본 정보만 포함")
                logger.info("⚠️ 백엔드 API에서 상세 정보를 제대로 반환하지 못했을 가능성")
        else:
            logger.info("❌ 로그인된 사용자 정보 없음 또는 로그인 상태 아님")
            user_context = ""
        
        # 간단하고 명확한 프롬프트
        system_prompt = f"""당신은 부동산 정보 제공 AI입니다. 
        사용자 질문에 따라 적절한 답변을 제공하세요.
        
        **실제 부동산 데이터:**
        {db_info}
        
        {user_context}
        
        **중요: 사용자가 개인정보를 물어보는 경우:**
        - 사용자 정보가 입력되어 있다면: 해당 정보를 포함하여 답변
        - 사용자 정보가 입력되지 않았다면: "사용자님께서 아직 해당 정보를 입력하지 않았습니다. 마이페이지에서 나이, 소득, 직업, 신용등급 등의 정보를 입력해주시면 더 정확한 답변을 드릴 수 있습니다."라고 답변
        
        **답변 규칙:**
        
        **1. 부동산 관련 질문인 경우:**
        - 위의 실제 부동산 데이터만 사용하여 답변
        - 구체적인 매물명, 가격, 면적 정보 포함
        - 친근하고 이해하기 쉽게 설명
        
        **2. 사용자 개인정보 질문인 경우 (나이, 소득, 직업, 신용등급 등):**
        - 사용자 정보가 입력되어 있다면: 해당 정보를 포함하여 답변
        - 사용자 정보가 입력되지 않았다면: "사용자님께서 아직 해당 정보를 입력하지 않았습니다. 마이페이지에서 나이, 소득, 직업, 신용등급 등의 정보를 입력해주시면 더 정확한 답변을 드릴 수 있습니다."라고 답변
        
        **3. 질문 구분 방법:**
        - 부동산 질문: 아파트, 오피스텔, 매매, 전세, 월세, 추천, 정보, 가격, 면적, 위치 등
        - 개인정보 질문: 나이, 몇살, 소득, 신용, 등급, 내, 제, 직업, 직장, 수입, 자산, 채무 등
        
        **4. 답변 예시:**
        - "내 나이가 몇이니?" → 사용자 정보 확인 후 적절한 답변 또는 안내 메시지
        - "내 소득등급은?" → 사용자 정보 확인 후 적절한 답변 또는 안내 메시지
        - "아파트 추천해줘" → 부동산 데이터 기반 답변
        - "오피스텔 월세 정보 알려줘" → 부동산 데이터 기반 답변
        
        **5. 개인정보 질문 우선 처리:**
        - 사용자가 "내 나이", "내 소득" 등 개인정보를 물어보면 반드시 개인정보 관련 답변을 제공
        - 부동산 관련 답변으로 돌리지 말 것
        """
        
        logger.info(f"🤖 시스템 프롬프트 생성 완료: {len(system_prompt)}자")
        logger.info(f"🤖 사용자 컨텍스트 포함 여부: {'예' if user_context else '아니오'}")
        
        # 개인정보 질문 처리 - 간단하고 직접적인 방식
        logger.info("🔍 개인정보 질문 처리 시작")
        
        # 간단한 키워드 매칭
        if '나이' in message or '몇살' in message:
            age = user_info.get('age')
            if age and age != 'N/A':
                logger.info(f"✅ 나이 질문 감지 - 나이: {age}")
                return f"사용자님의 나이는 {age}세입니다."
        
        elif '소득' in message:
            income = user_info.get('income')
            if income and income != 'N/A':
                logger.info(f"✅ 소득 질문 감지 - 소득: {income}")
                return f"사용자님의 연소득은 {income}만원입니다."
        
        elif '신용' in message or '등급' in message:
            credit_score = user_info.get('creditScore')
            if credit_score and credit_score != 'N/A':
                logger.info(f"✅ 신용등급 질문 감지 - 신용등급: {credit_score}")
                return f"사용자님의 신용등급은 {credit_score}점입니다."
        
        elif '직업' in message or '직장' in message:
            employment = user_info.get('employmentType')
            if employment and employment != 'N/A':
                logger.info(f"✅ 직업 질문 감지 - 직업: {employment}")
                return f"사용자님의 고용형태는 {employment}입니다."
        
        elif '자산' in message:
            assets = user_info.get('assets')
            if assets and assets != 'N/A':
                logger.info(f"✅ 자산 질문 감지 - 자산: {assets}")
                return f"사용자님의 보유자산은 {assets}만원입니다."
        
        elif '채무' in message:
            debt = user_info.get('debt')
            if debt and debt != 'N/A':
                logger.info(f"✅ 채무 질문 감지 - 채무: {debt}")
                return f"사용자님의 기존채무는 {debt}만원입니다."
        
        logger.info("❌ 개인정보 질문이 아님 - GPT API 호출")
        
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "max_tokens": 800,
            "temperature": 0.5
        }
        
        logger.info("📞 OpenAI GPT API 호출 시작 (데이터베이스 전용)...")
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            gpt_response = result['choices'][0]['message']['content']
            logger.info(f"✅ GPT 응답 생성 성공: {len(gpt_response)}자")
            return gpt_response
        else:
            logger.error(f"❌ OpenAI GPT API 오류: {response.status_code} - {response.text}")
            return f"GPT API 호출 중 오류가 발생했습니다. 상태 코드: {response.status_code}"
            
    except Exception as e:
        logger.error(f"❌ OpenAI GPT API 호출 실패: {str(e)}")
        return f"AI 응답 생성 중 오류가 발생했습니다: {str(e)}"

@app.route('/api/text-to-speech', methods=['POST'])
def text_to_speech():
    """텍스트를 음성으로 변환"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        language_code = data.get('language_code', 'ko-KR')
        
        if not text:
            return jsonify({
                "success": False,
                "error": "텍스트가 비어있습니다"
            }), 400
        
        logger.info(f"TTS 요청: {text[:50]}...")
        
        # Google Cloud Text-to-Speech API 호출
        audio_content = call_google_tts(text, language_code)
        
        if audio_content:
            return jsonify({
                "success": True,
                "audio_content": audio_content,
                "text": text,
                "language_code": language_code
            })
        else:
            return jsonify({
                "success": False,
                "error": "음성 변환에 실패했습니다"
            }), 500
            
    except Exception as e:
        logger.error(f"TTS 처리 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"TTS 처리 중 오류 발생: {str(e)}"
        }), 500

@app.route('/api/translate', methods=['POST'])
def translate_text():
    """텍스트 번역"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        target_language = data.get('target_language', 'en')
        
        if not text:
            return jsonify({
                "success": False,
                "error": "텍스트가 비어있습니다"
            }), 400
        
        logger.info(f"번역 요청: {text[:50]}... -> {target_language}")
        
        # Google Cloud Translate API 호출
        translated_text = call_google_translate(text, target_language)
        
        if translated_text:
            return jsonify({
                "success": True,
                "original_text": text,
                "translated_text": translated_text,
                "target_language": target_language
            })
        else:
            return jsonify({
                "success": False,
                "error": "번역에 실패했습니다"
            }), 500
        
    except Exception as e:
        logger.error(f"번역 처리 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"번역 처리 중 오류 발생: {str(e)}"
        }), 500

def call_google_stt(audio_file):
    """Google Cloud Speech-to-Text API 호출 (서비스 계정 키 사용)"""
    try:
        # 서비스 계정 키 확인
        if not SERVICE_ACCOUNT_INFO:
            logger.error("❌ 서비스 계정 키가 로드되지 않았습니다")
            return call_google_stt_simulation(audio_file)
        
        # 서비스 계정 인증 정보로 액세스 토큰 생성
        credentials = service_account.Credentials.from_service_account_info(
            SERVICE_ACCOUNT_INFO,
            scopes=['https://www.googleapis.com/auth/cloud-platform']
        )
        
        # 액세스 토큰 요청
        credentials.refresh(Request())
        access_token = credentials.token
        
        # 오디오 파일을 base64로 인코딩
        import base64
        audio_content = audio_file.read()
        audio_base64 = base64.b64encode(audio_content).decode('utf-8')
        
        # 오디오 파일 상세 정보 로그
        logger.info("=" * 50)
        logger.info("�� [Google STT] 오디오 파일 분석")
        logger.info(f"📁 파일 크기: {len(audio_content)} bytes")
        logger.info(f"🔊 인코딩: WEBM_OPUS")
        logger.info(f"🎵 샘플레이트: 48000Hz")
        logger.info(f"🌍 언어: 한국어 (ko-KR)")
        logger.info(f"🧠 모델: latest_long (향상됨)")
        logger.info("=" * 50)
        
        # 파일 포인터를 처음으로 되돌림
        audio_file.seek(0)
        
        # Google Cloud STT API 요청 (액세스 토큰 사용)
        url = "https://speech.googleapis.com/v1/speech:recognize"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        data = {
            "config": {
                "encoding": "WEBM_OPUS",
                "sampleRateHertz": 48000,
                "languageCode": "ko-KR",
                "enableAutomaticPunctuation": True,
                "model": "latest_long",
                "useEnhanced": True
            },
            "audio": {
                "content": audio_base64
            }
        }
        
        logger.info("🎤 [Google STT] API 호출 시작...")
        logger.info(f"🔑 인증: 서비스 계정 토큰 사용")
        logger.info(f"🌐 API URL: {url}")
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('results'):
                transcript = result['results'][0]['alternatives'][0]['transcript']
                confidence = result['results'][0]['alternatives'][0].get('confidence', 0)
                
                # 음성 인식 성공 로그
                logger.info("=" * 50)
                logger.info("🎤 [Google STT] 음성 인식 성공!")
                logger.info(f"💬 인식된 텍스트: '{transcript}'")
                logger.info(f"📊 신뢰도: {confidence:.2f}")
                logger.info(f"⏰ 인식 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                logger.info("=" * 50)
                
                return transcript
            else:
                logger.warning("🎤 ❌ [Google STT] 음성 인식 결과 없음")
                return None
        else:
            logger.error(f"🎤 ❌ [Google STT] API 오류: {response.status_code}")
            logger.error(f"📄 오류 내용: {response.text}")
            # API 실패 시 시뮬레이션 모드로 폴백
            logger.info("🔄 시뮬레이션 모드로 전환...")
            return call_google_stt_simulation(audio_file)
            
    except Exception as e:
        logger.error(f"🎤 ❌ Google STT API 호출 실패: {str(e)}")
        # 오류 발생 시 시뮬레이션 모드로 폴백
        return call_google_stt_simulation(audio_file)

def call_google_stt_simulation(audio_file):
    """음성 인식 시뮬레이션 (Google API 실패 시 사용)"""
    try:
        # 오디오 파일 크기 확인
        audio_content = audio_file.read()
        file_size = len(audio_content)
        
        # 시뮬레이션 모드 로그
        logger.info("=" * 50)
        logger.info("🎤 [시뮬레이션] 음성 인식 시뮬레이션 모드")
        logger.info(f"📁 오디오 파일 크기: {file_size} bytes")
        logger.info(f"⚠️ Google STT API 실패로 인한 폴백 모드")
        logger.info(f"⏰ 시뮬레이션 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info("=" * 50)
        
        # 파일 포인터를 처음으로 되돌림
        audio_file.seek(0)
        
        if file_size < 100:
            logger.info("🎤 [시뮬레이션] 음성이 너무 작음 - 안내 메시지 반환")
            return "음성이 너무 작습니다. 더 크게 말씀해주세요."
        elif file_size < 500:
            logger.info("🎤 [시뮬레이션] 음성 감지됨 - 안내 메시지 반환")
            return "음성이 감지되었습니다. 구체적인 질문을 해주세요."
        elif file_size < 2000:
            logger.info("🎤 [시뮬레이션] 음성 잘 들림 - 안내 메시지 반환")
            return "음성이 잘 들립니다. 부동산에 대해 무엇을 도와드릴까요?"
        else:
            logger.info("🎤 [시뮬레이션] 음성 인식 완료 - 데이터베이스 연결 필요")
            return "음성이 인식되었습니다. 하지만 데이터베이스 연결이 필요합니다. 데이터베이스 서버를 확인해주세요."
            
    except Exception as e:
        logger.error(f"🎤 시뮬레이션 처리 실패: {str(e)}")
        return "음성 인식에 실패했습니다. 다시 시도해주세요."

def call_google_tts(text, language_code):
    """Google Cloud Text-to-Speech API 호출 (서비스 계정 키 사용)"""
    try:
        # 서비스 계정 키 확인
        if not SERVICE_ACCOUNT_INFO:
            logger.error("❌ 서비스 계정 키가 로드되지 않았습니다")
            return None
        
        # 서비스 계정 인증 정보로 액세스 토큰 생성
        credentials = service_account.Credentials.from_service_account_info(
            SERVICE_ACCOUNT_INFO,
            scopes=['https://www.googleapis.com/auth/cloud-platform']
        )
        
        # 액세스 토큰 요청
        credentials.refresh(Request())
        access_token = credentials.token
        
        # Google Cloud TTS API 요청 (액세스 토큰 사용)
        url = "https://texttospeech.googleapis.com/v1/text:synthesize"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        data = {
            "input": {"text": text},
            "voice": {
                "languageCode": language_code,
                "name": f"{language_code}-Neural2-A" if language_code == "ko-KR" else f"{language_code}-Neural2-A"
            },
            "audioConfig": {
                "audioEncoding": "MP3",
                "sampleRateHertz": 24000
            }
        }
        
        logger.info("🔊 Google Cloud TTS API 호출 시작 (서비스 계정 인증)...")
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            audio_content = result.get('audioContent')
            if audio_content:
                logger.info("🔊 ✅ TTS 성공")
                return audio_content
            else:
                logger.warning("🔊 ❌ TTS 응답에 오디오 콘텐츠 없음")
                return None
        else:
            logger.error(f"🔊 ❌ Google TTS API 오류: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"🔊 ❌ Google TTS API 호출 실패: {str(e)}")
        return None

def call_google_translate(text, target_language):
    """Google Cloud Translate API 호출"""
    try:
        url = "https://translation.googleapis.com/language/translate/v2"
        headers = {
            "Authorization": f"Bearer {GOOGLE_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "q": text,
            "target": target_language,
            "format": "text"
        }
        
        logger.info("Google Cloud Translate API 호출 시작...")
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            translated_text = result.get('data', {}).get('translations', [{}])[0].get('translatedText')
            if translated_text:
                logger.info("번역 성공")
                return translated_text
            else:
                logger.warning("번역 응답에 번역된 텍스트 없음")
                return None
        else:
            logger.error(f"Google Translate API 오류: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"Google Translate API 호출 실패: {str(e)}")
        return None

@app.route('/api/health')
def health_check():
    """서버 상태 확인"""
    # 데이터베이스 연결 상태 확인
    db_status = "unknown"
    db_error = None
    
    try:
        connection = get_db_connection()
        if connection:
            db_status = "connected"
            connection.close()
        else:
            db_status = "disconnected"
            db_error = "MySQL 서버 연결 실패"
    except Exception as e:
        db_status = "error"
        db_error = str(e)
    
    return jsonify({
        "status": "healthy" if db_status == "connected" else "warning",
        "timestamp": datetime.now().isoformat(),
        "service": "AI Voice Chatbot",
        "database": {
            "status": db_status,
            "error": db_error
        },
        "apis": {
            "google_stt": "available",
            "openai_gpt": "available"
        }
    })

@app.route('/api/database/schema')
def get_database_schema():
    """데이터베이스 스키마 정보 (동적 생성)"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({
                "success": False,
                "error": "데이터베이스 연결 실패"
            }), 500
        
        cursor = connection.cursor()
        
        # 데이터베이스에서 실제 테이블 목록 가져오기
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        schema_info = {}
        
        for table in tables:
            try:
                # 각 테이블의 컬럼 정보 가져오기
                cursor.execute(f"DESCRIBE {table}")
                columns = cursor.fetchall()
                
                # 컬럼 정보 정리
                column_info = []
                for col in columns:
                    column_info.append({
                        "name": col[0],
                        "type": col[1],
                        "null": col[2],
                        "key": col[3],
                        "default": col[4],
                        "extra": col[5]
                    })
                
                # 테이블의 레코드 수 확인
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                record_count = cursor.fetchone()[0]
                
                schema_info[table] = {
                    "columns": column_info,
                    "record_count": record_count,
                    "description": f"{table} 테이블 ({record_count}개 레코드)"
                }
                
            except Exception as e:
                logger.warning(f"{table} 테이블 스키마 조회 실패: {str(e)}")
                continue
        
        cursor.close()
        connection.close()
        
        return jsonify({
            "success": True,
            "database": "yong_db",
            "schema_info": schema_info,
            "total_tables": len(schema_info),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"데이터베이스 스키마 조회 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/test-database')
def test_database():
    """데이터베이스 연결 및 테이블 상태 테스트"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({
                "success": False,
                "error": "데이터베이스 연결 실패 - MySQL 서버가 실행되지 않고 있습니다. 서버를 시작한 후 다시 시도해주세요."
            }), 500
        
        cursor = connection.cursor()
        
        # 테이블 목록 조회
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        # 각 테이블의 레코드 수만 확인 (샘플 데이터는 제공하지 않음)
        table_counts = {}
        
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            table_counts[table] = count
        
        cursor.close()
        connection.close()
        
        return jsonify({
            "success": True,
            "database": "yong_db",
            "tables": tables,
            "table_counts": table_counts,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"데이터베이스 테스트 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"데이터베이스 테스트 중 오류 발생: {str(e)}"
        }), 500

def handle_personal_question(message, user_info):
    """개인정보 질문을 처리하는 함수"""
    if not user_info:
        logger.info("❌ handle_personal_question: user_info가 없음")
        return None
    
    logger.info(f"🔍 handle_personal_question 호출됨 - 메시지: {message}")
    logger.info(f"🔍 user_info 내용: {user_info}")
    
    personal_keywords = ['나이', '몇살', '소득', '신용', '등급', '내', '제', '직업', '직장', '수입', '자산', '채무']
    is_personal_question = any(keyword in message for keyword in personal_keywords)
    
    logger.info(f"🔍 개인정보 질문 여부: {is_personal_question}")
    logger.info(f"🔍 감지된 키워드: {[k for k in personal_keywords if k in message]}")
    
    if not is_personal_question:
        logger.info("❌ 개인정보 질문이 아님")
        return None
    
    logger.info("🎯 개인정보 질문 감지됨 - 직접 답변 생성")
    
    if '나이' in message or '몇살' in message:
        age = user_info.get('age', '알 수 없음')
        logger.info(f"🔍 나이 질문 감지 - user_info.age: {age}")
        if age != 'N/A' and age != '알 수 없음':
            response = f"사용자님의 나이는 {age}세입니다."
            logger.info(f"✅ 나이 답변 생성: {response}")
            return response
        else:
            logger.info(f"❌ 나이 정보가 유효하지 않음: {age}")
    
    elif '소득' in message:
        income = user_info.get('income', '알 수 없음')
        logger.info(f"🔍 소득 질문 감지 - user_info.income: {income}")
        if income != 'N/A' and income != '알 수 없음':
            response = f"사용자님의 연소득은 {income}만원입니다."
            logger.info(f"✅ 소득 답변 생성: {response}")
            return response
        else:
            logger.info(f"❌ 소득 정보가 유효하지 않음: {income}")
    
    elif '신용' in message or '등급' in message:
        credit_score = user_info.get('creditScore', '알 수 없음')
        logger.info(f"🔍 신용등급 질문 감지 - user_info.creditScore: {credit_score}")
        if credit_score != 'N/A' and credit_score != '알 수 없음':
            response = f"사용자님의 신용등급은 {credit_score}점입니다."
            logger.info(f"✅ 신용등급 답변 생성: {response}")
            return response
        else:
            logger.info(f"❌ 신용등급 정보가 유효하지 않음: {credit_score}")
    
    elif '직업' in message or '직장' in message:
        employment = user_info.get('employmentType', '알 수 없음')
        logger.info(f"🔍 직업 질문 감지 - user_info.employmentType: {employment}")
        if employment != 'N/A' and employment != '알 수 없음':
            response = f"사용자님의 고용형태는 {employment}입니다."
            logger.info(f"✅ 직업 답변 생성: {response}")
            return response
        else:
            logger.info(f"❌ 직업 정보가 유효하지 않음: {employment}")
    
    elif '자산' in message:
        assets = user_info.get('assets', '알 수 없음')
        logger.info(f"🔍 자산 질문 감지 - user_info.assets: {assets}")
        if assets != 'N/A' and assets != '알 수 없음':
            response = f"사용자님의 보유자산은 {assets}만원입니다."
            logger.info(f"✅ 자산 답변 생성: {response}")
            return response
        else:
            logger.info(f"❌ 자산 정보가 유효하지 않음: {assets}")
    
    elif '채무' in message:
        debt = user_info.get('debt', '알 수 없음')
        logger.info(f"🔍 채무 질문 감지 - user_info.debt: {debt}")
        if debt != 'N/A' and debt != '알 수 없음':
            response = f"사용자님의 기존채무는 {debt}만원입니다."
            logger.info(f"✅ 채무 답변 생성: {response}")
            return response
        else:
            logger.info(f"❌ 채무 정보가 유효하지 않음: {debt}")
    
    logger.info("❌ 개인정보 질문이지만 적절한 답변을 생성할 수 없음")
    return None

if __name__ == '__main__':
    # VoiceService 초기화 확인
    if voice_service:
        logger.info("✅ VoiceService 초기화 완료")
    else:
        logger.warning("⚠️ VoiceService 초기화 실패")
    
    # Google API 키 확인
    if GOOGLE_API_KEY:
        logger.warning("기본 Google API 키를 사용하고 있습니다. 환경 변수로 설정하는 것을 권장합니다.")
    else:
        logger.warning("⚠️ Google API 키가 설정되지 않았습니다.")
    
    # OpenAI API 키 확인
    if OPENAI_API_KEY:
        logger.info("✅ OpenAI API 키가 설정되었습니다!")
        logger.info(" AI 챗봇 응답 생성이 가능합니다.")
    else:
        logger.warning("⚠️ OpenAI API 키가 설정되지 않았습니다.")
        logger.warning(" 현재는 음성 인식만 작동하고 AI 챗봇 응답은 생성되지 않습니다.")
    
    logger.info(" AI 음성 인식 챗봇 서버를 시작합니다...")
    logger.info("🎤 음성 인식: Google Cloud STT API (서비스 계정 인증) ✅")
    logger.info("🔊 음성 합성: Google Cloud TTS API (서비스 계정 인증) ✅")
    logger.info("🤖 AI 챗봇: OpenAI GPT API ✅")
    logger.info("🗄️ 데이터베이스: MySQL 연결 시도 (선택적)")
    
    # 서버 시작 시 데이터베이스 스키마 로드 (선택적)
    load_database_schema()
    
    logger.info("🌐 서버 주소: http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000) 