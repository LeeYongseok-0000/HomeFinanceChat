package com.back.repository;

import com.back.domain.PropertyLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyLikeRepository extends JpaRepository<PropertyLike, Long> {
    
    // 특정 매물에 대한 특정 사용자의 좋아요 여부 확인
    Optional<PropertyLike> findByPropertyIdAndMemberEmail(Long propertyId, String memberEmail);
    
    // 특정 매물의 좋아요 개수
    long countByPropertyId(Long propertyId);
    
    // 특정 사용자가 좋아요한 매물 목록
    List<PropertyLike> findByMemberEmail(String memberEmail);
    
    // 특정 사용자가 좋아요한 매물 목록 (Property 정보와 함께 조회)
    @Query("SELECT pl FROM PropertyLike pl JOIN FETCH pl.property p WHERE pl.memberEmail = :memberEmail")
    List<PropertyLike> findByMemberEmailWithProperty(@Param("memberEmail") String memberEmail);
    
    // 특정 매물의 모든 좋아요
    List<PropertyLike> findByPropertyId(Long propertyId);
    
    // 특정 매물에 대한 특정 사용자의 좋아요 삭제
    void deleteByPropertyIdAndMemberEmail(Long propertyId, String memberEmail);
    
    // 특정 매물의 모든 좋아요 삭제
    void deleteByPropertyId(Long propertyId);
} 