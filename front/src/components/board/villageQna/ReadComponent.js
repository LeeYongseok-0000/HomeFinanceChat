import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVillageQna, deleteVillageQna } from "../../../api/villageQnaApi";
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
      const response = await getVillageQna(boardId);

      if (response) {
        setBoard(response);
      } else {
        alert("게시글을 찾을 수 없습니다.");
        navigate("/board/village-qna");
      }
    } catch (error) {
      console.error("게시글 로딩 실패:", error);
      alert(ERROR_MESSAGES.NOT_FOUND);
      navigate("/board/village-qna");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/board/village-qna/modify/${boardId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 Q&A를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteVillageQna(boardId);
      alert("Q&A가 삭제되었습니다.");
      navigate("/board/village-qna");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleBackToList = () => {
    navigate("/board/village-qna");
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
            {board.category || "마을 Q&A"}
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

        {/* 이미지 갤러리 */}
        {board.imageUrls && board.imageUrls.length > 0 && (
          <div style={{ marginBottom: "30px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
              }}
            >
              {board.imageUrls.map((imageUrl, index) => (
                <div
                  key={index}
                  style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: `1px solid ${COLORS.BORDER}`,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={`${API_SERVER_HOST}${imageUrl}`}
                    alt={`Q&A 이미지 ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 내용 */}
        <div
          style={{
            fontSize: "16px",
            lineHeight: "1.8",
            color: COLORS.TEXT_PRIMARY,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {board.content || DEFAULTS.EMPTY_TEXT}
        </div>
      </div>

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
              삭제된 Q&A는 복구할 수 없습니다.
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
