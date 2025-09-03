package com.back.repository;

import com.back.domain.RowHouseSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RowHouseSaleRepository extends JpaRepository<RowHouseSale, Long> {
    
    // 시군구로 검색
    List<RowHouseSale> findBySigunguContaining(String sigungu);
    
    // 도로명으로 검색 (정확한 일치)
    List<RowHouseSale> findByRoadName(String roadName);
    
    // 건물명으로 검색
    List<RowHouseSale> findByBuildingNameContaining(String buildingName);
    
    // 주택유형으로 검색
    List<RowHouseSale> findByHousingType(String housingType);
    
    // 전용면적 범위로 검색
    List<RowHouseSale> findByExclusiveAreaBetween(Double minExclusiveArea, Double maxExclusiveArea);
    
    // 대지권면적 범위로 검색
    List<RowHouseSale> findByLandAreaBetween(Double minLandArea, Double maxLandArea);
    
    // 거래금액 범위로 검색
    List<RowHouseSale> findByTransactionAmountBetween(Long minAmount, Long maxAmount);
    
    // 층 범위로 검색
    List<RowHouseSale> findByFloorBetween(Integer minFloor, Integer maxFloor);
    
    // 건축년도 범위로 검색
    List<RowHouseSale> findByConstructionYearBetween(Integer minYear, Integer maxYear);
    
    // 복합 검색
    @Query("SELECT r FROM RowHouseSale r WHERE " +
           "(:sigungu IS NULL OR r.sigungu LIKE %:sigungu%) AND " +
           "(:buildingName IS NULL OR r.buildingName LIKE %:buildingName%) AND " +
           "(:housingType IS NULL OR r.housingType = :housingType) AND " +
           "(:minExclusiveArea IS NULL OR r.exclusiveArea >= :minExclusiveArea) AND " +
           "(:maxExclusiveArea IS NULL OR r.exclusiveArea <= :maxExclusiveArea) AND " +
           "(:minLandArea IS NULL OR r.landArea >= :minLandArea) AND " +
           "(:maxLandArea IS NULL OR r.landArea <= :maxLandArea) AND " +
           "(:minTransactionAmount IS NULL OR r.transactionAmount >= :minTransactionAmount) AND " +
           "(:maxTransactionAmount IS NULL OR r.transactionAmount <= :maxTransactionAmount) AND " +
           "(:minFloor IS NULL OR r.floor >= :minFloor) AND " +
           "(:maxFloor IS NULL OR r.floor <= :maxFloor) AND " +
           "(:minYear IS NULL OR r.constructionYear >= :minYear) AND " +
           "(:maxYear IS NULL OR r.constructionYear <= :maxYear)")
    List<RowHouseSale> searchByCriteria(
            @Param("sigungu") String sigungu,
            @Param("buildingName") String buildingName,
            @Param("housingType") String housingType,
            @Param("minExclusiveArea") Double minExclusiveArea,
            @Param("maxExclusiveArea") Double maxExclusiveArea,
            @Param("minLandArea") Double minLandArea,
            @Param("maxLandArea") Double maxLandArea,
            @Param("minTransactionAmount") Long minTransactionAmount,
            @Param("maxTransactionAmount") Long maxTransactionAmount,
            @Param("minFloor") Integer minFloor,
            @Param("maxFloor") Integer maxFloor,
            @Param("minYear") Integer minYear,
            @Param("maxYear") Integer maxYear
    );
    
    // 번호 역순으로 정렬된 모든 데이터 조회 (최신순)
    List<RowHouseSale> findAllByOrderByNoDesc();
} 