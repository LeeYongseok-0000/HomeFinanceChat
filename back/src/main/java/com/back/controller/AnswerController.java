package com.back.controller;

import com.back.domain.Answer;
import com.back.service.AnswerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/answers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Log4j2
public class AnswerController {
    private final AnswerService answerService;

    @GetMapping
    public ResponseEntity<?> getAnswers(@RequestParam("boardId") Long boardId) {
        try {
            log.info("답변 목록 조회 요청 - 게시글 ID: {}", boardId);
            
            // boardId 유효성 검사
            if (boardId == null || boardId <= 0) {
                log.error("답변 목록 조회 실패 - 유효하지 않은 boardId: {}", boardId);
                return ResponseEntity.badRequest().body("유효하지 않은 게시글 ID입니다.");
            }
            
            List<Answer> answers = answerService.getAnswers(boardId);
            log.info("답변 목록 조회 완료 - 게시글 ID: {}, 답변 수: {}", boardId, answers.size());
            return ResponseEntity.ok(answers);
            
        } catch (IllegalArgumentException e) {
            log.error("답변 목록 조회 실패 - 잘못된 요청 - 게시글 ID: {}, 오류: {}", boardId, e.getMessage());
            return ResponseEntity.badRequest().body("답변 목록을 불러오는데 실패했습니다: " + e.getMessage());
        } catch (Exception e) {
            log.error("답변 목록 조회 실패 - 예상치 못한 오류 - 게시글 ID: {}, 오류: {}", boardId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("답변 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    @PostMapping
    public ResponseEntity<?> createAnswer(@RequestBody Map<String, Object> req) {
        try {
            Long boardId = Long.valueOf(req.get("boardId").toString());
            String content = req.get("content").toString();
            String writer = req.get("writer").toString();
            
            log.info("답변 생성 요청 - 게시글 ID: {}, 작성자: {}, 내용 길이: {}", boardId, writer, content.length());
            
            // 입력값 검증
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("답변 내용을 입력해주세요.");
            }
            if (writer == null || writer.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("작성자를 입력해주세요.");
            }
            
            Answer answer = answerService.save(boardId, content.trim(), writer.trim());
            log.info("답변 생성 완료 - 답변 ID: {}", answer.getId());
            
            return ResponseEntity.ok(answer);
        } catch (NumberFormatException e) {
            log.error("답변 생성 실패 - 잘못된 boardId 형식: {}", e.getMessage());
            return ResponseEntity.badRequest().body("잘못된 게시글 ID입니다.");
        } catch (IllegalArgumentException e) {
            log.error("답변 생성 실패 - 유효하지 않은 요청: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("답변 생성 실패 - 예상치 못한 오류: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("답변 생성 중 오류가 발생했습니다.");
        }
    }

    // 답변 삭제
    @DeleteMapping("/{answerId}")
    public ResponseEntity<?> deleteAnswer(@PathVariable("answerId") Long answerId) {
        try {
            log.info("답변 삭제 요청 - 답변 ID: {}", answerId);
            
            answerService.delete(answerId);
            
            log.info("답변 삭제 완료 - 답변 ID: {}", answerId);
            return ResponseEntity.ok().body("답변이 성공적으로 삭제되었습니다.");
            
        } catch (IllegalArgumentException e) {
            log.error("답변 삭제 실패 - 잘못된 요청 - 답변 ID: {}, 오류: {}", answerId, e.getMessage());
            return ResponseEntity.badRequest().body("답변 삭제에 실패했습니다: " + e.getMessage());
        } catch (Exception e) {
            log.error("답변 삭제 실패 - 예상치 못한 오류 - 답변 ID: {}, 오류: {}", answerId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("답변 삭제 중 오류가 발생했습니다.");
        }
    }
}
