package com.back.service;

import com.back.domain.ApartmentSale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import com.back.dto.ApartmentSaleDTO;

public interface ApartmentSaleService {
    
    // 아파트 매매 데이터 생성
    ApartmentSaleDTO createApartmentSale(ApartmentSaleDTO apartmentSaleDTO);
    
    // 전체 조회 (페이지네이션)
    Page<ApartmentSale> findAll(Pageable pageable);
    
    // ID로 조회
    ApartmentSale findById(Long id);
    
    // 복합 검색
    Page<ApartmentSale> searchByCriteria(
            String sigungu,
            String complexName,
            String housingType,
            String transactionType,
            Double minArea,
            Double maxArea,
            Long minAmount,
            Long maxAmount,
            Integer minYear,
            Integer maxYear,
            Pageable pageable
    );
    
    // 시군구별 조회
    Page<ApartmentSale> findBySigungu(String sigungu, Pageable pageable);
    
    // 단지명별 조회
    Page<ApartmentSale> findByComplexName(String complexName, Pageable pageable);
    
    // 주택유형별 조회
    Page<ApartmentSale> findByHousingType(String housingType, Pageable pageable);
    
    // 건축년도 범위별 조회
    Page<ApartmentSale> findByConstructionYearRange(Integer startYear, Integer endYear, Pageable pageable);
    
    // 전용면적 범위별 조회
    Page<ApartmentSale> findByAreaRange(Double minArea, Double maxArea, Pageable pageable);
    
    // 거래금액 범위별 조회
    Page<ApartmentSale> findByAmountRange(Long minAmount, Long maxAmount, Pageable pageable);
    
    // 계약일 범위별 조회
    Page<ApartmentSale> findByContractDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    // 시군구 목록 조회
    List<String> getDistinctSigungu();
    
    // 주택유형 목록 조회
    List<String> getDistinctHousingType();
    
    // 거래구분 목록 조회
    List<String> getDistinctTransactionType();
    
    // 데이터 저장
    ApartmentSale save(ApartmentSale apartmentSale);
    
    // 데이터 수정
    ApartmentSale update(Long id, ApartmentSale apartmentSale);
    
    // 데이터 삭제
    void deleteById(Long id);
    
    // 전체 데이터 개수 조회
    long count();
    
    // 번호 역순으로 정렬된 데이터 조회 (최신순)
    Page<ApartmentSale> findAllOrderByNoDesc(Pageable pageable);
    
    // 지도용 데이터 조회 (간단한 정보만)
    List<Map<String, Object>> getMapData(int limit);
    
    // 필터링된 지도용 데이터 조회
    List<Map<String, Object>> getFilteredMapData(
        String transactionType, 
        Double minPrice, 
        Double maxPrice, 
        Double minArea, 
        Double maxArea
    );
    
    // 페이징 처리가 포함된 지도용 데이터 조회
    Map<String, Object> getMapDataWithPagination(Pageable pageable, int limit);
    
    // 페이징 처리가 포함된 필터링된 지도용 데이터 조회
    Map<String, Object> getFilteredMapDataWithPagination(
        String transactionType, 
        Double minPrice, 
        Double maxPrice, 
        Double minArea, 
        Double maxArea,
        Pageable pageable
    );
}
