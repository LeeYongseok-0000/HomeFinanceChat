package com.back.dto;

import com.back.domain.PropertyReviewRequest;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyReviewRequestDTO {
    
    private Long id;
    private Long memberId;
    private String memberEmail;
    private String memberName;
    private String name;
    private String description;
    private String price;
    private String propertyType;
    private String transactionType;
    private String monthlyRent;
    private String address;
    private String roadAddress;
    private String detailAddress;
    private Double latitude;
    private Double longitude;
    private String rooms;
    private String bathrooms;
    private String area;
    private String floor;
    private String totalFloors;
    private String yearBuilt;
    private String parking;
    private String heating;
    private String petAllowed;
    private Boolean elevator;
    private Boolean balcony;
    private Boolean tv;
    private Boolean airConditioner;
    private Boolean shoeCabinet;
    private Boolean refrigerator;
    private Boolean washingMachine;
    private Boolean bathtub;
    private Boolean sink;
    private Boolean induction;
    private Boolean wardrobe;
    private Boolean fireAlarm;
    private List<String> imageUrls;
    private PropertyReviewRequest.ReviewStatus status;
    private String reviewComment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Entity를 DTO로 변환하는 정적 메서드
    public static PropertyReviewRequestDTO fromEntity(PropertyReviewRequest entity) {
        return PropertyReviewRequestDTO.builder()
                .id(entity.getId())
                .memberId(null) // Member는 email을 ID로 사용
                .memberEmail(entity.getMember().getEmail())
                .memberName(entity.getMember().getNickname())
                .name(entity.getName())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .propertyType(entity.getPropertyType())
                .transactionType(entity.getTransactionType())
                .monthlyRent(entity.getMonthlyRent())
                .address(entity.getAddress())
                .roadAddress(entity.getRoadAddress())
                .detailAddress(entity.getDetailAddress())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .rooms(entity.getRooms())
                .bathrooms(entity.getBathrooms())
                .area(entity.getArea())
                .floor(entity.getFloor())
                .totalFloors(entity.getTotalFloors())
                .yearBuilt(entity.getYearBuilt())
                .parking(entity.getParking())
                .heating(entity.getHeating())
                .petAllowed(entity.getPetAllowed())
                .elevator(entity.getElevator())
                .balcony(entity.getBalcony())
                .tv(entity.getTv())
                .airConditioner(entity.getAirConditioner())
                .shoeCabinet(entity.getShoeCabinet())
                .refrigerator(entity.getRefrigerator())
                .washingMachine(entity.getWashingMachine())
                .bathtub(entity.getBathtub())
                .sink(entity.getSink())
                .induction(entity.getInduction())
                .wardrobe(entity.getWardrobe())
                .fireAlarm(entity.getFireAlarm())
                .imageUrls(entity.getImageUrls())
                .status(entity.getStatus())
                .reviewComment(entity.getReviewComment())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
} 