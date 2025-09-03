package com.back.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ApartmentRentSearchDTO {
    
    private String sigungu; // 시군구
    private String complexName; // 단지명
    private String rentType; // 구분 (전세/월세)
    private String transactionType; // 거래구분 (매매/전세/월세)
    private Double minArea; // 최소 전용면적
    private Double maxArea; // 최대 전용면적
    private Integer minFloor; // 최소 층
    private Integer maxFloor; // 최대 층
    private Integer minConstructionYear; // 최소 건축년도
    private Integer maxConstructionYear; // 최대 건축년도
    private Long minDeposit; // 최소 보증금
    private Long maxDeposit; // 최대 보증금
    private Long minMonthlyRent; // 최소 월세
    private Long maxMonthlyRent; // 최대 월세
}
