import axios from "axios";
import { API_SERVER_HOST } from "./backendApi";

const rest_api_key = `b9fa422afee281c2c1977dbedb2cbf9b`; // REST API 키
const redirect_uri = `http://localhost:3000/member/kakao`;

const auth_code_path = `https://kauth.kakao.com/oauth/authorize`;
const access_token_url = `https://kauth.kakao.com/oauth/token`;

export const getKakaoLoginLink = () => {
  const kakaoURL = `${auth_code_path}?client_id=${rest_api_key}&redirect_uri=${redirect_uri}&response_type=code`;
  return kakaoURL;
};

export const getAccessToken = async (authCode) => {
  try {
    console.log("🔍 카카오 액세스 토큰 요청 시작");
    console.log("🔍 인가 코드:", authCode);
    console.log("🔍 리다이렉트 URI:", redirect_uri);

    // URLSearchParams 사용 (form-urlencoded 변환)
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", rest_api_key);
    params.append("redirect_uri", redirect_uri);
    params.append("code", authCode);

    const header = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    console.log("🔍 요청 파라미터:", params.toString());
    console.log("🔍 요청 헤더:", header);

    const res = await axios.post(access_token_url, params, header);
    console.log("✅ 카카오 액세스 토큰 응답:", res.data);

    const accessToken = res.data.access_token;
    return accessToken;
  } catch (error) {
    console.error("❌ 카카오 액세스 토큰 요청 실패:", error);

    if (error.response) {
      console.error("❌ 에러 응답 상태:", error.response.status);
      console.error("❌ 에러 응답 데이터:", error.response.data);
      console.error("❌ 에러 응답 헤더:", error.response.headers);
    }

    // 더 자세한 에러 정보 제공
    if (error.response?.data?.error) {
      const kakaoError = error.response.data;
      console.error("❌ 카카오 에러 코드:", kakaoError.error);
      console.error("❌ 카카오 에러 설명:", kakaoError.error_description);

      // 구체적인 에러 메시지 반환
      throw new Error(
        `카카오 인증 실패: ${kakaoError.error_description || kakaoError.error}`
      );
    }

    throw error;
  }
};

export const getMemberWithAccessToken = async (accessToken) => {
  try {
    console.log("🔍 백엔드에 카카오 회원 정보 요청");
    const res = await axios.get(
      `${API_SERVER_HOST}/api/member/kakao?accessToken=${accessToken}`
    );
    console.log("✅ 백엔드 응답:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ 백엔드 카카오 회원 정보 요청 실패:", error);
    throw error;
  }
};
