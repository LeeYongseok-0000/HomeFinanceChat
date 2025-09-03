package com.back.service;

import com.back.domain.Board;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface BoardService {
    List<Board> getBoards(String category);
    Optional<Board> getBoard(Long id);
    Board save(Board board);
    Board update(Long id, Board board);
    void delete(Long id);
    
    // 파일 처리 메서드 추가
    List<String> saveImages(List<MultipartFile> images);
    void deleteImage(String imageUrl);
}
