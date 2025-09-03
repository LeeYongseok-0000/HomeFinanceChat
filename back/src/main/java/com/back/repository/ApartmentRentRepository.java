package com.back.repository;

import com.back.domain.ApartmentRent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApartmentRentRepository extends JpaRepository<ApartmentRent, Long> {
    
    // 시군구로 검색
    List<ApartmentRent> findBySigunguContaining(String sigungu);
    
    // 단지명으로 검색
    List<ApartmentRent> findByComplexNameContaining(String complexName);
    
    // 구분(전세/월세)으로 검색
    List<ApartmentRent> findByRentType(String rentType);
    
    // 전용면적 범위로 검색
    List<ApartmentRent> findByExclusiveAreaBetween(Double minArea, Double maxArea);
    
    // 층 범위로 검색
    List<ApartmentRent> findByFloorBetween(Integer minFloor, Integer maxFloor);
    
    // 건축년도 범위로 검색
    List<ApartmentRent> findByConstructionYearBetween(Integer minYear, Integer maxYear);
    
    // 보증금 범위로 검색
    List<ApartmentRent> findByDepositBetween(Long minDeposit, Long maxDeposit);
    
    // 월세 범위로 검색
    List<ApartmentRent> findByMonthlyRentBetween(Long minRent, Long maxRent);
    
    // 복합 검색을 위한 커스텀 쿼리
    @Query("SELECT a FROM ApartmentRent a WHERE " +
           "(:sigungu IS NULL OR a.sigungu LIKE %:sigungu%) AND " +
           "(:complexName IS NULL OR a.complexName LIKE %:complexName%) AND " +
           "(:rentType IS NULL OR a.rentType = :rentType) AND " +
           "(:minArea IS NULL OR a.exclusiveArea >= :minArea) AND " +
           "(:maxArea IS NULL OR a.exclusiveArea <= :maxArea) AND " +
           "(:minFloor IS NULL OR a.floor >= :minFloor) AND " +
           "(:maxFloor IS NULL OR a.floor <= :maxFloor) AND " +
           "(:minConstructionYear IS NULL OR a.constructionYear >= :minConstructionYear) AND " +
           "(:maxConstructionYear IS NULL OR a.constructionYear <= :maxConstructionYear) AND " +
           "(:minDeposit IS NULL OR a.deposit >= :minDeposit) AND " +
           "(:maxDeposit IS NULL OR a.deposit <= :maxDeposit) AND " +
           "(:minMonthlyRent IS NULL OR a.monthlyRent >= :minMonthlyRent) AND " +
           "(:maxMonthlyRent IS NULL OR a.monthlyRent <= :maxMonthlyRent)")
    List<ApartmentRent> searchApartments(@Param("sigungu") String sigungu,
                                        @Param("complexName") String complexName,
                                        @Param("rentType") String rentType,
                                        @Param("minArea") Double minArea,
                                        @Param("maxArea") Double maxArea,
                                        @Param("minFloor") Integer minFloor,
                                        @Param("maxFloor") Integer maxFloor,
                                        @Param("minConstructionYear") Integer minConstructionYear,
                                        @Param("maxConstructionYear") Integer maxConstructionYear,
                                        @Param("minDeposit") Long minDeposit,
                                        @Param("maxDeposit") Long maxDeposit,
                                        @Param("minMonthlyRent") Long minMonthlyRent,
                                        @Param("maxMonthlyRent") Long maxMonthlyRent);
    
    // 도로명으로 검색 (정확한 일치)
    List<ApartmentRent> findByRoadName(String roadName);
    
    // 번호 역순으로 정렬된 모든 데이터 조회 (최신순)
    List<ApartmentRent> findAllByOrderByNoDesc();
}
