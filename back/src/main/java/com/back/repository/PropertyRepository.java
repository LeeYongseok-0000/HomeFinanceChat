package com.back.repository;

import com.back.domain.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    
    // 매물 유형별 조회
    List<Property> findByPropertyType(String propertyType);
    
    // 거래 유형별 조회
    List<Property> findByTransactionType(String transactionType);
    
    // 매물 유형과 거래 유형으로 조회
    List<Property> findByPropertyTypeAndTransactionType(String propertyType, String transactionType);
    
    // 제목 또는 내용으로 검색
    @Query("SELECT p FROM Property p WHERE p.title LIKE %:keyword% OR p.content LIKE %:keyword%")
    List<Property> findByTitleOrContentContaining(@Param("keyword") String keyword);
    
    // 작성자별 조회
    List<Property> findByWriterEmail(String writerEmail);
    
    // 작성자별 조회 (이미지 정보와 함께)
    @Query("SELECT p FROM Property p LEFT JOIN FETCH p.imageUrls WHERE p.writerEmail = :writerEmail")
    List<Property> findByWriterEmailWithImages(@Param("writerEmail") String writerEmail);
    
    // 조회수 순으로 정렬
    List<Property> findAllByOrderByViewCountDesc();
    
    // 최신순으로 정렬
    List<Property> findAllByOrderByCreatedAtDesc();
} 