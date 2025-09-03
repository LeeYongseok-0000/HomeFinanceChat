package com.back.service;

import com.back.dto.PropertyDTO;
import com.back.dto.ReplyDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface PropertyService {
    List<PropertyDTO> getAllProperties();
    List<PropertyDTO> getAllPropertiesWithAreaFilter(Double areaMin, Double areaMax);
    List<PropertyDTO> getAllPropertiesWithFilters(Double areaMin, Double areaMax, Integer roomCount, Integer bathroomCount, Integer floor, Integer yearBuiltMin, Integer yearBuiltMax);
    List<PropertyDTO> getPropertiesByType(String propertyType);
    List<PropertyDTO> getPropertiesByTypeWithFilters(String propertyType, Double areaMin, Double areaMax, Integer roomCount, Integer bathroomCount, Integer floor, Integer yearBuiltMin, Integer yearBuiltMax);
    List<PropertyDTO> getPropertiesByTransactionType(String transactionType);
    List<PropertyDTO> getPropertiesByTransactionTypeWithFilters(String transactionType, Double saleMin, Double saleMax, Double depositMin, Double depositMax, Double monthlyRentMin, Double monthlyRentMax, Double areaMin, Double areaMax);
    List<PropertyDTO> getPropertiesByTypeAndTransactionType(String propertyType, String transactionType);
    List<PropertyDTO> searchProperties(String keyword);
    Optional<PropertyDTO> getProperty(Long id, String memberEmail);
    PropertyDTO save(PropertyDTO propertyDTO);
    PropertyDTO update(Long id, PropertyDTO propertyDTO);
    void delete(Long id);
    
    // 파일 처리 메서드
    List<String> saveImages(List<MultipartFile> images);
    void deleteImage(String imageUrl);
    
    // 조회수 증가
    void incrementViewCount(Long id);
    
    // 좋아요 처리 (사용자별)
    void toggleLike(Long propertyId, String memberEmail);
    
    // 특정 사용자의 좋아요 여부 확인
    boolean isLikedByMember(Long propertyId, String memberEmail);
    
    // 특정 매물의 좋아요 개수 조회
    long getLikeCount(Long propertyId);
    
    // 특정 사용자가 좋아요한 매물 목록 조회
    List<PropertyDTO> getLikedPropertiesByMember(String memberEmail);
    
    // 사용자별 좋아요 상태를 포함한 전체 매물 목록 조회
    List<PropertyDTO> getAllPropertiesWithLikeStatus(String memberEmail);
    
    // 거래 상태 업데이트
    void updateTransactionStatus(Long id, Integer transactionStatus);
    
    // 매물 상태 업데이트
    void updateStatus(Long id, String status);
    
    // 본인이 작성한 매물 목록 조회 (검수요청되어 업로드된 것만)
    List<PropertyDTO> getMyProperties(String memberEmail);

    // 댓글 관련 메서드
    List<ReplyDTO> getPropertyInquiriesAsDTO(Long propertyId);
    ReplyDTO createPropertyInquiryAsDTO(Long propertyId, ReplyDTO inquiryDTO);
    List<ReplyDTO> getInquiryRepliesAsDTO(Long inquiryId);
    ReplyDTO createInquiryReplyAsDTO(Long inquiryId, ReplyDTO replyDTO);
    
    // 실거래가 조회 메서드들
    List<Map<String, Object>> getRecentSalesByAddress(String roadAddress, Double area);
    List<Map<String, Object>> getRecentRentsByAddress(String roadAddress, Double area);
} 