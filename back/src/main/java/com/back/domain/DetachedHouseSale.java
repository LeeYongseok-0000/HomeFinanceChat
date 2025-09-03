package com.back.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "detached_house_sale")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class DetachedHouseSale {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;
    
    @Column(name = "sigungu", nullable = false)
    private String sigungu; // 시군구
    
    @Column(name = "housing_type", nullable = false)
    private String housingType; // 주택유형 (단독주택/다가구주택)
    
    @Column(name = "road_condition", nullable = false)
    private String roadCondition; // 도로조건
    
    @Column(name = "total_area", nullable = false)
    private Double totalArea; // 연면적(㎡)
    
    @Column(name = "land_area", nullable = false)
    private Double landArea; // 대지면적(㎡)
    
    @Column(name = "contract_date", nullable = false)
    private LocalDate contractDate; // 계약 날짜
    
    @Column(name = "transaction_amount", nullable = false)
    private Long transactionAmount; // 거래금액(만원)
    
    @Column(name = "construction_year", nullable = false)
    private Integer constructionYear; // 건축년도
    
    @Column(name = "road_name", nullable = false)
    private String roadName; // 도로명
    
    @Column(name = "transaction_type", nullable = false)
    private String transactionType; // 거래구분 (매매/전세/월세)
} 