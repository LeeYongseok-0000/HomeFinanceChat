package com.back.service;

import com.back.domain.OfficeTelSale;
import com.back.dto.OfficeTelSaleDTO;
import com.back.dto.OfficeTelSaleSearchDTO;
import com.back.repository.OfficeTelSaleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class OfficeTelSaleServiceImpl implements OfficeTelSaleService {
    
    private final OfficeTelSaleRepository officeTelSaleRepository;
    
    @Override
    public OfficeTelSaleDTO createOfficeTelSale(OfficeTelSaleDTO officeTelSaleDTO) {
        log.info("오피스텔 매매 데이터 생성 - DTO: {}", officeTelSaleDTO);
        
        // DTO를 엔티티로 변환
        OfficeTelSale officeTelSale = dtoToEntity(officeTelSaleDTO);
        
        // 저장
        OfficeTelSale savedOfficeTelSale = officeTelSaleRepository.save(officeTelSale);
        
        log.info("오피스텔 매매 데이터 생성 완료 - ID: {}", savedOfficeTelSale.getNo());
        
        // 저장된 엔티티를 DTO로 변환하여 반환
        return entityToDTO(savedOfficeTelSale);
    }
    
    @Override
    public List<OfficeTelSaleDTO> getAllOfficeTelSales() {
        log.info("모든 오피스텔 매매 정보 조회");
        List<OfficeTelSale> officeTelSales = officeTelSaleRepository.findAll();
        return officeTelSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public OfficeTelSaleDTO getOfficeTelSaleById(Long id) {
        log.info("오피스텔 매매 정보 조회 - ID: {}", id);
        OfficeTelSale officeTelSale = officeTelSaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("오피스텔 매매 정보를 찾을 수 없습니다. ID: " + id));
        return entityToDTO(officeTelSale);
    }
    
    @Override
    public List<OfficeTelSaleDTO> searchOfficeTelSales(OfficeTelSaleSearchDTO searchDTO) {
        log.info("오피스텔 매매 검색 - 조건: {}", searchDTO);
        
        List<OfficeTelSale> officeTelSales = officeTelSaleRepository.searchByCriteria(
                searchDTO.getSigungu(),
                searchDTO.getComplexName(),
                searchDTO.getMinArea(),
                searchDTO.getMaxArea(),
                searchDTO.getMinAmount(),
                searchDTO.getMaxAmount(),
                searchDTO.getMinFloor(),
                searchDTO.getMaxFloor(),
                searchDTO.getMinConstructionYear(),
                searchDTO.getMaxConstructionYear()
        );
        
        return officeTelSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<OfficeTelSaleDTO> getOfficeTelSalesBySigungu(String sigungu) {
        log.info("시군구별 오피스텔 매매 정보 조회 - 시군구: {}", sigungu);
        List<OfficeTelSale> officeTelSales = officeTelSaleRepository.findBySigunguContaining(sigungu);
        return officeTelSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<OfficeTelSaleDTO> getOfficeTelSalesByComplexName(String complexName) {
        log.info("단지명별 오피스텔 매매 정보 조회 - 단지명: {}", complexName);
        List<OfficeTelSale> officeTelSales = officeTelSaleRepository.findByComplexNameContaining(complexName);
        return officeTelSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<OfficeTelSaleDTO> getOfficeTelSalesByAreaRange(Double minArea, Double maxArea) {
        log.info("전용면적 범위별 오피스텔 매매 정보 조회 - 최소: {}, 최대: {}", minArea, maxArea);
        List<OfficeTelSale> officeTelSales = officeTelSaleRepository.findByExclusiveAreaBetween(minArea, maxArea);
        return officeTelSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<OfficeTelSaleDTO> getOfficeTelSalesByFloorRange(Integer minFloor, Integer maxFloor) {
        log.info("층 범위별 오피스텔 매매 정보 조회 - 최소: {}, 최대: {}", minFloor, maxFloor);
        List<OfficeTelSale> officeTelSales = officeTelSaleRepository.findByFloorBetween(minFloor, maxFloor);
        return officeTelSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<OfficeTelSaleDTO> getOfficeTelSalesByConstructionYearRange(Integer minYear, Integer maxYear) {
        log.info("건축년도 범위별 오피스텔 매매 정보 조회 - 최소: {}, 최대: {}", minYear, maxYear);
        List<OfficeTelSale> officeTelSales = officeTelSaleRepository.findByConstructionYearBetween(minYear, maxYear);
        return officeTelSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<OfficeTelSaleDTO> getOfficeTelSalesByTransactionAmountRange(Long minAmount, Long maxAmount) {
        log.info("거래금액 범위별 오피스텔 매매 정보 조회 - 최소: {}, 최대: {}", minAmount, maxAmount);
        List<OfficeTelSale> officeTelSales = officeTelSaleRepository.findByTransactionAmountBetween(minAmount, maxAmount);
        return officeTelSales.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    // Entity를 DTO로 변환하는 메서드
    private OfficeTelSaleDTO entityToDTO(OfficeTelSale officeTelSale) {
        return OfficeTelSaleDTO.builder()
                .no(officeTelSale.getNo())
                .sigungu(officeTelSale.getSigungu())
                .complexName(officeTelSale.getComplexName())
                .exclusiveArea(officeTelSale.getExclusiveArea())
                .contractDate(officeTelSale.getContractDate())
                .transactionAmount(officeTelSale.getTransactionAmount())
                .floor(officeTelSale.getFloor())
                .constructionYear(officeTelSale.getConstructionYear())
                .roadName(officeTelSale.getRoadName())
                .transactionType(officeTelSale.getTransactionType())
                .housingType(officeTelSale.getHousingType())
                .build();
    }
    
    // DTO를 Entity로 변환하는 메서드
    private OfficeTelSale dtoToEntity(OfficeTelSaleDTO officeTelSaleDTO) {
        return OfficeTelSale.builder()
                .sigungu(officeTelSaleDTO.getSigungu())
                .complexName(officeTelSaleDTO.getComplexName())
                .exclusiveArea(officeTelSaleDTO.getExclusiveArea())
                .contractDate(officeTelSaleDTO.getContractDate())
                .transactionAmount(officeTelSaleDTO.getTransactionAmount())
                .floor(officeTelSaleDTO.getFloor())
                .constructionYear(officeTelSaleDTO.getConstructionYear())
                .roadName(officeTelSaleDTO.getRoadName())
                .transactionType(officeTelSaleDTO.getTransactionType())
                .housingType(officeTelSaleDTO.getHousingType())
                .build();
    }
    
    // ==================== 관리자용 메서드 구현 ====================
    
    @Override
    public org.springframework.data.domain.Page<com.back.domain.OfficeTelSale> findAll(org.springframework.data.domain.Pageable pageable) {
        return officeTelSaleRepository.findAll(pageable);
    }
    
    @Override
    public com.back.domain.OfficeTelSale save(com.back.domain.OfficeTelSale officeTelSale) {
        return officeTelSaleRepository.save(officeTelSale);
    }
    
    @Override
    public com.back.domain.OfficeTelSale update(Long id, com.back.domain.OfficeTelSale officeTelSale) {
        com.back.domain.OfficeTelSale existingSale = officeTelSaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("오피스텔 매매 정보를 찾을 수 없습니다. ID: " + id));
        
        // 기존 데이터 업데이트 (기본 필드들만)
        existingSale.setSigungu(officeTelSale.getSigungu());
        existingSale.setComplexName(officeTelSale.getComplexName());
        existingSale.setExclusiveArea(officeTelSale.getExclusiveArea());
        existingSale.setContractDate(officeTelSale.getContractDate());
        existingSale.setTransactionAmount(officeTelSale.getTransactionAmount());
        existingSale.setFloor(officeTelSale.getFloor());
        existingSale.setConstructionYear(officeTelSale.getConstructionYear());
        existingSale.setRoadName(officeTelSale.getRoadName());
        existingSale.setHousingType(officeTelSale.getHousingType());
        existingSale.setTransactionType(officeTelSale.getTransactionType());
        
        return officeTelSaleRepository.save(existingSale);
    }
    
    @Override
    public void deleteById(Long id) {
        officeTelSaleRepository.deleteById(id);
    }
    
    @Override
    public long count() {
        return officeTelSaleRepository.count();
    }
    
    @Override
    public org.springframework.data.domain.Page<com.back.domain.OfficeTelSale> findAllOrderByNoDesc(org.springframework.data.domain.Pageable pageable) {
        // 번호 역순으로 정렬된 Pageable 생성
        org.springframework.data.domain.PageRequest sortedPageable = org.springframework.data.domain.PageRequest.of(
            pageable.getPageNumber(), 
            pageable.getPageSize(), 
            org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "no")
        );
        return officeTelSaleRepository.findAll(sortedPageable);
    }
} 