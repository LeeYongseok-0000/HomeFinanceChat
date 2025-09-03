package com.back.controller;

import com.back.dto.PropertyDTO;
import com.back.dto.ReplyDTO;
import com.back.service.PropertyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ArrayList;
import java.util.HashMap;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/property")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
@Log4j2
public class PropertyController {

    private final PropertyService propertyService;

    // 매물 목록 조회
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getProperties(
            @RequestParam(value = "propertyType", required = false) String propertyType,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "memberEmail", required = false) String memberEmail,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "50") int size) {
        
        try {
            List<PropertyDTO> allProperties;
            
            if (search != null && !search.trim().isEmpty()) {
                allProperties = propertyService.searchProperties(search);
            } else if (propertyType != null && !propertyType.trim().isEmpty() && !"전체".equals(propertyType)) {
                allProperties = propertyService.getPropertiesByType(propertyType);
            } else {
                allProperties = propertyService.getAllPropertiesWithLikeStatus(memberEmail);
            }
            
            // 디버깅: 매물 정보 로깅
            log.info("=== 매물 목록 디버깅 ===");
            for (PropertyDTO property : allProperties) {
                log.info("매물 ID: {}, 제목: {}, 거래유형: {}, 가격: {}, 월세: {}", 
                    property.getId(), property.getTitle(), property.getTransactionType(), 
                    property.getPrice(), property.getMonthlyRent());
            }
            log.info("========================");
            
            // 페이징 처리
            int totalElements = allProperties.size();
            int totalPages = (int) Math.ceil((double) totalElements / size);
            int startIndex = page * size;
            int endIndex = Math.min(startIndex + size, totalElements);
            
            List<PropertyDTO> properties = allProperties.subList(startIndex, endIndex);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", properties);
            response.put("totalElements", totalElements);
            response.put("totalPages", totalPages);
            response.put("currentPage", page);
            response.put("size", size);
            response.put("first", page == 0);
            response.put("last", page >= totalPages - 1);
            
            log.info("매물 목록 조회 완료 - 총 {}개, 페이지: {}, 크기: {}, Member: {}", 
                    totalElements, page, size, memberEmail);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("매물 목록 조회 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // 매물 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<PropertyDTO> getProperty(@PathVariable("id") Long id, @RequestParam(value = "memberEmail", required = false) String memberEmail) {
        try {
            log.info("매물 상세 조회 요청 - ID: {}, Member: {}", id, memberEmail);
            
            // 조회수 증가
            propertyService.incrementViewCount(id);
            
            Optional<PropertyDTO> property = propertyService.getProperty(id, memberEmail);
            if (property.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(property.get());
            
        } catch (Exception e) {
            log.error("매물 상세 조회 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // 지도용 매물 데이터 조회
    @GetMapping("/map")
    public ResponseEntity<Map<String, Object>> getPropertiesForMap(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "propertyType", required = false) String propertyType,
            @RequestParam(name = "transactionType", required = false) String transactionType,
            @RequestParam(name = "memberEmail", required = false) String memberEmail,
            @RequestParam(name = "saleMin", required = false) Double saleMin,
            @RequestParam(name = "saleMax", required = false) Double saleMax,
            @RequestParam(name = "depositMin", required = false) Double depositMin,
            @RequestParam(name = "depositMax", required = false) Double depositMax,
            @RequestParam(name = "monthlyRentMin", required = false) Double monthlyRentMin,
            @RequestParam(name = "monthlyRentMax", required = false) Double monthlyRentMax,
            @RequestParam(name = "areaMin", required = false) Double areaMin,
            @RequestParam(name = "areaMax", required = false) Double areaMax,
            @RequestParam(name = "roomCount", required = false) Integer roomCount,
            @RequestParam(name = "bathroomCount", required = false) Integer bathroomCount,
            @RequestParam(name = "floor", required = false) Integer floor,
            @RequestParam(name = "yearBuiltMin", required = false) Integer yearBuiltMin,
            @RequestParam(name = "yearBuiltMax", required = false) Integer yearBuiltMax) {
        try {
            log.info("지도용 매물 데이터 조회 - page: {}, size: {}, propertyType: {}, transactionType: {}, memberEmail: {}", page, size, propertyType, transactionType, memberEmail);
            log.info("=== 필터 파라미터 확인 ===");
            log.info("면적 범위: {} ~ {} m²", areaMin, areaMax);
            log.info("방 개수: {}", roomCount);
            log.info("화장실 개수: {}", bathroomCount);
            log.info("층수: {}", floor);
            log.info("준공년도 범위: {} ~ {}년", yearBuiltMin, yearBuiltMax);
            log.info("========================");
            
            List<PropertyDTO> properties;
            if (propertyType != null && !propertyType.trim().isEmpty() && !"전체".equals(propertyType)) {
                if (transactionType != null && !transactionType.trim().isEmpty() && !"전체".equals(transactionType)) {
                    // propertyType과 transactionType 모두 지정된 경우
                    properties = propertyService.getPropertiesByTypeAndTransactionType(propertyType, transactionType);
                } else {
                    // propertyType만 지정된 경우 - 필터 적용
                    properties = propertyService.getPropertiesByTypeWithFilters(propertyType, areaMin, areaMax, roomCount, bathroomCount, floor, yearBuiltMin, yearBuiltMax);
                }
            } else {
                if (transactionType != null && !transactionType.trim().isEmpty() && !"전체".equals(transactionType)) {
                    // transactionType만 지정된 경우 - 가격 필터링 포함
                    properties = propertyService.getPropertiesByTransactionTypeWithFilters(
                        transactionType, saleMin, saleMax, depositMin, depositMax, monthlyRentMin, monthlyRentMax, areaMin, areaMax);
                } else {
                    // 둘 다 지정되지 않은 경우 - 면적, 방 개수, 화장실 개수, 층수, 준공년도 필터 적용
                    properties = propertyService.getAllPropertiesWithFilters(areaMin, areaMax, roomCount, bathroomCount, floor, yearBuiltMin, yearBuiltMax);
                }
            }
            
            // memberEmail이 제공된 경우 기존 필터링된 결과에 좋아요 상태 추가
            if (memberEmail != null && !memberEmail.trim().isEmpty()) {
                // 기존 필터링된 결과를 유지하면서 좋아요 상태만 추가
                for (PropertyDTO property : properties) {
                    boolean isLiked = propertyService.isLikedByMember(property.getId(), memberEmail);
                    property.setIsLiked(isLiked);
                }
            }
            
            // 페이징 처리
            int totalElements = properties.size();
            int totalPages = (int) Math.ceil((double) totalElements / size);
            int startIndex = page * size;
            int endIndex = Math.min(startIndex + size, totalElements);
            
            List<PropertyDTO> pagedProperties = properties.subList(startIndex, endIndex);
            
            Map<String, Object> response = Map.of(
                "content", pagedProperties,
                "totalPages", totalPages,
                "totalElements", totalElements,
                "currentPage", page,
                "size", size
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("지도용 매물 데이터 조회 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // 공통 Property 객체 빌드 메서드
    private PropertyDTO buildProperty(String title, String content, String writer, String writerEmail,
                                 String propertyType, String transactionType, String price, String monthlyRent,
                                 Double area, Integer rooms, Integer bathrooms, Integer floor, Integer totalFloors, Integer yearBuilt,
                                 String roadAddress, String detailAddress, String parking, String heating, Boolean balcony,
                                 String petAllowed, Boolean elevator, Boolean tv, Boolean airConditioner,
                                 Boolean shoeCabinet, Boolean refrigerator, Boolean washingMachine,
                                 Boolean bathtub, Boolean sink, Boolean induction, Boolean wardrobe,
                                 Boolean fireAlarm, List<String> imageUrls) {
        return PropertyDTO.builder()
                .title(title)
                .content(content)
                .writer(writer)
                .writerEmail(writerEmail)
                .propertyType(propertyType)
                .transactionType(transactionType)
                .price(price)
                .monthlyRent(monthlyRent)
                .area(area)
                .rooms(rooms)
                .bathrooms(bathrooms)
                .floor(floor)
                .totalFloors(totalFloors)
                .yearBuilt(yearBuilt)
                .roadAddress(roadAddress)
                .detailAddress(detailAddress)
                .parking(parking)
                .heating(heating)
                .balcony(balcony)
                .petAllowed(petAllowed)
                .elevator(elevator)
                .tv(tv)
                .airConditioner(airConditioner)
                .shoeCabinet(shoeCabinet)
                .refrigerator(refrigerator)
                .washingMachine(washingMachine)
                .bathtub(bathtub)
                .sink(sink)
                .induction(induction)
                .wardrobe(wardrobe)
                .fireAlarm(fireAlarm)
                .imageUrls(imageUrls)
                .build();
    }

    // 매물 등록
    @PostMapping
    public ResponseEntity<PropertyDTO> createProperty(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("writer") String writer,
            @RequestParam(value = "writerEmail", required = false) String writerEmail,
            @RequestParam("propertyType") String propertyType,
            @RequestParam("transactionType") String transactionType,
            @RequestParam(value = "price", required = false) String price,
            @RequestParam(value = "monthlyRent", required = false) String monthlyRent,
            @RequestParam(value = "area", required = false) Double area,
            @RequestParam(value = "rooms", required = false) Integer rooms,
            @RequestParam(value = "bathrooms", required = false) Integer bathrooms,
            @RequestParam(value = "floor", required = false) Integer floor,
            @RequestParam(value = "totalFloors", required = false) Integer totalFloors,
            @RequestParam(value = "yearBuilt", required = false) Integer yearBuilt,
            @RequestParam(value = "roadAddress", required = false) String roadAddress,
            @RequestParam(value = "detailAddress", required = false) String detailAddress,
            @RequestParam(value = "parking", required = false) String parking,
            @RequestParam(value = "heating", required = false) String heating,
            @RequestParam(value = "balcony", required = false) Boolean balcony,
            @RequestParam(value = "petAllowed", required = false) String petAllowed,
            @RequestParam(value = "elevator", required = false) Boolean elevator,
            @RequestParam(value = "tv", required = false) Boolean tv,
            @RequestParam(value = "airConditioner", required = false) Boolean airConditioner,
            @RequestParam(value = "shoeCabinet", required = false) Boolean shoeCabinet,
            @RequestParam(value = "refrigerator", required = false) Boolean refrigerator,
            @RequestParam(value = "washingMachine", required = false) Boolean washingMachine,
            @RequestParam(value = "bathtub", required = false) Boolean bathtub,
            @RequestParam(value = "sink", required = false) Boolean sink,
            @RequestParam(value = "induction", required = false) Boolean induction,
            @RequestParam(value = "wardrobe", required = false) Boolean wardrobe,
            @RequestParam(value = "fireAlarm", required = false) Boolean fireAlarm,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        
        try {
            log.info("매물 등록 요청 시작");
            log.info("필수 파라미터 - 제목: {}, 작성자: {}, 매물유형: {}, 거래유형: {}", title, writer, propertyType, transactionType);
            log.info("주소 정보 - 도로명주소: {}, 상세주소: {}", roadAddress, detailAddress);
            log.info("가격 정보 - 가격: {}, 월세: {}", price, monthlyRent);
            log.info("면적 정보 - 면적: {}, 방개수: {}, 화장실개수: {}", area, rooms, bathrooms);
            log.info("층수 정보 - 현재층: {}, 전체층: {}, 준공년도: {}", floor, totalFloors, yearBuilt);
            log.info("옵션 정보 - 주차: {}, 난방: {}, 반려동물: {}", parking, heating, petAllowed);
            log.info("편의시설 - 엘리베이터: {}, 발코니: {}, TV: {}, 에어컨: {}", elevator, balcony, tv, airConditioner);
            log.info("가전제품 - 신발장: {}, 냉장고: {}, 세탁기: {}, 욕조: {}, 싱크대: {}, 인덕션: {}, 옷장: {}, 화재경보기: {}", 
                    shoeCabinet, refrigerator, washingMachine, bathtub, sink, induction, wardrobe, fireAlarm);
            log.info("이미지 파일 수: {}", images != null ? images.size() : 0);
            
            List<String> imageUrls = propertyService.saveImages(images);
            log.info("이미지 저장 완료 - URL 수: {}", imageUrls.size());
            
            PropertyDTO property = buildProperty(title, content, writer, writerEmail, propertyType, transactionType, price, monthlyRent,
                    area, rooms, bathrooms, floor, totalFloors, yearBuilt, roadAddress, detailAddress, parking, heating,
                    balcony, petAllowed, elevator, tv, airConditioner, shoeCabinet, refrigerator,
                    washingMachine, bathtub, sink, induction, wardrobe, fireAlarm, imageUrls);
            
            log.info("PropertyDTO 생성 완료");
            
            property.setStatus("판매중");
            
            PropertyDTO savedProperty = propertyService.save(property);
            log.info("매물 등록 완료 - ID: {}", savedProperty.getId());
            
            return ResponseEntity.ok(savedProperty);
            
        } catch (Exception e) {
            log.error("매물 등록 실패 - 상세 에러: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 매물 수정
    @PutMapping("/{id}")
    public ResponseEntity<PropertyDTO> updateProperty(
            @PathVariable("id") Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("propertyType") String propertyType,
            @RequestParam("transactionType") String transactionType,
            @RequestParam(value = "price", required = false) String price,
            @RequestParam(value = "monthlyRent", required = false) String monthlyRent,
            @RequestParam(value = "area", required = false) Double area,
            @RequestParam(value = "rooms", required = false) Integer rooms,
            @RequestParam(value = "bathrooms", required = false) Integer bathrooms,
            @RequestParam(value = "floor", required = false) Integer floor,
            @RequestParam(value = "totalFloors", required = false) Integer totalFloors,
            @RequestParam(value = "yearBuilt", required = false) Integer yearBuilt,
            @RequestParam(value = "roadAddress", required = false) String roadAddress,
            @RequestParam(value = "detailAddress", required = false) String detailAddress,
            @RequestParam(value = "parking", required = false) String parking,
            @RequestParam(value = "heating", required = false) String heating,
            @RequestParam(value = "balcony", required = false) Boolean balcony,
            @RequestParam(value = "petAllowed", required = false) String petAllowed,
            @RequestParam(value = "elevator", required = false) Boolean elevator,
            @RequestParam(value = "tv", required = false) Boolean tv,
            @RequestParam(value = "airConditioner", required = false) Boolean airConditioner,
            @RequestParam(value = "shoeCabinet", required = false) Boolean shoeCabinet,
            @RequestParam(value = "refrigerator", required = false) Boolean refrigerator,
            @RequestParam(value = "washingMachine", required = false) Boolean washingMachine,
            @RequestParam(value = "bathtub", required = false) Boolean bathtub,
            @RequestParam(value = "sink", required = false) Boolean sink,
            @RequestParam(value = "induction", required = false) Boolean induction,
            @RequestParam(value = "wardrobe", required = false) Boolean wardrobe,
            @RequestParam(value = "fireAlarm", required = false) Boolean fireAlarm,
            @RequestParam(value = "deletedImages", required = false) List<String> deletedImages,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        try {
            log.info("매물 수정 요청 - ID: {}", id);
            log.info("수정 요청 파라미터 - title: {}, content: {}, propertyType: {}, price: {}", 
                    title, content, propertyType, price);
            log.info("삭제할 이미지: {}", deletedImages);
            
            // 기존 매물 정보 조회
            Optional<PropertyDTO> existingProperty = propertyService.getProperty(id, null);
            if (existingProperty.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // 현재 이미지 URL 목록 (기존 이미지 복사)
            List<String> currentImageUrls = new ArrayList<>();
            if (existingProperty.get().getImageUrls() != null) {
                currentImageUrls.addAll(existingProperty.get().getImageUrls());
            }
            
            // 삭제할 이미지 처리
            if (deletedImages != null && !deletedImages.isEmpty()) {
                log.info("이미지 삭제 처리 시작 - 삭제할 이미지 개수: {}", deletedImages.size());
                for (String imageUrl : deletedImages) {
                    try {
                        // 파일 시스템에서 이미지 삭제
                        propertyService.deleteImage(imageUrl);
                        // 현재 이미지 목록에서 제거
                        currentImageUrls.remove(imageUrl);
                        log.info("이미지 삭제 완료: {}", imageUrl);
                    } catch (Exception e) {
                        log.error("이미지 삭제 실패: {}", imageUrl, e);
                    }
                }
            }
            
            // 새 이미지 추가
            if (images != null && !images.isEmpty()) {
                log.info("새 이미지 추가 시작 - 새 이미지 개수: {}", images.size());
                List<String> newImageUrls = propertyService.saveImages(images);
                currentImageUrls.addAll(newImageUrls);
                log.info("새 이미지 추가 완료 - 총 이미지 개수: {}", currentImageUrls.size());
            }
            
            PropertyDTO property = buildProperty(title, content, existingProperty.get().getWriter(), existingProperty.get().getWriterEmail(), propertyType, transactionType, price, monthlyRent,
                    area, rooms, bathrooms, floor, totalFloors, yearBuilt, roadAddress, detailAddress, parking, heating,
                    balcony, petAllowed, elevator, tv, airConditioner, shoeCabinet, refrigerator,
                    washingMachine, bathtub, sink, induction, wardrobe, fireAlarm, currentImageUrls);
            
            // 기존 상태 정보 유지
            property.setStatus(existingProperty.get().getStatus());
            property.setViewCount(existingProperty.get().getViewCount());
            property.setLikeCount(existingProperty.get().getLikeCount());
            property.setIsLiked(existingProperty.get().getIsLiked());
            property.setCreatedAt(existingProperty.get().getCreatedAt());
            
            PropertyDTO updatedProperty = propertyService.update(id, property);
            log.info("매물 수정 완료 - ID: {}, 최종 이미지 개수: {}", updatedProperty.getId(), currentImageUrls.size());
            
            return ResponseEntity.ok(updatedProperty);
            
        } catch (IllegalArgumentException e) {
            log.warn("매물을 찾을 수 없음 - ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("매물 수정 실패 - ID: {}, 오류: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 매물 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable("id") Long id) {
        try {
            log.info("매물 삭제 요청 - ID: {}", id);
            
            propertyService.delete(id);
            log.info("매물 삭제 완료 - ID: {}", id);
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("매물 삭제 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // 좋아요 처리
    @PostMapping("/{id}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable("id") Long id, @RequestParam(value = "memberEmail") String memberEmail) {
        try {
            log.info("매물 좋아요 처리 요청 - ID: {}, Member: {}", id, memberEmail);
            propertyService.toggleLike(id, memberEmail);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("매물 좋아요 처리 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 사용자가 좋아요한 매물 목록 조회
    @GetMapping("/liked")
    public ResponseEntity<List<PropertyDTO>> getLikedProperties(@RequestParam("memberEmail") String memberEmail) {
        try {
            log.info("사용자 좋아요 매물 목록 조회 요청 - Member: {}", memberEmail);
            
            if (memberEmail == null || memberEmail.trim().isEmpty()) {
                log.error("memberEmail이 null이거나 비어있음");
                return ResponseEntity.badRequest().body(new ArrayList<>());
            }
            
            List<PropertyDTO> likedProperties = propertyService.getLikedPropertiesByMember(memberEmail);
            log.info("좋아요 매물 목록 조회 완료 - {}개", likedProperties.size());
            
            // 디버깅: 좋아요한 매물 정보 로깅
            for (PropertyDTO property : likedProperties) {
                log.info("좋아요한 매물 - ID: {}, 제목: {}, 거래유형: {}", 
                    property.getId(), property.getTitle(), property.getTransactionType());
            }
            
            return ResponseEntity.ok(likedProperties);
        } catch (Exception e) {
            log.error("좋아요 매물 목록 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    

    
    // 거래 상태 업데이트
    @PutMapping("/{id}/transaction-status")
    public ResponseEntity<Void> updateTransactionStatus(
            @PathVariable("id") Long id,
            @RequestParam(value = "transactionStatus") Integer transactionStatus) {
        try {
            log.info("매물 거래 상태 업데이트 요청 - ID: {}, 상태: {}", id, transactionStatus);
            propertyService.updateTransactionStatus(id, transactionStatus);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("매물 거래 상태 업데이트 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // 매물 상태 업데이트
    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable("id") Long id,
            @RequestParam(value = "status") String status) {
        try {
            log.info("매물 상태 업데이트 요청 - ID: {}, 상태: {}", id, status);
            propertyService.updateStatus(id, status);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("매물 상태 업데이트 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // 본인이 작성한 매물 목록 조회 (검수요청되어 업로드된 것만)
    @GetMapping("/my")
    public ResponseEntity<List<PropertyDTO>> getMyProperties(
            @RequestParam("memberEmail") String memberEmail) {
        try {
            log.info("본인 매물 목록 조회 요청 - Member: {}", memberEmail);
            
            if (memberEmail == null || memberEmail.trim().isEmpty()) {
                log.error("memberEmail이 null이거나 비어있음");
                return ResponseEntity.badRequest().body(new ArrayList<>());
            }
            
            List<PropertyDTO> properties = propertyService.getMyProperties(memberEmail);
            log.info("본인 작성 매물 목록 조회 완료 - {}개", properties.size());
            
            // 디버깅: 본인 작성 매물 정보 로깅
            for (PropertyDTO property : properties) {
                log.info("본인 작성 매물 - ID: {}, 제목: {}, 거래유형: {}, 상태: {}", 
                    property.getId(), property.getTitle(), property.getTransactionType(), property.getStatus());
            }
            
            return ResponseEntity.ok(properties);
            
        } catch (Exception e) {
            log.error("본인 매물 목록 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 댓글 관련 API
    @GetMapping("/{propertyId}/inquiries")
    public ResponseEntity<List<ReplyDTO>> getPropertyInquiries(@PathVariable("propertyId") Long propertyId) {
        try {
            List<ReplyDTO> inquiries = propertyService.getPropertyInquiriesAsDTO(propertyId);
            return ResponseEntity.ok(inquiries);
        } catch (Exception e) {
            log.error("매물 문의 조회 실패 - PropertyId: {}, 오류: {}", propertyId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{propertyId}/inquiries")
    public ResponseEntity<ReplyDTO> createPropertyInquiry(
            @PathVariable("propertyId") Long propertyId,
            @RequestBody ReplyDTO inquiryDTO) {
        try {
            ReplyDTO savedInquiry = propertyService.createPropertyInquiryAsDTO(propertyId, inquiryDTO);
            return ResponseEntity.ok(savedInquiry);
        } catch (Exception e) {
            log.error("매물 문의 등록 실패 - PropertyId: {}, 오류: {}", propertyId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/inquiries/{inquiryId}")
    public ResponseEntity<Void> deletePropertyInquiry(
            @PathVariable("inquiryId") Long inquiryId,
            @RequestParam(value = "writerEmail") String writerEmail) {
        try {
            // 삭제 로직은 별도 구현 필요
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("매물 문의 삭제 실패 - InquiryId: {}, 오류: {}", inquiryId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/inquiries/{inquiryId}/replies")
    public ResponseEntity<List<ReplyDTO>> getInquiryReplies(@PathVariable("inquiryId") Long inquiryId) {
        try {
            List<ReplyDTO> replies = propertyService.getInquiryRepliesAsDTO(inquiryId);
            return ResponseEntity.ok(replies);
        } catch (Exception e) {
            log.error("문의 답글 조회 실패 - InquiryId: {}, 오류: {}", inquiryId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/inquiries/{inquiryId}/replies")
    public ResponseEntity<ReplyDTO> createInquiryReply(
            @PathVariable("inquiryId") Long inquiryId, 
            @RequestBody ReplyDTO replyDTO) {
        try {
            ReplyDTO savedReply = propertyService.createInquiryReplyAsDTO(inquiryId, replyDTO);
            return ResponseEntity.ok(savedReply);
        } catch (Exception e) {
            log.error("문의 답글 등록 실패 - InquiryId: {}, 오류: {}", inquiryId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/inquiries/replies/{replyId}")
    public ResponseEntity<Void> deleteInquiryReply(
            @PathVariable("replyId") Long replyId,
            @RequestParam(value = "writerEmail") String writerEmail) {
        try {
            // 삭제 로직은 별도 구현 필요
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("문의 답글 삭제 실패 - ReplyId: {}, 오류: {}", replyId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // DTO를 사용하는 엔드포인트들
    @GetMapping("/{propertyId}/inquiries/dto")
    public ResponseEntity<List<ReplyDTO>> getPropertyInquiriesAsDTO(@PathVariable("propertyId") Long propertyId) {
        try {
            List<ReplyDTO> inquiries = propertyService.getPropertyInquiriesAsDTO(propertyId);
            return ResponseEntity.ok(inquiries);
        } catch (Exception e) {
            log.error("매물 문의 목록 조회 실패 - PropertyId: {}, 오류: {}", propertyId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{propertyId}/inquiries/dto")
    public ResponseEntity<ReplyDTO> createPropertyInquiryAsDTO(
            @PathVariable("propertyId") Long propertyId, 
            @RequestBody ReplyDTO inquiryDTO) {
        try {
            ReplyDTO savedInquiry = propertyService.createPropertyInquiryAsDTO(propertyId, inquiryDTO);
            return ResponseEntity.ok(savedInquiry);
        } catch (Exception e) {
            log.error("매물 문의 등록 실패 - PropertyId: {}, 오류: {}", propertyId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/inquiries/{inquiryId}/replies/dto")
    public ResponseEntity<List<ReplyDTO>> getInquiryRepliesAsDTO(@PathVariable("inquiryId") Long inquiryId) {
        try {
            List<ReplyDTO> replies = propertyService.getInquiryRepliesAsDTO(inquiryId);
            return ResponseEntity.ok(replies);
        } catch (Exception e) {
            log.error("문의 답글 목록 조회 실패 - InquiryId: {}, 오류: {}", inquiryId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/inquiries/{inquiryId}/replies/dto")
    public ResponseEntity<ReplyDTO> createInquiryReplyAsDTO(
            @PathVariable("inquiryId") Long inquiryId, 
            @RequestBody ReplyDTO replyDTO) {
        try {
            ReplyDTO savedReply = propertyService.createInquiryReplyAsDTO(inquiryId, replyDTO);
            return ResponseEntity.ok(savedReply);
        } catch (Exception e) {
            log.error("문의 답글 등록 실패 - InquiryId: {}, 오류: {}", inquiryId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 실거래가 조회 엔드포인트
    @GetMapping("/{id}/market-price")
    public ResponseEntity<Map<String, Object>> getMarketPrice(@PathVariable("id") Long id) {
        try {
            log.info("실거래가 조회 요청 - Property ID: {}", id);
            
            Optional<PropertyDTO> property = propertyService.getProperty(id, null);
            if (property.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // Property의 roadAddress와 면적을 기준으로 실거래가 조회
            List<Map<String, Object>> sales = propertyService.getRecentSalesByAddress(
                property.get().getRoadAddress(), property.get().getArea());
            List<Map<String, Object>> rents = propertyService.getRecentRentsByAddress(
                property.get().getRoadAddress(), property.get().getArea());
            
            Map<String, Object> result = new HashMap<>();
            result.put("sales", sales);
            result.put("rents", rents);
            result.put("propertyAddress", property.get().getRoadAddress());
            result.put("propertyArea", property.get().getArea());
            
            log.info("실거래가 조회 완료 - 매매: {}건, 전월세: {}건", sales.size(), rents.size());
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            log.warn("매물을 찾을 수 없음 - ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("실거래가 조회 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
