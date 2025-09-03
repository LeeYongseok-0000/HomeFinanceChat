package com.back.security.filter;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.google.gson.Gson;
import com.back.dto.MemberDTO;
import com.back.util.JWTUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;

@Log4j2
public class JWTCheckFilter extends OncePerRequestFilter {

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
    String path = request.getRequestURI();

    log.info("check uri.......................{}", path);

    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
    
    // 정적 리소스
    if (path.startsWith("/static/")) return true;
    if (path.startsWith("/css/")) return true;
    if (path.startsWith("/js/")) return true;
    if (path.startsWith("/images/")) return true;
    if (path.startsWith("/favicon.ico")) return true;
    
    
    
    
    // 회원 관련 (인증 불필요)
    if ("/api/member/signup".equals(path)) return true; 
    if ("/api/member/login".equals(path)) return true;
    if ("/api/member/kakao".equals(path)) return true; // 카카오 로그인 추가
    if ("/api/member/google".equals(path)) return true; // 구글 로그인 추가
    if ("/api/member/naver".equals(path)) return true; // 네이버 로그인 추가
    if ("/api/member/refresh".equals(path)) return true;
     // 토큰 갱신 추가
    
    // 기타 API
    if ("/api/order".equals(path)) return true;
    if ("/api/bootpay".equals(path)) return true;
    if ("/api/loan-products/recommend".equals(path)) return true;
    
    
    
    
    // 에러 페이지들
    if (path.startsWith("/error")) return true;
    
    // 헬스체크
    if ("/health".equals(path)) return true;
    if ("/actuator/health".equals(path)) return true;

    return false;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    log.info("------------------------JWTCheckFilter------------------");

    String authHeaderStr = request.getHeader("Authorization");

    // ✅ 헤더가 없거나 잘못된 경우 그냥 통과 (로그인 안 된 사용자)
    if (authHeaderStr == null || !authHeaderStr.startsWith("Bearer ")) {
      log.warn("Authorization header missing or invalid");
      filterChain.doFilter(request, response);
      return;
    }

    try {
      // Bearer 토큰 추출
      String accessToken = authHeaderStr.substring(7);
      log.info("🔍 검증할 토큰: {}", accessToken.substring(0, Math.min(50, accessToken.length())) + "...");
      
      Map<String, Object> claims = JWTUtil.validateToken(accessToken);

      log.info("JWT claims: {}", claims);

      String email = (String) claims.get("email");
      String pw = (String) claims.get("pw");
      String nickname = (String) claims.get("nickname");
      Boolean social = (Boolean) claims.get("social");
      List<String> roleNames = (List<String>) claims.get("roleNames");

      MemberDTO memberDTO = new MemberDTO(email, pw, nickname, social, roleNames);

      log.info("Authenticated member: {}", memberDTO);

      UsernamePasswordAuthenticationToken authenticationToken =
          new UsernamePasswordAuthenticationToken(memberDTO, pw, memberDTO.getAuthorities());

      SecurityContextHolder.getContext().setAuthentication(authenticationToken);

      filterChain.doFilter(request, response);

    } catch (Exception e) {
      log.error("JWT Check Error: {}", e.getMessage());
      log.error("JWT Check Error Stack Trace:", e);

      Gson gson = new Gson();
      Map<String, String> errorMap = new HashMap<>();
      errorMap.put("error", "ERROR_ACCESS_TOKEN");
      String msg = gson.toJson(errorMap);

      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.setContentType("application/json");
      PrintWriter printWriter = response.getWriter();
      printWriter.println(msg);
      printWriter.close();
    }
  }
}
