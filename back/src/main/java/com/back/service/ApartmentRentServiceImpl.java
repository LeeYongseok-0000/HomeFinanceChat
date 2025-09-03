package com.back.service;

import com.back.dto.ApartmentRentDTO;
import com.back.dto.ApartmentRentSearchDTO;
import com.back.domain.ApartmentRent;
import com.back.repository.ApartmentRentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class ApartmentRentServiceImpl implements ApartmentRentService {
    
    private final ApartmentRentRepository apartmentRentRepository;
    
    @Override
    public ApartmentRentDTO createApartmentRent(ApartmentRentDTO apartmentRentDTO) {
        log.info("아파트 전월세 데이터 생성 - DTO: {}", apartmentRentDTO);
        
        // DTO를 엔티티로 변환
        ApartmentRent apartmentRent = dtoToEntity(apartmentRentDTO);
        
        // 저장
        ApartmentRent savedApartmentRent = apartmentRentRepository.save(apartmentRent);
        
        log.info("아파트 전월세 데이터 생성 완료 - ID: {}", savedApartmentRent.getNo());
        
        // 저장된 엔티티를 DTO로 변환하여 반환
        return entityToDTO(savedApartmentRent);
    }
    
    @Override
    public List<ApartmentRentDTO> getAllApartmentRents() {
        List<ApartmentRent> apartmentRents = apartmentRentRepository.findAll();
        return apartmentRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public ApartmentRentDTO getApartmentRentById(Long id) {
        ApartmentRent apartmentRent = apartmentRentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("아파트 전월세 정보를 찾을 수 없습니다. ID: " + id));
        return entityToDTO(apartmentRent);
    }
    
    @Override
    public List<ApartmentRentDTO> searchApartmentRents(ApartmentRentSearchDTO searchDTO) {
        List<ApartmentRent> apartmentRents = apartmentRentRepository.searchApartments(
                searchDTO.getSigungu(),
                searchDTO.getComplexName(),
                searchDTO.getRentType(),
                searchDTO.getMinArea(),
                searchDTO.getMaxArea(),
                searchDTO.getMinFloor(),
                searchDTO.getMaxFloor(),
                searchDTO.getMinConstructionYear(),
                searchDTO.getMaxConstructionYear(),
                searchDTO.getMinDeposit(),
                searchDTO.getMaxDeposit(),
                searchDTO.getMinMonthlyRent(),
                searchDTO.getMaxMonthlyRent()
        );
        
        return apartmentRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ApartmentRentDTO> getApartmentRentsBySigungu(String sigungu) {
        List<ApartmentRent> apartmentRents = apartmentRentRepository.findBySigunguContaining(sigungu);
        return apartmentRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ApartmentRentDTO> getApartmentRentsByComplexName(String complexName) {
        List<ApartmentRent> apartmentRents = apartmentRentRepository.findByComplexNameContaining(complexName);
        return apartmentRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ApartmentRentDTO> getApartmentRentsByRentType(String rentType) {
        List<ApartmentRent> apartmentRents = apartmentRentRepository.findByRentType(rentType);
        return apartmentRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ApartmentRentDTO> getApartmentRentsByAreaRange(Double minArea, Double maxArea) {
        List<ApartmentRent> apartmentRents = apartmentRentRepository.findByExclusiveAreaBetween(minArea, maxArea);
        return apartmentRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ApartmentRentDTO> getApartmentRentsByFloorRange(Integer minFloor, Integer maxFloor) {
        List<ApartmentRent> apartmentRents = apartmentRentRepository.findByFloorBetween(minFloor, maxFloor);
        return apartmentRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ApartmentRentDTO> getApartmentRentsByConstructionYearRange(Integer minYear, Integer maxYear) {
        List<ApartmentRent> apartmentRents = apartmentRentRepository.findByConstructionYearBetween(minYear, maxYear);
        return apartmentRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ApartmentRentDTO> getApartmentRentsByDepositRange(Long minDeposit, Long maxDeposit) {
        List<ApartmentRent> apartmentRents = apartmentRentRepository.findByDepositBetween(minDeposit, maxDeposit);
        return apartmentRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ApartmentRentDTO> getApartmentRentsByMonthlyRentRange(Long minRent, Long maxRent) {
        List<ApartmentRent> apartmentRents = apartmentRentRepository.findByMonthlyRentBetween(minRent, maxRent);
        return apartmentRents.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    // Entity를 DTO로 변환하는 메서드
    private ApartmentRentDTO entityToDTO(ApartmentRent apartmentRent) {
        return ApartmentRentDTO.builder()
                .no(apartmentRent.getNo())
                .sigungu(apartmentRent.getSigungu())
                .complexName(apartmentRent.getComplexName())
                .rentType(apartmentRent.getRentType())
                .exclusiveArea(apartmentRent.getExclusiveArea())
                .contractDate(apartmentRent.getContractDate())
                .deposit(apartmentRent.getDeposit())
                .monthlyRent(apartmentRent.getMonthlyRent())
                .floor(apartmentRent.getFloor())
                .constructionYear(apartmentRent.getConstructionYear())
                .roadName(apartmentRent.getRoadName())
                .housingType(apartmentRent.getHousingType())
                .build();
    }
    
    // DTO를 Entity로 변환하는 메서드
    private ApartmentRent dtoToEntity(ApartmentRentDTO apartmentRentDTO) {
        return ApartmentRent.builder()
                .sigungu(apartmentRentDTO.getSigungu())
                .complexName(apartmentRentDTO.getComplexName())
                .rentType(apartmentRentDTO.getRentType())
                .exclusiveArea(apartmentRentDTO.getExclusiveArea())
                .contractDate(apartmentRentDTO.getContractDate())
                .deposit(apartmentRentDTO.getDeposit())
                .monthlyRent(apartmentRentDTO.getMonthlyRent())
                .floor(apartmentRentDTO.getFloor())
                .constructionYear(apartmentRentDTO.getConstructionYear())
                .roadName(apartmentRentDTO.getRoadName())
                .housingType(apartmentRentDTO.getHousingType())
                .transactionType(apartmentRentDTO.getTransactionType())
                .build();
    }
    
    // ==================== 관리자용 메서드 구현 ====================
    
    @Override
    public org.springframework.data.domain.Page<ApartmentRent> findAll(org.springframework.data.domain.Pageable pageable) {
        return apartmentRentRepository.findAll(pageable);
    }
    
    @Override
    public ApartmentRent save(ApartmentRent apartmentRent) {
        return apartmentRentRepository.save(apartmentRent);
    }
    
    @Override
    public ApartmentRent update(Long id, ApartmentRent apartmentRent) {
        ApartmentRent existingRent = apartmentRentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("아파트 전월세 정보를 찾을 수 없습니다. ID: " + id));
        
        // 기존 데이터 업데이트
        existingRent.setSigungu(apartmentRent.getSigungu());
        existingRent.setComplexName(apartmentRent.getComplexName());
        existingRent.setExclusiveArea(apartmentRent.getExclusiveArea());
        existingRent.setContractDate(apartmentRent.getContractDate());
        existingRent.setDeposit(apartmentRent.getDeposit());
        existingRent.setMonthlyRent(apartmentRent.getMonthlyRent());
        existingRent.setFloor(apartmentRent.getFloor());
        existingRent.setConstructionYear(apartmentRent.getConstructionYear());
        existingRent.setRoadName(apartmentRent.getRoadName());
        existingRent.setRentType(apartmentRent.getRentType());
        
        return apartmentRentRepository.save(existingRent);
    }
    
    @Override
    public void delete(Long id) {
        apartmentRentRepository.deleteById(id);
    }
    
    @Override
    public long count() {
        return apartmentRentRepository.count();
    }
    
    @Override
    public org.springframework.data.domain.Page<ApartmentRent> findAllOrderByIdDesc(org.springframework.data.domain.Pageable pageable) {
        // 번호 역순으로 정렬된 Pageable 생성
        org.springframework.data.domain.PageRequest sortedPageable = org.springframework.data.domain.PageRequest.of(
            pageable.getPageNumber(), 
            pageable.getPageSize(), 
            org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "no")
        );
        return apartmentRentRepository.findAll(sortedPageable);
    }
}
