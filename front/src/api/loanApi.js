import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

class ApiService {
  // 모든 대출 상품 조회
  async getAllProducts() {
    const response = await axios.get(`${API_BASE_URL}/loan-products`);
    return response.data;
  }

  // 은행별 상품 조회
  async getProductsByBank(bankName) {
    const response = await axios.get(
      `${API_BASE_URL}/loan-products/bank/${bankName}`
    );
    return response.data;
  }

  // 청년 우대 상품 조회
  async getYouthPreferenceProducts() {
    const response = await axios.get(
      `${API_BASE_URL}/loan-products/youth-preference`
    );
    return response.data;
  }

  // 모바일 신청 가능 상품 조회
  async getMobileAvailableProducts() {
    const response = await axios.get(
      `${API_BASE_URL}/loan-products/mobile-available`
    );
    return response.data;
  }

  // 추천 상품 요청 (백엔드에서 추천 로직 처리)
  async getRecommendations(userConditions) {
    const response = await axios.post(
      `${API_BASE_URL}/loan-products/recommend`,
      userConditions
    );
    return response.data;
  }
}

export const apiService = new ApiService();

// 개별 함수로도 export
export const getRecommendations = (userConditions) => {
  return apiService.getRecommendations(userConditions);
};
