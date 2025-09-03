// 게시판 공통 상수 - 모든 게시판 타입에서 공통으로 사용

// 페이지네이션 관련
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,        // 기본 페이지당 게시글 수
  MAX_PAGE_SIZE: 50,            // 최대 페이지당 게시글 수
  MAX_VISIBLE_PAGES: 5,         // 최대 표시할 페이지 번호 수
};

// 이미지 업로드 관련
export const IMAGE_UPLOAD = {
  MAX_COUNT: 5,                 // 최대 이미지 개수
  MAX_SIZE: 5 * 1024 * 1024,   // 최대 파일 크기 (5MB)
  ACCEPT_TYPES: [               // 지원하는 이미지 타입
    "image/jpeg",
    "image/png", 
    "image/gif",
    "image/webp"
  ],
  THUMBNAIL_WIDTH: 120,         // 썸네일 너비
  THUMBNAIL_HEIGHT: 80,         // 썸네일 높이
  PREVIEW_WIDTH: 120,           // 미리보기 너비
  PREVIEW_HEIGHT: 120,          // 미리보기 높이
};

// 텍스트 길이 제한
export const TEXT_LIMITS = {
  TITLE_MAX_LENGTH: 100,        // 제목 최대 길이
  CONTENT_MAX_LENGTH: 2000,     // 내용 최대 길이
  COMMENT_MAX_LENGTH: 500,      // 댓글 최대 길이
  SEARCH_MAX_LENGTH: 50,        // 검색어 최대 길이
};

// 날짜 포맷 관련
export const DATE_FORMAT = {
  SHORT: "short",               // 짧은 형식 (예: 2024. 1. 15.)
  MEDIUM: "medium",             // 중간 형식 (예: 2024년 1월 15일)
  LONG: "long",                 // 긴 형식 (예: 2024년 1월 15일 화요일)
  RELATIVE: "relative",         // 상대적 형식 (예: 어제, 3일 전)
};

// 색상 코드
export const COLORS = {
  PRIMARY: "#007bff",           // 주요 색상 (파란색)
  SUCCESS: "#28a745",           // 성공 색상 (초록색)
  WARNING: "#ffc107",           // 경고 색상 (노란색)
  DANGER: "#dc3545",            // 위험 색상 (빨간색)
  INFO: "#17a2b8",              // 정보 색상 (청록색)
  LIGHT: "#f8f9fa",             // 밝은 색상 (회색)
  DARK: "#343a40",              // 어두운 색상 (검정색)
  SECONDARY: "#6c757d",         // 보조 색상 (회색)
  WHITE: "#ffffff",             // 흰색
  BORDER: "#dee2e6",            // 테두리 색상
  TEXT_PRIMARY: "#333333",      // 주요 텍스트 색상
  TEXT_SECONDARY: "#666666",    // 보조 텍스트 색상
  TEXT_MUTED: "#999999",        // 흐린 텍스트 색상
};

// 애니메이션 관련
export const ANIMATION = {
  TRANSITION_DURATION: "0.2s",  // 전환 지속 시간
  TRANSITION_TIMING: "ease",    // 전환 타이밍 함수
  HOVER_TRANSFORM: "translateY(-2px)", // 호버 시 변환
  HOVER_SHADOW: "0 4px 8px rgba(0,0,0,0.1)", // 호버 시 그림자
};

// 반응형 브레이크포인트
export const BREAKPOINTS = {
  XS: 576,                      // 초소형 (모바일 세로)
  SM: 768,                      // 소형 (모바일 가로)
  MD: 992,                      // 중형 (태블릿)
  LG: 1200,                     // 대형 (데스크톱)
  XL: 1400,                     // 초대형 (큰 데스크톱)
};

// 에러 메시지
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
  SERVER_ERROR: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  VALIDATION_ERROR: "입력 정보를 확인해주세요.",
  UNAUTHORIZED: "로그인이 필요합니다.",
  FORBIDDEN: "접근 권한이 없습니다.",
  NOT_FOUND: "요청한 정보를 찾을 수 없습니다.",
  IMAGE_UPLOAD_ERROR: "이미지 업로드에 실패했습니다.",
  FILE_SIZE_ERROR: "파일 크기가 너무 큽니다.",
  FILE_TYPE_ERROR: "지원하지 않는 파일 형식입니다.",
};

// 성공 메시지
export const SUCCESS_MESSAGES = {
  CREATE: "성공적으로 등록되었습니다.",
  UPDATE: "성공적으로 수정되었습니다.",
  DELETE: "성공적으로 삭제되었습니다.",
  UPLOAD: "파일이 성공적으로 업로드되었습니다.",
  SAVE: "성공적으로 저장되었습니다.",
};

// 로딩 메시지
export const LOADING_MESSAGES = {
  LOADING: "로딩 중...",
  SAVING: "저장 중...",
  UPLOADING: "업로드 중...",
  SEARCHING: "검색 중...",
  PROCESSING: "처리 중...",
};

// 기본값
export const DEFAULTS = {
  EMPTY_TEXT: "내용이 없습니다.",
  NO_DATA: "데이터가 없습니다.",
  LOADING_TEXT: "데이터를 불러오는 중...",
  ERROR_TEXT: "오류가 발생했습니다.",
  RETRY_TEXT: "다시 시도",
  CLOSE_TEXT: "닫기",
  CONFIRM_TEXT: "확인",
  CANCEL_TEXT: "취소",
};

// 정렬 옵션
export const SORT_OPTIONS = {
  LATEST: "latest",             // 최신순
  OLDEST: "oldest",             // 오래된순
  TITLE: "title",               // 제목순
  VIEWS: "views",               // 조회수순
  LIKES: "likes",               // 좋아요순
  COMMENTS: "comments",         // 댓글순
};

// 필터 옵션
export const FILTER_OPTIONS = {
  ALL: "전체",
  TODAY: "오늘",
  WEEK: "이번 주",
  MONTH: "이번 달",
  YEAR: "올해",
};

// 게시글 상태
export const BOARD_STATUS = {
  ACTIVE: "active",             // 활성
  INACTIVE: "inactive",         // 비활성
  DELETED: "deleted",           // 삭제됨
  HIDDEN: "hidden",             // 숨김
  PENDING: "pending",           // 대기중
  APPROVED: "approved",         // 승인됨
  REJECTED: "rejected",         // 거부됨
};
