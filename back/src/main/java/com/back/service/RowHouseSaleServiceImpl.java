package com.back.service;

import com.back.domain.RowHouseSale;
import com.back.dto.RowHouseSaleDTO;
import com.back.dto.RowHouseSaleSearchDTO;
import com.back.repository.RowHouseSaleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class RowHouseSaleServiceImpl implements RowHouseSaleService {
    
    private final RowHouseSaleRepository rowHouseSaleRepository;
    
    @Override
    public RowHouseSaleDTO createRowHouseSale(RowHouseSaleDTO rowHouseSaleDTO) {
        log.info("빌라 매매 데이터 생성 - DTO: {}", rowHouseSaleDTO);
        
        // DTO를 엔티티로 변환
        RowHouseSale rowHouseSale = dtoToEntity(rowHouseSaleDTO);
        
        // 저장
        RowHouseSale savedRowHouseSale = rowHouseSaleRepository.save(rowHouseSale);
        
        log.info("빌라 매매 데이터 생성 완료 - ID: {}", savedRowHouseSale.getNo());
        
        // 저장된 엔티티를 DTO로 변환하여 반환
        return entityToDTO(savedRowHouseSale);
    }
    
    @Override
    public List<RowHouseSaleDTO> getAllRowHouseSales() {
        log.info("모든 연립다세대 매매 정보 조회");
        List<RowHouseSale> rowHouseSales = rowHouseSaleRepository.findAll();
        return rowHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public RowHouseSaleDTO getRowHouseSaleById(Long id) {
        log.info("ID별 연립다세대 매매 정보 조회 - ID: {}", id);
        RowHouseSale rowHouseSale = rowHouseSaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("연립다세대 매매 정보를 찾을 수 없습니다. ID: " + id));
        return entityToDTO(rowHouseSale);
    }
    
    @Override
    public List<RowHouseSaleDTO> searchRowHouseSales(RowHouseSaleSearchDTO searchDTO) {
        log.info("연립다세대 매매 검색 - 조건: {}", searchDTO);
        
        List<RowHouseSale> rowHouseSales = rowHouseSaleRepository.searchByCriteria(
                searchDTO.getSigungu(),
                searchDTO.getBuildingName(),
                searchDTO.getHousingType(),
                searchDTO.getMinExclusiveArea(),
                searchDTO.getMaxExclusiveArea(),
                searchDTO.getMinLandArea(),
                searchDTO.getMaxLandArea(),
                searchDTO.getMinTransactionAmount(),
                searchDTO.getMaxTransactionAmount(),
                searchDTO.getMinFloor(),
                searchDTO.getMaxFloor(),
                searchDTO.getMinConstructionYear(),
                searchDTO.getMaxConstructionYear()
        );
        
        return rowHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseSaleDTO> getRowHouseSalesBySigungu(String sigungu) {
        log.info("시군구별 연립다세대 매매 정보 조회 - 시군구: {}", sigungu);
        List<RowHouseSale> rowHouseSales = rowHouseSaleRepository.findBySigunguContaining(sigungu);
        return rowHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseSaleDTO> getRowHouseSalesByBuildingName(String buildingName) {
        log.info("건물명별 연립다세대 매매 정보 조회 - 건물명: {}", buildingName);
        List<RowHouseSale> rowHouseSales = rowHouseSaleRepository.findByBuildingNameContaining(buildingName);
        return rowHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseSaleDTO> getRowHouseSalesByHousingType(String housingType) {
        log.info("주택유형별 연립다세대 매매 정보 조회 - 주택유형: {}", housingType);
        List<RowHouseSale> rowHouseSales = rowHouseSaleRepository.findByHousingType(housingType);
        return rowHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseSaleDTO> getRowHouseSalesByExclusiveAreaRange(Double minExclusiveArea, Double maxExclusiveArea) {
        log.info("전용면적 범위별 연립다세대 매매 정보 조회 - 최소: {}, 최대: {}", minExclusiveArea, maxExclusiveArea);
        List<RowHouseSale> rowHouseSales = rowHouseSaleRepository.findByExclusiveAreaBetween(minExclusiveArea, maxExclusiveArea);
        return rowHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseSaleDTO> getRowHouseSalesByLandAreaRange(Double minLandArea, Double maxLandArea) {
        log.info("대지권면적 범위별 연립다세대 매매 정보 조회 - 최소: {}, 최대: {}", minLandArea, maxLandArea);
        List<RowHouseSale> rowHouseSales = rowHouseSaleRepository.findByLandAreaBetween(minLandArea, maxLandArea);
        return rowHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseSaleDTO> getRowHouseSalesByTransactionAmountRange(Long minAmount, Long maxAmount) {
        log.info("거래금액 범위별 연립다세대 매매 정보 조회 - 최소: {}, 최대: {}", minAmount, maxAmount);
        List<RowHouseSale> rowHouseSales = rowHouseSaleRepository.findByTransactionAmountBetween(minAmount, maxAmount);
        return rowHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseSaleDTO> getRowHouseSalesByFloorRange(Integer minFloor, Integer maxFloor) {
        log.info("층 범위별 연립다세대 매매 정보 조회 - 최소: {}, 최대: {}", minFloor, maxFloor);
        List<RowHouseSale> rowHouseSales = rowHouseSaleRepository.findByFloorBetween(minFloor, maxFloor);
        return rowHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RowHouseSaleDTO> getRowHouseSalesByConstructionYearRange(Integer minYear, Integer maxYear) {
        log.info("건축년도 범위별 연립다세대 매매 정보 조회 - 최소: {}, 최대: {}", minYear, maxYear);
        List<RowHouseSale> rowHouseSales = rowHouseSaleRepository.findByConstructionYearBetween(minYear, maxYear);
        return rowHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    // Entity를 DTO로 변환
    private RowHouseSaleDTO entityToDTO(RowHouseSale rowHouseSale) {
        return RowHouseSaleDTO.builder()
                .no(rowHouseSale.getNo())
                .sigungu(rowHouseSale.getSigungu())
                .buildingName(rowHouseSale.getBuildingName())
                .exclusiveArea(rowHouseSale.getExclusiveArea())
                .landArea(rowHouseSale.getLandArea())
                .contractDate(rowHouseSale.getContractDate())
                .transactionAmount(rowHouseSale.getTransactionAmount())
                .floor(rowHouseSale.getFloor())
                .constructionYear(rowHouseSale.getConstructionYear())
                .roadName(rowHouseSale.getRoadName())
                .housingType(rowHouseSale.getHousingType())
                .build();
    }
    
    // DTO를 Entity로 변환
    private RowHouseSale dtoToEntity(RowHouseSaleDTO rowHouseSaleDTO) {
        return RowHouseSale.builder()
                .sigungu(rowHouseSaleDTO.getSigungu())
                .buildingName(rowHouseSaleDTO.getBuildingName())
                .exclusiveArea(rowHouseSaleDTO.getExclusiveArea())
                .landArea(rowHouseSaleDTO.getLandArea())
                .contractDate(rowHouseSaleDTO.getContractDate())
                .transactionAmount(rowHouseSaleDTO.getTransactionAmount())
                .floor(rowHouseSaleDTO.getFloor())
                .constructionYear(rowHouseSaleDTO.getConstructionYear())
                .roadName(rowHouseSaleDTO.getRoadName())
                .housingType(rowHouseSaleDTO.getHousingType())
                .transactionType(rowHouseSaleDTO.getTransactionType())
                .build();
    }
    
    // ==================== 관리자용 메서드 구현 ====================
    
    @Override
    public org.springframework.data.domain.Page<com.back.domain.RowHouseSale> findAll(org.springframework.data.domain.Pageable pageable) {
        return rowHouseSaleRepository.findAll(pageable);
    }
    
    @Override
    public com.back.domain.RowHouseSale save(com.back.domain.RowHouseSale rowHouseSale) {
        return rowHouseSaleRepository.save(rowHouseSale);
    }
    
    @Override
    public com.back.domain.RowHouseSale update(Long id, com.back.domain.RowHouseSale rowHouseSale) {
        com.back.domain.RowHouseSale existingSale = rowHouseSaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("연립/다세대 매매 정보를 찾을 수 없습니다. ID: " + id));
        
        // 기존 데이터 업데이트 (기본 필드들만)
        existingSale.setSigungu(rowHouseSale.getSigungu());
        existingSale.setBuildingName(rowHouseSale.getBuildingName());
        existingSale.setExclusiveArea(rowHouseSale.getExclusiveArea());
        existingSale.setLandArea(rowHouseSale.getLandArea());
        existingSale.setContractDate(rowHouseSale.getContractDate());
        existingSale.setTransactionAmount(rowHouseSale.getTransactionAmount());
        existingSale.setFloor(rowHouseSale.getFloor());
        existingSale.setConstructionYear(rowHouseSale.getConstructionYear());
        existingSale.setRoadName(rowHouseSale.getRoadName());
        existingSale.setHousingType(rowHouseSale.getHousingType());
        existingSale.setTransactionType(rowHouseSale.getTransactionType());
        
        return rowHouseSaleRepository.save(existingSale);
    }
    
    @Override
    public void deleteById(Long id) {
        rowHouseSaleRepository.deleteById(id);
    }
    
    @Override
    public long count() {
        return rowHouseSaleRepository.count();
    }
    
    @Override
    public org.springframework.data.domain.Page<com.back.domain.RowHouseSale> findAllOrderByNoDesc(org.springframework.data.domain.Pageable pageable) {
        // 번호 역순으로 정렬된 Pageable 생성
        org.springframework.data.domain.PageRequest sortedPageable = org.springframework.data.domain.PageRequest.of(
            pageable.getPageNumber(), 
            pageable.getPageSize(), 
            org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "no")
        );
        return rowHouseSaleRepository.findAll(sortedPageable);
    }
} 