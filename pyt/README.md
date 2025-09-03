# AI 음성 인식 챗봇

python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python src/pyt/app.py

Google Cloud Speech-to-Text와 OpenAI GPT를 사용하는 음성 인식 챗봇입니다.

## 🚀 주요 기능

- **🎤 음성 인식**: Google Cloud STT로 실시간 음성 인식
- **🤖 AI 챗봇**: OpenAI GPT로 지능적인 응답 생성
- **🌐 웹 인터페이스**: HTML 템플릿 기반 사용자 친화적 UI
- **📱 반응형 디자인**: 모바일과 데스크톱 모두 지원

## 🛠️ 설치 및 설정

### 1. 필요한 패키지 설치

```bash
pip install -r requirements.txt
```

### 2. API 키 설정

#### Google Cloud API 키

- Google Cloud Console에서 Speech-to-Text API 활성화
- 서비스 계정 키 생성 및 다운로드
- 환경 변수 설정:

```bash
# Windows
set GOOGLE_API_KEY=AIzaSyD6kiavyuPPavawKx-czmMOk1MyPCIVy0I

# Linux/Mac
export GOOGLE_API_KEY=AIzaSyD6kiavyuPPavawKx-czmMOk1MyPCIVy0I
```

#### OpenAI API 키

- OpenAI 웹사이트에서 API 키 발급
- 환경 변수 설정:

```bash
# Windows
set OPENAI_API_KEY=your-actual-openai-api-key

# Linux/Mac
export OPENAI_API_KEY=your-actual-openai-api-key
```

### 3. 서버 실행

```bash
cd pyt/src/pyt
python app.py
```

서버가 `http://localhost:5000`에서 실행됩니다.

## 📁 파일 구조

```
pyt/
├── src/
│   └── pyt/
│       ├── app.py              # Flask 메인 애플리케이션
│       ├── voice_service.py    # 음성 서비스 로직
│       └── templates/
│           └── chatbot.html    # 챗봇 웹 인터페이스
├── requirements.txt            # Python 패키지 의존성
└── README.md                  # 이 파일
```

## 🔧 API 엔드포인트

### 웹 인터페이스

- `GET /` - 메인 챗봇 페이지

### 음성 인식

- `POST /api/speech-to-text` - 음성을 텍스트로 변환

### 챗봇

- `POST /api/chat` - OpenAI GPT와 대화

### 상태 확인

- `GET /api/health` - 서버 상태 확인
- `GET /api/check-google-api` - Google API 상태 확인
- `GET /api/check-openai-api` - OpenAI API 상태 확인

## 🎤 음성 인식 사용법

1. **마이크 권한 허용**: 브라우저에서 마이크 접근 권한을 허용합니다
2. **음성 인식 시작**: "🎤 음성으로 질문" 버튼을 클릭합니다
3. **말하기**: 마이크에 질문을 말합니다 (2-10초)
4. **자동 인식**: Google Cloud STT가 음성을 텍스트로 변환합니다
5. **AI 응답**: OpenAI GPT가 질문에 답변합니다

## 🎨 UI 특징

- **모던한 디자인**: 그라데이션과 그림자 효과
- **실시간 상태 표시**: 음성 인식 진행 상황 실시간 업데이트
- **반응형 레이아웃**: 모든 디바이스에서 최적화된 표시
- **직관적인 컨트롤**: 간단한 버튼과 드롭다운으로 쉬운 조작

## 🔍 문제 해결

### 음성 인식이 안 될 때

1. **마이크 권한 확인**: 브라우저 설정에서 마이크 권한 허용
2. **마이크 연결 확인**: 물리적 마이크 연결 상태 점검
3. **API 키 확인**: Google Cloud API 키가 유효한지 확인
4. **서버 상태 확인**: Flask 서버가 정상 실행 중인지 확인

### OpenAI 응답이 안 올 때

1. **API 키 확인**: OpenAI API 키가 올바르게 설정되었는지 확인
2. **API 할당량 확인**: OpenAI API 사용량 한도 확인
3. **네트워크 연결**: 인터넷 연결 상태 확인

## 📊 로그 확인

서버 실행 시 다음과 같은 로그를 확인할 수 있습니다:

```
🎤 === 음성 인식 시작 ===
🎤 입력 오디오 파일: voice_input.webm
🎤 오디오 파일 크기: 1234 bytes
🎤 RecognitionAudio 객체 생성 완료
🎤 음성 인식 설정 완료
🎤 Google Cloud STT API 호출 시작...
🎤 STT API 응답 수신: 1개 결과
🎤 ✅ 음성 인식 성공!
🎤 인식 결과: 부동산에 대해 질문이 있습니다
🎤 신뢰도: 0.95
```

## 🔐 보안 주의사항

- API 키를 소스 코드에 직접 하드코딩하지 마세요
- 환경 변수나 .env 파일을 사용하여 API 키를 관리하세요
- 프로덕션 환경에서는 HTTPS를 사용하세요

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

버그 리포트나 기능 제안은 이슈로 등록해주세요.
풀 리퀘스트도 환영합니다!

## 📞 지원

문제가 발생하면 다음을 확인해주세요:

1. README의 문제 해결 섹션
2. 서버 로그 확인
3. API 키 설정 상태 확인
4. 네트워크 연결 상태 확인
