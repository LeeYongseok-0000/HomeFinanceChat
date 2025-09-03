package com.back.domain;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@ToString
public class MemberCredit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Member와 1:1 관계 (순환 참조 방지)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_email")
    @JsonIgnore
    private Member member;

    // 대출 관련 정보 (선택적 입력)
    private Integer age;
    private String homeOwnership; // 무주택자, 생애최초 주택구입자, 기존주택소유자
    private Integer income; // 연소득 (만원)
    private Integer creditScore; // 신용점수
    private String loanType; // 담보대출, 전세자금대출
    private Integer debt; // 기존 채무 (만원)
    private Integer assets; // 보유 자산 (만원)
    private String employmentType; // 고용 형태
    private Integer workPeriod; // 근무 기간 (개월)
    private String ratePreference; // 금리 선호도
    private String collateralType; // 담보 유형
    private String userCondition; // 사용자 조건
    private String mainBank; // 주거래 은행
    private Integer collateralValue; // 담보가액 (만원)
    
    // 대출 추천 결과 저장
    @JsonProperty("maxPurchaseAmount")
    private Long maxPurchaseAmount; // 최대 구매 가능액 (만원)

    // 프로필 업데이트 메서드
    public void updateProfile(MemberCredit profile) {
        this.age = profile.getAge();
        this.homeOwnership = profile.getHomeOwnership();
        this.income = profile.getIncome();
        this.creditScore = profile.getCreditScore();
        this.loanType = profile.getLoanType();
        this.debt = profile.getDebt();
        this.assets = profile.getAssets();
        this.employmentType = profile.getEmploymentType();
        this.workPeriod = profile.getWorkPeriod();
        this.ratePreference = profile.getRatePreference();
        this.collateralType = profile.getCollateralType();
        this.userCondition = profile.getUserCondition();
        this.mainBank = profile.getMainBank();
        this.collateralValue = profile.getCollateralValue();
    }
    
    // 최대 구매 가능액 업데이트 메서드
    public void updateMaxPurchaseAmount(Long maxPurchaseAmount) {
        this.maxPurchaseAmount = maxPurchaseAmount;
    }
} 