package com.back.repository;

import com.back.domain.OfficeTelRent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfficeTelRentRepository extends JpaRepository<OfficeTelRent, Long> {
    
    // 시군구로 검색
    List<OfficeTelRent> findBySigunguContaining(String sigungu);
    
    // 단지명으로 검색
    List<OfficeTelRent> findByComplexNameContaining(String complexName);
    
    // 전월세구분으로 검색
    List<OfficeTelRent> findByRentType(String rentType);
    
    // 전용면적 범위로 검색
    List<OfficeTelRent> findByExclusiveAreaBetween(Double minArea, Double maxArea);
    
    // 보증금 범위로 검색
    List<OfficeTelRent> findByDepositBetween(Long minDeposit, Long maxDeposit);
    
    // 월세 범위로 검색
    List<OfficeTelRent> findByMonthlyRentBetween(Long minMonthlyRent, Long maxMonthlyRent);
    
    // 층 범위로 검색
    List<OfficeTelRent> findByFloorBetween(Integer minFloor, Integer maxFloor);
    
    // 건축년도 범위로 검색
    List<OfficeTelRent> findByConstructionYearBetween(Integer minYear, Integer maxYear);
    
    // 복합 검색
    @Query("SELECT o FROM OfficeTelRent o WHERE " +
           "(:sigungu IS NULL OR o.sigungu LIKE %:sigungu%) AND " +
           "(:complexName IS NULL OR o.complexName LIKE %:complexName%) AND " +
           "(:rentType IS NULL OR o.rentType = :rentType) AND " +
           "(:minArea IS NULL OR o.exclusiveArea >= :minArea) AND " +
           "(:maxArea IS NULL OR o.exclusiveArea <= :maxArea) AND " +
           "(:minDeposit IS NULL OR o.deposit >= :minDeposit) AND " +
           "(:maxDeposit IS NULL OR o.deposit <= :maxDeposit) AND " +
           "(:minMonthlyRent IS NULL OR o.monthlyRent >= :minMonthlyRent) AND " +
           "(:maxMonthlyRent IS NULL OR o.monthlyRent <= :maxMonthlyRent) AND " +
           "(:minFloor IS NULL OR o.floor >= :minFloor) AND " +
           "(:maxFloor IS NULL OR o.floor <= :maxFloor) AND " +
           "(:minYear IS NULL OR o.constructionYear >= :minYear) AND " +
           "(:maxYear IS NULL OR o.constructionYear <= :maxYear)")
    List<OfficeTelRent> searchByCriteria(
            @Param("sigungu") String sigungu,
            @Param("complexName") String complexName,
            @Param("rentType") String rentType,
            @Param("minArea") Double minArea,
            @Param("maxArea") Double maxArea,
            @Param("minDeposit") Long minDeposit,
            @Param("maxDeposit") Long maxDeposit,
            @Param("minMonthlyRent") Long minMonthlyRent,
            @Param("maxMonthlyRent") Long maxMonthlyRent,
            @Param("minFloor") Integer minFloor,
            @Param("maxFloor") Integer maxFloor,
            @Param("minYear") Integer minYear,
            @Param("maxYear") Integer maxYear
    );
    
    // 도로명 주소로 검색 (정확한 일치)
    List<OfficeTelRent> findByRoadName(String roadName);
    
    // 도로명 주소와 면적 범위로 검색
    List<OfficeTelRent> findByRoadNameContainingAndExclusiveAreaBetween(
        String roadName, Double minArea, Double maxArea    );
    
    // 번호 역순으로 정렬된 모든 데이터 조회 (최신순)
    List<OfficeTelRent> findAllByOrderByNoDesc();
} 