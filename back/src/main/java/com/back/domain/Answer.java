package com.back.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "answer")
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    @JsonIgnore
    private Board board;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String writer;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // Reply와의 OneToMany 관계
    @OneToMany(mappedBy = "answer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Reply> replies = new ArrayList<>();

    // replies 설정 메서드
    public void setReplies(List<Reply> replies) {
        this.replies = replies != null ? replies : new ArrayList<>();
    }
}
