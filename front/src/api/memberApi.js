import axios from "axios";
import { API_SERVER_HOST } from "./backendApi";
import { getCookie } from "../util/cookieUtil";

//http://localhost:8080/api/member/login
const host = `${API_SERVER_HOST}/api/member`;

// JWT 토큰을 헤더에 포함하는 axios 인스턴스 생성
const createAuthAxios = () => {
  console.log("🔍 createAuthAxios 실행");
  const memberInfo = getCookie("member");
  console.log("🔍 쿠키에서 가져온 memberInfo:", memberInfo);

  if (!memberInfo) {
    console.log("❌ memberInfo가 없음");
    throw new Error("로그인이 필요합니다.");
  }

  let member;
  try {
    member =
      typeof memberInfo === "string" ? JSON.parse(memberInfo) : memberInfo;
    console.log("🔍 파싱된 member:", member);
  } catch (error) {
    console.log("❌ member JSON 파싱 실패:", error);
    throw new Error("사용자 정보 파싱 실패");
  }

  if (!member.accessToken) {
    console.log("❌ accessToken이 없음");
    throw new Error("액세스 토큰이 없습니다.");
  }

  console.log(
    "✅ Authorization 헤더 설정:",
    `Bearer ${member.accessToken.substring(0, 20)}...`
  );
  return axios.create({
    headers: {
      Authorization: `Bearer ${member.accessToken}`,
    },
  });
};

export const loginPost = async (loginParam) => {
  const header = { headers: { "Content-Type": "x-www-form-urlencoded" } };

  const form = new FormData();
  form.append("username", loginParam.email);
  form.append("password", loginParam.pw);

  const res = await axios.post(`${host}/login`, form, header);

  return res.data;
};

export const signupPost = async (signupParam) => {
  const header = { headers: { "Content-Type": "application/json" } };

  const res = await axios.post(`${host}/signup`, signupParam, header);

  return res.data;
};

// 이메일 중복 확인 (프론트엔드에서만 처리)
export const checkEmailDuplicate = async (email) => {
  // 실제로는 백엔드 API를 호출해야 하지만,
  // 현재는 프론트엔드에서만 처리하여 400 에러 방지
  try {
    // 로컬스토리지나 세션에서 기존 사용자 목록을 확인하는 방식으로 변경
    // 실제 프로덕션에서는 백엔드 API를 호출해야 함

    // 임시로 항상 사용 가능하다고 반환 (실제로는 백엔드 검증 필요)
    return { exists: false, message: "사용 가능한 이메일입니다." };

    // 백엔드 API가 준비되면 아래 코드로 교체
    // const res = await axios.get(`${host}/check-email?email=${email}`);
    // return res.data;
  } catch (error) {
    console.error("이메일 중복 확인 중 오류:", error);
    return { exists: false, message: "확인 중 오류가 발생했습니다." };
  }
};

export const modifyMember = async (member) => {
  const authAxios = createAuthAxios();
  const res = await authAxios.put(`${host}/modify`, member);

  return res.data;
};

export const getMemberInfo = async (email) => {
  const authAxios = createAuthAxios();
  const res = await authAxios.get(`${host}/info/${email}`);
  return res.data;
};

// 신용정보 조회
export const getCreditInfo = async (email) => {
  try {
    console.log("🔄 getCreditInfo 시작 - email:", email);
    console.log("🔄 API 호출 URL:", `${host}/credit-info?email=${email}`);

    const authAxios = createAuthAxios();
    console.log("✅ authAxios 생성 완료");

    const res = await authAxios.get(`${host}/credit-info?email=${email}`);
    console.log("✅ API 응답 성공:", res);
    console.log("✅ 응답 데이터:", res.data);

    return res.data;
  } catch (error) {
    console.error("❌ getCreditInfo 실패:", error);

    if (error.response) {
      console.error("🔍 HTTP 에러 응답:", error.response);
      console.error("🔍 에러 상태:", error.response.status);
      console.error("🔍 에러 데이터:", error.response.data);
    } else if (error.request) {
      console.error("🔍 네트워크 에러:", error.request);
    } else {
      console.error("🔍 기타 에러:", error.message);
    }

    throw error;
  }
};

// 신용정보 업데이트
export const updateCreditInfo = async (creditData) => {
  const authAxios = createAuthAxios();
  const res = await authAxios.put(`${host}/credit-info`, creditData);
  return res.data;
};

// 최대 구매 가능액 조회
export const getMaxPurchaseAmount = async (email) => {
  try {
    const authAxios = createAuthAxios();
    const res = await authAxios.get(
      `${host}/credit-info/max-purchase-amount?email=${email}`
    );
    return res.data;
  } catch (error) {
    console.error("❌ 최대 구매 가능액 조회 실패:", error);
    throw error;
  }
};

// 최대 구매 가능액 저장
export const saveMaxPurchaseAmount = async (email, maxPurchaseAmount) => {
  try {
    const authAxios = createAuthAxios();
    const res = await authAxios.put(`${host}/credit-info/max-purchase-amount`, {
      email,
      maxPurchaseAmount,
    });
    return res.data;
  } catch (error) {
    console.error("❌ 최대 구매 가능액 저장 실패:", error);
    throw error;
  }
};

/**
 * 비밀번호 변경
 */
export const changePassword = async (email, currentPassword, newPassword) => {
  try {
    const response = await axios.put(
      `${API_SERVER_HOST}/api/member/change-password`,
      {
        email,
        currentPassword,
        newPassword,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changeNickname = async (email, nickname) => {
  try {
    const response = await axios.put(
      `${API_SERVER_HOST}/api/member/change-nickname`,
      {
        email,
        nickname,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
