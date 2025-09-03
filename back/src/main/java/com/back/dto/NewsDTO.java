package com.back.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewsDTO {
    
    private Long id;
    private String title;
    private String content;
    private String summary;
    private String category;
    private String source;
    private String url;
    private String imageUrl;
    private String videoUrl;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
} 