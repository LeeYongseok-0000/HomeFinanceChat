package com.back.service;

import com.back.dto.RowHouseRentDTO;
import com.back.dto.RowHouseRentSearchDTO;

import java.util.List;

public interface RowHouseRentService {
    
    // ==================== 관리자용 메서드 추가 ====================
    
    // 페이징 처리가 포함된 전체 조회
    org.springframework.data.domain.Page<com.back.domain.RowHouseRent> findAll(org.springframework.data.domain.Pageable pageable);
    
    // 데이터 저장
    com.back.domain.RowHouseRent save(com.back.domain.RowHouseRent rowHouseRent);
    
    // 데이터 수정
    com.back.domain.RowHouseRent update(Long id, com.back.domain.RowHouseRent rowHouseRent);
    
    // 데이터 삭제
    void delete(Long id);
    
    // 전체 데이터 개수 조회
    long count();
    
    // 빌라 전월세 데이터 생성
    RowHouseRentDTO createRowHouseRent(RowHouseRentDTO rowHouseRentDTO);
    
    // 모든 빌라 전월세 정보 조회
    List<RowHouseRentDTO> getAllRowHouseRents();
    
    // ID별 연립다세대 전월세 정보 조회
    RowHouseRentDTO getRowHouseRentById(Long id);
    
    // 조건에 따른 연립다세대 전월세 검색
    List<RowHouseRentDTO> searchRowHouseRents(RowHouseRentSearchDTO searchDTO);
    
    // 시군구별 연립다세대 전월세 정보 조회
    List<RowHouseRentDTO> getRowHouseRentsBySigungu(String sigungu);
    
    // 건물명별 연립다세대 전월세 정보 조회
    List<RowHouseRentDTO> getRowHouseRentsByBuildingName(String buildingName);
    
    // 주택유형별 연립다세대 전월세 정보 조회
    List<RowHouseRentDTO> getRowHouseRentsByHousingType(String housingType);
    
    // 전월세구분별 연립다세대 전월세 정보 조회
    List<RowHouseRentDTO> getRowHouseRentsByRentType(String rentType);
    
    // 전용면적 범위별 연립다세대 전월세 정보 조회
    List<RowHouseRentDTO> getRowHouseRentsByExclusiveAreaRange(Double minExclusiveArea, Double maxExclusiveArea);
    
    // 보증금 범위별 연립다세대 전월세 정보 조회
    List<RowHouseRentDTO> getRowHouseRentsByDepositRange(Long minDeposit, Long maxDeposit);
    
    // 월세 범위별 연립다세대 전월세 정보 조회
    List<RowHouseRentDTO> getRowHouseRentsByMonthlyRentRange(Long minMonthlyRent, Long maxMonthlyRent);
    
    // 층 범위별 연립다세대 전월세 정보 조회
    List<RowHouseRentDTO> getRowHouseRentsByFloorRange(Integer minFloor, Integer maxFloor);
    
    // 건축년도 범위별 연립다세대 전월세 정보 조회
    List<RowHouseRentDTO> getRowHouseRentsByConstructionYearRange(Integer minYear, Integer maxYear);
    
    // 번호 역순으로 정렬된 데이터 조회 (최신순)
    org.springframework.data.domain.Page<com.back.domain.RowHouseRent> findAllOrderByNoDesc(org.springframework.data.domain.Pageable pageable);
} 