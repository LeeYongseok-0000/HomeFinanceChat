package com.back.service;

import com.back.domain.LoanProduct;
import com.back.domain.MemberCredit;
import com.back.dto.RecommendationResult;
import com.back.dto.UserConditions;
import com.back.repository.LoanProductRepository;
import com.back.repository.MemberCreditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RecommendationServiceImpl implements RecommendationService {
    
    @Autowired
    private LoanProductRepository loanProductRepository;
    
    @Autowired
    private MemberCreditRepository memberCreditRepository;
    
    @Override
    public RecommendationResult recommend(UserConditions userConditions) {
        // 1. 자격 조건에 맞는 상품 필터링
        List<LoanProduct> eligibleProducts = filterProducts(userConditions);
        
        if (eligibleProducts.isEmpty()) {
            return new RecommendationResult(List.of(), null);
        }
        
        // 2. 점수 계산 및 정렬
        List<RecommendationResult.LoanProductWithScore> scoredProducts = calculateScores(eligibleProducts, userConditions);
        
        // 3. 최대 대출액 계산
        List<RecommendationResult.LoanProductWithScore> productsWithAmount = calculateMaxAmounts(scoredProducts, userConditions);
        
        // 4. 구매 가능 금액 계산
        RecommendationResult.PurchaseInfo purchaseInfo = calculatePurchaseInfo(productsWithAmount, userConditions);
        
        // 5. 최대 구매 가능액을 MemberCredit에 저장
        if (purchaseInfo != null && purchaseInfo.getMaxPurchaseAmount() != null) {
            saveMaxPurchaseAmount(userConditions, purchaseInfo.getMaxPurchaseAmount());
        }
        
        return new RecommendationResult(productsWithAmount, purchaseInfo);
    }
    
    // 최대 구매 가능액을 MemberCredit에 저장하는 메서드
    private void saveMaxPurchaseAmount(UserConditions userConditions, Long maxPurchaseAmount) {
        try {
            if (userConditions.getUserEmail() != null && !userConditions.getUserEmail().trim().isEmpty()) {
                // 사용자 이메일로 MemberCredit 찾기
                Optional<MemberCredit> memberCreditOpt = memberCreditRepository.findByMember_Email(userConditions.getUserEmail());
                
                if (memberCreditOpt.isPresent()) {
                    // 기존 MemberCredit이 있으면 최대 구매 가능액 업데이트
                    MemberCredit memberCredit = memberCreditOpt.get();
                    memberCredit.updateMaxPurchaseAmount(maxPurchaseAmount);
                    memberCreditRepository.save(memberCredit);
                    System.out.println("💾 최대 구매 가능액 저장 완료: " + formatAmountToKorean(maxPurchaseAmount));
                } else {
                    System.out.println("⚠️ 사용자 신용정보를 찾을 수 없음: " + userConditions.getUserEmail());
                }
            } else {
                System.out.println("⚠️ 사용자 이메일이 없어 최대 구매 가능액을 저장할 수 없음");
            }
        } catch (Exception e) {
            System.err.println("❌ 최대 구매 가능액 저장 실패: " + e.getMessage());
        }
    }
    
    // 금액을 한국어로 변환하는 헬퍼 메서드
    private String formatAmountToKorean(Long amount) {
        if (amount == null || amount == 0) return "0원";
        
        long num = amount;
        if (num < 10000) {
            return num + "원";
        }
        
        long billion = num / 100000000; // 1억 = 100,000,000원
        long million = (num % 100000000) / 10000; // 1만원 = 10,000원
        
        if (million == 0) {
            return billion + "억원";
        } else {
            return billion + "억" + million + "만원";
        }
    }
    
    private List<LoanProduct> filterProducts(UserConditions userConditions) {
        List<LoanProduct> allProducts = loanProductRepository.findAll();
        System.out.println("🔍 필터링 시작 - 총 상품 수: " + allProducts.size());
        System.out.println("📋 사용자 조건: 나이=" + userConditions.getAge() + 
                          ", 대출유형=" + userConditions.getLoanType() + 
                          ", 주택소유=" + userConditions.getHomeOwnership() + 
                          ", 신용점수=" + userConditions.getCreditScore());
        
        List<LoanProduct> filteredProducts = allProducts.stream()
            .filter(product -> {
                boolean loanTypeMatch = checkLoanTypeCondition(userConditions.getLoanType(), product.getLoanType());
                if (!loanTypeMatch) {
                    System.out.println("❌ 대출유형 필터링: " + product.getBank() + " " + product.getProductName());
                    return false;
                }
                return true;
            })
            .filter(product -> {
                if (product.getQualification() == null) {
                    System.out.println("❌ 자격조건 누락: " + product.getBank() + " " + product.getProductName());
                    return false;
                }
                
                boolean ageMatch = checkAgeCondition(userConditions.getAge(), product.getQualification().getAge());
                if (!ageMatch) {
                    System.out.println("❌ 나이 필터링: " + product.getBank() + " " + product.getProductName() + 
                                     " (요구: " + product.getQualification().getAge() + ", 사용자: " + userConditions.getAge() + "세)");
                    return false;
                }
                return true;
            })
            .filter(product -> {
                if (product.getQualification() == null) {
                    return false;
                }
                
                boolean homeMatch = checkHomeOwnershipCondition(userConditions.getHomeOwnership(), product.getQualification().getHomeOwnership());
                if (!homeMatch) {
                    System.out.println("❌ 주택소유 필터링: " + product.getBank() + " " + product.getProductName() + 
                                     " (요구: " + product.getQualification().getHomeOwnership() + ", 사용자: " + userConditions.getHomeOwnership() + ")");
                    return false;
                }
                return true;
            })
            .filter(product -> {
                if (product.getQualification() == null) {
                    return false;
                }
                
                boolean incomeMatch = checkIncomeCondition(userConditions, product.getQualification().getIncome());
                if (!incomeMatch) {
                    System.out.println("❌ 소득 필터링: " + product.getBank() + " " + product.getProductName());
                    return false;
                }
                return true;
            })
            .filter(product -> {
                if (product.getQualification() == null) {
                    return false;
                }
                
                boolean creditMatch = checkCreditScoreCondition(userConditions.getCreditScore(), product.getQualification().getCreditScore());
                if (!creditMatch) {
                    System.out.println("❌ 신용점수 필터링: " + product.getBank() + " " + product.getProductName() + 
                                     " (요구: " + product.getQualification().getCreditScore() + ", 사용자: " + userConditions.getCreditScore() + "점)");
                    return false;
                }
                return true;
            })
            .collect(Collectors.toList());
        
        System.out.println("✅ 필터링 완료 - 통과한 상품 수: " + filteredProducts.size());
        filteredProducts.forEach(product -> 
            System.out.println("  ✅ " + product.getBank() + " " + product.getProductName() + " (" + product.getLoanType() + ")")
        );
        
        return filteredProducts;
    }
    
    private boolean checkLoanTypeCondition(String userLoanType, String productLoanType) {
        if (userLoanType == null || productLoanType == null) {
            return true; // 필터링하지 않음
        }
        
        // 담보대출 매칭 (사용자: "담보대출" ↔ 상품: "주택담보대출")
        if ("담보대출".equals(userLoanType) && "주택담보대출".equals(productLoanType)) {
            return true;
        }
        
        // 전세자금대출 매칭
        if ("전세자금대출".equals(userLoanType) && "전세자금대출".equals(productLoanType)) {
            return true;
        }
        
        return false;
    }
    
    private boolean checkAgeCondition(Integer userAge, String ageRequirement) {
        if (ageRequirement.contains("만 19세~34세")) {
            return userAge >= 19 && userAge <= 34;
        } else if (ageRequirement.contains("만 19세 이상")) {
            return userAge >= 19;
        } else if (ageRequirement.contains("성인")) {
            return userAge >= 19;
        }
        return false;
    }
    
    private boolean checkHomeOwnershipCondition(String userHomeOwnership, String homeRequirement) {
        // 무주택자 조건
        if (homeRequirement.contains("무주택자") && !homeRequirement.contains("생애최초") && !homeRequirement.contains("무관")) {
            return "무주택자".equals(userHomeOwnership);
        } 
        // 생애최초 주택구입자 조건
        else if (homeRequirement.contains("생애최초") || homeRequirement.contains("무주택자 및 생애최초")) {
            return "무주택자".equals(userHomeOwnership) || "생애최초 주택구입자".equals(userHomeOwnership);
        } 
        // 일반 담보대출 상품들 (무관, 담보제공 가능자 등)
        else if (homeRequirement.contains("무관") || homeRequirement.contains("담보제공 가능자") || 
                   homeRequirement.contains("소유 주택 담보 제공 가능자") || homeRequirement.contains("주택 담보제공 가능자") ||
                   homeRequirement.contains("주택 소유 여부 무관")) {
            return true; // 모든 주택 소유 상태 허용
        }
        // 기타 조건들
        else if (homeRequirement.contains("무주택자 또는 1주택자")) {
            return "무주택자".equals(userHomeOwnership) || "1주택자".equals(userHomeOwnership);
        }
        
        return false;
    }
    
    private boolean checkIncomeCondition(UserConditions userConditions, String incomeRequirement) {
        if (incomeRequirement.contains("연소득 제한 없음")) {
            return true;
        } else if (incomeRequirement.contains("4천만원 이하")) {
            return userConditions.getIncome() <= 4000;
        }
        return true;
    }
    
    private boolean checkCreditScoreCondition(Integer userCreditScore, String creditRequirement) {
        // 숫자가 포함된 경우
        String numberStr = creditRequirement.replaceAll("[^0-9]", "");
        if (!numberStr.isEmpty()) {
            int requiredScore = Integer.parseInt(numberStr);
            return userCreditScore >= requiredScore;
        }
        
        // 신용등급으로 표시된 경우
        if (creditRequirement.contains("신용등급 6등급")) {
            return userCreditScore >= 600;
        }
        
        // "이상 권장" 등의 경우
        if (creditRequirement.contains("권장")) {
            return true;
        }
        
        return true;
    }
    
    private List<RecommendationResult.LoanProductWithScore> calculateScores(List<LoanProduct> products, UserConditions userConditions) {
        return products.stream()
            .map(product -> {
                RecommendationResult.LoanProductWithScore scoredProduct = new RecommendationResult.LoanProductWithScore();
                // LoanProduct의 모든 필드를 복사
                scoredProduct.setProductId(product.getProductId());
                scoredProduct.setBank(product.getBank());
                scoredProduct.setProductName(product.getProductName());
                scoredProduct.setLoanType(product.getLoanType());
                scoredProduct.setDescription(product.getDescription());
                scoredProduct.setInterestRate(product.getInterestRate());
                scoredProduct.setMaxAmount(product.getMaxAmount());
                scoredProduct.setLoanPeriod(product.getLoanPeriod());
                scoredProduct.setQualification(product.getQualification());
                scoredProduct.setRequiredDocs(product.getRequiredDocs());
                scoredProduct.setLink(product.getLink());
                scoredProduct.setRateTypes(product.getRateTypes());
                scoredProduct.setLtvRatio(product.getLtvRatio());
                scoredProduct.setDsrPreference(product.getDsrPreference());
                scoredProduct.setMobileAvailable(product.getMobileAvailable());
                scoredProduct.setYouthPreference(product.getYouthPreference());
                scoredProduct.setPreferentialRate(product.getPreferentialRate());
                scoredProduct.setDocumentSimplicity(product.getDocumentSimplicity());
                scoredProduct.setCollateralTypes(product.getCollateralTypes());
                
                // 점수 계산
                double score = calculateProductScore(product, userConditions);
                scoredProduct.setScore(score);
                
                return scoredProduct;
            })
            .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()))
            .collect(Collectors.toList());
    }
    
    private double calculateProductScore(LoanProduct product, UserConditions userConditions) {
        double score = 0.0;
        
        // 0. 주거래 은행 보너스 (1점)
        if (userConditions.getMainBank() != null && userConditions.getMainBank().equals(product.getBank())) {
            score += 1.0;
        }
        
        // 1. 금리 수준 (1~5점, 낮을수록 고득점)
        String interestRateStr = product.getInterestRate();
        double minRate, maxRate, avgRate, rateSpread;
        
        if (interestRateStr.contains("~")) {
            // 변동금리: "3.1% ~ 4.5%" 형태
            String[] rateRange = interestRateStr.split("~");
            String minRateStr = rateRange[0].replace("%", "").trim();
            String maxRateStr = rateRange[1].replace("%", "").trim();
            
            minRate = Double.parseDouble(minRateStr);
            maxRate = Double.parseDouble(maxRateStr);
        } else {
            // 고정금리: "2.66%" 형태
            String rateStr = interestRateStr.replace("%", "").trim();
            minRate = Double.parseDouble(rateStr);
            maxRate = minRate; // 최저=최고
        }
        
        avgRate = (minRate + maxRate) / 2.0; // 평균 금리
        rateSpread = maxRate - minRate; // 금리 스프레드
        
        // 평균 금리 기준 점수 (낮을수록 고득점)
        double rateScore = 0.0;
        if (avgRate <= 2.8) rateScore = 5.0;
        else if (avgRate <= 3.2) rateScore = 4.0;
        else if (avgRate <= 3.6) rateScore = 3.0;
        else if (avgRate <= 4.0) rateScore = 2.0;
        else rateScore = 1.0;
        
        // 금리 스프레드 보너스 (좁을수록 안정적, +0.5점)
        if (rateSpread <= 1.0) {
            rateScore += 0.5;
        }
        
        score += rateScore;
        
        // 2. LTV 조건 (담보대출인 경우에만, 1~5점, 높을수록 고득점)
        if ("담보대출".equals(userConditions.getLoanType())) {
            if (product.getLtvRatio() >= 70) score += 5.0;
            else if (product.getLtvRatio() >= 65) score += 4.0;
            else if (product.getLtvRatio() >= 60) score += 3.0;
            else if (product.getLtvRatio() >= 55) score += 2.0;
            else score += 1.0;
        }
        
        // 3. DSR 우대 가능성 (우대 조건 있으면 +1)
        if (product.getDsrPreference()) score += 1.0;
        
        // 4. 비대면 편의성 (모바일 가능시 +1)
        if (product.getMobileAvailable()) score += 1.0;
        
        // 5. 청년/신혼 우대 (해당되면 +1)
        if ("청년".equals(userConditions.getUserCondition()) && product.getYouthPreference()) score += 1.0;
        if ("생애최초".equals(userConditions.getUserCondition()) && product.getYouthPreference()) score += 1.0;
        
        // 6. 금리 유형 다양성 (선택폭 넓으면 +1)
        if (product.getRateTypes() != null && product.getRateTypes().size() >= 3) score += 1.0;
        else if (product.getRateTypes() != null && product.getRateTypes().contains(userConditions.getRatePreference())) score += 1.0;
        
        // 7. 우대금리 폭 (우대금리 0.5% 이상 시 +1)
        if (product.getPreferentialRate() >= 0.5) score += 1.0;
        
        // 8. 서류 간편성 (서류 간편시 +1)
        if (product.getDocumentSimplicity()) score += 1.0;
        
        // 추가 점수: 담보물 유형 매칭 (담보대출인 경우에만)
        if ("담보대출".equals(userConditions.getLoanType()) && 
            product.getCollateralTypes() != null && 
            product.getCollateralTypes().contains(userConditions.getCollateralType())) {
            score += 0.5;
        }
        
        // 추가 점수: 전세자금대출 특화 점수
        if ("전세자금대출".equals(userConditions.getLoanType())) {
            // 전세자금대출은 서류 간편성에 더 높은 가중치
            if (product.getDocumentSimplicity()) score += 1.5;
            // 비대면 편의성에 더 높은 가중치
            if (product.getMobileAvailable()) score += 1.5;
        }
        
        // 추가 점수: 기존 대출 없음 보너스
        if (userConditions.getDebt() == 0) {
            score += 0.5;
        }
        
        return score;
    }
    
    private List<RecommendationResult.LoanProductWithScore> calculateMaxAmounts(List<RecommendationResult.LoanProductWithScore> products, UserConditions userConditions) {
        return products.stream()
            .map(product -> {
                Long maxAmount = calculateMaxLoanAmount(product, userConditions);
                product.setCalculatedMaxAmount(maxAmount);
                return product;
            })
            .collect(Collectors.toList());
    }
    
    private Long calculateMaxLoanAmount(RecommendationResult.LoanProductWithScore product, UserConditions userConditions) {
        String maxAmount = product.getMaxAmount();
        
        // 대출 유형에 따른 계산 방식 분기
        if ("전세자금대출".equals(userConditions.getLoanType())) {
            return calculateLeaseLoanAmount(product, userConditions);
        } else {
            return calculateCollateralLoanAmount(product, userConditions);
        }
    }
    
    /**
     * 담보대출 최대 대출액 계산
     */
    private Long calculateCollateralLoanAmount(RecommendationResult.LoanProductWithScore product, UserConditions userConditions) {
        String maxAmount = product.getMaxAmount();
        
        // 현실성 검증
        if (!validateRealisticRatio(userConditions)) {
            // 현실성 검증 실패 시 대출 한도 축소
            return 0L;
        }
        
        // 상수 정의 (실제 은행 기준)
        final double DSR_RATIO = 0.40; // DSR 40% (실제 은행 담보대출 기준)
        final double DEBT_SERVICE_RATIO = 0.08; // 기존채무 원리금 상환율 (8%)
        final double MAX_LOAN_MULTIPLIER = 8.0; // 최대 대출 한도 = 연소득의 8배
        
        // 1. 담보가치 × LTV 계산 (상품별 LTV 적용)
        double ltvRatio = (product.getLtvRatio() != null ? product.getLtvRatio() : 70) / 100.0;
        // 담보 유형별 LTV 차등 적용
        ltvRatio = applyCollateralTypeLTVAdjustment(ltvRatio, userConditions.getCollateralType());
        // 최대 LTV 제한 (안전성 확보)
        ltvRatio = Math.min(ltvRatio, 0.8);
        
        Long collateralValue = (long) ((userConditions.getCollateralValue() != null ? userConditions.getCollateralValue() : 10000) * 10000);
        Long collateralBasedAmount = (long) (collateralValue * ltvRatio);
        
        // 2. 소득 기준 대출가능액 계산 (실제 은행 방식)
        Long annualIncome = (long) ((userConditions.getIncome() != null ? userConditions.getIncome() : 3000) * 10000);
        
        // 3. 기존채무 원리금 계산 (연간 상환액)
        Long existingDebt = (long) ((userConditions.getDebt() != null ? userConditions.getDebt() : 0) * 10000);
        Long debtServicePayment = (long) (existingDebt * DEBT_SERVICE_RATIO);
        
        // 4. 연간 상환 가능액 = (연소득 × DSR비율) - 기존채무원리금
        Long annualPaymentCapacity = (long) ((annualIncome * DSR_RATIO) - debtServicePayment);
        annualPaymentCapacity = Math.max(0L, annualPaymentCapacity);
        
        // 5. 실제 대출 가능 금액 계산 (이자율과 대출기간 고려)
        Long incomeBasedAmount = calculateMaxLoanFromPayment(
            annualPaymentCapacity, 
            getProductInterestRate(product), 
            getProductLoanPeriod(product)
        );
        
        // 6. 최대 대출 한도 = 연소득의 8배로 제한
        Long basicMaxLoanLimit = annualIncome * (long) MAX_LOAN_MULTIPLIER;
        
        // 7. 신용리스크계수 계산
        double creditRiskFactor = calculateCreditRiskFactor(userConditions.getCreditScore());
        
        // 8. 상품별 최대 대출액 파싱
        Long productMaxAmount = parseProductMaxAmount(maxAmount);
        
        // 9. 최종 대출가능액 계산 (가장 보수적인 값 선택)
        Long minAmount = Math.min(
            Math.min(incomeBasedAmount, collateralBasedAmount),
            Math.min(basicMaxLoanLimit, productMaxAmount != null ? productMaxAmount : Long.MAX_VALUE)
        );
        
        // 신용보정계수 적용 (높은 신용점수일수록 더 높은 대출액)
        Long finalAmount = (long) (minAmount * creditRiskFactor);
        
        // 소득별 차등 대출 한도 적용
        Long incomeBasedMaxLimit = calculateMaxLoanLimitByIncome(annualIncome);
        finalAmount = Math.min(finalAmount, incomeBasedMaxLimit);
        
        return Math.max(0L, finalAmount);
    }
    
    /**
     * 전세자금대출 최대 대출액 계산 (현실성 있게 수정)
     */
    private Long calculateLeaseLoanAmount(RecommendationResult.LoanProductWithScore product, UserConditions userConditions) {
        String maxAmount = product.getMaxAmount();
        
        // 상수 정의 (실제 은행 기준)
        final double DSR_RATIO = 0.35; // 전세자금대출 DSR 35% (실제 은행 기준)
        final double DEBT_SERVICE_RATIO = 0.08; // 기존채무 원리금 상환율 (8%)
        final double LEASE_DEPOSIT_RATIO = 0.70; // 전세보증금 대비 대출 한도 (70%)
        final double MAX_LOAN_MULTIPLIER = 8.0; // 최대 대출 한도 = 연소득의 8배로 증가 (6배에서 8배로)
        
        // 1. 전세보증금 기준 계산 (상품별 보증비율 적용) - 우선순위 1순위
        Long leaseDeposit = (long) ((userConditions.getCollateralValue() != null ? userConditions.getCollateralValue() : 5000) * 10000);
        double guaranteeRatio = getProductGuaranteeRatio(product);
        Long leaseBasedAmount = (long) (leaseDeposit * guaranteeRatio);
        
        // 2. 소득 기준 대출가능액 계산 (실제 은행 방식) - 우선순위 2순위
        Long annualIncome = (long) ((userConditions.getIncome() != null ? userConditions.getIncome() : 3000) * 10000);
        Long existingDebt = (long) ((userConditions.getDebt() != null ? userConditions.getDebt() : 0) * 10000);
        Long debtServicePayment = (long) (existingDebt * DEBT_SERVICE_RATIO);
        
        // 4. 연간 상환 가능액 = (연소득 × DSR비율) - 기존채무원리금
        Long annualPaymentCapacity = (long) ((annualIncome - debtServicePayment) * DSR_RATIO);
        annualPaymentCapacity = Math.max(0L, annualPaymentCapacity);
        
        // 5. 실제 대출 가능 금액 계산 (이자율과 대출기간 고려) - 덜 보수적으로 계산
        Long incomeBasedAmount = calculateMaxLoanFromPayment(
            annualPaymentCapacity, 
            getProductInterestRate(product), 
            getProductLoanPeriod(product)
        );
        
        // 소득 기준 대출액이 너무 낮게 나오는 경우 보정
        if (incomeBasedAmount < leaseBasedAmount * 0.3) { // 보증금 기준의 30% 미만이면
            // 소득 기준 대출액을 보증금 기준의 50%로 보정
            incomeBasedAmount = (long) (leaseBasedAmount * 0.5);
        }
        
        // 6. 최대 대출 한도 = 연소득의 8배로 제한 (6배에서 8배로 증가)
        Long maxLoanLimit = annualIncome * (long) MAX_LOAN_MULTIPLIER;
        
        // 7. 신용리스크계수 계산
        double creditRiskFactor = calculateCreditRiskFactor(userConditions.getCreditScore());
        
        // 8. 상품별 최대 대출액 파싱
        Long productMaxAmount = parseProductMaxAmount(maxAmount);
        
        // 9. 최종 대출가능액 계산 (보증금 기준 우선, 소득 기준은 보조)
        Long finalAmount;
        
        // 전세자금대출은 보증금 기준을 우선시하되, 소득 기준도 고려
        if (leaseBasedAmount <= maxLoanLimit) {
            // 보증금 기준이 소득 한도 내에 있으면 보증금 기준 사용
            finalAmount = leaseBasedAmount;
        } else {
            // 보증금 기준이 소득 한도를 초과하면 소득 한도 사용
            finalAmount = maxLoanLimit;
        }
        
        // 소득 기준 대출액과 비교하여 더 높은 값 선택 (단, 보증금 기준의 80%를 넘지 않도록)
        finalAmount = Math.max(finalAmount, Math.min(incomeBasedAmount, (long)(leaseBasedAmount * 0.8)));
        
        // 상품별 최대 대출액 제한 적용
        if (productMaxAmount != null) {
            finalAmount = Math.min(finalAmount, productMaxAmount);
        }
        
        // 신용보정계수 적용 (높은 신용점수일수록 더 높은 대출액)
        finalAmount = (long) (finalAmount * creditRiskFactor);
        
        // 소득별 차등 대출 한도 적용 (이미 완화됨)
        Long incomeBasedMaxLimit = calculateMaxLoanLimitByIncome(annualIncome);
        finalAmount = Math.min(finalAmount, incomeBasedMaxLimit);
        
        return Math.max(0L, finalAmount);
    }
    
    /**
     * 신용점수에 따른 신용보정계수 계산 (높을수록 더 높은 대출액)
     */
    private double calculateCreditRiskFactor(Integer creditScore) {
        if (creditScore == null) {
            return 0.8; // 기본값 (보통 신용) - 80% 적용
        }
        
        if (creditScore >= 900) {
            return 1.0; // 최우수 신용 - 100% 적용
        } else if (creditScore >= 800) {
            return 0.9; // 우수 신용 - 90% 적용
        } else if (creditScore >= 700) {
            return 0.8; // 보통 신용 - 80% 적용
        } else if (creditScore >= 600) {
            return 0.7; // 낮은 신용 - 70% 적용
        } else if (creditScore >= 550) {
            return 0.6; // 매우 낮은 신용 - 60% 적용
        } else {
            return 0.5; // 최악 신용 - 50% 적용
        }
    }
    
    /**
     * 소득별 차등 대출 한도 계산 (전세자금대출 완화)
     */
    private Long calculateMaxLoanLimitByIncome(Long annualIncome) {
        // 연소득을 만원 단위로 변환
        long incomeInManWon = annualIncome / 10000;
        
        if (incomeInManWon >= 10000) { // 연소득 1억원 이상
            return 2000000000L; // 최대 20억원 (10억원에서 증가)
        } else if (incomeInManWon >= 8000) { // 연소득 8천만원 이상
            return 1500000000L; // 최대 15억원 (8억원에서 증가)
        } else if (incomeInManWon >= 6000) { // 연소득 6천만원 이상
            return 1200000000L; // 최대 12억원 (6억원에서 증가)
        } else if (incomeInManWon >= 4000) { // 연소득 4천만원 이상
            return 1000000000L; // 최대 10억원 (5억원에서 증가)
        } else if (incomeInManWon >= 3000) { // 연소득 3천만원 이상
            return 800000000L; // 최대 8억원 (4억원에서 증가)
        } else if (incomeInManWon >= 2000) { // 연소득 2천만원 이상
            return 600000000L; // 최대 6억원 (3억원에서 증가)
        } else if (incomeInManWon >= 1000) { // 연소득 1천만원 이상
            return 400000000L; // 최대 4억원 (추가)
        } else {
            return 200000000L; // 최대 2억원 (기본값)
        }
    }
    
    /**
     * 상품별 보증비율 추출
     */
    private double getProductGuaranteeRatio(RecommendationResult.LoanProductWithScore product) {
        // 상품 정보에서 보증비율 추출 시도
        if (product.getMaxAmount() != null) {
            String maxAmount = product.getMaxAmount();
            if (maxAmount.contains("80%")) {
                return 0.80;
            } else if (maxAmount.contains("75%")) {
                return 0.75;
            } else if (maxAmount.contains("70%")) {
                return 0.70;
            } else if (maxAmount.contains("65%")) {
                return 0.65;
            }
        }
        return 0.70; // 기본 보증비율 70%
    }
    
    /**
     * 담보 유형별 LTV 조정
     */
    private double applyCollateralTypeLTVAdjustment(double baseLtv, String collateralType) {
        if (collateralType == null) {
            return baseLtv * 0.95; // 기본 95% 적용
        }
        
        switch (collateralType) {
            case "수도권 아파트":
                return baseLtv * 1.0; // 100% 적용 (최우선)
            case "지방 아파트":
                return baseLtv * 0.95; // 95% 적용
            case "단독주택":
                return baseLtv * 0.90; // 90% 적용
            case "빌라/연립":
                return baseLtv * 0.85; // 85% 적용 (가장 보수적)
            default:
                return baseLtv * 0.95; // 기본 95% 적용
        }
    }
    
    /**
     * 상품별 최대 대출액 파싱
     */
    private Long parseProductMaxAmount(String maxAmount) {
        if (maxAmount.contains("담보가액의 최대 70%") || maxAmount.contains("담보가의 70%")) {
            return null; // 담보가액 기준이므로 별도 계산
        } else if (maxAmount.contains("최대 5억원")) {
            return 500000000L;
        } else if (maxAmount.contains("최대")) {
            // "최대 2.8억원" 형태의 문자열에서 숫자와 소수점 추출
            String numberStr = maxAmount.replaceAll("[^0-9.]", "");
            if (!numberStr.isEmpty()) {
                double amount = Double.parseDouble(numberStr);
                return (long) (amount * 100000000); // 억원 단위를 원으로 변환
            }
        }
        return null;
    }
    
    /**
     * 이자율과 대출기간을 고려한 대출 가능액 계산
     */
    private Long calculateMaxLoanFromPayment(Long annualPaymentCapacity, double annualInterestRate, int loanYears) {
        // 기본값 설정
        if (annualInterestRate <= 0) annualInterestRate = 3.0; // 기본 3%
        if (loanYears <= 0) loanYears = 30; // 기본 30년
        
        // 월 이자율
        double monthlyInterestRate = annualInterestRate / 12 / 100;
        int totalMonths = loanYears * 12;
        
        // 월 상환액 (연간 상환 가능액을 월 단위로 변환)
        double monthlyPayment = annualPaymentCapacity / 12.0;
        
        // 원리금균등상환 공식 역산 (월 상환액 → 대출 원금)
        // 공식: 원금 = 월상환액 × (1 - (1 + 월이율)^(-총개월수)) / 월이율
        double principal = monthlyPayment * ((1 - Math.pow(1 + monthlyInterestRate, -totalMonths)) / monthlyInterestRate);
        
        return (long) principal;
    }

    /**
     * 상품별 이자율 추출 (기본값 3%)
     */
    private double getProductInterestRate(LoanProduct product) {
        String interestRateStr = product.getInterestRate();
        if (interestRateStr == null || interestRateStr.isEmpty()) {
            return 3.0; // 기본값
        }
        
        try {
            if (interestRateStr.contains("~")) {
                // 변동금리: "3.1% ~ 4.5%" 형태에서 평균값 사용
                String[] rateRange = interestRateStr.split("~");
                String minRateStr = rateRange[0].replace("%", "").trim();
                String maxRateStr = rateRange[1].replace("%", "").trim();
                
                double minRate = Double.parseDouble(minRateStr);
                double maxRate = Double.parseDouble(maxRateStr);
                return (minRate + maxRate) / 2.0;
            } else {
                // 고정금리: "2.66%" 형태
                String rateStr = interestRateStr.replace("%", "").trim();
                return Double.parseDouble(rateStr);
            }
        } catch (Exception e) {
            return 3.0; // 파싱 실패 시 기본값
        }
    }

    /**
     * 상품별 대출기간 추출 (기본값 30년)
     */
    private int getProductLoanPeriod(LoanProduct product) {
        String loanPeriodStr = product.getLoanPeriod();
        if (loanPeriodStr == null || loanPeriodStr.isEmpty()) {
            return 30; // 기본값
        }
        
        try {
            // "30년", "20년" 등에서 숫자만 추출
            String numberStr = loanPeriodStr.replaceAll("[^0-9]", "");
            if (!numberStr.isEmpty()) {
                return Integer.parseInt(numberStr);
            }
        } catch (Exception e) {
            // 파싱 실패 시 기본값
        }
        
        return 30; // 기본값
    }

    private RecommendationResult.PurchaseInfo calculatePurchaseInfo(List<RecommendationResult.LoanProductWithScore> products, UserConditions userConditions) {
        if (products.isEmpty()) {
            return null;
        }
        
        // 가장 높은 대출액을 가진 상품 찾기
        RecommendationResult.LoanProductWithScore maxLoanProduct = products.stream()
            .filter(p -> p.getCalculatedMaxAmount() != null)
            .max((a, b) -> Long.compare(a.getCalculatedMaxAmount(), b.getCalculatedMaxAmount()))
            .orElse(null);
        
        if (maxLoanProduct == null || maxLoanProduct.getCalculatedMaxAmount() == null) {
            return null;
        }
        
        // 최대 대출액을 현실적으로 제한
        Long maxLoanAmount = maxLoanProduct.getCalculatedMaxAmount();
        
        // 사용자가 입력한 현금성 자산 값 (만원 단위 그대로 저장)
        Long userAssets = userConditions.getAssets() != null ? userConditions.getAssets() : 100L;
        
        // 연간상환가능액 계산 (소득 기준)
        Long annualIncome = (long) ((userConditions.getIncome() != null ? userConditions.getIncome() : 3000) * 10000);
        Long existingDebt = (long) ((userConditions.getDebt() != null ? userConditions.getDebt() : 0) * 10000);
        Long debtServicePayment = (long) (existingDebt * 0.08); // 기존채무 원리금 상환율 8%
        
        // 대출 유형에 따른 DSR 비율 적용
        double dsrRatio = "전세자금대출".equals(userConditions.getLoanType()) ? 0.35 : 0.40;
        Long annualPaymentCapacity = (long) ((annualIncome - debtServicePayment) * dsrRatio);
        annualPaymentCapacity = Math.max(0L, annualPaymentCapacity);
        
        // 최대 구매 가능 금액 = 이자를 고려한 대출 가능액 + 현금성 자산
        int maxLoanYears = Math.max(1, 60 - userConditions.getAge());
        
        // 가장 높은 대출액을 가진 상품의 이자율과 대출기간 사용
        double interestRate = getProductInterestRate(maxLoanProduct);
        int loanPeriod = Math.min(maxLoanYears, getProductLoanPeriod(maxLoanProduct));
        
        // 최대 구매 가능 금액 = 최종 대출 가능액 + 현금성 자산 (원 단위로 변환)
        Long maxPurchaseAmount = maxLoanAmount + (userAssets * 10000L);
        
        return new RecommendationResult.PurchaseInfo(maxLoanAmount, userAssets, maxPurchaseAmount, maxLoanProduct);
    }

    /**
     * 현실적인 대출 비율 검증
     */
    private boolean validateRealisticRatio(UserConditions userConditions) {
        // 기본적인 null 체크만 수행
        if (userConditions.getLoanType() == null || userConditions.getLoanType().isEmpty()) {
            return false;
        }

        if (userConditions.getIncome() == null || userConditions.getIncome() <= 0) {
            return false;
        }

        if (userConditions.getCollateralValue() == null || userConditions.getCollateralValue() <= 0) {
            return false;
        }

        // 복잡한 비율 검증 제거 - 기본값만 확인
        return true;
    }

    /**
     * 비대면 대출 비율 검증
     */
    private boolean validateDownPaymentRatio(UserConditions userConditions) {
        // 기본적인 null 체크만 수행
        if (userConditions.getLoanType() == null || userConditions.getLoanType().isEmpty()) {
            return false;
        }

        if (userConditions.getIncome() == null || userConditions.getIncome() <= 0) {
            return false;
        }

        if (userConditions.getCollateralValue() == null || userConditions.getCollateralValue() <= 0) {
            return false;
        }

        // 복잡한 비율 검증 제거 - 기본값만 확인
        return true;
    }
} 