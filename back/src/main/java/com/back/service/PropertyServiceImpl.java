package com.back.service;

import com.back.domain.Property;
import com.back.domain.PropertyInquiry;
import com.back.domain.PropertyInquiryReply;
import com.back.domain.PropertyLike;
import com.back.domain.ApartmentSale;
import com.back.domain.ApartmentRent;
import com.back.domain.RowHouseSale;
import com.back.domain.RowHouseRent;
import com.back.domain.DetachedHouseSale;
import com.back.domain.DetachedHouseRent;
import com.back.domain.OfficeTelSale;
import com.back.domain.OfficeTelRent;
import com.back.dto.PropertyDTO;
import com.back.dto.ReplyDTO;
import com.back.repository.PropertyRepository;
import com.back.repository.PropertyInquiryRepository;
import com.back.repository.PropertyInquiryReplyRepository;
import com.back.repository.PropertyLikeRepository;
import com.back.repository.ApartmentSaleRepository;
import com.back.repository.ApartmentRentRepository;
import com.back.repository.RowHouseSaleRepository;
import com.back.repository.RowHouseRentRepository;
import com.back.repository.DetachedHouseSaleRepository;
import com.back.repository.DetachedHouseRentRepository;
import com.back.repository.OfficeTelSaleRepository;
import com.back.repository.OfficeTelRentRepository;
import com.back.util.CustomFileUtil;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDate;

@Service
@Log4j2
public class PropertyServiceImpl implements PropertyService {

    @Autowired
    private PropertyRepository propertyRepository;
    
    @Autowired
    private PropertyInquiryRepository propertyInquiryRepository;
    
    @Autowired
    private PropertyInquiryReplyRepository propertyInquiryReplyRepository;
    
    @Autowired
    private PropertyLikeRepository propertyLikeRepository;
    
    @Autowired
    private ApartmentSaleRepository apartmentSaleRepository;
    
    @Autowired
    private ApartmentRentRepository apartmentRentRepository;
    
    @Autowired
    private RowHouseSaleRepository rowHouseSaleRepository;
    
    @Autowired
    private RowHouseRentRepository rowHouseRentRepository;
    
    @Autowired
    private DetachedHouseSaleRepository detachedHouseSaleRepository;
    
    @Autowired
    private DetachedHouseRentRepository detachedHouseRentRepository;
    
    @Autowired
    private OfficeTelSaleRepository officeTelSaleRepository;
    
    @Autowired
    private OfficeTelRentRepository officeTelRentRepository;
    
    @Autowired
    private CustomFileUtil customFileUtil;

    // Entity를 DTO로 변환
    private PropertyDTO entityToDTO(Property property) {
        try {
            log.info("Property Entity를 DTO로 변환 시작 - ID: {}", property.getId());
            
            PropertyDTO dto = PropertyDTO.builder()
                    .id(property.getId())
                    .title(property.getTitle() != null ? property.getTitle() : "")
                    .content(property.getContent() != null ? property.getContent() : "")
                    .writer(property.getWriter() != null ? property.getWriter() : "")
                    .writerEmail(property.getWriterEmail() != null ? property.getWriterEmail() : "")
                    .propertyType(property.getPropertyType() != null ? property.getPropertyType() : "")
                    .transactionType(property.getTransactionType() != null ? property.getTransactionType() : "")
                    .price(property.getPrice() != null ? property.getPrice() : "")
                    .monthlyRent(property.getMonthlyRent() != null ? property.getMonthlyRent() : "")
                    .area(property.getArea())
                    .rooms(property.getRooms())
                    .bathrooms(property.getBathrooms())
                    .floor(property.getFloor())
                    .totalFloors(property.getTotalFloors())
                    .yearBuilt(property.getYearBuilt())
                    .roadAddress(property.getRoadAddress() != null ? property.getRoadAddress() : "")
                    .detailAddress(property.getDetailAddress() != null ? property.getDetailAddress() : "")
                    .latitude(property.getLatitude())
                    .longitude(property.getLongitude())
                    .parking(property.getParking() != null ? property.getParking() : "")
                    .heating(property.getHeating() != null ? property.getHeating() : "")
                    .petAllowed(property.getPetAllowed() != null ? property.getPetAllowed() : "")
                    .elevator(property.getElevator())
                    .balcony(property.getBalcony())
                    .tv(property.getTv())
                    .airConditioner(property.getAirConditioner())
                    .shoeCabinet(property.getShoeCabinet())
                    .refrigerator(property.getRefrigerator())
                    .washingMachine(property.getWashingMachine())
                    .bathtub(property.getBathtub())
                    .sink(property.getSink())
                    .induction(property.getInduction())
                    .wardrobe(property.getWardrobe())
                    .fireAlarm(property.getFireAlarm())
                    .status(property.getStatus() != null ? property.getStatus() : "")
                    .transactionStatus(property.getTransactionStatus())
                    .viewCount(property.getViewCount() != null ? property.getViewCount() : 0)
                    .likeCount(property.getLikeCount() != null ? property.getLikeCount() : 0)
                    .isLiked(property.getIsLiked() != null ? property.getIsLiked() : false)
                    .imageUrls(property.getImageUrls() != null ? property.getImageUrls() : new ArrayList<>())
                    .createdAt(property.getCreatedAt())
                    .updatedAt(property.getUpdatedAt())
                    .build();
            
            log.info("Property Entity를 DTO로 변환 완료 - ID: {}, 제목: {}", dto.getId(), dto.getTitle());
            return dto;
            
        } catch (Exception e) {
            log.error("Property Entity를 DTO로 변환 실패 - Property ID: {}, 오류: {}", property.getId(), e.getMessage(), e);
            throw new RuntimeException("Property DTO 변환 실패: " + e.getMessage(), e);
        }
    }

