package com.back.service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import com.back.domain.Member;
import com.back.domain.MemberRole;
import com.back.dto.MemberDTO;
import com.back.dto.MemberModifyDTO;
import com.back.repository.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2// accessToken을 기반으로 사용자의 정보를 얻어오는 로직.
public class MemberServiceImpl implements MemberService {

  private final MemberRepository memberRepository;
  private final PasswordEncoder passwordEncoder;


  @Override
  public MemberDTO getKakaoMember(String accessToken) {

    String email = getEmailFromKakaoAccessToken(accessToken);

    log.info("email: " + email );

    Optional<Member> result = memberRepository.findById(email);

    // 기존의 회원
    if(result.isPresent()){
      MemberDTO memberDTO = entityToDTO(result.get());

      return memberDTO;
    }

    // 회원이 아니었다면
    // 닉네임은 '소셜회원'으로
    // 패스워드는 임의로 생성
    Member socialMember = makeSocialMember(email);
    memberRepository.save(socialMember);

    MemberDTO memberDTO = entityToDTO(socialMember);

    return memberDTO;
  }

  @Override
  public MemberDTO getGoogleMember(String accessToken) {
    String email = getEmailFromGoogleAccessToken(accessToken);
    log.info("Google email: " + email);

    Optional<Member> result = memberRepository.findById(email);

    // 기존의 회원
    if(result.isPresent()){
      MemberDTO memberDTO = entityToDTO(result.get());
      return memberDTO;
    }

    // 회원이 아니었다면
    // 닉네임은 '소셜회원'으로
    // 패스워드는 임의로 생성
    Member socialMember = makeSocialMember(email);
    memberRepository.save(socialMember);

    MemberDTO memberDTO = entityToDTO(socialMember);
    return memberDTO;
  }

  @Override
  public MemberDTO getNaverMember(String accessToken) {
    String email = getEmailFromNaverAccessToken(accessToken);
    log.info("Naver email: " + email);

    Optional<Member> result = memberRepository.findById(email);

    // 기존의 회원
    if(result.isPresent()){
      MemberDTO memberDTO = entityToDTO(result.get());
      return memberDTO;
    }

    // 회원이 아니었다면
    // 닉네임은 '소셜회원'으로
    // 패스워드는 임의로 생성
    Member socialMember = makeSocialMember(email);
    memberRepository.save(socialMember);

    MemberDTO memberDTO = entityToDTO(socialMember);
    return memberDTO;
  }

  private String getEmailFromKakaoAccessToken(String accessToken){

    String kakaoGetUserURL = "https://kapi.kakao.com/v2/user/me";

    if(accessToken == null){
      throw new RuntimeException("Access Token is null");
    }
    RestTemplate restTemplate = new RestTemplate();

    HttpHeaders headers = new HttpHeaders();
    headers.add("Authorization", "Bearer " + accessToken);
    headers.add("Content-Type","application/x-www-form-urlencoded");
    HttpEntity<String> entity = new HttpEntity<>(headers);

    UriComponents uriBuilder = UriComponentsBuilder.fromHttpUrl(kakaoGetUserURL).build();

    ResponseEntity<LinkedHashMap> response = 
      restTemplate.exchange(
      uriBuilder.toString(), 
      HttpMethod.GET, 
      entity, 
      LinkedHashMap.class);

    log.info(response);

    LinkedHashMap<String, LinkedHashMap> bodyMap = response.getBody();

          log.info("------------------------------");
      log.info(bodyMap);
      log.info("bodyMap type: " + (bodyMap != null ? bodyMap.getClass().getName() : "null"));

      LinkedHashMap<String, Object> kakaoAccount = bodyMap.get("kakao_account");

      log.info("kakaoAccount: " + kakaoAccount);
      log.info("kakaoAccount type: " + (kakaoAccount != null ? kakaoAccount.getClass().getName() : "null"));
      
      if (kakaoAccount != null) {
        log.info("kakaoAccount keys: " + kakaoAccount.keySet());
        log.info("email value: " + kakaoAccount.get("email"));
        log.info("email type: " + (kakaoAccount.get("email") != null ? kakaoAccount.get("email").getClass().getName() : "null"));
      }

      return (String) kakaoAccount.get("email");

  }

  private String getEmailFromGoogleAccessToken(String accessToken) {
    String googleGetUserURL = "https://www.googleapis.com/oauth2/v2/userinfo";

    if(accessToken == null){
      throw new RuntimeException("Google Access Token is null");
    }
    RestTemplate restTemplate = new RestTemplate();

    HttpHeaders headers = new HttpHeaders();
    headers.add("Authorization", "Bearer " + accessToken);
    HttpEntity<String> entity = new HttpEntity<>(headers);

    UriComponents uriBuilder = UriComponentsBuilder.fromHttpUrl(googleGetUserURL).build();

    ResponseEntity<LinkedHashMap> response = 
      restTemplate.exchange(
      uriBuilder.toString(), 
      HttpMethod.GET, 
      entity, 
      LinkedHashMap.class);

    log.info("Google response: " + response);

    LinkedHashMap<String, Object> bodyMap = response.getBody();
    log.info("Google bodyMap: " + bodyMap);

    if (bodyMap != null && bodyMap.containsKey("email")) {
      return (String) bodyMap.get("email");
    } else {
      throw new RuntimeException("Google에서 이메일 정보를 가져올 수 없습니다.");
    }
  }

