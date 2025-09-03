import axios from "axios";
import { API_SERVER_HOST } from "./backendApi";

// axios 인스턴스 생성
const reviewRequestApi = axios.create({
  baseURL: API_SERVER_HOST,
});

// 요청 인터셉터 - JWT 토큰 추가
reviewRequestApi.interceptors.request.use(
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

// 검수 요청 생성
export const createPropertyReviewRequest = async (requestData) => {
  try {
    const response = await reviewRequestApi.post(
      "/api/property-review-requests",
      requestData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 사용자의 검수 요청 목록 조회
export const getMyReviewRequests = async (memberEmail) => {
  try {
    const response = await reviewRequestApi.get(
      `/api/property-review-requests/my?memberEmail=${encodeURIComponent(
        memberEmail
      )}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 전체 검수 요청 목록 조회 (관리자용)
export const getAllReviewRequests = async () => {
  try {
    const response = await reviewRequestApi.get(
      "/api/property-review-requests"
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 검수 요청 상세 조회
export const getReviewRequest = async (id) => {
  try {
    const response = await reviewRequestApi.get(
      `/api/property-review-requests/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 검수 요청 승인 (관리자용)
export const approveReviewRequest = async (id, reviewComment = "") => {
  try {
    const response = await reviewRequestApi.post(
      `/api/property-review-requests/${id}/approve?reviewComment=${encodeURIComponent(
        reviewComment
      )}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 검수 요청 거절 (관리자용)
export const rejectReviewRequest = async (id, reviewComment = "") => {
  try {
    const response = await reviewRequestApi.post(
      `/api/property-review-requests/${id}/reject?reviewComment=${encodeURIComponent(
        reviewComment
      )}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 승인된 검수 요청 취소 (관리자용)
export const cancelApprovedReviewRequest = async (id, reviewComment = "") => {
  try {
    const response = await reviewRequestApi.post(
      `/api/property-review-requests/${id}/cancel-approval?reviewComment=${encodeURIComponent(
        reviewComment
      )}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 승인된 검수 요청을 Property로 변환 (관리자용)
export const convertApprovedRequestsToProperties = async () => {
  try {
    const response = await reviewRequestApi.post(
      "/api/property-review-requests/convert-approved"
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 검수 요청 이미지 업로드
export const uploadReviewRequestImage = async (id, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await reviewRequestApi.post(
      `/api/property-review-requests/${id}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
