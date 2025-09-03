package com.back.service;

import com.back.domain.ApartmentSale;
import com.back.dto.ApartmentSaleDTO;
import com.back.repository.ApartmentSaleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional(readOnly = true)
public class ApartmentSaleServiceImpl implements ApartmentSaleService {
    
    private final ApartmentSaleRepository apartmentSaleRepository;
    
    @Override
    public Page<ApartmentSale> findAll(Pageable pageable) {
        return apartmentSaleRepository.findAll(pageable);
    }
    
    @Override
    public ApartmentSale findById(Long id) {
        return apartmentSaleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 아파트 매매 정보를 찾을 수 없습니다: " + id));
    }
    
    @Override
    public Page<ApartmentSale> searchByCriteria(
            String sigungu,
            String complexName,
            String housingType,
            String transactionType,
            Double minArea,
            Double maxArea,
            Long minAmount,
            Long maxAmount,
            Integer minYear,
            Integer maxYear,
            Pageable pageable) {
        
        return apartmentSaleRepository.findBySearchCriteria(
                sigungu, complexName, housingType, transactionType,
                minArea, maxArea, minAmount, maxAmount, minYear, maxYear, pageable);
    }
    
    @Override
    public Page<ApartmentSale> findBySigungu(String sigungu, Pageable pageable) {
        return apartmentSaleRepository.findBySigunguContaining(sigungu, pageable);
    }
    
    @Override
    public Page<ApartmentSale> findByComplexName(String complexName, Pageable pageable) {
        return apartmentSaleRepository.findByComplexNameContaining(complexName, pageable);
    }
    
    @Override
    public Page<ApartmentSale> findByHousingType(String housingType, Pageable pageable) {
        return apartmentSaleRepository.findByHousingType(housingType, pageable);
    }
    
    @Override
    public Page<ApartmentSale> findByConstructionYearRange(Integer startYear, Integer endYear, Pageable pageable) {
        return apartmentSaleRepository.findByConstructionYearBetween(startYear, endYear, pageable);
    }
    
    @Override
    public Page<ApartmentSale> findByAreaRange(Double minArea, Double maxArea, Pageable pageable) {
        return apartmentSaleRepository.findByExclusiveAreaBetween(minArea, maxArea, pageable);
    }
    
    @Override
    public Page<ApartmentSale> findByAmountRange(Long minAmount, Long maxAmount, Pageable pageable) {
        return apartmentSaleRepository.findByTransactionAmountBetween(minAmount, maxAmount, pageable);
    }
    
