import React, { useState, useEffect } from "react";
import CommentInput from "./CommentInput";
import CommentCard from "./CommentCard";
import { COLORS } from "./boardConstants";

const CommentSection = ({ boardId, boardTitle = "게시글" }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 댓글 목록 조회
  const loadComments = async () => {
    if (!boardId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/answers?boardId=${boardId}`);
      if (!response.ok) {
        throw new Error("댓글을 불러오는데 실패했습니다.");
      }

      const commentsData = await response.json();
      setComments(commentsData);
    } catch (error) {
      console.error("댓글 로딩 실패:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async (commentData) => {
    try {
      const response = await fetch("/api/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        throw new Error("댓글 작성에 실패했습니다.");
      }

      const newComment = await response.json();
      setComments((prev) => [newComment, ...prev]);

      // 성공 메시지
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      throw error;
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId) => {
    try {
      const response = await fetch(`/api/answers/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("댓글 삭제에 실패했습니다.");
      }

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      throw error;
    }
  };

  // 대댓글 작성
  const handleReplySubmit = async (replyData) => {
    try {
      const response = await fetch("/api/replies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(replyData),
      });

      if (!response.ok) {
        throw new Error("답글 작성에 실패했습니다.");
      }

      const newReply = await response.json();

      // 해당 댓글에 대댓글 추가
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === replyData.answerId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            };
          }
          return comment;
        })
      );
    } catch (error) {
      console.error("답글 작성 실패:", error);
      throw error;
    }
  };

  // 대댓글 삭제
  const handleReplyDelete = async (replyId) => {
    try {
      const response = await fetch(`/api/replies/${replyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("답글 삭제에 실패했습니다.");
      }

      // 해당 댓글에서 대댓글 제거
      setComments((prev) =>
        prev.map((comment) => ({
          ...comment,
          replies: (comment.replies || []).filter(
            (reply) => reply.id !== replyId
          ),
        }))
      );
    } catch (error) {
      console.error("답글 삭제 실패:", error);
      throw error;
    }
  };

  // 컴포넌트 마운트 시 댓글 로드
  useEffect(() => {
    loadComments();
  }, [boardId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <div>댓글을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          color: "#dc3545",
        }}
      >
        <div>댓글 로딩 실패: {error}</div>
        <button
          onClick={loadComments}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            backgroundColor: COLORS.PRIMARY,
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "30px" }}>
      {/* 댓글 섹션 헤더 */}
      <div
        style={{
          borderBottom: `2px solid ${COLORS.PRIMARY}`,
          marginBottom: "20px",
          paddingBottom: "10px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "bold",
            color: COLORS.PRIMARY,
          }}
        >
          댓글 ({comments.length}개)
        </h3>
      </div>

      {/* 댓글 입력 */}
      <CommentInput
        boardId={boardId}
        onCommentSubmit={handleCommentSubmit}
        placeholder={`${boardTitle}에 대한 댓글을 작성해주세요...`}
      />

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#666",
            fontSize: "14px",
          }}
        >
          아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
        </div>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              replies={comment.replies || []}
              onReplySubmit={handleReplySubmit}
              onCommentDelete={handleCommentDelete}
              onReplyDelete={handleReplyDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
