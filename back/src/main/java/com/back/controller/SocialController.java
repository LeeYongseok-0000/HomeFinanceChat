package com.back.controller;

import org.springframework.web.bind.annotation.RestController;
import com.back.dto.MemberDTO;
import com.back.dto.MemberModifyDTO;
import com.back.service.MemberService;
import com.back.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import java.util.Map;
import java.util.HashMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@RestController
@Log4j2
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SocialController {
    
    private final MemberService memberService;
    
    @Value("${naver.client.id}")
    private String naverClientId;
    
    @Value("${naver.client.secret}")
    private String naverClientSecret;

    /**
     * 프론트에서 전달받은 카카오 AccessToken으로
     * 회원정보 조회 → JWT 발급 → 리턴
     */
    @GetMapping("/api/member/kakao")
    public Map<String, Object> getMemberFromKakao(@RequestParam(name = "accessToken") String accessToken) {
        log.info("accessToken: {}", accessToken);
        MemberDTO memberDTO = memberService.getKakaoMember(accessToken);
        Map<String,Object> claims = memberDTO.getClaims();

        // JWT 토큰 생성
        String jwtAccessToken  = JWTUtil.generateToken(claims, 60);    // 10분
        String jwtRefreshToken = JWTUtil.generateToken(claims, 60 * 24 * 14); // 1시간

        claims.put("accessToken", jwtAccessToken);
        claims.put("refreshToken", jwtRefreshToken);
        return claims;
    }

    /**
     * 프론트에서 전달받은 구글 AccessToken으로
     * 회원정보 조회 → JWT 발급 → 리턴
     */
    @GetMapping("/api/member/google")
    public Map<String, Object> getMemberFromGoogle(@RequestParam(name = "accessToken") String accessToken) {
        log.info("Google accessToken: {}", accessToken);
        MemberDTO memberDTO = memberService.getGoogleMember(accessToken);
        Map<String,Object> claims = memberDTO.getClaims();

        // JWT 토큰 생성
        String jwtAccessToken  = JWTUtil.generateToken(claims, 60);    // 10분
        String jwtRefreshToken = JWTUtil.generateToken(claims, 60 * 24 * 14); // 1시간

        claims.put("accessToken", jwtAccessToken);
        claims.put("refreshToken", jwtRefreshToken);
        return claims;
    }

    /**
     * 프론트에서 전달받은 네이버 AccessToken으로
     * 회원정보 조회 → JWT 발급 → 리턴
     */
    @GetMapping("/api/member/naver")
    public Map<String, Object> getMemberFromNaver(@RequestParam(name = "accessToken") String accessToken) {
        log.info("Naver accessToken: {}", accessToken);
        MemberDTO memberDTO = memberService.getNaverMember(accessToken);
        Map<String,Object> claims = memberDTO.getClaims();

        // JWT 토큰 생성
        String jwtAccessToken  = JWTUtil.generateToken(claims, 60);    // 10분
        String jwtRefreshToken = JWTUtil.generateToken(claims, 60 * 24 * 14); // 1시간

        claims.put("accessToken", jwtAccessToken);
        claims.put("refreshToken", jwtRefreshToken);
        return claims;
    }

    /**
     * 네이버 OAuth 콜백 처리
     * 프론트에서 받은 code와 state로 네이버 토큰 요청 후 회원 정보 조회
     */
    @PostMapping("/api/auth/naver/callback")
    public Map<String, Object> naverCallback(@RequestBody NaverCallbackRequest request) {
        try {
            log.info("네이버 OAuth 콜백 처리 시작: code={}, state={}", request.getCode(), request.getState());
            
            // 1. 네이버로 액세스 토큰 요청
            String accessToken = getNaverAccessToken(request.getCode(), request.getState());
            log.info("네이버 액세스 토큰 발급 성공");
            
            // 2. 액세스 토큰으로 사용자 정보 조회
            Map<String, Object> userInfo = getNaverUserInfo(accessToken);
            log.info("네이버 사용자 정보 조회 성공");
            
            // 3. 성공 응답 반환
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("accessToken", accessToken);
            result.put("userInfo", userInfo);
            
            return result;
            
        } catch (Exception e) {
            log.error("네이버 OAuth 처리 중 오류 발생", e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "네이버 로그인 처리 중 오류가 발생했습니다.");
            return result;
        }
    }
    
    /**
     * 네이버 액세스 토큰 발급
     */
    private String getNaverAccessToken(String code, String state) {
        RestTemplate restTemplate = new RestTemplate();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", naverClientId);
        params.add("client_secret", naverClientSecret);
        params.add("redirect_uri", "http://localhost:3000/member/naver");
        params.add("code", code);
        params.add("state", state);
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        ResponseEntity<NaverTokenResponse> response = restTemplate.postForEntity(
            "https://nid.naver.com/oauth2.0/token", 
            request, 
            NaverTokenResponse.class
        );
        
        return response.getBody().getAccessToken();
    }
    
    /**
     * 네이버 사용자 정보 조회
     */
    private Map<String, Object> getNaverUserInfo(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
            "https://openapi.naver.com/v1/nid/me",
            HttpMethod.GET,
            request,
            Map.class
        );
        
        return response.getBody();
    }

    @PutMapping("/api/member/modify")
    public Map<String,String> modify(@RequestBody MemberModifyDTO dto) {
        log.info("member modify: {}", dto);
        memberService.modifyMember(dto);
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("result", "modified");
        return resultMap;
    }
    
    @Data
    public static class NaverCallbackRequest {
        private String code;
        private String state;
    }
    
    @Data
    public static class NaverTokenResponse {
        @JsonProperty("access_token")
        private String accessToken;
        
        @JsonProperty("refresh_token")
        private String refreshToken;
        
        @JsonProperty("token_type")
        private String tokenType;
        
        @JsonProperty("expires_in")
        private Integer expiresIn;
    }
}
