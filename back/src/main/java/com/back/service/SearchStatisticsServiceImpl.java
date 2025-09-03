package com.back.service;

import com.back.domain.SearchStatistics;
import com.back.dto.SearchStatisticsDTO;
import com.back.repository.SearchStatisticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class SearchStatisticsServiceImpl implements SearchStatisticsService {
    
    private final SearchStatisticsRepository searchStatisticsRepository;
    
    @Override
    @Transactional
    public void recordSearch(String searchKeyword, String searchType, String region) {
        if (searchKeyword == null || searchKeyword.trim().isEmpty()) {
            return;
        }
        
        try {
            SearchStatistics existingStat = searchStatisticsRepository
                .findBySearchKeywordAndSearchType(searchKeyword.trim(), searchType);
            
            if (existingStat != null) {
                // 기존 통계 업데이트
                existingStat.setSearchCount(existingStat.getSearchCount() + 1);
                existingStat.setLastSearched(LocalDateTime.now());
                if (region != null && !region.trim().isEmpty()) {
                    existingStat.setRegion(region.trim());
                }
                searchStatisticsRepository.save(existingStat);
            } else {
                // 새로운 통계 생성
                SearchStatistics newStat = SearchStatistics.builder()
                    .searchKeyword(searchKeyword.trim())
                    .searchType(searchType)
                    .searchCount(1L)
                    .region(region != null ? region.trim() : null)
                    .lastSearched(LocalDateTime.now())
                    .build();
                searchStatisticsRepository.save(newStat);
            }
            
            log.info("검색 통계 기록 완료: keyword={}, type={}, region={}", 
                searchKeyword, searchType, region);
        } catch (Exception e) {
            log.error("검색 통계 기록 실패: keyword={}, type={}, region={}, error={}", 
                searchKeyword, searchType, region, e.getMessage(), e);
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<SearchStatisticsDTO> getTopSearches() {
        return searchStatisticsRepository.findTopSearches()
            .stream()
            .limit(10)
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<SearchStatisticsDTO> getTopKeywordSearches() {
        return searchStatisticsRepository.findTopKeywordSearches()
            .stream()
            .limit(10)
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<SearchStatisticsDTO> getTopComplexSearches() {
        return searchStatisticsRepository.findTopComplexSearches()
            .stream()
            .limit(10)
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<SearchStatisticsDTO> getTopRegionSearches() {
        return searchStatisticsRepository.findTopRegionSearches()
            .stream()
            .limit(10)
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    private SearchStatisticsDTO convertToDTO(SearchStatistics entity) {
        return SearchStatisticsDTO.builder()
            .searchKeyword(entity.getSearchKeyword())
            .searchType(entity.getSearchType())
            .searchCount(entity.getSearchCount())
            .lastSearched(entity.getLastSearched())
            .region(entity.getRegion())
            .build();
    }
}
