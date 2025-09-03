package com.back.service;

import com.back.domain.DetachedHouseRent;
import com.back.dto.DetachedHouseRentDTO;
import com.back.dto.DetachedHouseRentSearchDTO;
import com.back.repository.DetachedHouseRentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class DetachedHouseRentServiceImpl implements DetachedHouseRentService {
    
    private final DetachedHouseRentRepository detachedHouseRentRepository;
    
    @Override
    public DetachedHouseRentDTO createDetachedHouseRent(DetachedHouseRentDTO detachedHouseRentDTO) {
        log.info("단독주택 전월세 데이터 생성 - DTO: {}", detachedHouseRentDTO);
        
        // DTO를 엔티티로 변환
        DetachedHouseRent detachedHouseRent = dtoToEntity(detachedHouseRentDTO);
        
        // 저장
        DetachedHouseRent savedDetachedHouseRent = detachedHouseRentRepository.save(detachedHouseRent);
        
        log.info("단독주택 전월세 데이터 생성 완료 - ID: {}", savedDetachedHouseRent.getNo());
        
        // 저장된 엔티티를 DTO로 변환하여 반환
        return entityToDTO(savedDetachedHouseRent);
    }
    
    @Override
    public List<DetachedHouseRentDTO> getAllDetachedHouseRents() {
        log.info("모든 단독/다가구 전/월세 정보 조회");
        List<DetachedHouseRent> detachedHouseRents = detachedHouseRentRepository.findAll();
        return detachedHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public DetachedHouseRentDTO getDetachedHouseRentById(Long id) {
        log.info("ID별 단독/다가구 전/월세 정보 조회 - ID: {}", id);
        DetachedHouseRent detachedHouseRent = detachedHouseRentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("단독/다가구 전/월세 정보를 찾을 수 없습니다. ID: " + id));
        return entityToDTO(detachedHouseRent);
    }
    
    @Override
    public List<DetachedHouseRentDTO> searchDetachedHouseRents(DetachedHouseRentSearchDTO searchDTO) {
        log.info("단독/다가구 전/월세 검색 - 조건: {}", searchDTO);
        
        List<DetachedHouseRent> detachedHouseRents = detachedHouseRentRepository.searchByCriteria(
                searchDTO.getSigungu(),
                searchDTO.getHousingType(),
                searchDTO.getRoadCondition(),
                searchDTO.getRentType(),
                searchDTO.getMinContractArea(),
                searchDTO.getMaxContractArea(),
                searchDTO.getMinDeposit(),
                searchDTO.getMaxDeposit(),
                searchDTO.getMinMonthlyRent(),
                searchDTO.getMaxMonthlyRent(),
                searchDTO.getMinConstructionYear(),
                searchDTO.getMaxConstructionYear()
        );
        
        return detachedHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DetachedHouseRentDTO> getDetachedHouseRentsBySigungu(String sigungu) {
        log.info("시군구별 단독/다가구 전/월세 정보 조회 - 시군구: {}", sigungu);
        List<DetachedHouseRent> detachedHouseRents = detachedHouseRentRepository.findBySigunguContaining(sigungu);
        return detachedHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DetachedHouseRentDTO> getDetachedHouseRentsByHousingType(String housingType) {
        log.info("주택유형별 단독/다가구 전/월세 정보 조회 - 주택유형: {}", housingType);
        List<DetachedHouseRent> detachedHouseRents = detachedHouseRentRepository.findByHousingType(housingType);
        return detachedHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DetachedHouseRentDTO> getDetachedHouseRentsByRoadCondition(String roadCondition) {
        log.info("도로조건별 단독/다가구 전/월세 정보 조회 - 도로조건: {}", roadCondition);
        List<DetachedHouseRent> detachedHouseRents = detachedHouseRentRepository.findByRoadCondition(roadCondition);
        return detachedHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DetachedHouseRentDTO> getDetachedHouseRentsByRentType(String rentType) {
        log.info("전월세구분별 단독/다가구 전/월세 정보 조회 - 전월세구분: {}", rentType);
        List<DetachedHouseRent> detachedHouseRents = detachedHouseRentRepository.findByRentType(rentType);
        return detachedHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DetachedHouseRentDTO> getDetachedHouseRentsByContractAreaRange(Double minContractArea, Double maxContractArea) {
        log.info("계약면적 범위별 단독/다가구 전/월세 정보 조회 - 최소: {}, 최대: {}", minContractArea, maxContractArea);
        List<DetachedHouseRent> detachedHouseRents = detachedHouseRentRepository.findByContractAreaBetween(minContractArea, maxContractArea);
        return detachedHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DetachedHouseRentDTO> getDetachedHouseRentsByDepositRange(Long minDeposit, Long maxDeposit) {
        log.info("보증금 범위별 단독/다가구 전/월세 정보 조회 - 최소: {}, 최대: {}", minDeposit, maxDeposit);
        List<DetachedHouseRent> detachedHouseRents = detachedHouseRentRepository.findByDepositBetween(minDeposit, maxDeposit);
        return detachedHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DetachedHouseRentDTO> getDetachedHouseRentsByMonthlyRentRange(Long minMonthlyRent, Long maxMonthlyRent) {
        log.info("월세 범위별 단독/다가구 전/월세 정보 조회 - 최소: {}, 최대: {}", minMonthlyRent, maxMonthlyRent);
        List<DetachedHouseRent> detachedHouseRents = detachedHouseRentRepository.findByMonthlyRentBetween(minMonthlyRent, maxMonthlyRent);
        return detachedHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<DetachedHouseRentDTO> getDetachedHouseRentsByConstructionYearRange(Integer minYear, Integer maxYear) {
        log.info("건축년도 범위별 단독/다가구 전/월세 정보 조회 - 최소: {}, 최대: {}", minYear, maxYear);
        List<DetachedHouseRent> detachedHouseRents = detachedHouseRentRepository.findByConstructionYearBetween(minYear, maxYear);
        return detachedHouseRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    // Entity를 DTO로 변환
    private DetachedHouseRentDTO entityToDTO(DetachedHouseRent detachedHouseRent) {
        return DetachedHouseRentDTO.builder()
                .no(detachedHouseRent.getNo())
                .sigungu(detachedHouseRent.getSigungu())
                .roadCondition(detachedHouseRent.getRoadCondition())
                .contractArea(detachedHouseRent.getContractArea())
                .rentType(detachedHouseRent.getRentType())
                .contractDate(detachedHouseRent.getContractDate())
                .deposit(detachedHouseRent.getDeposit())
                .monthlyRent(detachedHouseRent.getMonthlyRent())
                .constructionYear(detachedHouseRent.getConstructionYear())
                .roadName(detachedHouseRent.getRoadName())
                .housingType(detachedHouseRent.getHousingType())
                .transactionType(detachedHouseRent.getTransactionType())
                .build();
    }

    // DTO를 Entity로 변환
    private DetachedHouseRent dtoToEntity(DetachedHouseRentDTO detachedHouseRentDTO) {
        return DetachedHouseRent.builder()
                .sigungu(detachedHouseRentDTO.getSigungu())
                .roadCondition(detachedHouseRentDTO.getRoadCondition())
                .contractArea(detachedHouseRentDTO.getContractArea())
                .rentType(detachedHouseRentDTO.getRentType())
                .contractDate(detachedHouseRentDTO.getContractDate())
                .deposit(detachedHouseRentDTO.getDeposit())
                .monthlyRent(detachedHouseRentDTO.getMonthlyRent())
                .constructionYear(detachedHouseRentDTO.getConstructionYear())
                .roadName(detachedHouseRentDTO.getRoadName())
                .housingType(detachedHouseRentDTO.getHousingType())
                .transactionType(detachedHouseRentDTO.getTransactionType())
                .build();
    }
    
    // ==================== 관리자용 메서드 구현 ====================
    
    @Override
    public org.springframework.data.domain.Page<com.back.domain.DetachedHouseRent> findAll(org.springframework.data.domain.Pageable pageable) {
        return detachedHouseRentRepository.findAll(pageable);
    }
    
    @Override
    public com.back.domain.DetachedHouseRent save(com.back.domain.DetachedHouseRent detachedHouseRent) {
        return detachedHouseRentRepository.save(detachedHouseRent);
    }
    
    @Override
    public com.back.domain.DetachedHouseRent update(Long id, com.back.domain.DetachedHouseRent detachedHouseRent) {
        com.back.domain.DetachedHouseRent existingRent = detachedHouseRentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("단독주택 전월세 정보를 찾을 수 없습니다. ID: " + id));
        
        // 기존 데이터 업데이트 (기본 필드들만)
        existingRent.setSigungu(detachedHouseRent.getSigungu());
        existingRent.setHousingType(detachedHouseRent.getHousingType());
        existingRent.setRoadCondition(detachedHouseRent.getRoadCondition());
        existingRent.setContractArea(detachedHouseRent.getContractArea());
        existingRent.setRentType(detachedHouseRent.getRentType());
        existingRent.setContractDate(detachedHouseRent.getContractDate());
        existingRent.setDeposit(detachedHouseRent.getDeposit());
        existingRent.setMonthlyRent(detachedHouseRent.getMonthlyRent());
        existingRent.setConstructionYear(detachedHouseRent.getConstructionYear());
        existingRent.setRoadName(detachedHouseRent.getRoadName());
        existingRent.setTransactionType(detachedHouseRent.getTransactionType());
        
        return detachedHouseRentRepository.save(existingRent);
    }
    
    @Override
    public void delete(Long id) {
        detachedHouseRentRepository.deleteById(id);
    }
    
    @Override
    public long count() {
        return detachedHouseRentRepository.count();
    }
    
    @Override
    public org.springframework.data.domain.Page<com.back.domain.DetachedHouseRent> findAllOrderByNoDesc(org.springframework.data.domain.Pageable pageable) {
        // 번호 역순으로 정렬된 Pageable 생성
        org.springframework.data.domain.PageRequest sortedPageable = org.springframework.data.domain.PageRequest.of(
            pageable.getPageNumber(), 
            pageable.getPageSize(), 
            org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "no")
        );
        return detachedHouseRentRepository.findAll(sortedPageable);
    }
} 