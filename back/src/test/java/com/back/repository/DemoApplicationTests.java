package com.back.repository;

import com.back.domain.LoanProduct;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Arrays;
import java.util.List;

@SpringBootTest
class DemoApplicationTests {

    @Autowired
    private LoanProductRepository loanProductRepository;

    @Test
    void contextLoads() {
    }

    @Test
    void checkSavedData() {
        System.out.println("\n🔍 저장된 데이터 확인 중...");
        
        long totalCount = loanProductRepository.count();
        System.out.println("📊 총 저장된 상품 수: " + totalCount);
        
        if (totalCount == 0) {
            System.out.println("❌ 저장된 상품이 없습니다. initializeLoanProducts 테스트를 먼저 실행해주세요.");
            return;
        }
        
        // 대출 유형별 상품 수 확인
        long leaseCount = loanProductRepository.findAll().stream()
            .filter(p -> "전세자금대출".equals(p.getLoanType()))
            .count();
        long collateralCount = loanProductRepository.findAll().stream()
            .filter(p -> "주택담보대출".equals(p.getLoanType()))
            .count();
        
        System.out.println("🏢 전세자금대출 상품 수: " + leaseCount + "개");
        System.out.println("🏠 담보대출 상품 수: " + collateralCount + "개");
        
        // 전세자금대출 상품 몇 개 출력
        if (leaseCount > 0) {
            System.out.println("\n📋 전세자금대출 상품 목록:");
            loanProductRepository.findAll().stream()
                .filter(p -> "전세자금대출".equals(p.getLoanType()))
                .limit(3)
                .forEach(p -> {
                    System.out.println("  - " + p.getBank() + ": " + p.getProductName());
                });
        }
        
        // 담보대출 상품 몇 개 출력
        if (collateralCount > 0) {
            System.out.println("\n📋 담보대출 상품 목록:");
            loanProductRepository.findAll().stream()
                .filter(p -> "주택담보대출".equals(p.getLoanType()))
                .limit(3)
                .forEach(p -> {
                    System.out.println("  - " + p.getBank() + ": " + p.getProductName());
                });
        }
    }

