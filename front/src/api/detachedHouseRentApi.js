import { API_SERVER_HOST } from "./backendApi";

// 단독주택 전월세 생성 함수
export const createDetachedHouseRent = async (detachedHouseRentData) => {
  try {
    const response = await fetch(`${API_SERVER_HOST}/api/detached-house-rent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(detachedHouseRentData),
    });

    if (!response.ok) {
      let errorMessage = "단독주택 전월세 등록에 실패했습니다.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 읽기 시도
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          // 모든 파싱 실패 시 기본 메시지 사용
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("단독주택 전월세 등록 실패:", error);
    throw error;
  }
};

// 단독주택 전월세 관련 API
export const detachedHouseRentApi = {
  // 모든 단독/다가구 전/월세 정보 조회
  getAllDetachedHouseRents: async () => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-rent/all`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("단독/다가구 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // ID로 단독/다가구 전/월세 정보 조회
  getDetachedHouseRentById: async (id) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-rent/${id}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("단독/다가구 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 검색 조건에 따른 단독/다가구 전/월세 정보 조회
  searchDetachedHouseRents: async (searchDTO) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-rent/search`,
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
      console.error("단독/다가구 전/월세 검색 실패:", error);
      throw error;
    }
  },

  // 시군구로 단독/다가구 전/월세 정보 조회
  getDetachedHouseRentsBySigungu: async (sigungu) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-rent/sigungu/${sigungu}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("시군구별 단독/다가구 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 주택유형으로 단독/다가구 전/월세 정보 조회
  getDetachedHouseRentsByHousingType: async (housingType) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-rent/housing-type/${housingType}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("주택유형별 단독/다가구 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 도로조건으로 단독/다가구 전/월세 정보 조회
  getDetachedHouseRentsByRoadCondition: async (roadCondition) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-rent/road-condition/${roadCondition}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("도로조건별 단독/다가구 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 전월세구분으로 단독/다가구 전/월세 정보 조회
  getDetachedHouseRentsByRentType: async (rentType) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-rent/rent-type/${rentType}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("전월세구분별 단독/다가구 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 계약면적 범위로 단독/다가구 전/월세 정보 조회
  getDetachedHouseRentsByContractAreaRange: async (
    minContractArea,
    maxContractArea
  ) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-rent/contract-area?minContractArea=${minContractArea}&maxContractArea=${maxContractArea}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error(
        "계약면적 범위별 단독/다가구 전/월세 정보 조회 실패:",
        error
      );
      throw error;
    }
  },

  // 보증금 범위로 단독/다가구 전/월세 정보 조회
  getDetachedHouseRentsByDepositRange: async (minDeposit, maxDeposit) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-rent/deposit?minDeposit=${minDeposit}&maxDeposit=${maxDeposit}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("보증금 범위별 단독/다가구 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 월세 범위로 단독/다가구 전/월세 정보 조회
  getDetachedHouseRentsByMonthlyRentRange: async (
    minMonthlyRent,
    maxMonthlyRent
  ) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-rent/monthly-rent?minMonthlyRent=${minMonthlyRent}&maxMonthlyRent=${maxMonthlyRent}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error("월세 범위별 단독/다가구 전/월세 정보 조회 실패:", error);
      throw error;
    }
  },

  // 건축년도 범위로 단독/다가구 전/월세 정보 조회
  getDetachedHouseRentsByConstructionYearRange: async (minYear, maxYear) => {
    try {
      const response = await fetch(
        `${API_SERVER_HOST}/api/detached-house-rent/construction-year?minYear=${minYear}&maxYear=${maxYear}`
      );
      if (!response.ok) throw new Error("API 호출 실패");
      return await response.json();
    } catch (error) {
      console.error(
        "건축년도 범위별 단독/다가구 전/월세 정보 조회 실패:",
        error
      );
      throw error;
    }
  },
};
