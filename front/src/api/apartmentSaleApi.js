import { API_SERVER_HOST } from "./backendApi";

// 아파트 매매 생성 함수
export const createApartmentSale = async (apartmentSaleData) => {
  try {
    const response = await fetch(`${API_SERVER_HOST}/api/apartment-sale`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apartmentSaleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "아파트 매매 등록에 실패했습니다.");
    }

    return await response.json();
  } catch (error) {
    console.error("아파트 매매 등록 실패:", error);
    throw error;
  }
};

// 아파트 매매 관련 API (조회 전용)
export const apartmentSaleApi = {
  // 모든 아파트 매매 정보 조회 (페이지네이션)
  getAllApartmentSales: async (page = 0, size = 20) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-sale/list?page=${page}&size=${size}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("아파트 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // ID로 아파트 매매 정보 조회
  getApartmentSaleById: async (id) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-sale/${id}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("아파트 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 검색 조건에 따른 아파트 매매 조회
  searchApartmentSales: async (searchCriteria, page = 0, size = 20) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-sale/search?page=${page}&size=${size}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchCriteria),
        }
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("아파트 매매 검색 실패:", error);
      throw error;
    }
  },

  // 시군구로 아파트 매매 정보 조회
  getApartmentSalesBySigungu: async (sigungu, page = 0, size = 20) => {
    try {
      const searchCriteria = { searchSigungu: sigungu };
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-sale/search?page=${page}&size=${size}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchCriteria),
        }
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("시군구별 아파트 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 단지명으로 아파트 매매 조회
  getApartmentSalesByComplexName: async (complexName, page = 0, size = 20) => {
    try {
      const searchCriteria = { searchComplexName: complexName };
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-sale/search?page=${page}&size=${size}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchCriteria),
        }
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("단지명별 아파트 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 구분(매매)으로 아파트 정보 조회
  getApartmentSalesByTransactionType: async (
    transactionType = "매매",
    page = 0,
    size = 20
  ) => {
    try {
      const searchCriteria = { transactionType: transactionType };
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-sale/search?page=${page}&size=${size}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchCriteria),
        }
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("거래구분별 아파트 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 시군구 목록 조회
  getSigunguList: async () => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-sale/sigungu-list`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("시군구 목록 조회 실패:", error);
      throw error;
    }
  },

  // 주택유형 목록 조회
  getHousingTypeList: async () => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-sale/housing-type-list`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("주택유형 목록 조회 실패:", error);
      throw error;
    }
  },

  // 거래구분 목록 조회
  getTransactionTypeList: async () => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-sale/transaction-type-list`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("거래구분 목록 조회 실패:", error);
      throw error;
    }
  },

  // 전체 데이터 개수 조회
  getCount: async () => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-sale/count`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("데이터 개수 조회 실패:", error);
      throw error;
    }
  },
};
