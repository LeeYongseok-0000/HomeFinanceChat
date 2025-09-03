package com.back.repository;

import com.back.domain.DetachedHouseRent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetachedHouseRentRepository extends JpaRepository<DetachedHouseRent, Long> {
    
    // 시군구로 검색
    List<DetachedHouseRent> findBySigunguContaining(String sigungu);
    
    // 도로명으로 검색 (정확한 일치)
    List<DetachedHouseRent> findByRoadName(String roadName);
    
    // 주택유형으로 검색
    List<DetachedHouseRent> findByHousingType(String housingType);
    
    // 도로조건으로 검색
    List<DetachedHouseRent> findByRoadCondition(String roadCondition);
    
    // 전월세구분으로 검색
    List<DetachedHouseRent> findByRentType(String rentType);
    
    // 계약면적 범위로 검색
    List<DetachedHouseRent> findByContractAreaBetween(Double minContractArea, Double maxContractArea);
    
    // 보증금 범위로 검색
    List<DetachedHouseRent> findByDepositBetween(Long minDeposit, Long maxDeposit);
    
    // 월세 범위로 검색
    List<DetachedHouseRent> findByMonthlyRentBetween(Long minMonthlyRent, Long maxMonthlyRent);
    
    // 건축년도 범위로 검색
    List<DetachedHouseRent> findByConstructionYearBetween(Integer minYear, Integer maxYear);
    
    // 복합 검색
    @Query("SELECT d FROM DetachedHouseRent d WHERE " +
           "(:sigungu IS NULL OR d.sigungu LIKE %:sigungu%) AND " +
           "(:housingType IS NULL OR d.housingType = :housingType) AND " +
           "(:roadCondition IS NULL OR d.roadCondition = :roadCondition) AND " +
           "(:rentType IS NULL OR d.rentType = :rentType) AND " +
           "(:minContractArea IS NULL OR d.contractArea >= :minContractArea) AND " +
           "(:maxContractArea IS NULL OR d.contractArea <= :maxContractArea) AND " +
           "(:minDeposit IS NULL OR d.deposit >= :minDeposit) AND " +
           "(:maxDeposit IS NULL OR d.deposit <= :maxDeposit) AND " +
           "(:minMonthlyRent IS NULL OR d.monthlyRent >= :minMonthlyRent) AND " +
           "(:maxMonthlyRent IS NULL OR d.monthlyRent <= :maxMonthlyRent) AND " +
           "(:minYear IS NULL OR d.constructionYear >= :minYear) AND " +
           "(:maxYear IS NULL OR d.constructionYear <= :maxYear)")
    List<DetachedHouseRent> searchByCriteria(
            @Param("sigungu") String sigungu,
            @Param("housingType") String housingType,
            @Param("roadCondition") String roadCondition,
            @Param("rentType") String rentType,
            @Param("minContractArea") Double minContractArea,
            @Param("maxContractArea") Double maxContractArea,
            @Param("minDeposit") Long minDeposit,
            @Param("maxDeposit") Long maxDeposit,
            @Param("minMonthlyRent") Long minMonthlyRent,
            @Param("maxMonthlyRent") Long maxMonthlyRent,
            @Param("minYear") Integer minYear,
            @Param("maxYear") Integer maxYear
    );
    
    // 번호 역순으로 정렬된 모든 데이터 조회 (최신순)
    List<DetachedHouseRent> findAllByOrderByNoDesc();
} 