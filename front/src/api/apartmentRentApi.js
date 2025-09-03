import { API_SERVER_HOST } from "./backendApi";

// 아파트 전월세 생성 함수
export const createApartmentRent = async (apartmentRentData) => {
  try {
    const response = await fetch(`${API_SERVER_HOST}/api/apartment-rent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apartmentRentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "아파트 전월세 등록에 실패했습니다."
      );
    }

    return await response.json();
  } catch (error) {
    console.error("아파트 전월세 등록 실패:", error);
    throw error;
  }
};

// 아파트 전월세 관련 API
export const apartmentRentApi = {
  // 모든 아파트 전월세 정보 조회
  getAllApartmentRents: async () => {
    try {
      const response = await fetch(`${API_SERVER_HOST}/api/apartment-rent/all`);
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("아파트 전월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // ID로 아파트 전월세 정보 조회
  getApartmentRentById: async (id) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-rent/${id}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("아파트 전월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 검색 조건에 따른 아파트 전월세 정보 조회
  searchApartmentRents: async (searchDTO) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-rent/search`,
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
      console.error("아파트 전월세 검색 실패:", error);
      throw error;
    }
  },

  // 시군구로 아파트 전월세 정보 조회
  getApartmentRentsBySigungu: async (sigungu) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-rent/sigungu/${sigungu}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("시군구별 아파트 전월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 단지명으로 아파트 전월세 정보 조회
  getApartmentRentsByComplexName: async (complexName) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-rent/complex/${complexName}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("단지명별 아파트 전월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 구분(전세/월세)으로 아파트 전월세 정보 조회
  getApartmentRentsByRentType: async (rentType) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-rent/type/${rentType}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("구분별 아파트 전월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 전용면적 범위로 아파트 전월세 정보 조회
  getApartmentRentsByAreaRange: async (minArea, maxArea) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-rent/exclusive-area?minExclusiveArea=${minArea}&maxExclusiveArea=${maxArea}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("전용면적 범위별 아파트 전월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 층 범위로 아파트 전월세 정보 조회
  getApartmentRentsByFloorRange: async (minFloor, maxFloor) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-rent/floor?minFloor=${minFloor}&maxFloor=${maxFloor}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("층 범위별 아파트 전월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 건축년도 범위로 아파트 전월세 정보 조회
  getApartmentRentsByConstructionYearRange: async (minYear, maxYear) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-rent/construction-year?minYear=${minYear}&maxYear=${maxYear}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("건축년도 범위별 아파트 전월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 보증금 범위로 아파트 전월세 정보 조회
  getApartmentRentsByDepositRange: async (minDeposit, maxDeposit) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-rent/deposit?minDeposit=${minDeposit}&maxDeposit=${maxDeposit}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("보증금 범위별 아파트 전월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 월세 범위로 아파트 전월세 정보 조회
  getApartmentRentsByMonthlyRentRange: async (minRent, maxRent) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/apartment-rent/monthly-rent?minMonthlyRent=${minRent}&maxMonthlyRent=${maxRent}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("월세 범위별 아파트 전월세 정보 조회 실패:", error);
      throw error;
    }
  },
};
