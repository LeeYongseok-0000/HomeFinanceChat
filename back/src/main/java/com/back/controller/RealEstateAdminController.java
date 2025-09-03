package com.back.controller;

import com.back.domain.*;
import com.back.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/real-estate-admin")
@RequiredArgsConstructor
@Log4j2
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "false")
public class RealEstateAdminController {
    
    private final ApartmentSaleService apartmentSaleService;
    private final ApartmentRentService apartmentRentService;
    private final DetachedHouseSaleService detachedHouseSaleService;
    private final DetachedHouseRentService detachedHouseRentService;
    private final RowHouseSaleService rowHouseSaleService;
    private final RowHouseRentService rowHouseRentService;
    private final OfficeTelSaleService officeTelSaleService;
    private final OfficeTelRentService officeTelRentService;

    // ==================== 아파트 매매 관리 ====================
    
    @GetMapping("/apartment-sale")
    public ResponseEntity<Page<ApartmentSale>> getApartmentSales(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            // 번호 역순으로 정렬된 데이터 조회
            Page<ApartmentSale> result = apartmentSaleService.findAllOrderByNoDesc(pageable);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("아파트 매매 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/apartment-sale")
    public ResponseEntity<ApartmentSale> createApartmentSale(@RequestBody ApartmentSale apartmentSale) {
        try {
            ApartmentSale saved = apartmentSaleService.save(apartmentSale);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("아파트 매매 등록 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/apartment-sale/{id}")
    public ResponseEntity<ApartmentSale> updateApartmentSale(@PathVariable Long id, @RequestBody ApartmentSale apartmentSale) {
        try {
            ApartmentSale updated = apartmentSaleService.update(id, apartmentSale);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("아파트 매매 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/apartment-sale/{id}")
    public ResponseEntity<Map<String, String>> deleteApartmentSale(@PathVariable Long id) {
        try {
            apartmentSaleService.deleteById(id);
            Map<String, String> response = new HashMap<>();
            response.put("success", "true");
            response.put("message", "아파트 매매 정보가 성공적으로 삭제되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("아파트 매매 정보 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== 아파트 전/월세 관리 ====================
    
    @GetMapping("/apartment-rent")
    public ResponseEntity<Page<ApartmentRent>> getApartmentRents(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            // ID 역순으로 정렬된 데이터 조회
            Page<ApartmentRent> result = apartmentRentService.findAllOrderByIdDesc(pageable);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("아파트 전/월세 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/apartment-rent")
    public ResponseEntity<ApartmentRent> createApartmentRent(@RequestBody ApartmentRent apartmentRent) {
        try {
            ApartmentRent saved = apartmentRentService.save(apartmentRent);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("아파트 전/월세 등록 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/apartment-rent/{id}")
    public ResponseEntity<ApartmentRent> updateApartmentRent(@PathVariable Long id, @RequestBody ApartmentRent apartmentRent) {
        try {
            ApartmentRent updated = apartmentRentService.update(id, apartmentRent);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("아파트 전/월세 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/apartment-rent/{id}")
    public ResponseEntity<Void> deleteApartmentRent(@PathVariable Long id) {
        try {
            apartmentRentService.delete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("아파트 전/월세 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== 단독/다가구 매매 관리 ====================
    
    @GetMapping("/detached-house-sale")
    public ResponseEntity<Page<DetachedHouseSale>> getDetachedHouseSales(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            // 번호 역순으로 정렬된 데이터 조회
            Page<DetachedHouseSale> result = detachedHouseSaleService.findAllOrderByNoDesc(pageable);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("단독/다가구 매매 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/detached-house-sale")
    public ResponseEntity<DetachedHouseSale> createDetachedHouseSale(@RequestBody DetachedHouseSale detachedHouseSale) {
        try {
            DetachedHouseSale saved = detachedHouseSaleService.save(detachedHouseSale);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("단독/다가구 매매 등록 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/detached-house-sale/{id}")
    public ResponseEntity<DetachedHouseSale> updateDetachedHouseSale(@PathVariable Long id, @RequestBody DetachedHouseSale detachedHouseSale) {
        try {
            DetachedHouseSale updated = detachedHouseSaleService.update(id, detachedHouseSale);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("단독/다가구 매매 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/detached-house-sale/{id}")
    public ResponseEntity<Void> deleteDetachedHouseSale(@PathVariable Long id) {
        try {
            detachedHouseSaleService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("단독/다가구 매매 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== 단독/다가구 전/월세 관리 ====================
    
    @GetMapping("/detached-house-rent")
    public ResponseEntity<Page<DetachedHouseRent>> getDetachedHouseRents(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            // 번호 역순으로 정렬된 데이터 조회
            Page<DetachedHouseRent> result = detachedHouseRentService.findAllOrderByNoDesc(pageable);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("단독/다가구 전/월세 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/detached-house-rent")
    public ResponseEntity<DetachedHouseRent> createDetachedHouseRent(@RequestBody DetachedHouseRent detachedHouseRent) {
        try {
            DetachedHouseRent saved = detachedHouseRentService.save(detachedHouseRent);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("단독/다가구 전/월세 등록 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/detached-house-rent/{id}")
    public ResponseEntity<DetachedHouseRent> updateDetachedHouseRent(@PathVariable Long id, @RequestBody DetachedHouseRent detachedHouseRent) {
        try {
            DetachedHouseRent updated = detachedHouseRentService.update(id, detachedHouseRent);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("단독/다가구 전/월세 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/detached-house-rent/{id}")
    public ResponseEntity<Void> deleteDetachedHouseRent(@PathVariable Long id) {
        try {
            detachedHouseRentService.delete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("단독/다가구 전/월세 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== 연립/다세대 매매 관리 ====================
    
    @GetMapping("/row-house-sale")
    public ResponseEntity<Page<RowHouseSale>> getRowHouseSales(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            // 번호 역순으로 정렬된 데이터 조회
            Page<RowHouseSale> result = rowHouseSaleService.findAllOrderByNoDesc(pageable);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("연립/다세대 매매 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/row-house-sale")
    public ResponseEntity<RowHouseSale> createRowHouseSale(@RequestBody RowHouseSale rowHouseSale) {
        try {
            RowHouseSale saved = rowHouseSaleService.save(rowHouseSale);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("연립/다세대 매매 등록 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/row-house-sale/{id}")
    public ResponseEntity<RowHouseSale> updateRowHouseSale(@PathVariable Long id, @RequestBody RowHouseSale rowHouseSale) {
        try {
            RowHouseSale updated = rowHouseSaleService.update(id, rowHouseSale);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("연립/다세대 매매 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/row-house-sale/{id}")
    public ResponseEntity<Void> deleteRowHouseSale(@PathVariable Long id) {
        try {
            rowHouseSaleService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("연립/다세대 매매 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== 연립/다세대 전/월세 관리 ====================
    
    @GetMapping("/row-house-rent")
    public ResponseEntity<Page<RowHouseRent>> getRowHouseRents(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            // 번호 역순으로 정렬된 데이터 조회
            Page<RowHouseRent> result = rowHouseRentService.findAllOrderByNoDesc(pageable);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("연립/다세대 전/월세 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/row-house-rent")
    public ResponseEntity<RowHouseRent> createRowHouseRent(@RequestBody RowHouseRent rowHouseRent) {
        try {
            RowHouseRent saved = rowHouseRentService.save(rowHouseRent);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("연립/다세대 전/월세 등록 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/row-house-rent/{id}")
    public ResponseEntity<RowHouseRent> updateRowHouseRent(@PathVariable Long id, @RequestBody RowHouseRent rowHouseRent) {
        try {
            RowHouseRent updated = rowHouseRentService.update(id, rowHouseRent);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("연립/다세대 전/월세 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/row-house-rent/{id}")
    public ResponseEntity<Void> deleteRowHouseRent(@PathVariable Long id) {
        try {
            rowHouseRentService.delete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("연립/다세대 전/월세 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== 오피스텔 매매 관리 ====================
    
    @GetMapping("/office-tel-sale")
    public ResponseEntity<Page<OfficeTelSale>> getOfficeTelSales(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            // 번호 역순으로 정렬된 데이터 조회
            Page<OfficeTelSale> result = officeTelSaleService.findAllOrderByNoDesc(pageable);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("오피스텔 매매 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/office-tel-sale")
    public ResponseEntity<OfficeTelSale> createOfficeTelSale(@RequestBody OfficeTelSale officeTelSale) {
        try {
            OfficeTelSale saved = officeTelSaleService.save(officeTelSale);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("오피스텔 매매 등록 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/office-tel-sale/{id}")
    public ResponseEntity<OfficeTelSale> updateOfficeTelSale(@PathVariable Long id, @RequestBody OfficeTelSale officeTelSale) {
        try {
            OfficeTelSale updated = officeTelSaleService.update(id, officeTelSale);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("오피스텔 매매 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/office-tel-sale/{id}")
    public ResponseEntity<Void> deleteOfficeTelSale(@PathVariable Long id) {
        try {
            officeTelSaleService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("오피스텔 매매 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== 오피스텔 전/월세 관리 ====================
    
    @GetMapping("/office-tel-rent")
    public ResponseEntity<Page<OfficeTelRent>> getOfficeTelRents(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            // 번호 역순으로 정렬된 데이터 조회
            Page<OfficeTelRent> result = officeTelRentService.findAllOrderByNoDesc(pageable);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("오피스텔 전/월세 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/office-tel-rent")
    public ResponseEntity<OfficeTelRent> createOfficeTelRent(@RequestBody OfficeTelRent officeTelRent) {
        try {
            OfficeTelRent saved = officeTelRentService.save(officeTelRent);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("오피스텔 전/월세 등록 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/office-tel-rent/{id}")
    public ResponseEntity<OfficeTelRent> updateOfficeTelRent(@PathVariable Long id, @RequestBody OfficeTelRent officeTelRent) {
        try {
            OfficeTelRent updated = officeTelRentService.update(id, officeTelRent);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("오피스텔 전/월세 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/office-tel-rent/{id}")
    public ResponseEntity<Void> deleteOfficeTelRent(@PathVariable Long id) {
        try {
            officeTelRentService.delete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("오피스텔 전/월세 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== 통계 정보 ====================
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        try {
            Map<String, Object> stats = Map.of(
                "apartmentSaleCount", apartmentSaleService.count(),
                "apartmentRentCount", apartmentRentService.count(),
                "detachedHouseSaleCount", detachedHouseSaleService.count(),
                "detachedHouseRentCount", detachedHouseRentService.count(),
                "rowHouseSaleCount", rowHouseSaleService.count(),
                "rowHouseRentCount", rowHouseRentService.count(),
                "officeTelSaleCount", officeTelSaleService.count(),
                "officeTelRentCount", officeTelRentService.count()
            );
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("통계 정보 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 