import axios from "axios";
import { getCookie, setCookie } from "./cookieUtil";
import { API_SERVER_HOST } from "../api/backendApi";

// JWT 토큰에서 사용자 정보 추출
export const decodeJWT = (token) => {
  try {
    if (!token) return null;

    // JWT는 3부분으로 구성: header.payload.signature
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    // console.error("JWT 디코딩 실패:", error);
    return null;
  }
};

// 현재 로그인된 사용자 정보 가져오기
export const getCurrentUser = () => {
  const memberInfo = getCookie("member");
  // console.log("🔍 getCurrentUser - memberInfo:", memberInfo);

  if (!memberInfo) {
    // console.log("❌ memberInfo가 없음");
    return null;
  }

  try {
    const member =
      typeof memberInfo === "string" ? JSON.parse(memberInfo) : memberInfo;
    // console.log("🔍 getCurrentUser - parsed member:", member);

    if (!member.accessToken) {
      // console.log("❌ accessToken이 없음");
      return null;
    }

    const decoded = decodeJWT(member.accessToken);
    // console.log("🔍 getCurrentUser - decoded JWT:", decoded);
    return decoded;
  } catch (error) {
    // console.error("사용자 정보 파싱 실패:", error);
    return null;
  }
};

const jwtAxios = axios.create();

const refreshJWT = async (accessToken, refreshToken) => {
  const host = API_SERVER_HOST; //localhost:8080

  try {
    const res = await axios.get(
      `${host}/api/member/refresh?refreshToken=${refreshToken}`
    );

    // console.log("----------------------");
    // console.log("토큰 갱신 응답:", res.data);

    // 백엔드에서 새로운 토큰을 반환하는 경우
    if (res.data && res.data.accessToken && res.data.refreshToken) {
      return {
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      };
    }

    // 백엔드에서 새로운 토큰을 반환하지 않는 경우 (현재 상황)
    // 기존 토큰을 그대로 사용하되, 만료 시간을 확인
    const decoded = decodeJWT(accessToken);
    if (decoded && decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime < decoded.exp) {
        // 토큰이 아직 유효한 경우
        return {
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
      }
    }

    // 토큰이 만료된 경우 에러 발생
    throw new Error("토큰이 만료되었습니다");
  } catch (error) {
    // console.error("토큰 갱신 실패:", error);
    throw error;
  }
};

//before request
const beforeReq = async (config) => {
  // console.log("🔍 before request.............");
  // console.log("요청 URL:", config.url);
  // console.log("요청 메서드:", config.method);

  const memberInfo = getCookie("member");
  // console.log("🔍 memberInfo:", memberInfo);

  if (!memberInfo) {
    // console.log("❌ Member NOT FOUND");
    return Promise.reject({ response: { data: { error: "REQUIRE_LOGIN" } } });
  }

  let member;
  try {
    member =
      typeof memberInfo === "string" ? JSON.parse(memberInfo) : memberInfo;
  } catch (error) {
    // console.log("❌ Member JSON 파싱 실패:", error);
    return Promise.reject({ response: { data: { error: "REQUIRE_LOGIN" } } });
  }

  const { accessToken, refreshToken } = member;
  // console.log("🔍 accessToken:", accessToken);

  if (!accessToken) {
    // console.log("❌ AccessToken NOT FOUND");
    return Promise.reject({ response: { data: { error: "REQUIRE_LOGIN" } } });
  }

  // 토큰 만료 여부 확인
  const decoded = decodeJWT(accessToken);
  if (decoded && decoded.exp) {
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime >= decoded.exp) {
      // console.log("🔍 토큰이 만료됨, 갱신 시도...");

      if (refreshToken) {
        try {
          const result = await refreshJWT(accessToken, refreshToken);
          // console.log("🔍 beforeReq - 토큰 갱신 성공");

          // 쿠키 업데이트
          const updatedMemberInfo = {
            ...member,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          };
          setCookie("member", JSON.stringify(updatedMemberInfo), 1);

          // 새로운 토큰으로 헤더 설정
          config.headers.Authorization = `Bearer ${result.accessToken}`;
          // console.log("✅ 새로운 토큰으로 Authorization 헤더 설정 완료");
          return config;
        } catch (error) {
          // console.error("🔍 beforeReq - 토큰 갱신 실패:", error);
          setCookie("member", "", 0);
          return Promise.reject({
            response: { data: { error: "REQUIRE_LOGIN" } },
          });
        }
      }
    }
  }

  // Authorization (허가)헤더 처리
  config.headers.Authorization = `Bearer ${accessToken}`;
  // console.log("✅ Authorization 헤더 설정 완료");

  return config;
};

