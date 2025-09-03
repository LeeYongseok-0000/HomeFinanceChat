import axios from "axios";
import { API_SERVER_HOST } from "./backendApi";

// axios 인스턴스 생성
const propertyApi = axios.create({
  baseURL: API_SERVER_HOST,
});

// 요청 인터셉터 - JWT 토큰 추가
propertyApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 매물 목록 조회
export const getPropertyList = async (params = {}) => {
  // 사용자 이메일이 있으면 쿼리 파라미터에 추가
  const queryParams = { ...params };
  if (params.memberEmail) {
    queryParams.memberEmail = params.memberEmail;
  }

  const response = await propertyApi.get("/api/property/list", {
    params: queryParams,
  });
  return response.data;
};

// 매물 상세 조회
export const getPropertyDetail = async (propertyId, memberEmail = null) => {
  const url = memberEmail
    ? `/api/property/${propertyId}?memberEmail=${memberEmail}`
    : `/api/property/${propertyId}`;
  const response = await propertyApi.get(url);
  return response.data;
};

// 매물 등록
export const createProperty = async (propertyData) => {
  // FormData인 경우 Content-Type을 자동으로 설정
  const config = {};
  if (propertyData instanceof FormData) {
    config.headers = {
      "Content-Type": "multipart/form-data",
    };
  }

  const response = await propertyApi.post(
    "/api/property",
    propertyData,
    config
  );
  return response.data;
};

// 매물 수정
export const updateProperty = async (propertyId, propertyData) => {
  // FormData인 경우 Content-Type을 명시적으로 설정하지 않음
  // 브라우저가 자동으로 multipart/form-data를 설정하도록 함
  const response = await propertyApi.put(
    `/api/property/${propertyId}`,
    propertyData
  );
  return response.data;
};

// 매물 삭제
export const deleteProperty = async (propertyId) => {
  const response = await propertyApi.delete(`/api/property/${propertyId}`);
  return response.data;
};

// 매물 좋아요/취소
export const likeProperty = async (propertyId, memberEmail) => {
  const response = await propertyApi.post(
    `/api/property/${propertyId}/like?memberEmail=${memberEmail}`
  );
  return response.data;
};

// 매물 문의 등록
export const addPropertyInquiry = async (propertyId, inquiryData) => {
  const response = await propertyApi.post(
    `/api/property/${propertyId}/inquiry`,
    inquiryData
  );
  return response.data;
};

// 내가 등록한 매물 목록
export const getMyProperties = async (params = {}) => {
  try {
    console.log("🔍 getMyProperties 호출 - params:", params);

    if (!params.memberEmail) {
      console.error("❌ memberEmail이 없습니다");
      throw new Error("memberEmail이 필요합니다");
    }

    const response = await propertyApi.get("/api/property/my", { params });
    console.log("✅ getMyProperties 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ getMyProperties 실패:", error);
    if (error.response) {
      console.error("❌ 응답 상태:", error.response.status);
      console.error("❌ 응답 데이터:", error.response.data);
    }
    throw error;
  }
};

// 내가 좋아요한 매물 목록
export const getLikedProperties = async (params = {}) => {
  try {
    console.log("🔍 getLikedProperties 호출 - params:", params);

    if (!params.memberEmail) {
      console.error("❌ memberEmail이 없습니다");
      throw new Error("memberEmail이 필요합니다");
    }

    const response = await propertyApi.get("/api/property/liked", { params });
    console.log("✅ getLikedProperties 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ getLikedProperties 실패:", error);
    if (error.response) {
      console.error("❌ 응답 상태:", error.response.status);
      console.error("❌ 응답 데이터:", error.response.data);
    }
    throw error;
  }
};

// 매물 검색 (고급 검색)
export const searchProperties = async (searchParams) => {
  const response = await propertyApi.post("/api/property/search", searchParams);
  return response.data;
};

// 매물 조회수 증가
export const incrementViewCount = async (propertyId) => {
  const response = await propertyApi.post(`/api/property/${propertyId}/view`);
  return response.data;
};

// 매물 이미지 업로드
export const uploadPropertyImage = async (propertyId, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await propertyApi.post(
    `/api/property/${propertyId}/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// 매물 이미지 삭제
export const deletePropertyImage = async (propertyId, imageId) => {
  const response = await propertyApi.delete(
    `/api/property/${propertyId}/image/${imageId}`
  );
  return response.data;
};

// 매물 상태 변경 (판매중/예약중/거래완료)
export const updatePropertyStatus = async (propertyId, status) => {
  const response = await propertyApi.patch(
    `/api/property/${propertyId}/status`,
    { status }
  );
  return response.data;
};

// 매물 추천 (사용자 맞춤)
export const getRecommendedProperties = async (params = {}) => {
  const response = await propertyApi.get("/api/property/recommended", {
    params,
  });
  return response.data;
};

// 매물 통계 (조회수, 좋아요 등)
export const getPropertyStats = async (propertyId) => {
  const response = await propertyApi.get(`/api/property/${propertyId}/stats`);
  return response.data;
};

// 댓글 관련 API
export const getPropertyInquiries = async (propertyId) => {
  try {
    const response = await propertyApi.get(
      `/api/property/${propertyId}/inquiries`
    );
    return response.data;
  } catch (error) {
    console.error("댓글 목록 조회 실패:", error);
    throw error;
  }
};

export const createPropertyInquiry = async (propertyId, inquiryData) => {
  try {
    const response = await propertyApi.post(
      `/api/property/${propertyId}/inquiries`,
      inquiryData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("댓글 작성 실패:", error);
    throw error;
  }
};

export const deletePropertyInquiry = async (inquiryId, writerEmail) => {
  try {
    const response = await propertyApi.delete(
      `/api/property/inquiries/${inquiryId}?writerEmail=${writerEmail}`
    );
    return response.data;
  } catch (error) {
    console.error("댓글 삭제 실패:", error);
    throw error;
  }
};

export const getInquiryReplies = async (inquiryId) => {
  try {
    const response = await propertyApi.get(
      `/api/property/inquiries/${inquiryId}/replies`
    );
    return response.data;
  } catch (error) {
    console.error("답글 목록 조회 실패:", error);
    throw error;
  }
};

export const createInquiryReply = async (inquiryId, replyData) => {
  try {
    const response = await propertyApi.post(
      `/api/property/inquiries/${inquiryId}/replies`,
      replyData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("답글 작성 실패:", error);
    throw error;
  }
};

export const deleteInquiryReply = async (replyId, writerEmail) => {
  try {
    const response = await propertyApi.delete(
      `/api/property/inquiries/replies/${replyId}?writerEmail=${writerEmail}`
    );
    return response.data;
  } catch (error) {
    console.error("답글 삭제 실패:", error);
    throw error;
  }
};

// 실거래가 조회
export const getMarketPrice = async (propertyId) => {
  try {
    const response = await propertyApi.get(
      `/api/property/${propertyId}/market-price`
    );
    return response.data;
  } catch (error) {
    console.error("실거래가 조회 실패:", error);
    throw error;
  }
};
