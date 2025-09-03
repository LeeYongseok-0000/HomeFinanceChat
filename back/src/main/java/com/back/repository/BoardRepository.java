package com.back.repository;

import com.back.domain.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findByCategoryOrderByIdDesc(String category);
    List<Board> findAllByOrderByIdDesc();
}
