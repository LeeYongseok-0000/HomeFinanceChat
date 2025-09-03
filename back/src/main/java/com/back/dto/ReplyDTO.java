package com.back.dto;

import lombok.*;

@Getter
@Setter
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReplyDTO {
    private Long id;
    private Long answerId;
    private String content;
    private String writer;
    private String createdAt;
} 