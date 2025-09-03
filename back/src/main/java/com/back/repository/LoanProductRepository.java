package com.back.repository;

import com.back.domain.LoanProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanProductRepository extends JpaRepository<LoanProduct, String> {
    
    // 은행별 검색
    List<LoanProduct> findByBank(String bank);
    
    // 대출 타입별 검색
    List<LoanProduct> findByLoanType(String loanType);
    
    // 청년 우대 상품 검색
    List<LoanProduct> findByYouthPreferenceTrue();
    
    // 모바일 신청 가능 상품 검색
    List<LoanProduct> findByMobileAvailableTrue();
    
    // 복합 검색 (은행 + 대출타입)
    List<LoanProduct> findByBankAndLoanType(String bank, String loanType);
    
    // 금리 범위로 검색 (예: 최저 금리 기준)
    @Query("SELECT lp FROM LoanProduct lp WHERE CAST(SUBSTRING(lp.interestRate, 1, LOCATE('~', lp.interestRate) - 1) AS double) <= :maxRate")
    List<LoanProduct> findByMaxInterestRate(@Param("maxRate") double maxRate);
    
    // LTV 비율로 검색
    List<LoanProduct> findByLtvRatioGreaterThanEqual(Integer ltvRatio);
} 