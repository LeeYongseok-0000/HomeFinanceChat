import { API_SERVER_HOST } from "./backendApi";

// 오피스텔 전월세 생성 함수
export const createOfficeTelRent = async (officeTelRentData) => {
  try {
    const response = await fetch(`${API_SERVER_HOST}/api/office-tel-rent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(officeTelRentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "오피스텔 전월세 등록에 실패했습니다."
      );
    }

    return await response.json();
  } catch (error) {
    console.error("오피스텔 전월세 등록 실패:", error);
    throw error;
  }
};

// 오피스텔 전월세 관련 API
export const officeTelRentApi = {
  // 모든 오피스텔 전/월세 정보 조회
  getAllOfficeTelRents: async () => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-rent/all`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("오피스텔 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // ID로 오피스텔 전/월세 정보 조회
  getOfficeTelRentById: async (id) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-rent/${id}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("오피스텔 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 검색 조건에 따른 오피스텔 전/월세 정보 조회
  searchOfficeTelRents: async (searchDTO) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-rent/search`,
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
      console.error("오피스텔 전/월세 검색 실패:", error);
      throw error;
    }
  },

  // 시군구로 오피스텔 전/월세 정보 조회
  getOfficeTelRentsBySigungu: async (sigungu) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-rent/sigungu/${sigungu}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("시군구별 오피스텔 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 단지명으로 오피스텔 전/월세 정보 조회
  getOfficeTelRentsByComplexName: async (complexName) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-rent/complex/${complexName}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("단지명별 오피스텔 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 전월세구분으로 오피스텔 전/월세 정보 조회
  getOfficeTelRentsByRentType: async (rentType) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-rent/rent-type/${rentType}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("전월세구분별 오피스텔 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 전용면적 범위로 오피스텔 전/월세 정보 조회
  getOfficeTelRentsByAreaRange: async (minArea, maxArea) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-rent/exclusive-area?minExclusiveArea=${minArea}&maxExclusiveArea=${maxArea}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("전용면적 범위별 오피스텔 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 보증금 범위로 오피스텔 전/월세 정보 조회
  getOfficeTelRentsByDepositRange: async (minDeposit, maxDeposit) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-rent/deposit?minDeposit=${minDeposit}&maxDeposit=${maxDeposit}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("보증금 범위별 오피스텔 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 월세 범위로 오피스텔 전/월세 정보 조회
  getOfficeTelRentsByMonthlyRentRange: async (
    minMonthlyRent,
    maxMonthlyRent
  ) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-rent/monthly-rent?minMonthlyRent=${minMonthlyRent}&maxMonthlyRent=${maxMonthlyRent}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("월세 범위별 오피스텔 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 층 범위로 오피스텔 전/월세 정보 조회
  getOfficeTelRentsByFloorRange: async (minFloor, maxFloor) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-rent/floor?minFloor=${minFloor}&maxFloor=${maxFloor}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("층 범위별 오피스텔 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 건축년도 범위로 오피스텔 전/월세 정보 조회
  getOfficeTelRentsByConstructionYearRange: async (minYear, maxYear) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/office-tel-rent/construction-year?minYear=${minYear}&maxYear=${maxYear}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("건축년도 범위별 오피스텔 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },
};
