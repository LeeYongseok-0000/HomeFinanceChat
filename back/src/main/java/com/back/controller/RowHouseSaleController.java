package com.back.controller;

import com.back.dto.RowHouseSaleDTO;
import com.back.dto.RowHouseSaleSearchDTO;
import com.back.service.RowHouseSaleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rowhouse-sale")
@RequiredArgsConstructor
@Log4j2
public class RowHouseSaleController {
    
    private final RowHouseSaleService rowHouseSaleService;
    
    // 빌라 매매 데이터 생성
    @PostMapping
    public ResponseEntity<RowHouseSaleDTO> createRowHouseSale(@RequestBody RowHouseSaleDTO rowHouseSaleDTO) {
        log.info("빌라 매매 데이터 생성 요청 - DTO: {}", rowHouseSaleDTO);
        try {
            RowHouseSaleDTO createdRowHouseSale = rowHouseSaleService.createRowHouseSale(rowHouseSaleDTO);
            return ResponseEntity.ok(createdRowHouseSale);
        } catch (Exception e) {
            log.error("빌라 매매 데이터 생성 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 모든 빌라 매매 정보 조회
    @GetMapping("/all")
    public ResponseEntity<List<RowHouseSaleDTO>> getAllRowHouseSales() {
        log.info("모든 연립다세대 매매 정보 조회 요청");
        List<RowHouseSaleDTO> rowHouseSales = rowHouseSaleService.getAllRowHouseSales();
        return ResponseEntity.ok(rowHouseSales);
    }
    
    // ID별 연립다세대 매매 정보 조회
    @GetMapping("/{id}")
    public ResponseEntity<RowHouseSaleDTO> getRowHouseSaleById(@PathVariable Long id) {
        log.info("ID별 연립다세대 매매 정보 조회 요청 - ID: {}", id);
        RowHouseSaleDTO rowHouseSale = rowHouseSaleService.getRowHouseSaleById(id);
        return ResponseEntity.ok(rowHouseSale);
    }
    
    // 조건에 따른 연립다세대 매매 검색
    @PostMapping("/search")
    public ResponseEntity<List<RowHouseSaleDTO>> searchRowHouseSales(@RequestBody RowHouseSaleSearchDTO searchDTO) {
        log.info("연립다세대 매매 검색 요청 - 조건: {}", searchDTO);
        List<RowHouseSaleDTO> rowHouseSales = rowHouseSaleService.searchRowHouseSales(searchDTO);
        return ResponseEntity.ok(rowHouseSales);
    }
    
    // 시군구별 연립다세대 매매 정보 조회
    @GetMapping("/sigungu/{sigungu}")
    public ResponseEntity<List<RowHouseSaleDTO>> getRowHouseSalesBySigungu(@PathVariable String sigungu) {
        log.info("시군구별 연립다세대 매매 정보 조회 요청 - 시군구: {}", sigungu);
        List<RowHouseSaleDTO> rowHouseSales = rowHouseSaleService.getRowHouseSalesBySigungu(sigungu);
        return ResponseEntity.ok(rowHouseSales);
    }
    
    // 건물명별 연립다세대 매매 정보 조회
    @GetMapping("/building/{buildingName}")
    public ResponseEntity<List<RowHouseSaleDTO>> getRowHouseSalesByBuildingName(@PathVariable String buildingName) {
        log.info("건물명별 연립다세대 매매 정보 조회 요청 - 건물명: {}", buildingName);
        List<RowHouseSaleDTO> rowHouseSales = rowHouseSaleService.getRowHouseSalesByBuildingName(buildingName);
        return ResponseEntity.ok(rowHouseSales);
    }
    
    // 주택유형별 연립다세대 매매 정보 조회
    @GetMapping("/housing-type/{housingType}")
    public ResponseEntity<List<RowHouseSaleDTO>> getRowHouseSalesByHousingType(@PathVariable String housingType) {
        log.info("주택유형별 연립다세대 매매 정보 조회 요청 - 주택유형: {}", housingType);
        List<RowHouseSaleDTO> rowHouseSales = rowHouseSaleService.getRowHouseSalesByHousingType(housingType);
        return ResponseEntity.ok(rowHouseSales);
    }
    
    // 전용면적 범위별 연립다세대 매매 정보 조회
    @GetMapping("/exclusive-area")
    public ResponseEntity<List<RowHouseSaleDTO>> getRowHouseSalesByExclusiveAreaRange(
            @RequestParam Double minExclusiveArea,
            @RequestParam Double maxExclusiveArea) {
        log.info("전용면적 범위별 연립다세대 매매 정보 조회 요청 - 최소: {}, 최대: {}", minExclusiveArea, maxExclusiveArea);
        List<RowHouseSaleDTO> rowHouseSales = rowHouseSaleService.getRowHouseSalesByExclusiveAreaRange(minExclusiveArea, maxExclusiveArea);
        return ResponseEntity.ok(rowHouseSales);
    }
    
    // 대지권면적 범위별 연립다세대 매매 정보 조회
    @GetMapping("/land-area")
    public ResponseEntity<List<RowHouseSaleDTO>> getRowHouseSalesByLandAreaRange(
            @RequestParam Double minLandArea,
            @RequestParam Double maxLandArea) {
        log.info("대지권면적 범위별 연립다세대 매매 정보 조회 요청 - 최소: {}, 최대: {}", minLandArea, maxLandArea);
        List<RowHouseSaleDTO> rowHouseSales = rowHouseSaleService.getRowHouseSalesByLandAreaRange(minLandArea, maxLandArea);
        return ResponseEntity.ok(rowHouseSales);
    }
    
    // 거래금액 범위별 연립다세대 매매 정보 조회
    @GetMapping("/transaction-amount")
    public ResponseEntity<List<RowHouseSaleDTO>> getRowHouseSalesByTransactionAmountRange(
            @RequestParam Long minAmount,
            @RequestParam Long maxAmount) {
        log.info("거래금액 범위별 연립다세대 매매 정보 조회 요청 - 최소: {}, 최대: {}", minAmount, maxAmount);
        List<RowHouseSaleDTO> rowHouseSales = rowHouseSaleService.getRowHouseSalesByTransactionAmountRange(minAmount, maxAmount);
        return ResponseEntity.ok(rowHouseSales);
    }
    
    // 층 범위별 연립다세대 매매 정보 조회
    @GetMapping("/floor")
    public ResponseEntity<List<RowHouseSaleDTO>> getRowHouseSalesByFloorRange(
            @RequestParam Integer minFloor,
            @RequestParam Integer maxFloor) {
        log.info("층 범위별 연립다세대 매매 정보 조회 요청 - 최소: {}, 최대: {}", minFloor, maxFloor);
        List<RowHouseSaleDTO> rowHouseSales = rowHouseSaleService.getRowHouseSalesByFloorRange(minFloor, maxFloor);
        return ResponseEntity.ok(rowHouseSales);
    }
    
    // 건축년도 범위별 연립다세대 매매 정보 조회
    @GetMapping("/construction-year")
    public ResponseEntity<List<RowHouseSaleDTO>> getRowHouseSalesByConstructionYearRange(
            @RequestParam Integer minYear,
            @RequestParam Integer maxYear) {
        log.info("건축년도 범위별 연립다세대 매매 정보 조회 요청 - 최소: {}, 최대: {}", minYear, maxYear);
        List<RowHouseSaleDTO> rowHouseSales = rowHouseSaleService.getRowHouseSalesByConstructionYearRange(minYear, maxYear);
        return ResponseEntity.ok(rowHouseSales);
    }
} 