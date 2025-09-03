package com.back.repository;

import com.back.domain.PropertyReviewRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PropertyReviewRequestRepository extends JpaRepository<PropertyReviewRequest, Long> {
    
    // 특정 사용자의 검수 요청 목록 조회
    List<PropertyReviewRequest> findByMemberEmailOrderByCreatedAtDesc(String email);
    
    // 상태별 검수 요청 목록 조회
    List<PropertyReviewRequest> findByStatusOrderByCreatedAtDesc(PropertyReviewRequest.ReviewStatus status);
    
    // 전체 검수 요청 목록 (관리자용)
    @Query("SELECT prr FROM PropertyReviewRequest prr ORDER BY prr.createdAt DESC")
    List<PropertyReviewRequest> findAllOrderByCreatedAtDesc();
    
    // 승인된 검수 요청을 Property로 변환하기 위한 조회
    List<PropertyReviewRequest> findByStatus(PropertyReviewRequest.ReviewStatus status);
} 