    // DTO를 Entity로 변환
    private Property dtoToEntity(PropertyDTO propertyDTO) {
        try {
            log.info("DTO를 Entity로 변환 시작 - ID: {}", propertyDTO.getId());
            
            Property property = Property.builder()
                    .id(propertyDTO.getId())
                    .title(propertyDTO.getTitle())
                    .content(propertyDTO.getContent())
                    .writer(propertyDTO.getWriter())
                    .writerEmail(propertyDTO.getWriterEmail())
                    .propertyType(propertyDTO.getPropertyType())
                    .transactionType(propertyDTO.getTransactionType())
                    .price(propertyDTO.getPrice())
                    .monthlyRent(propertyDTO.getMonthlyRent())
                    .area(propertyDTO.getArea())
                    .rooms(propertyDTO.getRooms())
                    .bathrooms(propertyDTO.getBathrooms())
                    .floor(propertyDTO.getFloor())
                    .totalFloors(propertyDTO.getTotalFloors())
                    .yearBuilt(propertyDTO.getYearBuilt())
                    .roadAddress(propertyDTO.getRoadAddress())
                    .detailAddress(propertyDTO.getDetailAddress())
                    .latitude(propertyDTO.getLatitude())
                    .longitude(propertyDTO.getLongitude())
                    .parking(propertyDTO.getParking())
                    .heating(propertyDTO.getHeating())
                    .petAllowed(propertyDTO.getPetAllowed())
                    .elevator(propertyDTO.getElevator())
                    .balcony(propertyDTO.getBalcony())
                    .tv(propertyDTO.getTv())
                    .airConditioner(propertyDTO.getAirConditioner())
                    .shoeCabinet(propertyDTO.getShoeCabinet())
                    .refrigerator(propertyDTO.getRefrigerator())
                    .washingMachine(propertyDTO.getWashingMachine())
                    .bathtub(propertyDTO.getBathtub())
                    .sink(propertyDTO.getSink())
                    .induction(propertyDTO.getInduction())
                    .wardrobe(propertyDTO.getWardrobe())
                    .fireAlarm(propertyDTO.getFireAlarm())
                    .status(propertyDTO.getStatus())
                    .transactionStatus(propertyDTO.getTransactionStatus() != null ? propertyDTO.getTransactionStatus() : 1)
                    .viewCount(propertyDTO.getViewCount())
                    .likeCount(propertyDTO.getLikeCount())
                    .isLiked(propertyDTO.getIsLiked())
                    .imageUrls(propertyDTO.getImageUrls())
                    .createdAt(propertyDTO.getCreatedAt())
                    .updatedAt(propertyDTO.getUpdatedAt())
                    .build();
            
            log.info("DTO를 Entity로 변환 완료 - 제목: {}, 도로명주소: {}", property.getTitle(), property.getRoadAddress());
            return property;
        } catch (Exception e) {
            log.error("DTO를 Entity로 변환 실패 - 상세 에러: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<PropertyDTO> getAllProperties() {
        return propertyRepository.findAll().stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<PropertyDTO> getAllPropertiesWithAreaFilter(Double areaMin, Double areaMax) {
        log.info("=== 면적 필터링 시작 ===");
        log.info("면적 범위: {} ~ {} m²", areaMin, areaMax);
        
        List<Property> properties = propertyRepository.findAll();
        log.info("전체 매물 수: {}건", properties.size());
        
        // 면적 필터링 적용
        if (areaMin != null || areaMax != null) {
            int beforeFilterCount = properties.size();
            
            properties = properties.stream()
                    .filter(property -> {
                        // 면적 필터링
                        if (areaMin != null || areaMax != null) {
                            if (property.getArea() == null) {
                                log.info("면적 필터 실패: 면적 정보 없음 (null)");
                                return false;
                            }
                            double area = property.getArea();
                            if (areaMin != null && area < areaMin) {
                                log.info("면적 필터 실패: {} m² < {} m²", area, areaMin);
                                return false;
                            }
                            if (areaMax != null && area > areaMax) {
                                log.info("면적 필터 실패: {} m² > {} m²", area, areaMax);
                                return false;
                            }
                            log.info("면적 필터 통과: {} m²", area);
                        }
                        return true;
                    })
                    .collect(Collectors.toList());
            
            int afterFilterCount = properties.size();
            log.info("면적 필터링 후 매물 수: {}건 (제외된 매물: {}건)", afterFilterCount, beforeFilterCount - afterFilterCount);
        }
        
        log.info("=== 면적 필터링 완료 ===");
        
        return properties.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }

@Override
    public List<PropertyDTO> getAllPropertiesWithFilters(Double areaMin, Double areaMax, Integer roomCount, Integer bathroomCount, Integer floor, Integer yearBuiltMin, Integer yearBuiltMax) {
        log.info("=== 통합 필터링 시작 ===");
        log.info("면적 범위: {} ~ {} m²", areaMin, areaMax);
        log.info("방 개수: {}", roomCount);
        log.info("화장실 개수: {}", bathroomCount);
        log.info("층수: {}", floor);
        log.info("준공년도 범위: {} ~ {}", yearBuiltMin, yearBuiltMax);
        
        List<Property> properties = propertyRepository.findAll();
        log.info("전체 매물 수: {}건", properties.size());
        
        // 면적, 방 개수, 화장실 개수, 층수, 준공년도 필터링 적용
        boolean hasFilters = (areaMin != null || areaMax != null || roomCount != null || bathroomCount != null || floor != null || yearBuiltMin != null || yearBuiltMax != null);
        
        if (hasFilters) {
            log.info("=== 필터링 조건 확인 ===");
            log.info("면적 범위: {} ~ {} m²", areaMin, areaMax);
            log.info("방 개수: {}", roomCount);
            log.info("화장실 개수: {}", bathroomCount);
            log.info("층수: {}", floor);
            log.info("준공년도 범위: {} ~ {}년", yearBuiltMin, yearBuiltMax);
            log.info("========================");
            
            // 준공년도 필터가 설정되었는지 별도 확인
            if (yearBuiltMin != null || yearBuiltMax != null) {
                log.info("*** 준공년도 필터가 설정됨 ***");
                log.info("yearBuiltMin: {} (타입: {})", yearBuiltMin, yearBuiltMin != null ? yearBuiltMin.getClass().getSimpleName() : "null");
                log.info("yearBuiltMax: {} (타입: {})", yearBuiltMax, yearBuiltMax != null ? yearBuiltMax.getClass().getSimpleName() : "null");
            } else {
                log.info("*** 준공년도 필터가 설정되지 않음 ***");
            }
            int beforeFilterCount = properties.size();
            
            properties = properties.stream()
                    .filter(property -> {
                        // 면적 필터링
                        if (areaMin != null || areaMax != null) {
                            if (property.getArea() == null) {
                                log.info("면적 필터 실패: 면적 정보 없음 (null)");
                                return false;
                            }
                            double area = property.getArea();
                            if (areaMin != null && area < areaMin) {
                                log.info("면적 필터 실패: {} m² < {} m²", area, areaMin);
                                return false;
                            }
                            if (areaMax != null && area > areaMax) {
                                log.info("면적 필터 실패: {} m² > {} m²", area, areaMax);
                                return false;
                            }
                            log.info("면적 필터 통과: {} m²", area);
                        }
                        
                        // 방 개수 필터링
                        if (roomCount != null) {
                            if (property.getRooms() == null) {
                                log.info("방 개수 필터 실패: 방 개수 정보 없음 (null)");
                                return false;
                            }
                            // 타입 안전성을 위해 Integer로 변환
                            Integer propertyRooms = property.getRooms();
                            Integer filterRoomCount = roomCount;
                            
                            if (!filterRoomCount.equals(propertyRooms)) {
                                log.info("방 개수 필터 실패: {}개 != {}개 (필터: {}, 매물: {})", 
                                    propertyRooms, filterRoomCount, filterRoomCount, propertyRooms);
                                return false;
                            }
                            log.info("방 개수 필터 통과: {}개", propertyRooms);
                        }
                        
                        // 화장실 개수 필터링
                        if (bathroomCount != null) {
                            if (property.getBathrooms() == null) {
                                log.info("화장실 개수 필터 실패: 화장실 개수 정보 없음 (null)");
                                return false;
                            }
                            // 타입 안전성을 위해 Integer로 변환
                            Integer propertyBathrooms = property.getBathrooms();
                            Integer filterBathroomCount = bathroomCount;
                            
                            if (!filterBathroomCount.equals(propertyBathrooms)) {
                                log.info("화장실 개수 필터 실패: {}개 != {}개 (필터: {}, 매물: {})", 
                                    propertyBathrooms, filterBathroomCount, filterBathroomCount, propertyBathrooms);
                                return false;
                            }
                            log.info("화장실 개수 필터 통과: {}개", propertyBathrooms);
                        }
                        
                        // 층수 필터링
                        if (floor != null) {
                            if (property.getFloor() == null) {
                                log.info("층수 필터 실패: 층수 정보 없음 (null)");
                                return false;
                            }
                            if (!floor.equals(property.getFloor())) {
                                log.info("층수 필터 실패: {}층 != {}층", property.getFloor(), floor);
                                return false;
                            }
                            log.info("층수 필터 통과: {}층", property.getFloor());
                        }
                        
                        // 준공년도 필터링
                        if (yearBuiltMin != null || yearBuiltMax != null) {
                            log.info("=== 준공년도 필터링 시작 ===");
                            log.info("매물 ID: {}, 제목: {}", property.getId(), property.getTitle());
                            log.info("매물 준공년도: {}", property.getYearBuilt());
                            log.info("필터 조건: {} ~ {}년", yearBuiltMin, yearBuiltMax);
                            
                            if (property.getYearBuilt() == null) {
                                log.info("준공년도 필터 실패: 준공년도 정보 없음 (null)");
                                return false;
                            }
                            int yearBuilt = property.getYearBuilt();
                            
                            // 최솟값 체크
                            if (yearBuiltMin != null && yearBuilt < yearBuiltMin) {
                                log.info("준공년도 필터 실패: {}년 < {}년", yearBuilt, yearBuiltMin);
                                return false;
                            }
                            
                            // 최댓값 체크
                            if (yearBuiltMax != null && yearBuilt > yearBuiltMax) {
                                log.info("준공년도 필터 실패: {}년 > {}년", yearBuilt, yearBuiltMax);
                                return false;
                            }
                            
                            log.info("준공년도 필터 통과: {}년 (범위: {}~{}년)", yearBuilt, yearBuiltMin, yearBuiltMax);
                            log.info("=== 준공년도 필터링 완료 ===");
                        }
                        
                        return true;
                    })
                    .collect(Collectors.toList());
            
            int afterFilterCount = properties.size();
            log.info("통합 필터링 후 매물 수: {}건 (제외된 매물: {}건)", afterFilterCount, beforeFilterCount - afterFilterCount);
        }
        
        log.info("=== 통합 필터링 완료 ===");
        
        return properties.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PropertyDTO> getPropertiesByType(String propertyType) {
        return propertyRepository.findByPropertyType(propertyType).stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PropertyDTO> getPropertiesByTypeWithFilters(String propertyType, Double areaMin, Double areaMax, Integer roomCount, Integer bathroomCount, Integer floor, Integer yearBuiltMin, Integer yearBuiltMax) {
                                                        log.info("=== 특정 유형 필터링 시작 ===");
                        log.info("매물 유형: {}", propertyType);
                        log.info("면적 범위: {} ~ {} m²", areaMin, areaMax);
                        log.info("방 개수: {}", roomCount);
                        log.info("화장실 개수: {}", bathroomCount);
                        log.info("층수: {}", floor);
                        log.info("준공년도 범위: {} ~ {}년", yearBuiltMin, yearBuiltMax);
                        
                        List<Property> properties = propertyRepository.findByPropertyType(propertyType);
                        log.info("해당 유형 매물 수: {}건", properties.size());
                        
                        // 필터링 적용
                        boolean hasFilters = (areaMin != null || areaMax != null || roomCount != null || bathroomCount != null || floor != null || yearBuiltMin != null || yearBuiltMax != null);
                        
                        if (hasFilters) {
                            log.info("=== 필터링 조건 확인 ===");
                            int beforeFilterCount = properties.size();
                            
                            properties = properties.stream()
                                    .filter(property -> {
                                        // 면적 필터링
                                        if (areaMin != null || areaMax != null) {
                                            if (property.getArea() == null) {
                                                log.info("면적 필터 실패: 면적 정보 없음 (null)");
                                                return false;
                                            }
                                            double area = property.getArea();
                                            if (areaMin != null && area < areaMin) {
                                                log.info("면적 필터 실패: {} m² < {} m²", area, areaMin);
                                                return false;
                                            }
                                            if (areaMax != null && area > areaMax) {
                                                log.info("면적 필터 실패: {} m² > {} m²", area, areaMax);
                                                return false;
                                            }
                                            log.info("면적 필터 통과: {} m²", area);
                                        }
                                        
                                        // 방 개수 필터링
                                        if (roomCount != null) {
                                            if (property.getRooms() == null) {
                                                log.info("방 개수 필터 실패: 방 개수 정보 없음 (null)");
                                                return false;
                                            }
                                            // 타입 안전성을 위해 Integer로 변환
                                            Integer propertyRooms = property.getRooms();
                                            Integer filterRoomCount = roomCount;
                                            
                                            if (!filterRoomCount.equals(propertyRooms)) {
                                                log.info("방 개수 필터 실패: {}개 != {}개 (필터: {}, 매물: {})", 
                                                    propertyRooms, filterRoomCount, filterRoomCount, propertyRooms);
                                                return false;
                                            }
                                            log.info("방 개수 필터 통과: {}개", propertyRooms);
                                        }
                                        
                                        // 화장실 개수 필터링
                                        if (bathroomCount != null) {
                                            if (property.getBathrooms() == null) {
                                                log.info("화장실 개수 필터 실패: 화장실 개수 정보 없음 (null)");
                                                return false;
                                            }
                                            // 타입 안전성을 위해 Integer로 변환
                                            Integer propertyBathrooms = property.getBathrooms();
                                            Integer filterBathroomCount = bathroomCount;
                                            
                                            if (!filterBathroomCount.equals(propertyBathrooms)) {
                                                log.info("화장실 개수 필터 실패: {}개 != {}개 (필터: {}, 매물: {})", 
                                                    propertyBathrooms, filterBathroomCount, filterBathroomCount, propertyBathrooms);
                                                return false;
                                            }
                                            log.info("화장실 개수 필터 통과: {}개", propertyBathrooms);
                                        }
                        
                        // 층수 필터링
                        if (floor != null) {
                            if (property.getFloor() == null) {
                                log.info("층수 필터 실패: 층수 정보 없음 (null)");
                                return false;
                            }
                            if (!floor.equals(property.getFloor())) {
                                log.info("층수 필터 실패: {}층 != {}층", property.getFloor(), floor);
                                return false;
                            }
                            log.info("층수 필터 통과: {}층", property.getFloor());
                        }
                        
                        // 준공년도 필터링
                        if (yearBuiltMin != null || yearBuiltMax != null) {
                            log.info("=== 준공년도 필터링 시작 ===");
                            log.info("매물 ID: {}, 제목: {}", property.getId(), property.getTitle());
                            log.info("매물 준공년도: {}", property.getYearBuilt());
                            log.info("필터 조건: {} ~ {}년", yearBuiltMin, yearBuiltMax);
                            
                            if (property.getYearBuilt() == null) {
                                log.info("준공년도 필터 실패: 준공년도 정보 없음 (null)");
                                return false;
                            }
                            int yearBuilt = property.getYearBuilt();
                            
                            // 최솟값 체크
                            if (yearBuiltMin != null && yearBuilt < yearBuiltMin) {
                                log.info("준공년도 필터 실패: {}년 < {}년", yearBuilt, yearBuiltMin);
                                return false;
                            }
                            
                            // 최댓값 체크
                            if (yearBuiltMax != null && yearBuilt > yearBuiltMax) {
                                log.info("준공년도 필터 실패: {}년 > {}년", yearBuilt, yearBuiltMax);
                                return false;
                            }
                            
                            log.info("준공년도 필터 통과: {}년 (범위: {}~{}년)", yearBuilt, yearBuiltMin, yearBuiltMax);
                            log.info("=== 준공년도 필터링 완료 ===");
                        }
                        
                        return true;
                    })
                    .collect(Collectors.toList());
            
            int afterFilterCount = properties.size();
            log.info("필터링 후 매물 수: {}건 (제외된 매물: {}건)", afterFilterCount, beforeFilterCount - afterFilterCount);
        }
        
        log.info("=== 특정 유형 필터링 완료 ===");
        
        return properties.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PropertyDTO> getPropertiesByTransactionType(String transactionType) {
        return getPropertiesByTransactionTypeWithFilters(transactionType, null, null, null, null, null, null, null, null);
    }

    // 가격 필터링이 포함된 메서드 추가
    public List<PropertyDTO> getPropertiesByTransactionTypeWithFilters(
            String transactionType, 
            Double saleMin, Double saleMax,
            Double depositMin, Double depositMax,
            Double monthlyRentMin, Double monthlyRentMax,
            Double areaMin, Double areaMax) {
        
        log.info("=== 가격 필터링 시작 ===");
        log.info("거래 유형: {}", transactionType);
        log.info("매매 가격 범위: {} ~ {}", saleMin, saleMax);
        log.info("보증금 범위: {} ~ {}", depositMin, depositMax);
        log.info("월세 범위: {} ~ {}", monthlyRentMin, monthlyRentMax);
        log.info("면적 범위: {} ~ {} m²", areaMin, areaMax);
        
        List<Property> properties;
        
        if ("전/월세".equals(transactionType)) {
            // 전/월세인 경우 전세와 월세 매물을 모두 가져오기
            properties = propertyRepository.findAll().stream()
                    .filter(property -> "전세".equals(property.getTransactionType()) || "월세".equals(property.getTransactionType()))
                    .collect(Collectors.toList());
        } else if ("월세".equals(transactionType)) {
            // 월세만 정확하게 필터링
            properties = propertyRepository.findByTransactionType("월세");
        } else if ("전세".equals(transactionType)) {
            // 전세만 정확하게 필터링
            properties = propertyRepository.findByTransactionType("전세");
        } else if ("매매".equals(transactionType)) {
            // 매매만 정확하게 필터링
            properties = propertyRepository.findByTransactionType("매매");
        } else {
            // 전체 등 다른 거래 유형은 기존 방식대로
            properties = propertyRepository.findByTransactionType(transactionType);
        }
        
        log.info("거래 유형 필터링 후 매물 수: {}건", properties.size());
        
        // DB에 저장된 매물들의 가격 정보를 먼저 확인
        log.info("=== DB 매물 가격 정보 ===");
        for (Property property : properties) {
            log.info("매물 ID: {}, 제목: {}, 거래유형: {}, 가격: {}, 월세: {}, 면적: {}", 
                    property.getId(), property.getTitle(), property.getTransactionType(), 
                    property.getPrice(), property.getMonthlyRent(), property.getArea());
        }
        log.info("=== DB 매물 가격 정보 끝 ===");
        
        // 가격 필터링 적용
        if (properties != null && !properties.isEmpty()) {
            int beforeFilterCount = properties.size();
            
            properties = properties.stream()
                    .filter(property -> {
                        log.info("=== 매물 필터링 시작 ===");
                        log.info("매물 ID: {}, 제목: {}, 거래유형: {}, 가격: {}, 월세: {}, 면적: {}", 
                                property.getId(), property.getTitle(), property.getTransactionType(), 
                                property.getPrice(), property.getMonthlyRent(), property.getArea());
                        
                        // 매매 가격 필터링
                        if ("매매".equals(transactionType) && property.getPrice() != null) {
                            try {
                                // 가격 문자열에서 "억원" 제거하고 숫자만 추출
                                String priceStr = property.getPrice().replaceAll("[억원\\s]", "");
                                double price = Double.parseDouble(priceStr);
                                
                                // 가격이 10000 이상이면 만원 단위로 인식하여 억원 단위로 변환
                                if (price >= 10000) {
                                    price = price / 10000; // 만원 → 억원 변환
                                    log.info("매매 매물 가격: {}만원 → {}억원으로 변환", price * 10000, price);
                                } else {
                                    log.info("매매 매물 가격: {} (단위: 억원)", price);
                                }
                                
                                // 가격 필터링 적용
                                if (saleMin != null && price < saleMin) {
                                    log.info("매매 가격 필터 실패: {}억원 < {}억원", price, saleMin);
                                    return false;
                                }
                                if (saleMax != null && price > saleMax) {
                                    log.info("매매 가격 필터 실패: {}억원 > {}억원", price, saleMax);
                                    return false;
                                }
                                
                                log.info("매매 가격 필터 통과: {}억원", price);
                            } catch (NumberFormatException e) {
                                log.warn("매매 가격 파싱 실패: {} - 에러: {}", property.getPrice(), e.getMessage());
                                // 파싱 실패 시에도 매물을 포함 (이전처럼)
                                return true;
                            }
                        }
                        
                        // 월세 가격 필터링
                        if ("월세".equals(transactionType)) {
                            try {
                                if (depositMin != null && property.getPrice() != null) {
                                    // 보증금 문자열에서 "만원" 제거하고 숫자만 추출
                                    String depositStr = property.getPrice().replaceAll("[만원\\s]", "");
                                    double deposit = Double.parseDouble(depositStr);
                                    
                                    // 가격이 10000 이상이면 만원 단위로 인식하여 억원 단위로 변환
                                    if (deposit >= 10000) {
                                        deposit = deposit / 10000; // 만원 → 억원 변환
                                        log.info("월세 보증금: {}만원 → {}억원으로 변환", deposit * 10000, deposit);
                                    }
                                    
                                    if (deposit < depositMin) {
                                        log.info("월세 보증금 필터 실패: {}억원 < {}억원", deposit, depositMin);
                                        return false;
                                    }
                                }
                                if (depositMax != null && property.getPrice() != null) {
                                    String depositStr = property.getPrice().replaceAll("[만원\\s]", "");
                                    double deposit = Double.parseDouble(depositStr);
                                    
                                    // 가격이 10000 이상이면 만원 단위로 인식하여 억원 단위로 변환
                                    if (deposit >= 10000) {
                                        deposit = deposit / 10000; // 만원 → 억원 변환
                                    }
                                    
                                    if (deposit > depositMax) {
                                        log.info("월세 보증금 필터 실패: {}억원 > {}억원", deposit, depositMax);
                                        return false;
                                    }
                                }
                                if (monthlyRentMin != null && property.getMonthlyRent() != null) {
                                    // 월세 문자열에서 "만원" 제거하고 숫자만 추출
                                    String monthlyRentStr = property.getMonthlyRent().replaceAll("[만원\\s]", "");
                                    double monthlyRent = Double.parseDouble(monthlyRentStr);
                                    
                                    // 가격이 10000 이상이면 만원 단위로 인식하여 억원 단위로 변환
                                    if (monthlyRent >= 10000) {
                                        monthlyRent = monthlyRent / 10000; // 만원 → 억원 변환
                                        log.info("월세 월세: {}만원 → {}억원으로 변환", monthlyRent * 10000, monthlyRent);
                                    }
                                    
                                    if (monthlyRent < monthlyRentMin) {
                                        log.info("월세 월세 필터 실패: {}억원 < {}억원", monthlyRent, monthlyRentMin);
                                        return false;
                                    }
                                }
                                if (monthlyRentMax != null && property.getMonthlyRent() != null) {
                                    String monthlyRentStr = property.getMonthlyRent().replaceAll("[만원\\s]", "");
                                    double monthlyRent = Double.parseDouble(monthlyRentStr);
                                    
                                    // 가격이 10000 이상이면 만원 단위로 인식하여 억원 단위로 변환
                                    if (monthlyRent >= 10000) {
                                        monthlyRent = monthlyRent / 10000; // 만원 → 억원 변환
                                    }
                                    
                                    if (monthlyRent > monthlyRentMax) {
                                        log.info("월세 월세 필터 실패: {}억원 > {}억원", monthlyRent, monthlyRentMax);
                                        return false;
                                    }
                                }
                            } catch (NumberFormatException e) {
                                log.warn("월세 가격 파싱 실패: {} - 에러: {}", e.getMessage());
                                return false;
                            }
                        }
                        
                        // 전세 가격 필터링
                        if ("전세".equals(transactionType) && property.getPrice() != null) {
                            try {
                                // 전세가 문자열에서 "억원" 제거하고 숫자만 추출
                                String priceStr = property.getPrice().replaceAll("[억원\\s]", "");
                                double price = Double.parseDouble(priceStr);
                                
                                // 가격이 10000 이상이면 만원 단위로 인식하여 억원 단위로 변환
                                if (price >= 10000) {
                                    price = price / 10000; // 만원 → 억원 변환
                                    log.info("전세 가격: {}만원 → {}억원으로 변환", price * 10000, price);
                                }
                                
                                if (depositMin != null && price < depositMin) {
                                    log.info("전세 가격 필터 실패: {}억원 < {}억원", price, depositMin);
                                    return false;
                                }
                                if (depositMax != null && price > depositMax) {
                                    log.info("전세 가격 필터 실패: {}억원 > {}억원", price, depositMax);
                                    return false;
                                }
                            } catch (NumberFormatException e) {
                                log.warn("전세 가격 파싱 실패: {} - 에러: {}", property.getPrice(), e.getMessage());
                                return false;
                            }
                        }
                        
                        // 면적 필터링
                        if (areaMin != null || areaMax != null) {
                            if (property.getArea() == null) {
                                log.info("면적 필터 실패: 면적 정보 없음 (null)");
                                return false;
                            }
                            double area = property.getArea();
                            if (areaMin != null && area < areaMin) {
                                log.info("면적 필터 실패: {} m² < {} m²", area, areaMin);
                                return false;
                            }
                            if (areaMax != null && area > areaMax) {
                                log.info("면적 필터 실패: {} m² > {} m²", area, areaMax);
                                return false;
                            }
                            log.info("면적 필터 통과: {} m²", area);
                        }
                        
                        return true;
                    })
                    .collect(Collectors.toList());
            
            int afterFilterCount = properties.size();
            log.info("가격 필터링 후 매물 수: {}건 (제외된 매물: {}건)", afterFilterCount, beforeFilterCount - afterFilterCount);
        }
        
        log.info("=== 가격 필터링 완료 ===");
        
        return properties.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PropertyDTO> getPropertiesByTypeAndTransactionType(String propertyType, String transactionType) {
        log.info("매물 유형 + 거래 유형 필터링 - 원본: {}, 거래유형: {}", propertyType, transactionType);
        
        if ("전/월세".equals(transactionType)) {
            // 전/월세인 경우 전세와 월세 매물을 모두 가져오기
            List<Property> propertiesByType = propertyRepository.findByPropertyType(propertyType);
            log.info("매물 유형으로 필터링된 결과: {}건", propertiesByType.size());
            
            List<PropertyDTO> result = propertiesByType.stream()
                    .filter(property -> {
                        boolean isRent = "전세".equals(property.getTransactionType()) || "월세".equals(property.getTransactionType());
                        log.info("매물 ID: {}, 거래유형: {}, 전/월세 여부: {}", property.getId(), property.getTransactionType(), isRent);
                        return isRent;
                    })
                    .map(this::entityToDTO)
                    .collect(Collectors.toList());
            
            log.info("전/월세 필터링 최종 결과: {}건", result.size());
            return result;
        } else {
            // 매매 등 다른 거래 유형은 기존 방식대로
            List<PropertyDTO> result = propertyRepository.findByPropertyTypeAndTransactionType(propertyType, transactionType).stream()
                    .map(this::entityToDTO)
                    .collect(Collectors.toList());
            
            log.info("{} 필터링 결과: {}건", transactionType, result.size());
            return result;
        }
    }

    @Override
    public List<PropertyDTO> searchProperties(String keyword) {
        // 간단한 검색 구현
        return propertyRepository.findAll().stream()
                .filter(property -> 
                    (property.getTitle() != null && property.getTitle().contains(keyword)) ||
                    (property.getContent() != null && property.getContent().contains(keyword)))
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<PropertyDTO> getAllPropertiesWithLikeStatus(String memberEmail) {
        List<Property> properties = propertyRepository.findAll();
        
        return properties.stream()
                .map(property -> {
                    PropertyDTO dto = entityToDTO(property);
                    
                    // 사용자별 좋아요 상태 설정
                    if (memberEmail != null) {
                        boolean isLiked = isLikedByMember(property.getId(), memberEmail);
                        dto.setIsLiked(isLiked);
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }

    


    

    

    @Override
    public Optional<PropertyDTO> getProperty(Long id, String memberEmail) {
        Optional<Property> propertyOpt = propertyRepository.findById(id);
        if (propertyOpt.isPresent()) {
            Property property = propertyOpt.get();
            PropertyDTO dto = entityToDTO(property);
            
            // 사용자별 좋아요 상태 설정
            if (memberEmail != null) {
                boolean isLiked = isLikedByMember(id, memberEmail);
                dto.setIsLiked(isLiked);
            }
            
            return Optional.of(dto);
        }
        return Optional.empty();
    }

    @Override
    public PropertyDTO save(PropertyDTO propertyDTO) {
        try {
            log.info("Property 저장 시작 - 제목: {}, 작성자: {}", propertyDTO.getTitle(), propertyDTO.getWriter());
            log.info("Property 저장 - 매물유형: {}, 거래유형: {}, 도로명주소: {}", 
                    propertyDTO.getPropertyType(), propertyDTO.getTransactionType(), propertyDTO.getRoadAddress());
            
            Property property = dtoToEntity(propertyDTO);
            log.info("DTO를 Entity로 변환 완료");
            
            Property savedProperty = propertyRepository.save(property);
            log.info("Property Entity 저장 완료 - ID: {}", savedProperty.getId());
            
            PropertyDTO result = entityToDTO(savedProperty);
            log.info("Entity를 DTO로 변환 완료");
            
            return result;
        } catch (Exception e) {
            log.error("Property 저장 실패 - 상세 에러: {}", e.getMessage(), e);
            throw e;
        }
    }



    @Override
    public PropertyDTO update(Long id, PropertyDTO propertyDTO) {
        Property existingProperty = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        
        // 기존 데이터 유지하면서 업데이트
        Property updatedProperty = dtoToEntity(propertyDTO);
        updatedProperty.setId(id);
        updatedProperty.setCreatedAt(existingProperty.getCreatedAt());
        
        Property savedProperty = propertyRepository.save(updatedProperty);
        return entityToDTO(savedProperty);
    }

    @Override
    public void delete(Long id) {
        // 삭제하기 전에 매물 정보 조회
        Optional<Property> propertyOpt = propertyRepository.findById(id);
        if (propertyOpt.isPresent()) {
            Property property = propertyOpt.get();
            
            // 1. 매물에 달린 좋아요들 먼저 삭제
            try {
                List<PropertyLike> likes = propertyLikeRepository.findByPropertyId(id);
                if (!likes.isEmpty()) {
                    propertyLikeRepository.deleteAll(likes);
                    log.info("매물 좋아요 {}개 삭제 완료 - Property ID: {}", likes.size(), id);
                }
            } catch (Exception e) {
                log.error("매물 좋아요 삭제 실패 - Property ID: {}", id, e);
            }
            
            // 2. 매물에 첨부된 이미지들 삭제
            if (property.getImageUrls() != null && !property.getImageUrls().isEmpty()) {
                for (String imageUrl : property.getImageUrls()) {
                    try {
                        deleteImage(imageUrl);
                    } catch (Exception e) {
                        log.error("이미지 삭제 실패: {}", imageUrl, e);
                    }
                }
            }
        }
        
        // 3. 마지막에 매물 삭제
        propertyRepository.deleteById(id);
    }

    @Override
    public List<String> saveImages(List<MultipartFile> images) {
        return customFileUtil.saveFiles(images);
    }

    @Override
    public void deleteImage(String imageUrl) {
        try {
            // URL에서 파일명 추출 (/files/filename.jpg -> filename.jpg)
            String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            
            log.info("Property 이미지 삭제 시도: {}", fileName);
            
            // CustomFileUtil을 사용하여 파일 삭제
            customFileUtil.deleteFiles(java.util.List.of(fileName));
            
            log.info("Property 이미지 삭제 완료: {}", fileName);
        } catch (Exception e) {
            log.error("Property 이미지 삭제 실패: {}", imageUrl, e);
            throw new RuntimeException("이미지 삭제 실패", e);
        }
    }

    @Override
    public void incrementViewCount(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        property.setViewCount(property.getViewCount() != null ? property.getViewCount() + 1 : 1);
        propertyRepository.save(property);
    }

    @Override
    public void toggleLike(Long propertyId, String memberEmail) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        
        // 이미 좋아요한 상태인지 확인
        Optional<PropertyLike> existingLike = propertyLikeRepository.findByPropertyIdAndMemberEmail(propertyId, memberEmail);
        
        if (existingLike.isPresent()) {
            // 좋아요 취소
            propertyLikeRepository.delete(existingLike.get());
            property.decrementLikeCount();
            log.info("매물 좋아요 취소 - Property ID: {}, Member: {}", propertyId, memberEmail);
        } else {
            // 좋아요 추가
            PropertyLike newLike = PropertyLike.builder()
                    .property(property)
                    .memberEmail(memberEmail)
                    .build();
            propertyLikeRepository.save(newLike);
            property.incrementLikeCount();
            log.info("매물 좋아요 추가 - Property ID: {}, Member: {}", propertyId, memberEmail);
        }
        
        propertyRepository.save(property);
    }
    
    @Override
    public boolean isLikedByMember(Long propertyId, String memberEmail) {
        return propertyLikeRepository.findByPropertyIdAndMemberEmail(propertyId, memberEmail).isPresent();
    }
    
    @Override
    public long getLikeCount(Long propertyId) {
        return propertyLikeRepository.countByPropertyId(propertyId);
    }
    
    @Override
    public List<PropertyDTO> getLikedPropertiesByMember(String memberEmail) {
        log.info("좋아요한 매물 조회 시작 - Member: {}", memberEmail);
        
        try {
            // 기본 메서드로 먼저 시도
            List<PropertyLike> likedProperties = propertyLikeRepository.findByMemberEmail(memberEmail);
            log.info("PropertyLike 조회 완료 - {}개", likedProperties.size());
            
            List<PropertyDTO> result = new ArrayList<>();
            
            for (PropertyLike propertyLike : likedProperties) {
                try {
                    Property property = propertyLike.getProperty();
                    if (property == null) {
                        log.warn("PropertyLike의 Property가 null - PropertyLike ID: {}", propertyLike.getId());
                        continue;
                    }
                    
                    PropertyDTO dto = entityToDTO(property);
                    dto.setIsLiked(true); // 이미 좋아요한 상태이므로 true로 설정
                    result.add(dto);
                    log.info("좋아요한 매물 변환 완료 - Property ID: {}, 제목: {}", property.getId(), property.getTitle());
                    
                } catch (Exception e) {
                    log.error("Property DTO 변환 실패 - PropertyLike ID: {}, 오류: {}", propertyLike.getId(), e.getMessage());
                    continue;
                }
            }
            
            log.info("좋아요한 매물 DTO 변환 완료 - {}개", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("좋아요한 매물 조회 중 오류 발생: {}", e.getMessage(), e);
            return new ArrayList<>(); // 빈 리스트 반환하여 에러 방지
        }
    }

    @Override
    public void updateTransactionStatus(Long id, Integer transactionStatus) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        property.setTransactionStatus(transactionStatus);
        propertyRepository.save(property);
        log.info("Property ID: {} 거래 상태 업데이트: {}", id, transactionStatus);
    }

    @Override
    public void updateStatus(Long id, String status) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        property.setStatus(status);
        propertyRepository.save(property);
        log.info("Property ID: {} 상태 업데이트: {}", id, status);
    }

    @Override
    public List<PropertyDTO> getMyProperties(String memberEmail) {
        log.info("본인 매물 목록 조회 시작 - Member: {}", memberEmail);
        
        try {
            // 본인이 작성한 매물을 모두 조회 (검수요청 승인 후 업로드된 것들)
            List<Property> properties = propertyRepository.findByWriterEmail(memberEmail);
            log.info("Property 조회 완료 - {}개", properties.size());
            
            List<PropertyDTO> result = new ArrayList<>();
            
            for (Property property : properties) {
                try {
                    PropertyDTO dto = entityToDTO(property);
                    result.add(dto);
                    log.info("본인 작성 매물 변환 완료 - Property ID: {}, 제목: {}, 상태: {}", 
                        property.getId(), property.getTitle(), property.getStatus());
                    
                } catch (Exception e) {
                    log.error("Property DTO 변환 실패 - Property ID: {}, 오류: {}", property.getId(), e.getMessage());
                    continue;
                }
            }
            
            log.info("본인 작성 매물 DTO 변환 완료 - {}개", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("본인 작성 매물 조회 중 오류 발생: {}", e.getMessage(), e);
            return new ArrayList<>(); // 빈 리스트 반환하여 에러 방지
        }
    }

    // 댓글 관련 메서드들
    @Override
    public List<ReplyDTO> getPropertyInquiriesAsDTO(Long propertyId) {
        // 간단한 구현
        return new ArrayList<>();
    }

    @Override
    public ReplyDTO createPropertyInquiryAsDTO(Long propertyId, ReplyDTO inquiryDTO) {
        // 간단한 구현
        return inquiryDTO;
    }

    @Override
    public List<ReplyDTO> getInquiryRepliesAsDTO(Long inquiryId) {
        // 간단한 구현
        return new ArrayList<>();
    }

    @Override
    public ReplyDTO createInquiryReplyAsDTO(Long inquiryId, ReplyDTO replyDTO) {
        // 간단한 구현
        return replyDTO;
    }

    // 헬퍼 메서드들
    private ReplyDTO inquiryToReplyDTO(PropertyInquiry inquiry) {
        return ReplyDTO.builder()
                .id(inquiry.getId())
                .content(inquiry.getContent())
                .writer(inquiry.getWriter())
                .createdAt(inquiry.getCreatedAt() != null ? inquiry.getCreatedAt().toString() : "")
                .build();
    }

    private ReplyDTO replyToReplyDTO(PropertyInquiryReply reply) {
        return ReplyDTO.builder()
                .id(reply.getId())
                .content(reply.getContent())
                .writer(reply.getWriter())
                .createdAt(reply.getCreatedAt() != null ? reply.getCreatedAt().toString() : "")
                .build();
    }

    // 실거래가 조회 메서드들 (도로명주소 기반)
    @Override
    public List<Map<String, Object>> getRecentSalesByAddress(String roadAddress, Double area) {
        try {
            log.info("매매 실거래가 조회 - 주소: {}, 면적: {}", roadAddress, area);
            
            if (roadAddress == null || roadAddress.trim().isEmpty()) {
                log.warn("도로명 주소가 없어서 실거래가 조회 불가");
                return new ArrayList<>();
            }
            
            List<Map<String, Object>> result = new ArrayList<>();
            
            // 1. 아파트 매매 실거래가 조회 (정확한 도로명 일치)
            List<ApartmentSale> apartmentSales = apartmentSaleRepository.findByRoadName(roadAddress);
            for (ApartmentSale sale : apartmentSales) {
                Map<String, Object> saleData = new HashMap<>();
                saleData.put("transactionAmount", sale.getTransactionAmount());
                saleData.put("exclusiveArea", sale.getExclusiveArea());
                saleData.put("floor", sale.getFloor());
                saleData.put("dong", sale.getDong());
                saleData.put("contractDate", sale.getContractDate());
                saleData.put("constructionYear", sale.getConstructionYear());
                saleData.put("complexName", sale.getComplexName());
                saleData.put("propertyType", "아파트");
                result.add(saleData);
            }
            
            // 2. 빌라(연립/다세대) 매매 실거래가 조회 (정확한 도로명 일치)
            List<RowHouseSale> rowHouseSales = rowHouseSaleRepository.findByRoadName(roadAddress);
            for (RowHouseSale sale : rowHouseSales) {
                Map<String, Object> saleData = new HashMap<>();
                saleData.put("transactionAmount", sale.getTransactionAmount());
                saleData.put("exclusiveArea", sale.getExclusiveArea());
                saleData.put("floor", sale.getFloor());
                saleData.put("buildingName", sale.getBuildingName());
                saleData.put("contractDate", sale.getContractDate());
                saleData.put("constructionYear", sale.getConstructionYear());
                saleData.put("propertyType", "연립/다세대");
                result.add(saleData);
            }
            
            // 3. 단독주택 매매 실거래가 조회 (정확한 도로명 일치)
            List<DetachedHouseSale> detachedHouseSales = detachedHouseSaleRepository.findByRoadName(roadAddress);
            for (DetachedHouseSale sale : detachedHouseSales) {
                Map<String, Object> saleData = new HashMap<>();
                saleData.put("transactionAmount", sale.getTransactionAmount());
                saleData.put("exclusiveArea", sale.getTotalArea()); // totalArea 사용
                saleData.put("floor", 1); // 단독주택은 보통 1층
                saleData.put("buildingName", sale.getHousingType()); // housingType 사용
                saleData.put("contractDate", sale.getContractDate());
                saleData.put("constructionYear", sale.getConstructionYear());
                saleData.put("propertyType", "단독주택");
                result.add(saleData);
            }
            
            // 4. 오피스텔 매매 실거래가 조회 (정확한 도로명 일치)
            List<OfficeTelSale> officeTelSales = officeTelSaleRepository.findByRoadName(roadAddress);
            for (OfficeTelSale sale : officeTelSales) {
                Map<String, Object> saleData = new HashMap<>();
                saleData.put("transactionAmount", sale.getTransactionAmount());
                saleData.put("exclusiveArea", sale.getExclusiveArea());
                saleData.put("floor", sale.getFloor());
                saleData.put("buildingName", sale.getComplexName()); // complexName 사용
                saleData.put("contractDate", sale.getContractDate());
                saleData.put("constructionYear", sale.getConstructionYear());
                saleData.put("propertyType", "오피스텔");
                result.add(saleData);
            }
            
            // 면적 범위 설정 (면적의 ±20% 범위)
            if (area != null) {
                Double minArea = area * 0.8;
                Double maxArea = area * 1.2;
                result = result.stream()
                    .filter(sale -> {
                        Double saleArea = (Double) sale.get("exclusiveArea");
                        return saleArea != null && saleArea >= minArea && saleArea <= maxArea;
                    })
                    .collect(Collectors.toList());
            }
            
            // 최근 10건만 반환하고 계약일 순으로 정렬
            result = result.stream()
                .sorted((sale1, sale2) -> {
                    LocalDate date1 = (LocalDate) sale1.get("contractDate");
                    LocalDate date2 = (LocalDate) sale2.get("contractDate");
                    return date2.compareTo(date1); // 최신 날짜가 먼저 오도록
                })
                .limit(10)
                .collect(Collectors.toList());
            
            log.info("매매 실거래가 조회 완료 - {}건", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("매매 실거래가 조회 실패: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> getRecentRentsByAddress(String roadAddress, Double area) {
        try {
            log.info("전월세 실거래가 조회 - 주소: {}, 면적: {}", roadAddress, area);
            
            if (roadAddress == null || roadAddress.trim().isEmpty()) {
                log.warn("도로명 주소가 없어서 실거래가 조회 불가");
                return new ArrayList<>();
            }
            
            List<Map<String, Object>> result = new ArrayList<>();
            
            // 1. 아파트 전월세 실거래가 조회 (정확한 도로명 일치)
            List<ApartmentRent> apartmentRents = apartmentRentRepository.findByRoadName(roadAddress);
            for (ApartmentRent rent : apartmentRents) {
                Map<String, Object> rentData = new HashMap<>();
                rentData.put("deposit", rent.getDeposit());
                rentData.put("monthlyRent", rent.getMonthlyRent());
                rentData.put("exclusiveArea", rent.getExclusiveArea());
                rentData.put("floor", rent.getFloor());
                rentData.put("contractDate", rent.getContractDate());
                rentData.put("constructionYear", rent.getConstructionYear());
                rentData.put("complexName", rent.getComplexName());
                rentData.put("rentType", rent.getRentType());
                rentData.put("propertyType", "아파트");
                result.add(rentData);
            }
            
            // 2. 빌라(연립/다세대) 전월세 실거래가 조회 (정확한 도로명 일치)
            List<RowHouseRent> rowHouseRents = rowHouseRentRepository.findByRoadName(roadAddress);
            for (RowHouseRent rent : rowHouseRents) {
                Map<String, Object> rentData = new HashMap<>();
                rentData.put("deposit", rent.getDeposit());
                rentData.put("monthlyRent", rent.getMonthlyRent());
                rentData.put("exclusiveArea", rent.getExclusiveArea());
                rentData.put("floor", rent.getFloor());
                rentData.put("contractDate", rent.getContractDate());
                rentData.put("constructionYear", rent.getConstructionYear());
                rentData.put("buildingName", rent.getBuildingName());
                rentData.put("rentType", rent.getRentType());
                rentData.put("propertyType", "연립/다세대");
                result.add(rentData);
            }
            
            // 3. 단독주택 전월세 실거래가 조회 (정확한 도로명 일치)
            List<DetachedHouseRent> detachedHouseRents = detachedHouseRentRepository.findByRoadName(roadAddress);
            for (DetachedHouseRent rent : detachedHouseRents) {
                Map<String, Object> rentData = new HashMap<>();
                rentData.put("deposit", rent.getDeposit());
                rentData.put("monthlyRent", rent.getMonthlyRent());
                rentData.put("exclusiveArea", rent.getContractArea()); // contractArea 사용
                rentData.put("floor", 1); // 단독주택은 보통 1층
                rentData.put("contractDate", rent.getContractDate());
                rentData.put("constructionYear", rent.getConstructionYear());
                rentData.put("buildingName", rent.getHousingType()); // housingType 사용
                rentData.put("rentType", rent.getRentType());
                rentData.put("propertyType", "단독주택");
                result.add(rentData);
            }
            
            // 4. 오피스텔 전월세 실거래가 조회 (정확한 도로명 일치)
            List<OfficeTelRent> officeTelRents = officeTelRentRepository.findByRoadName(roadAddress);
            for (OfficeTelRent rent : officeTelRents) {
                Map<String, Object> rentData = new HashMap<>();
                rentData.put("deposit", rent.getDeposit());
                rentData.put("monthlyRent", rent.getMonthlyRent());
                rentData.put("exclusiveArea", rent.getExclusiveArea());
                rentData.put("floor", rent.getFloor());
                rentData.put("contractDate", rent.getContractDate());
                rentData.put("constructionYear", rent.getConstructionYear());
                rentData.put("buildingName", rent.getComplexName()); // complexName 사용
                rentData.put("rentType", rent.getRentType());
                rentData.put("propertyType", "오피스텔");
                result.add(rentData);
            }
            
            // 면적 범위 설정 (면적의 ±20% 범위)
            if (area != null) {
                Double minArea = area * 0.8;
                Double maxArea = area * 1.2;
                result = result.stream()
                    .filter(rent -> {
                        Double rentArea = (Double) rent.get("exclusiveArea");
                        return rentArea != null && rentArea >= minArea && rentArea <= maxArea;
                    })
                    .collect(Collectors.toList());
            }
            
            // 최근 10건만 반환하고 계약일 순으로 정렬
            result = result.stream()
                .sorted((rent1, rent2) -> {
                    LocalDate date1 = (LocalDate) rent1.get("contractDate");
                    LocalDate date2 = (LocalDate) rent2.get("contractDate");
                    return date2.compareTo(date1); // 최신 날짜가 먼저 오도록
                })
                .limit(10)
                .collect(Collectors.toList());
            
            log.info("전월세 실거래가 조회 완료 - {}건", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("전월세 실거래가 조회 실패: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
} 