//fail request
const requestFail = (err) => {
  // console.log("request error............");

  return Promise.reject(err);
};

//before return response
const beforeRes = async (res) => {
  // console.log("before return response...........");
  // console.log(res);

  //'ERROR_ACCESS_TOKEN'
  const data = res.data;

  if (data && data.error === "ERROR_ACCESS_TOKEN") {
    const memberCookieValue = getCookie("member");

    if (!memberCookieValue || !memberCookieValue.refreshToken) {
      // console.log("RefreshToken NOT FOUND");
      setCookie("member", "", 0);
      return Promise.reject({ response: { data: { error: "REQUIRE_LOGIN" } } });
    }

    try {
      const result = await refreshJWT(
        memberCookieValue.accessToken,
        memberCookieValue.refreshToken
      );
      // console.log("refreshJWT RESULT", result);

      // 새로운 객체 생성하여 쿠키 업데이트
      const updatedMemberInfo = {
        ...memberCookieValue,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      };

      setCookie("member", JSON.stringify(updatedMemberInfo), 1);

      //원래의 호출
      const originalRequest = res.config;

      originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;
      // console.log("🔍 beforeRes - 사용할 새로운 토큰:", result.accessToken);
      // console.log(
      //   "🔍 beforeRes - Authorization 헤더:",
      //   originalRequest.headers.Authorization
      // );

      // 새로운 토큰 디코딩하여 내용 확인
      const decodedToken = decodeJWT(result.accessToken);
      // console.log("🔍 beforeRes - 디코딩된 새로운 토큰 내용:", decodedToken);

      return await axios(originalRequest);
    } catch (error) {
      // console.error("토큰 갱신 실패:", error);
      setCookie("member", "", 0);
      return Promise.reject({ response: { data: { error: "REQUIRE_LOGIN" } } });
    }
  }
  return res;
};

//fail response
const responseFail = (err) => {
  // console.log("response fail error.............");

  // 401 에러 처리
  if (err.response && err.response.status === 401) {
    // console.log("401 Unauthorized - 토큰 만료");

    // 토큰 갱신 시도
    const memberCookieValue = getCookie("member");
    if (memberCookieValue && memberCookieValue.refreshToken) {
      // console.log("토큰 갱신 시도...");
      return refreshJWT(
        memberCookieValue.accessToken,
        memberCookieValue.refreshToken
      )
        .then((result) => {
          // console.log("토큰 갱신 성공, 쿠키 업데이트");

          // 새로운 객체 생성하여 쿠키 업데이트
          const updatedMemberInfo = {
            ...memberCookieValue,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          };

          setCookie("member", JSON.stringify(updatedMemberInfo), 1);

          // 원래 요청 재시도
          const originalRequest = err.config;
          originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;
          // console.log("원래 요청 재시도:", originalRequest.url);
          // console.log("🔍 사용할 새로운 토큰:", result.accessToken);
          // console.log(
          //   "🔍 Authorization 헤더:",
          //   originalRequest.headers.Authorization
          // );

          // 새로운 토큰 디코딩하여 내용 확인
          const decodedToken = decodeJWT(result.accessToken);
          // console.log("🔍 디코딩된 새로운 토큰 내용:", decodedToken);

          return axios(originalRequest);
        })
        .catch((refreshError) => {
          // console.error("토큰 갱신 실패:", refreshError);
          setCookie("member", "", 0);
          return Promise.reject({
            response: { data: { error: "REQUIRE_LOGIN" } },
          });
        });
    } else {
      // console.log("리프레시 토큰 없음");
      setCookie("member", "", 0);
      return Promise.reject({ response: { data: { error: "REQUIRE_LOGIN" } } });
    }
  }

  return Promise.reject(err);
};

jwtAxios.interceptors.request.use(beforeReq, requestFail);

jwtAxios.interceptors.response.use(beforeRes, responseFail);

export default jwtAxios;
