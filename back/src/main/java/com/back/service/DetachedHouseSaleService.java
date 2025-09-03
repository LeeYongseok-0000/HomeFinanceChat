package com.back.service;

import com.back.dto.DetachedHouseSaleDTO;
import com.back.dto.DetachedHouseSaleSearchDTO;

import java.util.List;

public interface DetachedHouseSaleService {
    
    // ==================== 관리자용 메서드 추가 ====================
    
    // 페이징 처리가 포함된 전체 조회
    org.springframework.data.domain.Page<com.back.domain.DetachedHouseSale> findAll(org.springframework.data.domain.Pageable pageable);
    
    // 데이터 저장
    com.back.domain.DetachedHouseSale save(com.back.domain.DetachedHouseSale detachedHouseSale);
    
    // 데이터 수정
    com.back.domain.DetachedHouseSale update(Long id, com.back.domain.DetachedHouseSale detachedHouseSale);
    
    // 데이터 삭제
    void deleteById(Long id);
    
    // 전체 데이터 개수 조회
    long count();
    
    // 단독주택 매매 데이터 생성
    DetachedHouseSaleDTO createDetachedHouseSale(DetachedHouseSaleDTO detachedHouseSaleDTO);
    
    // 모든 단독주택 매매 정보 조회
    List<DetachedHouseSaleDTO> getAllDetachedHouseSales();
    
    // ID로 단독/다가구 매매 정보 조회
    DetachedHouseSaleDTO getDetachedHouseSaleById(Long id);
    
    // 검색 조건에 따른 단독/다가구 매매 정보 조회
    List<DetachedHouseSaleDTO> searchDetachedHouseSales(DetachedHouseSaleSearchDTO searchDTO);
    
    // 시군구로 단독/다가구 매매 정보 조회
    List<DetachedHouseSaleDTO> getDetachedHouseSalesBySigungu(String sigungu);
    
    // 주택유형으로 단독/다가구 매매 정보 조회
    List<DetachedHouseSaleDTO> getDetachedHouseSalesByHousingType(String housingType);
    
    // 도로조건으로 단독/다가구 매매 정보 조회
    List<DetachedHouseSaleDTO> getDetachedHouseSalesByRoadCondition(String roadCondition);
    
    // 연면적 범위로 단독/다가구 매매 정보 조회
    List<DetachedHouseSaleDTO> getDetachedHouseSalesByTotalAreaRange(Double minTotalArea, Double maxTotalArea);
    
    // 대지면적 범위로 단독/다가구 매매 정보 조회
    List<DetachedHouseSaleDTO> getDetachedHouseSalesByLandAreaRange(Double minLandArea, Double maxLandArea);
    
    // 거래금액 범위로 단독/다가구 매매 정보 조회
    List<DetachedHouseSaleDTO> getDetachedHouseSalesByTransactionAmountRange(Long minAmount, Long maxAmount);
    
    // 건축년도 범위로 단독/다가구 매매 정보 조회
    List<DetachedHouseSaleDTO> getDetachedHouseSalesByConstructionYearRange(Integer minYear, Integer maxYear);
    
    // 번호 역순으로 정렬된 데이터 조회 (최신순)
    org.springframework.data.domain.Page<com.back.domain.DetachedHouseSale> findAllOrderByNoDesc(org.springframework.data.domain.Pageable pageable);
} 