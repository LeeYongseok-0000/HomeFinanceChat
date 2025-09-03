package com.back.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.*;

@Getter
@Setter
public class BoardDTO {

    private Long id;

    private String title;

    private String content;

    private String writer;
    
    private String category;
    
    private String buildingName;
    
    private String roadAddress;

    private Integer answerCount;

    private String createdAt;

    private boolean complete;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  private LocalDate dueDate;
}
