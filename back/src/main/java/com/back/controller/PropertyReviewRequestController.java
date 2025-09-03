package com.back.controller;

import com.back.dto.PropertyReviewRequestDTO;
import com.back.service.PropertyReviewRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/property-review-requests")
@RequiredArgsConstructor
@Log4j2
public class PropertyReviewRequestController {
    
    private final PropertyReviewRequestService reviewRequestService;
    
    // 검수 요청 생성
    @PostMapping
    public ResponseEntity<PropertyReviewRequestDTO> createReviewRequest(
            @RequestBody PropertyReviewRequestDTO requestDTO) {
        
        String memberEmail = requestDTO.getMemberEmail();
        PropertyReviewRequestDTO createdRequest = reviewRequestService.createReviewRequest(requestDTO, memberEmail);
        
        return ResponseEntity.ok(createdRequest);
    }
    
    // 사용자의 검수 요청 목록 조회
    @GetMapping("/my")
    public ResponseEntity<List<PropertyReviewRequestDTO>> getMyReviewRequests(
            @RequestParam("memberEmail") String memberEmail) {
        
        List<PropertyReviewRequestDTO> requests = reviewRequestService.getUserReviewRequests(memberEmail);
        
        return ResponseEntity.ok(requests);
    }
    
    // 전체 검수 요청 목록 조회 (관리자용)
    @GetMapping
    public ResponseEntity<List<PropertyReviewRequestDTO>> getAllReviewRequests() {
        List<PropertyReviewRequestDTO> requests = reviewRequestService.getAllReviewRequests();
        
        return ResponseEntity.ok(requests);
    }
    
    // 검수 요청 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<PropertyReviewRequestDTO> getReviewRequest(@PathVariable("id") Long id) {
        PropertyReviewRequestDTO request = reviewRequestService.getReviewRequest(id);
        
        return ResponseEntity.ok(request);
    }
    
    // 검수 요청 승인 (관리자용)
    @PostMapping("/{id}/approve")
    public ResponseEntity<PropertyReviewRequestDTO> approveReviewRequest(
            @PathVariable("id") Long id,
            @RequestParam(value = "reviewComment", required = false) String reviewComment) {
        
        PropertyReviewRequestDTO approvedRequest = reviewRequestService.approveReviewRequest(id, reviewComment);
        
        return ResponseEntity.ok(approvedRequest);
    }
    
    // 검수 요청 거절 (관리자용)
    @PostMapping("/{id}/reject")
    public ResponseEntity<PropertyReviewRequestDTO> rejectReviewRequest(
            @PathVariable("id") Long id,
            @RequestParam(value = "reviewComment", required = false) String reviewComment) {
        
        PropertyReviewRequestDTO rejectedRequest = reviewRequestService.rejectReviewRequest(id, reviewComment);
        
        return ResponseEntity.ok(rejectedRequest);
    }
    
    // 승인된 검수 요청 취소 (관리자용)
    @PostMapping("/{id}/cancel-approval")
    public ResponseEntity<PropertyReviewRequestDTO> cancelApprovedReviewRequest(
            @PathVariable("id") Long id,
            @RequestParam(value = "reviewComment", required = false) String reviewComment) {
        
        PropertyReviewRequestDTO cancelledRequest = reviewRequestService.cancelApprovedReviewRequest(id, reviewComment);
        
        return ResponseEntity.ok(cancelledRequest);
    }
    
    // 승인된 검수 요청을 Property로 변환 (관리자용)
    @PostMapping("/convert-approved")
    public ResponseEntity<String> convertApprovedRequestsToProperties() {
        try {
            reviewRequestService.convertApprovedRequestsToProperties();
            return ResponseEntity.ok("승인된 검수 요청이 Property로 변환되고 목록에서 제거되었습니다.");
        } catch (Exception e) {
            log.error("Property 변환 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Property 변환 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // 검수 요청 이미지 업로드
    @PostMapping("/{id}/image")
    public ResponseEntity<String> uploadReviewRequestImage(
            @PathVariable("id") Long id,
            @RequestParam(value = "image") MultipartFile imageFile) {
        log.info("이미지 업로드 요청 받음 - 검수 요청 ID: {}, 파일명: {}, 크기: {} bytes", 
                id, imageFile.getOriginalFilename(), imageFile.getSize());
        
        try {
            String imageUrl = reviewRequestService.uploadImage(id, imageFile);
            log.info("이미지 업로드 성공 - 검수 요청 ID: {}, 반환된 파일명: {}", id, imageUrl);
            return ResponseEntity.ok(imageUrl);
        } catch (Exception e) {
            log.error("이미지 업로드 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("이미지 업로드에 실패했습니다: " + e.getMessage());
        }
    }
} 