package com.back.controller;

import com.back.dto.RowHouseRentDTO;
import com.back.dto.RowHouseRentSearchDTO;
import com.back.service.RowHouseRentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rowhouse-rent")
@RequiredArgsConstructor
@Log4j2
public class RowHouseRentController {
    
    private final RowHouseRentService rowHouseRentService;
    
    // 빌라 전월세 데이터 생성
    @PostMapping
    public ResponseEntity<RowHouseRentDTO> createRowHouseRent(@RequestBody RowHouseRentDTO rowHouseRentDTO) {
        log.info("빌라 전월세 데이터 생성 요청 - DTO: {}", rowHouseRentDTO);
        try {
            RowHouseRentDTO createdRowHouseRent = rowHouseRentService.createRowHouseRent(rowHouseRentDTO);
            return ResponseEntity.ok(createdRowHouseRent);
        } catch (Exception e) {
            log.error("빌라 전월세 데이터 생성 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 모든 빌라 전월세 정보 조회
    @GetMapping("/all")
    public ResponseEntity<List<RowHouseRentDTO>> getAllRowHouseRents() {
        log.info("모든 연립다세대 전월세 정보 조회 요청");
        List<RowHouseRentDTO> rowHouseRents = rowHouseRentService.getAllRowHouseRents();
        return ResponseEntity.ok(rowHouseRents);
    }
    
    // ID별 연립다세대 전월세 정보 조회
    @GetMapping("/{id}")
    public ResponseEntity<RowHouseRentDTO> getRowHouseRentById(@PathVariable Long id) {
        log.info("ID별 연립다세대 전월세 정보 조회 요청 - ID: {}", id);
        RowHouseRentDTO rowHouseRent = rowHouseRentService.getRowHouseRentById(id);
        return ResponseEntity.ok(rowHouseRent);
    }
    
    // 조건에 따른 연립다세대 전월세 검색
    @PostMapping("/search")
    public ResponseEntity<List<RowHouseRentDTO>> searchRowHouseRents(@RequestBody RowHouseRentSearchDTO searchDTO) {
        log.info("연립다세대 전월세 검색 요청 - 조건: {}", searchDTO);
        List<RowHouseRentDTO> rowHouseRents = rowHouseRentService.searchRowHouseRents(searchDTO);
        return ResponseEntity.ok(rowHouseRents);
    }
    
    // 시군구별 연립다세대 전월세 정보 조회
    @GetMapping("/sigungu/{sigungu}")
    public ResponseEntity<List<RowHouseRentDTO>> getRowHouseRentsBySigungu(@PathVariable String sigungu) {
        log.info("시군구별 연립다세대 전월세 정보 조회 요청 - 시군구: {}", sigungu);
        List<RowHouseRentDTO> rowHouseRents = rowHouseRentService.getRowHouseRentsBySigungu(sigungu);
        return ResponseEntity.ok(rowHouseRents);
    }
    
    // 건물명별 연립다세대 전월세 정보 조회
    @GetMapping("/building/{buildingName}")
    public ResponseEntity<List<RowHouseRentDTO>> getRowHouseRentsByBuildingName(@PathVariable String buildingName) {
        log.info("건물명별 연립다세대 전월세 정보 조회 요청 - 건물명: {}", buildingName);
        List<RowHouseRentDTO> rowHouseRents = rowHouseRentService.getRowHouseRentsByBuildingName(buildingName);
        return ResponseEntity.ok(rowHouseRents);
    }
    
    // 주택유형별 연립다세대 전월세 정보 조회
    @GetMapping("/housing-type/{housingType}")
    public ResponseEntity<List<RowHouseRentDTO>> getRowHouseRentsByHousingType(@PathVariable String housingType) {
        log.info("주택유형별 연립다세대 전월세 정보 조회 요청 - 주택유형: {}", housingType);
        List<RowHouseRentDTO> rowHouseRents = rowHouseRentService.getRowHouseRentsByHousingType(housingType);
        return ResponseEntity.ok(rowHouseRents);
    }
    
    // 전월세구분별 연립다세대 전월세 정보 조회
    @GetMapping("/rent-type/{rentType}")
    public ResponseEntity<List<RowHouseRentDTO>> getRowHouseRentsByRentType(@PathVariable String rentType) {
        log.info("전월세구분별 연립다세대 전월세 정보 조회 요청 - 전월세구분: {}", rentType);
        List<RowHouseRentDTO> rowHouseRents = rowHouseRentService.getRowHouseRentsByRentType(rentType);
        return ResponseEntity.ok(rowHouseRents);
    }
    
    // 전용면적 범위별 연립다세대 전월세 정보 조회
    @GetMapping("/exclusive-area")
    public ResponseEntity<List<RowHouseRentDTO>> getRowHouseRentsByExclusiveAreaRange(
            @RequestParam Double minExclusiveArea,
            @RequestParam Double maxExclusiveArea) {
        log.info("전용면적 범위별 연립다세대 전월세 정보 조회 요청 - 최소: {}, 최대: {}", minExclusiveArea, maxExclusiveArea);
        List<RowHouseRentDTO> rowHouseRents = rowHouseRentService.getRowHouseRentsByExclusiveAreaRange(minExclusiveArea, maxExclusiveArea);
        return ResponseEntity.ok(rowHouseRents);
    }
    
    // 보증금 범위별 연립다세대 전월세 정보 조회
    @GetMapping("/deposit")
    public ResponseEntity<List<RowHouseRentDTO>> getRowHouseRentsByDepositRange(
            @RequestParam Long minDeposit,
            @RequestParam Long maxDeposit) {
        log.info("보증금 범위별 연립다세대 전월세 정보 조회 요청 - 최소: {}, 최대: {}", minDeposit, maxDeposit);
        List<RowHouseRentDTO> rowHouseRents = rowHouseRentService.getRowHouseRentsByDepositRange(minDeposit, maxDeposit);
        return ResponseEntity.ok(rowHouseRents);
    }
    
    // 월세 범위별 연립다세대 전월세 정보 조회
    @GetMapping("/monthly-rent")
    public ResponseEntity<List<RowHouseRentDTO>> getRowHouseRentsByMonthlyRentRange(
            @RequestParam Long minMonthlyRent,
            @RequestParam Long maxMonthlyRent) {
        log.info("월세 범위별 연립다세대 전월세 정보 조회 요청 - 최소: {}, 최대: {}", minMonthlyRent, maxMonthlyRent);
        List<RowHouseRentDTO> rowHouseRents = rowHouseRentService.getRowHouseRentsByMonthlyRentRange(minMonthlyRent, maxMonthlyRent);
        return ResponseEntity.ok(rowHouseRents);
    }
    
    // 층 범위별 연립다세대 전월세 정보 조회
    @GetMapping("/floor")
    public ResponseEntity<List<RowHouseRentDTO>> getRowHouseRentsByFloorRange(
            @RequestParam Integer minFloor,
            @RequestParam Integer maxFloor) {
        log.info("층 범위별 연립다세대 전월세 정보 조회 요청 - 최소: {}, 최대: {}", minFloor, maxFloor);
        List<RowHouseRentDTO> rowHouseRents = rowHouseRentService.getRowHouseRentsByFloorRange(minFloor, maxFloor);
        return ResponseEntity.ok(rowHouseRents);
    }
    
    // 건축년도 범위별 연립다세대 전월세 정보 조회
    @GetMapping("/construction-year")
    public ResponseEntity<List<RowHouseRentDTO>> getRowHouseRentsByConstructionYearRange(
            @RequestParam Integer minYear,
            @RequestParam Integer maxYear) {
        log.info("건축년도 범위별 연립다세대 전월세 정보 조회 요청 - 최소: {}, 최대: {}", minYear, maxYear);
        List<RowHouseRentDTO> rowHouseRents = rowHouseRentService.getRowHouseRentsByConstructionYearRange(minYear, maxYear);
        return ResponseEntity.ok(rowHouseRents);
    }
} 