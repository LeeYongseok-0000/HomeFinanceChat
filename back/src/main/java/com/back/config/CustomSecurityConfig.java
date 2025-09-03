package com.back.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.back.security.filter.JWTCheckFilter;
import com.back.security.handler.APILoginFailHandler;
import com.back.security.handler.APILoginSuccessHandler;
import com.back.security.handler.CustomAccessDeniedHandler;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.http.HttpStatus;// HttpStatus 임포트

@Configuration
@Log4j2
@RequiredArgsConstructor
@EnableMethodSecurity// @PreAuthorize를 사용하려면 이게 설정이 되어있어야 한다. 
public class CustomSecurityConfig {

    @Bean
  public PasswordEncoder passwordEncoder(){
    return new BCryptPasswordEncoder();
  }

@Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    
    log.info("---------------------security config---------------------------");

    http.cors(httpSecurityCorsConfigurer -> {
      httpSecurityCorsConfigurer.configurationSource(corsConfigurationSource());
    });

http.authorizeHttpRequests(auth -> auth
      .requestMatchers("/api/loan-products/recommend").permitAll()
      .anyRequest().permitAll()
    );


    
    http.sessionManagement(sessionConfig ->  sessionConfig.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

    http.csrf(config -> config.disable());
    http.formLogin(config ->{
      config.loginPage("/api/member/login");
      config.successHandler(new APILoginSuccessHandler());
      config.failureHandler(new APILoginFailHandler());
    });



    http.addFilterBefore(new JWTCheckFilter(), UsernamePasswordAuthenticationFilter.class); //JWT 체크

     http.exceptionHandling(config -> { config.accessDeniedHandler(new CustomAccessDeniedHandler());
      //추가
            // 인증되지 않은 사용자가 보호된 리소스에 접근 시 401 Unauthorized 반환 (302 리다이렉트 방지)
            config.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED));
        });
    return http.build();
  }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

    CorsConfiguration configuration = new CorsConfiguration();

    // 프론트엔드 오리진 허용 (allowCredentials가 true일 때는 * 사용 불가)
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
    
    // 모든 HTTP 메서드 허용
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
    
    // 모든 헤더 허용
    configuration.setAllowedHeaders(Arrays.asList("*"));
    
    // 노출할 헤더 설정
    configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
    
    // 자격 증명 허용
    configuration.setAllowCredentials(true);
    
    // 프리플라이트 요청 캐시 시간 (초)
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);

    return source;
  }
  
}