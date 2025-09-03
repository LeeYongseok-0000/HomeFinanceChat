package com.back.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "property_review_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyReviewRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String price;
    
    @Column(nullable = false)
    private String propertyType;
    
    @Column(nullable = false)
    private String transactionType;
    
    private String monthlyRent;
    
    @Column(nullable = false)
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
    
    @ElementCollection
    @CollectionTable(name = "property_review_request_images", joinColumns = @JoinColumn(name = "property_review_request_id"))
    @Column(name = "image_url")
    private List<String> imageUrls = new ArrayList<>();
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewStatus status = ReviewStatus.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String reviewComment;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    public enum ReviewStatus {
        PENDING("대기중"),
        APPROVED("승인"),
        REJECTED("거절");
        
        private final String description;
        
        ReviewStatus(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
} 