// src/components/member/JoinComponent.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupPost } from "../../api/memberApi";
import useModal from "../../hooks/useModal";
import ResultModal from "../common/ResultModal";

const JoinComponent = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const { modalState, showModal, handleModalClose } = useModal();

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = (pw) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+~`{}[\]:;"'<>,.?/\\|-]).{8,20}$/.test(
      pw
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isEmailValid(email)) {
      setError("유효한 이메일 형식을 입력해주세요.");
      return;
    }
    if (!isPasswordValid(pw)) {
      setError("비밀번호는 영문, 숫자, 특수문자를 포함해 8~20자여야 합니다.");
      return;
    }
    if (pw !== confirmPw) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 2단계 회원가입으로 이동
    navigate("/member/credit-info", {
      state: { email, pw, nickname },
    });
  };

  return (
    <div className="h-screen w-full flex items-center justify-center px-4 overflow-hidden fixed inset-0 z-50 bg-gradient-to-br from-[#ababaa] via-[#c4c4c4] to-[#9a9a9a]">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
        {/* 배경 장식 요소 */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#ababaa]/20 to-transparent rounded-full blur-xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-[#9a9a9a]/20 to-transparent rounded-full blur-xl"></div>
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="inline-block transform hover:scale-105 transition-transform duration-200"
          >
            <img
              src="/logo4.png"
              alt="혼집내줘 로고"
              className="h-20 w-auto mx-auto drop-shadow-lg"
            />
          </Link>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2 bg-gradient-to-r from-[#ababaa] to-[#9a9a9a] bg-clip-text text-transparent">
          회원가입
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm leading-relaxed">
          기본 정보를 입력하시면 다음 단계에서 대출 관련 정보를 추가로 입력할 수
          있습니다
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 focus:ring-4 focus:ring-[#ababaa]/20 focus:border-[#ababaa] transition-all duration-300 bg-white/80 backdrop-blur-sm"
              required
            />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 focus:ring-4 focus:ring-[#ababaa]/20 focus:border-[#ababaa] transition-all duration-300 bg-white/80 backdrop-blur-sm"
              required
            />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="비밀번호 (영문, 숫자, 특수문자 포함 8~20자)"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 focus:ring-4 focus:ring-[#ababaa]/20 focus:border-[#ababaa] transition-all duration-300 bg-white/80 backdrop-blur-sm"
              required
            />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 focus:ring-4 focus:ring-[#ababaa]/20 focus:border-[#ababaa] transition-all duration-300 bg-white/80 backdrop-blur-sm"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#ababaa] to-[#9a9a9a] hover:from-[#9a9a9a] hover:to-[#8a8a8a] text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            가입하기
          </button>
        </form>
      </div>

      {/* Modal */}
      {modalState.isOpen && (
        <ResultModal
          title={modalState.title}
          content={modalState.content}
          callbackFn={handleModalClose}
        />
      )}
    </div>
  );
};

export default JoinComponent;
