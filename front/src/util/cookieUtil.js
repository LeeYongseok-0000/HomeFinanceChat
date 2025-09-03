import { Cookies } from "react-cookie";

const cookies = new Cookies();

export const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setUTCDate(expires.getUTCDate() + days); //보관기한

  // 객체인 경우 JSON 문자열로 변환
  let cookieValue = value;
  if (typeof value === "object" && value !== null) {
    try {
      cookieValue = JSON.stringify(value);
    } catch (error) {
      console.error("쿠키 데이터 직렬화 실패:", error);
      return false;
    }
  }

  return cookies.set(name, cookieValue, { path: "/", expires: expires });
};

export const getCookie = (name) => {
  return cookies.get(name);
};

export const removeCookie = (name, path = "/") => {
  cookies.remove(name, { path });
};

// 안전한 쿠키 파싱 함수 추가
export const getParsedCookie = (name) => {
  const value = getCookie(name);
  if (!value) return null;

  try {
    // 문자열인 경우 JSON 파싱 시도
    if (typeof value === "string") {
      return JSON.parse(value);
    }
    // 이미 객체인 경우 그대로 반환
    else if (typeof value === "object" && value !== null) {
      return value;
    }
    // 그 외의 경우는 null 반환
    return null;
  } catch (error) {
    console.error("쿠키 파싱 실패:", error);
    return null;
  }
};
