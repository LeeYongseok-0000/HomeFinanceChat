import { useState } from "react";
import {
  signupPost as signupApi,
  loginPost as loginApi,
} from "../api/memberApi";

// 회원가입 훅
export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signup = async (signupData) => {
    if (loading) {
      throw new Error("이미 처리 중입니다. 잠시 후 다시 시도해주세요.");
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signupApi(signupData);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data || "회원가입 실패";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
};

// 로그인 훅
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (loginData) => {
    if (loading) {
      throw new Error("이미 처리 중입니다. 잠시 후 다시 시도해주세요.");
    }

    setLoading(true);
    setError(null);

    try {
      const result = await loginApi(loginData);
      return result;
    } catch (err) {
      // Spring Security 로그인 실패 시 에러 처리
      if (
        err.response &&
        err.response.data &&
        err.response.data.error === "ERROR_LOGIN"
      ) {
        const errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다.";
        setError(errorMessage);
        throw new Error(errorMessage);
      } else {
        const errorMessage = err.response?.data || "로그인 실패";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
