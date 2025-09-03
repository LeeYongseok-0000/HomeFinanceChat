import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCookie, setCookie, getParsedCookie } from "../util/cookieUtil";
import { getCreditInfo } from "../api/memberApi";
import { getPropertyList } from "../api/propertyApi";
import { formatAmountToKorean } from "../util/currencyUtil";
import useModal from "../hooks/useModal";
import ResultModal from "./common/ResultModal";

function MainComponent() {
  const [memberInfo, setMemberInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("info1");
  const [propertyList, setPropertyList] = useState([]);
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const { modalState, showModal, handleModalClose } = useModal();
  const navigate = useNavigate();

  // 금액 포맷팅 함수
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "0원";

    if (amount >= 10000) {
      // 1억 이상인 경우
      const billion = Math.floor(amount / 10000);
      const million = amount % 10000;

      if (million === 0) {
        return `${billion}억원`;
      } else {
        return `${billion}억 ${million}만원`;
      }
    } else {
      return `${amount}만원`;
    }
  };

  const openChatbot = () => {
    window.open(
      "/chatbot?source=main",
      "chatbot",
      "width=500,height=700,scrollbars=yes,resizable=yes"
    );
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/map?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      showModal("검색 오류", "검색어를 입력해주세요.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    const parsedMember = getParsedCookie("member");

    if (parsedMember && (parsedMember.email || parsedMember.nickname)) {
      setMemberInfo(parsedMember);

      // 신용정보도 함께 불러오기
      loadCreditInfo(parsedMember.email);
    } else if (parsedMember === null) {
      // 쿠키가 없거나 파싱 실패한 경우
      setCookie("member", "", 0);
    }
  }, []);

  // 매물 리스트 불러오기
  useEffect(() => {
    loadPropertyList();
  }, []);

  // memberInfo, propertyList, activeTab이 변경될 때마다 추천 매물 재계산
  useEffect(() => {
    if (memberInfo?.creditInfo && propertyList.length > 0) {
      calculateRecommendedProperties(propertyList, memberInfo);
    }
  }, [memberInfo, propertyList, activeTab]);

  // 신용정보 불러오기 함수
  const loadCreditInfo = async (email) => {
    try {
      const data = await getCreditInfo(email);

      if (data && data.creditInfo) {
        // 현재 memberInfo를 가져와서 업데이트
        setMemberInfo((prev) => {
          if (!prev) {
            // prev가 null이면 기본 구조 생성
            const newMemberInfo = {
              creditInfo: data.creditInfo,
              nickname: data.nickname,
              social: data.social,
            };
            return newMemberInfo;
          }
          const updatedMemberInfo = {
            ...prev,
            creditInfo: data.creditInfo,
          };
          return updatedMemberInfo;
        });

        // 신용정보가 로드된 후 추천 매물 계산
        if (propertyList.length > 0) {
          const memberInfoWithCredit = {
            creditInfo: data.creditInfo,
            nickname: data.nickname,
            social: data.social,
          };
          calculateRecommendedProperties(propertyList, memberInfoWithCredit);
        }
      }
    } catch (error) {
      console.error("❌ 신용정보 불러오기 실패:", error);
    }
  };

  // 매물 리스트 불러오기 함수
  const loadPropertyList = async () => {
    try {
      setPropertyLoading(true);

      // 더 많은 매물을 불러오도록 size 증가
      const data = await getPropertyList({ size: 20, page: 0 });

      if (data && data.content) {
        setPropertyList(data.content);

        // 추천 매물 계산
        calculateRecommendedProperties(data.content);
      } else {
        setPropertyList([]);
        setRecommendedProperties([]);
      }
    } catch (error) {
      setPropertyList([]);
      setRecommendedProperties([]);
    } finally {
      setPropertyLoading(false);
    }
  };

  // 매물 가격 파싱 함수 (개선된 버전)
  const parsePropertyPrice = (priceStr) => {
    if (!priceStr) return 0;

    try {
      // "억원"과 공백 제거
      let cleanPrice = priceStr.replace(/[억원\s]/g, "");
      const price = parseFloat(cleanPrice);

      if (isNaN(price)) {
        return 0;
      }

      let result;
      // 10000 이상이면 만원 단위로 인식하여 억원 단위로 변환
      if (price >= 10000) {
        result = price / 10000; // 만원 → 억원 변환
      } else {
        result = price; // 이미 억원 단위
      }

      return result;
    } catch (error) {
      console.error(`❌ 가격 파싱 에러: ${priceStr}`, error);
      return 0;
    }
  };

  // 추천 매물 계산 함수
  const calculateRecommendedProperties = (
    properties,
    memberInfoParam = null
  ) => {
    const currentMemberInfo = memberInfoParam || memberInfo;

    if (
      !currentMemberInfo?.creditInfo ||
      !currentMemberInfo?.creditInfo?.assets
    ) {
      setRecommendedProperties([]);
      return;
    }

    let availableProperties = [];

    if (activeTab === "info1") {
      // "내 자산" 탭: 내 자산만으로 가장 근접한 매물
      // assets는 만원 단위로 저장되어 있으므로 억원 단위로 변환
      const myAssetsInManwon = currentMemberInfo.creditInfo.assets; // 만원 단위
      const myAssets = myAssetsInManwon / 10000; // 억원 단위로 변환

      // 필터링 조건 완화: 내 자산의 50%~200% 범위로 확장
      availableProperties = properties
        .filter((property) => {
          const propertyPrice = parsePropertyPrice(property.price);

          if (propertyPrice === 0) {
            return false;
          }

          // 내 자산의 50%~200% 범위 내의 매물 (더 넓은 범위)
          const isInRange =
            propertyPrice >= myAssets * 0.5 && propertyPrice <= myAssets * 2.0;
          return isInRange;
        })
        .sort((a, b) => {
          const aPrice = parsePropertyPrice(a.price);
          const bPrice = parsePropertyPrice(b.price);

          // 내 자산과 가장 가까운 순으로 정렬
          return Math.abs(aPrice - myAssets) - Math.abs(bPrice - myAssets);
        })
        .slice(0, 3);

      // 만약 필터링된 매물이 3개 미만이면, 전체 매물에서 가격 순으로 정렬하여 상위 3개 추천
      if (availableProperties.length < 3) {
        availableProperties = properties
          .filter((property) => parsePropertyPrice(property.price) > 0)
          .sort((a, b) => {
            const aPrice = parsePropertyPrice(a.price);
            const bPrice = parsePropertyPrice(b.price);
            return aPrice - bPrice; // 가격 낮은 순으로 정렬
          })
          .slice(0, 3);
      }
    } else if (activeTab === "info2") {
      // "내 자산 + 대출 가능 금액" 탭: (내 자산 + 최대 구매 가능액)으로 가장 근접한 매물
      if (!currentMemberInfo?.creditInfo?.maxPurchaseAmount) {
        setRecommendedProperties([]);
        return;
      }

      const totalBudget =
        currentMemberInfo.creditInfo.assets +
        currentMemberInfo.creditInfo.maxPurchaseAmount;

      // 필터링 조건 완화: 총 예산의 50%~200% 범위로 확장
      availableProperties = properties
        .filter((property) => {
          const propertyPrice = parsePropertyPrice(property.price);
          if (propertyPrice === 0) return false;

          // 총 예산의 50%~200% 범위 내의 매물 (더 넓은 범위)
          const isInRange =
            propertyPrice >= totalBudget * 0.5 &&
            propertyPrice <= totalBudget * 2.0;
          return isInRange;
        })
        .sort((a, b) => {
          const aPrice = parsePropertyPrice(a.price);
          const bPrice = parsePropertyPrice(b.price);

          // 총 예산과 가장 가까운 순으로 정렬
          return (
            Math.abs(aPrice - totalBudget) - Math.abs(bPrice - totalBudget)
          );
        })
        .slice(0, 3);

      // 만약 필터링된 매물이 3개 미만이면, 전체 매물에서 가격 순으로 정렬하여 상위 3개 추천
      if (availableProperties.length < 3) {
        availableProperties = properties
          .filter((property) => parsePropertyPrice(property.price) > 0)
          .sort((a, b) => {
            const aPrice = parsePropertyPrice(a.price);
            const bPrice = parsePropertyPrice(b.price);
            return aPrice - bPrice; // 가격 낮은 순으로 정렬
          })
          .slice(0, 3);
      }
    }

    setRecommendedProperties(availableProperties);
  };

  const handleLogout = () => {
    setCookie("member", "", 0);
    setMemberInfo(null);
    showModal("로그아웃", "로그아웃되었습니다.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 콘텐츠 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {memberInfo ? (
          <div className="bg-gray-200 rounded-xl shadow-md p-8 mb-12 border-2 ">
            <div className="flex flex-row gap-8">
              {/* 왼쪽: 환영 메시지와 추가 div */}
              <div className="lg:w-1/3 flex flex-col gap-4">
                {/* 환영 메시지 */}
                <div className="bg-white border rounded-lg p-2 flex flex-col items-center justify-center text-center h-20 shadow-md">
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">
                    {memberInfo.nickname}님 환영합니다!
                  </h2>
                  <p className="text-gray-600 mb-1 text-sm">
                    AI가 추천하는 매물을 확인해보세요!
                  </p>
                </div>

                {/* 새로운 추가 div */}
                <div className="bg-white border-2 border-gray-300 rounded-2xl shadow-lg p-4 h-80">
                  {/* 탭 버튼들 */}
                  <div className="flex mb-4 w-full">
                    <button
                      onClick={() => setActiveTab("info1")}
                      className={`w-1/3 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-t-lg ${
                        activeTab === "info1"
                          ? "bg-white text-gray-700 shadow-md"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-lg"
                      }`}
                    >
                      내 자산
                    </button>
                    <button
                      onClick={() => setActiveTab("info2")}
                      className={`flex-1 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-t-lg ${
                        activeTab === "info2"
                          ? "bg-white text-gray-700 shadow-md"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-lg"
                      }`}
                    >
                      내 자산 + 대출 가능 금액
                    </button>
                  </div>

                  {/* 탭 내용 */}
                  <div>
                    {activeTab === "info1" && (
                      <div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-sm font-medium text-gray-500">
                              연소득
                            </span>
                            <span className="text-sm font-semibold text-gray-700">
                              {memberInfo.creditInfo?.income
                                ? formatCurrency(memberInfo.creditInfo.income)
                                : "미입력"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-sm font-medium text-gray-500">
                              기존채무
                            </span>
                            <span className="text-sm font-semibold text-gray-700">
                              {memberInfo.creditInfo?.debt
                                ? formatCurrency(memberInfo.creditInfo.debt)
                                : "미입력"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-sm font-medium text-gray-500">
                              보유자산
                            </span>
                            <span className="text-sm font-semibold text-gray-700">
                              {memberInfo.creditInfo?.assets
                                ? formatCurrency(memberInfo.creditInfo.assets)
                                : "미입력"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-3 px-3 pb-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-sm font-medium text-gray-500">
                              고용형태
                            </span>
                            <span className="text-sm font-semibold text-gray-700">
                              {memberInfo.creditInfo?.employmentType ||
                                "미입력"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "info2" && (
                      <div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-sm font-medium text-gray-500">
                              신용점수
                            </span>
                            <span className="text-sm font-semibold text-gray-700">
                              {memberInfo.creditInfo?.creditScore
                                ? `${memberInfo.creditInfo.creditScore}점`
                                : "미입력"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm mb-3">
                            <span className="text-sm font-medium text-gray-500">
                              담보가액
                            </span>
                            <span className="text-sm font-semibold text-gray-700">
                              {memberInfo.creditInfo?.collateralValue
                                ? formatCurrency(
                                    memberInfo.creditInfo.collateralValue
                                  )
                                : "미입력"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm mb-10">
                            <span className="text-sm font-medium text-gray-700">
                              최대 구매 가능액
                            </span>
                            <span className="text-sm font-semibold text-gray-700">
                              {memberInfo.creditInfo?.maxPurchaseAmount
                                ? formatAmountToKorean(
                                    memberInfo.creditInfo.maxPurchaseAmount /
                                      10000
                                  )
                                : "미입력"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 오른쪽: 추천매물 섹션 */}
              <div className="lg:w-2/3 pt-0">
                {/* 추천매물 제목 div */}
                <div className="bg-white border rounded-lg p-2 flex flex-col items-center justify-center text-center h-20 shadow-md mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {activeTab === "info1"
                      ? "내 자산 기반 추천매물"
                      : "내 자산 + 최대 구매 가능액 기반 추천매물"}
                  </h3>
                </div>
                <div className="flex flex-row gap-4 border-2  py-0 px-0 rounded-lg h-70">
                  {propertyLoading ? (
                    <div className="flex-1 text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
                      <p className="mt-2 text-gray-600">
                        매물을 불러오는 중...
                      </p>
                    </div>
                  ) : recommendedProperties.length > 0 ? (
                    <>
                      {/* 추천매물 1 */}
                      <div
                        className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                        onClick={() =>
                          recommendedProperties[0] &&
                          navigate(
                            `/property/read/${recommendedProperties[0].id}`
                          )
                        }
                      >
                        {recommendedProperties[0] && (
                          <>
                            <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-3 overflow-hidden">
                              {recommendedProperties[0].imageUrls &&
                              recommendedProperties[0].imageUrls.length > 0 ? (
                                <img
                                  src={`${
                                    process.env.REACT_APP_BACKEND_URL ||
                                    "http://localhost:8080"
                                  }/files/${
                                    recommendedProperties[0].imageUrls[0]
                                  }`}
                                  alt={recommendedProperties[0].title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error(
                                      `추천 매물 1 이미지 로드 실패: ${e.target.src}`
                                    );
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-full flex items-center justify-center ${
                                  recommendedProperties[0].imageUrls &&
                                  recommendedProperties[0].imageUrls.length > 0
                                    ? "hidden"
                                    : ""
                                }`}
                              >
                                <span className="text-2xl">🏢</span>
                              </div>
                            </div>

                            {/* 매매/전세/월세 정보 + 가격 */}
                            <div className="mb-2">
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                {recommendedProperties[0].transactionType ===
                                  "매매" ||
                                recommendedProperties[0].transactionType ===
                                  "SALE"
                                  ? "매매"
                                  : recommendedProperties[0].transactionType ===
                                      "전세" ||
                                    recommendedProperties[0].transactionType ===
                                      "JEONSE"
                                  ? "전세"
                                  : recommendedProperties[0].transactionType ===
                                      "월세" ||
                                    recommendedProperties[0].transactionType ===
                                      "MONTHLY"
                                  ? "월세"
                                  : recommendedProperties[0].transactionType ||
                                    "매매"}

                                {(recommendedProperties[0].transactionType ===
                                  "매매" ||
                                  recommendedProperties[0].transactionType ===
                                    "SALE") && (
                                  <span className="ml-1">
                                    {recommendedProperties[0].price
                                      ? `${recommendedProperties[0].price}`
                                      : "가격 협의"}
                                  </span>
                                )}
                                {(recommendedProperties[0].transactionType ===
                                  "전세" ||
                                  recommendedProperties[0].transactionType ===
                                    "JEONSE") && (
                                  <span className="ml-1">
                                    {recommendedProperties[0].price
                                      ? `${recommendedProperties[0].price}`
                                      : "가격 협의"}
                                  </span>
                                )}
                              </span>
                            </div>

                            {/* 매물 이름 */}
                            <h4 className="font-medium text-gray-800 mb-2 text-sm line-clamp-2">
                              {recommendedProperties[0].title || "추천매물 1"}
                            </h4>

                            {/* 월세 가격 정보 */}
                            {(recommendedProperties[0].transactionType ===
                              "월세" ||
                              recommendedProperties[0].transactionType ===
                                "MONTHLY") && (
                              <p className="text-xs text-gray-600 mb-2">
                                {recommendedProperties[0].price &&
                                recommendedProperties[0].monthlyRent
                                  ? `${formatCurrency(
                                      parseInt(recommendedProperties[0].price)
                                    )} / ${formatCurrency(
                                      parseInt(
                                        recommendedProperties[0].monthlyRent
                                      )
                                    )}`
                                  : recommendedProperties[0].price
                                  ? formatCurrency(
                                      parseInt(recommendedProperties[0].price)
                                    )
                                  : recommendedProperties[0].monthlyRent
                                  ? formatCurrency(
                                      parseInt(
                                        recommendedProperties[0].monthlyRent
                                      )
                                    )
                                  : "가격 협의"}
                              </p>
                            )}

                            {/* 주소 */}
                            <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                              {recommendedProperties[0].roadAddress ||
                                recommendedProperties[0].detailAddress ||
                                "주소 정보 없음"}
                            </p>

                            {/* 추천 기준 */}
                            <p className="text-xs text-gray-400">
                              {activeTab === "info1"
                                ? "내 자산 기반 추천"
                                : "내 자산 + 최대 구매 가능액 기반 추천"}
                            </p>
                          </>
                        )}
                      </div>

                      {/* 추천매물 2 */}
                      <div
                        className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                        onClick={() =>
                          recommendedProperties[1] &&
                          navigate(
                            `/property/read/${recommendedProperties[1].id}`
                          )
                        }
                      >
                        {recommendedProperties[1] && (
                          <>
                            <div className="w-full h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-3 overflow-hidden">
                              {recommendedProperties[1].imageUrls &&
                              recommendedProperties[1].imageUrls.length > 0 ? (
                                <img
                                  src={`${
                                    process.env.REACT_APP_BACKEND_URL ||
                                    "http://localhost:8080"
                                  }/files/${
                                    recommendedProperties[1].imageUrls[0]
                                  }`}
                                  alt={recommendedProperties[1].title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error(
                                      `추천 매물 2 이미지 로드 실패: ${e.target.src}`
                                    );
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-full flex items-center justify-center ${
                                  recommendedProperties[1].imageUrls &&
                                  recommendedProperties[1].imageUrls.length > 0
                                    ? "hidden"
                                    : ""
                                }`}
                              >
                                <span className="text-2xl">🏠</span>
                              </div>
                            </div>

                            {/* 매매/전세/월세 정보 + 가격 */}
                            <div className="mb-2">
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                {recommendedProperties[1].transactionType ===
                                  "매매" ||
                                recommendedProperties[1].transactionType ===
                                  "SALE"
                                  ? "매매"
                                  : recommendedProperties[1].transactionType ===
                                      "전세" ||
                                    recommendedProperties[1].transactionType ===
                                      "JEONSE"
                                  ? "전세"
                                  : recommendedProperties[1].transactionType ===
                                      "월세" ||
                                    recommendedProperties[1].transactionType ===
                                      "MONTHLY"
                                  ? "월세"
                                  : recommendedProperties[1].transactionType ||
                                    "매매"}

                                {(recommendedProperties[1].transactionType ===
                                  "매매" ||
                                  recommendedProperties[1].transactionType ===
                                    "SALE") && (
                                  <span className="ml-1">
                                    {recommendedProperties[1].price
                                      ? `${recommendedProperties[1].price}`
                                      : "가격 협의"}
                                  </span>
                                )}
                                {(recommendedProperties[1].transactionType ===
                                  "전세" ||
                                  recommendedProperties[1].transactionType ===
                                    "JEONSE") && (
                                  <span className="ml-1">
                                    {recommendedProperties[1].price
                                      ? `${recommendedProperties[1].price}`
                                      : "가격 협의"}
                                  </span>
                                )}
                              </span>
                            </div>

                            {/* 매물 이름 */}
                            <h4 className="font-medium text-gray-800 mb-2 text-sm line-clamp-2">
                              {recommendedProperties[1].title || "추천매물 2"}
                            </h4>

                            {/* 월세 가격 정보 */}
                            {(recommendedProperties[1].transactionType ===
                              "월세" ||
                              recommendedProperties[1].transactionType ===
                                "MONTHLY") && (
                              <p className="text-xs text-gray-600 mb-2">
                                {recommendedProperties[1].price &&
                                recommendedProperties[1].monthlyRent
                                  ? `${formatCurrency(
                                      parseInt(recommendedProperties[1].price)
                                    )} / ${formatCurrency(
                                      parseInt(
                                        recommendedProperties[1].monthlyRent
                                      )
                                    )}`
                                  : recommendedProperties[1].price
                                  ? formatCurrency(
                                      parseInt(recommendedProperties[1].price)
                                    )
                                  : recommendedProperties[1].monthlyRent
                                  ? formatCurrency(
                                      parseInt(
                                        recommendedProperties[1].monthlyRent
                                      )
                                    )
                                  : "가격 협의"}
                              </p>
                            )}

                            {/* 주소 */}
                            <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                              {recommendedProperties[1].roadAddress ||
                                recommendedProperties[1].detailAddress ||
                                "주소 정보 없음"}
                            </p>

                            {/* 추천 기준 */}
                            <p className="text-xs text-gray-400">
                              {activeTab === "info1"
                                ? "내 자산 기반 추천"
                                : "내 자산 + 최대 구매 가능액 기반 추천"}
                            </p>
                          </>
                        )}
                      </div>

                      {/* 추천매물 3 */}
                      <div
                        className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                        onClick={() =>
                          recommendedProperties[2] &&
                          navigate(
                            `/property/read/${recommendedProperties[2].id}`
                          )
                        }
                      >
                        {recommendedProperties[2] && (
                          <>
                            <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mb-3 overflow-hidden">
                              {recommendedProperties[2].imageUrls &&
                              recommendedProperties[2].imageUrls.length > 0 ? (
                                <img
                                  src={`${
                                    process.env.REACT_APP_BACKEND_URL ||
                                    "http://localhost:8080"
                                  }/files/${
                                    recommendedProperties[2].imageUrls[0]
                                  }`}
                                  alt={recommendedProperties[2].title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error(
                                      `추천 매물 3 이미지 로드 실패: ${e.target.src}`
                                    );
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-full flex items-center justify-center ${
                                  recommendedProperties[2].imageUrls &&
                                  recommendedProperties[2].imageUrls.length > 0
                                    ? "hidden"
                                    : ""
                                }`}
                              >
                                <span className="text-2xl">🏘️</span>
                              </div>
                            </div>

                            {/* 매매/전세/월세 정보 + 가격 */}
                            <div className="mb-2">
                              <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                                {recommendedProperties[2].transactionType ===
                                  "매매" ||
                                recommendedProperties[2].transactionType ===
                                  "SALE"
                                  ? "매매"
                                  : recommendedProperties[2].transactionType ===
                                      "전세" ||
                                    recommendedProperties[2].transactionType ===
                                      "JEONSE"
                                  ? "전세"
                                  : recommendedProperties[2].transactionType ===
                                      "월세" ||
                                    recommendedProperties[2].transactionType ===
                                      "MONTHLY"
                                  ? "월세"
                                  : recommendedProperties[2].transactionType ||
                                    "매매"}

                                {(recommendedProperties[2].transactionType ===
                                  "매매" ||
                                  recommendedProperties[2].transactionType ===
                                    "SALE") && (
                                  <span className="ml-1">
                                    {recommendedProperties[2].price
                                      ? `${recommendedProperties[2].price}`
                                      : "가격 협의"}
                                  </span>
                                )}
                                {(recommendedProperties[2].transactionType ===
                                  "전세" ||
                                  recommendedProperties[2].transactionType ===
                                    "JEONSE") && (
                                  <span className="ml-1">
                                    {recommendedProperties[2].price
                                      ? `${recommendedProperties[2].price}`
                                      : "가격 협의"}
                                  </span>
                                )}
                              </span>
                            </div>

                            {/* 매물 이름 */}
                            <h4 className="font-medium text-gray-800 mb-2 text-sm line-clamp-2">
                              {recommendedProperties[2].title || "추천매물 3"}
                            </h4>

                            {/* 월세 가격 정보 */}
                            {(recommendedProperties[2].transactionType ===
                              "월세" ||
                              recommendedProperties[2].transactionType ===
                                "MONTHLY") && (
                              <p className="text-xs text-gray-600 mb-2">
                                {recommendedProperties[2].price &&
                                recommendedProperties[2].monthlyRent
                                  ? `${formatCurrency(
                                      parseInt(recommendedProperties[2].price)
                                    )} / ${formatCurrency(
                                      parseInt(
                                        recommendedProperties[2].monthlyRent
                                      )
                                    )}`
                                  : recommendedProperties[2].price
                                  ? formatCurrency(
                                      parseInt(recommendedProperties[2].price)
                                    )
                                  : recommendedProperties[2].monthlyRent
                                  ? formatCurrency(
                                      parseInt(
                                        recommendedProperties[2].monthlyRent
                                      )
                                    )
                                  : "가격 협의"}
                              </p>
                            )}

                            {/* 주소 */}
                            <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                              {recommendedProperties[2].roadAddress ||
                                recommendedProperties[2].detailAddress ||
                                "주소 정보 없음"}
                            </p>

                            {/* 추천 기준 */}
                            <p className="text-xs text-gray-400">
                              {activeTab === "info1"
                                ? "내 자산 기반 추천"
                                : "내 자산 + 최대 구매 가능액 기반 추천"}
                            </p>
                          </>
                        )}
                      </div>
                    </>
                  ) : propertyList.length > 0 ? (
                    <div className="flex-1 text-center py-8 text-gray-500">
                      <p>추천할 수 있는 매물이 없습니다.</p>
                      <p className="text-sm mt-2">
                        {activeTab === "info1"
                          ? "내 자산을 입력해주세요."
                          : "내 자산과 최대 구매 가능액을 입력해주세요."}
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 text-center py-8 text-gray-500">
                      <p>등록된 매물이 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 mb-12 text-center border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              서비스를 이용하려면 로그인이 필요합니다
            </h2>
            <p className="text-gray-600 mb-6">
              로그인하여 더 많은 기능을 이용해보세요.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/member/login"
                className="bg-gray-500 hover:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                로그인
              </Link>
              <Link
                to="/member/join"
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                회원가입
              </Link>
            </div>
          </div>
        )}
        {/* 검색 섹션 */}
        <div className="bg-gray-200 rounded-xl p-4 text-center text-white mb-12 shadow-md">
          <div className="max-w-2xl mx-auto mt-10 mb-2">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="지역을 입력하세요 (예: 강남구, 서초구)"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={handleSearch}
                className="bg-white text-gray-400 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                검색하기
              </button>
            </div>
          </div>

          {/* 부동산 유형 박스 - 전체 레이아웃 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 -mb-6 mt-5 rounded-lg p-4 h-96">
            {/* 왼쪽: 1~5번 카드들 */}
            <div className="lg:col-span-2">
              {/* 1,2번 (위쪽) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 h-40">
                <div
                  className="bg-white rounded-xl p-4 transition-all duration-300 cursor-pointer relative h-full flex flex-col items-center justify-center border border-gray-200 shadow-lg hover:shadow-xl"
                  onClick={() => navigate("/map?propertyType=apartment")}
                >
                  <div className="text-3xl mb-2">
                    <img
                      src="/hotel(2).png"
                      alt="아파트"
                      className="w-12 h-12 mx-auto"
                    />
                  </div>
                  <h4 className="font-semibold text-sm text-black">아파트</h4>
                  <p className="text-xs opacity-90 text-black">
                    매매/전세/월세
                  </p>
                </div>

                <div
                  className="bg-white rounded-xl p-4 transition-all duration-300 cursor-pointer relative h-full flex flex-col items-center justify-center border border-gray-200 shadow-lg hover:shadow-xl"
                  onClick={() => navigate("/map?propertyType=all")}
                >
                  <div className="text-3xl mb-2">
                    <img
                      src="/one.png"
                      alt="원룸/투룸"
                      className="w-12 h-12 mx-auto"
                    />
                  </div>
                  <h4 className="font-semibold text-sm text-black">
                    원룸/투룸
                  </h4>
                  <p className="text-xs opacity-90 text-black">
                    매매/전세/월세
                  </p>
                </div>
              </div>

              {/* 3,4,5번 (아래쪽) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-40">
                <div
                  className="bg-white rounded-xl p-4 transition-all duration-300 cursor-pointer relative h-full flex flex-col items-center justify-center border border-gray-200 shadow-lg hover:shadow-xl"
                  onClick={() => navigate("/map?propertyType=detached")}
                >
                  <div className="text-3xl mb-2">
                    <img
                      src="/house(1).png"
                      alt="단독주택"
                      className="w-12 h-12 mx-auto"
                    />
                  </div>
                  <h4 className="font-semibold text-sm text-black">단독주택</h4>
                  <p className="text-xs opacity-90 text-black">
                    매매/전세/월세
                  </p>
                </div>

                <div
                  className="bg-white rounded-xl p-4 transition-all duration-300 cursor-pointer relative h-full flex flex-col items-center justify-center border border-gray-200 shadow-lg hover:shadow-xl"
                  onClick={() => navigate("/map?propertyType=rowhouse")}
                >
                  <div className="text-3xl mb-2">
                    <img
                      src="/house.png"
                      alt="연립/다세대"
                      className="w-12 h-12 mx-auto"
                    />
                  </div>
                  <h4 className="font-semibold text-sm text-black">
                    연립/다세대
                  </h4>
                  <p className="text-xs opacity-90 text-black">
                    매매/전세/월세
                  </p>
                </div>

                <div
                  className="bg-white rounded-xl p-4 transition-all duration-300 cursor-pointer relative h-full flex flex-col items-center justify-center border border-gray-200 shadow-lg hover:shadow-xl"
                  onClick={() => navigate("/map?propertyType=officetel")}
                >
                  <div className="text-3xl mb-2">
                    <img
                      src="/hotel.svg"
                      alt="오피스텔"
                      className="w-12 h-12 mx-auto"
                    />
                  </div>
                  <h4 className="font-semibold text-sm text-black">오피스텔</h4>
                  <p className="text-xs opacity-90 text-black">
                    매매/전세/월세
                  </p>
                </div>
              </div>
            </div>

            {/* 오른쪽: 6,7번 카드들 */}
            <div className="lg:col-span-1">
              <div className="space-y-4 h-full">
                <div
                  className="bg-white rounded-xl p-4 transition-all duration-300 cursor-pointer relative h-40 flex flex-col items-center justify-center border border-gray-200 shadow-lg hover:shadow-xl"
                  onClick={openChatbot}
                >
                  <div className="text-3xl mb-2">
                    <img
                      src="/chatbot.png"
                      alt="챗봇"
                      className="w-12 h-12 mx-auto"
                    />
                  </div>
                  <h4 className="font-semibold text-sm text-black">챗봇</h4>
                  <p className="text-xs opacity-90 text-black">
                    원하는 조건으로 매물 검색
                  </p>
                </div>

                <div
                  className="bg-white rounded-xl p-4 transition-all duration-300 cursor-pointer relative h-40 flex flex-col items-center justify-center border border-gray-200 shadow-lg hover:shadow-xl"
                  onClick={() => navigate("/community")}
                >
                  <div className="text-2xl mb-2">
                    <img
                      src="/community.png"
                      alt="커뮤니티"
                      className="w-12 h-12 mx-auto"
                    />
                  </div>
                  <h4 className="font-semibold text-sm text-black">커뮤니티</h4>
                  <p className="text-xs opacity-90 text-black">
                    우리 동네 이야기 + 부동산 QnA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 추가 서비스 섹션 */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100">
            <div className="mb-4 flex justify-center">
              <img
                src="/news.png"
                alt="부동산 뉴스 아이콘"
                className="w-16 h-16 object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              부동산 뉴스
            </h3>
            <p className="text-gray-600 mb-6">
              최신 부동산 시장 동향과 투자 정보를 확인해보세요
            </p>
            <Link
              to="/news"
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg transition-colors duration-200 hover:bg-gray-600"
            >
              뉴스 보기
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100">
            <div className="mb-4 flex justify-center">
              <img
                src="/property.png"
                alt="매물 아이콘"
                className="w-16 h-16 object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">매물</h3>
            <p className="text-gray-600 mb-6">
              최신 부동산 시장 동향과 투자 정보를 확인해보세요
            </p>
            <Link
              to="/property/list"
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg transition-colors duration-200 hover:bg-gray-600"
            >
              매물 보기
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100">
            <div className="mb-4 flex justify-center">
              <img
                src="/insurance.png"
                alt="실거래가 아이콘"
                className="w-16 h-16 object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              실거래가
            </h3>
            <p className="text-gray-600 mb-6">
              최신 부동산 시장 동향과 투자 정보를 확인해보세요
            </p>
            <button
              onClick={() => {
                navigate("/real-estate");
                window.scrollTo(0, 0);
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg transition-colors duration-200 hover:bg-gray-600"
            >
              실거래가 보기
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100">
            <div className="mb-4 flex justify-center">
              <img
                src="/insu.png"
                alt="대출상품 추천 아이콘"
                className="w-16 h-16 object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              대출상품 추천
            </h3>
            <p className="text-gray-600 mb-6">
              다른 사용자들과 부동산 정보를 공유하고 소통해보세요
            </p>
            <button
              onClick={() => {
                navigate("/loan/input");
                window.scrollTo(0, 0);
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg transition-colors duration-200 hover:bg-gray-600"
            >
              대출상품추천 가기
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </div>
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
}

export default MainComponent;
