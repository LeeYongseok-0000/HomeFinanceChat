package com.back.service;

import com.back.dto.PropertyReviewRequestDTO;
import com.back.domain.PropertyReviewRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PropertyReviewRequestService {
    
    // 검수 요청 생성
    PropertyReviewRequestDTO createReviewRequest(PropertyReviewRequestDTO requestDTO, String memberEmail);
    
    // 검수 요청 목록 조회 (사용자용)
    List<PropertyReviewRequestDTO> getUserReviewRequests(String memberEmail);
    
    // 검수 요청 목록 조회 (관리자용)
    List<PropertyReviewRequestDTO> getAllReviewRequests();
    
    // 검수 요청 상세 조회
    PropertyReviewRequestDTO getReviewRequest(Long id);
    
    // 검수 요청 승인
    PropertyReviewRequestDTO approveReviewRequest(Long id, String reviewComment);
    
    // 검수 요청 거절
    PropertyReviewRequestDTO rejectReviewRequest(Long id, String reviewComment);
    
    // 승인된 검수 요청 취소
    PropertyReviewRequestDTO cancelApprovedReviewRequest(Long id, String reviewComment);
    
    // 승인된 검수 요청을 Property로 변환
    void convertApprovedRequestsToProperties();
    
    // 검수 요청 이미지 업로드
    String uploadImage(Long id, MultipartFile imageFile);
} 