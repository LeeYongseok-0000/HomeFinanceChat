package com.back.repository;

import com.back.domain.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {
    
    // 기본 메서드만 사용 - 복잡한 쿼리 제거
    
    // 제목이나 내용으로 검색
    List<News> findByTitleContainingOrContentContaining(
        String title, String content, Pageable pageable);
    
    // 특정 기간 뉴스 조회
    List<News> findByPublishedAtBetween(
        LocalDateTime startDate, LocalDateTime endDate);
    
    // 특정 날짜 이후 뉴스 조회
    List<News> findByPublishedAtAfterOrderByPublishedAtDesc(LocalDateTime date);
    
    // 카테고리별 뉴스 조회
    List<News> findByCategoryOrderByPublishedAtDesc(String category);
    
    // 카테고리별 최신 뉴스 조회 (Pageable 사용)
    List<News> findByCategoryOrderByPublishedAtDesc(String category, Pageable pageable);
} 