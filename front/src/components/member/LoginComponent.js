// src/components/member/LoginComponent.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import KakaoComponent from "./KakaoComponent";
import NaverComponent from "./NaverComponent";
import GoogleComponent from "./GoogleComponent";
import ResultModal from "../common/ResultModal";
import useCustomLogin from "../../hooks/useCustomLogin";

const initState = {
  email: "",
  pw: "",
};

const LoginComponent = () => {
  const [loginParam, setLoginParam] = useState({ ...initState });
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const { doLogin, moveToPath } = useCustomLogin();
  const [modal, setModal] = useState({ open: false, msg: "" });

  const handleChange = (e) => {
    loginParam[e.target.name] = e.target.value;
    setLoginParam({ ...loginParam });
  };

  const handleClickLogin = () => {
    doLogin(loginParam).then((data) => {
      if (data.error) {
        setModal({ open: true, msg: "이메일과 패스워드를 다시 확인하세요" });
      } else {
        setModal({ open: true, msg: "로그인 성공" });
        moveToPath("/");
      }
    });
  };

  return (
    <div className="h-screen w-full flex overflow-hidden fixed inset-0 z-50 bg-white">
      {/* 왼쪽 세션 - 웰컴 멘트와 로고 (책의 왼쪽 페이지) */}
      <div className="w-1/2 bg-[#ababaa] flex flex-col relative">
        {/* 로고 - 정가운데 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Link to="/" className="inline-block">
              <img
                src="/logo4.png"
                alt="혼집내줘 로고"
                className="h-32 w-auto filter brightness-0 invert"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* 오른쪽 세션 - 로그인 폼 (책의 오른쪽 페이지) */}
      <div className="w-1/2 bg-white flex items-center justify-center px-16 py-12">
        <div className="w-full max-w-md">
          {/* 로그인 제목 */}
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            로그인
          </h2>

          {/* 로그인 폼 */}
          <form className="space-y-6">
            {/* 이메일/아이디 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일 또는 아이디
              </label>
              <input
                name="email"
                type="text"
                value={loginParam.email}
                onChange={handleChange}
                placeholder="이메일 또는 아이디를 입력하세요"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                name="pw"
                type="password"
                value={loginParam.pw}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* 자동 로그인 체크박스 */}
            <div className="flex items-center">
              <input
                id="keepLoggedIn"
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="keepLoggedIn"
                className="ml-2 block text-sm text-gray-700"
              >
                로그인 상태 유지
              </label>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="button"
              onClick={handleClickLogin}
              className="w-full bg-[#ababaa] hover:bg-[#9a9a9a] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 hover:shadow-lg"
            >
              로그인
            </button>
          </form>

          {/* 비밀번호 찾기 링크 */}
          <div className="mt-4 text-center">
            <Link
              to="/member/find-id"
              className="text-gray-500 hover:text-gray-700 hover:underline transition-colors text-sm"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          {/* 소셜 로그인 구분선 */}
          <div className="mt-8 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  또는 소셜 계정으로 로그인
                </span>
              </div>
            </div>
          </div>

          {/* 소셜 로그인 버튼들 - 동그라미로 가로 나열 */}
          <div className="flex justify-center space-x-6">
            <GoogleComponent />
            <KakaoComponent />
            <NaverComponent />
          </div>

          {/* 회원가입 링크 */}
          <div className="mt-8 text-center">
            <Link
              to="/member/join"
              className="text-[#ababaa] hover:text-[#9a9a9a] font-semibold hover:underline transition-colors"
            >
              아직 회원이 아니신가요? 지금 가입하세요
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <ResultModal
          title="알림"
          content={modal.msg}
          callbackFn={() => setModal({ open: false, msg: "" })}
        />
      )}
    </div>
  );
};

export default LoginComponent;
