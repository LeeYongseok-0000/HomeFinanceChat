# 부동산 중개 플랫폼

부동산 매물 검색, 중개, 관리가 가능한 통합 웹 플랫폼입니다.

## 프로젝트 개요

이 프로젝트는 부동산 매물을 효율적으로 검색하고 관리할 수 있는 웹 애플리케이션입니다. 사용자들이 아파트, 단독주택, 오피스텔 등 다양한 부동산 매물을 쉽게 찾고, 중개업무를 체계적으로 관리할 수 있도록 지원합니다.

## 프로젝트 명 

# 혼집내줘

### 개발 기간

- 25.08.01(금) ~ 25.08.28(목)

## 팀원 소개

|                    (팀장) [이용석](https://github.com/LeeYongseok-0000)                    |                      [이상원](https://github.com/lee-1002)                    |                      [장준혁](https://github.com/jjh-8249)                     |                      [박지혁](https://github.com/jihyuk123979)                     |                      [양지성](https://github.com/jxxhxx)                     |
|:-------------------------------------------------------------------------------:|:-------------------------------------------------------------------------------:|:-------------------------------------------------------------------------------:|:-------------------------------------------------------------------------------:|:-------------------------------------------------------------------------------:|
| [<img src="https://avatars.githubusercontent.com/u/184890981?v=4" width="200" />](https://github.com/LeeYongseok-0000) | [<img src="https://avatars.githubusercontent.com/u/183713556?v=4" width="200" />](https://github.com/lee-1002) | [<img src="https://avatars.githubusercontent.com/u/183588723?v=4" width="200" />](https://github.com/jjh-8249) | [<img src="https://avatars.githubusercontent.com/u/177728506?v=4" width="200" />](https://github.com/jihyuk123979) | [<img src="https://github.com/jxxhxx.png" width="200" />](https://github.com/jxxhxx) |

### 역할 분담
#### 각 팀원들은 풀스택 기반으로 역할을 수행함

이용석 (팀장)
-

- **프로젝트 총괄**
- **시연영상 제작**
- **코드 통합**

이상원
-

- **뉴스API를 이용한 뉴스페이지 구현**
- **OpenAI를 이용한 챗봇 구현(사용자 정보 분석, 뉴스 요약 등)**
- **프로젝트 전체적 UI 개선**
- **디렉토리 구조 정의 및 기본 라우팅 설정** 

장준혁
-

- **실거래가 공공 데이터 리스트화**
- **지도 페이지 매물 필터** 
- **PDF 작성**


박지혁
-

- **대출 상품 추천 페이지**
- **매물 페이지**
- **마이 페이지**
- **관리자 페이지**
- **소셜 로그인 기능 구현 (카카오, 네이버, 구글 )**

양지성
-

- **커뮤니티 페이지 구현**
- **지도 API를 이용한 위치정보, 주변 인프라 정보 표시 기능 구현**
- **회원 Role 기반 권한 처리 기능 구현**

------------------------------------------------------------------------------------


### 개발환경
- 언어
  
   <img src="https://img.shields.io/badge/java-007396?style=for-the-badge&logo=java&logoColor=white"> 
   <img src="https://img.shields.io/badge/Javascript-F7DF1E?style=for-the-badge&logo=Javascript&logoColor=white">
   <img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
   <img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white">
   <img src="https://img.shields.io/badge/python-3776AB?style=for-the-badge&logo=python&logoColor=white">
   
- 개발 도구
  
   <div>
   <img src="https://img.shields.io/badge/springboot-6DB33F?style=for-the-badge&logo=spring&logoColor=white">
   <img src="https://img.shields.io/badge/springsecurity-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white">
   <br/><img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black">
   <img src="https://img.shields.io/badge/redux-764ABC?style=for-the-badge&logo=redux&logoColor=black">
   <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
   <br/><img src="https://img.shields.io/badge/aws-232F3E?style=for-the-badge&logo=amazonwebservices&logoColor=white">
   <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">
   <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white">
   <br/><img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=OpenAI&logoColor=white">
   <img src="https://img.shields.io/badge/Google%20Cloud%20API-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white">
   <br/><img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=Prettier&logoColor=white">
   </div>
- IDE
  
   <img src="https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white">
- OS
  
   <img src="https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white">
- Sever : AWS

## 실행하기

### 환경 버전

- **Java 21** (Spring Boot 3.5.4)
- **Python 3.x** (Flask 2.3.3)
- **Node.js 18+** (React 19.1.1)
- **MariaDB 10.x** (MySQL 호환)
- **Gradle 8.x** (Spring Boot 3.5.4)

### Backend 실행

#### -Spring Boot (Java)

```bash
cd back
./gradlew bootRun
```

#### -Flask (Python)

```cmd
cd pyt
python -m venv venv
.venv\Scripts\activate  # Windows # source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python src/pyt/app.py
```

#### -Frontend 실행

```bash
cd front
npm install
npm start, yarn start
```

#### -환경 설정

`back/src/main/resources/application.properties` 파일에서 데이터베이스 연결 정보를 설정하세요.

## 프로젝트 구조

```
home_project/
├── front/                    # React 프론트엔드
│   ├── src/                  # React 소스 코드
│   ├── public/               # 정적 파일
│   └── package.json          # npm 의존성
├── back/                     # Spring Boot 백엔드
│   ├── src/main/java/        # Java 소스 코드
│   ├── src/main/resources/   # 설정 파일
│   └── build.gradle          # Gradle 설정
│   └── upload                # 사진 문서       
├── pyt/                      # Flask Python 백엔드 (AI 음성 인식)
│   ├── src/pyt/              # Python 소스 코드
│   │   ├── app.py            # Flask 메인 애플리케이션
│   │   ├── voice_service.py  # 음성 서비스 로직
│   │   └── templates/        # HTML 템플릿
│   ├── requirements.txt      # Python 의존성
│   └── README.md             # Python 프로젝트 문서
└── README.md                 # 프로젝트 문서
```

## ERD
<img width="1414" height="860" alt="KakaoTalk_20250827_144010715" src="https://github.com/user-attachments/assets/f6d7b451-0b2f-4ea3-82db-2eb01d5d3716" />

## 유스케이스
<img width="1586" height="784" alt="KakaoTalk_20250827_151339732_01" src="https://github.com/user-attachments/assets/4296ae64-2ae3-4291-9a15-15adedaa68b9" />


## 주요 디렉토리

### Frontend

- **Components**: 재사용 가능한 UI 컴포넌트
- **Pages**: 페이지별 컴포넌트
- **API**: 백엔드 API 호출
- **Hooks**: 커스텀 React 훅
- **Slices**: Redux 상태 관리

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



## 주요 페이지

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

## 주요 기능

### 부동산 매물 관리

- **매물 등록/수정/삭제**: 아파트, 단독주택, 오피스텔, 연립주택 등
- **매물 검색 및 필터링**: 지역, 가격, 면적, 방 개수, 방 옵션 등 다양한 조건으로 검색
- **매물 상세 정보**: 사진, 위치, 시세 정보 등 상세한 매물 정보 제공
- **시세 차트**: 거래 내역 및 시장 가격 추이 시각화

### 사용자 관리

- **회원가입/로그인**: 일반 로그인, 소셜 로그인(카카오, 네이버, 구글)
- **마이페이지**: 개인 정보 관리, 관심 매물 관리, 등록 매물 관리
- **신용 정보 관리**: 대출 상품 추천을 위한 신용 정보 관리

### 금융 서비스

- **신용 상품 추천**: 신용 정보에 따른 맞춤 대출 상품 추천
- **대출 가능액 계산** : 신용 정보에 따른 최대 대출 가능액 도출

 > **담보대출 계산**:
>   
  >  - **DSR 비율**: 연소득의 40% (담보대출 기준)
  >  - **LTV 비율**: 담보가치의 70-80% (담보 유형별 차등 적용)
  >  - **최대 한도**: 연소득의 8배까지
  >  - **담보 유형별 LTV**: 수도권 아파트 100%, 지방 아파트 95%, 단독주택 90%, 빌라/연립 85%
 >
 > **전세자금대출 계산**:

  >  - **DSR 비율**: 연소득의 35% (전세자금대출 기준)
  >  - **보증비율**: 전세보증금의 65-80% (상품별 차등 적용)
  >  - **최대 한도**: 연소득의 8배까지
 >

### 커뮤니티

- **부동산 Q&A**: 부동산 관련 질문과 답변
- **우리 마을 Q&A**: 마을의 편의시설, 교통, 교육환경 등 생활 전반에 대한 질문과 답변
- **우리 마을 이야기**: 지역별 마을 소식, 지역 정보 공유
- **댓글 및 답변**: 게시글에 대한 상호작용

### 뉴스 서비스

- **부동산 뉴스**: 최신 부동산 시장 동향 및 정책 소식
- **지역별 뉴스**: 지역별 부동산 관련 소식 및 개발 계획
- **시장 분석**: 부동산 시장 전망 및 전문가 분석 기사
- **정책 정보**: 정부 부동산 정책 및 규제 변경 사항


### 지도 서비스

- **카카오맵 연동**: 매물 위치 시각화
- **지역별 검색**: 지도 기반 지역별 매물 검색

### AI 챗봇

- **음성 인식**: 음성으로 부동산 정보 검색
- **자연어 처리**: 자연스러운 대화형 부동산 상담
- **뉴스 요약**: 부동산 관련 뉴스 기사의 핵심 내용 요약
- **정보 제공**: 사이트 이용가이드 및 사용자 맞춤 서비스 제공
### 관리자 기능

- **매물 승인 관리**: 등록된 매물의 검토 및 승인
- **매물 거래 데이터 관리**: 이전 거래 데이터 검토 및 삭제
- **통계 대시보드**: 매물 등록 현황, 검색 통계 등

---
























