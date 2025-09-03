import { API_SERVER_HOST } from "./backendApi";

// 오피스텔 매매 생성 함수
export const createOfficeTelSale = async (officeTelSaleData) => {
  try {
    const response = await fetch(`${API_SERVER_HOST}/api/office-tel-sale`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(officeTelSaleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "오피스텔 매매 등록에 실패했습니다."
      );
    }

    return await response.json();
  } catch (error) {
    console.error("오피스텔 매매 등록 실패:", error);
    throw error;
  }
};

// 오피스텔 매매 관련 API
export const officeTelSaleApi = {
  // 모든 오피스텔 매매 정보 조회
  getAllOfficeTelSales: async () => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-sale/all`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("오피스텔 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // ID로 오피스텔 매매 정보 조회
  getOfficeTelSaleById: async (id) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-sale/${id}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("오피스텔 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 검색 조건에 따른 오피스텔 매매 정보 조회
  searchOfficeTelSales: async (searchDTO) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-sale/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchDTO),
        }
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("오피스텔 매매 검색 실패:", error);
      throw error;
    }
  },

  // 시군구로 오피스텔 매매 정보 조회
  getOfficeTelSalesBySigungu: async (sigungu) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-sale/sigungu/${sigungu}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("시군구별 오피스텔 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 단지명으로 오피스텔 매매 정보 조회
  getOfficeTelSalesByComplexName: async (complexName) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-sale/complex/${complexName}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("단지명별 오피스텔 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 전용면적 범위로 오피스텔 매매 정보 조회
  getOfficeTelSalesByAreaRange: async (minArea, maxArea) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-sale/area?minArea=${minArea}&maxArea=${maxArea}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("전용면적 범위별 오피스텔 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 층 범위로 오피스텔 매매 정보 조회
  getOfficeTelSalesByFloorRange: async (minFloor, maxFloor) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-sale/floor?minFloor=${minFloor}&maxFloor=${maxFloor}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("층 범위별 오피스텔 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 건축년도 범위로 오피스텔 매매 정보 조회
  getOfficeTelSalesByConstructionYearRange: async (minYear, maxYear) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-sale/construction-year?minYear=${minYear}&maxYear=${maxYear}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("건축년도 범위별 오피스텔 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 거래금액 범위로 오피스텔 매매 정보 조회
  getOfficeTelSalesByTransactionAmountRange: async (minAmount, maxAmount) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-sale/transaction-amount?minAmount=${minAmount}&maxAmount=${maxAmount}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("거래금액 범위별 오피스텔 매매 정보 조회 실패:", error);
      throw error;
    }
  },
};
