package com.back.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ApartmentSaleSearchDTO {
    
    private String searchSigungu; // 시군구 검색
    private String searchComplexName; // 단지명 검색
    private String propertyType; // 주택유형
    private String transactionType; // 거래구분
    private Double minArea; // 최소 면적
    private Double maxArea; // 최대 면적
    private Long minAmount; // 최소 거래금액
    private Long maxAmount; // 최대 거래금액
    private Integer minYear; // 최소 건축년도
    private Integer maxYear; // 최대 건축년도
}

