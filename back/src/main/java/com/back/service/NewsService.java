package com.back.service;

import com.back.dto.NewsDTO;
import com.back.domain.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NewsService {
    
    // 뉴스 저장
    News save(News news);
    
    // 뉴스 목록 저장
    List<News> saveAll(List<News> newsList);
    
    // 전체 뉴스 조회 (페이징)
    Page<NewsDTO> getAllNews(Pageable pageable);
    
    // 카테고리별 뉴스 조회
    List<NewsDTO> getNewsByCategory(String category);
    
    // 뉴스 검색
    List<NewsDTO> searchNews(String keyword);
    
    // 최신 뉴스 요약
    String getRecentNewsSummary();
    
    // 6시간마다 뉴스 갈아치우기
    void refreshNewsFromAPI();
    
    // 챗봇용 뉴스 데이터 조회
    List<NewsDTO> getNewsForChatbot(String query);
    
    // 뉴스 개수 조회
    long count();
    
    // 전체 뉴스 삭제
    void deleteAll();
} 