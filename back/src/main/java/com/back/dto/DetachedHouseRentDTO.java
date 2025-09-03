package com.back.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class DetachedHouseRentDTO {
    
    private Long no;
    private String sigungu; // 시군구
    private String roadCondition; // 도로조건
    private Double contractArea; // 계약면적(㎡)
    private String rentType; // 전월세구분 (전세/월세)
    private LocalDate contractDate; // 계약 날짜
    private Long deposit; // 보증금(만원)
    private Long monthlyRent; // 월세금(만원)
    private Integer constructionYear; // 건축년도
    private String roadName; // 도로명
    private String housingType; // 주택유형 (단독주택/다가구주택)
    private String transactionType; // 거래구분 (매매/전세/월세)
} 