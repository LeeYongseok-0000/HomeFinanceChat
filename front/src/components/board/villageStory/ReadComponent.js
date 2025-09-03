import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getVillageStory,
  deleteVillageStory,
} from "../../../api/villageStoryApi";
import { getCookie } from "../../../util/cookieUtil";
import { API_SERVER_HOST } from "../../../api/backendApi";
import {
  COLORS,
  LOADING_MESSAGES,
  DEFAULTS,
  ERROR_MESSAGES,
} from "../common/boardConstants";
import CommentSection from "../common/CommentSection";

const ReadComponent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberInfo, setMemberInfo] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const boardId = id;

  useEffect(() => {
    const member = getCookie("member");
    setMemberInfo(member);

    if (boardId) {
      loadBoard();
    }
  }, [boardId]);

  const loadBoard = async () => {
    try {
      setLoading(true);
      const response = await getVillageStory(boardId);

      if (response) {
        setBoard(response);
      } else {
        alert("게시글을 찾을 수 없습니다.");
        navigate("/board/village-story");
      }
    } catch (error) {
      console.error("게시글 로딩 실패:", error);
      alert(ERROR_MESSAGES.NOT_FOUND);
      navigate("/board/village-story");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/board/village-story/modify/${boardId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 이야기를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteVillageStory(boardId);
      alert("이야기가 삭제되었습니다.");
      navigate("/board/village-story");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleBackToList = () => {
    navigate("/board/village-story");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isAuthor =
    memberInfo &&
    board &&
    (memberInfo.email === board.writer || memberInfo.nickname === board.writer);
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <div>{LOADING_MESSAGES.LOADING}</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <div>{ERROR_MESSAGES.NOT_FOUND}</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "20px" }}>
      {/* 뒤로가기 버튼 */}
      <div style={{ marginBottom: "25px" }}>
        <button
          onClick={handleBackToList}
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
          ← 목록으로
        </button>
      </div>

      {/* 게시글 헤더 */}
      <div
        style={{
          backgroundColor: "white",
          border: `1px solid ${COLORS.BORDER}`,
          borderRadius: "8px",
          padding: "30px",
          marginBottom: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        {/* 제목과 액션 버튼 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "15px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "bold",
              color: COLORS.TEXT_PRIMARY,
              lineHeight: "1.4",
              wordBreak: "break-word",
              flex: 1,
            }}
          >
            {board.title}
          </h1>

          {/* 수정/삭제 버튼 */}
          {isAuthor && (
            <div style={{ display: "flex", gap: "10px", marginLeft: "20px" }}>
              <button
                onClick={handleEdit}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                수정
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                삭제
              </button>
            </div>
          )}
        </div>

        {/* 메타 정보 */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "20px",
            borderTop: `1px solid ${COLORS.BORDER}`,
            paddingTop: "20px",
          }}
        >
          {/* 작성자 */}
          <span
            style={{
              backgroundColor: "#f8f9fa",
              color: COLORS.TEXT_SECONDARY,
              padding: "6px 12px",
              borderRadius: "20px",
              border: `1px solid ${COLORS.BORDER}`,
              fontSize: "13px",
            }}
          >
            {board.writer || "알 수 없음"}
          </span>

          {/* 메인 카테고리 */}
          <span
            style={{
              backgroundColor: COLORS.PRIMARY,
              color: "white",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            {board.category || "이야기"}
          </span>

          {/* 글의 주제 */}
          {board.topic && (
            <span
              style={{
                backgroundColor: "#d1ecf1",
                color: "#0c5460",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              주제: {board.topic.split(", ").join(", ")}
            </span>
          )}

          {/* 작성된 날짜 */}
          <span
            style={{
              backgroundColor: "#fff3cd",
              color: "#856404",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            {board.createdAt ? formatDate(board.createdAt) : "알 수 없음"}
          </span>

          {/* 지역 */}
          {board.roadAddress && (
            <span
              style={{
                backgroundColor: "#d1ecf1",
                color: "#0c5460",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              {board.roadAddress}
            </span>
          )}
        </div>

        {/* 내용 */}
        <div
          style={{
            fontSize: "16px",
            lineHeight: "1.8",
            color: COLORS.TEXT_PRIMARY,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            marginTop: "20px",
            padding: "25px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #e9ecef",
          }}
        >
          {board.content || DEFAULTS.EMPTY_TEXT}
        </div>
      </div>

      {/* 이미지 갤러리 */}
      {board.imageUrls && board.imageUrls.length > 0 && (
        <div
          style={{
            backgroundColor: "white",
            border: `1px solid ${COLORS.BORDER}`,
            borderRadius: "8px",
            padding: "30px",
            marginBottom: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <h3
            style={{
              margin: "0 0 20px 0",
              fontSize: "20px",
              fontWeight: "600",
              color: COLORS.TEXT_PRIMARY,
              borderBottom: `2px solid #3b82f6`,
              paddingBottom: "10px",
            }}
          >
            첨부된 사진
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "20px",
              minHeight: "400px",
            }}
          >
            {/* 왼쪽 서브 이미지 */}
            {board.imageUrls.length > 1 && (
              <div
                style={{
                  width: "300px",
                  height: "300px",
                  cursor: "pointer",
                  transition: "transform 0.4s ease",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #dee2e6",
                  opacity: 0.7,
                  flexShrink: 0,
                  backgroundColor: "#f8f9fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "-50px",
                  zIndex: 1,
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.opacity = "0.7";
                }}
                onClick={() => {
                  const prevIndex =
                    selectedImageIndex > 0
                      ? selectedImageIndex - 1
                      : board.imageUrls.length - 1;
                  setSelectedImageIndex(prevIndex);
                }}
              >
                <img
                  src={`${API_SERVER_HOST}${
                    board.imageUrls[
                      selectedImageIndex > 0
                        ? selectedImageIndex - 1
                        : board.imageUrls.length - 1
                    ]
                  }`}
                  alt="왼쪽 서브 이미지"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* 메인 이미지 */}
            <div
              style={{
                width: "500px",
                height: "450px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "2px solid black",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                zIndex: 2,
                position: "relative",
              }}
            >
              <img
                src={`${API_SERVER_HOST}${board.imageUrls[selectedImageIndex]}`}
                alt={`메인 이미지 ${selectedImageIndex + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>

            {/* 오른쪽 서브 이미지 */}
            {board.imageUrls.length > 1 && (
              <div
                style={{
                  width: "300px",
                  height: "300px",
                  cursor: "pointer",
                  transition: "transform 0.4s ease",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #dee2e6",
                  opacity: 0.7,
                  flexShrink: 0,
                  backgroundColor: "#f8f9fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "-50px",
                  zIndex: 1,
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.opacity = "0.7";
                }}
                onClick={() => {
                  const nextIndex =
                    selectedImageIndex < board.imageUrls.length - 1
                      ? selectedImageIndex + 1
                      : 0;
                  setSelectedImageIndex(nextIndex);
                }}
              >
                <img
                  src={`${API_SERVER_HOST}${
                    board.imageUrls[
                      selectedImageIndex < board.imageUrls.length - 1
                        ? selectedImageIndex + 1
                        : 0
                    ]
                  }`}
                  alt="오른쪽 서브 이미지"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* 썸네일 이미지 갤러리 */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              marginTop: "20px",
            }}
          >
            {board.imageUrls.map((imageUrl, index) => (
              <div
                key={index}
                style={{
                  width: "80px",
                  height: "80px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  overflow: "hidden",
                  border:
                    index === selectedImageIndex
                      ? "3px solid #28a745"
                      : "2px solid #dee2e6",
                  transition: "all 0.3s ease",
                  backgroundColor: "white",
                }}
                onClick={() => setSelectedImageIndex(index)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <img
                  src={`${API_SERVER_HOST}${imageUrl}`}
                  alt={`썸네일 ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>

          {/* 현재 선택된 이미지 표시 */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            {board.imageUrls.map((_, index) => (
              <div
                key={index}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor:
                    index === selectedImageIndex ? "#3b82f6" : "#dee2e6",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
                onClick={() => setSelectedImageIndex(index)}
                title={`이미지 ${index + 1}`}
              />
            ))}
          </div>

          {/* 이미지 정보 */}
          <div
            style={{
              textAlign: "center",
              marginTop: "10px",
              fontSize: "14px",
              color: "#666",
            }}
          >
            {selectedImageIndex + 1} / {board.imageUrls.length}
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 20px 0", color: COLORS.DANGER }}>
              정말 삭제하시겠습니까?
            </h3>
            <p style={{ margin: "0 0 25px 0", color: COLORS.TEXT_SECONDARY }}>
              삭제된 이야기는 복구할 수 없습니다.
            </p>
            <div
              style={{ display: "flex", gap: "15px", justifyContent: "center" }}
            >
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: COLORS.LIGHT,
                  color: COLORS.DARK,
                  border: `1px solid ${COLORS.BORDER}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: "10px 20px",
                  backgroundColor: COLORS.DANGER,
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 댓글 섹션 */}
      <CommentSection boardId={boardId} boardTitle={board.title} />
    </div>
  );
};

export default ReadComponent;
