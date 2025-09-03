package com.back.service;

import com.back.dto.RowHouseSaleDTO;
import com.back.dto.RowHouseSaleSearchDTO;

import java.util.List;

public interface RowHouseSaleService {
    
    // ==================== 관리자용 메서드 추가 ====================
    
    // 페이징 처리가 포함된 전체 조회
    org.springframework.data.domain.Page<com.back.domain.RowHouseSale> findAll(org.springframework.data.domain.Pageable pageable);
    
    // 데이터 저장
    com.back.domain.RowHouseSale save(com.back.domain.RowHouseSale rowHouseSale);
    
    // 데이터 수정
    com.back.domain.RowHouseSale update(Long id, com.back.domain.RowHouseSale rowHouseSale);
    
    // 데이터 삭제
    void deleteById(Long id);
    
    // 전체 데이터 개수 조회
    long count();
    
    // 빌라 매매 데이터 생성
    RowHouseSaleDTO createRowHouseSale(RowHouseSaleDTO rowHouseSaleDTO);
    
    // 모든 빌라 매매 정보 조회
    List<RowHouseSaleDTO> getAllRowHouseSales();
    
    // ID별 연립다세대 매매 정보 조회
    RowHouseSaleDTO getRowHouseSaleById(Long id);
    
    // 조건에 따른 연립다세대 매매 검색
    List<RowHouseSaleDTO> searchRowHouseSales(RowHouseSaleSearchDTO searchDTO);
    
    // 시군구별 연립다세대 매매 정보 조회
    List<RowHouseSaleDTO> getRowHouseSalesBySigungu(String sigungu);
    
    // 건물명별 연립다세대 매매 정보 조회
    List<RowHouseSaleDTO> getRowHouseSalesByBuildingName(String buildingName);
    
    // 주택유형별 연립다세대 매매 정보 조회
    List<RowHouseSaleDTO> getRowHouseSalesByHousingType(String housingType);
    
    // 전용면적 범위별 연립다세대 매매 정보 조회
    List<RowHouseSaleDTO> getRowHouseSalesByExclusiveAreaRange(Double minExclusiveArea, Double maxExclusiveArea);
    
    // 대지권면적 범위별 연립다세대 매매 정보 조회
    List<RowHouseSaleDTO> getRowHouseSalesByLandAreaRange(Double minLandArea, Double maxLandArea);
    
    // 거래금액 범위별 연립다세대 매매 정보 조회
    List<RowHouseSaleDTO> getRowHouseSalesByTransactionAmountRange(Long minAmount, Long maxAmount);
    
    // 층 범위별 연립다세대 매매 정보 조회
    List<RowHouseSaleDTO> getRowHouseSalesByFloorRange(Integer minFloor, Integer maxFloor);
    
    // 건축년도 범위별 연립다세대 매매 정보 조회
    List<RowHouseSaleDTO> getRowHouseSalesByConstructionYearRange(Integer minYear, Integer maxYear);
    
    // 번호 역순으로 정렬된 데이터 조회 (최신순)
    org.springframework.data.domain.Page<com.back.domain.RowHouseSale> findAllOrderByNoDesc(org.springframework.data.domain.Pageable pageable);
} 