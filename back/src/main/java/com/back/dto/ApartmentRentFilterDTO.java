package com.back.dto;

import lombok.Data;
import java.util.List;

@Data
public class ApartmentRentFilterDTO {
    private List<String> rentTypes; // 전세, 월세 중복 선택 가능
    private Integer minDeposit;      // 최소 보증금 (만원)
    private Integer maxDeposit;      // 최대 보증금 (만원)
    private Integer minMonthlyRent; // 최소 월세 (만원)
    private Integer maxMonthlyRent; // 최대 월세 (만원)
    private Double minArea;          // 최소 면적 (㎡)
    private Double maxArea;          // 최대 면적 (㎡)
    private Integer minFloor;        // 최소 층
    private Integer maxFloor;        // 최대 층
    private Integer minConstructionYear; // 최소 건축년도
    private Integer maxConstructionYear; // 최대 건축년도
    
    // 지역 필터링을 위한 필드들
    private String city;             // 시
    private String district;         // 구
    private String neighborhood;     // 동
    private String complexName;      // 단지명
    private String roadName;         // 도로명
} 