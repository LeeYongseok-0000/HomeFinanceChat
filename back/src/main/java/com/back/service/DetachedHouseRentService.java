package com.back.service;

import com.back.dto.DetachedHouseRentDTO;
import com.back.dto.DetachedHouseRentSearchDTO;

import java.util.List;

public interface DetachedHouseRentService {
    
    // ==================== 관리자용 메서드 추가 ====================
    
    // 페이징 처리가 포함된 전체 조회
    org.springframework.data.domain.Page<com.back.domain.DetachedHouseRent> findAll(org.springframework.data.domain.Pageable pageable);
    
    // 데이터 저장
    com.back.domain.DetachedHouseRent save(com.back.domain.DetachedHouseRent detachedHouseRent);
    
    // 데이터 수정
    com.back.domain.DetachedHouseRent update(Long id, com.back.domain.DetachedHouseRent detachedHouseRent);
    
    // 데이터 삭제
    void delete(Long id);
    
    // 전체 데이터 개수 조회
    long count();
    
    // 단독주택 전월세 데이터 생성
    DetachedHouseRentDTO createDetachedHouseRent(DetachedHouseRentDTO detachedHouseRentDTO);
    
    // 모든 단독주택 전월세 정보 조회
    List<DetachedHouseRentDTO> getAllDetachedHouseRents();
    
    // ID로 단독/다가구 전/월세 정보 조회
    DetachedHouseRentDTO getDetachedHouseRentById(Long id);
    
    // 검색 조건에 따른 단독/다가구 전/월세 정보 조회
    List<DetachedHouseRentDTO> searchDetachedHouseRents(DetachedHouseRentSearchDTO searchDTO);
    
    // 시군구로 단독/다가구 전/월세 정보 조회
    List<DetachedHouseRentDTO> getDetachedHouseRentsBySigungu(String sigungu);
    
    // 주택유형으로 단독/다가구 전/월세 정보 조회
    List<DetachedHouseRentDTO> getDetachedHouseRentsByHousingType(String housingType);
    
    // 도로조건으로 단독/다가구 전/월세 정보 조회
    List<DetachedHouseRentDTO> getDetachedHouseRentsByRoadCondition(String roadCondition);
    
    // 전월세구분으로 단독/다가구 전/월세 정보 조회
    List<DetachedHouseRentDTO> getDetachedHouseRentsByRentType(String rentType);
    
    // 계약면적 범위로 단독/다가구 전/월세 정보 조회
    List<DetachedHouseRentDTO> getDetachedHouseRentsByContractAreaRange(Double minContractArea, Double maxContractArea);
    
    // 보증금 범위로 단독/다가구 전/월세 정보 조회
    List<DetachedHouseRentDTO> getDetachedHouseRentsByDepositRange(Long minDeposit, Long maxDeposit);
    
    // 월세 범위로 단독/다가구 전/월세 정보 조회
    List<DetachedHouseRentDTO> getDetachedHouseRentsByMonthlyRentRange(Long minMonthlyRent, Long maxMonthlyRent);
    
    // 건축년도 범위로 단독/다가구 전/월세 정보 조회
    List<DetachedHouseRentDTO> getDetachedHouseRentsByConstructionYearRange(Integer minYear, Integer maxYear);
    
    // 번호 역순으로 정렬된 데이터 조회 (최신순)
    org.springframework.data.domain.Page<com.back.domain.DetachedHouseRent> findAllOrderByNoDesc(org.springframework.data.domain.Pageable pageable);
} 