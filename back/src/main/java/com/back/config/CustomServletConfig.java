package com.back.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//이미지 삽입
import org.springframework.beans.factory.annotation.Value;
// import java.io.File;

import com.back.controller.formatter.LocalDateFormatter;

@Configuration
public class CustomServletConfig implements WebMvcConfigurer{

  @Value("${com.back.upload.path}") // application.properties에서 경로 주입
  private String uploadPath; // 추가

  @Override
  public void addFormatters(FormatterRegistry registry) {
    
    registry.addFormatter(new LocalDateFormatter());
  }

      // CORS 설정은 CustomSecurityConfig에서 처리하므로 여기서는 제거
      // @Override
      // public void addCorsMappings(CorsRegistry registry) {
      //   registry.addMapping("/**")
      //           .allowedOriginPatterns("*")
      //           .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD")
      //           .allowedHeaders("*")
      //           .exposedHeaders("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers")
      //           .allowCredentials(true)
      //           .maxAge(3600);
      // }

@Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
            .addResourceHandler("/files/**")
            .addResourceLocations("file:/" + uploadPath);
             // 실제 파일이 저장된 서버 경로
    }

    
}