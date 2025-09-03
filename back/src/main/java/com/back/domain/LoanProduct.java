package com.back.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Entity
@Table(name = "loan_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanProduct {
    
    @Id
    private String productId;
    
    private String bank;
    private String productName;
    private String loanType;
    
    @Column(length = 1000)
    private String description;
    
    private String interestRate;
    private String maxAmount;
    private String loanPeriod;
    
    @Embedded
    private Qualification qualification;
    
    @ElementCollection
    @CollectionTable(name = "loan_product_required_docs", 
                     joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "document")
    private List<String> requiredDocs;
    
    private String link;
    
    @ElementCollection
    @CollectionTable(name = "loan_product_rate_types", 
                     joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "rate_type")
    private List<String> rateTypes;
    
    private Integer ltvRatio;
    private Boolean dsrPreference;
    private Boolean mobileAvailable;
    private Boolean youthPreference;
    private Double preferentialRate;
    private Boolean documentSimplicity;
    
    @ElementCollection
    @CollectionTable(name = "loan_product_collateral_types", 
                     joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "collateral_type")
    private List<String> collateralTypes;
    
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Qualification {
        private String age;
        private String homeOwnership;
        private String income;
        private String creditScore;
    }
} 