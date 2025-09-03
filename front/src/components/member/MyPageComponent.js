import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCustomLogin from "../../hooks/useCustomLogin";
import {
  getCreditInfo,
  updateCreditInfo,
  changePassword,
  changeNickname,
} from "../../api/memberApi";
import { getLikedProperties, getMyProperties } from "../../api/propertyApi";
import { getMyReviewRequests } from "../../api/propertyReviewRequestApi";
import useModal from "../../hooks/useModal";
import ResultModal from "../common/ResultModal";
import { getCurrentUser } from "../../util/jwtUtil";
import { formatAmountToKorean } from "../../util/currencyUtil";

const MyPageComponent = () => {
  const navigate = useNavigate();
  const { doLogout } = useCustomLogin();
  const { modalState, showModal, handleModalClose } = useModal();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingNickname, setIsChangingNickname] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [nicknameData, setNicknameData] = useState({
    newNickname: "",
  });
  const [userInfo, setUserInfo] = useState({
    nickname: "",
    social: false,
  });
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
    maxPurchaseAmount: null, // 최대 구매 가능액 추가
  });

  // 현재 로그인된 사용자 이메일 (실제로는 JWT에서 추출)
  const [currentEmail, setCurrentEmail] = useState("");

  // 좋아요한 매물 관련 state
  const [likedProperties, setLikedProperties] = useState([]);
  const [likedPropertiesLoading, setLikedPropertiesLoading] = useState(false);
  const [likedPropertiesError, setLikedPropertiesError] = useState(false);

  // 검수 요청 관련 state
  const [reviewRequests, setReviewRequests] = useState([]);
  const [reviewRequestsLoading, setReviewRequestsLoading] = useState(false);
  const [reviewRequestsError, setReviewRequestsError] = useState(false);

  // 본인 작성 매물 관련 state
  const [myProperties, setMyProperties] = useState([]);
  const [myPropertiesLoading, setMyPropertiesLoading] = useState(false);
  const [myPropertiesError, setMyPropertiesError] = useState(false);

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // JWT에서 사용자 정보 추출
        const currentUser = getCurrentUser();
        console.log("🔍 현재 사용자 정보:", currentUser);

        if (currentUser && currentUser.email) {
          setCurrentEmail(currentUser.email);
          console.log("✅ 사용자 이메일 설정:", currentUser.email);

          // 토큰 정보 출력
          const memberInfo = JSON.parse(localStorage.getItem("member") || "{}");
          console.log("🔍 멤버 정보:", memberInfo);

          // 각 데이터 로드를 개별적으로 처리하여 하나가 실패해도 다른 것은 계속 로드
          try {
            await loadCreditInfo(currentUser.email);
          } catch (error) {
            console.error("❌ 신용정보 로드 실패:", error);
          }

          try {
            await loadLikedProperties(currentUser.email);
          } catch (error) {
            console.error("❌ 좋아요한 매물 로드 실패:", error);
          }

          try {
            await loadReviewRequests(currentUser.email);
          } catch (error) {
            console.error("❌ 검수 요청 로드 실패:", error);
          }

          try {
            await loadMyProperties(currentUser.email);
          } catch (error) {
            console.error("❌ 본인 작성 매물 로드 실패:", error);
          }
        } else {
          console.error("❌ 사용자 정보가 없습니다");
          navigate("/member/login");
        }
      } catch (error) {
        console.error("❌ 컴포넌트 초기화 실패:", error);
        navigate("/member/login");
      }
    };

    initializeComponent();
  }, [navigate]);

  // null 값을 빈 문자열로 변환하는 헬퍼 함수
  const convertNullToEmpty = (value) => {
    return value === null ? "" : value;
  };

  const formatValue = (value, fieldName) => {
    // null, undefined, 빈 문자열, 공백만 있는 경우 모두 처리
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (typeof value === "string" && value.trim() === "")
    ) {
      // 필드별로 더 구체적인 메시지 표시
      switch (fieldName) {
        case "age":
          return "나이 미입력";
        case "income":
          return "연소득 미입력";
        case "creditScore":
          return "신용점수 미입력";
        case "loanType":
          return "대출유형 미선택";
        case "homeOwnership":
          return "주택소유여부 미선택";
        case "debt":
          return "기존채무 미입력";
        case "assets":
          return "보유자산 미입력";
        case "employmentType":
          return "고용형태 미선택";
        case "workPeriod":
          return "근무기간 미입력";
        case "ratePreference":
          return "금리선호도 미선택";
        case "userCondition":
          return "사용자조건 미선택";
        case "mainBank":
          return "주거래은행 미선택";
        case "collateralValue":
          return "담보가액 미입력";
        case "maxPurchaseAmount":
          return "미입력";
        default:
          return "미입력";
      }
    }

    // 각 필드별로 적절한 단위 추가
    switch (fieldName) {
      case "age":
        return `${value}세`;
      case "income":
      case "debt":
      case "assets":
      case "collateralValue":
        return `${value}만원`;
      case "creditScore":
        return `${value}점`;
      case "workPeriod":
        return `${value}개월`;
      case "maxPurchaseAmount":
        return `${value}만원`;
      default:
        return value;
    }
  };

  // 신용점수 등급 계산
  const getCreditGrade = (score) => {
    if (!score || score === "") return "미입력";
    if (score >= 800) return "A+";
    if (score >= 700) return "A";
    if (score >= 600) return "B+";
    if (score >= 500) return "B";
    if (score >= 400) return "C+";
    if (score >= 300) return "C";
    return "D";
  };

  // 신용점수 등급별 색상
  const getCreditGradeColor = (score) => {
    if (!score || score === "") return "bg-gray-100 text-gray-600";
    if (score >= 800) return "bg-green-100 text-green-800";
    if (score >= 700) return "bg-blue-100 text-blue-800";
    if (score >= 600) return "bg-yellow-100 text-yellow-800";
    if (score >= 500) return "bg-orange-100 text-orange-800";
    if (score >= 400) return "bg-red-100 text-red-800";
    return "bg-red-200 text-red-900";
  };

  // 소득 등급 계산
  const getIncomeGrade = (income) => {
    if (!income || income === "") return "미입력";
    if (income >= 10000) return "고소득";
    if (income >= 5000) return "중상위소득";
    if (income >= 3000) return "중소득";
    if (income >= 1000) return "중하위소득";
    return "저소득";
  };

  // 로그아웃 함수
  const handleLogout = () => {
    doLogout();
    navigate("/main");
  };

  const loadCreditInfo = async (email) => {
    try {
      const data = await getCreditInfo(email);

      if (data) {
        // 사용자 기본 정보 설정
        if (data.nickname !== undefined) {
          setUserInfo({
            nickname: data.nickname || "",
            social: data.social || false,
          });
        }

        // 신용정보 설정
        if (data.creditInfo) {
          const credit = data.creditInfo;

          setCreditData({
            age: convertNullToEmpty(credit.age),
            homeOwnership: convertNullToEmpty(credit.homeOwnership),
            income: convertNullToEmpty(credit.income),
            creditScore: convertNullToEmpty(credit.creditScore),
            loanType: convertNullToEmpty(credit.loanType),
            debt: convertNullToEmpty(credit.debt),
            assets: convertNullToEmpty(credit.assets),
            employmentType: convertNullToEmpty(credit.employmentType),
            workPeriod: convertNullToEmpty(credit.workPeriod),
            ratePreference: convertNullToEmpty(credit.ratePreference),
            collateralType: convertNullToEmpty(credit.collateralType),
            userCondition: convertNullToEmpty(credit.userCondition),
            mainBank: convertNullToEmpty(credit.mainBank),
            collateralValue: convertNullToEmpty(credit.collateralValue),
            maxPurchaseAmount: credit.maxPurchaseAmount, // 최대 구매 가능액 설정
          });
        }
      }
    } catch (error) {
      console.error("❌ 사용자 정보 및 신용정보 로드 실패:", error);

      // 에러 상세 정보 출력
      if (error.response) {
        // 토큰 관련 에러인 경우
        if (
          error.response.status === 401 ||
          (error.response.data && error.response.data.error === "REQUIRE_LOGIN")
        ) {
          navigate("/member/login");
          return;
        }
      }

      // 네트워크 에러나 기타 에러
      if (
        error.message &&
        (error.message.includes("토큰") || error.message.includes("로그인"))
      ) {
        navigate("/member/login");
        return;
      }

      // 기타 에러는 사용자에게 알림
      showModal(
        "오류",
        "사용자 정보를 불러오는데 실패했습니다. 다시 시도해주세요.",
        () => {}
      );
    }
  };

  const loadLikedProperties = async (email) => {
    try {
      setLikedPropertiesLoading(true);
      setLikedPropertiesError(false);
      console.log("🔍 좋아요한 매물 로드 시작 - 이메일:", email);

      if (!email || email.trim() === "") {
        console.error("❌ 이메일이 비어있습니다");
        setLikedPropertiesError(true);
        setLikedProperties([]);
        return;
      }

      const data = await getLikedProperties({ memberEmail: email });
      console.log("✅ 좋아요한 매물 로드 성공:", data);
      setLikedProperties(data || []);
    } catch (error) {
      console.error("❌ 좋아요한 매물 로드 실패:", error);
      setLikedPropertiesError(true);
      if (error.response) {
        console.error("❌ 응답 상태:", error.response.status);
        console.error("❌ 응답 데이터:", error.response.data);

        // 500 에러인 경우 사용자에게 알림
        if (error.response.status === 500) {
          console.warn(
            "⚠️ 서버 내부 오류로 좋아요한 매물을 불러올 수 없습니다."
          );
        }
      }
      setLikedProperties([]);
    } finally {
      setLikedPropertiesLoading(false);
    }
  };

  const loadReviewRequests = async (email) => {
    try {
      setReviewRequestsLoading(true);
      setReviewRequestsError(false);
      console.log("🔍 검수 요청 로드 시작 - 이메일:", email);

      if (!email || email.trim() === "") {
        console.error("❌ 이메일이 비어있습니다");
        setReviewRequestsError(true);
        setReviewRequests([]);
        return;
      }

      const data = await getMyReviewRequests(email);
      console.log("✅ 검수 요청 로드 성공:", data);
      setReviewRequests(data || []);
    } catch (error) {
      console.error("❌ 검수 요청 로드 실패:", error);
      setReviewRequestsError(true);
      if (error.response) {
        console.error("❌ 응답 상태:", error.response.status);
        console.error("❌ 응답 데이터:", error.response.data);

        // 500 에러인 경우 사용자에게 알림
        if (error.response.status === 500) {
          console.warn("⚠️ 서버 내부 오류로 검수 요청을 불러올 수 없습니다.");
        }
      }
      setReviewRequests([]);
    } finally {
      setReviewRequestsLoading(false);
    }
  };

  const loadMyProperties = async (email) => {
    try {
      setMyPropertiesLoading(true);
      setMyPropertiesError(false);
      console.log("🔍 본인 작성 매물 로드 시작 - 이메일:", email);

      if (!email || email.trim() === "") {
        console.error("❌ 이메일이 비어있습니다");
        setMyPropertiesError(true);
        setMyProperties([]);
        return;
      }

      const data = await getMyProperties({ memberEmail: email });
      console.log("✅ 본인 작성 매물 로드 성공:", data);
      setMyProperties(data || []);
    } catch (error) {
      console.error("❌ 본인 작성 매물 로드 실패:", error);
      setMyPropertiesError(true);
      if (error.response) {
        console.error("❌ 응답 상태:", error.response.status);
        console.error("❌ 응답 데이터:", error.response.data);

        // 500 에러인 경우 사용자에게 알림
        if (error.response.status === 500) {
          console.warn(
            "⚠️ 서버 내부 오류로 본인 작성 매물을 불러올 수 없습니다."
          );
        }
      }
      setMyProperties([]);
    } finally {
      setMyPropertiesLoading(false);
    }
  };

  const handleCreditChange = (e) => {
    const { name, value } = e.target;

    setCreditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const updateData = { email: currentEmail, ...creditData };
      await updateCreditInfo(updateData);
      showModal("성공", "신용정보가 업데이트되었습니다.", () => {
        setIsEditing(false);
      });
    } catch (error) {
      const errorMsg = error.response?.data || "신용정보 업데이트 실패";
      showModal("오류", errorMsg, () => {});
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // 원래 데이터로 복원
    loadCreditInfo(currentEmail);
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();

    // 비밀번호 유효성 검사
    if (passwordData.newPassword.length < 6) {
      showModal("오류", "새 비밀번호는 최소 6자 이상이어야 합니다.", () => {});
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showModal(
        "오류",
        "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
        () => {}
      );
      return;
    }

    try {
      await changePassword(
        currentEmail,
        passwordData.currentPassword,
        passwordData.newPassword
      );
      showModal("성공", "비밀번호가 성공적으로 변경되었습니다.", () => {
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      });
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "비밀번호 변경에 실패했습니다.";
      showModal("오류", errorMsg, () => {});
    }
  };

  const handlePasswordChangeCancel = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleNicknameChange = (e) => {
    const { name, value } = e.target;
    setNicknameData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNicknameChangeSubmit = async (e) => {
    e.preventDefault();

    // 닉네임 유효성 검사
    if (nicknameData.newNickname.length < 2) {
      showModal("오류", "닉네임은 최소 2자 이상이어야 합니다.", () => {});
      return;
    }

    try {
      await changeNickname(currentEmail, nicknameData.newNickname);

      // 닉네임 변경 모달 즉시 닫기
      setIsChangingNickname(false);
      setNicknameData({ newNickname: "" });

      // 사용자 정보 새로고침
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUserInfo((prev) => ({
          ...prev,
          nickname: nicknameData.newNickname,
        }));
      }

      // 성공 메시지 모달 표시
      showModal("성공", "닉네임이 성공적으로 변경되었습니다.", () => {});
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "닉네임 변경에 실패했습니다.";
      showModal("오류", errorMsg, () => {});
    }
  };

  const handleNicknameChangeCancel = () => {
    setIsChangingNickname(false);
    setNicknameData({ newNickname: "" });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 프로필과 신용정보 상세를 나란히 배치 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 왼쪽: 프로필 섹션 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                프로필
              </h3>

              {/* 프로필 이미지 */}
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {currentEmail.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* 사용자 기본 정보 */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {userInfo.nickname || currentEmail.split("@")[0]}님
                  </h2>
                  {/* 닉네임 변경 버튼 */}
                  <button
                    onClick={() => setIsChangingNickname(true)}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    닉네임 변경
                  </button>
                </div>
                <p className="text-gray-600 mb-1">{currentEmail}</p>
                <p className="text-sm text-gray-500">
                  가입일: {new Date().toLocaleDateString("ko-KR")}
                </p>
                {userInfo.social && (
                  <p className="text-xs text-blue-600 mt-1">
                    소셜 로그인 사용자
                  </p>
                )}
              </div>

              {/* 신용정보 요약 카드들 */}
              <div className="space-y-3">
                {/* 신용점수 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-center">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCreditGradeColor(
                        creditData.creditScore
                      )}`}
                    >
                      {getCreditGrade(creditData.creditScore)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">신용등급</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {creditData.creditScore
                        ? `${creditData.creditScore}점`
                        : "미입력"}
                    </p>
                  </div>
                </div>

                {/* 소득 등급 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {getIncomeGrade(creditData.income)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">소득등급</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {creditData.income
                        ? `${creditData.income}만원`
                        : "미입력"}
                    </p>
                  </div>
                </div>

                {/* 나이 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {creditData.age ? `${creditData.age}세` : "미입력"}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">나이</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {creditData.age ? `${creditData.age}세` : "미입력"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 신용정보 상세 섹션 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 h-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  신용정보 상세
                </h3>
                <div className="flex items-center space-x-3">
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      수정하기
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        저장하기
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        취소하기
                      </button>
                    </div>
                  )}

                  {/* 로그아웃 버튼 */}
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    로그아웃
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    나이 (세)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="age"
                      value={creditData.age}
                      onChange={handleCreditChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                      min="19"
                      max="100"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formatValue(creditData.age, "age")}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주택 소유 여부
                  </label>
                  {isEditing ? (
                    <select
                      name="homeOwnership"
                      value={creditData.homeOwnership}
                      onChange={handleCreditChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">선택해주세요</option>
                      <option value="무주택자">무주택자</option>
                      <option value="생애최초 주택구입자">
                        생애최초 주택구입자
                      </option>
                      <option value="기존주택소유자">기존주택소유자</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formatValue(creditData.homeOwnership)}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연소득 (만원)
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="number"
                        name="income"
                        value={creditData.income}
                        onChange={handleCreditChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        placeholder="숫자만 입력해주세요"
                        min="0"
                      />
                      {creditData.income && (
                        <p className="text-sm text-blue-600 mt-1">
                          {formatAmountToKorean(creditData.income)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formatValue(creditData.income, "income")}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    신용점수 (점)
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="number"
                        name="creditScore"
                        value={creditData.creditScore}
                        onChange={handleCreditChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        min="300"
                        max="1000"
                      />
                      <div className="mt-1 text-right">
                        <a
                          href="https://toss.im/tossfeed/article/toss-free-credit-rating-service"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          점수를 모르세요?
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formatValue(creditData.creditScore, "creditScore")}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대출 유형
                  </label>
                  {isEditing ? (
                    <select
                      name="loanType"
                      value={creditData.loanType}
                      onChange={handleCreditChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">선택해주세요</option>
                      <option value="담보대출">담보대출</option>
                      <option value="전세자금대출">전세자금대출</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formatValue(creditData.loanType)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기존 채무 (만원)
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="number"
                        name="debt"
                        value={creditData.debt}
                        onChange={handleCreditChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        placeholder="숫자만 입력해주세요"
                        min="0"
                      />
                      {creditData.debt && (
                        <p className="text-sm text-blue-600 mt-1">
                          {formatAmountToKorean(creditData.debt)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formatValue(creditData.debt, "debt")}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    보유 자산 (만원)
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="number"
                        name="assets"
                        value={creditData.assets}
                        onChange={handleCreditChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        placeholder="숫자만 입력해주세요"
                        min="0"
                      />
                      {creditData.assets && (
                        <p className="text-sm text-blue-600 mt-1">
                          {formatAmountToKorean(creditData.assets)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formatValue(creditData.assets, "assets")}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    담보가액 (만원)
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="number"
                        name="collateralValue"
                        value={creditData.collateralValue}
                        onChange={handleCreditChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        placeholder="숫자만 입력해주세요"
                        min="0"
                      />
                      {creditData.collateralValue && (
                        <p className="text-sm text-blue-600 mt-1">
                          {formatAmountToKorean(creditData.collateralValue)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formatValue(
                        creditData.collateralValue,
                        "collateralValue"
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    고용 형태
                  </label>
                  {isEditing ? (
                    <select
                      name="employmentType"
                      value={creditData.employmentType}
                      onChange={handleCreditChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">선택해주세요</option>
                      <option value="정규직">정규직</option>
                      <option value="계약직">계약직</option>
                      <option value="프리랜서">프리랜서</option>
                      <option value="사업자">사업자</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formatValue(creditData.employmentType)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    근무 기간 (개월)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="workPeriod"
                      value={creditData.workPeriod}
                      onChange={handleCreditChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                      min="0"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formatValue(creditData.workPeriod, "workPeriod")}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    금리 선호도
                  </label>
                  {isEditing ? (
                    <select
                      name="ratePreference"
                      value={creditData.ratePreference}
                      onChange={handleCreditChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">선택해주세요</option>
                      <option value="최저금리">최저금리</option>
                      <option value="안정성">안정성</option>
                      <option value="편의성">편의성</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formatValue(creditData.ratePreference)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주거래 은행
                  </label>
                  {isEditing ? (
                    <select
                      name="mainBank"
                      value={creditData.mainBank}
                      onChange={handleCreditChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">선택해주세요</option>
                      <option value="국민은행">국민은행</option>
                      <option value="신한은행">신한은행</option>
                      <option value="우리은행">우리은행</option>
                      <option value="하나은행">하나은행</option>
                      <option value="농협은행">농협은행</option>
                      <option value="기타">기타</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formatValue(creditData.mainBank)}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사용자 조건
                  </label>
                  {isEditing ? (
                    <select
                      name="userCondition"
                      value={creditData.userCondition}
                      onChange={handleCreditChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">선택해주세요</option>
                      <option value="청년">청년</option>
                      <option value="신혼부부">신혼부부</option>
                      <option value="무주택자">무주택자</option>
                      <option value="기타">기타</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formatValue(creditData.userCondition)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최대 구매 가능액
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {creditData.maxPurchaseAmount ? (
                      formatAmountToKorean(creditData.maxPurchaseAmount / 10000)
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <p className="text-gray-500">대출 추천 필요</p>
                        <button
                          onClick={() => navigate("/loan/input")}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                          대출 상품 알아보기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 비밀번호 변경 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              비밀번호 변경
            </h3>
            {!isChangingPassword ? (
              userInfo.social ? (
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                  소셜 로그인 사용자는 비밀번호 변경이 불가능합니다
                </div>
              ) : (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  비밀번호 변경
                </button>
              )
            ) : (
              <div className="space-x-2">
                <button
                  onClick={handlePasswordChangeSubmit}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  변경하기
                </button>
                <button
                  onClick={handlePasswordChangeCancel}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  취소하기
                </button>
              </div>
            )}
          </div>

          {isChangingPassword && !userInfo.social && (
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  현재 비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  영문, 숫자, 특수문자를 포함해 8~20자로 입력해주세요
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400"
                  required
                />
              </div>
            </form>
          )}
        </div>

        {/* 좋아요한 매물 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              내가 좋아요한 매물
            </h3>
            <span className="text-sm text-gray-500">
              총 {likedProperties.length}개
            </span>
          </div>

          {likedPropertiesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">로딩 중...</p>
            </div>
          ) : likedPropertiesError ? (
            <div className="text-center py-8">
              <div className="text-red-400 mb-2">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="text-red-500 font-medium">
                데이터를 불러올 수 없습니다
              </p>
              <p className="text-sm text-red-400 mt-1">
                서버 오류로 인해 좋아요한 매물을 표시할 수 없습니다
              </p>
              <button
                onClick={() => loadLikedProperties(currentEmail)}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                다시 시도
              </button>
            </div>
          ) : likedProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {likedProperties.map((property) => (
                <div
                  key={property.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/property/read/${property.id}`)}
                >
                  {/* 매물 이미지 */}
                  {property.imageUrls && property.imageUrls.length > 0 && (
                    <div className="mb-3">
                      <img
                        src={`${
                          process.env.REACT_APP_BACKEND_URL ||
                          "http://localhost:8080"
                        }/files/${property.imageUrls[0]}`}
                        alt={property.title}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* 매물 정보 */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {property.title}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        {property.propertyType} • {property.transactionType}
                      </p>
                      <p className="font-medium text-blue-600">
                        {formatAmountToKorean(property.price)}
                      </p>
                      <p>{property.roadAddress}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500">아직 좋아요한 매물이 없습니다.</p>
              <p className="text-sm text-gray-400 mt-1">
                매물을 둘러보고 마음에 드는 것을 좋아요 해보세요!
              </p>
            </div>
          )}
        </div>

        {/* 본인이 작성한 매물 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              내가 등록한 매물
            </h3>
            <span className="text-sm text-gray-500">
              총 {myProperties.length}개
            </span>
          </div>

          {myPropertiesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">로딩 중...</p>
            </div>
          ) : myPropertiesError ? (
            <div className="text-center py-8">
              <div className="text-red-400 mb-2">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="text-red-500 font-medium">
                데이터를 불러올 수 없습니다
              </p>
              <p className="text-sm text-red-400 mt-1">
                서버 오류로 인해 본인 작성 매물을 표시할 수 없습니다
              </p>
              <button
                onClick={() => loadMyProperties(currentEmail)}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                다시 시도
              </button>
            </div>
          ) : myProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myProperties.map((property) => (
                <div
                  key={property.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/property/read/${property.id}`)}
                >
                  {/* 매물 이미지 */}
                  {property.imageUrls && property.imageUrls.length > 0 && (
                    <div className="mb-3">
                      <img
                        src={`${
                          process.env.REACT_APP_BACKEND_URL ||
                          "http://localhost:8080"
                        }/files/${property.imageUrls[0]}`}
                        alt={property.title}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* 매물 정보 */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {property.title}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        {property.propertyType} • {property.transactionType}
                      </p>
                      <p className="font-medium text-blue-600">
                        {formatAmountToKorean(property.price)}
                      </p>
                      <p>{property.roadAddress}</p>
                      <p className="text-xs text-gray-500">
                        상태: {property.status || "업로드됨"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2H5a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <p className="text-gray-500">아직 등록한 매물이 없습니다.</p>
              <p className="text-sm text-gray-400 mt-1">
                매물을 등록하고 검수를 요청해보세요!
              </p>
              <button
                onClick={() => navigate("/property/add")}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                매물 등록하기
              </button>
            </div>
          )}
        </div>

        {/* 검수 요청 현황 섹션 - 요청이 있을 때만 표시 */}
        {!reviewRequestsLoading && reviewRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                내 검수 요청 현황
              </h3>
              <span className="text-sm text-gray-500">
                총 {reviewRequests.length}개
              </span>
            </div>

            <div className="space-y-4">
              {reviewRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-800 line-clamp-2">
                      {request.name}
                    </h4>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        request.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : request.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {request.status === "PENDING"
                        ? "대기중"
                        : request.status === "APPROVED"
                        ? "승인"
                        : "거절"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      {request.propertyType} • {request.transactionType}
                    </p>
                    <p className="font-medium text-blue-600">{request.price}</p>
                    <p>{request.roadAddress}</p>
                    <p className="text-xs text-gray-500">
                      요청일: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                    {request.reviewComment && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600">
                          <strong>검수 코멘트:</strong> {request.reviewComment}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 결과 모달 */}
        {modalState.isOpen && (
          <ResultModal
            title={modalState.title}
            content={modalState.content}
            callbackFn={handleModalClose}
          />
        )}

        {/* 닉네임 변경 모달 */}
        {isChangingNickname && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                닉네임 변경
              </h3>

              <form onSubmit={handleNicknameChangeSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    현재 닉네임
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-600">
                    {userInfo.nickname || currentEmail.split("@")[0]}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    새 닉네임
                  </label>
                  <input
                    type="text"
                    name="newNickname"
                    value={nicknameData.newNickname}
                    onChange={handleNicknameChange}
                    placeholder="새 닉네임을 입력하세요"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    required
                    minLength={2}
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    최소 2자, 최대 20자까지 입력 가능합니다.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleNicknameChangeCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    변경
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPageComponent;
