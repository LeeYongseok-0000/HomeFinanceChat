import { API_SERVER_HOST } from "./backendApi";

// ==================== 아파트 매매 관리 ====================

export const getApartmentSales = async (page = 0, size = 20) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/apartment-sale?page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("아파트 매매 목록 조회 실패:", error);
    throw error;
  }
};

export const createApartmentSale = async (data) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/apartment-sale`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("아파트 매매 등록 실패:", error);
    throw error;
  }
};

export const updateApartmentSale = async (id, data) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/apartment-sale/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("아파트 매매 수정 실패:", error);
    throw error;
  }
};

export const deleteApartmentSale = async (id) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/apartment-sale/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");

    // 응답이 비어있을 수 있으므로 안전하게 처리
    const text = await response.text();
    if (text) {
      return JSON.parse(text);
    } else {
      // 빈 응답인 경우 성공으로 처리
      return {
        success: true,
        message: "아파트 매매 정보가 성공적으로 삭제되었습니다.",
      };
    }
  } catch (error) {
    console.error("아파트 매매 삭제 실패:", error);
    throw error;
  }
};

// ==================== 아파트 전/월세 관리 ====================

export const getApartmentRents = async (page = 0, size = 20) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/apartment-rent?page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("아파트 전/월세 목록 조회 실패:", error);
    throw error;
  }
};

export const createApartmentRent = async (data) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/apartment-rent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("아파트 전/월세 등록 실패:", error);
    throw error;
  }
};

export const updateApartmentRent = async (id, data) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/apartment-rent/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("아파트 전/월세 수정 실패:", error);
    throw error;
  }
};

export const deleteApartmentRent = async (id) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/apartment-rent/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("아파트 전/월세 삭제 실패:", error);
    throw error;
  }
};

// ==================== 단독/다가구 매매 관리 ====================

export const getDetachedHouseSales = async (page = 0, size = 20) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/detached-house-sale?page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("단독/다가구 매매 목록 조회 실패:", error);
    throw error;
  }
};

export const createDetachedHouseSale = async (data) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/detached-house-sale`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("단독/다가구 매매 등록 실패:", error);
    throw error;
  }
};

export const updateDetachedHouseSale = async (id, data) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/detached-house-sale/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("단독/다가구 매매 수정 실패:", error);
    throw error;
  }
};

export const deleteDetachedHouseSale = async (id) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/detached-house-sale/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("단독/다가구 매매 삭제 실패:", error);
    throw error;
  }
};

// ==================== 단독/다가구 전/월세 관리 ====================

export const getDetachedHouseRents = async (page = 0, size = 20) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/detached-house-rent?page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("단독/다가구 전/월세 목록 조회 실패:", error);
    throw error;
  }
};

export const createDetachedHouseRent = async (data) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/detached-house-rent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("단독/다가구 전/월세 등록 실패:", error);
    throw error;
  }
};

export const updateDetachedHouseRent = async (id, data) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/detached-house-rent/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("단독/다가구 전/월세 수정 실패:", error);
    throw error;
  }
};

export const deleteDetachedHouseRent = async (id) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/detached-house-rent/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("단독/다가구 전/월세 삭제 실패:", error);
    throw error;
  }
};

// ==================== 연립/다세대 매매 관리 ====================

export const getRowHouseSales = async (page = 0, size = 20) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/row-house-sale?page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("연립/다세대 매매 목록 조회 실패:", error);
    throw error;
  }
};

