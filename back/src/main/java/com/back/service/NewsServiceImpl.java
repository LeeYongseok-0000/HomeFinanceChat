package com.back.service;

import com.back.domain.News;
import com.back.dto.NewsDTO;
import com.back.repository.NewsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class NewsServiceImpl implements NewsService {
    
    private final NewsRepository newsRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public News save(News news) {
        return newsRepository.save(news);
    }
    
    @Override
    public List<News> saveAll(List<News> newsList) {
        return newsRepository.saveAll(newsList);
    }
    
    @Override
    public Page<NewsDTO> getAllNews(Pageable pageable) {
        try {
            log.info("뉴스 조회 시작 - 페이지: {}, 크기: {}", pageable.getPageNumber(), pageable.getPageSize());
            
            // 간단하게 전체 뉴스를 가져와서 DTO로 변환
            List<News> allNews = newsRepository.findAll();
            log.info("전체 뉴스 조회 성공 - 총 개수: {}", allNews.size());
            
            if (allNews.isEmpty()) {
                log.info("뉴스 데이터가 없습니다.");
                return new PageImpl<>(new ArrayList<>(), pageable, 0);
            }
            
            // DTO 변환 - 더 안전한 방식으로 처리
            List<NewsDTO> allDtos = new ArrayList<>();
            for (News news : allNews) {
                try {
                    NewsDTO dto = entityToDTO(news);
                    if (dto != null) {
                        allDtos.add(dto);
                    }
                } catch (Exception e) {
                    log.warn("뉴스 {} DTO 변환 실패: {}", news.getId(), e.getMessage());
                    continue;
                }
            }
            
            log.info("DTO 변환 완료 - 변환된 개수: {}", allDtos.size());
            
            // 간단한 페이징 처리
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), allDtos.size());
            
            if (start >= allDtos.size()) {
                return new PageImpl<>(new ArrayList<>(), pageable, allDtos.size());
            }
            
            List<NewsDTO> pageDtos = allDtos.subList(start, end);
            log.info("페이징 처리 완료 - 시작: {}, 끝: {}, 페이지 크기: {}", start, end, pageDtos.size());
            
            return new PageImpl<>(pageDtos, pageable, allDtos.size());
            
        } catch (Exception e) {
            log.error("뉴스 조회 실패: {}", e.getMessage(), e);
            // 에러가 발생해도 빈 페이지 반환
            return new PageImpl<>(new ArrayList<>(), pageable, 0);
        }
    }
    
    @Override
    public List<NewsDTO> getNewsByCategory(String category) {
        List<News> newsList = newsRepository.findByCategoryOrderByPublishedAtDesc(category);
        return newsList.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<NewsDTO> searchNews(String keyword) {
        Pageable pageable = PageRequest.of(0, 10);
        List<News> newsList = newsRepository.findByTitleContainingOrContentContaining(
            keyword, keyword, pageable);
        return newsList.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public String getRecentNewsSummary() {
        try {
            Pageable pageable = PageRequest.of(0, 5);
            List<News> recentNews = newsRepository.findByCategoryOrderByPublishedAtDesc("부동산", pageable);
            if (recentNews.isEmpty()) {
                return "현재 뉴스 데이터가 없습니다.";
            }
            
            StringBuilder summary = new StringBuilder();
            summary.append("📰 최신 부동산 뉴스 요약:\n\n");
            
            for (int i = 0; i < Math.min(recentNews.size(), 5); i++) {
                News news = recentNews.get(i);
                summary.append(i + 1).append(". ").append(news.getTitle()).append("\n");
                if (news.getSummary() != null && !news.getSummary().isEmpty()) {
                    summary.append("   ").append(news.getSummary().substring(0, 
                        Math.min(news.getSummary().length(), 100))).append("...\n");
                }
                summary.append("\n");
            }
            
            return summary.toString();
        } catch (Exception e) {
            log.error("뉴스 요약 생성 실패: {}", e.getMessage());
            return "뉴스 요약을 생성하는 중 오류가 발생했습니다.";
        }
    }
    
    @Override
    @Transactional
    public void refreshNewsFromAPI() {
        log.info("뉴스 데이터 갈아치우기 시작...");
        
        try {
            // 1. 기존 데이터 완전 삭제
            newsRepository.deleteAll();
            log.info("기존 뉴스 데이터 삭제 완료");
            
            // 2. NewsAPI에서 새 데이터 수집
            List<News> newNews = collectNewsFromAPI();
            
            // 3. 새 데이터 저장
            if (!newNews.isEmpty()) {
                newsRepository.saveAll(newNews);
                log.info("새 뉴스 데이터 {}개 저장 완료", newNews.size());
            } else {
                log.warn("수집된 뉴스 데이터가 없습니다.");
            }
            
        } catch (Exception e) {
            log.error("뉴스 데이터 갈아치우기 실패: {}", e.getMessage());
        }
    }
    
    @Override
    public List<NewsDTO> getNewsForChatbot(String query) {
        log.info("챗봇용 뉴스 조회: {}", query);
        
        try {
            List<News> newsList;
            
            if (query.contains("최신") || query.contains("오늘")) {
                // 최신 뉴스 조회 (24시간 내)
                LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
                newsList = newsRepository.findByPublishedAtAfterOrderByPublishedAtDesc(yesterday);
            } else if (query.contains("아파트")) {
                // 아파트 관련 뉴스
                Pageable pageable = PageRequest.of(0, 5);
                newsList = newsRepository.findByCategoryOrderByPublishedAtDesc("아파트", pageable);
            } else if (query.contains("정책")) {
                // 정책 관련 뉴스
                newsList = newsRepository.findByTitleContainingOrContentContaining(
                    "정책", "정책", PageRequest.of(0, 5));
            } else {
                // 일반 검색
                newsList = newsRepository.findByTitleContainingOrContentContaining(
                    query, query, PageRequest.of(0, 5));
            }
            
            // DTO로 변환하여 반환
            return newsList.stream()
                    .map(this::entityToDTO)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            log.error("챗봇용 뉴스 조회 실패: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
    
    @Override
    public long count() {
        return newsRepository.count();
    }
    
    @Override
    @Transactional
    public void deleteAll() {
        newsRepository.deleteAll();
    }
    
    /**
     * News 엔티티를 NewsDTO로 변환
     */
    private NewsDTO entityToDTO(News news) {
        if (news == null) {
            log.warn("News 엔티티가 null입니다.");
            return null;
        }
        
        try {
            // 각 필드를 안전하게 처리
            Long id = news.getId();
            String title = news.getTitle() != null ? news.getTitle() : "";
            String content = news.getContent() != null ? news.getContent() : "";
            String summary = news.getSummary() != null ? news.getSummary() : "";
            String category = news.getCategory() != null ? news.getCategory() : "일반";
            String source = news.getSource() != null ? news.getSource() : "";
            String url = news.getUrl() != null ? news.getUrl() : "";
            String imageUrl = news.getImageUrl() != null ? news.getImageUrl() : "";
            String videoUrl = news.getVideoUrl() != null ? news.getVideoUrl() : "";
            LocalDateTime publishedAt = news.getPublishedAt() != null ? news.getPublishedAt() : LocalDateTime.now();
            LocalDateTime createdAt = news.getCreatedAt() != null ? news.getCreatedAt() : LocalDateTime.now();
            
            // null 체크 후 DTO 생성
            if (id == null) {
                log.warn("뉴스 ID가 null입니다.");
                return null;
            }
            
            return new NewsDTO(
                id, title, content, summary, category, source, url, imageUrl, videoUrl, publishedAt, createdAt
            );
        } catch (Exception e) {
            log.error("News 엔티티를 DTO로 변환하는 중 오류 발생: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * NewsAPI에서 뉴스 데이터 수집
     */
    private List<News> collectNewsFromAPI() {
        log.info("NewsAPI에서 뉴스 데이터 수집 시작...");
        
        List<News> newsList = new ArrayList<>();
        
        try {
            // NewsAPI 설정
            String apiKey = "393ff5f4f62b43fab38e2d70d464cb53"; // 용석님 API 키
            String baseUrl = "https://newsapi.org/v2/everything";
            
            log.info("NewsAPI 설정 - API 키: {}, Base URL: {}", apiKey.substring(0, 8) + "...", baseUrl);
            
            // 부동산 관련 검색 쿼리들
            String[] queries = {
                "부동산시장 OR 부동산가격 OR 부동산거래 OR 부동산투자",
                "아파트매매 OR 아파트전세 OR 아파트월세 OR 아파트가격",
                "부동산정책 OR 부동산세금 OR 부동산규제 OR 부동산대출",
                "부동산개발 OR 부동산재개발 OR 부동산재건축",
                "부동산중개 OR 부동산법무사 OR 부동산평가"
            };
            
            for (String query : queries) {
                try {
                    log.info("쿼리 처리 시작: {}", query);
                    
                    // NewsAPI 호출 (최신 뉴스부터 정렬)
                    String url = String.format("%s?q=%s&apiKey=%s&language=ko&sortBy=publishedAt&pageSize=10&sortDirection=desc", 
                        baseUrl, query, apiKey);
                    
                    log.info("API 호출 URL: {}", url);
                    
                    String response = restTemplate.getForObject(url, String.class);
                    
                    if (response != null) {
                        log.info("API 응답 받음, 길이: {} 문자", response.length());
                        
                        JsonNode jsonNode = objectMapper.readTree(response);
                        
                        if (jsonNode.has("articles")) {
                            JsonNode articles = jsonNode.get("articles");
                            log.info("기사 개수: {}개", articles.size());
                            
                            for (JsonNode article : articles) {
                                try {
                                    String title = article.path("title").asText("제목 없음");
                                    String content = article.path("content").asText("내용 없음");
                                    String summary = article.path("description").asText("요약 없음");
                                    
                                    // 부동산 관련 키워드가 포함된 뉴스만 필터링
                                    String[] realEstateKeywords = {
                                        "부동산", "아파트", "주택", "오피스텔", "빌라", "연립주택", "단독주택",
                                        "매매", "전세", "월세", "임대", "분양", "재개발", "재건축",
                                        "부동산시장", "부동산가격", "부동산정책", "부동산세금", "부동산대출",
                                        "부동산투자", "부동산개발", "부동산중개", "부동산평가"
                                    };
                                    
                                    boolean isRealEstateNews = false;
                                    String searchText = (title + " " + summary + " " + content).toLowerCase();
                                    
                                    for (String keyword : realEstateKeywords) {
                                        if (searchText.contains(keyword.toLowerCase())) {
                                            isRealEstateNews = true;
                                            break;
                                        }
                                    }
                                    
                                    // 부동산 관련 뉴스가 아닌 경우 건너뛰기
                                    if (!isRealEstateNews) {
                                        log.info("부동산 관련 뉴스가 아님 - 건너뛰기: {}", title.substring(0, Math.min(title.length(), 50)));
                                        continue;
                                    }
                                    
                                    log.info("기사 파싱: 제목={}, 요약={}", title.substring(0, Math.min(title.length(), 30)) + "...", 
                                        summary.substring(0, Math.min(summary.length(), 50)) + "...");
                                    
                                    News news = new News(
                                        null, // id는 자동 생성
                                        title,
                                        content,
                                        summary,
                                        getCategoryFromQuery(query),
                                        article.path("source").path("name").asText("출처 없음"),
                                        article.path("url").asText(""),
                                        article.path("urlToImage").asText(""),
                                        article.path("videoUrl").asText(""), // 동영상 URL 추가
                                        parsePublishedAt(article.path("publishedAt").asText()),
                                        null // createdAt은 자동 생성
                                    );
                                    
                                    newsList.add(news);
                                    log.info("뉴스 추가 완료: {}번째", newsList.size());
                                    
                                    // 최대 30개까지만 수집
                                    if (newsList.size() >= 30) break;
                                    
                                } catch (Exception e) {
                                    log.warn("뉴스 기사 파싱 실패: {}", e.getMessage());
                                    continue;
                                }
                            }
                        } else {
                            log.warn("API 응답에 'articles' 필드가 없습니다. 응답: {}", response.substring(0, Math.min(response.length(), 200)));
                        }
                    } else {
                        log.error("API 응답이 null입니다.");
                    }
                    
                    // API 호출 간격 조절 (초당 1회 제한)
                    Thread.sleep(1000);
                    
                } catch (Exception e) {
                    log.error("쿼리 '{}' 처리 실패: {}", query, e.getMessage(), e);
                    continue;
                }
            }
            
            log.info("NewsAPI에서 {}개 뉴스 데이터 수집 완료", newsList.size());
            
        } catch (Exception e) {
            log.error("NewsAPI 데이터 수집 실패: {}", e.getMessage(), e);
            
            // API 실패 시 빈 리스트 반환 (더미 데이터 생성하지 않음)
            log.warn("NewsAPI 호출 실패로 인해 뉴스 데이터를 수집할 수 없습니다.");
            return new ArrayList<>();
        }
        
        return newsList;
    }
    
    /**
     * 쿼리에서 카테고리 추출
     */
    private String getCategoryFromQuery(String query) {
        if (query.contains("정책") || query.contains("규제")) {
            return "정책";
        } else if (query.contains("시장") || query.contains("가격")) {
            return "시장동향";
        } else if (query.contains("대출") || query.contains("금융")) {
            return "금융";
        } else {
            return "일반";
        }
    }
    
    /**
     * 발행일 파싱
     */
    private LocalDateTime parsePublishedAt(String publishedAt) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
            return LocalDateTime.parse(publishedAt, formatter);
        } catch (Exception e) {
            log.warn("발행일 파싱 실패: {}, 현재 시간 사용", publishedAt);
            return LocalDateTime.now();
        }
    }
} 