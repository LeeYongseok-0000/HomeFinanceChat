package com.back.service;

import com.back.domain.Board;
import com.back.repository.BoardRepository;
import com.back.util.CustomFileUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Log4j2
public class BoardServiceImpl implements BoardService {

    private final BoardRepository boardRepository;
    private final CustomFileUtil customFileUtil;

    @Override
    public List<Board> getBoards(String category) {
        try {
            log.info("=== BoardService.getBoards() 시작 ===");
            log.info("입력 카테고리: '{}'", category);
            log.info("카테고리 길이: {}", category.length());
            log.info("카테고리 equals '전체': {}", category.equals("전체"));
            log.info("카테고리 == '전체': {}", category == "전체");
            
            List<Board> boards;
            
            if (category.equals("전체")) {
                log.info("전체 카테고리 조회 - boardRepository.findAllByOrderByIdDesc() 호출");
                boards = boardRepository.findAllByOrderByIdDesc();
                log.info("전체 카테고리 조회 완료 - 결과 개수: {}", boards != null ? boards.size() : "null");
            } else {
                log.info("특정 카테고리 조회 - boardRepository.findByCategoryOrderByIdDesc('{}') 호출", category);
                boards = boardRepository.findByCategoryOrderByIdDesc(category);
                log.info("특정 카테고리 조회 완료 - 결과 개수: {}", boards != null ? boards.size() : "null");
            }
            
            if (boards == null) {
                log.warn("Repository에서 null 반환됨");
                return new ArrayList<>();
            }
            
            log.info("=== BoardService.getBoards() 성공 ===");
            return boards;
            
        } catch (Exception e) {
            log.error("=== BoardService.getBoards() 실패 ===");
            log.error("에러 타입: {}", e.getClass().getName());
            log.error("에러 메시지: {}", e.getMessage());
            log.error("에러 상세:", e);
            
            // 스택 트레이스 출력
            StackTraceElement[] stackTrace = e.getStackTrace();
            for (int i = 0; i < Math.min(stackTrace.length, 10); i++) {
                log.error("스택 {}: {}", i, stackTrace[i]);
            }
            
            throw new RuntimeException("BoardService에서 게시글 목록 조회 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public Optional<Board> getBoard(Long id) {
        log.info("게시글 조회 - ID: {}", id);
        return boardRepository.findById(id);
    }

    @Override
    public Board save(Board board) {
        log.info("게시글 저장 - 제목: {}, 작성자: {}", board.getTitle(), board.getWriter());
        Board savedBoard = boardRepository.save(board);
        log.info("게시글 저장 완료 - ID: {}", savedBoard.getId());
        return savedBoard;
    }

    @Override
    public Board update(Long id, Board board) {
        log.info("게시글 수정 - ID: {}", id);
        Board existingBoard = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id));
        
        existingBoard.setTitle(board.getTitle());
        existingBoard.setContent(board.getContent());
        existingBoard.setWriter(board.getWriter());
        existingBoard.setCategory(board.getCategory());
        existingBoard.setBuildingName(board.getBuildingName());
        existingBoard.setRoadAddress(board.getRoadAddress());
        existingBoard.setComplete(board.isComplete());
        existingBoard.setDueDate(board.getDueDate());
        
        Board updatedBoard = boardRepository.save(existingBoard);
        log.info("게시글 수정 완료 - ID: {}", updatedBoard.getId());
        return updatedBoard;
    }

    @Override
    public void delete(Long id) {
        log.info("게시글 삭제 - ID: {}", id);
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id));
        
        // 게시글에 첨부된 이미지들 삭제
        if (board.getImageUrls() != null && !board.getImageUrls().isEmpty()) {
            for (String imageUrl : board.getImageUrls()) {
                deleteImage(imageUrl);
            }
        }
        
        boardRepository.delete(board);
        log.info("게시글 삭제 완료 - ID: {}", id);
    }

    @Override
    public List<String> saveImages(List<MultipartFile> images) {
        log.info("이미지 저장 시작 - 이미지 개수: {}", images != null ? images.size() : 0);
        
        // CustomFileUtil을 사용하여 파일 저장
        List<String> savedFileNames = customFileUtil.saveFiles(images);
        
        // 파일명을 URL로 변환
        List<String> imageUrls = new java.util.ArrayList<>();
        for (String fileName : savedFileNames) {
            String imageUrl = "/files/" + fileName;
            imageUrls.add(imageUrl);
            log.info("이미지 URL 생성: {} -> {}", fileName, imageUrl);
        }
        
        log.info("이미지 저장 완료 - 총 {}개 URL 생성", imageUrls.size());
        return imageUrls;
    }

    @Override
    public void deleteImage(String imageUrl) {
        try {
            // URL에서 파일명 추출 (/files/filename.jpg -> filename.jpg)
            String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            
            log.info("이미지 삭제 시도: {}", fileName);
            
            // CustomFileUtil을 사용하여 파일 삭제
            customFileUtil.deleteFiles(java.util.List.of(fileName));
            
            log.info("이미지 삭제 완료: {}", fileName);
        } catch (Exception e) {
            log.error("이미지 삭제 실패: {}", imageUrl, e);
            throw new RuntimeException("이미지 삭제 실패", e);
        }
    }
}
