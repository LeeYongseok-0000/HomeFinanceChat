package com.back.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "property")
@ToString
@Getter 
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Property {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String writer;
    
    private String writerEmail;

    private String propertyType; // 아파트, 오피스텔, 빌라/연립, 단독주택, 상가, 사무실, 기타

    private String transactionType; // 거래 유형 (매매, 전세, 월세)
    
    private String price; // 가격 (매매가, 전세금, 보증금)
    
    private String monthlyRent; // 월세 (월세 선택 시에만)

    private Double area; // 면적 (㎡)

    private Integer rooms; // 방 개수

    private Integer bathrooms; // 화장실 개수

    private Integer floor; // 현재 층

    private Integer totalFloors; // 전체 층수

    private Integer yearBuilt; // 준공년도

    private String roadAddress; // 도로명 주소

    private String detailAddress; // 상세 주소 (동, 호수 등)

    private Double latitude; // 위도
    
    private Double longitude; // 경도

    private String parking; // 주차 (가능, 불가능, 협의)

    private String heating; // 난방 (개별난방, 중앙난방, 지역난방, 기타)

    

    private String petAllowed; // 반려동물 (가능, 불가능, 협의)

    // 옵션 필드들
    private Boolean elevator; // 엘리베이터
    private Boolean balcony; // 발코니
    private Boolean tv; // TV
    private Boolean airConditioner; // 에어컨
    private Boolean shoeCabinet; // 신발장
    private Boolean refrigerator; // 냉장고
    private Boolean washingMachine; // 세탁기
    private Boolean bathtub; // 욕조
    private Boolean sink; // 싱크대
    private Boolean induction; // 인덕션
    private Boolean wardrobe; // 옷장
    private Boolean fireAlarm; // 화재경보기

    private String status; // 상태 (판매중, 예약중, 거래완료)

    @Builder.Default
    private Integer transactionStatus = 1; // 거래 상태 (1: 거래 진행중, 0: 거래 완료)

    private Integer viewCount; // 조회수

    private Integer likeCount; // 좋아요 수

    private Boolean isLiked; // 현재 사용자가 좋아요 했는지 여부

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<PropertyInquiry> inquiries = new ArrayList<>();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @ElementCollection
    @CollectionTable(name = "property_images", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();



    public void changeTitle(String title) {
        this.title = title;
    }

    public void changeContent(String content) {
        this.content = content;
    }

    public void changePropertyType(String propertyType) {
        this.propertyType = propertyType;
    }

    public void changePrice(String price) {
        this.price = price;
    }

    public void changeStatus(String status) {
        this.status = status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setViewCount(Integer viewCount) {
        this.viewCount = viewCount;
    }

    public void setLikeCount(Integer likeCount) {
        this.likeCount = likeCount;
    }

    public void setIsLiked(Boolean isLiked) {
        this.isLiked = isLiked;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public void incrementViewCount() {
        this.viewCount = (this.viewCount == null) ? 1 : this.viewCount + 1;
    }

    public void incrementLikeCount() {
        this.likeCount = (this.likeCount == null) ? 1 : this.likeCount + 1;
    }

    public void decrementLikeCount() {
        if (this.likeCount != null && this.likeCount > 0) {
            this.likeCount--;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
} 