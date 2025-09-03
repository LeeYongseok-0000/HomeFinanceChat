package com.back.dto;

import com.back.domain.LoanProduct;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class RecommendationResult {
    private List<LoanProductWithScore> products;
    private PurchaseInfo purchaseInfo;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = false)
    public static class LoanProductWithScore extends LoanProduct {
        private Double score;
        private Long calculatedMaxAmount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = false)
    public static class PurchaseInfo {
        private Long maxLoanAmount;
        private Long userAssets; // 사용자가 입력한 현금성 자산 (만원 단위)
        private Long maxPurchaseAmount;
        private LoanProductWithScore recommendedProduct;
    }
} 