package com.back.service;

import com.back.dto.ApartmentRentDTO;
import com.back.dto.ApartmentRentSearchDTO;
import com.back.domain.ApartmentRent;

import java.util.List;

public interface ApartmentRentService {
    
    // 아파트 전월세 데이터 생성
    ApartmentRentDTO createApartmentRent(ApartmentRentDTO apartmentRentDTO);
    
    // 모든 아파트 전월세 정보 조회
    List<ApartmentRentDTO> getAllApartmentRents();
    
    // ID로 아파트 전월세 정보 조회
    ApartmentRentDTO getApartmentRentById(Long id);
    
    // 검색 조건에 따른 아파트 전월세 정보 조회
    List<ApartmentRentDTO> searchApartmentRents(ApartmentRentSearchDTO searchDTO);
    
    // 시군구로 아파트 전월세 정보 조회
    List<ApartmentRentDTO> getApartmentRentsBySigungu(String sigungu);
    
    // 단지명으로 아파트 전월세 정보 조회
    List<ApartmentRentDTO> getApartmentRentsByComplexName(String complexName);
    
    // 구분(전세/월세)으로 아파트 전월세 정보 조회
    List<ApartmentRentDTO> getApartmentRentsByRentType(String rentType);
    
    // 전용면적 범위로 아파트 전월세 정보 조회
    List<ApartmentRentDTO> getApartmentRentsByAreaRange(Double minArea, Double maxArea);
    
    // 층 범위로 아파트 전월세 정보 조회
    List<ApartmentRentDTO> getApartmentRentsByFloorRange(Integer minFloor, Integer maxFloor);
    
    // 건축년도 범위로 아파트 전월세 정보 조회
    List<ApartmentRentDTO> getApartmentRentsByConstructionYearRange(Integer minYear, Integer maxYear);
    
    // 보증금 범위로 아파트 전월세 정보 조회
    List<ApartmentRentDTO> getApartmentRentsByDepositRange(Long minDeposit, Long maxDeposit);
    
    // 월세 범위로 아파트 전월세 정보 조회
    List<ApartmentRentDTO> getApartmentRentsByMonthlyRentRange(Long minRent, Long maxRent);
    
    // ==================== 관리자용 메서드 추가 ====================
    
    // 페이징 처리가 포함된 전체 조회
    org.springframework.data.domain.Page<ApartmentRent> findAll(org.springframework.data.domain.Pageable pageable);
    
    // 데이터 저장
    ApartmentRent save(ApartmentRent apartmentRent);
    
    // 데이터 수정
    ApartmentRent update(Long id, ApartmentRent apartmentRent);
    
    // 데이터 삭제
    void delete(Long id);
    
    // 전체 데이터 개수 조회
    long count();
    
    // ID 역순으로 정렬된 데이터 조회 (최신순)
    org.springframework.data.domain.Page<ApartmentRent> findAllOrderByIdDesc(org.springframework.data.domain.Pageable pageable);
}
