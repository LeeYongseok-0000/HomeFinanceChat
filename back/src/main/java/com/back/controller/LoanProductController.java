package com.back.controller;

import com.back.domain.LoanProduct;
import com.back.dto.RecommendationResult;
import com.back.dto.UserConditions;
import com.back.service.LoanProductService;
import com.back.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loan-products")
@CrossOrigin(origins = "*")
public class LoanProductController {
    
    @Autowired
    private LoanProductService loanProductService;
    
    @Autowired
    private RecommendationService recommendationService;
    
    @GetMapping
    public ResponseEntity<List<LoanProduct>> getAllProducts() {
        List<LoanProduct> products = loanProductService.getAllProducts();
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/bank/{bankName}")
    public ResponseEntity<List<LoanProduct>> getProductsByBank(@PathVariable String bankName) {
        List<LoanProduct> products = loanProductService.getProductsByBank(bankName);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/youth-preference")
    public ResponseEntity<List<LoanProduct>> getYouthPreferenceProducts() {
        List<LoanProduct> products = loanProductService.getYouthPreferenceProducts();
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/mobile-available")
    public ResponseEntity<List<LoanProduct>> getMobileAvailableProducts() {
        List<LoanProduct> products = loanProductService.getMobileAvailableProducts();
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/{productId}")
    public ResponseEntity<LoanProduct> getProductById(@PathVariable String productId) {
        // 이 메서드는 서비스에 추가해야 합니다
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/recommend")
    public ResponseEntity<RecommendationResult> getRecommendations(@RequestBody UserConditions userConditions) {
        try {
            System.out.println("=== 대출 추천 요청 시작 ===");
            System.out.println("받은 데이터: " + userConditions);
            System.out.println("🔍 UserConditions 상세 분석:");
            System.out.println("  - assets: " + userConditions.getAssets() + " (타입: " + (userConditions.getAssets() != null ? userConditions.getAssets().getClass().getSimpleName() : "null") + ")");
            System.out.println("  - income: " + userConditions.getIncome());
            System.out.println("  - age: " + userConditions.getAge());
            System.out.println("  - loanType: " + userConditions.getLoanType());
            
            // 실제 추천 서비스 호출
            RecommendationResult result = recommendationService.recommend(userConditions);
            
            System.out.println("=== 대출 추천 결과 생성 완료 ===");
            System.out.println("결과: " + result);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("=== 대출 추천 오류 발생 ===");
            System.err.println("오류 메시지: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
} 