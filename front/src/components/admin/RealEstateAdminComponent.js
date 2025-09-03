import React, { useState, useEffect } from "react";
import { realEstateAdminApiService } from "../../api/realEstateAdminApi";

const RealEstateAdminComponent = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedDataType, setSelectedDataType] = useState("apartment-sale");

  const dataTypes = [
    {
      value: "apartment-sale",
      label: "아파트 매매",
      api: realEstateAdminApiService.apartmentSale,
    },
    {
      value: "apartment-rent",
      label: "아파트 전/월세",
      api: realEstateAdminApiService.apartmentRent,
    },
    {
      value: "detached-house-sale",
      label: "단독/다가구 매매",
      api: realEstateAdminApiService.detachedHouseSale,
    },
    {
      value: "detached-house-rent",
      label: "단독/다가구 전/월세",
      api: realEstateAdminApiService.detachedHouseRent,
    },
    {
      value: "row-house-sale",
      label: "연립/다세대 매매",
      api: realEstateAdminApiService.rowHouseSale,
    },
    {
      value: "row-house-rent",
      label: "연립/다세대 전/월세",
      api: realEstateAdminApiService.rowHouseRent,
    },
    {
      value: "office-tel-sale",
      label: "오피스텔 매매",
      api: realEstateAdminApiService.officeTelSale,
    },
    {
      value: "office-tel-rent",
      label: "오피스텔 전/월세",
      api: realEstateAdminApiService.officeTelRent,
    },
  ];

  const currentApi = dataTypes.find(
    (type) => type.value === selectedDataType
  )?.api;

  useEffect(() => {
    loadData();
  }, [selectedDataType, currentPage]);

  const loadData = async () => {
    if (!currentApi) return;

    setLoading(true);
    try {
      const response = await currentApi.getAll(currentPage, 20);
      console.log("실거래가 데이터 응답 전체:", response);
      console.log("응답 타입:", typeof response);
      console.log("응답 키들:", Object.keys(response));

      // Spring Boot Page 객체 구조 확인
      if (response && typeof response === "object") {
        // Spring Boot Page 객체의 표준 구조 확인
        if (response.content !== undefined && Array.isArray(response.content)) {
          // Spring Boot Page 객체
          setDataList(response.content);
          setTotalPages(response.totalPages || 1);
          console.log(
            `✅ Spring Boot Page 객체 파싱 성공 - 데이터 ${response.content.length}개, 총 페이지 ${response.totalPages}개`
          );
          console.log("첫 번째 데이터 샘플:", response.content[0]);
        } else if (Array.isArray(response)) {
          // 배열 형태로 직접 반환된 경우
          setDataList(response);
          setTotalPages(1);
          console.log(`✅ 배열 형태 - 데이터 ${response.length}개`);
        } else {
          // 다른 형태의 응답 - 더 자세한 로깅
          console.warn("⚠️ 예상치 못한 응답 형태:", response);
          console.warn("응답 구조:", JSON.stringify(response, null, 2));
          setDataList([]);
          setTotalPages(1);
        }
      } else {
        console.error("❌ 응답이 null이거나 객체가 아님");
        setDataList([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      alert("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const response = await currentApi.delete(id);
      console.log("삭제 응답:", response);

      // 삭제 성공 여부 확인
      if (
        response &&
        (response.success === true || response.success === "true")
      ) {
        alert(response.message || "데이터가 삭제되었습니다.");
        loadData(); // 목록 새로고침
      } else {
        alert("삭제가 완료되었습니다.");
        loadData(); // 목록 새로고침
      }
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleSave = async (formData) => {
    try {
      await currentApi.create(formData);
      alert("데이터가 등록되었습니다.");
      loadData();
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장에 실패했습니다.");
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await currentApi.update(id, formData);
      alert("데이터가 수정되었습니다.");
      loadData();
    } catch (error) {
      console.error("수정 실패:", error);
      alert("수정에 실패했습니다.");
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDataTypeChange = (newType) => {
    setSelectedDataType(newType);
    setCurrentPage(0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        실거래가 데이터 관리
      </h1>

      {/* 데이터 타입 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          데이터 타입 선택
        </label>
        <select
          value={selectedDataType}
          onChange={(e) => handleDataTypeChange(e.target.value)}
          className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {dataTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* 데이터 목록 */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {dataTypes.find((type) => type.value === selectedDataType)?.label}{" "}
            데이터
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  시군구
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  단지명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  전용면적
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  계약일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  거래금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  동
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  층
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  준공년도
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  도로명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                console.log("🔍 테이블 렌더링 시작 - dataList:", dataList);
                console.log("dataList 길이:", dataList.length);
                console.log(
                  "dataList 타입:",
                  Array.isArray(dataList) ? "배열" : typeof dataList
                );

                if (!Array.isArray(dataList) || dataList.length === 0) {
                  console.log("📝 데이터가 없거나 배열이 아님");
                  return (
                    <tr>
                      <td
                        colSpan="11"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        {dataList.length === 0
                          ? "데이터가 없습니다."
                          : "데이터 형식이 올바르지 않습니다."}
                      </td>
                    </tr>
                  );
                }

                return dataList.map((item, index) => {
                  console.log(`📋 테이블 행 ${index}:`, item);
                  const itemId = item.id || item.no || index;
                  console.log(`   행 ${index}의 ID:`, itemId);

                  // 거래금액을 '억' 단위로 변환
                  const formatTransactionAmount = (amount) => {
                    if (amount >= 10000) {
                      return `${(amount / 10000).toFixed(1)}억`;
                    } else {
                      return `${amount}만원`;
                    }
                  };

                  return (
                    <tr key={itemId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.no || item.id || itemId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.sigungu || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.complexName || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.exclusiveArea ? `${item.exclusiveArea}㎡` : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.contractDate || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {item.transactionAmount
                          ? formatTransactionAmount(item.transactionAmount)
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.dong || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.floor !== undefined ? `${item.floor}층` : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.constructionYear || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.roadName || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(itemId)}
                          className="text-red-600 hover:text-red-900 mr-3"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealEstateAdminComponent;
