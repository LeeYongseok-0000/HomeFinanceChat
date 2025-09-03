package com.back.service;

import com.back.domain.Reply;
import com.back.domain.Answer;
import com.back.repository.ReplyRepository;
import com.back.repository.AnswerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class ReplyServiceImpl implements ReplyService {
    private final ReplyRepository replyRepository;
    private final AnswerRepository answerRepository;

    @Override
    @Transactional
    public Reply save(Long answerId, String content, String writer) {
        log.info("대댓글 저장 시작 - 답변 ID: {}, 작성자: {}", answerId, writer);
        
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new IllegalArgumentException("답변을 찾을 수 없습니다: " + answerId));
        
        Reply reply = Reply.builder()
                .answer(answer)
                .content(content)
                .writer(writer)
                .build();
        
        Reply saved = replyRepository.save(reply);
        log.info("대댓글 저장 완료 - ID: {}, 답변 ID: {}", saved.getId(), answerId);
        
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Reply> getRepliesByAnswer(Long answerId) {
        log.info("대댓글 목록 조회 시작 - 답변 ID: {}", answerId);
        
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new IllegalArgumentException("답변을 찾을 수 없습니다: " + answerId));
        
        List<Reply> replies = replyRepository.findByAnswer(answer);
        log.info("대댓글 조회 완료 - 답변 ID: {}, 대댓글 수: {}", answerId, replies.size());
        
        return replies;
    }

    @Override
    @Transactional
    public void delete(Long replyId) {
        log.info("댓글 삭제 시작 - 댓글 ID: {}", replyId);
        
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다: " + replyId));
        
        replyRepository.delete(reply);
        log.info("댓글 삭제 완료 - 댓글 ID: {}", replyId);
    }
}
