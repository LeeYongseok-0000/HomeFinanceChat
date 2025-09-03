package com.back.repository;

import com.back.domain.Answer;
import com.back.domain.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findByBoard(Board board);
}
