package com.back.controller;

import com.back.dto.DetachedHouseSaleDTO;
import com.back.dto.DetachedHouseSaleSearchDTO;
import com.back.service.DetachedHouseSaleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/detached-house-sale")
@RequiredArgsConstructor
@Log4j2
public class DetachedHouseSaleController {
    
    private final DetachedHouseSaleService detachedHouseSaleService;
    
    // 단독주택 매매 데이터 생성
    @PostMapping
    public ResponseEntity<DetachedHouseSaleDTO> createDetachedHouseSale(@RequestBody DetachedHouseSaleDTO detachedHouseSaleDTO) {
        log.info("단독주택 매매 데이터 생성 요청 - DTO: {}", detachedHouseSaleDTO);
        try {
            DetachedHouseSaleDTO createdDetachedHouseSale = detachedHouseSaleService.createDetachedHouseSale(detachedHouseSaleDTO);
            return ResponseEntity.ok(createdDetachedHouseSale);
        } catch (Exception e) {
            log.error("단독주택 매매 데이터 생성 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 모든 단독/다가구 매매 정보 조회
    @GetMapping("/all")
    public ResponseEntity<List<DetachedHouseSaleDTO>> getAllDetachedHouseSales() {
        log.info("모든 단독/다가구 매매 정보 조회 요청");
        List<DetachedHouseSaleDTO> detachedHouseSales = detachedHouseSaleService.getAllDetachedHouseSales();
        return ResponseEntity.ok(detachedHouseSales);
    }
    
    // ID로 단독/다가구 매매 정보 조회
    @GetMapping("/{id}")
    public ResponseEntity<DetachedHouseSaleDTO> getDetachedHouseSaleById(@PathVariable Long id) {
        log.info("ID별 단독/다가구 매매 정보 조회 요청 - ID: {}", id);
        DetachedHouseSaleDTO detachedHouseSale = detachedHouseSaleService.getDetachedHouseSaleById(id);
        return ResponseEntity.ok(detachedHouseSale);
    }
    
    // 검색 조건에 따른 단독/다가구 매매 정보 조회
    @PostMapping("/search")
    public ResponseEntity<List<DetachedHouseSaleDTO>> searchDetachedHouseSales(@RequestBody DetachedHouseSaleSearchDTO searchDTO) {
        log.info("단독/다가구 매매 검색 요청 - 조건: {}", searchDTO);
        List<DetachedHouseSaleDTO> detachedHouseSales = detachedHouseSaleService.searchDetachedHouseSales(searchDTO);
        return ResponseEntity.ok(detachedHouseSales);
    }
    
    // 시군구로 단독/다가구 매매 정보 조회
    @GetMapping("/sigungu/{sigungu}")
    public ResponseEntity<List<DetachedHouseSaleDTO>> getDetachedHouseSalesBySigungu(@PathVariable String sigungu) {
        log.info("시군구별 단독/다가구 매매 정보 조회 요청 - 시군구: {}", sigungu);
        List<DetachedHouseSaleDTO> detachedHouseSales = detachedHouseSaleService.getDetachedHouseSalesBySigungu(sigungu);
        return ResponseEntity.ok(detachedHouseSales);
    }
    
    // 주택유형으로 단독/다가구 매매 정보 조회
    @GetMapping("/housing-type/{housingType}")
    public ResponseEntity<List<DetachedHouseSaleDTO>> getDetachedHouseSalesByHousingType(@PathVariable String housingType) {
        log.info("주택유형별 단독/다가구 매매 정보 조회 요청 - 주택유형: {}", housingType);
        List<DetachedHouseSaleDTO> detachedHouseSales = detachedHouseSaleService.getDetachedHouseSalesByHousingType(housingType);
        return ResponseEntity.ok(detachedHouseSales);
    }
    
    // 도로조건으로 단독/다가구 매매 정보 조회
    @GetMapping("/road-condition/{roadCondition}")
    public ResponseEntity<List<DetachedHouseSaleDTO>> getDetachedHouseSalesByRoadCondition(@PathVariable String roadCondition) {
        log.info("도로조건별 단독/다가구 매매 정보 조회 요청 - 도로조건: {}", roadCondition);
        List<DetachedHouseSaleDTO> detachedHouseSales = detachedHouseSaleService.getDetachedHouseSalesByRoadCondition(roadCondition);
        return ResponseEntity.ok(detachedHouseSales);
    }
    
    // 연면적 범위로 단독/다가구 매매 정보 조회
    @GetMapping("/total-area")
    public ResponseEntity<List<DetachedHouseSaleDTO>> getDetachedHouseSalesByTotalAreaRange(
            @RequestParam Double minTotalArea, 
            @RequestParam Double maxTotalArea) {
        log.info("연면적 범위별 단독/다가구 매매 정보 조회 요청 - 최소: {}, 최대: {}", minTotalArea, maxTotalArea);
        List<DetachedHouseSaleDTO> detachedHouseSales = detachedHouseSaleService.getDetachedHouseSalesByTotalAreaRange(minTotalArea, maxTotalArea);
        return ResponseEntity.ok(detachedHouseSales);
    }
    
    // 대지면적 범위로 단독/다가구 매매 정보 조회
    @GetMapping("/land-area")
    public ResponseEntity<List<DetachedHouseSaleDTO>> getDetachedHouseSalesByLandAreaRange(
            @RequestParam Double minLandArea, 
            @RequestParam Double maxLandArea) {
        log.info("대지면적 범위별 단독/다가구 매매 정보 조회 요청 - 최소: {}, 최대: {}", minLandArea, maxLandArea);
        List<DetachedHouseSaleDTO> detachedHouseSales = detachedHouseSaleService.getDetachedHouseSalesByLandAreaRange(minLandArea, maxLandArea);
        return ResponseEntity.ok(detachedHouseSales);
    }
    
    // 거래금액 범위로 단독/다가구 매매 정보 조회
    @GetMapping("/transaction-amount")
    public ResponseEntity<List<DetachedHouseSaleDTO>> getDetachedHouseSalesByTransactionAmountRange(
            @RequestParam Long minAmount, 
            @RequestParam Long maxAmount) {
        log.info("거래금액 범위별 단독/다가구 매매 정보 조회 요청 - 최소: {}, 최대: {}", minAmount, maxAmount);
        List<DetachedHouseSaleDTO> detachedHouseSales = detachedHouseSaleService.getDetachedHouseSalesByTransactionAmountRange(minAmount, maxAmount);
        return ResponseEntity.ok(detachedHouseSales);
    }
    
    // 건축년도 범위로 단독/다가구 매매 정보 조회
    @GetMapping("/construction-year")
    public ResponseEntity<List<DetachedHouseSaleDTO>> getDetachedHouseSalesByConstructionYearRange(
            @RequestParam Integer minYear, 
            @RequestParam Integer maxYear) {
        log.info("건축년도 범위별 단독/다가구 매매 정보 조회 요청 - 최소: {}, 최대: {}", minYear, maxYear);
        List<DetachedHouseSaleDTO> detachedHouseSales = detachedHouseSaleService.getDetachedHouseSalesByConstructionYearRange(minYear, maxYear);
        return ResponseEntity.ok(detachedHouseSales);
    }
} 