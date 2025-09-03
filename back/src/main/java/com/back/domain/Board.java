package com.back.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "board")
@ToString
@Getter 
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Board {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String writer;

    private String category;
    
    private String buildingName;
    
    private String roadAddress;

    private boolean complete;

    private LocalDate dueDate;

    @Column(name = "answer_count")
    @Builder.Default
    private Integer answerCount = 0;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<Answer> answers = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "board_images", joinColumns = @JoinColumn(name = "board_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();



        public void changeTitle(String title){
    this.title = title;
  }

        public void changeComplete(boolean complete){
    this.complete = complete;
  }

        public void changeDueDate(LocalDate dueDate){
    this.dueDate = dueDate;
  }
}
