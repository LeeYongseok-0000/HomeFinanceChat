package com.back.controller;

import com.back.dto.OfficeTelSaleDTO;
import com.back.dto.OfficeTelSaleSearchDTO;
import com.back.service.OfficeTelSaleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/office-tel-sale")
@RequiredArgsConstructor
@Log4j2
public class OfficeTelSaleController {
    
    private final OfficeTelSaleService officeTelSaleService;
    
    // 오피스텔 매매 데이터 생성
    @PostMapping
    public ResponseEntity<OfficeTelSaleDTO> createOfficeTelSale(@RequestBody OfficeTelSaleDTO officeTelSaleDTO) {
        log.info("오피스텔 매매 데이터 생성 요청 - DTO: {}", officeTelSaleDTO);
        try {
            OfficeTelSaleDTO createdOfficeTelSale = officeTelSaleService.createOfficeTelSale(officeTelSaleDTO);
            return ResponseEntity.ok(createdOfficeTelSale);
        } catch (Exception e) {
            log.error("오피스텔 매매 데이터 생성 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 모든 오피스텔 매매 정보 조회
    @GetMapping("/all")
    public ResponseEntity<List<OfficeTelSaleDTO>> getAllOfficeTelSales() {
        log.info("모든 오피스텔 매매 정보 조회 요청");
        List<OfficeTelSaleDTO> officeTelSales = officeTelSaleService.getAllOfficeTelSales();
        return ResponseEntity.ok(officeTelSales);
    }
    
    // ID로 오피스텔 매매 정보 조회
    @GetMapping("/{id}")
    public ResponseEntity<OfficeTelSaleDTO> getOfficeTelSaleById(@PathVariable Long id) {
        log.info("오피스텔 매매 정보 조회 요청 - ID: {}", id);
        try {
            OfficeTelSaleDTO officeTelSale = officeTelSaleService.getOfficeTelSaleById(id);
            return ResponseEntity.ok(officeTelSale);
        } catch (RuntimeException e) {
            log.error("오피스텔 매매 정보 조회 실패 - ID: {}, 에러: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    // 검색 조건에 따른 오피스텔 매매 정보 조회
    @PostMapping("/search")
    public ResponseEntity<List<OfficeTelSaleDTO>> searchOfficeTelSales(@RequestBody OfficeTelSaleSearchDTO searchDTO) {
        log.info("오피스텔 매매 검색 요청 - 조건: {}", searchDTO);
        List<OfficeTelSaleDTO> officeTelSales = officeTelSaleService.searchOfficeTelSales(searchDTO);
        return ResponseEntity.ok(officeTelSales);
    }
    
    // 시군구로 오피스텔 매매 정보 조회
    @GetMapping("/sigungu/{sigungu}")
    public ResponseEntity<List<OfficeTelSaleDTO>> getOfficeTelSalesBySigungu(@PathVariable String sigungu) {
        log.info("시군구별 오피스텔 매매 정보 조회 요청 - 시군구: {}", sigungu);
        List<OfficeTelSaleDTO> officeTelSales = officeTelSaleService.getOfficeTelSalesBySigungu(sigungu);
        return ResponseEntity.ok(officeTelSales);
    }
    
    // 단지명으로 오피스텔 매매 정보 조회
    @GetMapping("/complex/{complexName}")
    public ResponseEntity<List<OfficeTelSaleDTO>> getOfficeTelSalesByComplexName(@PathVariable String complexName) {
        log.info("단지명별 오피스텔 매매 정보 조회 요청 - 단지명: {}", complexName);
        List<OfficeTelSaleDTO> officeTelSales = officeTelSaleService.getOfficeTelSalesByComplexName(complexName);
        return ResponseEntity.ok(officeTelSales);
    }
    
    // 전용면적 범위로 오피스텔 매매 정보 조회
    @GetMapping("/area")
    public ResponseEntity<List<OfficeTelSaleDTO>> getOfficeTelSalesByAreaRange(
            @RequestParam Double minArea, 
            @RequestParam Double maxArea) {
        log.info("전용면적 범위별 오피스텔 매매 정보 조회 요청 - 최소: {}, 최대: {}", minArea, maxArea);
        List<OfficeTelSaleDTO> officeTelSales = officeTelSaleService.getOfficeTelSalesByAreaRange(minArea, maxArea);
        return ResponseEntity.ok(officeTelSales);
    }
    
    // 층 범위로 오피스텔 매매 정보 조회
    @GetMapping("/floor")
    public ResponseEntity<List<OfficeTelSaleDTO>> getOfficeTelSalesByFloorRange(
            @RequestParam Integer minFloor, 
            @RequestParam Integer maxFloor) {
        log.info("층 범위별 오피스텔 매매 정보 조회 요청 - 최소: {}, 최대: {}", minFloor, maxFloor);
        List<OfficeTelSaleDTO> officeTelSales = officeTelSaleService.getOfficeTelSalesByFloorRange(minFloor, maxFloor);
        return ResponseEntity.ok(officeTelSales);
    }
    
    // 건축년도 범위로 오피스텔 매매 정보 조회
    @GetMapping("/construction-year")
    public ResponseEntity<List<OfficeTelSaleDTO>> getOfficeTelSalesByConstructionYearRange(
            @RequestParam Integer minYear, 
            @RequestParam Integer maxYear) {
        log.info("건축년도 범위별 오피스텔 매매 정보 조회 요청 - 최소: {}, 최대: {}", minYear, maxYear);
        List<OfficeTelSaleDTO> officeTelSales = officeTelSaleService.getOfficeTelSalesByConstructionYearRange(minYear, maxYear);
        return ResponseEntity.ok(officeTelSales);
    }
    
    // 거래금액 범위로 오피스텔 매매 정보 조회
    @GetMapping("/transaction-amount")
    public ResponseEntity<List<OfficeTelSaleDTO>> getOfficeTelSalesByTransactionAmountRange(
            @RequestParam Long minAmount, 
            @RequestParam Long maxAmount) {
        log.info("거래금액 범위별 오피스텔 매매 정보 조회 요청 - 최소: {}, 최대: {}", minAmount, maxAmount);
        List<OfficeTelSaleDTO> officeTelSales = officeTelSaleService.getOfficeTelSalesByTransactionAmountRange(minAmount, maxAmount);
        return ResponseEntity.ok(officeTelSales);
    }
} 