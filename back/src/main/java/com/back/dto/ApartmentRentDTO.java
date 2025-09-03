package com.back.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ApartmentRentDTO {
    
    private Long no;
    private String sigungu; // 시군구
    private String complexName; // 단지명
    private String rentType; // 구분 (전세/월세)
    private Double exclusiveArea; // 전용면적(㎡)
    private LocalDate contractDate; // 계약 날짜
    private Long deposit; // 보증금(만원)
    private Long monthlyRent; // 월세금(만원)
    private Integer floor; // 층
    private Integer constructionYear; // 건축년도
    private String roadName; // 도로명
    private String housingType; // 주택유형
    private String transactionType; // 거래구분 (매매/전세/월세)
}
