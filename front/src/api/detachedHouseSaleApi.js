import { API_SERVER_HOST } from "./backendApi";

// 단독주택 매매 생성 함수
export const createDetachedHouseSale = async (detachedHouseSaleData) => {
  try {
    const response = await fetch(`${API_SERVER_HOST}/api/detached-house-sale`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(detachedHouseSaleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "단독주택 매매 등록에 실패했습니다."
      );
    }

    return await response.json();
  } catch (error) {
    console.error("단독주택 매매 등록 실패:", error);
    throw error;
  }
};

// 단독주택 매매 관련 API
export const detachedHouseSaleApi = {
  // 모든 단독/다가구 매매 정보 조회
  getAllDetachedHouseSales: async () => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-sale/all`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("단독/다가구 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // ID로 단독/다가구 매매 정보 조회
  getDetachedHouseSaleById: async (id) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-sale/${id}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("단독/다가구 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 검색 조건에 따른 단독/다가구 매매 정보 조회
  searchDetachedHouseSales: async (searchDTO) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-sale/search`,
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
      console.error("단독/다가구 매매 검색 실패:", error);
      throw error;
    }
  },

  // 시군구로 단독/다가구 매매 정보 조회
  getDetachedHouseSalesBySigungu: async (sigungu) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-sale/sigungu/${sigungu}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("시군구별 단독/다가구 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 주택유형으로 단독/다가구 매매 정보 조회
  getDetachedHouseSalesByHousingType: async (housingType) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-sale/housing-type/${housingType}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("주택유형별 단독/다가구 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 도로조건으로 단독/다가구 매매 정보 조회
  getDetachedHouseSalesByRoadCondition: async (roadCondition) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-sale/road-condition/${roadCondition}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("도로조건별 단독/다가구 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 연면적 범위로 단독/다가구 매매 정보 조회
  getDetachedHouseSalesByTotalAreaRange: async (minTotalArea, maxTotalArea) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-sale/total-area?minTotalArea=${minTotalArea}&maxTotalArea=${maxTotalArea}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("연면적 범위별 단독/다가구 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 대지면적 범위로 단독/다가구 매매 정보 조회
  getDetachedHouseSalesByLandAreaRange: async (minLandArea, maxLandArea) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-sale/land-area?minLandArea=${minLandArea}&maxLandArea=${maxLandArea}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("대지면적 범위별 단독/다가구 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 거래금액 범위로 단독/다가구 매매 정보 조회
  getDetachedHouseSalesByTransactionAmountRange: async (
    minAmount,
    maxAmount
  ) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-sale/transaction-amount?minAmount=${minAmount}&maxAmount=${maxAmount}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("거래금액 범위별 단독/다가구 매매 정보 조회 실패:", error);
      throw error;
    }
  },

  // 건축년도 범위로 단독/다가구 매매 정보 조회
  getDetachedHouseSalesByConstructionYearRange: async (minYear, maxYear) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-sale/construction-year?minYear=${minYear}&maxYear=${maxYear}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("건축년도 범위별 단독/다가구 매매 정보 조회 실패:", error);
      throw error;
    }
  },
};
