import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getVillageStories } from "../../../api/villageStoryApi";
import { getCookie } from "../../../util/cookieUtil";
import BoardPagination from "../common/BoardPagination";
import BoardCard from "../common/BoardCard";
import { getProvinces, getCities } from "../common/commonRegionsConfig";
import {
  PAGINATION,
  COLORS,
  LOADING_MESSAGES,
  DEFAULTS,
} from "../common/boardConstants";

const ListComponent = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 지역 필터링 상태
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // 주제 필터링 상태
  const [selectedTopics, setSelectedTopics] = useState([]);

  // 사용 가능한 주제 목록
  const availableTopics = [
    "맛집",
    "카페",
    "쇼핑",
    "문화/예술",
    "여가/레저",
    "교통",
    "주차",
    "안전",
    "개발/재개발",
    "교육",
    "자연",
  ];

  const itemsPerPage = PAGINATION.DEFAULT_PAGE_SIZE;

  useEffect(() => {
    loadBoards();
  }, [currentPage]);

  // boards가 로드되면 filteredBoards도 초기화
  useEffect(() => {
    setFilteredBoards(boards);
  }, [boards]);

  const loadBoards = async () => {
    try {
      setLoading(true);
      console.log("이야기 게시글 로딩 시작...");
      const response = await getVillageStories({
        page: currentPage - 1,
        size: itemsPerPage,
      });

      console.log("API 응답:", response);

      if (response && response.content) {
        setBoards(response.content);
        setTotalPages(response.totalPages);
        console.log("로딩된 게시글 수:", response.content.length);
      } else {
        console.log("응답에 content가 없습니다:", response);
        setBoards([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("게시글을 불러오는데 실패했습니다:", error);
      setBoards([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleWriteClick = () => {
    navigate("/board/village-story/add");
  };

  const handleBoardClick = (boardId) => {
    navigate(`/board/village-story/read/${boardId}`);
  };

  // 주소 파싱 함수
  const parseAddress = (address) => {
    if (!address) return { province: "", city: "", district: "" };

    const parts = address.split(" ");
    return {
      province: parts[0] || "",
      city: parts[1] || "",
      district: parts[2] || "",
    };
  };

  // 지역 및 주제 필터링 함수
  const filterBoardsByLocation = () => {
    let filtered = boards;

    // 지역 필터링
    if (selectedProvince || selectedCity) {
      filtered = filtered.filter((board) => {
        if (!board.roadAddress) return false;

        const addressInfo = parseAddress(board.roadAddress);

        const provinceMatch =
          !selectedProvince || addressInfo.province === selectedProvince;
        const cityMatch = !selectedCity || addressInfo.city === selectedCity;

        return provinceMatch && cityMatch;
      });
    }

    // 주제 필터링
    if (selectedTopics.length > 0) {
      filtered = filtered.filter((board) => {
        if (!board.topic) return false;

        const boardTopics = board.topic.split(", ");
        return selectedTopics.some((topic) => boardTopics.includes(topic));
      });
    }

    // 아무것도 선택하지 않았으면 모든 게시물 표시
    if (!selectedProvince && !selectedCity && selectedTopics.length === 0) {
      setFilteredBoards(boards);
    } else {
      setFilteredBoards(filtered);
    }

    setCurrentPage(1); // 필터링 후 첫 페이지로 이동
  };

  // 검색 버튼 클릭 시에만 필터링 실행
  const handleSearch = () => {
    filterBoardsByLocation();
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSelectedProvince("");
    setSelectedCity("");
    setSelectedTopics([]);
    setFilteredBoards(boards);
    setCurrentPage(1);
  };

  const provinces = getProvinces();
  const cities = getCities(selectedProvince);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <div>{LOADING_MESSAGES.LOADING}</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* 뒤로가기 버튼 */}
      <div style={{ marginBottom: "25px" }}>
        <button
          onClick={() => navigate("/community")}
          style={{
            padding: "10px 20px",
            backgroundColor: COLORS.SECONDARY,
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#5a6268";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = COLORS.SECONDARY;
          }}
        >
          ← 뒤로가기
        </button>
      </div>

      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "40px",
          backgroundColor: "white",
          borderBottom: `3px solid #3b82f6`,
          paddingBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div>
            <h1
              style={{
                margin: "0 0 5px 0",
                fontSize: "28px",
                fontWeight: "bold",
                color: "#3b82f6",
              }}
            >
              우리 마을 이야기
            </h1>
            <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
              내가 사는, 알고 있는 지역에 대한 정보를 공유해보세요.
            </p>
          </div>
        </div>

        <button
          onClick={handleWriteClick}
          style={{
            padding: "12px 24px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          이야기하기
        </button>
      </div>

      {/* 지역 및 주제 필터링 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "30px",
          gap: "25px",
          backgroundColor: "#e9ecef",
          borderRadius: "8px",
          marginBottom: "30px",
          maxHeight: "230px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          {/* 지역 선택 영역 */}
          <div
            style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}
          >
            <div style={{ minWidth: "120px", flexShrink: 0 }}>
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#555",
                  margin: "0 0 15px 0",
                  marginTop: "0",
                  marginLeft: "10px",
                }}
              >
                지역
              </h4>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "15px",
                alignItems: "flex-end",
                flex: 1,
              }}
            >
              {/* 시/도 선택 */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <label
                  style={{ fontSize: "14px", fontWeight: "500", color: "#666" }}
                >
                  시/도
                </label>
                <select
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value);
                    setSelectedCity(""); // 시/도 변경 시 시/군/구 초기화
                  }}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    minWidth: "120px",
                  }}
                >
                  <option value="">전체</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              {/* 시/군/구 선택 */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <label
                  style={{ fontSize: "14px", fontWeight: "500", color: "#666" }}
                >
                  시/군/구
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedProvince}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    minWidth: "120px",
                    backgroundColor: !selectedProvince ? "#f8f9fa" : "white",
                  }}
                >
                  <option value="">전체</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 주제 선택 영역 */}
          <div
            style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}
          >
            <div style={{ minWidth: "120px", flexShrink: 0 }}>
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#555",
                  margin: "0 0 15px 0",
                  marginTop: "0",
                  marginLeft: "10px",
                }}
              >
                주제
              </h4>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "15px",
                alignItems: "center",
                flex: 1,
              }}
            >
              {availableTopics.map((topic) => (
                <label
                  key={topic}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#333",
                    padding: "8px 12px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTopics([...selectedTopics, topic]);
                      } else {
                        setSelectedTopics(
                          selectedTopics.filter((t) => t !== topic)
                        );
                      }
                    }}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: "#3b82f6",
                    }}
                  />
                  <span style={{ fontWeight: "500" }}>{topic}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 검색 및 초기화 버튼 */}
          <div
            style={{ display: "flex", gap: "15px", justifyContent: "flex-end" }}
          >
            <button
              onClick={handleResetFilters}
              style={{
                padding: "10px 20px",
                backgroundColor: COLORS.LIGHT,
                color: COLORS.DARK,
                border: "1px solid #dee2e6",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                position: "relative",
                top: "-60px",
              }}
            >
              초기화
            </button>
            <button
              onClick={handleSearch}
              style={{
                padding: "10px 20px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                position: "relative",
                top: "-60px",
              }}
            >
              검색
            </button>
          </div>
        </div>
      </div>

      {/* 게시글 목록 */}
      <div style={{ marginTop: "40px" }}>
        {filteredBoards.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "100px 20px",
              color: "#666",
              fontSize: "18px",
            }}
          >
            {selectedProvince || selectedCity ? (
              <>
                선택한 지역에 해당하는 이야기가 없습니다.
                <br />
                다른 지역을 선택하거나 전체 지역을 확인해보세요!
              </>
            ) : (
              <>
                {DEFAULTS.NO_DATA}
                <br />첫 번째 이야기를 작성해보세요!
              </>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "20px",
            }}
          >
            {filteredBoards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onClick={handleBoardClick}
                showImage={true}
                showLocation={true}
                showCategory={false}
                showDate={true}
                showViews={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      <BoardPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
};

export default ListComponent;
