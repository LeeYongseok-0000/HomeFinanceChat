package com.back.controller;

import com.back.domain.Member;
import com.back.domain.MemberCredit;
import com.back.domain.MemberRole;
import com.back.dto.MemberSignupDTO;
import com.back.repository.MemberRepository;
import com.back.repository.MemberCreditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import com.back.util.JWTUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.back.service.MemberService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/member")
public class MemberController {

    private static final Logger log = LoggerFactory.getLogger(MemberController.class);
    private final MemberRepository memberRepository;
    private final MemberCreditRepository memberCreditRepository;
    private final PasswordEncoder passwordEncoder;
    private final MemberService memberService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody MemberSignupDTO dto) {
        try {
            if (memberRepository.existsById(dto.getEmail())) {
                return ResponseEntity.badRequest().body("이미 존재하는 이메일입니다.");
            }

            Member member = Member.builder()
                    .email(dto.getEmail())
                    .pw(passwordEncoder.encode(dto.getPw()))
                    .nickname(dto.getNickname())
                    .social(false)
                    .build();

            member.addRole(MemberRole.USER);

            memberRepository.save(member);

            // 신용정보가 있는 경우 MemberCredit 생성 및 저장
            if (hasProfileInfo(dto)) {
                MemberCredit credit = MemberCredit.builder()
                        .member(member)
                        .age(dto.getAge())
                        .homeOwnership(dto.getHomeOwnership())
                        .income(dto.getIncome())
                        .creditScore(dto.getCreditScore())
                        .loanType(dto.getLoanType())
                        .debt(dto.getDebt())
                        .assets(dto.getAssets())
                        .employmentType(dto.getEmploymentType())
                        .workPeriod(dto.getWorkPeriod())
                        .ratePreference(dto.getRatePreference())
                        .collateralType(dto.getCollateralType())
                        .userCondition(dto.getUserCondition())
                        .mainBank(dto.getMainBank())
                        .collateralValue(dto.getCollateralValue())
                        .build();

                memberCreditRepository.save(credit);
            }

            return ResponseEntity.ok("회원가입 성공");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("회원가입 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 신용정보가 있는지 확인하는 메서드
    private boolean hasProfileInfo(MemberSignupDTO dto) {
        return dto.getAge() != null || dto.getHomeOwnership() != null || 
               dto.getIncome() != null || dto.getCreditScore() != null ||
               dto.getLoanType() != null || dto.getDebt() != null ||
               dto.getAssets() != null || dto.getEmploymentType() != null ||
               dto.getWorkPeriod() != null || dto.getRatePreference() != null ||
               dto.getCollateralType() != null || dto.getUserCondition() != null ||
               dto.getMainBank() != null || dto.getCollateralValue() != null;
    }

    // 마이페이지 - 신용정보 조회
    @GetMapping("/credit-info")
    public ResponseEntity<?> getCreditInfo(@RequestParam(name = "email") String email) {
        try {
            Optional<MemberCredit> creditInfo = memberCreditRepository.findByMember_Email(email);
            Optional<Member> memberInfo = memberRepository.findById(email);
            
            Map<String, Object> response = new HashMap<>();
            
            if (memberInfo.isPresent()) {
                response.put("nickname", memberInfo.get().getNickname());
                response.put("social", memberInfo.get().isSocial());
            }
            
            if (creditInfo.isPresent()) {
                // MemberCredit 객체만 반환 (Member 객체의 순환 참조 방지)
                MemberCredit credit = creditInfo.get();
                response.put("creditInfo", credit);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("신용정보 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 토큰 갱신
    @GetMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestParam(name = "refreshToken") String refreshToken) {
        try {
            // JWT 토큰 검증
            Map<String, Object> claims = JWTUtil.validateToken(refreshToken);
            
            if (claims == null) {
                return ResponseEntity.badRequest().body("유효하지 않은 토큰입니다.");
            }
            
            // 새로운 accessToken 생성 (24시간)
            String newAccessToken = JWTUtil.generateToken(claims, 60 * 24);
            
            // 새로운 refreshToken 생성 (7일)
            String newRefreshToken = JWTUtil.generateToken(claims, 60 * 24 * 7);
            
            // 응답 데이터 구성
            Map<String, String> tokenData = new HashMap<>();
            tokenData.put("accessToken", newAccessToken);
            tokenData.put("refreshToken", newRefreshToken);
            
            return ResponseEntity.ok(tokenData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("토큰 갱신 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 마이페이지 - 신용정보 업데이트
    @PutMapping("/credit-info")
    public ResponseEntity<?> updateCreditInfo(@RequestBody MemberSignupDTO dto) {
        try {
            Optional<MemberCredit> existingCredit = memberCreditRepository.findByMember_Email(dto.getEmail());
            
            if (existingCredit.isPresent()) {
                // 기존 신용정보 업데이트
                MemberCredit credit = existingCredit.get();
                credit.updateProfile(MemberCredit.builder()
                    .age(dto.getAge())
                    .homeOwnership(dto.getHomeOwnership())
                    .income(dto.getIncome())
                    .creditScore(dto.getCreditScore())
                    .loanType(dto.getLoanType())
                    .debt(dto.getDebt())
                    .assets(dto.getAssets())
                    .employmentType(dto.getEmploymentType())
                    .workPeriod(dto.getWorkPeriod())
                    .ratePreference(dto.getRatePreference())
                    .collateralType(dto.getCollateralType())
                    .userCondition(dto.getUserCondition())
                    .mainBank(dto.getMainBank())
                    .collateralValue(dto.getCollateralValue())
                    .build());
                
                memberCreditRepository.save(credit);
                return ResponseEntity.ok("신용정보가 업데이트되었습니다.");
            } else {
                // 새로운 신용정보 생성
                Optional<Member> member = memberRepository.findById(dto.getEmail());
                if (member.isPresent()) {
                    MemberCredit newCredit = MemberCredit.builder()
                        .member(member.get())
                        .age(dto.getAge())
                        .homeOwnership(dto.getHomeOwnership())
                        .income(dto.getIncome())
                        .creditScore(dto.getCreditScore())
                        .loanType(dto.getLoanType())
                        .debt(dto.getDebt())
                        .assets(dto.getAssets())
                        .employmentType(dto.getEmploymentType())
                        .workPeriod(dto.getWorkPeriod())
                        .ratePreference(dto.getRatePreference())
                        .collateralType(dto.getCollateralType())
                    .userCondition(dto.getUserCondition())
                        .mainBank(dto.getMainBank())
                        .collateralValue(dto.getCollateralValue())
                        .build();
                    
                    memberCreditRepository.save(newCredit);
                    return ResponseEntity.ok("신용정보가 저장되었습니다.");
                } else {
                    return ResponseEntity.badRequest().body("존재하지 않는 회원입니다.");
                }
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("신용정보 업데이트 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 비밀번호 변경
     */
    @PutMapping("/change-password")
    public Map<String, String> changePassword(@RequestBody Map<String, String> request) {
        log.info("비밀번호 변경 요청: {}", request.get("email"));
        
        String email = request.get("email");
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        
        memberService.changePassword(email, currentPassword, newPassword);
        
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("result", "success");
        resultMap.put("message", "비밀번호가 성공적으로 변경되었습니다.");
        
        return resultMap;
    }

    /**
     * 닉네임 변경
     */
    @PutMapping("/change-nickname")
    public Map<String, String> changeNickname(@RequestBody Map<String, String> request) {
        log.info("닉네임 변경 요청: {}", request.get("email"));
        
        String email = request.get("email");
        String newNickname = request.get("nickname");
        
        if (newNickname == null || newNickname.trim().isEmpty()) {
            Map<String, String> errorMap = new HashMap<>();
            errorMap.put("result", "error");
            errorMap.put("message", "닉네임을 입력해주세요.");
            return errorMap;
        }
        
        if (newNickname.trim().length() < 2) {
            Map<String, String> errorMap = new HashMap<>();
            errorMap.put("result", "error");
            errorMap.put("message", "닉네임은 최소 2자 이상이어야 합니다.");
            return errorMap;
        }
        
        memberService.changeNickname(email, newNickname.trim());
        
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("result", "success");
        resultMap.put("message", "닉네임이 성공적으로 변경되었습니다.");
        
        return resultMap;
    }

    // 챗봇용 사용자 상세 정보 조회
    @GetMapping("/detail/{email}")
    public ResponseEntity<?> getUserDetailForChatbot(@PathVariable String email) {
        try {
            Optional<Member> memberOpt = memberRepository.findById(email);
            if (!memberOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Member member = memberOpt.get();
            Optional<MemberCredit> creditOpt = memberCreditRepository.findByMember_Email(email);

            Map<String, Object> userDetail = new HashMap<>();
            
            // 기본 회원 정보
            userDetail.put("email", member.getEmail());
            userDetail.put("nickname", member.getNickname());
            userDetail.put("social", member.isSocial());
            userDetail.put("roles", member.getMemberRoleList().stream()
                    .map(role -> role.name())
                    .toArray(String[]::new));

            // 신용 정보가 있는 경우
            if (creditOpt.isPresent()) {
                MemberCredit credit = creditOpt.get();
                userDetail.put("age", credit.getAge());
                userDetail.put("homeOwnership", credit.getHomeOwnership());
                userDetail.put("income", credit.getIncome());
                userDetail.put("creditScore", credit.getCreditScore());
                userDetail.put("loanType", credit.getLoanType());
                userDetail.put("debt", credit.getDebt());
                userDetail.put("assets", credit.getAssets());
                userDetail.put("employmentType", credit.getEmploymentType());
                userDetail.put("workPeriod", credit.getWorkPeriod());
                userDetail.put("ratePreference", credit.getRatePreference());
                userDetail.put("collateralType", credit.getCollateralType());
                userDetail.put("userCondition", credit.getUserCondition());
                userDetail.put("mainBank", credit.getMainBank());
                userDetail.put("collateralValue", credit.getCollateralValue());
            } else {
                // 신용 정보가 없는 경우 기본값 설정
                userDetail.put("age", null);
                userDetail.put("homeOwnership", null);
                userDetail.put("income", null);
                userDetail.put("creditScore", null);
                userDetail.put("loanType", null);
                userDetail.put("debt", null);
                userDetail.put("assets", null);
                userDetail.put("employmentType", null);
                userDetail.put("workPeriod", null);
                userDetail.put("ratePreference", null);
                userDetail.put("collateralType", null);
                userDetail.put("userCondition", null);
                userDetail.put("mainBank", null);
                userDetail.put("collateralValue", null);
            }

            return ResponseEntity.ok(userDetail);
        } catch (Exception e) {
            log.error("사용자 상세 정보 조회 중 오류: ", e);
            return ResponseEntity.internalServerError().body("사용자 정보 조회 중 오류가 발생했습니다.");
        }
    }

    // 최대 구매 가능액 조회
    @GetMapping("/credit-info/max-purchase-amount")
    public ResponseEntity<?> getMaxPurchaseAmount(@RequestParam(name = "email") String email) {
        try {
            Optional<MemberCredit> creditInfo = memberCreditRepository.findByMember_Email(email);
            
            if (creditInfo.isPresent()) {
                MemberCredit credit = creditInfo.get();
                Map<String, Object> response = new HashMap<>();
                response.put("maxPurchaseAmount", credit.getMaxPurchaseAmount());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(404).body("신용 정보를 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            log.error("최대 구매 가능액 조회 중 오류: ", e);
            return ResponseEntity.internalServerError().body("최대 구매 가능액 조회 중 오류가 발생했습니다.");
        }
    }

    // 최대 구매 가능액 저장
    @PutMapping("/credit-info/max-purchase-amount")
    public ResponseEntity<?> saveMaxPurchaseAmount(@RequestBody Map<String, Object> request) {
        try {
            String email = (String) request.get("email");
            Long maxPurchaseAmount = Long.valueOf(request.get("maxPurchaseAmount").toString());
            
            // 입력값이 "원" 단위인 경우 "만원" 단위로 변환 (10000으로 나누기)
            // 프론트엔드에서 "만원" 단위로 보내주지만, 혹시 "원" 단위로 보내는 경우를 대비
            if (maxPurchaseAmount > 10000) {
                maxPurchaseAmount = maxPurchaseAmount / 10000;
                log.info("최대 구매 가능액을 만원 단위로 변환: {} -> {}", 
                    maxPurchaseAmount * 10000, maxPurchaseAmount);
            }
            
            Optional<MemberCredit> creditInfo = memberCreditRepository.findByMember_Email(email);
            
            if (creditInfo.isPresent()) {
                MemberCredit credit = creditInfo.get();
                credit.updateMaxPurchaseAmount(maxPurchaseAmount);
                memberCreditRepository.save(credit);
                
                Map<String, Object> response = new HashMap<>();
                response.put("message", "최대 구매 가능액이 성공적으로 저장되었습니다.");
                response.put("maxPurchaseAmount", maxPurchaseAmount);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(404).body("신용 정보를 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            log.error("최대 구매 가능액 저장 중 오류: ", e);
            return ResponseEntity.internalServerError().body("최대 구매 가능액 저장 중 오류가 발생했습니다.");
        }
    }
}
