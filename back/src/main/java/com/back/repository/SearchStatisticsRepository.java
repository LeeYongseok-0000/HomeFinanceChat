package com.back.repository;

import com.back.domain.SearchStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchStatisticsRepository extends JpaRepository<SearchStatistics, Long> {
    
    // 키워드와 타입으로 검색 통계 찾기
    SearchStatistics findBySearchKeywordAndSearchType(String searchKeyword, String searchType);
    
    // 지역별 검색 통계 찾기
    List<SearchStatistics> findByRegionOrderBySearchCountDesc(String region);
    
    // 전체 검색 순위 (상위 10개)
    @Query("SELECT s FROM SearchStatistics s ORDER BY s.searchCount DESC, s.lastSearched DESC")
    List<SearchStatistics> findTopSearches();
    
    // 키워드 검색 순위 (상위 10개)
    @Query("SELECT s FROM SearchStatistics s WHERE s.searchType = 'keyword' ORDER BY s.searchCount DESC, s.lastSearched DESC")
    List<SearchStatistics> findTopKeywordSearches();
    
    // 단지명 검색 순위 (상위 10개)
    @Query("SELECT s FROM SearchStatistics s WHERE s.searchType = 'complex' ORDER BY s.searchCount DESC, s.lastSearched DESC")
    List<SearchStatistics> findTopComplexSearches();
    
    // 지역 검색 순위 (상위 10개)
    @Query("SELECT s FROM SearchStatistics s WHERE s.searchType = 'region' ORDER BY s.searchCount DESC, s.lastSearched DESC")
    List<SearchStatistics> findTopRegionSearches();
}
