"""
설정 정보 관리
"""

import os

# OpenAI API 설정
OPENAI_API_KEY = ""

# Google Cloud API 키
GOOGLE_API_KEY = ""

# 데이터베이스 설정 (백엔드와 동일한 설정)
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'yonguser1'),
    'password': os.getenv('DB_PASSWORD', 'yonguser1'),
    'database': os.getenv('DB_NAME', 'yong_db'),
    'charset': 'utf8mb4'
}

# Flask 설정
FLASK_CONFIG = {
    'host': '0.0.0.0',
    'port': int(os.getenv('PORT', 5000)),
    'debug': os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
}

# 음성 설정
VOICE_CONFIG = {
    'audio_dir': 'static/audio',
    'voice_name': 'ko-KR-Neural2-A',  # 한국어 여성 음성
    'language_code': 'ko-KR',          # 한국어
    'sample_rate': 24000,              # 샘플링 레이트
    'encoding': 'MP3'                  # 오디오 인코딩
}

# 부동산 관련 키워드
REAL_ESTATE_KEYWORDS = {
    '지역': ['강남', '서초', '마포', '용산', '성동', '광진', '송파', '강동', '강서', '양천', '영등포', '구로', '금천', '동작', '관악', '서대문', '은평', '노원', '도봉', '강북', '성북', '중랑', '동대문', '종로', '중구'],
    '매물타입': ['아파트', '오피스텔', '빌라', '단독주택', '연립', '상가', '사무실', '창고', '토지'],
    '거래타입': ['매매', '전세', '월세', '단기임대', '분양'],
    '가격': ['억', '천만', '만', '원', '평', '제곱미터', 'm2'],
    '방개수': ['1룸', '2룸', '3룸', '4룸', '원룸', '투룸', '쓰리룸', '포룸']
}

# 챗봇 설정
CHATBOT_CONFIG = {
    'max_tokens': 1000,
    'temperature': 0.7,
    'system_prompt': """당신은 부동산 전문가 AI 어시스턴트입니다. 
    한국 부동산 시장, 정책, 투자, 거래 등에 대해 전문적이고 정확한 정보를 제공해주세요.
    사용자의 질문에 친근하고 이해하기 쉽게 답변해주세요.
    항상 한국어로 답변해주세요."""
} 