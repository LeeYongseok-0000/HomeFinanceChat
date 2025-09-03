package com.back.service;

import com.back.domain.DetachedHouseSale;
import com.back.dto.DetachedHouseSaleDTO;
import com.back.dto.DetachedHouseSaleSearchDTO;
import com.back.repository.DetachedHouseSaleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class DetachedHouseSaleServiceImpl implements DetachedHouseSaleService {
    
    private final DetachedHouseSaleRepository detachedHouseSaleRepository;
    
    @Override
    public DetachedHouseSaleDTO createDetachedHouseSale(DetachedHouseSaleDTO detachedHouseSaleDTO) {
        log.info("단독주택 매매 데이터 생성 - DTO: {}", detachedHouseSaleDTO);
        
        // DTO를 엔티티로 변환
        DetachedHouseSale detachedHouseSale = dtoToEntity(detachedHouseSaleDTO);
        
        // 저장
        DetachedHouseSale savedDetachedHouseSale = detachedHouseSaleRepository.save(detachedHouseSale);
        
        log.info("단독주택 매매 데이터 생성 완료 - ID: {}", savedDetachedHouseSale.getNo());
        
        // 저장된 엔티티를 DTO로 변환하여 반환
        return entityToDTO(savedDetachedHouseSale);
    }
    
    @Override
    public List<DetachedHouseSaleDTO> getAllDetachedHouseSales() {
        log.info("모든 단독/다가구 매매 정보 조회");
        List<DetachedHouseSale> detachedHouseSales = detachedHouseSaleRepository.findAll();
        return detachedHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public DetachedHouseSaleDTO getDetachedHouseSaleById(Long id) {
        log.info("ID별 단독/다가구 매매 정보 조회 - ID: {}", id);
        DetachedHouseSale detachedHouseSale = detachedHouseSaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("단독/다가구 매매 정보를 찾을 수 없습니다. ID: " + id));
        return entityToDTO(detachedHouseSale);
    }
    
    @Override
    public List<DetachedHouseSaleDTO> searchDetachedHouseSales(DetachedHouseSaleSearchDTO searchDTO) {
        log.info("단독/다가구 매매 검색 - 조건: {}", searchDTO);
        
        List<DetachedHouseSale> detachedHouseSales = detachedHouseSaleRepository.searchByCriteria(
                searchDTO.getSigungu(),
                searchDTO.getHousingType(),
                searchDTO.getRoadCondition(),
                searchDTO.getMinTotalArea(),
                searchDTO.getMaxTotalArea(),
                searchDTO.getMinLandArea(),
                searchDTO.getMaxLandArea(),
                searchDTO.getMinTransactionAmount(),
                searchDTO.getMaxTransactionAmount(),
                searchDTO.getMinConstructionYear(),
                searchDTO.getMaxConstructionYear()
        );
        
        return detachedHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DetachedHouseSaleDTO> getDetachedHouseSalesBySigungu(String sigungu) {
        log.info("시군구별 단독/다가구 매매 정보 조회 - 시군구: {}", sigungu);
        List<DetachedHouseSale> detachedHouseSales = detachedHouseSaleRepository.findBySigunguContaining(sigungu);
        return detachedHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DetachedHouseSaleDTO> getDetachedHouseSalesByHousingType(String housingType) {
        log.info("주택유형별 단독/다가구 매매 정보 조회 - 주택유형: {}", housingType);
        List<DetachedHouseSale> detachedHouseSales = detachedHouseSaleRepository.findByHousingType(housingType);
        return detachedHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DetachedHouseSaleDTO> getDetachedHouseSalesByRoadCondition(String roadCondition) {
        log.info("도로조건별 단독/다가구 매매 정보 조회 - 도로조건: {}", roadCondition);
        List<DetachedHouseSale> detachedHouseSales = detachedHouseSaleRepository.findByRoadCondition(roadCondition);
        return detachedHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DetachedHouseSaleDTO> getDetachedHouseSalesByTotalAreaRange(Double minTotalArea, Double maxTotalArea) {
        log.info("연면적 범위별 단독/다가구 매매 정보 조회 - 최소: {}, 최대: {}", minTotalArea, maxTotalArea);
        List<DetachedHouseSale> detachedHouseSales = detachedHouseSaleRepository.findByTotalAreaBetween(minTotalArea, maxTotalArea);
        return detachedHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DetachedHouseSaleDTO> getDetachedHouseSalesByLandAreaRange(Double minLandArea, Double maxLandArea) {
        log.info("대지면적 범위별 단독/다가구 매매 정보 조회 - 최소: {}, 최대: {}", minLandArea, maxLandArea);
        List<DetachedHouseSale> detachedHouseSales = detachedHouseSaleRepository.findByLandAreaBetween(minLandArea, maxLandArea);
        return detachedHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DetachedHouseSaleDTO> getDetachedHouseSalesByTransactionAmountRange(Long minAmount, Long maxAmount) {
        log.info("거래금액 범위별 단독/다가구 매매 정보 조회 - 최소: {}, 최대: {}", minAmount, maxAmount);
        List<DetachedHouseSale> detachedHouseSales = detachedHouseSaleRepository.findByTransactionAmountBetween(minAmount, maxAmount);
        return detachedHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DetachedHouseSaleDTO> getDetachedHouseSalesByConstructionYearRange(Integer minYear, Integer maxYear) {
        log.info("건축년도 범위별 단독/다가구 매매 정보 조회 - 최소: {}, 최대: {}", minYear, maxYear);
        List<DetachedHouseSale> detachedHouseSales = detachedHouseSaleRepository.findByConstructionYearBetween(minYear, maxYear);
        return detachedHouseSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    // Entity를 DTO로 변환
    private DetachedHouseSaleDTO entityToDTO(DetachedHouseSale detachedHouseSale) {
        return DetachedHouseSaleDTO.builder()
                .no(detachedHouseSale.getNo())
                .sigungu(detachedHouseSale.getSigungu())
                .housingType(detachedHouseSale.getHousingType())
                .roadCondition(detachedHouseSale.getRoadCondition())
                .totalArea(detachedHouseSale.getTotalArea())
                .landArea(detachedHouseSale.getLandArea())
                .contractDate(detachedHouseSale.getContractDate())
                .transactionAmount(detachedHouseSale.getTransactionAmount())
                .constructionYear(detachedHouseSale.getConstructionYear())
                .roadName(detachedHouseSale.getRoadName())
                .transactionType(detachedHouseSale.getTransactionType())
                .build();
    }
    
    // DTO를 Entity로 변환
    private DetachedHouseSale dtoToEntity(DetachedHouseSaleDTO detachedHouseSaleDTO) {
        return DetachedHouseSale.builder()
                .sigungu(detachedHouseSaleDTO.getSigungu())
                .housingType(detachedHouseSaleDTO.getHousingType())
                .roadCondition(detachedHouseSaleDTO.getRoadCondition())
                .totalArea(detachedHouseSaleDTO.getTotalArea())
                .landArea(detachedHouseSaleDTO.getLandArea())
                .contractDate(detachedHouseSaleDTO.getContractDate())
                .transactionAmount(detachedHouseSaleDTO.getTransactionAmount())
                .constructionYear(detachedHouseSaleDTO.getConstructionYear())
                .roadName(detachedHouseSaleDTO.getRoadName())
                .transactionType(detachedHouseSaleDTO.getTransactionType())
                .build();
    }
    
    // ==================== 관리자용 메서드 구현 ====================
    
    @Override
    public org.springframework.data.domain.Page<com.back.domain.DetachedHouseSale> findAll(org.springframework.data.domain.Pageable pageable) {
        return detachedHouseSaleRepository.findAll(pageable);
    }
    
    @Override
    public com.back.domain.DetachedHouseSale save(com.back.domain.DetachedHouseSale detachedHouseSale) {
        return detachedHouseSaleRepository.save(detachedHouseSale);
    }
    
    @Override
    public com.back.domain.DetachedHouseSale update(Long id, com.back.domain.DetachedHouseSale detachedHouseSale) {
        com.back.domain.DetachedHouseSale existingSale = detachedHouseSaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("단독주택 매매 정보를 찾을 수 없습니다. ID: " + id));
        
        // 기존 데이터 업데이트 (기본 필드들만)
        existingSale.setSigungu(detachedHouseSale.getSigungu());
        existingSale.setHousingType(detachedHouseSale.getHousingType());
        existingSale.setRoadCondition(detachedHouseSale.getRoadCondition());
        existingSale.setTotalArea(detachedHouseSale.getTotalArea());
        existingSale.setLandArea(detachedHouseSale.getLandArea());
        existingSale.setContractDate(detachedHouseSale.getContractDate());
        existingSale.setTransactionAmount(detachedHouseSale.getTransactionAmount());
        existingSale.setConstructionYear(detachedHouseSale.getConstructionYear());
        existingSale.setRoadName(detachedHouseSale.getRoadName());
        existingSale.setTransactionType(detachedHouseSale.getTransactionType());
        
        return detachedHouseSaleRepository.save(existingSale);
    }
    
    @Override
    public void deleteById(Long id) {
        detachedHouseSaleRepository.deleteById(id);
    }
    
    @Override
    public long count() {
        return detachedHouseSaleRepository.count();
    }
    
    @Override
    public org.springframework.data.domain.Page<com.back.domain.DetachedHouseSale> findAllOrderByNoDesc(org.springframework.data.domain.Pageable pageable) {
        // 번호 역순으로 정렬된 Pageable 생성
        org.springframework.data.domain.PageRequest sortedPageable = org.springframework.data.domain.PageRequest.of(
            pageable.getPageNumber(), 
            pageable.getPageSize(), 
            org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "no")
        );
        return detachedHouseSaleRepository.findAll(sortedPageable);
    }
} 