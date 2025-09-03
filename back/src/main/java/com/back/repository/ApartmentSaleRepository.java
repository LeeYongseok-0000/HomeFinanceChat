package com.back.repository;

import com.back.domain.ApartmentSale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ApartmentSaleRepository extends JpaRepository<ApartmentSale, Long> {
    
    // 시군구별 조회
    Page<ApartmentSale> findBySigunguContaining(String sigungu, Pageable pageable);
    
    // 단지명별 조회
    Page<ApartmentSale> findByComplexNameContaining(String complexName, Pageable pageable);
    
    // 주택유형별 조회
    Page<ApartmentSale> findByHousingType(String housingType, Pageable pageable);
    
    // 건축년도 범위별 조회
    Page<ApartmentSale> findByConstructionYearBetween(Integer startYear, Integer endYear, Pageable pageable);
    
    // 전용면적 범위별 조회
    Page<ApartmentSale> findByExclusiveAreaBetween(Double minArea, Double maxArea, Pageable pageable);
    
    // 거래금액 범위별 조회
    Page<ApartmentSale> findByTransactionAmountBetween(Long minAmount, Long maxAmount, Pageable pageable);
    
    // 계약일 범위별 조회
    Page<ApartmentSale> findByContractDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    // 복합 검색
    @Query("SELECT a FROM ApartmentSale a WHERE " +
           "(:sigungu IS NULL OR a.sigungu LIKE %:sigungu%) AND " +
           "(:complexName IS NULL OR a.complexName LIKE %:complexName%) AND " +
           "(:housingType IS NULL OR a.housingType = :housingType) AND " +
           "(:transactionType IS NULL OR a.transactionType = :transactionType) AND " +
           "(:minArea IS NULL OR a.exclusiveArea >= :minArea) AND " +
           "(:maxArea IS NULL OR a.exclusiveArea <= :maxArea) AND " +
           "(:minAmount IS NULL OR a.transactionAmount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR a.transactionAmount <= :maxAmount) AND " +
           "(:minYear IS NULL OR a.constructionYear >= :minYear) AND " +
           "(:maxYear IS NULL OR a.constructionYear <= :maxYear)")
    Page<ApartmentSale> findBySearchCriteria(
            @Param("sigungu") String sigungu,
            @Param("complexName") String complexName,
            @Param("housingType") String housingType,
            @Param("transactionType") String transactionType,
            @Param("minArea") Double minArea,
            @Param("maxArea") Double maxArea,
            @Param("minAmount") Long minAmount,
            @Param("maxAmount") Long maxAmount,
            @Param("minYear") Integer minYear,
            @Param("maxYear") Integer maxYear,
            Pageable pageable
    );
    
    // 시군구 목록 조회 (중복 제거)
    @Query("SELECT DISTINCT a.sigungu FROM ApartmentSale a ORDER BY a.sigungu")
    List<String> findDistinctSigungu();
    
    // 주택유형 목록 조회 (중복 제거)
    @Query("SELECT DISTINCT a.housingType FROM ApartmentSale a ORDER BY a.housingType")
    List<String> findDistinctHousingType();
    
    // 거래구분 목록 조회 (중복 제거)
    @Query("SELECT DISTINCT a.transactionType FROM ApartmentSale a ORDER BY a.transactionType")
    List<String> findDistinctTransactionType();
    
    // 최근 거래 데이터 조회 (지도용)
    @Query("SELECT a FROM ApartmentSale a ORDER BY a.contractDate DESC")
    List<ApartmentSale> findTopByOrderByContractDateDesc(@Param("limit") int limit);
    
    // 필터링된 데이터 조회 (지도용)
    @Query("SELECT a FROM ApartmentSale a WHERE " +
           "(:transactionType IS NULL OR a.transactionType = :transactionType) AND " +
           "(:minPrice IS NULL OR a.transactionAmount >= :minPrice) AND " +
           "(:maxPrice IS NULL OR a.transactionAmount <= :maxPrice) AND " +
           "(:minArea IS NULL OR a.exclusiveArea >= :minArea) AND " +
           "(:maxArea IS NULL OR a.exclusiveArea <= :maxArea) " +
           "ORDER BY a.contractDate DESC")
    List<ApartmentSale> findByFilters(
            @Param("transactionType") String transactionType,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("minArea") Double minArea,
            @Param("maxArea") Double maxArea
    );
    
    // 도로명으로 검색 (정확한 일치)
    List<ApartmentSale> findByRoadName(String roadName);
    
    // 번호 역순으로 정렬된 모든 데이터 조회 (최신순)
    List<ApartmentSale> findAllByOrderByNoDesc();
}
