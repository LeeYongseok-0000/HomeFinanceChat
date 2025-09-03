package com.back.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@ToString
public class PhoneVerification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String phoneNumber;
    
    private String verificationCode;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime expiredAt;
    
    private boolean verified;
    
    private String email; // 비밀번호 변경을 요청한 사용자 이메일
    
    @Enumerated(EnumType.STRING)
    private VerificationType type; // 인증 타입 (PASSWORD_RESET, SIGNUP 등)
    
    public enum VerificationType {
        PASSWORD_RESET, SIGNUP, PHONE_UPDATE
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiredAt);
    }
    
    public void verify() {
        this.verified = true;
    }
} 