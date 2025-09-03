package com.back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchStatisticsDTO {
    private String searchKeyword;
    private String searchType; // "keyword", "complex", "region"
    private Long searchCount;
    private LocalDateTime lastSearched;
    private String region; // 시군구 정보
}
