package com.back.dto;

import lombok.Data;

@Data
public class MemberSignupDTO {
    private String email;
    private String pw;
    private String nickname;
    
    // 선택적 신용정보
    private Integer age;
    private String homeOwnership;
    private Integer income;
    private Integer creditScore;
    private String loanType;
    private Integer debt;
    private Integer assets;
    private String employmentType;
    private Integer workPeriod;
    private String ratePreference;
    private String collateralType;
    private String userCondition;
    private String mainBank;
    private Integer collateralValue;
}