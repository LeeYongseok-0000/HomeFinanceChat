package com.back.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "detached_house_rent")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class DetachedHouseRent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;
    
    @Column(name = "sigungu", nullable = false)
    private String sigungu; // 시군구
    
    @Column(name = "road_condition", nullable = false)
    private String roadCondition; // 도로조건
    
    @Column(name = "contract_area", nullable = false)
    private Double contractArea; // 계약면적(㎡)
    
    @Column(name = "rent_type", nullable = false)
    private String rentType; // 전월세구분 (전세/월세)
    
    @Column(name = "contract_date", nullable = false)
    private LocalDate contractDate; // 계약 날짜
    
    @Column(name = "deposit", nullable = false)
    private Long deposit; // 보증금(만원)
    
    @Column(name = "monthly_rent", nullable = false)
    private Long monthlyRent; // 월세금(만원)
    
    @Column(name = "construction_year", nullable = false)
    private Integer constructionYear; // 건축년도
    
    @Column(name = "road_name", nullable = false)
    private String roadName; // 도로명
    
    @Column(name = "housing_type", nullable = false)
    private String housingType; // 주택유형 (단독주택/다가구주택)
    
    @Column(name = "transaction_type", nullable = false)
    private String transactionType; // 거래구분 (매매/전세/월세)
} 