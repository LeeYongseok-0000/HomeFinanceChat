import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getRecommendations as apiGetRecommendations } from "../../api/loanApi";
import { getCreditInfo } from "../../api/memberApi";
import { getCurrentUser } from "../../util/jwtUtil";
import {
  formatAmountToKorean,
  parseKoreanAmount,
  isNumeric,
} from "../../util/currencyUtil";
import CreditScoreModal from "./CreditScoreModal";

const LoanInputComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // useCustomLoan의 상태들을 직접 컴포넌트에 추가
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInputData, setUserInputData] = useState(null);
  const [isUserCreditLoaded, setIsUserCreditLoaded] = useState(false);
  const [hasUserCredit, setHasUserCredit] = useState(false);

  // 기본 빈 값 설정을 useCallback으로 메모이제이션
  const getEmptyFormData = useCallback(
    () => ({
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
    }),
    []
  );

  // 안내창 표시 상태
  const [showCreditInfoAlert, setShowCreditInfoAlert] = useState(true);
  const [showNoCreditAlert, setShowNoCreditAlert] = useState(true);

  // 신용점수 모달 상태
  const [isCreditScoreModalOpen, setIsCreditScoreModalOpen] = useState(false);

  // 현실성 검증 상태
  const [validationMessages, setValidationMessages] = useState([]);

  // 기본 빈 값 설정을 useCallback으로 메모이제이션
  const [formData, setFormData] = useState(userInputData || getEmptyFormData());

  // 컴포넌트 마운트 시 결과만 불러오기 (사용자 입력 데이터는 불러오지 않음)
  useEffect(() => {
    const savedResult = localStorage.getItem("loanRecommendationResult");

    if (savedResult) {
      try {
        setRecommendationResult(JSON.parse(savedResult));
      } catch (e) {
        console.error("저장된 결과 파싱 실패:", e);
      }
    }

    // "다시 입력하기"에서 전달받은 데이터 처리
    if (location.state && location.state.userInputData) {
      setUserInputData(location.state.userInputData);
      setFormData(location.state.userInputData);
    }

    // 사용자 입력 데이터 자동 로딩 제거 - 깨끗한 폼으로 시작
    // const savedUserData = localStorage.getItem("loanUserInputData");
    // if (savedUserData) {
    //   try {
    //     setUserInputData(JSON.parse(savedUserData));
    //   } catch (e) {
    //     console.error("저장된 사용자 데이터 파싱 실패:", e);
    //   }
    // }

    // 자동 로딩 제거 - 사용자가 버튼을 눌러야 정보를 불러옴
    // loadUserCreditInfo();
  }, [location.state]);

  // 현실성 검증 함수들
  const validateRealisticRatio = () => {
    if (!formData.income || !formData.collateralValue) return null;

    const annualIncome = formData.income * 10000; // 만원 → 원
    const propertyValue = formData.collateralValue * 10000; // 만원 → 원

    const ratio = propertyValue / annualIncome;

    if (ratio > 20) {
      return {
        valid: false,
        message: "소득 대비 부동산 가격이 너무 높습니다 (20배 초과)",
        level: "danger",
      };
    } else if (ratio > 15) {
      return {
        valid: false,
        message: "소득 대비 부동산 가격이 높습니다 (15배 초과)",
        level: "warning",
      };
    } else if (ratio > 10) {
      return { valid: true, message: "적정 범위입니다", level: "info" };
    } else {
      return { valid: true, message: "보수적 범위입니다", level: "success" };
    }
  };

  const validateDownPaymentRatio = () => {
    if (!formData.assets || !formData.collateralValue) return null;

    const cashAssets = formData.assets * 10000;
    const propertyValue = formData.collateralValue * 10000;

    const downPaymentRatio = (cashAssets / propertyValue) * 100;

    if (downPaymentRatio < 20) {
      return {
        valid: false,
        message: `자기자금 비율이 너무 낮습니다 (${downPaymentRatio.toFixed(
          1
        )}%)`,
        level: "danger",
      };
    } else if (downPaymentRatio < 30) {
      return {
        valid: false,
        message: `자기자금 비율이 낮습니다 (${downPaymentRatio.toFixed(1)}%)`,
        level: "warning",
      };
    } else {
      return {
        valid: true,
        message: `적정한 자기자금 비율입니다 (${downPaymentRatio.toFixed(1)}%)`,
        level: "success",
      };
    }
  };

  const runAllValidations = () => {
    const validations = [
      validateRealisticRatio(),
      validateDownPaymentRatio(),
    ].filter((v) => v !== null);

    setValidationMessages(validations);

    return validations;
  };

  // 폼 초기화 함수
  const resetForm = () => {
    setFormData(getEmptyFormData());
    setUserInputData(null);
    localStorage.removeItem("loanUserInputData");
    setIsUserCreditLoaded(false);
    setHasUserCredit(false);
    setValidationMessages([]);
  };

  // 사용자의 기존 신용정보를 불러와서 기본값으로 설정
  const loadUserCreditInfo = async () => {
    // 상태 초기화로 중복 방지
    setIsUserCreditLoaded(false);

    try {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.email) {
        const creditInfo = await getCreditInfo(currentUser.email);
        if (creditInfo && creditInfo.creditInfo) {
          // console.log("✅ 사용자 신용정보 불러오기 성공:", creditInfo);

          // null 값을 빈 문자열로 변환하는 헬퍼 함수
          const convertNullToEmpty = (value) => {
            return value === null ? "" : value;
          };

          // 기존 신용정보를 formData에 설정
          const userCreditData = {
            age: convertNullToEmpty(creditInfo.creditInfo?.age),
            homeOwnership: convertNullToEmpty(
              creditInfo.creditInfo?.homeOwnership
            ),
            income: convertNullToEmpty(creditInfo.creditInfo?.income),
            creditScore: convertNullToEmpty(creditInfo.creditInfo?.creditScore),
            loanType: convertNullToEmpty(creditInfo.creditInfo?.loanType),
            debt: convertNullToEmpty(creditInfo.creditInfo?.debt),
            // assets 값을 원래 그대로 사용 (변환 제거)
            assets: convertNullToEmpty(creditInfo.creditInfo?.assets),
            employmentType: convertNullToEmpty(
              creditInfo.creditInfo?.employmentType
            ),
            workPeriod: convertNullToEmpty(creditInfo.creditInfo?.workPeriod),
            ratePreference: convertNullToEmpty(
              creditInfo.creditInfo?.ratePreference
            ),
            collateralType: convertNullToEmpty(
              creditInfo.creditInfo?.collateralType
            ),
            userCondition: convertNullToEmpty(
              creditInfo.creditInfo?.userCondition
            ),
            mainBank: convertNullToEmpty(creditInfo.creditInfo?.mainBank),
            collateralValue: convertNullToEmpty(
              creditInfo.creditInfo?.collateralValue
            ),
          };

          setFormData(userCreditData);

          setIsUserCreditLoaded(true);
          setHasUserCredit(true);
          // console.log("✅ 폼 데이터에 사용자 신용정보 설정 완료");
        } else {
          // 사용자 신용정보가 없는 경우
          setIsUserCreditLoaded(true);
          setHasUserCredit(false);
        }
      } else {
        // console.log("ℹ️ 로그인되지 않은 사용자");
        // setIsUserCreditLoaded(true); // 중복 설정 제거
      }
    } catch (error) {
      // console.error("❌ 사용자 신용정보 불러오기 실패:", error);
      // 에러가 발생해도 폼은 계속 사용 가능하도록 함
      setIsUserCreditLoaded(true);
    }
  };

  // userInputData가 변경될 때 formData 업데이트
  useEffect(() => {
    if (userInputData) {
      // userInputData가 있으면 사용 (이전 대출 추천 결과에서 돌아온 경우)
      setFormData(userInputData);
    }
    // userInputData가 없으면 loadUserCreditInfo에서 설정한 사용자 신용정보가 유지됨
  }, [userInputData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 디버깅 로그 추가
    if (name === "assets") {
      console.log("🔍 assets 입력값:", value, "타입:", typeof value);
    }

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]:
          name.includes("age") ||
          name.includes("income") ||
          name.includes("creditScore") ||
          name.includes("debt") ||
          name.includes("assets") ||
          name.includes("workPeriod") ||
          name.includes("collateralValue")
            ? value === ""
              ? ""
              : parseInt(value)
            : value,
      };

      // 디버깅 로그 추가
      if (name === "assets") {
        console.log(
          "🔍 assets 변환 후:",
          newData.assets,
          "타입:",
          typeof newData.assets
        );
      }

      // 대출 유형이 전세자금대출로 변경되면 담보 유형 초기화
      if (name === "loanType" && value === "전세자금대출") {
        newData.collateralType = "";
      }

      return newData;
    });

    // 실시간 검증 제거
    // setTimeout(() => {
    //   runAllValidations();
    // }, 500);
  };

  // 안내창 닫기 함수
  const closeCreditInfoAlert = () => {
    setShowCreditInfoAlert(false);
  };

  const closeNoCreditAlert = () => {
    setShowNoCreditAlert(false);
  };

  /**
   * 대출 상품 추천 요청
   */
  const getRecommendations = async (userConditions) => {
    setIsLoading(true);
    setError(null);

    // 현재 로그인된 사용자 이메일 추가
    const currentUser = getCurrentUser();
    const userConditionsWithEmail = {
      ...userConditions,
      userEmail: currentUser ? currentUser.email : null,
    };

    // 사용자 입력 데이터 저장
    setUserInputData(userConditionsWithEmail);
    localStorage.setItem(
      "loanUserInputData",
      JSON.stringify(userConditionsWithEmail)
    );

    try {
      const result = await apiGetRecommendations(userConditionsWithEmail);
      setRecommendationResult(result);
      localStorage.setItem("loanRecommendationResult", JSON.stringify(result));
      return result;
    } catch (err) {
      console.error("추천 요청 실패:", err);
      const errorMessage =
        "추천 서비스를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 폼으로 돌아가기
   */
  const backToForm = () => {
    setRecommendationResult(null);
    setError(null);
    localStorage.removeItem("loanRecommendationResult");

    // 이전 입력값 복원
    if (userInputData) {
      setFormData(userInputData);
    }
  };

  /**
   * 에러 초기화
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * 모든 상태 초기화
   */
  const resetAll = () => {
    setRecommendationResult(null);
    setIsLoading(false);
    setError(null);
    setUserInputData(null);
    localStorage.removeItem("loanRecommendationResult");
    localStorage.removeItem("loanUserInputData");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 빈 값 체크 (대출 유형에 따라 필수 필드 다름)
    const baseRequiredFields = [
      "age",
      "homeOwnership",
      "income",
      "creditScore",
      "loanType",
      "employmentType",
      "workPeriod",
      "ratePreference",
      "userCondition",
      "mainBank",
    ];

    // 담보대출인 경우에만 담보 유형 필수
    const requiredFields =
      formData.loanType === "담보대출"
        ? [...baseRequiredFields, "collateralType"]
        : baseRequiredFields;

    const emptyFields = requiredFields.filter((field) => !formData[field]);

    if (emptyFields.length > 0) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    // 빈 문자열을 0으로 변환
    const processedData = {
      ...formData,
      debt: formData.debt === "" ? 0 : formData.debt,
      assets: formData.assets === "" ? 0 : formData.assets,
      collateralValue:
        formData.collateralValue === "" ? 0 : formData.collateralValue,
    };

    // 디버깅 로그 추가
    console.log("🔍 폼 데이터:", formData);
    console.log("🔍 처리된 데이터:", processedData);
    console.log(
      "🔍 assets 값:",
      processedData.assets,
      "타입:",
      typeof processedData.assets
    );

    try {
      await getRecommendations(processedData);
      navigate("/loan/result");
    } catch (error) {
      console.error("추천 요청 실패:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          대출 상품 추천을 위한 정보 입력
        </h2>
        <p className="text-sm text-gray-600">
          <span className="text-red-500">*</span>은 필수 입력 요소입니다
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 사용자 신용정보 로드 상태 표시 */}
        {isUserCreditLoaded &&
          getCurrentUser() &&
          hasUserCredit &&
          showCreditInfoAlert && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-bold">안내:</strong>
              <span className="block sm:inline">
                {" "}
                사용자 신용정보가 로드되었습니다.
              </span>
              <button
                onClick={closeCreditInfoAlert}
                className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:bg-green-200 rounded-r"
              >
                <svg
                  className="fill-current h-6 w-6 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <title>Close</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.759 3.15c.148.167.22.39.19.614z" />
                </svg>
              </button>
            </div>
          )}

        {/* 신용정보가 없는 경우 안내 메시지 */}
        {isUserCreditLoaded &&
          getCurrentUser() &&
          !hasUserCredit &&
          showNoCreditAlert && (
            <div
              className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-bold">안내:</strong>
              <span className="block sm:inline">
                {" "}
                등록된 신용정보가 없습니다. 마이페이지에서 신용정보를
                입력해주세요.
              </span>
              <button
                onClick={closeNoCreditAlert}
                className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:bg-yellow-200 rounded-r"
              >
                <svg
                  className="fill-current h-6 w-6 text-yellow-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <title>Close</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.759 3.15c.148.167.22.39.19.614z" />
                </svg>
              </button>
            </div>
          )}

        {/* 기본 정보 - 나이와 대출 유형 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              나이 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="19"
              max="100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대출 유형 <span className="text-red-500">*</span>
            </label>
            <select
              name="loanType"
              value={formData.loanType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택해주세요</option>
              <option value="담보대출">담보대출</option>
              <option value="전세자금대출">전세자금대출</option>
            </select>
          </div>
        </div>

        {/* 대출 유형별 조건부 입력 요소들 */}
        {formData.loanType && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {formData.loanType === "담보대출"
                ? "담보대출 정보"
                : "전세자금대출 정보"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주택 소유 여부 <span className="text-red-500">*</span>
                </label>
                <select
                  name="homeOwnership"
                  value={formData.homeOwnership}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">선택해주세요</option>
                  <option value="무주택자">무주택자</option>
                  <option value="생애최초 주택구입자">
                    생애최초 주택구입자
                  </option>
                  <option value="기존주택소유자">기존주택소유자</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연소득 (만원) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="income"
                  value={formData.income}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="숫자만 입력해주세요"
                  min="0"
                  required
                />
                {formData.income && (
                  <p className="text-sm text-blue-600 mt-1">
                    {formatAmountToKorean(formData.income)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  신용점수 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="creditScore"
                  value={formData.creditScore}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="300"
                  max="1000"
                  required
                />
                <div className="mt-1 text-right">
                  <button
                    type="button"
                    onClick={() => setIsCreditScoreModalOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer"
                  >
                    점수를 모르세요?
                  </button>
                </div>
              </div>

              {/* 담보대출인 경우에만 담보 유형 표시 */}
              {formData.loanType === "담보대출" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    담보 유형 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="collateralType"
                    value={formData.collateralType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">선택해주세요</option>
                    <option value="수도권 아파트">수도권 아파트</option>
                    <option value="지방 아파트">지방 아파트</option>
                    <option value="단독주택">단독주택</option>
                    <option value="연립/다세대">연립/다세대</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 재무 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기존채무 (만원)
            </label>
            <input
              type="number"
              name="debt"
              value={formData.debt}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="숫자만 입력해주세요"
              min="0"
            />
            {formData.debt && (
              <p className="text-sm text-blue-600 mt-1">
                {formatAmountToKorean(formData.debt)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              현금성자산 (만원)
            </label>
            <input
              type="number"
              name="assets"
              value={formData.assets}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="숫자만 입력해주세요"
              min="0"
            />
            {formData.assets && (
              <p className="text-sm text-blue-600 mt-1">
                {formatAmountToKorean(formData.assets)}
              </p>
            )}
            {/* 디버깅 정보 추가 */}
            {formData.assets && (
              <p className="text-xs text-gray-500 mt-1">
                입력값: {formData.assets}, 변환값:{" "}
                {formatAmountToKorean(formData.assets)}
              </p>
            )}
          </div>
        </div>

        {/* 직장 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              고용 형태 <span className="text-red-500">*</span>
            </label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택해주세요</option>
              <option value="정규직">정규직</option>
              <option value="비정규직">비정규직</option>
              <option value="자영업자">자영업자</option>
              <option value="프리랜서">프리랜서</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              근무 기간 (개월) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="workPeriod"
              value={formData.workPeriod}
              onChange={handleChange}
              placeholder="입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="600"
              required
            />
          </div>
        </div>

        {/* 선호도 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              금리 선호도 <span className="text-red-500">*</span>
            </label>
            <select
              name="ratePreference"
              value={formData.ratePreference}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택해주세요</option>
              <option value="고정금리">고정금리</option>
              <option value="변동금리">변동금리</option>
              <option value="혼합형">혼합형</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사용자 조건 <span className="text-red-500">*</span>
            </label>
            <select
              name="userCondition"
              value={formData.userCondition}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택해주세요</option>
              <option value="청년">청년</option>
              <option value="생애최초">생애최초</option>
              <option value="일반">일반</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주거래 은행 <span className="text-red-500">*</span>
            </label>
            <select
              name="mainBank"
              value={formData.mainBank}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택해주세요</option>
              <option value="신한은행">신한은행</option>
              <option value="국민은행">국민은행</option>
              <option value="카카오뱅크">카카오뱅크</option>
              <option value="우리은행">우리은행</option>
              <option value="농협은행">농협은행</option>
              <option value="하나은행">하나은행</option>
            </select>
          </div>
        </div>

        {/* 담보 정보 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.loanType === "전세자금대출"
              ? "전세보증금 (만원)"
              : "담보 가치 (만원)"}
          </label>
          <input
            type="number"
            name="collateralValue"
            value={formData.collateralValue}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="숫자만 입력해주세요"
            min="0"
          />
          {formData.collateralValue && (
            <p className="text-sm text-blue-600 mt-1">
              {formatAmountToKorean(formData.collateralValue)}
            </p>
          )}
        </div>

        {/* 현실성 검증 버튼 */}
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={runAllValidations}
            className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            📊 현실성 검증하기
          </button>
        </div>

        {/* 현실성 검증 결과 표시 */}
        {validationMessages.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              📊 현실성 검증 결과
            </h4>
            <div className="space-y-2">
              {validationMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md text-sm ${
                    msg.level === "danger"
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : msg.level === "warning"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      : msg.level === "info"
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-green-100 text-green-800 border border-green-200"
                  }`}
                >
                  {msg.level === "danger" && "🚨 "}
                  {msg.level === "warning" && "⚠️ "}
                  {msg.level === "info" && "ℹ️ "}
                  {msg.level === "success" && "✅ "}
                  {msg.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {/* 내 정보 불러오기 버튼 */}
          {getCurrentUser() && (
            <button
              type="button"
              onClick={loadUserCreditInfo}
              className="w-full sm:w-auto bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              내 정보 불러오기
            </button>
          )}

          {/* 대출 상품 추천받기 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {isLoading ? "추천 중..." : "대출 상품 추천받기"}
          </button>
        </div>
      </form>

      {/* 신용점수 모달 */}
      <CreditScoreModal
        isOpen={isCreditScoreModalOpen}
        onClose={() => setIsCreditScoreModalOpen(false)}
      />
    </div>
  );
};

export default LoanInputComponent;
