package com.back.controller;

import com.back.dto.DetachedHouseRentDTO;
import com.back.dto.DetachedHouseRentSearchDTO;
import com.back.service.DetachedHouseRentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/detached-house-rent")
@RequiredArgsConstructor
@Log4j2
public class DetachedHouseRentController {
    
    private final DetachedHouseRentService detachedHouseRentService;
    
    // 단독주택 전월세 데이터 생성
    @PostMapping
    public ResponseEntity<DetachedHouseRentDTO> createDetachedHouseRent(@RequestBody DetachedHouseRentDTO detachedHouseRentDTO) {
        log.info("단독주택 전월세 데이터 생성 요청 - DTO: {}", detachedHouseRentDTO);
        try {
            DetachedHouseRentDTO createdDetachedHouseRent = detachedHouseRentService.createDetachedHouseRent(detachedHouseRentDTO);
            return ResponseEntity.ok(createdDetachedHouseRent);
        } catch (Exception e) {
            log.error("단독주택 전월세 데이터 생성 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 모든 단독/다가구 전/월세 정보 조회
    @GetMapping("/all")
    public ResponseEntity<List<DetachedHouseRentDTO>> getAllDetachedHouseRents() {
        log.info("모든 단독/다가구 전/월세 정보 조회 요청");
        List<DetachedHouseRentDTO> detachedHouseRents = detachedHouseRentService.getAllDetachedHouseRents();
        return ResponseEntity.ok(detachedHouseRents);
    }
    
    // ID로 단독/다가구 전/월세 정보 조회
    @GetMapping("/{id}")
    public ResponseEntity<DetachedHouseRentDTO> getDetachedHouseRentById(@PathVariable Long id) {
        log.info("ID별 단독/다가구 전/월세 정보 조회 요청 - ID: {}", id);
        DetachedHouseRentDTO detachedHouseRent = detachedHouseRentService.getDetachedHouseRentById(id);
        return ResponseEntity.ok(detachedHouseRent);
    }
    
    // 검색 조건에 따른 단독/다가구 전/월세 정보 조회
    @PostMapping("/search")
    public ResponseEntity<List<DetachedHouseRentDTO>> searchDetachedHouseRents(@RequestBody DetachedHouseRentSearchDTO searchDTO) {
        log.info("단독/다가구 전/월세 검색 요청 - 조건: {}", searchDTO);
        List<DetachedHouseRentDTO> detachedHouseRents = detachedHouseRentService.searchDetachedHouseRents(searchDTO);
        return ResponseEntity.ok(detachedHouseRents);
    }
    
    // 시군구로 단독/다가구 전/월세 정보 조회
    @GetMapping("/sigungu/{sigungu}")
    public ResponseEntity<List<DetachedHouseRentDTO>> getDetachedHouseRentsBySigungu(@PathVariable String sigungu) {
        log.info("시군구별 단독/다가구 전/월세 정보 조회 요청 - 시군구: {}", sigungu);
        List<DetachedHouseRentDTO> detachedHouseRents = detachedHouseRentService.getDetachedHouseRentsBySigungu(sigungu);
        return ResponseEntity.ok(detachedHouseRents);
    }
    
    // 주택유형으로 단독/다가구 전/월세 정보 조회
    @GetMapping("/housing-type/{housingType}")
    public ResponseEntity<List<DetachedHouseRentDTO>> getDetachedHouseRentsByHousingType(@PathVariable String housingType) {
        log.info("주택유형별 단독/다가구 전/월세 정보 조회 요청 - 주택유형: {}", housingType);
        List<DetachedHouseRentDTO> detachedHouseRents = detachedHouseRentService.getDetachedHouseRentsByHousingType(housingType);
        return ResponseEntity.ok(detachedHouseRents);
    }
    
    // 도로조건으로 단독/다가구 전/월세 정보 조회
    @GetMapping("/road-condition/{roadCondition}")
    public ResponseEntity<List<DetachedHouseRentDTO>> getDetachedHouseRentsByRoadCondition(@PathVariable String roadCondition) {
        log.info("도로조건별 단독/다가구 전/월세 정보 조회 요청 - 도로조건: {}", roadCondition);
        List<DetachedHouseRentDTO> detachedHouseRents = detachedHouseRentService.getDetachedHouseRentsByRoadCondition(roadCondition);
        return ResponseEntity.ok(detachedHouseRents);
    }
    
    // 전월세구분으로 단독/다가구 전/월세 정보 조회
    @GetMapping("/rent-type/{rentType}")
    public ResponseEntity<List<DetachedHouseRentDTO>> getDetachedHouseRentsByRentType(@PathVariable String rentType) {
        log.info("전월세구분별 단독/다가구 전/월세 정보 조회 요청 - 전월세구분: {}", rentType);
        List<DetachedHouseRentDTO> detachedHouseRents = detachedHouseRentService.getDetachedHouseRentsByRentType(rentType);
        return ResponseEntity.ok(detachedHouseRents);
    }
    
    // 계약면적 범위로 단독/다가구 전/월세 정보 조회
    @GetMapping("/contract-area")
    public ResponseEntity<List<DetachedHouseRentDTO>> getDetachedHouseRentsByContractAreaRange(
            @RequestParam Double minContractArea, 
            @RequestParam Double maxContractArea) {
        log.info("계약면적 범위별 단독/다가구 전/월세 정보 조회 요청 - 최소: {}, 최대: {}", minContractArea, maxContractArea);
        List<DetachedHouseRentDTO> detachedHouseRents = detachedHouseRentService.getDetachedHouseRentsByContractAreaRange(minContractArea, maxContractArea);
        return ResponseEntity.ok(detachedHouseRents);
    }
    
    // 보증금 범위로 단독/다가구 전/월세 정보 조회
    @GetMapping("/deposit")
    public ResponseEntity<List<DetachedHouseRentDTO>> getDetachedHouseRentsByDepositRange(
            @RequestParam Long minDeposit, 
            @RequestParam Long maxDeposit) {
        log.info("보증금 범위별 단독/다가구 전/월세 정보 조회 요청 - 최소: {}, 최대: {}", minDeposit, maxDeposit);
        List<DetachedHouseRentDTO> detachedHouseRents = detachedHouseRentService.getDetachedHouseRentsByDepositRange(minDeposit, maxDeposit);
        return ResponseEntity.ok(detachedHouseRents);
    }
    
    // 월세 범위로 단독/다가구 전/월세 정보 조회
    @GetMapping("/monthly-rent")
    public ResponseEntity<List<DetachedHouseRentDTO>> getDetachedHouseRentsByMonthlyRentRange(
            @RequestParam Long minMonthlyRent, 
            @RequestParam Long maxMonthlyRent) {
        log.info("월세 범위별 단독/다가구 전/월세 정보 조회 요청 - 최소: {}, 최대: {}", minMonthlyRent, maxMonthlyRent);
        List<DetachedHouseRentDTO> detachedHouseRents = detachedHouseRentService.getDetachedHouseRentsByMonthlyRentRange(minMonthlyRent, maxMonthlyRent);
        return ResponseEntity.ok(detachedHouseRents);
    }
    
    // 건축년도 범위로 단독/다가구 전/월세 정보 조회
    @GetMapping("/construction-year")
    public ResponseEntity<List<DetachedHouseRentDTO>> getDetachedHouseRentsByConstructionYearRange(
            @RequestParam Integer minYear, 
            @RequestParam Integer maxYear) {
        log.info("건축년도 범위별 단독/다가구 전/월세 정보 조회 요청 - 최소: {}, 최대: {}", minYear, maxYear);
        List<DetachedHouseRentDTO> detachedHouseRents = detachedHouseRentService.getDetachedHouseRentsByConstructionYearRange(minYear, maxYear);
        return ResponseEntity.ok(detachedHouseRents);
    }
} 