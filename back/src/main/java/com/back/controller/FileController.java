package com.back.controller;

import com.back.util.CustomFileUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Log4j2
public class FileController {

    private final CustomFileUtil customFileUtil;

    // 여러 파일 업로드 처리
    @PostMapping("/upload")
    public List<String> uploadFiles(@RequestParam("files") List<MultipartFile> files) {
        log.info("=== 파일 업로드 요청 시작 ===");
        log.info("업로드 요청된 파일 개수: {}", files != null ? files.size() : 0);
        
        if (files != null) {
            for (int i = 0; i < files.size(); i++) {
                MultipartFile file = files.get(i);
                log.info("파일 {}: 이름={}, 크기={}, 타입={}", 
                    i + 1, file.getOriginalFilename(), file.getSize(), file.getContentType());
            }
        }
        
        List<String> result = customFileUtil.saveFiles(files);
        log.info("=== 파일 업로드 완료 ===");
        log.info("저장된 파일명들: {}", result);
        return result;
    }

    // 파일 다운로드/조회
    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getFile(@PathVariable("filename") String filename) {
        log.info("=== 파일 요청 시작 ===");
        log.info("요청된 파일명: {}", filename);
        
        try {
            ResponseEntity<Resource> response = customFileUtil.getFile(filename);
            log.info("=== 파일 요청 완료 ===");
            log.info("응답 상태: {}", response.getStatusCode());
            log.info("응답 헤더: {}", response.getHeaders());
            return response;
        } catch (Exception e) {
            log.error("=== 파일 요청 실패 ===");
            log.error("파일명: {}, 오류: {}", filename, e.getMessage(), e);
            throw e;
        }
    }

    // 파일 삭제 (삭제할 파일명 리스트를 JSON 배열로 받음)
    @DeleteMapping
    public void deleteFiles(@RequestBody List<String> fileNames) {
        log.info("=== 파일 삭제 요청 시작 ===");
        log.info("삭제할 파일명들: {}", fileNames);
        
        customFileUtil.deleteFiles(fileNames);
        
        log.info("=== 파일 삭제 완료 ===");
    }
}
