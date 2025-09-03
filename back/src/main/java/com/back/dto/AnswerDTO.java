package com.back.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnswerDTO {
    private Long id;
    private Long boardId;
    private String content;
    private String writer;
    private String createdAt;
    
    // Reply와의 관계
    private List<ReplyDTO> replies;
}
