import { API_SERVER_HOST } from "./backendApi";

// 빌라 전월세 생성 함수
export const createRowHouseRent = async (rowHouseRentData) => {
  try {
    const response = await fetch(`${API_SERVER_HOST}/api/rowhouse-rent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rowHouseRentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "빌라 전월세 등록에 실패했습니다.");
    }

    return await response.json();
  } catch (error) {
    console.error("빌라 전월세 등록 실패:", error);
    throw error;
  }
};

// 빌라 전월세 관련 API
export const rowHouseRentApi = {
  // 모든 연립다세대 전월세 정보 조회
  getAllRowHouseRents: async () => {
    try {
      const response = await fetch(`${API_SERVER_HOST}/api/rowhouse-rent/all`);
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("연립다세대 전월세 전체 조회 오류:", error);
      throw error;
    }
  },

  // ID별 연립다세대 전월세 정보 조회
  getRowHouseRentById: async (id) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-rent/${id}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("연립다세대 전월세 ID별 조회 오류:", error);
      throw error;
    }
  },

  // 조건에 따른 연립다세대 전월세 검색
  searchRowHouseRents: async (searchDTO) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-rent/search`,
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
      console.error("연립다세대 전월세 검색 오류:", error);
      throw error;
    }
  },

  // 시군구별 연립다세대 전월세 정보 조회
  getRowHouseRentsBySigungu: async (sigungu) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-rent/sigungu/${sigungu}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("시군구별 연립다세대 전월세 조회 오류:", error);
      throw error;
    }
  },

  // 건물명별 연립다세대 전월세 정보 조회
  getRowHouseRentsByBuildingName: async (buildingName) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-rent/building/${buildingName}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("건물명별 연립다세대 전월세 조회 오류:", error);
      throw error;
    }
  },

  // 주택유형별 연립다세대 전월세 정보 조회
  getRowHouseRentsByHousingType: async (housingType) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-rent/housing-type/${housingType}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("주택유형별 연립다세대 전월세 조회 오류:", error);
      throw error;
    }
  },

  // 전월세구분별 연립다세대 전월세 정보 조회
  getRowHouseRentsByRentType: async (rentType) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-rent/rent-type/${rentType}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("전월세구분별 연립다세대 전월세 조회 오류:", error);
      throw error;
    }
  },

  // 전용면적 범위별 연립다세대 전월세 정보 조회
  getRowHouseRentsByExclusiveAreaRange: async (
    minExclusiveArea,
    maxExclusiveArea
  ) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-rent/exclusive-area?minExclusiveArea=${minExclusiveArea}&maxExclusiveArea=${maxExclusiveArea}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("전용면적 범위별 연립다세대 전월세 조회 오류:", error);
      throw error;
    }
  },

  // 보증금 범위별 연립다세대 전월세 정보 조회
  getRowHouseRentsByDepositRange: async (minDeposit, maxDeposit) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-rent/deposit?minDeposit=${minDeposit}&maxDeposit=${maxDeposit}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("보증금 범위별 연립다세대 전월세 조회 오류:", error);
      throw error;
    }
  },

  // 월세 범위별 연립다세대 전월세 정보 조회
  getRowHouseRentsByMonthlyRentRange: async (
    minMonthlyRent,
    maxMonthlyRent
  ) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-rent/monthly-rent?minMonthlyRent=${minMonthlyRent}&maxMonthlyRent=${maxMonthlyRent}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("월세 범위별 연립다세대 전월세 조회 오류:", error);
      throw error;
    }
  },

  // 층 범위별 연립다세대 전월세 정보 조회
  getRowHouseRentsByFloorRange: async (minFloor, maxFloor) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-rent/floor?minFloor=${minFloor}&maxFloor=${maxFloor}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("층 범위별 연립다세대 전월세 조회 오류:", error);
      throw error;
    }
  },

  // 건축년도 범위별 연립다세대 전월세 정보 조회
  getRowHouseRentsByConstructionYearRange: async (minYear, maxYear) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/rowhouse-rent/construction-year?minYear=${minYear}&maxYear=${maxYear}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("건축년도 범위별 연립다세대 전월세 조회 오류:", error);
      throw error;
    }
  },
};
