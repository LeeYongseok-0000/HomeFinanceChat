package com.back.service;

import com.back.domain.OfficeTelRent;
import com.back.dto.OfficeTelRentDTO;
import com.back.dto.OfficeTelRentSearchDTO;
import com.back.repository.OfficeTelRentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class OfficeTelRentServiceImpl implements OfficeTelRentService {
    
    private final OfficeTelRentRepository officeTelRentRepository;
    
    @Override
    public OfficeTelRentDTO createOfficeTelRent(OfficeTelRentDTO officeTelRentDTO) {
        log.info("오피스텔 전월세 데이터 생성 - DTO: {}", officeTelRentDTO);
        
        // DTO를 엔티티로 변환
        OfficeTelRent officeTelRent = dtoToEntity(officeTelRentDTO);
        
        // 저장
        OfficeTelRent savedOfficeTelRent = officeTelRentRepository.save(officeTelRent);
        
        log.info("오피스텔 전월세 데이터 생성 완료 - ID: {}", savedOfficeTelRent.getNo());
        
        // 저장된 엔티티를 DTO로 변환하여 반환
        return entityToDTO(savedOfficeTelRent);
    }
    
    @Override
    public List<OfficeTelRentDTO> getAllOfficeTelRents() {
        log.info("모든 오피스텔 전/월세 정보 조회");
        List<OfficeTelRent> officeTelRents = officeTelRentRepository.findAll();
        return officeTelRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public OfficeTelRentDTO getOfficeTelRentById(Long id) {
        log.info("ID별 오피스텔 전/월세 정보 조회 - ID: {}", id);
        OfficeTelRent officeTelRent = officeTelRentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("오피스텔 전/월세 정보를 찾을 수 없습니다. ID: " + id));
        return entityToDTO(officeTelRent);
    }
    
    @Override
    public List<OfficeTelRentDTO> searchOfficeTelRents(OfficeTelRentSearchDTO searchDTO) {
        log.info("오피스텔 전/월세 검색 - 조건: {}", searchDTO);
        
        List<OfficeTelRent> officeTelRents = officeTelRentRepository.searchByCriteria(
                searchDTO.getSigungu(),
                searchDTO.getComplexName(),
                searchDTO.getRentType(),
                searchDTO.getMinArea(),
                searchDTO.getMaxArea(),
                searchDTO.getMinDeposit(),
                searchDTO.getMaxDeposit(),
                searchDTO.getMinMonthlyRent(),
                searchDTO.getMaxMonthlyRent(),
                searchDTO.getMinFloor(),
                searchDTO.getMaxFloor(),
                searchDTO.getMinConstructionYear(),
                searchDTO.getMaxConstructionYear()
        );
        
        return officeTelRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<OfficeTelRentDTO> getOfficeTelRentsBySigungu(String sigungu) {
        log.info("시군구별 오피스텔 전/월세 정보 조회 - 시군구: {}", sigungu);
        List<OfficeTelRent> officeTelRents = officeTelRentRepository.findBySigunguContaining(sigungu);
        return officeTelRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<OfficeTelRentDTO> getOfficeTelRentsByComplexName(String complexName) {
        log.info("단지명별 오피스텔 전/월세 정보 조회 - 단지명: {}", complexName);
        List<OfficeTelRent> officeTelRents = officeTelRentRepository.findByComplexNameContaining(complexName);
        return officeTelRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<OfficeTelRentDTO> getOfficeTelRentsByRentType(String rentType) {
        log.info("전월세구분별 오피스텔 전/월세 정보 조회 - 전월세구분: {}", rentType);
        List<OfficeTelRent> officeTelRents = officeTelRentRepository.findByRentType(rentType);
        return officeTelRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<OfficeTelRentDTO> getOfficeTelRentsByAreaRange(Double minArea, Double maxArea) {
        log.info("전용면적 범위별 오피스텔 전/월세 정보 조회 - 최소: {}, 최대: {}", minArea, maxArea);
        List<OfficeTelRent> officeTelRents = officeTelRentRepository.findByExclusiveAreaBetween(minArea, maxArea);
        return officeTelRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<OfficeTelRentDTO> getOfficeTelRentsByDepositRange(Long minDeposit, Long maxDeposit) {
        log.info("보증금 범위별 오피스텔 전/월세 정보 조회 - 최소: {}, 최대: {}", minDeposit, maxDeposit);
        List<OfficeTelRent> officeTelRents = officeTelRentRepository.findByDepositBetween(minDeposit, maxDeposit);
        return officeTelRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<OfficeTelRentDTO> getOfficeTelRentsByMonthlyRentRange(Long minMonthlyRent, Long maxMonthlyRent) {
        log.info("월세 범위별 오피스텔 전/월세 정보 조회 - 최소: {}, 최대: {}", minMonthlyRent, maxMonthlyRent);
        List<OfficeTelRent> officeTelRents = officeTelRentRepository.findByMonthlyRentBetween(minMonthlyRent, maxMonthlyRent);
        return officeTelRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<OfficeTelRentDTO> getOfficeTelRentsByFloorRange(Integer minFloor, Integer maxFloor) {
        log.info("층 범위별 오피스텔 전/월세 정보 조회 - 최소: {}, 최대: {}", minFloor, maxFloor);
        List<OfficeTelRent> officeTelRents = officeTelRentRepository.findByFloorBetween(minFloor, maxFloor);
        return officeTelRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<OfficeTelRentDTO> getOfficeTelRentsByConstructionYearRange(Integer minYear, Integer maxYear) {
        log.info("건축년도 범위별 오피스텔 전/월세 정보 조회 - 최소: {}, 최대: {}", minYear, maxYear);
        List<OfficeTelRent> officeTelRents = officeTelRentRepository.findByConstructionYearBetween(minYear, maxYear);
        return officeTelRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    // Entity를 DTO로 변환
    private OfficeTelRentDTO entityToDTO(OfficeTelRent officeTelRent) {
        return OfficeTelRentDTO.builder()
                .no(officeTelRent.getNo())
                .sigungu(officeTelRent.getSigungu())
                .complexName(officeTelRent.getComplexName())
                .rentType(officeTelRent.getRentType())
                .exclusiveArea(officeTelRent.getExclusiveArea())
                .contractDate(officeTelRent.getContractDate())
                .deposit(officeTelRent.getDeposit())
                .monthlyRent(officeTelRent.getMonthlyRent())
                .floor(officeTelRent.getFloor())
                .constructionYear(officeTelRent.getConstructionYear())
                .roadName(officeTelRent.getRoadName())
                .transactionType(officeTelRent.getTransactionType())
                .housingType(officeTelRent.getHousingType())
                .build();
    }
    
    // DTO를 Entity로 변환
    private OfficeTelRent dtoToEntity(OfficeTelRentDTO officeTelRentDTO) {
        return OfficeTelRent.builder()
                .sigungu(officeTelRentDTO.getSigungu())
                .complexName(officeTelRentDTO.getComplexName())
                .rentType(officeTelRentDTO.getRentType())
                .exclusiveArea(officeTelRentDTO.getExclusiveArea())
                .contractDate(officeTelRentDTO.getContractDate())
                .deposit(officeTelRentDTO.getDeposit())
                .monthlyRent(officeTelRentDTO.getMonthlyRent())
                .floor(officeTelRentDTO.getFloor())
                .constructionYear(officeTelRentDTO.getConstructionYear())
                .roadName(officeTelRentDTO.getRoadName())
                .transactionType(officeTelRentDTO.getTransactionType())
                .housingType(officeTelRentDTO.getHousingType())
                .build();
    }
    
    // ==================== 관리자용 메서드 구현 ====================
    
    @Override
    public org.springframework.data.domain.Page<com.back.domain.OfficeTelRent> findAll(org.springframework.data.domain.Pageable pageable) {
        return officeTelRentRepository.findAll(pageable);
    }
    
    @Override
    public com.back.domain.OfficeTelRent save(com.back.domain.OfficeTelRent officeTelRent) {
        return officeTelRentRepository.save(officeTelRent);
    }
    
    @Override
    public com.back.domain.OfficeTelRent update(Long id, com.back.domain.OfficeTelRent officeTelRent) {
        com.back.domain.OfficeTelRent existingRent = officeTelRentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("오피스텔 전월세 정보를 찾을 수 없습니다. ID: " + id));
        
        // 기존 데이터 업데이트 (기본 필드들만)
        existingRent.setSigungu(officeTelRent.getSigungu());
        existingRent.setComplexName(officeTelRent.getComplexName());
        existingRent.setExclusiveArea(officeTelRent.getExclusiveArea());
        existingRent.setContractDate(officeTelRent.getContractDate());
        existingRent.setDeposit(officeTelRent.getDeposit());
        existingRent.setMonthlyRent(officeTelRent.getMonthlyRent());
        existingRent.setFloor(officeTelRent.getFloor());
        existingRent.setConstructionYear(officeTelRent.getConstructionYear());
        existingRent.setRoadName(officeTelRent.getRoadName());
        existingRent.setHousingType(officeTelRent.getHousingType());
        existingRent.setTransactionType(officeTelRent.getTransactionType());
        
        return officeTelRentRepository.save(existingRent);
    }
    
    @Override
    public void delete(Long id) {
        officeTelRentRepository.deleteById(id);
    }
    
    @Override
    public long count() {
        return officeTelRentRepository.count();
    }
    
    @Override
    public org.springframework.data.domain.Page<com.back.domain.OfficeTelRent> findAllOrderByNoDesc(org.springframework.data.domain.Pageable pageable) {
        // 번호 역순으로 정렬된 Pageable 생성
        org.springframework.data.domain.PageRequest sortedPageable = org.springframework.data.domain.PageRequest.of(
            pageable.getPageNumber(), 
            pageable.getPageSize(), 
            org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "no")
        );
        return officeTelRentRepository.findAll(sortedPageable);
    }
} 