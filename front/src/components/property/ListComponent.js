import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPropertyList, likeProperty } from "../../api/propertyApi";
import { formatAmountToKorean } from "../../util/currencyUtil";
import useModal from "../../hooks/useModal";
import ResultModal from "../common/ResultModal";
import { getCurrentUser } from "../../util/jwtUtil";

const ListComponent = () => {
  const navigate = useNavigate();
  const { modalState, showModal, handleModalClose } = useModal();

  const [propertyList, setPropertyList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("");

  const propertyTypes = [
    "전체",
    "아파트",
    "오피스텔",
    "연립/다세대",
    "단독주택",
    "상가",
    "사무실",
    "기타",
  ];

  useEffect(() => {
    loadPropertyList();
  }, [currentPage, searchTerm, propertyType]); // 검색어와 매물 유형 변경 시에도 다시 로드

  const loadPropertyList = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentUser = getCurrentUser();
      const memberEmail = currentUser ? currentUser.email : null;

      const response = await getPropertyList({
        page: currentPage - 1, // 백엔드는 0부터 시작
        size: 50, // 한 번에 더 많은 매물 가져오기
        search: searchTerm,
        propertyType: propertyType === "전체" ? "" : propertyType,
        memberEmail: memberEmail,
      });

      console.log("매물 목록 응답:", response);

      // 페이지네이션된 응답 처리
      let properties = [];
      if (response && response.content && Array.isArray(response.content)) {
        properties = response.content;
        setTotalPages(response.totalPages || 1);
      } else if (response && Array.isArray(response)) {
        // 이전 버전 호환성을 위한 처리
        properties = response;
        setTotalPages(1);
      } else {
        properties = [];
        setTotalPages(1);
      }

      // 이미지 데이터 확인
      if (properties.length > 0) {
        properties.forEach((property, index) => {
          console.log(
            `Property ${index}: ID=${property.id}, 이미지 개수=${
              property.imageUrls ? property.imageUrls.length : 0
            }`
          );
          if (property.imageUrls && property.imageUrls.length > 0) {
            console.log(`Property ${index} 이미지 URLs:`, property.imageUrls);
          }
        });
      }

      // 거래 상태에 따라 정렬: 거래 진행중인 매물을 먼저, 거래완료된 매물을 나중에
      if (properties.length > 0) {
        const sortedProperties = properties.sort((a, b) => {
          const aIsCompleted =
            a.transactionStatus === 0 || a.status === "거래완료";
          const bIsCompleted =
            b.transactionStatus === 0 || b.status === "거래완료";

          if (aIsCompleted === bIsCompleted) {
            return 0; // 둘 다 같으면 원래 순서 유지
          }
          return aIsCompleted ? 1 : -1; // 거래완료된 매물을 뒤로
        });

        setPropertyList(sortedProperties);
      } else {
        setPropertyList([]);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "매물 목록을 불러오는데 실패했습니다.";
      setError(errorMsg);
      showModal("오류", errorMsg, () => {});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // loadPropertyList는 useEffect에서 자동으로 호출됨
  };

  const handlePropertyClick = (propertyId) => {
    navigate(`/property/read/${propertyId}`);
  };

  const handleLikeClick = async (propertyId) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.email) {
        showModal("알림", "로그인이 필요합니다.", () => {});
        return;
      }

      await likeProperty(propertyId, currentUser.email);

      // 매물 목록 새로고침하여 좋아요 상태 업데이트
      await loadPropertyList();

      // 성공 모달 제거 - 좋아요 상태가 시각적으로 변경되어 사용자가 알 수 있음
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      showModal("오류", "좋아요 처리에 실패했습니다.", () => {});
    }
  };

  const formatPrice = (price) => {
    if (!price) return "가격 협의";
    return formatAmountToKorean(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadPropertyList}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">매물 목록</h1>
          <button
            onClick={() => navigate("/property/add")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            매물 등록
          </button>
        </div>
        <p className="text-gray-600">다양한 매물을 둘러보고 찾아보세요</p>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="매물 제목이나 주소로 검색하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={propertyType}
              onChange={(e) => {
                setPropertyType(e.target.value);
                setCurrentPage(1); // 매물 유형 변경 시 페이지 리셋
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            검색
          </button>
        </form>
      </div>

      {/* 매물 목록 */}
      {propertyList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <div className="text-gray-400 text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            등록된 매물이 없습니다
          </h3>
          <p className="text-gray-500 mb-4">첫 번째 매물을 등록해보세요!</p>
          <button
            onClick={() => navigate("/property/add")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            매물 등록하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {propertyList.map((property) => (
            <div
              key={property.id}
              onClick={() => handlePropertyClick(property.id)}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* 매물 이미지 */}
              <div className="h-48 bg-gray-200 overflow-hidden relative">
                {(() => {
                  console.log(
                    `Property ${property.id} 이미지 URLs:`,
                    property.imageUrls
                  );
                  return property.imageUrls && property.imageUrls.length > 0 ? (
                    <img
                      src={`${
                        process.env.REACT_APP_BACKEND_URL ||
                        "http://localhost:8080"
                      }/files/${property.imageUrls[0]}`}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`이미지 로드 실패: ${e.target.src}`);
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null;
                })()}
                <div
                  className={`w-full h-full flex items-center justify-center text-gray-400 ${
                    property.imageUrls && property.imageUrls.length > 0
                      ? "hidden"
                      : ""
                  }`}
                >
                  <span className="text-4xl">🏠</span>
                </div>

                {/* 좋아요 버튼 - 우측 상단 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeClick(property.id);
                  }}
                  className="absolute top-3 right-3 z-20 hover:scale-110 transition-transform duration-200"
                >
                  <span className="text-2xl drop-shadow-lg">
                    {property.isLiked ? "❤️" : "🤍"}
                  </span>
                </button>

                {/* 거래완료 오버레이 */}
                {(property.transactionStatus === 0 ||
                  property.status === "거래완료") && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
                    <div className="text-white font-bold text-lg bg-red-600 bg-opacity-90 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
                      🏠 거래완료
                    </div>
                  </div>
                )}
              </div>

              {/* 매물 정보 */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {property.propertyType}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(property.createdAt)}
                  </span>
                </div>

                <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                  {property.title}
                </h3>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">가격:</span>
                    <span className="text-blue-600">
                      {formatPrice(property.price)}
                    </span>
                  </div>

                  {property.area && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">면적:</span>
                      <span>{property.area}㎡</span>
                    </div>
                  )}

                  {property.rooms && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">방:</span>
                      <span>{property.rooms}개</span>
                    </div>
                  )}

                  {property.roadAddress && (
                    <div className="text-sm text-gray-600">
                      <span className="line-clamp-1">
                        {property.roadAddress}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>조회수: {property.viewCount || 0}</span>
                    <span>❤️ {property.likeCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 - 현재는 비활성화 */}
      {/* {totalPages > 1 && (
        <div className="mt-8">
          <PageComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )} */}

      {/* 결과 모달 */}
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

export default ListComponent;
