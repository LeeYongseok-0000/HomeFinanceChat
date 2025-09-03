import { API_SERVER_HOST } from "./backendApi";

export const searchStatisticsApi = {
  // 전체 검색 순위 조회
  getTopSearches: async () => {
    try {
      const response = await fetch(`${API_SERVER_HOST}/api/search-statistics/top`);
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("전체 검색 순위 조회 실패:", error);
      throw error;
    }
  },

  // 키워드 검색 순위 조회
  getTopKeywordSearches: async () => {
    try {
      const response = await fetch(`${API_SERVER_HOST}/api/search-statistics/top/keyword`);
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("키워드 검색 순위 조회 실패:", error);
      throw error;
    }
  },

  // 단지명 검색 순위 조회
  getTopComplexSearches: async () => {
    try {
      const response = await fetch(`${API_SERVER_HOST}/api/search-statistics/top/complex`);
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("단지명 검색 순위 조회 실패:", error);
      throw error;
    }
  },

  // 지역 검색 순위 조회
  getTopRegionSearches: async () => {
    try {
      const response = await fetch(`${API_SERVER_HOST}/api/search-statistics/top/region`);
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("지역 검색 순위 조회 실패:", error);
      throw error;
    }
  }
};
