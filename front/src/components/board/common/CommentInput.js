import React, { useState } from 'react';
import { getCookie } from '../../../util/cookieUtil';
import { COLORS } from './boardConstants';

const CommentInput = ({ boardId, onCommentSubmit, placeholder = "댓글을 입력하세요..." }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    const memberInfo = getCookie("member");
    if (!memberInfo) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onCommentSubmit({
        boardId: boardId,
        content: content.trim(),
        writer: memberInfo.nickname || memberInfo.email || '익명'
      });
      setContent(''); // 입력 필드 초기화
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ 
          border: `1px solid ${COLORS.SECONDARY}`,
          borderRadius: '8px',
          padding: '15px',
          backgroundColor: '#f8f9fa'
        }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            style={{
              width: '100%',
              minHeight: '80px',
              border: 'none',
              resize: 'vertical',
              fontSize: '14px',
              lineHeight: '1.5',
              outline: 'none',
              backgroundColor: 'transparent'
            }}
            disabled={isSubmitting}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            marginTop: '10px' 
          }}>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: content.trim() ? COLORS.PRIMARY : COLORS.SECONDARY,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: content.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500',
                opacity: content.trim() && !isSubmitting ? 1 : 0.6,
                transition: 'all 0.2s ease'
              }}
            >
              {isSubmitting ? '작성 중...' : '댓글 작성'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentInput;
