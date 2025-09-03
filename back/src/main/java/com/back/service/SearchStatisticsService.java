package com.back.service;

import com.back.dto.SearchStatisticsDTO;

import java.util.List;

public interface SearchStatisticsService {
    
    // 검색 통계 기록
    void recordSearch(String searchKeyword, String searchType, String region);
    
    // 전체 검색 순위 조회
    List<SearchStatisticsDTO> getTopSearches();
    
    // 키워드 검색 순위 조회
    List<SearchStatisticsDTO> getTopKeywordSearches();
    
    // 단지명 검색 순위 조회
    List<SearchStatisticsDTO> getTopComplexSearches();
    
    // 지역 검색 순위 조회
    List<SearchStatisticsDTO> getTopRegionSearches();
}
