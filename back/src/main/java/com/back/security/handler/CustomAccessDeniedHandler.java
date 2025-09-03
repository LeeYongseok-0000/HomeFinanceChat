package com.back.security.handler;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;
import java.util.HashMap;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

import com.google.gson.Gson;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CustomAccessDeniedHandler implements AccessDeniedHandler{

  @Override
  public void handle(HttpServletRequest request, HttpServletResponse response,
      AccessDeniedException accessDeniedException) throws IOException, ServletException {

    Gson gson = new Gson();
    
    Map<String, String> errorMap = new HashMap<>();
    errorMap.put("error", "ERROR_ACCESSDENIED");
    String jsonStr = gson.toJson(errorMap);

    response.setContentType("application/json");
    response.setStatus(HttpStatus.FORBIDDEN.value());
    PrintWriter printWriter = response.getWriter();
    printWriter.println(jsonStr);
    printWriter.close();        

  }
  
}