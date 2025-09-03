package com.back.controller;

import com.back.dto.SearchStatisticsDTO;
import com.back.service.SearchStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search-statistics")
@RequiredArgsConstructor
@Log4j2
public class SearchStatisticsController {
    
    private final SearchStatisticsService searchStatisticsService;
    
    // 전체 검색 순위 조회
    @GetMapping("/top")
    public ResponseEntity<List<SearchStatisticsDTO>> getTopSearches() {
        log.info("전체 검색 순위 조회 요청");
        List<SearchStatisticsDTO> topSearches = searchStatisticsService.getTopSearches();
        return ResponseEntity.ok(topSearches);
    }
    
    // 키워드 검색 순위 조회
    @GetMapping("/top/keyword")
    public ResponseEntity<List<SearchStatisticsDTO>> getTopKeywordSearches() {
        log.info("키워드 검색 순위 조회 요청");
        List<SearchStatisticsDTO> topKeywordSearches = searchStatisticsService.getTopKeywordSearches();
        return ResponseEntity.ok(topKeywordSearches);
    }
    
    // 단지명 검색 순위 조회
    @GetMapping("/top/complex")
    public ResponseEntity<List<SearchStatisticsDTO>> getTopComplexSearches() {
        log.info("단지명 검색 순위 조회 요청");
        List<SearchStatisticsDTO> topComplexSearches = searchStatisticsService.getTopComplexSearches();
        return ResponseEntity.ok(topComplexSearches);
    }
    
    // 지역 검색 순위 조회
    @GetMapping("/top/region")
    public ResponseEntity<List<SearchStatisticsDTO>> getTopRegionSearches() {
        log.info("지역 검색 순위 조회 요청");
        List<SearchStatisticsDTO> topRegionSearches = searchStatisticsService.getTopRegionSearches();
        return ResponseEntity.ok(topRegionSearches);
    }
    
    // 테스트용 엔드포인트
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        log.info("테스트 엔드포인트 호출됨");
        return ResponseEntity.ok("SearchStatistics API 정상 작동 중");
    }
}
