import { API_SERVER_HOST } from "./backendApi";

// 빌라 매매 생성 함수
export const createRowHouseSale = async (rowHouseSaleData) => {
  try {
    const response = await fetch(`${API_SERVER_HOST}/api/rowhouse-sale`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rowHouseSaleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "빌라 매매 등록에 실패했습니다.");
    }

    return await response.json();
  } catch (error) {
    console.error("빌라 매매 등록 실패:", error);
    throw error;
  }
};

// 빌라 매매 관련 API
export const rowHouseSaleApi = {
  // 모든 연립다세대 매매 정보 조회
  getAllRowHouseSales: async () => {
    try {
      const response = await fetch(`${API_SERVER_HOST}/api/rowhouse-sale/all`);
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("연립다세대 매매 전체 조회 오류:", error);
      throw error;
    }
  },

  // ID별 연립다세대 매매 정보 조회
  getRowHouseSaleById: async (id) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-sale/${id}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("연립다세대 매매 ID별 조회 오류:", error);
      throw error;
    }
  },

  // 조건에 따른 연립다세대 매매 검색
  searchRowHouseSales: async (searchDTO) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-sale/search`,
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
      console.error("연립다세대 매매 검색 오류:", error);
      throw error;
    }
  },

  // 시군구별 연립다세대 매매 정보 조회
  getRowHouseSalesBySigungu: async (sigungu) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-sale/sigungu/${sigungu}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("시군구별 연립다세대 매매 조회 오류:", error);
      throw error;
    }
  },

  // 건물명별 연립다세대 매매 정보 조회
  getRowHouseSalesByBuildingName: async (buildingName) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-sale/building/${buildingName}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("건물명별 연립다세대 매매 조회 오류:", error);
      throw error;
    }
  },

  // 주택유형별 연립다세대 매매 정보 조회
  getRowHouseSalesByHousingType: async (housingType) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-sale/housing-type/${housingType}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("주택유형별 연립다세대 매매 조회 오류:", error);
      throw error;
    }
  },

  // 전용면적 범위별 연립다세대 매매 정보 조회
  getRowHouseSalesByExclusiveAreaRange: async (
    minExclusiveArea,
    maxExclusiveArea
  ) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-sale/exclusive-area?minExclusiveArea=${minExclusiveArea}&maxExclusiveArea=${maxExclusiveArea}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("전용면적 범위별 연립다세대 매매 조회 오류:", error);
      throw error;
    }
  },

  // 대지권면적 범위별 연립다세대 매매 정보 조회
  getRowHouseSalesByLandAreaRange: async (minLandArea, maxLandArea) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-sale/land-area?minLandArea=${minLandArea}&maxLandArea=${maxLandArea}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("대지권면적 범위별 연립다세대 매매 조회 오류:", error);
      throw error;
    }
  },

  // 거래금액 범위별 연립다세대 매매 정보 조회
  getRowHouseSalesByTransactionAmountRange: async (minAmount, maxAmount) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-sale/transaction-amount?minAmount=${minAmount}&maxAmount=${maxAmount}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("거래금액 범위별 연립다세대 매매 조회 오류:", error);
      throw error;
    }
  },

  // 층 범위별 연립다세대 매매 정보 조회
  getRowHouseSalesByFloorRange: async (minFloor, maxFloor) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-sale/floor?minFloor=${minFloor}&maxFloor=${maxFloor}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("층 범위별 연립다세대 매매 조회 오류:", error);
      throw error;
    }
  },

  // 건축년도 범위별 연립다세대 매매 정보 조회
  getRowHouseSalesByConstructionYearRange: async (minYear, maxYear) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-sale/construction-year?minYear=${minYear}&maxYear=${maxYear}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("건축년도 범위별 연립다세대 매매 조회 오류:", error);
      throw error;
    }
  },
};
