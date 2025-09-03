import React, { useEffect } from "react";

const ScoreCriteriaModal = ({ isOpen, onClose }) => {
  // ESC 키 이벤트 처리
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 바깥 영역 클릭 처리
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            대출 상품 점수 기준표
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* 총점 구성 */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-3">
              🏆 총점 구성 (최대 21.5점)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700">
                      구분
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700">
                      항목
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700">
                      점수
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700">
                      세부 기준
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-medium bg-blue-50">
                      기본 점수
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      주거래 은행 보너스
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-semibold text-green-600">
                      1점
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      주거래 은행과 동일한 은행 상품
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="border border-gray-200 px-3 py-2 text-sm font-medium bg-yellow-50"
                      rowSpan="2"
                    >
                      금리 점수
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      평균 금리
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-semibold text-green-600">
                      1~5점
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      2.8% 이하: 5점
                      <br />
                      3.2% 이하: 4점
                      <br />
                      3.6% 이하: 3점
                      <br />
                      4.0% 이하: 2점
                      <br />
                      4.0% 초과: 1점
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      금리 스프레드 보너스
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-semibold text-green-600">
                      0.5점
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      금리 변동폭 1% 이하 (안정적)
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-medium bg-purple-50">
                      담보대출 전용
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      LTV 비율
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-semibold text-green-600">
                      1~5점
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      70% 이상: 5점
                      <br />
                      65% 이상: 4점
                      <br />
                      60% 이상: 3점
                      <br />
                      55% 이상: 2점
                      <br />
                      55% 미만: 1점
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="border border-gray-200 px-3 py-2 text-sm font-medium bg-green-50"
                      rowSpan="3"
                    >
                      편의성 점수
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      DSR 우대
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-semibold text-green-600">
                      1점
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      DSR 우대 조건 있음
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      비대면 편의성
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-semibold text-green-600">
                      1점
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      모바일 신청 가능
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      서류 간편성
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-semibold text-green-600">
                      1점
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      서류 간편함
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="border border-gray-200 px-3 py-2 text-sm font-medium bg-orange-50"
                      rowSpan="3"
                    >
                      우대 점수
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      청년/생애최초 우대
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-semibold text-green-600">
                      1점
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      해당 조건에 맞는 우대 상품
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      우대금리 폭
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-semibold text-green-600">
                      1점
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      우대금리 0.5% 이상
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      금리 유형 다양성
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-semibold text-green-600">
                      1점
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      3가지 이상 금리 유형 또는 선호 금리 포함
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="border border-gray-200 px-3 py-2 text-sm font-medium bg-pink-50"
                      rowSpan="2"
                    >
                      특별 점수
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      담보물 유형 매칭
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-semibold text-green-600">
                      0.5점
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      선호 담보 유형과 일치 (담보대출만)
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      기존 대출 없음 보너스
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-semibold text-green-600">
                      0.5점
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      기존 부채가 없는 경우
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="border border-gray-200 px-3 py-2 text-sm font-medium bg-indigo-50"
                      rowSpan="2"
                    >
                      전세대출 특화
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      서류 간편성 보너스
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-semibold text-green-600">
                      1.5점
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      전세대출에서 서류 간편시 추가 점수
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      비대면 편의성 보너스
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-semibold text-green-600">
                      1.5점
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      전세대출에서 모바일 가능시 추가 점수
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 점수 등급별 분류 */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-3">
              ⭐ 점수 등급별 분류
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">⭐⭐⭐⭐⭐</span>
                  <span className="font-semibold text-gray-800">
                    최고 우선 추천
                  </span>
                </div>
                <p className="text-sm text-gray-600">18점 이상</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">⭐⭐⭐⭐</span>
                  <span className="font-semibold text-gray-800">우수 추천</span>
                </div>
                <p className="text-sm text-gray-600">15~17.9점</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">⭐⭐⭐</span>
                  <span className="font-semibold text-gray-800">보통 추천</span>
                </div>
                <p className="text-sm text-gray-600">12~14.9점</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">⭐⭐</span>
                  <span className="font-semibold text-gray-800">기본 추천</span>
                </div>
                <p className="text-sm text-gray-600">9~11.9점</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">⭐</span>
                  <span className="font-semibold text-gray-800">참고 추천</span>
                </div>
                <p className="text-sm text-gray-600">6~8.9점</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">💡</span>
                  <span className="font-semibold text-gray-800">일반 추천</span>
                </div>
                <p className="text-sm text-gray-600">3~5.9점</p>
              </div>
            </div>
          </div>

          {/* 대출 유형별 특징 */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-3">
              🏦 대출 유형별 점수 특징
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold text-blue-800 mb-2">
                  🏠 담보대출
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>
                    • LTV 점수: 담보 가치 대비 대출 한도가 높을수록 높은 점수
                  </li>
                  <li>• 장기 대출: 남은 근무 연수를 고려한 장기적 관점</li>
                  <li>• 담보물 매칭: 선호하는 담보 유형과 일치시 추가 점수</li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                <h4 className="font-semibold text-green-800 mb-2">
                  🏢 전세자금대출
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>
                    • 편의성 중시: 서류 간편성과 비대면 편의성에 더 높은 가중치
                  </li>
                  <li>• 단기 대출: 연간 기준으로 계산</li>
                  <li>• 소득 중심: 담보보다 소득을 더 중요시</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreCriteriaModal;
