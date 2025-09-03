package com.back.service;

import com.back.domain.RowHouseRent;
import com.back.dto.RowHouseRentDTO;
import com.back.dto.RowHouseRentSearchDTO;
import com.back.repository.RowHouseRentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class RowHouseRentServiceImpl implements RowHouseRentService {
    
    private final RowHouseRentRepository rowHouseRentRepository;
    
    @Override
    public RowHouseRentDTO createRowHouseRent(RowHouseRentDTO rowHouseRentDTO) {
        log.info("빌라 전월세 데이터 생성 - DTO: {}", rowHouseRentDTO);
        
        // DTO를 엔티티로 변환
        RowHouseRent rowHouseRent = dtoToEntity(rowHouseRentDTO);
        
        // 저장
        RowHouseRent savedRowHouseRent = rowHouseRentRepository.save(rowHouseRent);
        
        log.info("빌라 전월세 데이터 생성 완료 - ID: {}", savedRowHouseRent.getNo());
        
        // 저장된 엔티티를 DTO로 변환하여 반환
        return entityToDTO(savedRowHouseRent);
    }
    
    @Override
    public List<RowHouseRentDTO> getAllRowHouseRents() {
        log.info("모든 연립다세대 전월세 정보 조회");
        List<RowHouseRent> rowHouseRents = rowHouseRentRepository.findAll();
        return rowHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public RowHouseRentDTO getRowHouseRentById(Long id) {
        log.info("ID별 연립다세대 전월세 정보 조회 - ID: {}", id);
        RowHouseRent rowHouseRent = rowHouseRentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("연립다세대 전월세 정보를 찾을 수 없습니다. ID: " + id));
        return entityToDTO(rowHouseRent);
    }
    
    @Override
    public List<RowHouseRentDTO> searchRowHouseRents(RowHouseRentSearchDTO searchDTO) {
        log.info("연립다세대 전월세 검색 - 조건: {}", searchDTO);
        
        List<RowHouseRent> rowHouseRents = rowHouseRentRepository.searchByCriteria(
                searchDTO.getSigungu(),
                searchDTO.getBuildingName(),
                searchDTO.getHousingType(),
                searchDTO.getRentType(),
                searchDTO.getMinExclusiveArea(),
                searchDTO.getMaxExclusiveArea(),
                searchDTO.getMinDeposit(),
                searchDTO.getMaxDeposit(),
                searchDTO.getMinMonthlyRent(),
                searchDTO.getMaxMonthlyRent(),
                searchDTO.getMinFloor(),
                searchDTO.getMaxFloor(),
                searchDTO.getMinConstructionYear(),
                searchDTO.getMaxConstructionYear()
        );
        
        return rowHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseRentDTO> getRowHouseRentsBySigungu(String sigungu) {
        log.info("시군구별 연립다세대 전월세 정보 조회 - 시군구: {}", sigungu);
        List<RowHouseRent> rowHouseRents = rowHouseRentRepository.findBySigunguContaining(sigungu);
        return rowHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseRentDTO> getRowHouseRentsByBuildingName(String buildingName) {
        log.info("건물명별 연립다세대 전월세 정보 조회 - 건물명: {}", buildingName);
        List<RowHouseRent> rowHouseRents = rowHouseRentRepository.findByBuildingNameContaining(buildingName);
        return rowHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseRentDTO> getRowHouseRentsByHousingType(String housingType) {
        log.info("주택유형별 연립다세대 전월세 정보 조회 - 주택유형: {}", housingType);
        List<RowHouseRent> rowHouseRents = rowHouseRentRepository.findByHousingType(housingType);
        return rowHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseRentDTO> getRowHouseRentsByRentType(String rentType) {
        log.info("전월세구분별 연립다세대 전월세 정보 조회 - 전월세구분: {}", rentType);
        List<RowHouseRent> rowHouseRents = rowHouseRentRepository.findByRentType(rentType);
        return rowHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseRentDTO> getRowHouseRentsByExclusiveAreaRange(Double minExclusiveArea, Double maxExclusiveArea) {
        log.info("전용면적 범위별 연립다세대 전월세 정보 조회 - 최소: {}, 최대: {}", minExclusiveArea, maxExclusiveArea);
        List<RowHouseRent> rowHouseRents = rowHouseRentRepository.findByExclusiveAreaBetween(minExclusiveArea, maxExclusiveArea);
        return rowHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseRentDTO> getRowHouseRentsByDepositRange(Long minDeposit, Long maxDeposit) {
        log.info("보증금 범위별 연립다세대 전월세 정보 조회 - 최소: {}, 최대: {}", minDeposit, maxDeposit);
        List<RowHouseRent> rowHouseRents = rowHouseRentRepository.findByDepositBetween(minDeposit, maxDeposit);
        return rowHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseRentDTO> getRowHouseRentsByMonthlyRentRange(Long minMonthlyRent, Long maxMonthlyRent) {
        log.info("월세 범위별 연립다세대 전월세 정보 조회 - 최소: {}, 최대: {}", minMonthlyRent, maxMonthlyRent);
        List<RowHouseRent> rowHouseRents = rowHouseRentRepository.findByMonthlyRentBetween(minMonthlyRent, maxMonthlyRent);
        return rowHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseRentDTO> getRowHouseRentsByFloorRange(Integer minFloor, Integer maxFloor) {
        log.info("층 범위별 연립다세대 전월세 정보 조회 - 최소: {}, 최대: {}", minFloor, maxFloor);
        List<RowHouseRent> rowHouseRents = rowHouseRentRepository.findByFloorBetween(minFloor, maxFloor);
        return rowHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseRentDTO> getRowHouseRentsByConstructionYearRange(Integer minYear, Integer maxYear) {
        log.info("건축년도 범위별 연립다세대 전월세 정보 조회 - 최소: {}, 최대: {}", minYear, maxYear);
        List<RowHouseRent> rowHouseRents = rowHouseRentRepository.findByConstructionYearBetween(minYear, maxYear);
        return rowHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    // Entity를 DTO로 변환
    private RowHouseRentDTO entityToDTO(RowHouseRent rowHouseRent) {
        return RowHouseRentDTO.builder()
                .no(rowHouseRent.getNo())
                .sigungu(rowHouseRent.getSigungu())
                .buildingName(rowHouseRent.getBuildingName())
                .rentType(rowHouseRent.getRentType())
                .exclusiveArea(rowHouseRent.getExclusiveArea())
                .contractDate(rowHouseRent.getContractDate())
                .deposit(rowHouseRent.getDeposit())
                .monthlyRent(rowHouseRent.getMonthlyRent())
                .floor(rowHouseRent.getFloor())
                .constructionYear(rowHouseRent.getConstructionYear())
                .roadName(rowHouseRent.getRoadName())
                .housingType(rowHouseRent.getHousingType())
                .build();
    }
    
    // DTO를 Entity로 변환
    private RowHouseRent dtoToEntity(RowHouseRentDTO rowHouseRentDTO) {
        return RowHouseRent.builder()
                .sigungu(rowHouseRentDTO.getSigungu())
                .buildingName(rowHouseRentDTO.getBuildingName())
                .rentType(rowHouseRentDTO.getRentType())
                .exclusiveArea(rowHouseRentDTO.getExclusiveArea())
                .contractDate(rowHouseRentDTO.getContractDate())
                .deposit(rowHouseRentDTO.getDeposit())
                .monthlyRent(rowHouseRentDTO.getMonthlyRent())
                .floor(rowHouseRentDTO.getFloor())
                .constructionYear(rowHouseRentDTO.getConstructionYear())
                .roadName(rowHouseRentDTO.getRoadName())
                .housingType(rowHouseRentDTO.getHousingType())
                .transactionType(rowHouseRentDTO.getTransactionType())
                .build();
    }
    
    // ==================== 관리자용 메서드 구현 ====================
    
    @Override
    public org.springframework.data.domain.Page<com.back.domain.RowHouseRent> findAll(org.springframework.data.domain.Pageable pageable) {
        return rowHouseRentRepository.findAll(pageable);
    }
    
    @Override
    public com.back.domain.RowHouseRent save(com.back.domain.RowHouseRent rowHouseRent) {
        return rowHouseRentRepository.save(rowHouseRent);
    }
    
    @Override
    public com.back.domain.RowHouseRent update(Long id, com.back.domain.RowHouseRent rowHouseRent) {
        com.back.domain.RowHouseRent existingRent = rowHouseRentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("연립/다세대 전월세 정보를 찾을 수 없습니다. ID: " + id));
        
        // 기존 데이터 업데이트 (기본 필드들만)
        existingRent.setSigungu(rowHouseRent.getSigungu());
        existingRent.setBuildingName(rowHouseRent.getBuildingName());
        existingRent.setRentType(rowHouseRent.getRentType());
        existingRent.setExclusiveArea(rowHouseRent.getExclusiveArea());
        existingRent.setContractDate(rowHouseRent.getContractDate());
        existingRent.setDeposit(rowHouseRent.getDeposit());
        existingRent.setMonthlyRent(rowHouseRent.getMonthlyRent());
        existingRent.setFloor(rowHouseRent.getFloor());
        existingRent.setConstructionYear(rowHouseRent.getConstructionYear());
        existingRent.setRoadName(rowHouseRent.getRoadName());
        existingRent.setHousingType(rowHouseRent.getHousingType());
        existingRent.setTransactionType(rowHouseRent.getTransactionType());
        
        return rowHouseRentRepository.save(existingRent);
    }
    
    @Override
    public void delete(Long id) {
        rowHouseRentRepository.deleteById(id);
    }
    
    @Override
    public long count() {
        return rowHouseRentRepository.count();
    }
    
    @Override
    public org.springframework.data.domain.Page<com.back.domain.RowHouseRent> findAllOrderByNoDesc(org.springframework.data.domain.Pageable pageable) {
        // 번호 역순으로 정렬된 Pageable 생성
        org.springframework.data.domain.PageRequest sortedPageable = org.springframework.data.domain.PageRequest.of(
            pageable.getPageNumber(), 
            pageable.getPageSize(), 
            org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "no")
        );
        return rowHouseRentRepository.findAll(sortedPageable);
    }
} 