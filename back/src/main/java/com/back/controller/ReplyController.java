package com.back.controller;

import com.back.domain.Reply;
import com.back.service.ReplyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/replies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Log4j2
public class ReplyController {
    private final ReplyService replyService;

    @GetMapping
    public List<Reply> getReplies(@RequestParam("answerId") Long answerId) {
        log.info("대댓글 목록 조회 요청 - 답변 ID: {}", answerId);
        return replyService.getRepliesByAnswer(answerId);
    }

    @PostMapping
    public Reply createReply(@RequestBody Map<String, Object> req) {
        try {
            Object answerIdObj = req.get("answerId");
            Long answerId;
            
            if (answerIdObj instanceof Number) {
                answerId = ((Number) answerIdObj).longValue();
            } else {
                answerId = Long.valueOf(answerIdObj.toString());
            }
            
            String content = req.get("content").toString();
            String writer = req.get("writer").toString();
            
            log.info("대댓글 생성 요청 - 답변 ID: {}, 작성자: {}", answerId, writer);
            log.info("요청 데이터: {}", req);
            
            return replyService.save(answerId, content, writer);
        } catch (Exception e) {
            log.error("대댓글 생성 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("대댓글 생성에 실패했습니다: " + e.getMessage());
        }
    }

    // 댓글 삭제
    @DeleteMapping("/{replyId}")
    public ResponseEntity<?> deleteReply(@PathVariable("replyId") Long replyId) {
        try {
            log.info("댓글 삭제 요청 - 댓글 ID: {}", replyId);
            
            replyService.delete(replyId);
            
            log.info("댓글 삭제 완료 - 댓글 ID: {}", replyId);
            return ResponseEntity.ok().body("댓글이 성공적으로 삭제되었습니다.");
            
        } catch (IllegalArgumentException e) {
            log.error("댓글 삭제 실패 - 잘못된 요청 - 댓글 ID: {}, 오류: {}", replyId, e.getMessage());
            return ResponseEntity.badRequest().body("댓글 삭제에 실패했습니다: " + e.getMessage());
        } catch (Exception e) {
            log.error("댓글 삭제 실패 - 예상치 못한 오류 - 댓글 ID: {}, 오류: {}", replyId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("댓글 삭제 중 오류가 발생했습니다.");
        }
    }
} 