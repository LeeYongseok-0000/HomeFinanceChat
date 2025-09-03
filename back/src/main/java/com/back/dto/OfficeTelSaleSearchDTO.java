package com.back.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class OfficeTelSaleSearchDTO {
    
    private String sigungu; // 시군구
    private String legalDong; // 법정동
    private String complexName; // 단지명
    private String housingType; // 주택유형
    private String transactionType; // 거래구분 (매매/전세/월세)
    private Double minArea; // 최소 면적
    private Double maxArea; // 최대 면적
    private Long minAmount; // 최소 거래금액
    private Long maxAmount; // 최대 거래금액
    private Integer minFloor; // 최소 층
    private Integer maxFloor; // 최대 층
    private Integer minConstructionYear; // 최소 건축년도
    private Integer maxConstructionYear; // 최대 건축년도
} 