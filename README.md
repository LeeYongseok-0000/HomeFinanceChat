# 🏠 부동산 중개 플랫폼

부동산 매물 검색, 중개, 관리가 가능한 통합 웹 플랫폼입니다.

## 📋 프로젝트 개요

이 프로젝트는 부동산 매물을 효율적으로 검색하고 관리할 수 있는 웹 애플리케이션입니다. 사용자들이 아파트, 단독주택, 오피스텔 등 다양한 부동산 매물을 쉽게 찾고, 중개업무를 체계적으로 관리할 수 있도록 지원합니다.

## ✨ 주요 기능

### 🏢 부동산 매물 관리

- **매물 등록/수정/삭제**: 아파트, 단독주택, 오피스텔, 연립주택 등
- **매물 검색 및 필터링**: 지역, 가격, 면적, 방 개수, 방 옵션 등 다양한 조건으로 검색
- **매물 상세 정보**: 사진, 위치, 시세 정보 등 상세한 매물 정보 제공
- **시세 차트**: 거래 내역 및 시장 가격 추이 시각화

### 👥 사용자 관리

- **회원가입/로그인**: 일반 로그인, 소셜 로그인(카카오, 네이버, 구글)
- **마이페이지**: 개인 정보 관리, 관심 매물 관리, 등록 매물 관리
- **신용 정보 관리**: 대출 상품 추천을 위한 신용 정보 관리

### 💰 대출 서비스

- **신용 상품 추천**: 신용 정보에 따른 맞춤 대출 상품 추천
- **대출 가능액 계산** : 신용 정보에 따른 최대 대출 가능액 도출 

### 💬 커뮤니티

- **부동산 Q&A**: 부동산 관련 질문과 답변
- **우리 마을 Q&A**: 마을의 편의시설, 교통, 교육환경 등 생활 전반에 대한 질문과 답변
- **우리 마을 이야기**: 지역별 마을 소식, 지역 정보 공유
- **댓글 및 답변**: 게시글에 대한 상호작용

### 📰 뉴스 서비스

- **부동산 뉴스**: 최신 부동산 시장 동향 및 정책 소식
- **지역별 뉴스**: 지역별 부동산 관련 소식 및 개발 계획
- **시장 분석**: 부동산 시장 전망 및 전문가 분석 기사
- **정책 정보**: 정부 부동산 정책 및 규제 변경 사항


### 🗺️ 지도 서비스

- **카카오맵 연동**: 매물 위치 시각화
- **지역별 검색**: 지도 기반 지역별 매물 검색

### 🤖 AI 챗봇

- **음성 인식**: 음성으로 부동산 정보 검색
- **자연어 처리**: 자연스러운 대화형 부동산 상담
- **뉴스 요약**: 부동산 관련 뉴스 기사의 핵심 내용 요약

### 📊 관리자 기능

- **매물 승인 관리**: 등록된 매물의 검토 및 승인
- **매물 거래 데이터 관리**: 이전 거래 데이터 검토 및 삭제
- **통계 대시보드**: 매물 등록 현황, 검색 통계 등

## 🛠️ 기술 스택

### Backend

- **Java 17**
- **Spring Boot 3.x**
- **Spring Security** - JWT 기반 인증
- **Spring Data JPA** - 데이터 접근 계층
- **Gradle** - 빌드 도구
- **MySQL/PostgreSQL** - 데이터베이스
- **Python 3.x** - AI 음성 인식 서비스
- **Flask** - Python 웹 프레임워크

### Frontend

- **React 18**
- **JavaScript/JSX**
- **Tailwind CSS** - 스타일링
- **Axios** - HTTP 클라이언트
- **React Router** - 라우팅

### External APIs

- **카카오맵 API** - 지도 서비스
- **카카오/네이버/구글 OAuth** - 소셜 로그인
- **OpenAI** - 챗봇 
- **Google Cloud console** - 음성 인식 서비스
- **NewsAPI** - 뉴스 


## 실행하기

### Prerequisites

- Java 17 이상
- Python 3.x 이상
- Node.js 16 이상
- MySQL 또는 PostgreSQL
- Gradle

### Backend 실행

#### Spring Boot (Java)

```bash
cd back
./gradlew bootRun
```

#### Flask (Python)

```cmd
cd pyt
python -m venv venv
.venv\Scripts\activate  # Windows # source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python src/pyt/app.py
```

### Frontend 실행

```bash
cd front
npm install
npm start, yarn start
```

### 환경 설정

`back/src/main/resources/application.properties` 파일에서 데이터베이스 연결 정보를 설정하세요.

## 📁 프로젝트 구조

```
home_project/
├── front/                   # React 프론트엔드
│   ├── src/                # React 소스 코드
│   ├── public/             # 정적 파일
│   └── package.json        # npm 의존성
├── back/                    # Spring Boot 백엔드
│   ├── src/main/java/      # Java 소스 코드
│   ├── src/main/resources/ # 설정 파일
│   └── build.gradle        # Gradle 설정
├── pyt/                     # Flask Python 백엔드 (AI 음성 인식)
│   ├── src/pyt/            # Python 소스 코드
│   │   ├── app.py          # Flask 메인 애플리케이션
│   │   ├── voice_service.py # 음성 서비스 로직
│   │   └── templates/      # HTML 템플릿
│   ├── requirements.txt    # Python 의존성
│   └── README.md           # Python 프로젝트 문서
└── README.md               # 프로젝트 문서
```

## 🔧 주요 컴포넌트

### Backend

#### Spring Boot (Java)

- **Controller**: REST API 엔드포인트
- **Service**: 비즈니스 로직 처리
- **Repository**: 데이터 접근 계층
- **Domain**: 엔티티 클래스
- **DTO**: 데이터 전송 객체

#### Flask (Python)

- **app.py**: Flask 메인 애플리케이션 및 라우팅
- **voice_service.py**: Google Cloud STT 및 OpenAI GPT 연동
- **templates**: HTML 템플릿 (챗봇 인터페이스)

### Frontend

- **Components**: 재사용 가능한 UI 컴포넌트
- **Pages**: 페이지별 컴포넌트
- **API**: 백엔드 API 호출
- **Hooks**: 커스텀 React 훅
- **Slices**: Redux 상태 관리

## 📱 주요 페이지

- **메인 페이지**: 사용자의 신용 정보 및 부동산 상품 추천
- **지도 페이지**: 카카오맵 기반 매물 위치 시각화 및 지역별 검색
- **매물 목록**: 필터링된 매물 목록
- **매물 상세**: 매물 정보 및 시세 차트
- **로그인/회원가입**: 사용자 인증
- **마이페이지**: 개인 정보 및 관심 매물, 등록 매물 관리
- **대출 서비스**: 대출 상품 추천 및 예상 대출액 도출
- **뉴스 페이지**: 부동산 시장 동향, 정책 정보, 시장 분석 기사
- **커뮤니티**: Q&A 및 마을 이야기
- **관리자 페이지**: 매물 승인 및 사용자 관리



## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!

