package com.back.controller;

import com.back.domain.Board;
import com.back.service.BoardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import org.springframework.http.ResponseEntity;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/board")
@CrossOrigin(origins = "*")
@Log4j2
public class BoardController {

    private final BoardService boardService;

    // 게시글 목록 조회
    @GetMapping("/list")
    public List<Board> getBoards(@RequestParam("category") String category) {
        try {
            log.info("게시글 목록 조회 - 카테고리: {}", category);
            List<Board> boards = boardService.getBoards(category);
            
            if (boards == null) {
                return new ArrayList<>();
            }
            
            log.info("게시글 목록 조회 완료 - 총 {}개", boards.size());
            return boards;
            
        } catch (Exception e) {
            log.error("게시글 목록 조회 실패: {}", e.getMessage());
            throw new RuntimeException("게시글 목록 조회 중 오류 발생: " + e.getMessage(), e);
        }
    }

    // 게시글 읽기
    @GetMapping("/read/{id}")
    public Board getBoard(@PathVariable("id") Long id) {
        log.info("게시글 읽기 요청 - ID: {}", id);
        return boardService.getBoard(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id));
    }

    // 게시글 작성
    @PostMapping("/add")
    public Board createBoard(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("writer") String writer,
            @RequestParam("category") String category,
            @RequestParam(value = "buildingName", required = false) String buildingName,
            @RequestParam(value = "roadAddress", required = false) String roadAddress,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        
        log.info("게시글 생성 - 제목: {}, 작성자: {}, 카테고리: {}", title, writer, category);
        
        try {
            List<String> imageUrls = boardService.saveImages(images);
            
            Board board = Board.builder()
                    .title(title)
                    .content(content)
                    .writer(writer)
                    .category(category)
                    .buildingName(buildingName)
                    .roadAddress(roadAddress)
                    .imageUrls(imageUrls)
                    .build();
            
            Board savedBoard = boardService.save(board);
            log.info("게시글 저장 완료 - ID: {}", savedBoard.getId());
            
            return savedBoard;
        } catch (Exception e) {
            log.error("게시글 생성 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("게시글 저장에 실패했습니다: " + e.getMessage(), e);
        }
    }

    // 게시글 수정
    @PutMapping("/modify")
    public Board updateBoard(@RequestParam("id") Long id, @RequestBody Board board) {
        log.info("게시글 수정 요청 - ID: {}", id);
        return boardService.update(id, board);
    }
    
    // 게시글 수정 (이미지 포함)
    @PutMapping("/modify/images")
    public Board updateBoardWithImages(
            @RequestParam("id") Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("writer") String writer,
            @RequestParam("category") String category,
            @RequestParam(value = "buildingName", required = false) String buildingName,
            @RequestParam(value = "roadAddress", required = false) String roadAddress,
            @RequestParam(value = "deletedImages", required = false) List<String> deletedImages,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        
        log.info("게시글 수정 요청 (이미지 포함) - ID: {}", id);
        
        Board existingBoard = boardService.getBoard(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id));
        
        existingBoard.setTitle(title);
        existingBoard.setContent(content);
        existingBoard.setWriter(writer);
        existingBoard.setCategory(category);
        existingBoard.setBuildingName(buildingName);
        existingBoard.setRoadAddress(roadAddress);
        
        List<String> currentImageUrls = new ArrayList<>(existingBoard.getImageUrls());
        
        if (deletedImages != null) {
            deletedImages.forEach(imageUrl -> {
                try {
                    boardService.deleteImage(imageUrl);
                } catch (Exception e) {
                    log.error("이미지 삭제 실패: {}", imageUrl, e);
                }
            });
            currentImageUrls.removeAll(deletedImages);
        }
        
        if (images != null && !images.isEmpty()) {
            List<String> newImageUrls = boardService.saveImages(images);
            currentImageUrls.addAll(newImageUrls);
        }
        
        existingBoard.setImageUrls(currentImageUrls);
        
        Board updatedBoard = boardService.save(existingBoard);
        log.info("게시글 수정 완료 - ID: {}", updatedBoard.getId());
        
        return updatedBoard;
    }

    // 게시글 삭제
    @DeleteMapping("/remove/{id}")
    public void deleteBoard(@PathVariable("id") Long id) {
        log.info("게시글 삭제 요청 - ID: {}", id);
        boardService.delete(id);
    }
}
