package com.back.controller.advice;

import java.util.Map;
import java.util.NoSuchElementException;
import java.util.HashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.back.util.CustomJWTException;

/**
 * CustomControllerAdvice
 */
@RestControllerAdvice
public class CustomControllerAdvice {


  @ExceptionHandler(NoSuchElementException.class)
  protected ResponseEntity<?> notExist(NoSuchElementException e) {

      String msg = e.getMessage();

      Map<String, String> msgMap = new HashMap<>();
      msgMap.put("msg", msg);
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(msgMap);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  protected ResponseEntity<?> handleIllegalArgumentException(MethodArgumentNotValidException e) {

      String msg = e.getMessage();

      Map<String, String> msgMap = new HashMap<>();
      msgMap.put("msg", msg);
      return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(msgMap);
  }

   @ExceptionHandler(CustomJWTException.class)
  protected ResponseEntity<?> handleJWTException(CustomJWTException e) {

      String msg = e.getMessage();

      Map<String, String> errorMap = new HashMap<>();
      errorMap.put("error", msg);
      return ResponseEntity.ok().body(errorMap);
  }
}