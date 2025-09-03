package com.back.controller;

import com.back.dto.NewsDTO;
import com.back.service.NewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.PageImpl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
@Log4j2
public class NewsController {
    
    private final NewsService newsService;
    
    // 전체 뉴스 조회 (페이징)
    @GetMapping
    public ResponseEntity<Page<NewsDTO>> getAllNews(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
        
        try {
            log.info("뉴스 조회 요청 - 페이지: {}, 크기: {}", page, size);
            
            Pageable pageable = PageRequest.of(page, size);
            Page<NewsDTO> news = newsService.getAllNews(pageable);
            
            log.info("뉴스 조회 성공: {}개 (총 {}개)", news.getContent().size(), news.getTotalElements());
            return ResponseEntity.ok(news);
            
        } catch (Exception e) {
            log.error("뉴스 조회 실패: {}", e.getMessage(), e);
            
            // 에러가 발생해도 빈 페이지 반환하여 500 에러 방지
            Pageable pageable = PageRequest.of(page, size);
            Page<NewsDTO> emptyPage = new PageImpl<>(new ArrayList<>(), pageable, 0);
            
            return ResponseEntity.ok(emptyPage);
        }
    }
    
    // 카테고리별 뉴스 조회
    @GetMapping("/category/{category}")
    public ResponseEntity<List<NewsDTO>> getNewsByCategory(
        @PathVariable String category) {
        
        try {
            List<NewsDTO> news = newsService.getNewsByCategory(category);
            log.info("카테고리별 뉴스 조회 성공: {} - {}개", category, news.size());
            return ResponseEntity.ok(news);
        } catch (Exception e) {
            log.error("카테고리별 뉴스 조회 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 뉴스 검색
    @GetMapping("/search")
    public ResponseEntity<List<NewsDTO>> searchNews(
        @RequestParam String keyword) {
        
        try {
            List<NewsDTO> news = newsService.searchNews(keyword);
            log.info("뉴스 검색 성공: '{}' - {}개", keyword, news.size());
            return ResponseEntity.ok(news);
        } catch (Exception e) {
            log.error("뉴스 검색 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 뉴스 요약
    @GetMapping("/summary")
    public ResponseEntity<String> getNewsSummary() {
        try {
            String summary = newsService.getRecentNewsSummary();
            log.info("뉴스 요약 생성 성공");
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("뉴스 요약 생성 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 챗봇용 뉴스 조회
    @GetMapping("/chatbot")
    public ResponseEntity<List<NewsDTO>> getNewsForChatbot(
        @RequestParam String query) {
        
        try {
            List<NewsDTO> news = newsService.getNewsForChatbot(query);
            log.info("챗봇용 뉴스 조회 성공: '{}' - {}개", query, news.size());
            return ResponseEntity.ok(news);
        } catch (Exception e) {
            log.error("챗봇용 뉴스 조회 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 뉴스 개수 조회
    @GetMapping("/count")
    public ResponseEntity<Long> getNewsCount() {
        try {
            long count = newsService.count();
            log.info("뉴스 개수 조회 성공: {}개", count);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("뉴스 개수 조회 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 뉴스 자동 수집 (데이터가 없을 때)
    @PostMapping("/auto-refresh")
    public ResponseEntity<String> autoRefreshNews() {
        try {
            long currentCount = newsService.count();
            if (currentCount == 0) {
                log.info("뉴스 데이터가 없습니다. 자동으로 뉴스를 수집합니다.");
                newsService.refreshNewsFromAPI();
                long newCount = newsService.count();
                return ResponseEntity.ok("뉴스 자동 수집 완료! " + newCount + "개 수집됨");
            } else {
                return ResponseEntity.ok("뉴스 데이터가 이미 있습니다. (" + currentCount + "개)");
            }
        } catch (Exception e) {
            log.error("뉴스 자동 수집 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("뉴스 자동 수집 실패: " + e.getMessage());
        }
    }
    
    // 수동으로 뉴스 갱신 (기존 데이터 삭제 후 새로 수집)
    @PostMapping("/refresh")
    public ResponseEntity<String> refreshNews() {
        try {
            log.info("🔄 수동 뉴스 갱신 시작");
            
            // 기존 뉴스 데이터 완전 삭제
            newsService.deleteAll();
            log.info("🗑️ 기존 뉴스 데이터 삭제 완료");
            
            // 새로운 부동산 관련 뉴스 수집
            newsService.refreshNewsFromAPI();
            log.info("✅ 새로운 부동산 관련 뉴스 수집 완료");
            
            return ResponseEntity.ok("뉴스 갱신이 완료되었습니다.");
        } catch (Exception e) {
            log.error("❌ 뉴스 갱신 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("뉴스 갱신 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 데이터베이스 연결 테스트
    @GetMapping("/test")
    public ResponseEntity<String> testConnection() {
        try {
            long count = newsService.count();
            return ResponseEntity.ok("데이터베이스 연결 성공! 뉴스 개수: " + count);
        } catch (Exception e) {
            log.error("데이터베이스 연결 테스트 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("데이터베이스 연결 실패: " + e.getMessage());
        }
    }
    
    // 뉴스 테이블 상태 확인
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        try {
            Map<String, Object> status = new HashMap<>();
            status.put("databaseConnected", true);
            status.put("newsCount", newsService.count());
            status.put("timestamp", LocalDateTime.now());
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("상태 확인 실패: {}", e.getMessage(), e);
            Map<String, Object> errorStatus = new HashMap<>();
            errorStatus.put("databaseConnected", false);
            errorStatus.put("error", e.getMessage());
            errorStatus.put("timestamp", LocalDateTime.now());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorStatus);
        }
    }
} 