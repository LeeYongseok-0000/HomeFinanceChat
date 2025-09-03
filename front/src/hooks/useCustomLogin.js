import { useDispatch, useSelector } from "react-redux";
import { createSearchParams, Navigate, useNavigate } from "react-router-dom";
import { loginPostAsync, logout } from "../slices/loginSlice";
import ResultModal from "../components/common/ResultModal";
import { useState, useEffect } from "react";
import { getCookie } from "../util/cookieUtil";
import { getCurrentUser } from "../util/jwtUtil";

const useCustomLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loginState = useSelector((state) => state.loginSlice); //-------로그인 상태

  // JWT 토큰 기반으로 로그인 상태 체크
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      // console.log("🔍 useCustomLogin - checkLoginStatus 실행");
      const currentUser = getCurrentUser();
      // console.log("🔍 useCustomLogin - currentUser:", currentUser);
      const loginStatus = !!currentUser;
      // console.log("🔍 useCustomLogin - loginStatus:", loginStatus);
      setIsLogin(loginStatus);
    };

    checkLoginStatus();

    // 페이지 로드 시에도 체크
    window.addEventListener("load", checkLoginStatus);

    // 쿠키 변경 감지를 위한 이벤트 리스너
    const handleStorageChange = () => {
      // console.log("🔍 useCustomLogin - storage 이벤트 발생");
      checkLoginStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("load", checkLoginStatus);
    };
  }, []);

  // 토큰 가져오기
  const getToken = () => {
    const memberInfo = getCookie("member");
    return memberInfo?.accessToken;
  };

  const doLogin = async (loginParam) => {
    //----------로그인 함수

    const action = await dispatch(loginPostAsync(loginParam));

    return action.payload;
  };

  const doLogout = () => {
    //---------------로그아웃 함수

    // 쿠키 제거
    document.cookie = "member=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    dispatch(logout());
    setIsLogin(false);
    navigate("/", { replace: true });
  };

  const moveToPath = (path) => {
    //----------------페이지 이동
    navigate({ pathname: path }, { replace: true });
  };

  const moveToLogin = () => {
    //----------------------로그인 페이지로 이동
    navigate({ pathname: "/member/login" }, { replace: true });
  };

  const moveToLoginReturn = () => {
    //----------------------로그인 페이지로 이동 컴포넌트
    return <Navigate replace to="/member/login" />;
  };
  const exceptionHandle = (ex) => {
    console.log("Exception----------------------");

    console.log(ex);

    const errorMsg = ex.response.data.error;

    const errorStr = createSearchParams({ error: errorMsg }).toString();

    if (errorMsg === "REQUIRE_LOGIN") {
      setModal({ open: true, msg: "로그인 해야만 합니다." });
      navigate({ pathname: "/member/login", search: errorStr });
      return;
    }

    if (ex.response.data.error === "ERROR_ACCESSDENIED") {
      setModal({
        open: true,
        msg: "해당 메뉴를 사용할수 있는 권한이 없습니다.",
      });
      navigate({ pathname: "/member/login", search: errorStr });
      return;
    }
  };

  const [modal, setModal] = useState({ open: false, msg: "" });

  return {
    loginState,
    isLogin,
    doLogin,
    doLogout,
    moveToPath,
    moveToLogin,
    moveToLoginReturn,
    exceptionHandle,
    modal,
    token: getToken(),
  };
};

export default useCustomLogin;
