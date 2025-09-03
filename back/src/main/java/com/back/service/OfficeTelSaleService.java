package com.back.service;

import com.back.dto.OfficeTelSaleDTO;
import com.back.dto.OfficeTelSaleSearchDTO;

import java.util.List;

public interface OfficeTelSaleService {
    
    // ==================== 관리자용 메서드 추가 ====================
    
    // 페이징 처리가 포함된 전체 조회
    org.springframework.data.domain.Page<com.back.domain.OfficeTelSale> findAll(org.springframework.data.domain.Pageable pageable);
    
    // 데이터 저장
    com.back.domain.OfficeTelSale save(com.back.domain.OfficeTelSale officeTelSale);
    
    // 데이터 수정
    com.back.domain.OfficeTelSale update(Long id, com.back.domain.OfficeTelSale officeTelSale);
    
    // 데이터 삭제
    void deleteById(Long id);
    
    // 전체 데이터 개수 조회
    long count();
    
    // 오피스텔 매매 데이터 생성
    OfficeTelSaleDTO createOfficeTelSale(OfficeTelSaleDTO officeTelSaleDTO);
    
    // 모든 오피스텔 매매 정보 조회
    List<OfficeTelSaleDTO> getAllOfficeTelSales();
    
    // ID로 오피스텔 매매 정보 조회
    OfficeTelSaleDTO getOfficeTelSaleById(Long id);
    
    // 검색 조건에 따른 오피스텔 매매 정보 조회
    List<OfficeTelSaleDTO> searchOfficeTelSales(OfficeTelSaleSearchDTO searchDTO);
    
    // 시군구로 오피스텔 매매 정보 조회
    List<OfficeTelSaleDTO> getOfficeTelSalesBySigungu(String sigungu);
    
    // 단지명으로 오피스텔 매매 정보 조회
    List<OfficeTelSaleDTO> getOfficeTelSalesByComplexName(String complexName);
    
    // 전용면적 범위로 오피스텔 매매 정보 조회
    List<OfficeTelSaleDTO> getOfficeTelSalesByAreaRange(Double minArea, Double maxArea);
    
    // 층 범위로 오피스텔 매매 정보 조회
    List<OfficeTelSaleDTO> getOfficeTelSalesByFloorRange(Integer minFloor, Integer maxFloor);
    
    // 건축년도 범위로 오피스텔 매매 정보 조회
    List<OfficeTelSaleDTO> getOfficeTelSalesByConstructionYearRange(Integer minYear, Integer maxYear);
    
    // 거래금액 범위로 오피스텔 매매 정보 조회
    List<OfficeTelSaleDTO> getOfficeTelSalesByTransactionAmountRange(Long minAmount, Long maxAmount);
    
    // 번호 역순으로 정렬된 데이터 조회 (최신순)
    org.springframework.data.domain.Page<com.back.domain.OfficeTelSale> findAllOrderByNoDesc(org.springframework.data.domain.Pageable pageable);
} 