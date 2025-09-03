package com.back.service;

import com.back.domain.Answer;
import com.back.domain.Board;
import com.back.domain.Reply;
import com.back.repository.AnswerRepository;
import com.back.repository.BoardRepository;
import com.back.repository.ReplyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class AnswerServiceImpl implements AnswerService {
    private final AnswerRepository answerRepository;
    private final BoardRepository boardRepository;
    private final ReplyRepository replyRepository;

    @Override
    @Transactional
    public Answer save(Long boardId, String content, String writer) {
        log.info("답변 저장 시작 - 게시글 ID: {}, 작성자: {}", boardId, writer);
        
        try {
            // 입력값 검증
            if (boardId == null) {
                throw new IllegalArgumentException("게시글 ID가 null입니다.");
            }
            if (content == null || content.trim().isEmpty()) {
                throw new IllegalArgumentException("답변 내용이 비어있습니다.");
            }
            if (writer == null || writer.trim().isEmpty()) {
                throw new IllegalArgumentException("작성자가 비어있습니다.");
            }
            
            Board board = boardRepository.findById(boardId)
                    .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + boardId));
            
            Answer answer = Answer.builder()
                    .board(board)
                    .content(content.trim())
                    .writer(writer.trim())
                    .build();
            
            Answer saved = answerRepository.save(answer);
            log.info("답변 저장 완료 - ID: {}", saved.getId());

            // 게시글의 답변 수 증가
            board.setAnswerCount(board.getAnswerCount() + 1);
            boardRepository.save(board);
            log.info("게시글 답변 수 업데이트 완료 - 게시글 ID: {}, 답변 수: {}", boardId, board.getAnswerCount());

            return saved;
        } catch (Exception e) {
            log.error("답변 저장 중 오류 발생 - 게시글 ID: {}, 오류: {}", boardId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Answer> getAnswers(Long boardId) {
        log.info("답변 목록 조회 시작 - 게시글 ID: {}", boardId);
        
        try {
            // boardId 유효성 검사
            if (boardId == null || boardId <= 0) {
                throw new IllegalArgumentException("유효하지 않은 게시글 ID입니다: " + boardId);
            }
            
            // Board 존재 여부 확인
            Board board = boardRepository.findById(boardId)
                    .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + boardId));
            
            log.info("게시글 조회 완료 - 게시글 ID: {}, 제목: {}", boardId, board.getTitle());
            
            // 모든 답변 조회
            List<Answer> answers = answerRepository.findByBoard(board);
            log.info("답변 조회 완료 - 게시글 ID: {}, 답변 수: {}", boardId, answers.size());
            
            // 각 답변의 대댓글들을 로드
            for (Answer answer : answers) {
                try {
                    List<Reply> replies = replyRepository.findByAnswer(answer);
                    answer.setReplies(replies);
                    
                    log.debug("답변 ID: {}, 대댓글 수: {}", answer.getId(), replies.size());
                    for (Reply reply : replies) {
                        log.debug("  - 대댓글 ID: {}, 작성자: {}", reply.getId(), reply.getWriter());
                    }
                } catch (Exception e) {
                    log.warn("답변 ID: {}의 대댓글 조회 중 오류 발생: {}", answer.getId(), e.getMessage());
                    // 대댓글 조회 실패 시 빈 리스트로 설정
                    answer.setReplies(new ArrayList<>());
                }
            }
            
            log.info("답변 목록 조회 완료 - 게시글 ID: {}, 총 답변 수: {}", boardId, answers.size());
            return answers;
            
        } catch (IllegalArgumentException e) {
            log.error("답변 목록 조회 실패 - 잘못된 요청 - 게시글 ID: {}, 오류: {}", boardId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("답변 목록 조회 실패 - 예상치 못한 오류 - 게시글 ID: {}, 오류: {}", boardId, e.getMessage(), e);
            throw new RuntimeException("답변 목록을 조회하는 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    @Transactional
    public void delete(Long answerId) {
        log.info("답변 삭제 시작 - 답변 ID: {}", answerId);
        
        try {
            Answer answer = answerRepository.findById(answerId)
                    .orElseThrow(() -> new IllegalArgumentException("답변을 찾을 수 없습니다: " + answerId));
            
            // 답변에 달린 댓글들도 함께 삭제 (CASCADE 설정에 따라 자동 삭제)
            log.info("답변 ID: {}의 댓글들도 함께 삭제됩니다", answerId);
            
            // 게시글의 답변 수 감소
            Board board = answer.getBoard();
            board.setAnswerCount(Math.max(0, board.getAnswerCount() - 1));
            boardRepository.save(board);
            log.info("게시글 답변 수 업데이트 완료 - 게시글 ID: {}, 답변 수: {}", board.getId(), board.getAnswerCount());
            
            // 답변 삭제
            answerRepository.delete(answer);
            log.info("답변 삭제 완료 - 답변 ID: {}", answerId);
            
        } catch (Exception e) {
            log.error("답변 삭제 중 오류 발생 - 답변 ID: {}, 오류: {}", answerId, e.getMessage(), e);
            throw e;
        }
    }
}
