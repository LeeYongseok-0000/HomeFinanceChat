package com.back.repository;

import com.back.domain.PhoneVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PhoneVerificationRepository extends JpaRepository<PhoneVerification, Long> {
    
    // 전화번호와 인증코드로 유효한 인증 찾기
    Optional<PhoneVerification> findByPhoneNumberAndVerificationCodeAndVerifiedTrue(String phoneNumber, String code);
    
    // 전화번호로 최근 인증 내역 찾기
    @Query("SELECT pv FROM PhoneVerification pv WHERE pv.phoneNumber = :phoneNumber AND pv.createdAt > :time ORDER BY pv.createdAt DESC")
    List<PhoneVerification> findRecentByPhoneNumber(@Param("phoneNumber") String phoneNumber, @Param("time") LocalDateTime time);
    
    // 이메일로 비밀번호 재설정 인증 찾기
    Optional<PhoneVerification> findByEmailAndTypeAndVerifiedTrue(String email, PhoneVerification.VerificationType type);
    
    // 만료된 인증 삭제
    void deleteByExpiredAtBefore(LocalDateTime time);
} 