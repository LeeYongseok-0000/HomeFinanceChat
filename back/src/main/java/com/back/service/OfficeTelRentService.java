package com.back.service;

import com.back.dto.OfficeTelRentDTO;
import com.back.dto.OfficeTelRentSearchDTO;

import java.util.List;

public interface OfficeTelRentService {
    
    // ==================== 관리자용 메서드 추가 ====================
    
    // 페이징 처리가 포함된 전체 조회
    org.springframework.data.domain.Page<com.back.domain.OfficeTelRent> findAll(org.springframework.data.domain.Pageable pageable);
    
    // 데이터 저장
    com.back.domain.OfficeTelRent save(com.back.domain.OfficeTelRent officeTelRent);
    
    // 데이터 수정
    com.back.domain.OfficeTelRent update(Long id, com.back.domain.OfficeTelRent officeTelRent);
    
    // 데이터 삭제
    void delete(Long id);
    
    // 전체 데이터 개수 조회
    long count();
    
    // 오피스텔 전월세 데이터 생성
    OfficeTelRentDTO createOfficeTelRent(OfficeTelRentDTO officeTelRentDTO);
    
    // 모든 오피스텔 전월세 정보 조회
    List<OfficeTelRentDTO> getAllOfficeTelRents();
    
    // ID로 오피스텔 전/월세 정보 조회
    OfficeTelRentDTO getOfficeTelRentById(Long id);
    
    // 검색 조건에 따른 오피스텔 전/월세 정보 조회
    List<OfficeTelRentDTO> searchOfficeTelRents(OfficeTelRentSearchDTO searchDTO);
    
    // 시군구로 오피스텔 전/월세 정보 조회
    List<OfficeTelRentDTO> getOfficeTelRentsBySigungu(String sigungu);
    
    // 단지명으로 오피스텔 전/월세 정보 조회
    List<OfficeTelRentDTO> getOfficeTelRentsByComplexName(String complexName);
    
    // 전월세구분으로 오피스텔 전/월세 정보 조회
    List<OfficeTelRentDTO> getOfficeTelRentsByRentType(String rentType);
    
    // 전용면적 범위로 오피스텔 전/월세 정보 조회
    List<OfficeTelRentDTO> getOfficeTelRentsByAreaRange(Double minArea, Double maxArea);
    
    // 보증금 범위로 오피스텔 전/월세 정보 조회
    List<OfficeTelRentDTO> getOfficeTelRentsByDepositRange(Long minDeposit, Long maxDeposit);
    
    // 월세 범위로 오피스텔 전/월세 정보 조회
    List<OfficeTelRentDTO> getOfficeTelRentsByMonthlyRentRange(Long minMonthlyRent, Long maxMonthlyRent);
    
    // 층 범위로 오피스텔 전/월세 정보 조회
    List<OfficeTelRentDTO> getOfficeTelRentsByFloorRange(Integer minFloor, Integer maxFloor);
    
    // 건축년도 범위로 오피스텔 전/월세 정보 조회
    List<OfficeTelRentDTO> getOfficeTelRentsByConstructionYearRange(Integer minYear, Integer maxYear);
    
    // 번호 역순으로 정렬된 데이터 조회 (최신순)
    org.springframework.data.domain.Page<com.back.domain.OfficeTelRent> findAllOrderByNoDesc(org.springframework.data.domain.Pageable pageable);
} 