package com.back.repository;

import com.back.domain.MemberCredit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MemberCreditRepository extends JpaRepository<MemberCredit, Long> {
    
    // 이메일로 신용정보 조회
    Optional<MemberCredit> findByMember_Email(String email);
    
    // 이메일로 신용정보 존재 여부 확인
    boolean existsByMember_Email(String email);
} 