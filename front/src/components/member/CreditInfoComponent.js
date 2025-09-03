import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signupPost } from "../../api/memberApi";
import useModal from "../../hooks/useModal";
import ResultModal from "../common/ResultModal";

const CreditInfoComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // 대출 관련 정보 상태
  const [creditData, setCreditData] = useState({
    age: "",
    homeOwnership: "",
    income: "",
    creditScore: "",
    loanType: "",
    debt: "",
    assets: "",
    employmentType: "",
    workPeriod: "",
    ratePreference: "",
    collateralType: "",
    userCondition: "",
    mainBank: "",
    collateralValue: "",
  });

  const { modalState, showModal, handleModalClose } = useModal();

  // 1단계에서 전달받은 기본 정보
  const { email, nickname, pw } = location.state || {};

  // 기본 정보가 없으면 1단계로 리다이렉트
  if (!email || !nickname || !pw) {
    navigate("/member/join");
    return null;
  }

  const handleCreditChange = (e) => {
    const { name, value } = e.target;
    setCreditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 확인하기 - 신용정보와 함께 회원가입 완료
  const handleConfirm = async () => {
    try {
      const signupData = { email, pw, nickname, ...creditData };
      await signupPost(signupData);
      showModal(
        "회원가입 완료",
        "신용정보와 함께 회원가입이 완료되었습니다! 랜딩페이지로 이동합니다.",
        () => {
          navigate("/");
        }
      );
    } catch (error) {
      const errorMsg = error.response?.data || "회원가입 실패";
      showModal("오류", errorMsg, () => {});
    }
  };

  // 다음에 입력하기 - 기본 회원가입만 완료
  const handleSkip = async () => {
    try {
      const signupData = { email, pw, nickname };
      await signupPost(signupData);
      showModal(
        "회원가입 완료",
        "기본 회원가입이 완료되었습니다! 나중에 마이페이지에서 신용정보를 추가할 수 있습니다. 랜딩페이지로 이동합니다.",
        () => {
          navigate("/");
        }
      );
    } catch (error) {
      const errorMsg = error.response?.data || "회원가입 실패";
      showModal("오류", errorMsg, () => {});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-gray-50/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-gray-200">
        {/* Logo centered */}
        <div className="mb-6 text-center">
          <img
            src="/logo4.png"
            alt="혼집내줘 로고"
            className="h-20 w-auto mx-auto mb-4"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center text-gray-700 mb-2">
            대출 관련 정보 입력
          </h2>
          <p className="text-center text-gray-600">
            더 정확한 대출 추천을 위해 추가 정보를 입력해주세요 (선택사항)
          </p>
        </div>

        {/* 기본 정보 요약 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">기본 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">이메일:</span> {email}
            </div>
            <div>
              <span className="font-medium">닉네임:</span> {nickname}
            </div>
            <div>
              <span className="font-medium">비밀번호:</span> ••••••••
            </div>
          </div>
        </div>

        {/* 신용정보 입력 폼 */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              name="age"
              placeholder="나이"
              value={creditData.age}
              onChange={handleCreditChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
              min="19"
              max="100"
            />
            <select
              name="homeOwnership"
              value={creditData.homeOwnership}
              onChange={handleCreditChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value="">주택 소유 여부</option>
              <option value="무주택자">무주택자</option>
              <option value="생애최초 주택구입자">생애최초 주택구입자</option>
              <option value="기존주택소유자">기존주택소유자</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              name="income"
              placeholder="연소득 (만원)"
              value={creditData.income}
              onChange={handleCreditChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
              min="0"
            />
            <input
              type="number"
              name="creditScore"
              placeholder="신용점수"
              value={creditData.creditScore}
              onChange={handleCreditChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
              min="300"
              max="1000"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="loanType"
              value={creditData.loanType}
              onChange={handleCreditChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value="">대출 유형</option>
              <option value="담보대출">담보대출</option>
              <option value="전세자금대출">전세자금대출</option>
            </select>
            <input
              type="number"
              name="debt"
              placeholder="기존 채무 (만원)"
              value={creditData.debt}
              onChange={handleCreditChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
              min="0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              name="assets"
              placeholder="보유 자산 (만원)"
              value={creditData.assets}
              onChange={handleCreditChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
              min="0"
            />
            <input
              type="number"
              name="collateralValue"
              placeholder="담보가액 (만원)"
              value={creditData.collateralValue}
              onChange={handleCreditChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
              min="0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="employmentType"
              value={creditData.employmentType}
              onChange={handleCreditChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value="">고용 형태</option>
              <option value="정규직">정규직</option>
              <option value="계약직">계약직</option>
              <option value="프리랜서">프리랜서</option>
              <option value="사업자">사업자</option>
            </select>
            <input
              type="number"
              name="workPeriod"
              placeholder="근무 기간 (개월)"
              value={creditData.workPeriod}
              onChange={handleCreditChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
              min="0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="ratePreference"
              value={creditData.ratePreference}
              onChange={handleCreditChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value="">금리 선호도</option>
              <option value="최저금리">최저금리</option>
              <option value="안정성">안정성</option>
              <option value="편의성">편의성</option>
            </select>
            <select
              name="mainBank"
              value={creditData.mainBank}
              onChange={handleCreditChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value="">주거래 은행</option>
              <option value="국민은행">국민은행</option>
              <option value="신한은행">신한은행</option>
              <option value="우리은행">우리은행</option>
              <option value="하나은행">하나은행</option>
              <option value="농협은행">농협은행</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <select
              name="userCondition"
              value={creditData.userCondition}
              onChange={handleCreditChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value="">사용자 조건</option>
              <option value="청년">청년</option>
              <option value="신혼부부">신혼부부</option>
              <option value="무주택자">무주택자</option>
              <option value="기타">기타</option>
            </select>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={handleConfirm}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium hover:shadow-md"
          >
            확인하기
          </button>
          <button
            onClick={handleSkip}
            className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-medium hover:shadow-md"
          >
            다음에 입력하기
          </button>
        </div>

        {/* 결과 모달 */}
        {modalState.isOpen && (
          <ResultModal
            title={modalState.title}
            content={modalState.content}
            callbackFn={handleModalClose}
          />
        )}
      </div>
    </div>
  );
};

export default CreditInfoComponent;
