package com.back.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserConditions {
    // 사용자 식별
    private String userEmail; // 사용자 이메일
    
    // 기본 정보
    private Integer age;
    private String homeOwnership; // "무주택자", "생애최초 주택구입자", "기존주택소유자"
    private Integer income; // 연소득 (만원 단위)
    private Integer creditScore; // 신용점수
    
    // 대출 유형
    private String loanType; // "담보대출", "전세자금대출"
    
    // 재무 정보
    private Integer debt; // 기존 부채 (만원 단위)
    private Integer assets; // 보유 자산 (만원 단위)
    
    // 고용 정보
    private String employmentType; // "정규직", "계약직", "프리랜서", "사업자", "무직"
    private Integer workPeriod; // 근무 기간 (개월)
    
    // 선호도
    private String ratePreference; // "고정금리", "변동금리", "혼합형"
    private String collateralType; // "수도권 아파트", "지방 아파트", "단독주택", "빌라/연립"
    private String userCondition; // "청년", "생애최초", "일반"
    private String mainBank; // 주거래 은행
    
    // 담보 정보
    private Integer collateralValue; // 담보 가치 (만원 단위)
} 