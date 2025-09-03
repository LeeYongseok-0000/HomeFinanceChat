package com.back.controller;

import com.back.domain.LoanProduct;
import com.back.repository.LoanProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/init")
public class DataInitController {
    
    @Autowired
    private LoanProductRepository loanProductRepository;
    
    @PostMapping("/loan-products")
    public String initializeLoanProducts() {
        try {
            // 기존 데이터 삭제
            loanProductRepository.deleteAll();
            
            // 더미 데이터 생성 및 저장
            List<LoanProduct> products = createDummyLoanProducts();
            loanProductRepository.saveAll(products);
            
            long totalCount = loanProductRepository.count();
            long leaseCount = loanProductRepository.findAll().stream()
                .filter(p -> "전세자금대출".equals(p.getLoanType()))
                .count();
            long collateralCount = loanProductRepository.findAll().stream()
                .filter(p -> "주택담보대출".equals(p.getLoanType()))
                .count();
            
            return String.format("✅ 데이터 초기화 완료! 총 %d개 상품 (전세자금대출: %d개, 담보대출: %d개)", 
                totalCount, leaseCount, collateralCount);
                
        } catch (Exception e) {
            return "❌ 데이터 초기화 실패: " + e.getMessage();
        }
    }
    
    private List<LoanProduct> createDummyLoanProducts() {
        return Arrays.asList(
            // 기존 담보대출 상품들...
            new LoanProduct(
                "shinhan-01",
                "신한은행",
                "청년 무주택자 전용 주택담보대출",
                "주택담보대출",
                "만 19~34세 청년 무주택자 전용 상품으로 낮은 금리와 우대금리를 제공하여 초기 주택구입자에게 적합합니다.",
                "2.8% ~ 3.2%",
                "최대 2억원",
                "최대 30년",
                new LoanProduct.Qualification("만 19세~34세", "무주택자", "연소득 제한 없음", "600점 이상"),
                Arrays.asList("신분증", "재직증명서", "소득금액증명원", "주택매매계약서"),
                "https://bank.shinhan.com/younghome",
                Arrays.asList("고정금리", "변동금리", "혼합형"),
                70,
                true,
                true,
                true,
                1.0,
                true,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립")
            ),
            // 전세자금대출 상품들 추가
            new LoanProduct(
                "shinhan-lease-01",
                "신한은행",
                "신한 전세자금대출",
                "전세자금대출",
                "무주택자 대상 전세자금대출, 최대 3억원 한도, 신용점수 600점 이상, 연소득 제한 없음.",
                "3.2% ~ 3.8%",
                "최대 3억원",
                "최대 10년",
                new LoanProduct.Qualification("만 19세 이상", "무주택자", "연소득 제한 없음", "600점 이상"),
                Arrays.asList("신분증", "재직증명서", "소득금액증명원", "전세계약서"),
                "https://bank.shinhan.com/lease",
                Arrays.asList("고정금리", "변동금리"),
                80,
                true,
                true,
                false,
                0.5,
                true,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립")
            ),
            new LoanProduct(
                "kb-lease-01",
                "KB국민은행",
                "KB스타 전세자금대출 (HF/SGI/HUG)",
                "전세자금대출",
                "주택금융공사 등 보증기관 연계 전세자금대출, 갈아타기 가능.",
                "3.0% ~ 3.6%",
                "최대 3억원",
                "최대 10년",
                new LoanProduct.Qualification("만 19세 이상", "무주택자", "연소득 제한 없음", "600점 이상"),
                Arrays.asList("신분증", "재직증명서", "소득금액증명원", "전세계약서"),
                "https://www.kbstar.com/lease",
                Arrays.asList("고정금리", "변동금리"),
                80,
                true,
                false,
                false,
                0.3,
                true,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립")
            )
        );
    }
} 