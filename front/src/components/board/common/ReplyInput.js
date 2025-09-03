import React, { useState } from 'react';
import { getCookie } from '../../../util/cookieUtil';
import { COLORS } from './boardConstants';

const ReplyInput = ({ onReplySubmit, placeholder = "답글을 입력하세요..." }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('답글 내용을 입력해주세요.');
      return;
    }

    const memberInfo = getCookie("member");
    if (!memberInfo) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onReplySubmit({
        content: content.trim(),
        writer: memberInfo.nickname || memberInfo.email || '익명'
      });
      setContent(''); // 입력 필드 초기화
    } catch (error) {
      console.error('답글 작성 실패:', error);
      alert('답글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start'
        }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1,
              minHeight: '60px',
              border: `1px solid ${COLORS.SECONDARY}`,
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '13px',
              lineHeight: '1.4',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            style={{
              padding: '8px 12px',
              backgroundColor: content.trim() ? COLORS.PRIMARY : COLORS.SECONDARY,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: content.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: '500',
              opacity: content.trim() && !isSubmitting ? 1 : 0.6,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {isSubmitting ? '작성 중...' : '답글 작성'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReplyInput;
