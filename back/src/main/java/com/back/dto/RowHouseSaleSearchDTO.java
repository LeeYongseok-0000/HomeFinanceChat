package com.back.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class RowHouseSaleSearchDTO {
    
    private String sigungu; // 시군구
    private String buildingName; // 건물명
    private String housingType; // 주택유형
    private String transactionType; // 거래구분 (매매/전세/월세)
    private Double minExclusiveArea; // 최소 전용면적
    private Double maxExclusiveArea; // 최대 전용면적
    private Double minLandArea; // 최소 대지권면적
    private Double maxLandArea; // 최대 대지권면적
    private Long minTransactionAmount; // 최소 거래금액
    private Long maxTransactionAmount; // 최대 거래금액
    private Integer minFloor; // 최소 층
    private Integer maxFloor; // 최대 층
    private Integer minConstructionYear; // 최소 건축년도
    private Integer maxConstructionYear; // 최대 건축년도
} 