export const createRowHouseSale = async (data) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/row-house-sale`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("연립/다세대 매매 등록 실패:", error);
    throw error;
  }
};

export const updateRowHouseSale = async (id, data) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/row-house-sale/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("연립/다세대 매매 수정 실패:", error);
    throw error;
  }
};

export const deleteRowHouseSale = async (id) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/row-house-sale/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("연립/다세대 매매 삭제 실패:", error);
    throw error;
  }
};

// ==================== 연립/다세대 전/월세 관리 ====================

export const getRowHouseRents = async (page = 0, size = 20) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/row-house-rent?page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("연립/다세대 전/월세 목록 조회 실패:", error);
    throw error;
  }
};

export const createRowHouseRent = async (data) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/row-house-rent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("연립/다세대 전/월세 등록 실패:", error);
    throw error;
  }
};

export const updateRowHouseRent = async (id, data) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/row-house-rent/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("연립/다세대 전/월세 수정 실패:", error);
    throw error;
  }
};

export const deleteRowHouseRent = async (id) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/row-house-rent/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("연립/다세대 전/월세 삭제 실패:", error);
    throw error;
  }
};

// ==================== 오피스텔 매매 관리 ====================

export const getOfficeTelSales = async (page = 0, size = 20) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/office-tel-sale?page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("오피스텔 매매 목록 조회 실패:", error);
    throw error;
  }
};

export const createOfficeTelSale = async (data) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/office-tel-sale`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("오피스텔 매매 등록 실패:", error);
    throw error;
  }
};

export const updateOfficeTelSale = async (id, data) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/office-tel-sale/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("오피스텔 매매 수정 실패:", error);
    throw error;
  }
};

export const deleteOfficeTelSale = async (id) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/office-tel-sale/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("오피스텔 매매 삭제 실패:", error);
    throw error;
  }
};

// ==================== 오피스텔 전/월세 관리 ====================

export const getOfficeTelRents = async (page = 0, size = 20) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/office-tel-rent?page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("오피스텔 전/월세 목록 조회 실패:", error);
    throw error;
  }
};

export const createOfficeTelRent = async (data) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/office-tel-rent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("오피스텔 전/월세 등록 실패:", error);
    throw error;
  }
};

export const updateOfficeTelRent = async (id, data) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/office-tel-rent/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("오피스텔 전/월세 수정 실패:", error);
    throw error;
  }
};

export const deleteOfficeTelRent = async (id) => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/office-tel-rent/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("오피스텔 전/월세 삭제 실패:", error);
    throw error;
  }
};

// ==================== 통계 정보 ====================

export const getRealEstateStats = async () => {
  try {
    const response = await fetch(
      `${API_SERVER_HOST}/api/real-estate-admin/stats`
    );
    if (!response.ok) throw new Error("API 호출 실패");
    return await response.json();
  } catch (error) {
    console.error("통계 정보 조회 실패:", error);
    throw error;
  }
};

// ==================== 통합 API 객체 ====================

export const realEstateAdminApiService = {
  // 아파트 매매
  apartmentSale: {
    getAll: getApartmentSales,
    create: createApartmentSale,
    update: updateApartmentSale,
    delete: deleteApartmentSale,
  },

  // 아파트 전/월세
  apartmentRent: {
    getAll: getApartmentRents,
    create: createApartmentRent,
    update: updateApartmentRent,
    delete: deleteApartmentRent,
  },

  // 단독/다가구 매매
  detachedHouseSale: {
    getAll: getDetachedHouseSales,
    create: createDetachedHouseSale,
    update: updateDetachedHouseSale,
    delete: deleteDetachedHouseSale,
  },

  // 단독/다가구 전/월세
  detachedHouseRent: {
    getAll: getDetachedHouseRents,
    create: createDetachedHouseRent,
    update: updateDetachedHouseRent,
    delete: deleteDetachedHouseRent,
  },

  // 연립/다세대 매매
  rowHouseSale: {
    getAll: getRowHouseSales,
    create: createRowHouseSale,
    update: updateRowHouseSale,
    delete: deleteRowHouseSale,
  },

  // 연립/다세대 전/월세
  rowHouseRent: {
    getAll: getRowHouseRents,
    create: createRowHouseRent,
    update: updateRowHouseRent,
    delete: deleteRowHouseRent,
  },

  // 오피스텔 매매
  officeTelSale: {
    getAll: getOfficeTelSales,
    create: createOfficeTelSale,
    update: updateOfficeTelSale,
    delete: deleteOfficeTelSale,
  },

  // 오피스텔 전/월세
  officeTelRent: {
    getAll: getOfficeTelRents,
    create: createOfficeTelRent,
    update: updateOfficeTelRent,
    delete: deleteOfficeTelRent,
  },

  // 통계
  stats: {
    get: getRealEstateStats,
  },
};
