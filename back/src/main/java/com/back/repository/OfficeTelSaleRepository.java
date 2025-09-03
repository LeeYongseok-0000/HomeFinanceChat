package com.back.repository;

import com.back.domain.OfficeTelSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfficeTelSaleRepository extends JpaRepository<OfficeTelSale, Long> {
    
    // 시군구로 검색
    List<OfficeTelSale> findBySigunguContaining(String sigungu);
    
    // 단지명으로 검색
    List<OfficeTelSale> findByComplexNameContaining(String complexName);
    
    // 전용면적 범위로 검색
    List<OfficeTelSale> findByExclusiveAreaBetween(Double minArea, Double maxArea);
    
    // 층 범위로 검색
    List<OfficeTelSale> findByFloorBetween(Integer minFloor, Integer maxFloor);
    
    // 건축년도 범위로 검색
    List<OfficeTelSale> findByConstructionYearBetween(Integer minYear, Integer maxYear);
    
    // 거래금액 범위로 검색
    List<OfficeTelSale> findByTransactionAmountBetween(Long minAmount, Long maxAmount);
    
    // 복합 검색
    @Query("SELECT o FROM OfficeTelSale o WHERE " +
           "(:sigungu IS NULL OR o.sigungu LIKE %:sigungu%) AND " +
           "(:complexName IS NULL OR o.complexName LIKE %:complexName%) AND " +
           "(:minArea IS NULL OR o.exclusiveArea >= :minArea) AND " +
           "(:maxArea IS NULL OR o.exclusiveArea <= :maxArea) AND " +
           "(:minAmount IS NULL OR o.transactionAmount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR o.transactionAmount <= :maxAmount) AND " +
           "(:minFloor IS NULL OR o.floor >= :minFloor) AND " +
           "(:maxFloor IS NULL OR o.floor <= :maxFloor) AND " +
           "(:minYear IS NULL OR o.constructionYear >= :minYear) AND " +
           "(:maxYear IS NULL OR o.constructionYear <= :maxYear)")
    List<OfficeTelSale> searchByCriteria(
            @Param("sigungu") String sigungu,
            @Param("complexName") String complexName,
            @Param("minArea") Double minArea,
            @Param("maxArea") Double maxArea,
            @Param("minAmount") Long minAmount,
            @Param("maxAmount") Long maxAmount,
            @Param("minFloor") Integer minFloor,
            @Param("maxFloor") Integer maxFloor,
            @Param("minYear") Integer minYear,
            @Param("maxYear") Integer maxYear
    );
    
    // 도로명 주소로 검색 (정확한 일치)
    List<OfficeTelSale> findByRoadName(String roadName);
    
    // 도로명 주소와 면적 범위로 검색 (더 정확한 매칭)
    List<OfficeTelSale> findByRoadNameContainingAndExclusiveAreaBetween(
        String roadName, Double minArea, Double maxArea    );
    
    // 번호 역순으로 정렬된 모든 데이터 조회 (최신순)
    List<OfficeTelSale> findAllByOrderByNoDesc();
} 