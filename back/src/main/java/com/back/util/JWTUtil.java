package com.back.util;

import java.time.ZonedDateTime;
import java.util.Date;
import java.util.Map;
import java.util.HashMap;

import javax.crypto.SecretKey;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.InvalidClaimException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;

public class JWTUtil {

    private static final String SECRET_KEY = "1234567890123456789012345678901234567890";

    public static String generateToken(Map<String, Object> valueMap, int min) {
        SecretKey key;
        try {
            key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes("UTF-8"));
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }

        // 호출 시점마다 시간 생성 → 토큰이 항상 달라짐
        ZonedDateTime now = ZonedDateTime.now();

        Map<String, Object> header = new HashMap<>();
        header.put("typ", "JWT");
        
        return Jwts.builder()
                .setHeader(header)
                .setClaims(valueMap)
                .setIssuedAt(Date.from(now.toInstant()))
                .setExpiration(Date.from(now.plusMinutes(min).toInstant()))
                .signWith(key)
                .compact();
    }

    public static Map<String, Object> validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes("UTF-8"));

            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

        } catch (MalformedJwtException e) {
            System.err.println("❌ Malformed JWT token: " + e.getMessage());
            throw new CustomJWTException("Malformed JWT token");
        } catch (ExpiredJwtException e) {
            System.err.println("❌ Expired JWT token: " + e.getMessage());
            throw new CustomJWTException("Expired JWT token");
        } catch (InvalidClaimException e) {
            System.err.println("❌ Invalid claim: " + e.getMessage());
            throw new CustomJWTException("Invalid claim");
        } catch (JwtException e) {
            System.err.println("❌ JWT error: " + e.getMessage());
            throw new CustomJWTException("JWT error");
        } catch (Exception e) {
            System.err.println("❌ Unknown error: " + e.getMessage());
            e.printStackTrace();
            throw new CustomJWTException("Unknown error");
        }
    }
}