    @Test
    void initializeLoanProducts() {
        try {
            // 기존 데이터 완전 삭제
            System.out.println("기존 데이터 삭제 중...");
            loanProductRepository.deleteAll();
            loanProductRepository.flush(); // 즉시 DB에 반영
            System.out.println("✅ 기존 데이터 삭제 완료");
            
            // 더미 데이터 생성 및 저장
            System.out.println("새로운 더미 데이터 생성 중...");
            List<LoanProduct> products = createDummyLoanProducts();
            System.out.println("📝 생성된 상품 수: " + products.size() + "개");
            
            // 전세자금대출 상품 수 확인
            long leaseCount = products.stream()
                .filter(p -> "전세자금대출".equals(p.getLoanType()))
                .count();
            System.out.println("🏢 전세자금대출 상품 수: " + leaseCount + "개");
            
            // 담보대출 상품 수 확인
            long collateralCount = products.stream()
                .filter(p -> "주택담보대출".equals(p.getLoanType()))
                .count();
            System.out.println("🏠 담보대출 상품 수: " + collateralCount + "개");
            
            // DB에 저장
            System.out.println("💾 DB에 저장 중...");
            loanProductRepository.saveAll(products);
            loanProductRepository.flush(); // 즉시 DB에 반영
            System.out.println("✅ 더미 데이터가 성공적으로 저장되었습니다.");
            
            // 저장된 데이터 확인
            long count = loanProductRepository.count();
            System.out.println("📊 저장된 상품 수: " + count);
            
            if (count == 0) {
                System.out.println("❌ 경고: 저장된 상품이 없습니다!");
                return;
            }
            
            // 각 은행별 상품 수 출력
            System.out.println("\n📋 은행별 상품 현황:");
            Arrays.asList("신한은행",  "KB국민은행", "카카오뱅크", "우리은행", "하나은행", "NH농협은행")
                .forEach(bank -> {
                    long bankCount = loanProductRepository.findByBank(bank).size();
                    if (bankCount > 0) {
                        System.out.println("  - " + bank + ": " + bankCount + "개");
                    }
                });
            
            // 대출 유형별 상품 수 출력
            System.out.println("\n🏦 대출 유형별 상품 현황:");
            long savedLeaseCount = loanProductRepository.findAll().stream()
                .filter(p -> "전세자금대출".equals(p.getLoanType()))
                .count();
            long savedCollateralCount = loanProductRepository.findAll().stream()
                .filter(p -> "주택담보대출".equals(p.getLoanType()))
                .count();
            System.out.println("  - 전세자금대출: " + savedLeaseCount + "개");
            System.out.println("  - 담보대출: " + savedCollateralCount + "개");
            
        } catch (Exception e) {
            System.err.println("❌ 에러 발생: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Test
    void initializeCollateralLoanProducts() {
        try {
            System.out.println("\n🏠 담보대출 상품만 초기화 중...");
            
            // 기존 담보대출 데이터만 삭제
            List<LoanProduct> existingCollateral = loanProductRepository.findAll().stream()
                .filter(p -> "주택담보대출".equals(p.getLoanType()))
                .toList();
            loanProductRepository.deleteAll(existingCollateral);
            System.out.println("✅ 기존 담보대출 데이터 삭제 완료");
            
            // 담보대출 상품 생성
            List<LoanProduct> collateralProducts = createCollateralLoanProducts();
            System.out.println("📝 생성된 담보대출 상품 수: " + collateralProducts.size() + "개");
            
            // DB에 저장
            loanProductRepository.saveAll(collateralProducts);
            System.out.println("✅ 담보대출 상품 저장 완료");
            
            // 저장 확인
            long collateralCount = loanProductRepository.findAll().stream()
                .filter(p -> "주택담보대출".equals(p.getLoanType()))
                .count();
            System.out.println("📊 저장된 담보대출 상품 수: " + collateralCount + "개");
            
        } catch (Exception e) {
            System.err.println("❌ 담보대출 초기화 에러: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Test
    void initializeLeaseLoanProducts() {
        try {
            System.out.println("\n🏢 전세자금대출 상품만 초기화 중...");
            
            // 기존 전세자금대출 데이터만 삭제
            List<LoanProduct> existingLease = loanProductRepository.findAll().stream()
                .filter(p -> "전세자금대출".equals(p.getLoanType()))
                .toList();
            loanProductRepository.deleteAll(existingLease);
            System.out.println("✅ 기존 전세자금대출 데이터 삭제 완료");
            
            // 전세자금대출 상품 생성
            List<LoanProduct> leaseProducts = createLeaseLoanProducts();
            System.out.println("📝 생성된 전세자금대출 상품 수: " + leaseProducts.size() + "개");
            
            // DB에 저장
            loanProductRepository.saveAll(leaseProducts);
            System.out.println("✅ 전세자금대출 상품 저장 완료");
            
            // 저장 확인
            long leaseCount = loanProductRepository.findAll().stream()
                .filter(p -> "전세자금대출".equals(p.getLoanType()))
                .count();
            System.out.println("📊 저장된 전세자금대출 상품 수: " + leaseCount + "개");
            
        } catch (Exception e) {
            System.err.println("❌ 전세자금대출 초기화 에러: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private List<LoanProduct> createDummyLoanProducts() {
        List<LoanProduct> allProducts = new java.util.ArrayList<>();
        allProducts.addAll(createCollateralLoanProducts());
        allProducts.addAll(createLeaseLoanProducts());
        return allProducts;
    }

    private List<LoanProduct> createCollateralLoanProducts() {
        return Arrays.asList(
            // 청년 무주택자 전용 담보대출 상품들
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
            new LoanProduct(
                "kb-01",
                "KB국민은행",
                "청년 무주택자 전용 주택담보대출",
                "주택담보대출",
                "만 19~34세 청년 무주택자 대상, 연 소득 제한과 우대금리를 통한 맞춤형 대출 상품입니다.",
                "3.0% ~ 3.5%",
                "최대 2억원",
                "최대 30년",
                new LoanProduct.Qualification("만 19세~34세", "무주택자", "연소득 4천만원 이하", "650점 이상"),
                Arrays.asList("신분증", "재직증명서", "소득금액증명원", "주택매매계약서"),
                "https://www.kbstar.com/youngloan",
                Arrays.asList("고정금리", "변동금리", "혼합형"),
                70,
                true,
                false,
                true,
                0.9,
                false,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립")
            ),
            new LoanProduct(
                "kakao-01",
                "카카오뱅크",
                "청년 무주택자 주택담보대출",
                "주택담보대출",
                "청년 대상 무주택자 우대 상품으로 모바일 신청과 간편 대출 절차, 빠른 심사가 강점입니다.",
                "2.9% ~ 3.4%",
                "최대 1.5억원",
                "최대 30년",
                new LoanProduct.Qualification("만 19세~34세", "무주택자", "연소득 제한 없음", "600점 이상"),
                Arrays.asList("신분증", "재직증명서", "소득금액증명원", "주택매매계약서"),
                "https://kakaobank.com/youngloan",
                Arrays.asList("고정금리", "변동금리"),
                60,
                false,
                true,
                false,
                0.5,
                true,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택")
            ),
            new LoanProduct(
                "woori-01",
                "우리은행",
                "청년 무주택자 우대 주택담보대출",
                "주택담보대출",
                "청년과 무주택자를 위한 우대금리 적용 상품으로 모바일 신청과 간편한 접근성을 제공합니다.",
                "3.0% ~ 3.5%",
                "최대 1.8억원",
                "최대 30년",
                new LoanProduct.Qualification("만 19세~34세", "무주택자", "연소득 제한 없음", "620점 이상"),
                Arrays.asList("신분증", "재직증명서", "소득금액증명원", "주택매매계약서"),
                "https://wooribank.com/youngloan",
                Arrays.asList("고정금리", "변동금리", "혼합형"),
                65,
                true,
                false,
                true,
                0.8,
                false,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립")
            ),
            new LoanProduct(
                "nonghyup-01",
                "농협은행",
                "청년 우대형 주택담보대출",
                "주택담보대출",
                "만 19~34세 농촌 및 도시 청년 대상 우대 상품으로 중도상환수수료가 낮아 조기 상환 시 유리합니다.",
                "2.7% ~ 3.3%",
                "최대 2억원",
                "최대 30년",
                new LoanProduct.Qualification("만 19세~34세", "무주택자", "연소득 제한 없음", "600점 이상"),
                Arrays.asList("신분증", "재직증명서", "소득금액증명원", "주택매매계약서"),
                "https://nhbank.com/youngloan",
                Arrays.asList("고정금리", "변동금리", "혼합형"),
                70,
                true,
                true,
                true,
                0.9,
                true,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립")
            ),
            new LoanProduct(
                "hana-01",
                "하나은행",
                "생애최초 주택구입자 우대 대출",
                "주택담보대출",
                "생애최초 주택구입자 대상 상품으로 금리 우대 및 대출 한도 확대 혜택을 제공합니다.",
                "2.9% ~ 3.4%",
                "최대 2.5억원",
                "최대 30년",
                new LoanProduct.Qualification("만 19세 이상", "무주택자 및 생애최초 주택구입자", "연소득 제한 없음", "620점 이상"),
                Arrays.asList("신분증", "재직증명서", "소득금액증명원", "주택매매계약서"),
                "https://hanafnbank.com/firsthome",
                Arrays.asList("고정금리", "변동금리", "혼합형"),
                70,
                true,
                false,
                false,
                0.8,
                false,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립")
            ),
            
            // 생애최초 주택구입자 전용 담보대출 상품들
            new LoanProduct(
                "shinhan-02",
                "신한은행",
                "생애최초 주택구입자 전용 대출",
                "주택담보대출",
                "생애최초 주택구입자를 위한 전용 상품으로 특별 우대금리를 제공합니다.",
                "2.6% ~ 3.0%",
                "최대 3억원",
                "최대 30년",
                new LoanProduct.Qualification("만 19세 이상", "생애최초 주택구입자", "연소득 제한 없음", "650점 이상"),
                Arrays.asList("신분증", "재직증명서", "소득금액증명원", "주택매매계약서"),
                "https://bank.shinhan.com/firsthome",
                Arrays.asList("고정금리", "변동금리", "혼합형"),
                70,
                true,
                true,
                false,
                1.0,
                true,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립")
            ),
            new LoanProduct(
                "kb-02",
                "KB국민은행",
                "생애최초 주택구입자 우대 대출",
                "주택담보대출",
                "생애최초 주택구입자 대상 우대 상품으로 낮은 금리와 높은 한도를 제공합니다.",
                "2.8% ~ 3.2%",
                "최대 2.8억원",
                "최대 30년",
                new LoanProduct.Qualification("만 19세 이상", "생애최초 주택구입자", "연소득 제한 없음", "630점 이상"),
                Arrays.asList("신분증", "재직증명서", "소득금액증명원", "주택매매계약서"),
                "https://www.kbstar.com/firsthome",
                Arrays.asList("고정금리", "변동금리", "혼합형"),
                70,
                true,
                false,
                false,
                0.9,
                false,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립")
            ),
            new LoanProduct(
                "kakao-03",
                "카카오뱅크",
                "카카오뱅크 생애최초 주택담보대출",
                "주택담보대출",
                "생애최초 주택구입자 대상 모바일 간편 신청 상품.",
                "2.9% ~ 3.4%",
                "최대 2억원",
                "최대 30년",
                new LoanProduct.Qualification("만 19세 이상", "생애최초 주택구입자", "연소득 제한 없음", "600점 이상"),
                Arrays.asList("신분증", "재직증명서", "소득금액증명원", "주택매매계약서"),
                "https://www.kakaobank.com/firsthome",
                Arrays.asList("고정금리", "변동금리"),
                70,
                true,
                true,
                false,
                0.8,
                true,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택")
            ),
            new LoanProduct(
                "woori-03",
                "우리은행",
                "우리은행 생애최초 주택담보대출",
                "주택담보대출",
                "생애최초 주택구입자 대상 우대 상품.",
                "2.8% ~ 3.3%",
                "최대 2.5억원",
                "최대 30년",
                new LoanProduct.Qualification("만 19세 이상", "생애최초 주택구입자", "연소득 제한 없음", "620점 이상"),
                Arrays.asList("신분증", "재직증명서", "소득금액증명원", "주택매매계약서"),
                "https://wooribank.com/firsthome",
                Arrays.asList("고정금리", "변동금리", "혼합형"),
                70,
                true,
                false,
                false,
                0.9,
                false,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립")
            ),
            new LoanProduct(
                "nonghyup-03",
                "농협은행",
                "NH 생애최초 주택담보대출",
                "주택담보대출",
                "생애최초 주택구입자 대상 우대 상품.",
                "2.7% ~ 3.2%",
                "최대 2.5억원",
                "최대 30년",
                new LoanProduct.Qualification("만 19세 이상", "생애최초 주택구입자", "연소득 제한 없음", "620점 이상"),
                Arrays.asList("신분증", "재직증명서", "소득금액증명원", "주택매매계약서"),
                "https://nhbank.com/firsthome",
                Arrays.asList("고정금리", "변동금리", "혼합형"),
                70,
                true,
                true,
                false,
                0.9,
                true,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립")
            ),
            new LoanProduct(
                "hana-03",
                "하나은행",
                "하나 생애최초 주택담보대출",
                "주택담보대출",
                "생애최초 주택구입자 대상 우대 상품.",
                "2.8% ~ 3.3%",
                "최대 2.5억원",
                "최대 30년",
                new LoanProduct.Qualification("만 19세 이상", "생애최초 주택구입자", "연소득 제한 없음", "620점 이상"),
                Arrays.asList("신분증", "재직증명서", "소득금액증명원", "주택매매계약서"),
                "https://www.kebhana.com/firsthome",
                Arrays.asList("고정금리", "변동금리", "혼합형"),
                70,
                true,
                false,
                false,
                0.8,
                false,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립")
            ),
            
            // 일반 담보대출 상품들
            new LoanProduct(
                "shinhan-03",
                "신한은행",
                "신한 주택담보대출",
                "주택담보대출",
                "아파트, 단독주택 등 부동산 담보로 대출 가능. 생애최초/기존주택 모두 신청 가능.",
                "3.6% ~ 4.5%",
                "담보가액의 최대 70%",
                "최대 35년",
                new LoanProduct.Qualification("성인", "무관", "소득 증빙 가능자", "600점 이상 권장"),
                Arrays.asList("신분증", "소득확인서류", "등기부등본", "주택매매계약서"),
                "https://bank.shinhan.com/",
                Arrays.asList("고정금리", "변동금리", "혼합형"),
                70,
                true,
                true,
                true,
                1.0,
                true,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립", "오피스텔")
            ),
            new LoanProduct(
                "kb-03",
                "KB국민은행",
                "KB 주택담보대출",
                "주택담보대출",
                "부동산을 담보로 한 대출 상품으로 금리 선택형(고정·변동) 가능.",
                "3.61% ~ 5.01%",
                "담보가액의 최대 70%",
                "최대 35년",
                new LoanProduct.Qualification("성인", "무관", "정상적인 소득 증빙 필요", "신용등급 6등급 이내 권장"),
                Arrays.asList("신분증", "소득증빙서류", "부동산등기부등본", "매매계약서"),
                "https://obank.kbstar.com/",
                Arrays.asList("고정금리", "변동금리", "혼합형"),
                70,
                true,
                false,
                true,
                0.9,
                false,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립", "오피스텔")
            ),
            new LoanProduct(
                "kakao-02",
                "카카오뱅크",
                "카카오뱅크 주택담보대출",
                "주택담보대출",
                "모바일 기반 간편 신청 가능한 주택담보대출 서비스.",
                "3.7% ~ 5.4%",
                "최대 10억원 (담보에 따라 상이)",
                "최대 40년",
                new LoanProduct.Qualification("만 19세 이상", "소유 주택 담보 제공 가능자", "소득 증빙 필요", "나이스/올크레딧 기준 신용 점수 기준 이상"),
                Arrays.asList("신분증", "소득증빙서류", "주택 관련 서류"),
                "https://www.kakaobank.com/products/mortgage",
                Arrays.asList("고정금리", "변동금리"),
                60,
                false,
                true,
                false,
                0.5,
                true,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립")
            ),
            new LoanProduct(
                "woori-02",
                "우리은행",
                "우리 아파트론 (또는 주택담보대출)",
                "주택담보대출",
                "아파트 및 공동주택 담보로 제공 가능한 주택담보대출 상품.",
                "4.3% ~ 4.8%",
                "담보가액의 최대 70%",
                "최대 35년",
                new LoanProduct.Qualification("성인", "담보제공 가능자", "근로·사업소득 증빙 필요", "신용 600점 이상"),
                Arrays.asList("주민등록증", "등기부등본", "소득확인서류", "매매계약서"),
                "https://spot.wooribank.com/",
                Arrays.asList("고정금리", "변동금리", "혼합형"),
                70,
                true,
                false,
                true,
                0.8,
                false,
                Arrays.asList("수도권 아파트", "지방 아파트")
            ),
            new LoanProduct(
                "nonghyup-02",
                "농협은행",
                "NH주택담보대출",
                "주택담보대출",
                "주택을 담보로 제공 시 가능한 대출로, 중도상환 수수료 유리.",
                "3.6% ~ 5.6%",
                "최대 10억원",
                "최대 35년",
                new LoanProduct.Qualification("성인", "주택 담보제공 가능자", "소득증빙 필요", "신용등급 6등급 이상 권장"),
                Arrays.asList("신분증", "소득확인서", "부동산 서류"),
                "https://banking.nonghyup.com/",
                Arrays.asList("고정금리", "변동금리", "혼합형"),
                70,
                true,
                true,
                true,
                0.9,
                true,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립", "오피스텔")
            ),
            new LoanProduct(
                "hana-02",
                "하나은행",
                "하나 주택담보대출",
                "주택담보대출",
                "아파트, 빌라 등 부동산 담보대출 상품으로 생애최초 대상과 일반 대상 구분 제공.",
                "3.8% ~ 4.6%",
                "담보가액의 최대 70%",
                "최대 35년",
                new LoanProduct.Qualification("성인", "주택 소유 여부 무관 (담보 제공 필수)", "정상 소득증빙 필요", "신용점수 600 이상"),
                Arrays.asList("주민등록증", "등기부등본", "소득확인서류", "계약서"),
                "https://www.kebhana.com/",
                Arrays.asList("고정금리", "변동금리", "혼합형"),
                70,
                true,
                false,
                false,
                0.8,
                false,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립", "오피스텔")
            )
        );
    }

    private List<LoanProduct> createLeaseLoanProducts() {
        return Arrays.asList(
            // 일반 전세자금대출 상품들
            new LoanProduct(
                "shinhan-jeonse-01",
                "신한은행",
                "신한 쏠편한 전세대출 (서울보증보험)",
                "전세자금대출",
                "서울보증보험 보증 기반, 최대 80% 대출 가능. 금리 우대 조건 제공.",
                "3.8% ~ 5.0%",
                "최대 5억원",
                "최대 2년 (연장 가능)",
                new LoanProduct.Qualification("만 19세 이상", "무주택자 또는 1주택자", "연소득 제한 없음", "신용점수 600점 이상"),
                Arrays.asList("신분증", "임대차계약서", "주민등록등본", "소득금액증명원", "보증서류"),
                "https://bank.shinhan.com/index.jsp?cr=020308100000&pcd=S611116200",
                Arrays.asList("변동금리", "혼합형"),
                80,
                true,
                true,
                true,
                1.0,
                true,
                Arrays.asList("수도권 아파트", "지방 아파트", "단독주택", "빌라/연립")
            ),
            new LoanProduct(
                "kb-jeonse-01",
                "KB국민은행",
                "KB스타 전세자금대출 (HF/SGI/HUG)",
                "전세자금대출",
                "주택금융공사 등 보증기관 연계 전세자금대출, 갈아타기 가능.",
                "3.68% ~ 5.78%",
                "최대 4.44억원",
                "최대 2년 (연장 가능)",
                new LoanProduct.Qualification("만 19세 이상", "무주택자", "연소득 제한 없음", "600점 이상"),
                Arrays.asList("신분증", "임대차계약서", "등본", "소득금액증명원"),
                "https://obank.kbstar.com/quics?page=C022197",
                Arrays.asList("고정금리", "변동금리"),
                80,
                true,
                true,
                true,
                1.0,
                true,
                Arrays.asList("아파트", "연립주택", "단독주택")
            ),
            new LoanProduct(
                "kakao-jeonse-01",
                "카카오뱅크",
                "카카오뱅크 전세자금대출",
                "전세자금대출",
                "모바일 간편 신청 가능한 전세자금대출, 빠른 심사와 간편한 절차.",
                "3.6% ~ 5.9%",
                "최대 3억원",
                "최대 2년 (연장 가능)",
                new LoanProduct.Qualification("만 19세 이상", "무주택자", "연소득 제한 없음", "600점 이상"),
                Arrays.asList("신분증", "임대차계약서", "소득증빙서류"),
                "https://www.kakaobank.com/products/leaseLoan",
                Arrays.asList("변동금리"),
                80,
                false,
                true,
                true,
                0.8,
                true,
                Arrays.asList("아파트", "오피스텔", "빌라", "연립주택")
            ),
            new LoanProduct(
                "woori-jeonse-01",
                "우리은행",
                "우리WON전세대출 (HUG)",
                "전세자금대출",
                "HUG 보증 기반 전세대출, 주거 안정성을 위한 상품.",
                "3.2% ~ 4.5%",
                "최대 5억원",
                "최대 2년 (연장 가능)",
                new LoanProduct.Qualification("만 19세 이상", "무주택자", "연소득 제한 없음", "600점 이상"),
                Arrays.asList("신분증", "임대차계약서", "등본", "소득서류", "보증서류"),
                "https://spot.wooribank.com/pot/Dream?withyou=POLON0055",
                Arrays.asList("고정금리", "변동금리"),
                80,
                true,
                true,
                true,
                1.0,
                true,
                Arrays.asList("아파트", "연립주택", "빌라", "단독주택")
            ),
            new LoanProduct(
                "hana-jeonse-01",
                "하나은행",
                "하나 전세금안심대출",
                "전세자금대출",
                "전세보증금반환보증 연계 상품. 주택신보 보증.",
                "3.4% ~ 4.6%",
                "최대 5억원",
                "최대 2년 (연장 가능)",
                new LoanProduct.Qualification("만 19세 이상", "무주택자", "연소득 제한 없음", "600점 이상"),
                Arrays.asList("신분증", "임대차계약서", "소득금액증명원", "주민등록등본", "보증서류"),
                "https://www.kebhana.com/cont/mall/mall09/mall0903/mall090301/index.jsp",
                Arrays.asList("변동금리", "혼합형"),
                80,
                true,
                true,
                true,
                1.0,
                true,
                Arrays.asList("수도권 아파트", "지방 아파트", "연립주택", "빌라")
            ),
            new LoanProduct(
                "nh-jeonse-01",
                "NH농협은행",
                "NH 전세자금대출 (SGI 보증)",
                "전세자금대출",
                "서울보증보험 보증 기반 전세자금대출. 무주택자 대상, 최대 5억 원 한도. 소득 요건 없이 신청 가능하며, 우대금리 제공 조건도 있음.",
                "3.4% ~ 4.6%",
                "최대 5억원",
                "최대 2년 (연장 가능)",
                new LoanProduct.Qualification("만 19세 이상", "무주택자", "연소득 제한 없음", "600점 이상"),
                Arrays.asList("신분증", "임대차계약서", "주민등록등본", "소득금액증명원"),
                "https://bank.nonghyup.com/nh/main.html",
                Arrays.asList("변동금리", "혼합형"),
                80,
                true,
                true,
                true,
                1.0,
                true,
                Arrays.asList("아파트", "단독주택", "빌라/연립")
            ),
            
            // 청년 전세자금대출 상품들
            new LoanProduct(
                "shinhan-young-01",
                "신한은행",
                "신한 버팀목 청년전세대출",
                "전세자금대출",
                "만 19~34세 청년 대상, 최대 90% 보증, 낮은 금리 적용",
                "1.7% ~ 3.3%",
                "최대 1.5억원",
                "2년 (연장 가능)",
                new LoanProduct.Qualification("만 19세~34세", "무주택자", "연소득 제한 없음", "600점 이상"),
                Arrays.asList("신분증", "임대차계약서", "소득증빙서류"),
                "https://bank.shinhan.com/youngjeonse",
                Arrays.asList("고정금리", "변동금리"),
                90,
                false,
                true,
                true,
                0.7,
                true,
                Arrays.asList("아파트", "오피스텔", "빌라")
            ),
            new LoanProduct(
                "kb-young-01",
                "KB국민은행",
                "KB 청년맞춤형 전세자금대출",
                "전세자금대출",
                "만 19~34세 청년 대상, 주택금융공사 보증 기반 간편 심사, 우대금리 적용",
                "2.66%",
                "최대 2억원",
                "2년 (연장 가능)",
                new LoanProduct.Qualification("만 19세~34세", "무주택자", "연소득 제한 없음", "650점 이상"),
                Arrays.asList("신분증", "임대차계약서", "주민등록등본", "소득금액증명원"),
                "https://obank.kbstar.com/quics?page=C022197",
                Arrays.asList("고정금리", "변동금리"),
                90,
                false,
                true,
                true,
                0.6,
                true,
                Arrays.asList("아파트", "연립주택", "단독주택")
            ),
            new LoanProduct(
                "kakao-young-01",
                "카카오뱅크",
                "청년 전월세보증금 대출",
                "전세자금대출",
                "만 19~34세 청년 대상, 보증금 90%, 낮은 금리, 모바일 간편 신청",
                "3.1% ~ 4.3%",
                "최대 2억원",
                "2년 (연장 가능)",
                new LoanProduct.Qualification("만 19세~34세", "무주택자", "연소득 제한 없음", "600점 이상"),
                Arrays.asList("신분증", "임대차계약서", "소득증빙서류"),
                "https://www.kakaobank.com/products/leaseLoan",
                Arrays.asList("변동금리"),
                90,
                false,
                true,
                true,
                0.7,
                true,
                Arrays.asList("아파트", "오피스텔", "빌라")
            ),
            new LoanProduct(
                "woori-young-01",
                "우리은행",
                "우리 청년전세대출",
                "전세자금대출",
                "만 19~34세 청년 대상, HUG 보증, 우대금리 적용",
                "3.4% ~ 3.4%",
                "최대 2억원",
                "2년 (연장 가능)",
                new LoanProduct.Qualification("만 19세~34세", "무주택자", "연소득 제한 없음", "650점 이상"),
                Arrays.asList("신분증", "임대차계약서", "등본", "소득서류"),
                "https://spot.wooribank.com/pot/Dream?withyou=POLON0055",
                Arrays.asList("고정금리", "변동금리"),
                90,
                false,
                true,
                true,
                0.65,
                true,
                Arrays.asList("아파트", "연립주택", "빌라")
            ),
            new LoanProduct(
                "hana-young-01",
                "하나은행",
                "하나 청년전세론",
                "전세자금대출",
                "만 19~34세 청년 대상, 주택신보 보증, 모바일 신청 가능",
                "2.7% ~ 3.6%",
                "최대 2억원",
                "2년 (연장 가능)",
                new LoanProduct.Qualification("만 19세~34세", "무주택자", "연소득 제한 없음", "620점 이상"),
                Arrays.asList("신분증", "임대차계약서", "소득금액증명원"),
                "https://www.kebhana.com/cont/mall/mall09/mall0903/mall090301/index.jsp",
                Arrays.asList("변동금리", "혼합형"),
                90,
                false,
                true,
                true,
                0.6,
                true,
                Arrays.asList("수도권 아파트", "지방 아파트", "연립주택", "빌라")
            ),
            new LoanProduct(
                "nh-young-01",
                "NH농협은행",
                "NH 청년전세대출",
                "전세자금대출",
                "만 19~34세 청년 대상, SGI 보증 기반, 우대금리 및 보증비율 상향",
                "2.8% ~ 3.7%",
                "최대 2억원",
                "2년 (연장 가능)",
                new LoanProduct.Qualification("만 19세~34세", "무주택자", "연소득 제한 없음", "620점 이상"),
                Arrays.asList("신분증", "임대차계약서", "주민등록등본", "소득금액증명원"),
                "https://bank.nonghyup.com/nh/main.html",
                Arrays.asList("변동금리", "혼합형"),
                90,
                false,
                true,
                true,
                0.65,
                true,
                Arrays.asList("아파트", "단독주택", "빌라/연립")
            )
        );
    }
}
