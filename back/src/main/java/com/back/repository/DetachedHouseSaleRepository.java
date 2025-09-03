package com.back.repository;

import com.back.domain.DetachedHouseSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetachedHouseSaleRepository extends JpaRepository<DetachedHouseSale, Long> {
    
    // 시군구로 검색
    List<DetachedHouseSale> findBySigunguContaining(String sigungu);
    
    // 도로명으로 검색 (정확한 일치)
    List<DetachedHouseSale> findByRoadName(String roadName);
    
    // 주택유형으로 검색
    List<DetachedHouseSale> findByHousingType(String housingType);
    
    // 도로조건으로 검색
    List<DetachedHouseSale> findByRoadCondition(String roadCondition);
    
    // 연면적 범위로 검색
    List<DetachedHouseSale> findByTotalAreaBetween(Double minTotalArea, Double maxTotalArea);
    
    // 대지면적 범위로 검색
    List<DetachedHouseSale> findByLandAreaBetween(Double minLandArea, Double maxLandArea);
    
    // 거래금액 범위로 검색
    List<DetachedHouseSale> findByTransactionAmountBetween(Long minAmount, Long maxAmount);
    
    // 건축년도 범위로 검색
    List<DetachedHouseSale> findByConstructionYearBetween(Integer minYear, Integer maxYear);
    
    // 복합 검색
    @Query("SELECT d FROM DetachedHouseSale d WHERE " +
           "(:sigungu IS NULL OR d.sigungu LIKE %:sigungu%) AND " +
           "(:housingType IS NULL OR d.housingType = :housingType) AND " +
           "(:roadCondition IS NULL OR d.roadCondition = :roadCondition) AND " +
           "(:minTotalArea IS NULL OR d.totalArea >= :minTotalArea) AND " +
           "(:maxTotalArea IS NULL OR d.totalArea <= :maxTotalArea) AND " +
           "(:minLandArea IS NULL OR d.landArea >= :minLandArea) AND " +
           "(:maxLandArea IS NULL OR d.landArea <= :maxLandArea) AND " +
           "(:minTransactionAmount IS NULL OR d.transactionAmount >= :minTransactionAmount) AND " +
           "(:maxTransactionAmount IS NULL OR d.transactionAmount <= :maxTransactionAmount) AND " +
           "(:minYear IS NULL OR d.constructionYear >= :minYear) AND " +
           "(:maxYear IS NULL OR d.constructionYear <= :maxYear)")
    List<DetachedHouseSale> searchByCriteria(
            @Param("sigungu") String sigungu,
            @Param("housingType") String housingType,
            @Param("roadCondition") String roadCondition,
            @Param("minTotalArea") Double minTotalArea,
            @Param("maxTotalArea") Double maxTotalArea,
            @Param("minLandArea") Double minLandArea,
            @Param("maxLandArea") Double maxLandArea,
            @Param("minTransactionAmount") Long minTransactionAmount,
            @Param("maxTransactionAmount") Long maxTransactionAmount,
            @Param("minYear") Integer minYear,
            @Param("maxYear") Integer maxYear
    );
    
    // 번호 역순으로 정렬된 모든 데이터 조회 (최신순)
    List<DetachedHouseSale> findAllByOrderByNoDesc();
} 