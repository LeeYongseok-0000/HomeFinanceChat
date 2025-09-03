package com.back.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class DetachedHouseSaleSearchDTO {
    
    private String sigungu; // 시군구
    private String legalDong; // 법정동
    private String housingType; // 주택유형
    private String roadCondition; // 도로조건
    private String transactionType; // 거래구분 (매매/전세/월세)
    private Double minTotalArea; // 최소 연면적
    private Double maxTotalArea; // 최대 연면적
    private Double minLandArea; // 최소 대지면적
    private Double maxLandArea; // 최대 대지면적
    private Long minTransactionAmount; // 최소 거래금액
    private Long maxTransactionAmount; // 최대 거래금액
    private Integer minConstructionYear; // 최소 건축년도
    private Integer maxConstructionYear; // 최대 건축년도
} 