  private String getEmailFromNaverAccessToken(String accessToken) {
    String naverGetUserURL = "https://openapi.naver.com/v1/nid/me";

    if(accessToken == null){
      throw new RuntimeException("Naver Access Token is null");
    }
    RestTemplate restTemplate = new RestTemplate();

    HttpHeaders headers = new HttpHeaders();
    headers.add("Authorization", "Bearer " + accessToken);
    HttpEntity<String> entity = new HttpEntity<>(headers);

    UriComponents uriBuilder = UriComponentsBuilder.fromHttpUrl(naverGetUserURL).build();

    ResponseEntity<LinkedHashMap> response = 
      restTemplate.exchange(
      uriBuilder.toString(), 
      HttpMethod.GET, 
      entity, 
      LinkedHashMap.class);

    log.info("Naver response: " + response);

    LinkedHashMap<String, Object> bodyMap = response.getBody();
    log.info("Naver bodyMap: " + bodyMap);

    if (bodyMap != null && bodyMap.containsKey("response")) {
      @SuppressWarnings("unchecked")
      LinkedHashMap<String, Object> naverResponse = (LinkedHashMap<String, Object>) bodyMap.get("response");
      
      if (naverResponse != null && naverResponse.containsKey("email")) {
        return (String) naverResponse.get("email");
      }
    }
    
    throw new RuntimeException("네이버에서 이메일 정보를 가져올 수 없습니다.");
  }
  
  private String makeTempPassword() {

    StringBuffer buffer = new StringBuffer();

    for(int i = 0;  i < 10; i++){
      buffer.append(  (char) ( (int)(Math.random()*55) + 65  ));
    }
    return buffer.toString();
  }
  private Member makeSocialMember(String email) {

   String tempPassword = makeTempPassword();

   log.info("tempPassword: " + tempPassword);

   String nickname = "소셜회원";

   Member member = Member.builder()
   .email(email)
   .pw(passwordEncoder.encode(tempPassword))
   .nickname(nickname)
   .social(true)
   .build();

   member.addRole(MemberRole.USER);

   return member;

  }
@Override
  public void modifyMember(MemberModifyDTO memberModifyDTO) {

    Optional<Member> result = memberRepository.findById(memberModifyDTO.getEmail());

    Member member = result.orElseThrow();

    member.changePw(passwordEncoder.encode(memberModifyDTO.getPw()));
    member.changeSocial(false);
    member.changeNickname(memberModifyDTO.getNickname());

    memberRepository.save(member);

  }

  @Override
  public void changePassword(String email, String currentPassword, String newPassword) {
    log.info("비밀번호 변경 요청: {}", email);
    
    // 사용자 조회
    Optional<Member> result = memberRepository.findById(email);
    if (!result.isPresent()) {
      throw new RuntimeException("사용자를 찾을 수 없습니다.");
    }
    
    Member member = result.get();
    
    // 소셜 로그인 사용자인지 확인
    if (member.isSocial()) {
      throw new RuntimeException("소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.");
    }
    
    // 현재 비밀번호 확인
    if (!passwordEncoder.matches(currentPassword, member.getPw())) {
      throw new RuntimeException("현재 비밀번호가 일치하지 않습니다.");
    }
    
    // 새 비밀번호 유효성 검사
    if (newPassword == null || newPassword.trim().length() < 6) {
      throw new RuntimeException("새 비밀번호는 최소 6자 이상이어야 합니다.");
    }
    
    // 새 비밀번호가 현재 비밀번호와 같은지 확인
    if (passwordEncoder.matches(newPassword, member.getPw())) {
      throw new RuntimeException("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
    }
    
    // 비밀번호 변경
    member.changePw(passwordEncoder.encode(newPassword));
    memberRepository.save(member);
    
    log.info("비밀번호 변경 완료: {}", email);
  }

  @Override
  public void changeNickname(String email, String newNickname) {
    log.info("닉네임 변경 요청: {}", email);
    
    // 사용자 조회
    Optional<Member> result = memberRepository.findById(email);
    if (!result.isPresent()) {
      throw new RuntimeException("사용자를 찾을 수 없습니다.");
    }
    
    Member member = result.get();
    
    // 새 닉네임 유효성 검사
    if (newNickname == null || newNickname.trim().isEmpty()) {
      throw new RuntimeException("닉네임을 입력해주세요.");
    }
    
    if (newNickname.trim().length() < 2) {
      throw new RuntimeException("닉네임은 최소 2자 이상이어야 합니다.");
    }
    
    // 닉네임 변경
    member.changeNickname(newNickname.trim());
    memberRepository.save(member);
    
    log.info("닉네임 변경 완료: {} -> {}", email, newNickname.trim());
  }
  
}