package com.back.repository;

import com.back.domain.RowHouseRent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RowHouseRentRepository extends JpaRepository<RowHouseRent, Long> {
    
    // 시군구로 검색
    List<RowHouseRent> findBySigunguContaining(String sigungu);
    
    // 도로명으로 검색 (정확한 일치)
    List<RowHouseRent> findByRoadName(String roadName);
    
    // 건물명으로 검색
    List<RowHouseRent> findByBuildingNameContaining(String buildingName);
    
    // 주택유형으로 검색
    List<RowHouseRent> findByHousingType(String housingType);
    
    // 전월세구분으로 검색
    List<RowHouseRent> findByRentType(String rentType);
    
    // 전용면적 범위로 검색
    List<RowHouseRent> findByExclusiveAreaBetween(Double minExclusiveArea, Double maxExclusiveArea);
    
    // 보증금 범위로 검색
    List<RowHouseRent> findByDepositBetween(Long minDeposit, Long maxDeposit);
    
    // 월세 범위로 검색
    List<RowHouseRent> findByMonthlyRentBetween(Long minMonthlyRent, Long maxMonthlyRent);
    
    // 층 범위로 검색
    List<RowHouseRent> findByFloorBetween(Integer minFloor, Integer maxFloor);
    
    // 건축년도 범위로 검색
    List<RowHouseRent> findByConstructionYearBetween(Integer minYear, Integer maxYear);
    
    // 복합 검색
    @Query("SELECT r FROM RowHouseRent r WHERE " +
           "(:sigungu IS NULL OR r.sigungu LIKE %:sigungu%) AND " +
           "(:buildingName IS NULL OR r.buildingName LIKE %:buildingName%) AND " +
           "(:housingType IS NULL OR r.housingType = :housingType) AND " +
           "(:rentType IS NULL OR r.rentType = :rentType) AND " +
           "(:minExclusiveArea IS NULL OR r.exclusiveArea >= :minExclusiveArea) AND " +
           "(:maxExclusiveArea IS NULL OR r.exclusiveArea <= :maxExclusiveArea) AND " +
           "(:minDeposit IS NULL OR r.deposit >= :minDeposit) AND " +
           "(:maxDeposit IS NULL OR r.deposit <= :maxDeposit) AND " +
           "(:minMonthlyRent IS NULL OR r.monthlyRent >= :minMonthlyRent) AND " +
           "(:maxMonthlyRent IS NULL OR r.monthlyRent <= :maxMonthlyRent) AND " +
           "(:minFloor IS NULL OR r.floor >= :minFloor) AND " +
           "(:maxFloor IS NULL OR r.floor <= :maxFloor) AND " +
           "(:minYear IS NULL OR r.constructionYear >= :minYear) AND " +
           "(:maxYear IS NULL OR r.constructionYear <= :maxYear)")
    List<RowHouseRent> searchByCriteria(
            @Param("sigungu") String sigungu,
            @Param("buildingName") String buildingName,
            @Param("housingType") String housingType,
            @Param("rentType") String rentType,
            @Param("minExclusiveArea") Double minExclusiveArea,
            @Param("maxExclusiveArea") Double maxExclusiveArea,
            @Param("minDeposit") Long minDeposit,
            @Param("maxDeposit") Long maxDeposit,
            @Param("minMonthlyRent") Long minMonthlyRent,
            @Param("maxMonthlyRent") Long maxMonthlyRent,
            @Param("minFloor") Integer minFloor,
            @Param("maxFloor") Integer maxFloor,
            @Param("minYear") Integer minYear,
            @Param("maxYear") Integer maxYear
    );
    
    // 번호 역순으로 정렬된 모든 데이터 조회 (최신순)
    List<RowHouseRent> findAllByOrderByNoDesc();
} 