package com.back.repository;

import com.back.domain.Reply;
import com.back.domain.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReplyRepository extends JpaRepository<Reply, Long> {
    List<Reply> findByAnswer(Answer answer);
} 