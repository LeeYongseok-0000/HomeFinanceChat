package com.back.controller;

import com.back.dto.ApartmentRentDTO;
import com.back.dto.ApartmentRentSearchDTO;
import com.back.service.ApartmentRentService;
import com.back.service.SearchStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/apartment-rent")
@RequiredArgsConstructor
@Log4j2
public class ApartmentRentController {
    
    private final ApartmentRentService apartmentRentService;
    private final SearchStatisticsService searchStatisticsService;
    
    // 아파트 전월세 데이터 생성
    @PostMapping
    public ResponseEntity<ApartmentRentDTO> createApartmentRent(@RequestBody ApartmentRentDTO apartmentRentDTO) {
        log.info("아파트 전월세 데이터 생성 요청 - DTO: {}", apartmentRentDTO);
        try {
            ApartmentRentDTO createdApartmentRent = apartmentRentService.createApartmentRent(apartmentRentDTO);
            return ResponseEntity.ok(createdApartmentRent);
        } catch (Exception e) {
            log.error("아파트 전월세 데이터 생성 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 모든 아파트 전월세 정보 조회
    @GetMapping("/all")
    public ResponseEntity<List<ApartmentRentDTO>> getAllApartmentRents() {
        log.info("모든 아파트 전월세 정보 조회 요청");
        List<ApartmentRentDTO> apartmentRents = apartmentRentService.getAllApartmentRents();
        return ResponseEntity.ok(apartmentRents);
    }
    
    // ID로 아파트 전월세 정보 조회
    @GetMapping("/{id}")
    public ResponseEntity<ApartmentRentDTO> getApartmentRentById(@PathVariable Long id) {
        log.info("아파트 전월세 정보 조회 요청 - ID: {}", id);
        try {
            ApartmentRentDTO apartmentRent = apartmentRentService.getApartmentRentById(id);
            return ResponseEntity.ok(apartmentRent);
        } catch (RuntimeException e) {
            log.error("아파트 전월세 정보 조회 실패 - ID: {}, 에러: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    // 검색 조건에 따른 아파트 전월세 정보 조회
    @PostMapping("/search")
    public ResponseEntity<List<ApartmentRentDTO>> searchApartmentRents(@RequestBody ApartmentRentSearchDTO searchDTO) {
        log.info("아파트 전월세 검색 요청 - 조건: {}", searchDTO);
        
        // 검색 통계 기록
        if (searchDTO.getComplexName() != null && !searchDTO.getComplexName().trim().isEmpty()) {
            searchStatisticsService.recordSearch(searchDTO.getComplexName(), "complex", searchDTO.getSigungu());
        }
        if (searchDTO.getSigungu() != null && !searchDTO.getSigungu().trim().isEmpty()) {
            searchStatisticsService.recordSearch(searchDTO.getSigungu(), "region", null);
        }
        
        List<ApartmentRentDTO> apartmentRents = apartmentRentService.searchApartmentRents(searchDTO);
        return ResponseEntity.ok(apartmentRents);
    }
    
    // 시군구로 아파트 전월세 정보 조회
    @GetMapping("/sigungu/{sigungu}")
    public ResponseEntity<List<ApartmentRentDTO>> getApartmentRentsBySigungu(@PathVariable String sigungu) {
        log.info("시군구별 아파트 전월세 정보 조회 요청 - 시군구: {}", sigungu);
        List<ApartmentRentDTO> apartmentRents = apartmentRentService.getApartmentRentsBySigungu(sigungu);
        return ResponseEntity.ok(apartmentRents);
    }
    
    // 단지명으로 아파트 전월세 정보 조회
    @GetMapping("/complex/{complexName}")
    public ResponseEntity<List<ApartmentRentDTO>> getApartmentRentsByComplexName(@PathVariable String complexName) {
        log.info("단지명별 아파트 전월세 정보 조회 요청 - 단지명: {}", complexName);
        List<ApartmentRentDTO> apartmentRents = apartmentRentService.getApartmentRentsByComplexName(complexName);
        return ResponseEntity.ok(apartmentRents);
    }
    
    // 구분(전세/월세)으로 아파트 전월세 정보 조회
    @GetMapping("/type/{rentType}")
    public ResponseEntity<List<ApartmentRentDTO>> getApartmentRentsByRentType(@PathVariable String rentType) {
        log.info("구분별 아파트 전월세 정보 조회 요청 - 구분: {}", rentType);
        List<ApartmentRentDTO> apartmentRents = apartmentRentService.getApartmentRentsByRentType(rentType);
        return ResponseEntity.ok(apartmentRents);
    }
    
    // 전용면적 범위로 아파트 전월세 정보 조회
    @GetMapping("/area")
    public ResponseEntity<List<ApartmentRentDTO>> getApartmentRentsByAreaRange(
            @RequestParam Double minArea, 
            @RequestParam Double maxArea) {
        log.info("전용면적 범위별 아파트 전월세 정보 조회 요청 - 최소: {}, 최대: {}", minArea, maxArea);
        List<ApartmentRentDTO> apartmentRents = apartmentRentService.getApartmentRentsByAreaRange(minArea, maxArea);
        return ResponseEntity.ok(apartmentRents);
    }
    
    // 층 범위로 아파트 전월세 정보 조회
    @GetMapping("/floor")
    public ResponseEntity<List<ApartmentRentDTO>> getApartmentRentsByFloorRange(
            @RequestParam Integer minFloor, 
            @RequestParam Integer maxFloor) {
        log.info("층 범위별 아파트 전월세 정보 조회 요청 - 최소: {}, 최대: {}", minFloor, maxFloor);
        List<ApartmentRentDTO> apartmentRents = apartmentRentService.getApartmentRentsByFloorRange(minFloor, maxFloor);
        return ResponseEntity.ok(apartmentRents);
    }
    
    // 건축년도 범위로 아파트 전월세 정보 조회
    @GetMapping("/construction-year")
    public ResponseEntity<List<ApartmentRentDTO>> getApartmentRentsByConstructionYearRange(
            @RequestParam Integer minYear, 
            @RequestParam Integer maxYear) {
        log.info("건축년도 범위별 아파트 전월세 정보 조회 요청 - 최소: {}, 최대: {}", minYear, maxYear);
        List<ApartmentRentDTO> apartmentRents = apartmentRentService.getApartmentRentsByConstructionYearRange(minYear, maxYear);
        return ResponseEntity.ok(apartmentRents);
    }
    
    // 보증금 범위로 아파트 전월세 정보 조회
    @GetMapping("/deposit")
    public ResponseEntity<List<ApartmentRentDTO>> getApartmentRentsByDepositRange(
            @RequestParam Long minDeposit, 
            @RequestParam Long maxDeposit) {
        log.info("보증금 범위별 아파트 전월세 정보 조회 요청 - 최소: {}, 최대: {}", minDeposit, maxDeposit);
        List<ApartmentRentDTO> apartmentRents = apartmentRentService.getApartmentRentsByDepositRange(minDeposit, maxDeposit);
        return ResponseEntity.ok(apartmentRents);
    }
    
    // 월세 범위로 아파트 전월세 정보 조회
    @GetMapping("/monthly-rent")
    public ResponseEntity<List<ApartmentRentDTO>> getApartmentRentsByMonthlyRentRange(
            @RequestParam Long minRent, 
            @RequestParam Long maxRent) {
        log.info("월세 범위별 아파트 전월세 정보 조회 요청 - 최소: {}, 최대: {}", minRent, maxRent);
        List<ApartmentRentDTO> apartmentRents = apartmentRentService.getApartmentRentsByMonthlyRentRange(minRent, maxRent);
        return ResponseEntity.ok(apartmentRents);
    }

    // 맵용 아파트 전월세 정보 조회 (페이징 포함)
    @GetMapping("/map")
    public ResponseEntity<Map<String, Object>> getApartmentRentsForMap(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "1000") int limit) {
        log.info("맵용 아파트 전월세 정보 조회 요청 - 페이지: {}, 크기: {}, 제한: {}", page, size, limit);
        
        try {
            List<ApartmentRentDTO> apartmentRents = apartmentRentService.getAllApartmentRents();
            
            // 페이징 처리
            int start = page * size;
            int end = Math.min(start + size, apartmentRents.size());
            List<ApartmentRentDTO> pagedRents = apartmentRents.subList(start, end);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", pagedRents);
            response.put("totalElements", apartmentRents.size());
            response.put("totalPages", (int) Math.ceil((double) apartmentRents.size() / size));
            response.put("currentPage", page);
            response.put("size", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("맵용 아파트 전월세 정보 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 맵용 필터링된 아파트 전월세 정보 조회
    @PostMapping("/map/filtered")
    public ResponseEntity<Map<String, Object>> getFilteredApartmentRentsForMap(
            @RequestBody Map<String, Object> filterParams,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("맵용 필터링된 아파트 전월세 정보 조회 요청 - 필터: {}, 페이지: {}, 크기: {}", filterParams, page, size);
        
        try {
            List<ApartmentRentDTO> allRents = apartmentRentService.getAllApartmentRents();
            List<ApartmentRentDTO> filteredRents = new ArrayList<>();
            
            // 필터링 로직
            for (ApartmentRentDTO rent : allRents) {
                boolean matches = true;
                
                // 전월세 구분 필터
                if (filterParams.containsKey("rentType") && filterParams.get("rentType") != null) {
                    String rentType = (String) filterParams.get("rentType");
                    if (!rentType.equals("") && !rent.getRentType().equals(rentType)) {
                        matches = false;
                    }
                }
                
                // 가격 범위 필터
                if (filterParams.containsKey("minPrice") && filterParams.get("minPrice") != null) {
                    Integer minPrice = (Integer) filterParams.get("minPrice");
                    if (minPrice > 0 && rent.getDeposit() < minPrice) {
                        matches = false;
                    }
                }
                
                if (filterParams.containsKey("maxPrice") && filterParams.get("maxPrice") != null) {
                    Integer maxPrice = (Integer) filterParams.get("maxPrice");
                    if (maxPrice > 0 && rent.getDeposit() > maxPrice) {
                        matches = false;
                    }
                }
                
                // 면적 범위 필터
                if (filterParams.containsKey("minArea") && filterParams.get("minArea") != null) {
                    Double minArea = (Double) filterParams.get("minArea");
                    if (minArea > 0 && rent.getExclusiveArea() < minArea) {
                        matches = false;
                    }
                }
                
                if (filterParams.containsKey("maxArea") && filterParams.get("maxArea") != null) {
                    Double maxArea = (Double) filterParams.get("maxArea");
                    if (maxArea > 0 && rent.getExclusiveArea() > maxArea) {
                        matches = false;
                    }
                }
                
                if (matches) {
                    filteredRents.add(rent);
                }
            }
            
            // 페이징 처리
            int start = page * size;
            int end = Math.min(start + size, filteredRents.size());
            List<ApartmentRentDTO> pagedRents = filteredRents.subList(start, end);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", pagedRents);
            response.put("totalElements", filteredRents.size());
            response.put("totalPages", (int) Math.ceil((double) filteredRents.size() / size));
            response.put("currentPage", page);
            response.put("size", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("맵용 필터링된 아파트 전월세 정보 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
