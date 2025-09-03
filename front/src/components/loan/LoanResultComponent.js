import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../util/jwtUtil";
import { saveMaxPurchaseAmount } from "../../api/memberApi";
import { formatAmountToKorean } from "../../util/currencyUtil";
import ScoreCriteriaModal from "./ScoreCriteriaModal";

const LoanResultComponent = () => {
  const navigate = useNavigate();
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // 컴포넌트 마운트 시 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    const savedResult = localStorage.getItem("loanRecommendationResult");
    if (savedResult) {
      try {
        setRecommendationResult(JSON.parse(savedResult));
      } catch (e) {
        console.error("저장된 결과 파싱 실패:", e);
        navigate("/loan/input");
      }
    } else {
      navigate("/loan/input");
    }
  }, [navigate]);

  // 결과가 없으면 로딩 표시
  if (!recommendationResult) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const handleBackToForm = () => {
    // 이전 입력 데이터를 state로 전달
    const userInputData = localStorage.getItem("loanUserInputData");
    if (userInputData) {
      try {
        const parsedData = JSON.parse(userInputData);
        navigate("/loan/input", { state: { userInputData: parsedData } });
      } catch (e) {
        navigate("/loan/input");
      }
    } else {
      navigate("/loan/input");
    }
    localStorage.removeItem("loanRecommendationResult");
  };

  // 최대 구매 가능액 저장
  const handleSaveMaxPurchaseAmount = async () => {
    if (!recommendationResult || !recommendationResult.purchaseInfo) {
      setSaveMessage("저장할 구매 정보가 없습니다.");
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      setSaveMessage("로그인이 필요합니다.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      // 디버깅을 위한 데이터 확인
      console.log("🔍 recommendationResult:", recommendationResult);
      console.log("🔍 purchaseInfo:", recommendationResult.purchaseInfo);
      console.log(
        "🔍 maxPurchaseAmount:",
        recommendationResult.purchaseInfo?.maxPurchaseAmount
      );

      const maxPurchaseAmount =
        recommendationResult.purchaseInfo?.maxPurchaseAmount;

      // 데이터 유효성 검사
      if (!maxPurchaseAmount || maxPurchaseAmount <= 0) {
        console.error("❌ 유효하지 않은 maxPurchaseAmount:", maxPurchaseAmount);
        setSaveMessage("❌ 저장할 구매 정보가 없습니다.");
        return;
      }

      await saveMaxPurchaseAmount(currentUser.email, maxPurchaseAmount);
      setSaveMessage("✅ 최대 구매 가능액이 저장되었습니다!");

      // 3초 후 메시지 제거
      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (error) {
      console.error("최대 구매 가능액 저장 실패:", error);
      setSaveMessage("❌ 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatScore = (score) => {
    return score.toFixed(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  // 특별 조건 구성 함수
  const getSpecialConditions = (product) => {
    const conditions = [];

    // 청년 우대
    if (product.youthPreference) {
      conditions.push("청년 우대");
    }

    // 모바일 신청 가능
    if (product.mobileAvailable) {
      conditions.push("모바일 신청");
    }

    // DSR 우대
    if (product.dsrPreference) {
      conditions.push("DSR 우대");
    }

    // 서류 간소화
    if (product.documentSimplicity) {
      conditions.push("서류 간소화");
    }

    // 우대금리
    if (product.preferentialRate && product.preferentialRate > 0) {
      conditions.push("우대금리 적용");
    }

    return conditions.length > 0 ? conditions.join(", ") : "특별 조건 없음";
  };

  // 대출 조건 구성 함수
  const getLoanConditions = (product) => {
    const conditions = [];

    if (product.qualification) {
      conditions.push(`나이: ${product.qualification.age}`);
      conditions.push(`주택소유: ${product.qualification.homeOwnership}`);
      conditions.push(`소득: ${product.qualification.income}`);
      conditions.push(`신용점수: ${product.qualification.creditScore}`);
    }

    return conditions.join(" | ");
  };

  const products = recommendationResult.products || [];
  const purchaseInfo = recommendationResult.purchaseInfo;

  if (products.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <button
            onClick={handleBackToForm}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            다시 입력하기
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">추천 결과</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">
            조건에 맞는 대출 상품이 없습니다.
          </p>
          <p className="text-gray-500 mt-2">다른 조건으로 다시 시도해보세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <button
          onClick={handleBackToForm}
          className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          다시 입력하기
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">추천 결과</h2>

      {/* 구매 가능 금액 정보 */}
      {purchaseInfo && (
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">
            구매 가능 금액 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">최대 대출 가능 금액</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatAmountToKorean(purchaseInfo.maxLoanAmount / 10000)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">현금성 자산</p>
              <p className="text-2xl font-bold text-green-600">
                {formatAmountToKorean(purchaseInfo.userAssets)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">최대 구매 가능 금액</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatAmountToKorean(
                  purchaseInfo.maxLoanAmount / 10000 + purchaseInfo.userAssets
                )}
              </p>
            </div>
          </div>

          {/* 최대 구매 가능액 저장 버튼 */}
          <div className="mt-6 text-center">
            <button
              onClick={handleSaveMaxPurchaseAmount}
              disabled={isSaving}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>💾</span>
              <span>{isSaving ? "저장 중..." : "최대 구매 가능액 저장"}</span>
            </button>

            {/* 저장 메시지 */}
            {saveMessage && (
              <div
                className={`mt-3 p-3 rounded-lg text-sm ${
                  saveMessage.includes("✅")
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {saveMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 점수 기준표 버튼 */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setIsScoreModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>📊</span>
          <span>점수 기준표 보기</span>
        </button>
      </div>

      {/* 추천 상품 목록 */}
      <div className="space-y-6">
        {products.map((product, index) => (
          <div
            key={product.productId}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {product.productName}
                </h3>
                <p className="text-gray-600">{product.bank}</p>
              </div>
              <div className="text-right">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  점수: {formatScore(product.score)}점
                </div>
                {index < 3 && (
                  <div className="mt-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                    TOP {index + 1}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">금리</p>
                <p className="font-semibold text-lg text-red-600">
                  {product.interestRate}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">최대 대출액</p>
                <p className="font-semibold">{product.maxAmount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">대출 기간</p>
                <p className="font-semibold">{product.loanPeriod}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">대출 조건</p>
                <p className="font-medium text-sm">
                  {getLoanConditions(product)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">특별 조건</p>
                <p className="font-medium text-sm">
                  {getSpecialConditions(product)}
                </p>
              </div>
            </div>

            {/* 계산된 최대 대출액 */}
            {product.calculatedMaxAmount && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  예상 연간 최대 대출 가능 금액:
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {formatAmountToKorean(product.calculatedMaxAmount / 10000)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 점수 기준표 모달 */}
      <ScoreCriteriaModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
      />
    </div>
  );
};

export default LoanResultComponent;
