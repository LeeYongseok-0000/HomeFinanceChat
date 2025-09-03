import axios from "axios";
import { API_SERVER_HOST } from "./backendApi";

const client_id = `Kjwnspi5JzUH6B5MIuTk`; // 네이버 클라이언트 ID
const redirect_uri = `http://localhost:3000/member/naver`;

const auth_code_path = `https://nid.naver.com/oauth2.0/authorize`;

export const getNaverLoginLink = () => {
  const naverURL = `${auth_code_path}?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&state=random_state`;
  return naverURL;
};

// 백엔드를 통해 네이버 로그인 처리
export const processNaverCallback = async (code, state) => {
  try {
    console.log("🔍 백엔드에 네이버 로그인 요청");
    const response = await axios.post(
      `${API_SERVER_HOST}/api/auth/naver/callback`,
      {
        code,
        state,
      }
    );
    console.log("✅ 백엔드 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 네이버 로그인 처리 실패:", error);
    throw error;
  }
};

// 백엔드를 통해 회원 정보 조회
export const getMemberWithAccessToken = async (accessToken) => {
  try {
    console.log("🔍 백엔드에 네이버 회원 정보 요청");
    const res = await axios.get(
      `${API_SERVER_HOST}/api/member/naver?accessToken=${accessToken}`
    );
    console.log("✅ 백엔드 응답:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ 백엔드 네이버 회원 정보 요청 실패:", error);
    throw error;
  }
};
