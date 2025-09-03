package com.back.controller;

import com.back.domain.ApartmentSale;
import com.back.service.ApartmentSaleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import com.back.dto.ApartmentSaleDTO;

@RestController
@RequestMapping("/api/apartment-sale")
@RequiredArgsConstructor
@Log4j2
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "false")
public class ApartmentSaleController {
    
    private final ApartmentSaleService apartmentSaleService;
    
    // 시군구 목록 조회
    @GetMapping("/sigungu-list")
    public ResponseEntity<List<String>> getSigunguList() {
        try {
            List<String> sigunguList = apartmentSaleService.getDistinctSigungu();
            return ResponseEntity.ok(sigunguList);
        } catch (Exception e) {
            log.error("시군구 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 주택유형 목록 조회
    @GetMapping("/housing-type-list")
    public ResponseEntity<List<String>> getHousingTypeList() {
        try {
            List<String> housingTypeList = apartmentSaleService.getDistinctHousingType();
            return ResponseEntity.ok(housingTypeList);
        } catch (Exception e) {
            log.error("주택유형 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 거래구분 목록 조회
    @GetMapping("/transaction-type-list")
    public ResponseEntity<List<String>> getTransactionTypeList() {
        try {
            List<String> transactionTypeList = apartmentSaleService.getDistinctTransactionType();
            return ResponseEntity.ok(transactionTypeList);
        } catch (Exception e) {
            log.error("거래구분 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 복합 검색
    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> searchApartmentSale(
            @RequestBody Map<String, Object> searchCriteria,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("contractDate").descending());
            
            String sigungu = (String) searchCriteria.get("searchSigungu");
            String complexName = (String) searchCriteria.get("searchComplexName");
            String housingType = (String) searchCriteria.get("propertyType");
            String transactionType = (String) searchCriteria.get("transactionType");
            Double minArea = searchCriteria.get("minArea") != null ? 
                Double.valueOf(searchCriteria.get("minArea").toString()) : null;
            Double maxArea = searchCriteria.get("maxArea") != null ? 
                Double.valueOf(searchCriteria.get("maxArea").toString()) : null;
            Long minAmount = searchCriteria.get("minAmount") != null ? 
                Long.valueOf(searchCriteria.get("minAmount").toString()) : null;
            Long maxAmount = searchCriteria.get("maxAmount") != null ? 
                Long.valueOf(searchCriteria.get("maxAmount").toString()) : null;
            Integer minYear = searchCriteria.get("minYear") != null ? 
                Integer.valueOf(searchCriteria.get("minYear").toString()) : null;
            Integer maxYear = searchCriteria.get("maxYear") != null ? 
                Integer.valueOf(searchCriteria.get("maxYear").toString()) : null;
            
            // 검색 조건 로깅
            log.info("검색 조건 - sigungu: {}, complexName: {}, housingType: {}, transactionType: {}, minArea: {}, maxArea: {}, minAmount: {}, maxAmount: {}, minYear: {}, maxYear: {}", 
                    sigungu, complexName, housingType, transactionType, minArea, maxArea, minAmount, maxAmount, minYear, maxYear);
            
            Page<ApartmentSale> result = apartmentSaleService.searchByCriteria(
                    sigungu, complexName, housingType, transactionType,
                    minArea, maxArea, minAmount, maxAmount, minYear, maxYear, pageable);
            
            Map<String, Object> response = Map.of(
                    "content", result.getContent(),
                    "totalPages", result.getTotalPages(),
                    "totalElements", result.getTotalElements(),
                    "currentPage", result.getNumber(),
                    "size", result.getSize()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("아파트 매매 검색 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 전체 조회 (페이지네이션)
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getAllApartmentSale(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("contractDate").descending());
            Page<ApartmentSale> result = apartmentSaleService.findAll(pageable);
            
            Map<String, Object> response = Map.of(
                    "content", result.getContent(),
                    "totalPages", result.getTotalPages(),
                    "totalElements", result.getTotalElements(),
                    "currentPage", result.getNumber(),
                    "size", result.getSize()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("전체 아파트 매매 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // ID로 조회
    @GetMapping("/{id}")
    public ResponseEntity<ApartmentSale> getApartmentSaleById(@PathVariable Long id) {
        try {
            ApartmentSale apartmentSale = apartmentSaleService.findById(id);
            return ResponseEntity.ok(apartmentSale);
        } catch (Exception e) {
            log.error("아파트 매매 정보 조회 실패", e);
            return ResponseEntity.notFound().build();
        }
    }
    
    // 아파트 매매 데이터 생성
    @PostMapping
    public ResponseEntity<ApartmentSaleDTO> createApartmentSale(@RequestBody ApartmentSaleDTO apartmentSaleDTO) {
        log.info("아파트 매매 데이터 생성 요청 - DTO: {}", apartmentSaleDTO);
        try {
            ApartmentSaleDTO createdApartmentSale = apartmentSaleService.createApartmentSale(apartmentSaleDTO);
            return ResponseEntity.ok(createdApartmentSale);
        } catch (Exception e) {
            log.error("아파트 매매 데이터 생성 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 데이터 수정
    @PutMapping("/{id}")
    public ResponseEntity<ApartmentSale> updateApartmentSale(
            @PathVariable Long id, 
            @RequestBody ApartmentSale apartmentSale) {
        try {
            ApartmentSale updated = apartmentSaleService.update(id, apartmentSale);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("아파트 매매 정보 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 데이터 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApartmentSale(@PathVariable Long id) {
        try {
            apartmentSaleService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("아파트 매매 정보 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 전체 데이터 개수 조회
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getCount() {
        try {
            long count = apartmentSaleService.count();
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            log.error("데이터 개수 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 지도용 아파트 매매 데이터 조회 (간단한 정보만)
    @GetMapping("/map")
    public ResponseEntity<Map<String, Object>> getApartmentSaleForMap(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "limit", defaultValue = "100") int limit) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("contractDate").descending());
            Map<String, Object> result = apartmentSaleService.getMapDataWithPagination(pageable, limit);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("지도용 아파트 매매 데이터 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 필터링된 지도용 아파트 매매 데이터 조회
    @PostMapping("/map/filtered")
    public ResponseEntity<Map<String, Object>> getFilteredApartmentSaleForMap(
            @RequestBody Map<String, Object> filterCriteria) {
        try {
            String transactionType = (String) filterCriteria.get("transactionType");
            Double minPrice = filterCriteria.get("minPrice") != null ? 
                Double.valueOf(filterCriteria.get("minPrice").toString()) : null;
            Double maxPrice = filterCriteria.get("maxPrice") != null ? 
                Double.valueOf(filterCriteria.get("maxPrice").toString()) : null;
            Double minArea = filterCriteria.get("minArea") != null ? 
                Double.valueOf(filterCriteria.get("minArea").toString()) : null;
            Double maxArea = filterCriteria.get("maxArea") != null ? 
                Double.valueOf(filterCriteria.get("maxArea").toString()) : null;
            Integer page = filterCriteria.get("page") != null ? 
                Integer.valueOf(filterCriteria.get("page").toString()) : 0;
            Integer size = filterCriteria.get("size") != null ? 
                Integer.valueOf(filterCriteria.get("size").toString()) : 10;
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("contractDate").descending());
            Map<String, Object> filteredMapData = apartmentSaleService.getFilteredMapDataWithPagination(
                transactionType, minPrice, maxPrice, minArea, maxArea, pageable);
            return ResponseEntity.ok(filteredMapData);
        } catch (Exception e) {
            log.error("필터링된 지도용 아파트 매매 데이터 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
