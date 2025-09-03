import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../util/cookieUtil";
import { getVillageStories } from "../api/villageStoryApi";
import { getRealEstateQnas } from "../api/realEstateQnaApi";
import { getVillageQnas } from "../api/villageQnaApi";
import { API_SERVER_HOST } from "../api/backendApi";

const CommunityMainPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [realEstateBoards, setRealEstateBoards] = useState([]);
  const [neighborhoodStoryBoards, setNeighborhoodStoryBoards] = useState([]);
  const [neighborhoodQnABoards, setNeighborhoodQnABoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storyLoading, setStoryLoading] = useState(false);
  const [qnaLoading, setQnaLoading] = useState(false);

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  useEffect(() => {
    const memberInfo = getCookie("member");
    if (memberInfo) {
      setUserInfo(memberInfo);
    }
    
    // 페이지 맨 위로 스크롤
    window.scrollTo(0, 0);
  }, []);

  // 부동산 Q&A 게시물 가져오기
  useEffect(() => {
    const loadRealEstateBoards = async () => {
      try {
        setLoading(true);
        console.log("부동산 Q&A 게시물 로딩 시작...");
        const response = await getRealEstateQnas({
          page: 0,
          size: 5,
        });

        console.log("부동산 Q&A API 응답:", response);

        // 응답 데이터 검증 강화
        if (response && response.content && Array.isArray(response.content)) {
          console.log(
            "부동산 Q&A 응답 데이터 검증 성공, content 길이:",
            response.content.length
          );

          // 최신 게시물 5개까지 가져오기
          const recentBoards = response.content.slice(0, 5);
          setRealEstateBoards(recentBoards);
          console.log(
            "부동산 Q&A 게시물 필터링 결과:",
            recentBoards.length,
            "개"
          );
        } else {
          console.log("부동산 Q&A 응답 데이터 검증 실패:", response);
          setRealEstateBoards([]);
        }
      } catch (error) {
        console.error("부동산 Q&A 게시물 로딩 실패:", error);
        setRealEstateBoards([]);
      } finally {
        setLoading(false);
      }
    };

    loadRealEstateBoards();
  }, []);

  // 우리 마을 이야기 게시물 가져오기
  useEffect(() => {
    const loadNeighborhoodStoryBoards = async () => {
      try {
        setStoryLoading(true);
        console.log("우리 마을 이야기 게시물 로딩 시작...");
        const response = await getVillageStories({
          page: 0,
          size: 5,
        });

        console.log("우리 마을 이야기 API 응답:", response);

        // 응답 데이터 검증 강화
        if (response && response.content && Array.isArray(response.content)) {
          console.log(
            "우리 마을 이야기 응답 데이터 검증 성공, content 길이:",
            response.content.length
          );

          // 최신 게시물 5개까지 가져오기
          const recentStoryBoards = response.content.slice(0, 5);
          setNeighborhoodStoryBoards(recentStoryBoards);
          console.log(
            "우리 마을 이야기 게시물 필터링 결과:",
            recentStoryBoards.length,
            "개"
          );
        } else {
          console.log("우리 마을 이야기 응답 데이터 검증 실패:", response);
          setNeighborhoodStoryBoards([]);
        }
      } catch (error) {
        console.error("우리 마을 이야기 게시물 로딩 실패:", error);
        setNeighborhoodStoryBoards([]);
      } finally {
        setStoryLoading(false);
      }
    };

    loadNeighborhoodStoryBoards();
  }, []);

  // 우리 마을 Q&A 게시물 가져오기
  useEffect(() => {
    const loadNeighborhoodQnABoards = async () => {
      try {
        setQnaLoading(true);
        console.log("우리 마을 Q&A 게시물 로딩 시작...");
        const response = await getVillageQnas({
          page: 0,
          size: 4,
        });

        console.log("우리 마을 Q&A API 응답:", response);

        // 응답 데이터 검증 강화
        if (response && response.content && Array.isArray(response.content)) {
          console.log(
            "우리 마을 Q&A 응답 데이터 검증 성공, content 길이:",
            response.content.length
          );

          // 최신 게시물 4개까지 가져오기
          const recentQnaBoards = response.content.slice(0, 4);
          setNeighborhoodQnABoards(recentQnaBoards);
          console.log(
            "우리 마을 Q&A 게시물 필터링 결과:",
            recentQnaBoards.length,
            "개"
          );
        } else {
          console.log("우리 마을 Q&A 응답 데이터 검증 실패:", response);
          setNeighborhoodQnABoards([]);
        }
      } catch (error) {
        console.error("우리 마을 Q&A 게시물 로딩 실패:", error);
        setNeighborhoodQnABoards([]);
      } finally {
        setQnaLoading(false);
      }
    };

    loadNeighborhoodQnABoards();
  }, []);

  // 각 섹션 클릭 핸들러
  const handleNeighborhoodStory = () => {
    navigate("/board/village-story");
    window.scrollTo(0, 0);
  };

  const handleNeighborhoodQnA = () => {
    navigate("/board/village-qna");
    window.scrollTo(0, 0);
  };

  const handleRealEstateQnA = () => {
    navigate("/board/real-estate-qna");
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* 메인 콘텐츠 */}
      <div style={{ display: "flex", gap: "30px" }}>
        {/* 왼쪽 열 */}
        <div style={{ flex: 2 }}>
          {/* 우리 마을 이야기 섹션 */}
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e9ecef",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "30px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              minHeight: "512px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                우리 마을 이야기
              </h2>
              <button
                onClick={handleNeighborhoodStory}
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200 hover:bg-blue-600 cursor-pointer"
              >
                더보기
              </button>
            </div>

            {storyLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#666",
                }}
              >
                게시물을 불러오는 중...
              </div>
            ) : neighborhoodStoryBoards.length > 0 ? (
              <>
                {/* 게시글 1 (전체 표시) */}
                <div
                  onClick={() => {
                    if (neighborhoodStoryBoards[0]?.id) {
                      navigate(
                        `/board/village-story/read/${neighborhoodStoryBoards[0].id}`
                      );
                    } else {
                      handleNeighborhoodStory();
                    }
                  }}
                  style={{
                    padding: "5px 15px",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    minHeight: "190px",
                    display: "flex",
                    gap: "20px",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => {
                    if (neighborhoodStoryBoards[0]?.id) {
                      e.currentTarget.style.backgroundColor = "#e9ecef";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (neighborhoodStoryBoards[0]?.id) {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                      e.currentTarget.style.transform = "translateY(0)";
                    }
                  }}
                >
                  {/* 썸네일 이미지 - 왼쪽 */}
                  {neighborhoodStoryBoards[0]?.imageUrls &&
                    neighborhoodStoryBoards[0].imageUrls.length > 0 && (
                      <div
                        style={{
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={`${API_SERVER_HOST}${neighborhoodStoryBoards[0].imageUrls[0]}`}
                          alt="게시글 썸네일"
                          style={{
                            width: "180px",
                            height: "180px",
                            objectFit: "contain",
                            borderRadius: "8px",
                            border: "1px solid #e9ecef",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            backgroundColor: "#f8f9fa",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                  {/* 정보 - 오른쪽 */}
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: "0 0 10px 0",
                        fontSize: "18px",
                        fontWeight: "600",
                        wordBreak: "break-word",
                        overflow: "hidden",
                        lineHeight: "1.3",
                      }}
                    >
                      {neighborhoodStoryBoards[0].title}
                    </h3>
                    <p
                      style={{
                        margin: "0 0 10px 0",
                        color: "#666",
                        fontSize: "14px",
                      }}
                    >
                      위치:{" "}
                      {neighborhoodStoryBoards[0].roadAddress ||
                        "위치 정보 없음"}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        color: "#333",
                        fontSize: "14px",
                        lineHeight: "1.5",
                      }}
                    >
                      {neighborhoodStoryBoards[0].content
                        ? neighborhoodStoryBoards[0].content.length > 100
                          ? neighborhoodStoryBoards[0].content.substring(
                              0,
                              100
                            ) + "..."
                          : neighborhoodStoryBoards[0].content
                        : "내용이 없습니다."}
                    </p>
                  </div>
                </div>

                {/* 게시글 2-3 (첫 번째 줄) */}
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    whiteSpace: "nowrap",
                    marginBottom: "15px",
                  }}
                >
                  {neighborhoodStoryBoards.slice(1, 3).map((board, index) => (
                    <div
                      key={board.id}
                      onClick={() => {
                        if (board?.id) {
                          navigate(`/board/village-story/read/${board.id}`);
                        } else {
                          handleNeighborhoodStory();
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "5px 15px",
                        backgroundColor: "#fff",
                        border: "1px solid #dee2e6",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        minHeight: "110px",
                        display: "flex",
                        gap: "15px",
                        alignItems: "center",
                      }}
                      onMouseEnter={(e) => {
                        if (board?.id) {
                          e.currentTarget.style.backgroundColor = "#f8f9fa";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (board?.id) {
                          e.currentTarget.style.backgroundColor = "#fff";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      {/* 썸네일 이미지 - 왼쪽 */}
                      {board?.imageUrls && board.imageUrls.length > 0 && (
                        <div
                          style={{
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={`${API_SERVER_HOST}${board.imageUrls[0]}`}
                            alt="게시글 썸네일"
                            style={{
                              width: "120px",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "6px",
                              border: "1px solid #e9ecef",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      {/* 정보 - 오른쪽 */}
                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            margin: "0 0 5px 0",
                            fontSize: "16px",
                            fontWeight: "500",
                            wordBreak: "break-word",
                            overflow: "hidden",
                            lineHeight: "1.3",
                            textOverflow: "ellipsis",
                            width: "50%",
                            maxWidth: "300px",
                            minWidth: "120px",
                          }}
                        >
                          {board.title}
                        </h4>
                        <p
                          style={{ margin: 0, color: "#666", fontSize: "12px" }}
                        >
                          {board.roadAddress || "위치 정보 없음"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 게시글 4-5 (두 번째 줄) */}
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {neighborhoodStoryBoards.slice(3, 5).map((board, index) => (
                    <div
                      key={board.id}
                      onClick={() => {
                        if (board?.id) {
                          navigate(`/board/village-story/read/${board.id}`);
                        } else {
                          handleNeighborhoodStory();
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "5px 15px",
                        backgroundColor: "#fff",
                        border: "1px solid #dee2e6",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        minHeight: "110px",
                        display: "flex",
                        gap: "15px",
                        alignItems: "center",
                      }}
                      onMouseEnter={(e) => {
                        if (board?.id) {
                          e.currentTarget.style.backgroundColor = "#f8f9fa";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (board?.id) {
                          e.currentTarget.style.backgroundColor = "#fff";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      {/* 썸네일 이미지 - 왼쪽 */}
                      {board?.imageUrls && board.imageUrls.length > 0 && (
                        <div
                          style={{
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={`${API_SERVER_HOST}${board.imageUrls[0]}`}
                            alt="게시글 썸네일"
                            style={{
                              width: "120px",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "6px",
                              border: "1px solid #e9ecef",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      {/* 정보 - 오른쪽 */}
                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            margin: "0 0 5px 0",
                            fontSize: "16px",
                            fontWeight: "500",
                            wordBreak: "break-word",
                            overflow: "hidden",
                            lineHeight: "1.3",
                            textOverflow: "ellipsis",
                            width: "50%",
                            maxWidth: "300px",
                            minWidth: "120px",
                          }}
                        >
                          {board.title}
                        </h4>
                        <p
                          style={{ margin: 0, color: "#666", fontSize: "12px" }}
                        >
                          {board.roadAddress || "위치 정보 없음"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#666",
                }}
              >
                아직 우리 마을 이야기가 없습니다.
                <br />
                <small style={{ color: "#999" }}>
                  (API 응답: {JSON.stringify(neighborhoodStoryBoards)})
                </small>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽 열 */}
        <div style={{ flex: 1 }}>
          {/* 부동산 관련 사기 AD 섹션 */}
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e9ecef",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "14px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              minHeight: "400px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "46px" }}>
              <h3
                style={{
                  margin: "0 0 15px 0",
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#d32f2f",
                }}
              >
                🚨 부동산 사기 예방 가이드
              </h3>
            </div>

            {/* 사기 유형별 안내 */}
            <div style={{ marginBottom: "20px" }}>
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: "10px",
                }}
              >
                주요 사기 유형
              </h4>
              <div
                style={{ fontSize: "12px", lineHeight: "1.6", color: "#555" }}
              >
                <p style={{ margin: "8px 0" }}>
                  • <strong>가짜 매물</strong>: 존재하지 않는 매물로 계약금만
                  받고 사라짐
                </p>
                <p style={{ margin: "8px 0" }}>
                  • <strong>중개수수료 사기</strong>: 거래 전에 수수료만 받고
                  연락두절
                </p>
                <p style={{ margin: "8px 0" }}>
                  • <strong>가격 조작</strong>: 실제보다 높은 가격으로 매물 정보
                  조작
                </p>
                <p style={{ margin: "8px 0" }}>
                  • <strong>허위 계약</strong>: 가짜 서류로 부동산 거래 사칭
                </p>
              </div>
            </div>

            {/* 예방 방법 */}
            <div style={{ marginBottom: "20px" }}>
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: "10px",
                }}
              >
                예방 방법
              </h4>
              <div
                style={{ fontSize: "12px", lineHeight: "1.6", color: "#555" }}
              >
                <p style={{ margin: "8px 0" }}>✅ 공인중개사 자격증 확인</p>
                <p style={{ margin: "8px 0" }}>✅ 부동산 등기부등본 확인</p>
                <p style={{ margin: "8px 0" }}>✅ 현장 직접 방문 필수</p>
                <p style={{ margin: "8px 0" }}>✅ 계약서 전문가 검토</p>
              </div>
            </div>

            {/* 신고 안내 */}
            <div
              style={{
                backgroundColor: "#fff3cd",
                border: "1px solid #ffeaa7",
                borderRadius: "6px",
                padding: "15px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#856404",
                }}
              >
                의심스러운 거래가 있다면?
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#856404",
                }}
              >
                국토교통부 부동산 사기 신고센터
                <br />
                📞 1588-0119
              </p>
              <a
                href="https://www.budongsan24.kr/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  backgroundColor: "#d32f2f",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontSize: "12px",
                  fontWeight: "500",
                  marginTop: "10px",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#b71c1c";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#d32f2f";
                }}
              >
                🏠 부동산 불법행위 신고센터 바로가기
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Q&A 섹션들을 가로로 나란히 배치 */}
      <div style={{ display: "flex", gap: "30px", marginTop: "-10px" }}>
        {/* 부동산 Q&A 섹션 */}
        <div
          style={{
            flex: 1,
            width: "50%",
            backgroundColor: "#fff",
            border: "1px solid #e9ecef",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              부동산 Q&A
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={handleRealEstateQnA}
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200 hover:bg-blue-600 cursor-pointer"
              >
                더보기
              </button>
            </div>
          </div>

          {/* 게시글들을 세로로 배치 */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#666",
                }}
              >
                게시물을 불러오는 중...
              </div>
            ) : realEstateBoards.length > 0 ? (
              <>
                {/* 게시글 1 (전체 표시) - 전체 너비 사용 */}
                <div
                  onClick={() =>
                    navigate(`/board/real-estate-qna/read/${realEstateBoards[0].id}`)
                  }
                  style={{
                    width: "100%",
                    padding: "25px",
                    backgroundColor: "#fffef7",
                    border: "1px solid #ffeaa7",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    minHeight: "200px",
                    display: "flex",
                    flexDirection: "row",
                    gap: "20px",
                    alignItems: "flex-start",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffeaa7";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fffef7";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: "0 0 15px 0",
                        fontSize: "22px",
                        fontWeight: "600",
                        wordBreak: "break-word",
                        overflow: "hidden",
                        lineHeight: "1.3",
                      }}
                    >
                      {realEstateBoards[0].title}
                    </h3>
                    <span
                      style={{
                        color: "#666",
                        fontSize: "14px",
                        backgroundColor: "#f8f9fa",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        border: "1px solid #e9ecef",
                        whiteSpace: "nowrap",
                        marginBottom: "15px",
                        display: "inline-block",
                      }}
                    >
                      {realEstateBoards[0].roadAddress || "동네 정보 없음"}
                    </span>
                    <p
                      style={{
                        margin: 0,
                        color: "#333",
                        fontSize: "15px",
                        lineHeight: "1.6",
                      }}
                    >
                      {realEstateBoards[0].content
                        ? realEstateBoards[0].content.length > 150
                          ? realEstateBoards[0].content.substring(0, 150) +
                            "..."
                          : realEstateBoards[0].content
                        : "내용이 없습니다."}
                    </p>
                  </div>

                  {/* 썸네일 이미지 */}
                  {realEstateBoards[0].imageUrls &&
                  realEstateBoards[0].imageUrls.length > 0 ? (
                    <div style={{ flexShrink: 0 }}>
                      <img
                        src={`${API_SERVER_HOST}${realEstateBoards[0].imageUrls[0]}`}
                        alt="게시글 썸네일"
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          border: "1px solid #e9ecef",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        flexShrink: 0,
                        width: "150px",
                        height: "150px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "6px",
                        border: "1px solid #e9ecef",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                        fontSize: "12px",
                      }}
                    >
                      이미지 없음
                    </div>
                  )}
                </div>

                {/* 게시글 2-3 (세로로 배치) */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  {realEstateBoards.slice(1, 3).map((board, index) => (
                    <div
                      key={board.id}
                      onClick={() =>
                        navigate(`/board/real-estate-qna/read/${board.id}`)
                      }
                      style={{
                        padding: "20px",
                        backgroundColor: "#fff",
                        border: "1px solid #dee2e6",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        flexDirection: "row",
                        gap: "15px",
                        alignItems: "center",
                        minHeight: "100px",
                        width: "100%",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#fff";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* 게시글 정보 - 왼쪽에 배치 */}
                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            margin: "0 0 8px 0",
                            fontSize: "16px",
                            fontWeight: "500",
                            lineHeight: "1.3",
                            wordBreak: "break-word",
                            overflow: "hidden",
                            color: "#333",
                          }}
                        >
                          {board.title}
                        </h4>
                        <span
                          style={{
                            color: "#666",
                            fontSize: "11px",
                            backgroundColor: "#f8f9fa",
                            padding: "3px 6px",
                            borderRadius: "10px",
                            border: "1px solid #e9ecef",
                            whiteSpace: "nowrap",
                            display: "inline-block",
                          }}
                        >
                          {board.roadAddress || "동네 정보 없음"}
                        </span>
                      </div>

                      {/* 썸네일 이미지 - 오른쪽에 배치 */}
                      {board.imageUrls && board.imageUrls.length > 0 ? (
                        <div style={{ flexShrink: 0 }}>
                          <img
                            src={`${API_SERVER_HOST}${board.imageUrls[0]}`}
                            alt="게시글 썸네일"
                            style={{
                              width: "70px",
                              height: "70px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              border: "1px solid #e9ecef",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            flexShrink: 0,
                            width: "70px",
                            height: "70px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "4px",
                            border: "1px solid #e9ecef",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#999",
                            fontSize: "10px",
                          }}
                        >
                          이미지 없음
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#666",
                }}
              >
                아직 부동산 Q&A가 없습니다.
                <br />
                <small style={{ color: "#999" }}>
                  (API 응답: {JSON.stringify(realEstateBoards)})
                </small>
              </div>
            )}
          </div>
        </div>
        {/* 우리 마을 Q&A 섹션 */}
        <div
          style={{
            flex: 1,
            width: "50%",
            backgroundColor: "#fff",
            border: "1px solid #e9ecef",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              우리 마을 Q&A
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <button
                onClick={handleNeighborhoodQnA}
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200 hover:bg-blue-600 cursor-pointer"
              >
                더보기
              </button>
            </div>
          </div>

          {/* 게시글들을 세로로 배치 */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {qnaLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#666",
                }}
              >
                게시물을 불러오는 중...
              </div>
            ) : neighborhoodQnABoards.length > 0 ? (
              <>
                {/* 게시글 1 (전체 표시) - 전체 너비 사용 */}
                <div
                  onClick={() => {
                    if (neighborhoodQnABoards[0]?.id) {
                      navigate(
                        `/board/village-qna/read/${neighborhoodQnABoards[0].id}`
                      );
                    } else {
                      handleNeighborhoodQnA();
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "25px",
                    backgroundColor: "#fffef7",
                    border: "1px solid #ffeaa7",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    minHeight: "200px",
                    display: "flex",
                    flexDirection: "row",
                    gap: "20px",
                    alignItems: "flex-start",
                  }}
                  onMouseEnter={(e) => {
                    if (neighborhoodQnABoards[0]?.id) {
                      e.currentTarget.style.backgroundColor = "#ffeaa7";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (neighborhoodQnABoards[0]?.id) {
                      e.currentTarget.style.backgroundColor = "#fffef7";
                      e.currentTarget.style.transform = "translateY(0)";
                    }
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "22px",
                        fontWeight: "600",
                        wordBreak: "break-word",
                        overflow: "hidden",
                        lineHeight: "1.3",
                      }}
                    >
                      {neighborhoodQnABoards[0].title}
                    </h3>
                    <span
                      style={{
                        color: "#666",
                        fontSize: "14px",
                        backgroundColor: "#f8f9fa",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        border: "1px solid #e9ecef",
                        whiteSpace: "nowrap",
                        marginBottom: "15px",
                        display: "inline-block",
                      }}
                    >
                      {neighborhoodQnABoards[0].roadAddress || "동네 정보 없음"}
                    </span>
                    <p
                      style={{
                        margin: 0,
                        color: "#333",
                        fontSize: "15px",
                        lineHeight: "1.6",
                      }}
                    >
                      {neighborhoodQnABoards[0].content
                        ? neighborhoodQnABoards[0].content.length > 150
                          ? neighborhoodQnABoards[0].content.substring(0, 150) +
                            "..."
                          : neighborhoodQnABoards[0].content
                        : "내용이 없습니다."}
                    </p>
                  </div>
                </div>

                {/* 게시글 2-4 (세로로 배치) */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                >
                  {neighborhoodQnABoards.slice(1, 4).map((board, index) => (
                    <div
                      key={board.id}
                      onClick={() => {
                        if (board?.id) {
                          navigate(`/board/village-qna/read/${board.id}`);
                        } else {
                          handleNeighborhoodQnA();
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "20px",
                        backgroundColor: "#fff",
                        border: "1px solid #dee2e6",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        minHeight: "60px",
                      }}
                      onMouseEnter={(e) => {
                        if (board?.id) {
                          e.currentTarget.style.backgroundColor = "#f8f9fa";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (board?.id) {
                          e.currentTarget.style.backgroundColor = "#fff";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <h4
                            style={{
                              margin: 0,
                              fontSize: "16px",
                              fontWeight: "500",
                              lineHeight: "1.3",
                              wordBreak: "break-word",
                              overflow: "hidden",
                              color: "#333",
                              flex: 1,
                            }}
                          >
                            {board.title}
                          </h4>
                          <span
                            style={{
                              color: "#666",
                              fontSize: "11px",
                              backgroundColor: "#f8f9fa",
                              padding: "3px 6px",
                              borderRadius: "10px",
                              border: "1px solid #e9ecef",
                              whiteSpace: "nowrap",
                              marginLeft: "10px",
                            }}
                          >
                            {board.roadAddress || "동네 정보 없음"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#666",
                }}
              >
                아직 우리 마을 Q&A가 없습니다.
                <br />
                <small style={{ color: "#999" }}>
                  (API 응답: {JSON.stringify(neighborhoodQnABoards)})
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityMainPage;
