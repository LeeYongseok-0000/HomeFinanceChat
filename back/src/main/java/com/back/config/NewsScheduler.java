package com.back.config;

import com.back.service.NewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Log4j2
public class NewsScheduler {
    
    private final NewsService newsService;
    
    // 6시간마다 뉴스 갈아치우기 (매일 00:00, 06:00, 12:00, 18:00)
    @Scheduled(cron = "0 0 */6 * * *")
    public void refreshNewsPeriodically() {
        log.info("🕐 6시간마다 뉴스 갈아치우기 실행 시작");
        
        try {
            newsService.refreshNewsFromAPI();
            log.info("✅ 뉴스 갈아치우기 완료");
        } catch (Exception e) {
            log.error("❌ 뉴스 갈아치우기 실패: {}", e.getMessage());
        }
    }
    
    // 애플리케이션 시작 시 즉시 뉴스 데이터 수집 (초기 데이터 생성)
    @Scheduled(initialDelay = 10000, fixedDelay = Long.MAX_VALUE) // 10초 후 1회 실행
    public void initializeNewsData() {
        log.info("🚀 애플리케이션 시작 시 뉴스 데이터 초기화 시작");
        
        try {
            // 뉴스 데이터가 없으면 초기 데이터 생성
            if (newsService.count() == 0) {
                log.info("📰 뉴스 데이터가 없습니다. 초기 데이터를 생성합니다.");
                newsService.refreshNewsFromAPI();
            } else {
                log.info("📰 이미 뉴스 데이터가 존재합니다. 초기화를 건너뜁니다.");
            }
        } catch (Exception e) {
            log.error("❌ 뉴스 데이터 초기화 실패: {}", e.getMessage());
        }
    }
    
    // 매일 새벽 2시에 뉴스 상태 확인
    @Scheduled(cron = "0 0 2 * * *")
    public void checkNewsStatus() {
        log.info("🕐 뉴스 상태 확인 시작");
        
        try {
            long newsCount = newsService.count();
            log.info("📊 현재 뉴스 개수: {}개", newsCount);
            
            if (newsCount == 0) {
                log.warn("⚠️ 뉴스 데이터가 없습니다. 수동 갈아치우기를 권장합니다.");
            } else {
                log.info("✅ 뉴스 데이터 정상");
            }
        } catch (Exception e) {
            log.error("❌ 뉴스 상태 확인 실패: {}", e.getMessage());
        }
    }
} 