    @Override
    public Page<ApartmentSale> findByContractDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return apartmentSaleRepository.findByContractDateBetween(startDate, endDate, pageable);
    }
    
    @Override
    public List<String> getDistinctSigungu() {
        return apartmentSaleRepository.findDistinctSigungu();
    }
    
    @Override
    public List<String> getDistinctHousingType() {
        return apartmentSaleRepository.findDistinctHousingType();
    }
    
    @Override
    public List<String> getDistinctTransactionType() {
        return apartmentSaleRepository.findDistinctTransactionType();
    }
    
    @Override
    @Transactional
    public ApartmentSale save(ApartmentSale apartmentSale) {
        return apartmentSaleRepository.save(apartmentSale);
    }
    
    @Override
    @Transactional
    public ApartmentSale update(Long id, ApartmentSale apartmentSale) {
        ApartmentSale existingSale = findById(id);
        
        existingSale.setSigungu(apartmentSale.getSigungu());
        existingSale.setComplexName(apartmentSale.getComplexName());
        existingSale.setExclusiveArea(apartmentSale.getExclusiveArea());
        existingSale.setContractDate(apartmentSale.getContractDate());
        existingSale.setTransactionAmount(apartmentSale.getTransactionAmount());
        existingSale.setDong(apartmentSale.getDong());
        existingSale.setFloor(apartmentSale.getFloor());
        existingSale.setConstructionYear(apartmentSale.getConstructionYear());
        existingSale.setRoadName(apartmentSale.getRoadName());
        existingSale.setHousingType(apartmentSale.getHousingType());
        existingSale.setTransactionType(apartmentSale.getTransactionType());
        
        return apartmentSaleRepository.save(existingSale);
    }
    
    @Override
    @Transactional
    public void deleteById(Long id) {
        apartmentSaleRepository.deleteById(id);
    }
    
    @Override
    public long count() {
        return apartmentSaleRepository.count();
    }
    
    @Override
    public List<Map<String, Object>> getMapData(int limit) {
        try {
            // 최근 거래 데이터를 limit만큼 가져와서 지도용으로 변환
            List<ApartmentSale> sales = apartmentSaleRepository.findTopByOrderByContractDateDesc(limit);
            
            return sales.stream().map(sale -> {
                Map<String, Object> mapData = new HashMap<>();
                mapData.put("id", sale.getNo());
                mapData.put("name", sale.getComplexName() + " " + sale.getDong());
                mapData.put("address", sale.getSigungu() + " " + sale.getRoadName());
                mapData.put("price", sale.getTransactionAmount());
                mapData.put("area", sale.getExclusiveArea());
                mapData.put("transactionType", sale.getTransactionType());
                mapData.put("floor", sale.getFloor());
                mapData.put("buildYear", sale.getConstructionYear());
                
                // 주소를 좌표로 변환 (실제로는 카카오 주소-좌표 변환 API 사용 필요)
                // 임시로 서울 지역 좌표 사용
                mapData.put("longitude", getLongitudeFromAddress(sale.getSigungu()));
                mapData.put("latitude", getLatitudeFromAddress(sale.getSigungu()));
                
                return mapData;
            }).collect(Collectors.toList());
            
        } catch (Exception e) {
            log.error("지도용 데이터 조회 실패", e);
            return List.of();
        }
    }
    
    @Override
    public List<Map<String, Object>> getFilteredMapData(
            String transactionType, 
            Double minPrice, 
            Double maxPrice, 
            Double minArea, 
            Double maxArea) {
        try {
            // 필터링 조건에 맞는 데이터 조회
            List<ApartmentSale> sales = apartmentSaleRepository.findByFilters(
                transactionType, minPrice, maxPrice, minArea, maxArea);
            
            return sales.stream().map(sale -> {
                Map<String, Object> mapData = new HashMap<>();
                mapData.put("id", sale.getNo());
                mapData.put("name", sale.getComplexName() + " " + sale.getDong());
                mapData.put("address", sale.getSigungu() + " " + sale.getRoadName());
                mapData.put("price", sale.getTransactionAmount());
                mapData.put("area", sale.getExclusiveArea());
                mapData.put("transactionType", sale.getTransactionType());
                mapData.put("floor", sale.getFloor());
                mapData.put("buildYear", sale.getConstructionYear());
                
                // 주소를 좌표로 변환
                mapData.put("longitude", getLongitudeFromAddress(sale.getSigungu()));
                mapData.put("latitude", getLatitudeFromAddress(sale.getSigungu()));
                
                return mapData;
            }).collect(Collectors.toList());
            
        } catch (Exception e) {
            log.error("필터링된 지도용 데이터 조회 실패", e);
            return List.of();
        }
    }
    
    // 주소를 좌표로 변환하는 임시 메서드 (실제로는 카카오 API 사용 필요)
    private Double getLongitudeFromAddress(String sigungu) {
        // 서울 지역 시군구별 경도 (임시 데이터)
        Map<String, Double> sigunguLongitude = new HashMap<>();
        sigunguLongitude.put("강남구", 127.028);
        sigunguLongitude.put("서초구", 127.015);
        sigunguLongitude.put("마포구", 126.914);
        sigunguLongitude.put("송파구", 127.123);
        sigunguLongitude.put("영등포구", 126.933);
        sigunguLongitude.put("종로구", 126.978);
        sigunguLongitude.put("중구", 126.997);
        sigunguLongitude.put("용산구", 126.970);
        sigunguLongitude.put("성동구", 127.036);
        sigunguLongitude.put("광진구", 127.082);
        sigunguLongitude.put("동대문구", 127.039);
        sigunguLongitude.put("중랑구", 127.094);
        sigunguLongitude.put("성북구", 127.016);
        sigunguLongitude.put("강북구", 127.027);
        sigunguLongitude.put("도봉구", 127.047);
        sigunguLongitude.put("노원구", 127.056);
        sigunguLongitude.put("은평구", 126.930);
        sigunguLongitude.put("서대문구", 126.936);
        sigunguLongitude.put("강서구", 126.850);
        sigunguLongitude.put("양천구", 126.866);
        sigunguLongitude.put("구로구", 126.886);
        sigunguLongitude.put("금천구", 126.902);
        sigunguLongitude.put("동작구", 126.939);
        sigunguLongitude.put("관악구", 126.951);
        
        return sigunguLongitude.getOrDefault(sigungu, 127.0);
    }
    
    private Double getLatitudeFromAddress(String sigungu) {
        // 서울 지역 시군구별 위도 (임시 데이터)
        Map<String, Double> sigunguLatitude = new HashMap<>();
        sigunguLatitude.put("강남구", 37.497);
        sigunguLatitude.put("서초구", 37.483);
        sigunguLatitude.put("마포구", 37.549);
        sigunguLatitude.put("송파구", 37.478);
        sigunguLatitude.put("영등포구", 37.521);
        sigunguLatitude.put("종로구", 37.566);
        sigunguLatitude.put("중구", 37.564);
        sigunguLatitude.put("용산구", 37.538);
        sigunguLatitude.put("성동구", 37.551);
        sigunguLatitude.put("광진구", 37.538);
        sigunguLatitude.put("동대문구", 37.574);
        sigunguLatitude.put("중랑구", 37.606);
        sigunguLatitude.put("성북구", 37.589);
        sigunguLatitude.put("강북구", 37.640);
        sigunguLatitude.put("도봉구", 37.668);
        sigunguLatitude.put("노원구", 37.654);
        sigunguLatitude.put("은평구", 37.602);
        sigunguLatitude.put("서대문구", 37.579);
        sigunguLatitude.put("강서구", 37.551);
        sigunguLatitude.put("양천구", 37.527);
        sigunguLatitude.put("구로구", 37.501);
        sigunguLatitude.put("금천구", 37.456);
        sigunguLatitude.put("동작구", 37.512);
        sigunguLatitude.put("관악구", 37.478);
        
        return sigunguLatitude.getOrDefault(sigungu, 37.5);
    }
    
    @Override
    public Map<String, Object> getMapDataWithPagination(Pageable pageable, int limit) {
        try {
            // 페이징된 데이터 조회
            Page<ApartmentSale> salesPage = apartmentSaleRepository.findAll(pageable);
            
            // 페이징 정보 포함하여 반환
            Map<String, Object> result = new HashMap<>();
            result.put("content", salesPage.getContent().stream().map(sale -> {
                Map<String, Object> mapData = new HashMap<>();
                mapData.put("id", sale.getNo());
                mapData.put("name", sale.getComplexName() + " " + sale.getDong());
                mapData.put("address", sale.getSigungu() + " " + sale.getRoadName());
                mapData.put("price", sale.getTransactionAmount());
                mapData.put("area", sale.getExclusiveArea());
                mapData.put("transactionType", sale.getTransactionType());
                mapData.put("floor", sale.getFloor());
                mapData.put("buildYear", sale.getConstructionYear());
                mapData.put("longitude", getLongitudeFromAddress(sale.getSigungu()));
                mapData.put("latitude", getLatitudeFromAddress(sale.getSigungu()));
                return mapData;
            }).collect(Collectors.toList()));
            
            result.put("totalPages", salesPage.getTotalPages());
            result.put("totalElements", salesPage.getTotalElements());
            result.put("currentPage", salesPage.getNumber());
            result.put("size", salesPage.getSize());
            
            return result;
            
        } catch (Exception e) {
            log.error("페이징된 지도용 데이터 조회 실패", e);
            return new HashMap<>();
        }
    }
    
    @Override
    public Map<String, Object> getFilteredMapDataWithPagination(
            String transactionType, 
            Double minPrice, 
            Double maxPrice, 
            Double minArea, 
            Double maxArea,
            Pageable pageable) {
        try {
            // 필터링된 데이터 조회
            List<ApartmentSale> sales = apartmentSaleRepository.findByFilters(
                transactionType, minPrice, maxPrice, minArea, maxArea);
            
            // 페이징 처리
            int totalElements = sales.size();
            int totalPages = (int) Math.ceil((double) totalElements / pageable.getPageSize());
            int startIndex = (int) pageable.getOffset();
            int endIndex = Math.min(startIndex + pageable.getPageSize(), totalElements);
            
            List<ApartmentSale> pagedSales = sales.subList(startIndex, endIndex);
            
            // 페이징 정보 포함하여 반환
            Map<String, Object> result = new HashMap<>();
            result.put("content", pagedSales.stream().map(sale -> {
                Map<String, Object> mapData = new HashMap<>();
                mapData.put("id", sale.getNo());
                mapData.put("name", sale.getComplexName() + " " + sale.getDong());
                mapData.put("address", sale.getSigungu() + " " + sale.getRoadName());
                mapData.put("price", sale.getTransactionAmount());
                mapData.put("area", sale.getExclusiveArea());
                mapData.put("transactionType", sale.getTransactionType());
                mapData.put("floor", sale.getFloor());
                mapData.put("buildYear", sale.getConstructionYear());
                mapData.put("longitude", getLongitudeFromAddress(sale.getSigungu()));
                mapData.put("latitude", getLatitudeFromAddress(sale.getSigungu()));
                return mapData;
            }).collect(Collectors.toList()));
            
            result.put("totalPages", totalPages);
            result.put("totalElements", totalElements);
            result.put("currentPage", pageable.getPageNumber());
            result.put("size", pageable.getPageSize());
            
            return result;
            
        } catch (Exception e) {
            log.error("페이징된 필터링 지도용 데이터 조회 실패", e);
            return new HashMap<>();
        }
    }
    
    @Override
    @Transactional
    public ApartmentSaleDTO createApartmentSale(ApartmentSaleDTO apartmentSaleDTO) {
        log.info("아파트 매매 데이터 생성 - DTO: {}", apartmentSaleDTO);
        
        // DTO를 엔티티로 변환
        ApartmentSale apartmentSale = dtoToEntity(apartmentSaleDTO);
        
        // 저장
        ApartmentSale savedApartmentSale = apartmentSaleRepository.save(apartmentSale);
        
        log.info("아파트 매매 데이터 생성 완료 - ID: {}", savedApartmentSale.getNo());
        
        // 저장된 엔티티를 DTO로 변환하여 반환
        return entityToDTO(savedApartmentSale);
    }
    
    // DTO를 Entity로 변환하는 메서드
    private ApartmentSale dtoToEntity(ApartmentSaleDTO apartmentSaleDTO) {
        return ApartmentSale.builder()
                .sigungu(apartmentSaleDTO.getSigungu())
                .complexName(apartmentSaleDTO.getComplexName())
                .exclusiveArea(apartmentSaleDTO.getExclusiveArea())
                .contractDate(apartmentSaleDTO.getContractDate())
                .transactionAmount(apartmentSaleDTO.getTransactionAmount())
                .dong(apartmentSaleDTO.getDong())
                .floor(apartmentSaleDTO.getFloor())
                .constructionYear(apartmentSaleDTO.getConstructionYear())
                .roadName(apartmentSaleDTO.getRoadName())
                .housingType(apartmentSaleDTO.getHousingType())
                .transactionType(apartmentSaleDTO.getTransactionType())
                .build();
    }
    
    // Entity를 DTO로 변환하는 메서드
    private ApartmentSaleDTO entityToDTO(ApartmentSale apartmentSale) {
        return ApartmentSaleDTO.builder()
                .no(apartmentSale.getNo())
                .sigungu(apartmentSale.getSigungu())
                .complexName(apartmentSale.getComplexName())
                .exclusiveArea(apartmentSale.getExclusiveArea())
                .contractDate(apartmentSale.getContractDate())
                .transactionAmount(apartmentSale.getTransactionAmount())
                .dong(apartmentSale.getDong())
                .floor(apartmentSale.getFloor())
                .constructionYear(apartmentSale.getConstructionYear())
                .roadName(apartmentSale.getRoadName())
                .housingType(apartmentSale.getHousingType())
                .transactionType(apartmentSale.getTransactionType())
                .build();
    }
    
    @Override
    public Page<ApartmentSale> findAllOrderByNoDesc(Pageable pageable) {
        // 번호 역순으로 정렬된 Pageable 생성
        org.springframework.data.domain.PageRequest sortedPageable = org.springframework.data.domain.PageRequest.of(
            pageable.getPageNumber(), 
            pageable.getPageSize(), 
            org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "no")
        );
        return apartmentSaleRepository.findAll(sortedPageable);
    }
}
