import React, { useState } from 'react';
import { getCookie } from '../../../util/cookieUtil';
import { COLORS } from './boardConstants';
import ReplyInput from './ReplyInput';

const CommentCard = ({ 
  comment, 
  onReplySubmit, 
  onCommentDelete, 
  onReplyDelete,
  replies = [] 
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const memberInfo = getCookie("member");

  const isAuthor = memberInfo && (
    memberInfo.email === comment.writer || 
    memberInfo.nickname === comment.writer
  );

  const handleDelete = async () => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      try {
        await onCommentDelete(comment.id);
      } catch (error) {
        console.error('댓글 삭제 실패:', error);
        alert('댓글 삭제에 실패했습니다.');
      }
    }
  };

  const handleReplySubmit = async (replyData) => {
    try {
      await onReplySubmit({
        ...replyData,
        answerId: comment.id
      });
      setShowReplyInput(false);
    } catch (error) {
      console.error('대댓글 작성 실패:', error);
      alert('대댓글 작성에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{
      border: `1px solid ${COLORS.SECONDARY}`,
      borderRadius: '8px',
      marginBottom: '15px',
      backgroundColor: 'white'
    }}>
      {/* 댓글 내용 */}
      <div style={{ padding: '15px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              fontWeight: '600', 
              color: COLORS.PRIMARY,
              fontSize: '14px'
            }}>
              {comment.writer}
            </span>
            <span style={{ 
              color: '#666', 
              fontSize: '12px' 
            }}>
              {formatDate(comment.createdAt)}
            </span>
          </div>
          {isAuthor && (
            <button
              onClick={handleDelete}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc3545',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8d7da'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              삭제
            </button>
          )}
        </div>
        
        <div style={{ 
          fontSize: '14px', 
          lineHeight: '1.6',
          color: '#333',
          marginBottom: '10px'
        }}>
          {comment.content}
        </div>

        {/* 댓글 액션 버튼들 */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center',
          borderTop: `1px solid #eee`,
          paddingTop: '10px'
        }}>
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            style={{
              background: 'none',
              border: 'none',
              color: COLORS.PRIMARY,
              cursor: 'pointer',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e3f2fd'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            답글
          </button>
          
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
            >
              답글 {replies.length}개 {showReplies ? '숨기기' : '보기'}
            </button>
          )}
        </div>
      </div>

      {/* 대댓글 입력 폼 */}
      {showReplyInput && (
        <div style={{ 
          borderTop: `1px solid #eee`,
          padding: '15px',
          backgroundColor: '#f8f9fa'
        }}>
          <ReplyInput
            onReplySubmit={handleReplySubmit}
            placeholder="답글을 입력하세요..."
          />
        </div>
      )}

      {/* 대댓글 목록 */}
      {showReplies && replies.length > 0 && (
        <div style={{ 
          borderTop: `1px solid #eee`,
          backgroundColor: '#f8f9fa'
        }}>
          {replies.map((reply) => (
            <div key={reply.id} style={{
              padding: '12px 15px',
              borderBottom: '1px solid #eee',
              marginLeft: '20px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontWeight: '600', 
                    color: COLORS.PRIMARY,
                    fontSize: '13px'
                  }}>
                    {reply.writer}
                  </span>
                  <span style={{ 
                    color: '#666', 
                    fontSize: '11px' 
                  }}>
                    {formatDate(reply.createdAt)}
                  </span>
                </div>
                {memberInfo && (
                  memberInfo.email === reply.writer || 
                  memberInfo.nickname === reply.writer
                ) && (
                  <button
                    onClick={() => onReplyDelete(reply.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc3545',
                      cursor: 'pointer',
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}
                  >
                    삭제
                  </button>
                )}
              </div>
              <div style={{ 
                fontSize: '13px', 
                lineHeight: '1.5',
                color: '#333'
              }}>
                {reply.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentCard;
