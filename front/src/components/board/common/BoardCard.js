import React from "react";
import { API_SERVER_HOST } from "../../../api/backendApi";

const BoardCard = ({
  board,
  onClick,
  showImage = true,
  showLocation = true,
  showCategory = true,
  showDate = true,
  showViews = true,
}) => {
  const handleClick = () => {
    if (onClick && board?.id) {
      onClick(board.id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "어제";
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div
      onClick={handleClick}
      style={{
        padding: "20px",
        backgroundColor: "#fff",
        border: "1px solid #dee2e6",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        minHeight: "120px",
        display: "flex",
        gap: "20px",
        alignItems: "flex-start",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#f8f9fa";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#fff";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
      }}
    >
      {/* 게시글 정보 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* 주제와 동네를 한 줄에 표시 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          {/* 주제 */}
          {board?.topic && (
            <span
              style={{
                backgroundColor: "#e9d5ff",
                color: "#6b21a8",
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "500",
                flexShrink: 0,
                minWidth: "80px", // 최소 너비 설정
                textAlign: "center", // 텍스트 중앙 정렬
                display: "inline-block", // 인라인 블록으로 설정
              }}
            >
              {board.topic}
            </span>
          )}

          {/* 동네(지역) */}
          {board?.roadAddress && (
            <span
              style={{
                backgroundColor: "#f8f9fa",
                color: "#6c757d",
                padding: "4px 8px",
                borderRadius: "12px",
                border: "1px solid #dee2e6",
                fontSize: "12px",
                fontWeight: "500",
                flexShrink: 0,
              }}
            >
              {board.roadAddress}
            </span>
          )}
        </div>

        {/* 제목 */}
        <h3
          style={{
            margin: "0 0 10px 0",
            fontSize: "18px",
            fontWeight: "600",
            color: "#333",
            lineHeight: "1.4",
            wordBreak: "break-word",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {board?.title || "제목 없음"}
        </h3>

        {/* 내용 미리보기 */}
        {board?.content && (
          <p
            style={{
              margin: "0 0 15px 0",
              color: "#666",
              fontSize: "14px",
              lineHeight: "1.5",
              wordBreak: "break-word",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {truncateText(board.content, 120)}
          </p>
        )}

        {/* 메타 정보 */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            alignItems: "center",
            fontSize: "12px",
            color: "#666",
          }}
        >
          {/* 카테고리 */}
          {showCategory && board?.category && (
            <span
              style={{
                backgroundColor: "#e9ecef",
                color: "#495057",
                padding: "4px 8px",
                borderRadius: "12px",
                fontWeight: "500",
              }}
            >
              {board.category}
            </span>
          )}
        </div>
      </div>

      {/* 썸네일 이미지 */}
      {showImage && board?.imageUrls && board.imageUrls.length > 0 && (
        <div style={{ flexShrink: 0 }}>
          <img
            src={`${API_SERVER_HOST}${board.imageUrls[0]}`}
            alt="게시글 썸네일"
            style={{
              width: "120px",
              height: "100px",
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
    </div>
  );
};

export default BoardCard;
