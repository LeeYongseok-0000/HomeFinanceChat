package com.back.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class PropertyDTO {
    
    private Long id;
    private String title;
    private String content;
    private String writer;
    private String writerEmail;
    private String propertyType;
    private String transactionType;
    private String price;
    private String monthlyRent;
    private Double area;
    private Integer rooms;
    private Integer bathrooms;
    private Integer floor;
    private Integer totalFloors;
    private Integer yearBuilt;
    private String roadAddress; // 도로명 주소
    private String detailAddress;
    private Double latitude;
    private Double longitude;
    private String parking;
    private String heating;
    private String petAllowed;
    private Boolean elevator;
    private Boolean balcony;
    private Boolean tv;
    private Boolean airConditioner;
    private Boolean shoeCabinet;
    private Boolean refrigerator;
    private Boolean washingMachine;
    private Boolean bathtub;
    private Boolean sink;
    private Boolean induction;
    private Boolean wardrobe;
    private Boolean fireAlarm;
    private String status;
    
    @Builder.Default
    private Integer transactionStatus = 1; // 거래 상태 (1: 거래 진행중, 0: 거래 완료)
    
    private Integer viewCount;
    private Integer likeCount;
    private Boolean isLiked;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 