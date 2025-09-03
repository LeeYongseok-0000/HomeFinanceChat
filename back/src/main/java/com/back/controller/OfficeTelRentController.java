package com.back.controller;

import com.back.dto.OfficeTelRentDTO;
import com.back.dto.OfficeTelRentSearchDTO;
import com.back.service.OfficeTelRentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/office-tel-rent")
@RequiredArgsConstructor
@Log4j2
public class OfficeTelRentController {
    
    private final OfficeTelRentService officeTelRentService;
    
    // 오피스텔 전월세 데이터 생성
    @PostMapping
    public ResponseEntity<OfficeTelRentDTO> createOfficeTelRent(@RequestBody OfficeTelRentDTO officeTelRentDTO) {
        log.info("오피스텔 전월세 데이터 생성 요청 - DTO: {}", officeTelRentDTO);
        try {
            OfficeTelRentDTO createdOfficeTelRent = officeTelRentService.createOfficeTelRent(officeTelRentDTO);
            return ResponseEntity.ok(createdOfficeTelRent);
        } catch (Exception e) {
            log.error("오피스텔 전월세 데이터 생성 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 모든 오피스텔 전/월세 정보 조회
    @GetMapping("/all")
    public ResponseEntity<List<OfficeTelRentDTO>> getAllOfficeTelRents() {
        log.info("모든 오피스텔 전/월세 정보 조회 요청");
        List<OfficeTelRentDTO> officeTelRents = officeTelRentService.getAllOfficeTelRents();
        return ResponseEntity.ok(officeTelRents);
    }
    
    // ID로 오피스텔 전/월세 정보 조회
    @GetMapping("/{id}")
    public ResponseEntity<OfficeTelRentDTO> getOfficeTelRentById(@PathVariable Long id) {
        log.info("ID별 오피스텔 전/월세 정보 조회 요청 - ID: {}", id);
        OfficeTelRentDTO officeTelRent = officeTelRentService.getOfficeTelRentById(id);
        return ResponseEntity.ok(officeTelRent);
    }
    
    // 검색 조건에 따른 오피스텔 전/월세 정보 조회
    @PostMapping("/search")
    public ResponseEntity<List<OfficeTelRentDTO>> searchOfficeTelRents(@RequestBody OfficeTelRentSearchDTO searchDTO) {
        log.info("오피스텔 전/월세 검색 요청 - 조건: {}", searchDTO);
        List<OfficeTelRentDTO> officeTelRents = officeTelRentService.searchOfficeTelRents(searchDTO);
        return ResponseEntity.ok(officeTelRents);
    }
    
    // 시군구로 오피스텔 전/월세 정보 조회
    @GetMapping("/sigungu/{sigungu}")
    public ResponseEntity<List<OfficeTelRentDTO>> getOfficeTelRentsBySigungu(@PathVariable String sigungu) {
        log.info("시군구별 오피스텔 전/월세 정보 조회 요청 - 시군구: {}", sigungu);
        List<OfficeTelRentDTO> officeTelRents = officeTelRentService.getOfficeTelRentsBySigungu(sigungu);
        return ResponseEntity.ok(officeTelRents);
    }
    
    // 단지명으로 오피스텔 전/월세 정보 조회
    @GetMapping("/complex/{complexName}")
    public ResponseEntity<List<OfficeTelRentDTO>> getOfficeTelRentsByComplexName(@PathVariable String complexName) {
        log.info("단지명별 오피스텔 전/월세 정보 조회 요청 - 단지명: {}", complexName);
        List<OfficeTelRentDTO> officeTelRents = officeTelRentService.getOfficeTelRentsByComplexName(complexName);
        return ResponseEntity.ok(officeTelRents);
    }
    
    // 전월세구분으로 오피스텔 전/월세 정보 조회
    @GetMapping("/rent-type/{rentType}")
    public ResponseEntity<List<OfficeTelRentDTO>> getOfficeTelRentsByRentType(@PathVariable String rentType) {
        log.info("전월세구분별 오피스텔 전/월세 정보 조회 요청 - 전월세구분: {}", rentType);
        List<OfficeTelRentDTO> officeTelRents = officeTelRentService.getOfficeTelRentsByRentType(rentType);
        return ResponseEntity.ok(officeTelRents);
    }
    
    // 전용면적 범위로 오피스텔 전/월세 정보 조회
    @GetMapping("/area")
    public ResponseEntity<List<OfficeTelRentDTO>> getOfficeTelRentsByAreaRange(
            @RequestParam Double minArea, 
            @RequestParam Double maxArea) {
        log.info("전용면적 범위별 오피스텔 전/월세 정보 조회 요청 - 최소: {}, 최대: {}", minArea, maxArea);
        List<OfficeTelRentDTO> officeTelRents = officeTelRentService.getOfficeTelRentsByAreaRange(minArea, maxArea);
        return ResponseEntity.ok(officeTelRents);
    }
    
    // 보증금 범위로 오피스텔 전/월세 정보 조회
    @GetMapping("/deposit")
    public ResponseEntity<List<OfficeTelRentDTO>> getOfficeTelRentsByDepositRange(
            @RequestParam Long minDeposit, 
            @RequestParam Long maxDeposit) {
        log.info("보증금 범위별 오피스텔 전/월세 정보 조회 요청 - 최소: {}, 최대: {}", minDeposit, maxDeposit);
        List<OfficeTelRentDTO> officeTelRents = officeTelRentService.getOfficeTelRentsByDepositRange(minDeposit, maxDeposit);
        return ResponseEntity.ok(officeTelRents);
    }
    
    // 월세 범위로 오피스텔 전/월세 정보 조회
    @GetMapping("/monthly-rent")
    public ResponseEntity<List<OfficeTelRentDTO>> getOfficeTelRentsByMonthlyRentRange(
            @RequestParam Long minMonthlyRent, 
            @RequestParam Long maxMonthlyRent) {
        log.info("월세 범위별 오피스텔 전/월세 정보 조회 요청 - 최소: {}, 최대: {}", minMonthlyRent, maxMonthlyRent);
        List<OfficeTelRentDTO> officeTelRents = officeTelRentService.getOfficeTelRentsByMonthlyRentRange(minMonthlyRent, maxMonthlyRent);
        return ResponseEntity.ok(officeTelRents);
    }
    
    // 층 범위로 오피스텔 전/월세 정보 조회
    @GetMapping("/floor")
    public ResponseEntity<List<OfficeTelRentDTO>> getOfficeTelRentsByFloorRange(
            @RequestParam Integer minFloor, 
            @RequestParam Integer maxFloor) {
        log.info("층 범위별 오피스텔 전/월세 정보 조회 요청 - 최소: {}, 최대: {}", minFloor, maxFloor);
        List<OfficeTelRentDTO> officeTelRents = officeTelRentService.getOfficeTelRentsByFloorRange(minFloor, maxFloor);
        return ResponseEntity.ok(officeTelRents);
    }
    
    // 건축년도 범위로 오피스텔 전/월세 정보 조회
    @GetMapping("/construction-year")
    public ResponseEntity<List<OfficeTelRentDTO>> getOfficeTelRentsByConstructionYearRange(
            @RequestParam Integer minYear, 
            @RequestParam Integer maxYear) {
        log.info("건축년도 범위별 오피스텔 전/월세 정보 조회 요청 - 최소: {}, 최대: {}", minYear, maxYear);
        List<OfficeTelRentDTO> officeTelRents = officeTelRentService.getOfficeTelRentsByConstructionYearRange(minYear, maxYear);
        return ResponseEntity.ok(officeTelRents);
    }
} 