import React, { useState, useEffect } from "react";
import "./ListComponent.css";

const ListComponent = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categorizedNews, setCategorizedNews] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const [newsPerPage] = useState(25);
  const [sidebarNewsPerPage] = useState(10);
  const [keywords, setKeywords] = useState([]);

  // 챗봇 창 열기 함수
  const openChatbot = () => {
    window.open(
      "/chatbot?source=news",
      "chatbot",
      "width=500,height=750,scrollbars=yes,resizable=yes"
    );
  };

  // NewsAPI 설정
  // 🔑 API 키를 교체하려면 아래 값을 변경하세요
  // 새로운 API 키: https://newsapi.org/ 에서 발급 가능
  // 용석:393ff5f4f62b43fab38e2d70d464cb53
  // 상원:58bf16072f27453ba0f997d9550e7b22
  const API_KEY = "393ff5f4f62b43fab38e2d70d464cb53"; // 현재 API 키 (한도 초과 시 교체 필요)
  const NEWS_API_URL = "https://newsapi.org/v2/everything";

  // 5개 쿼리 정의
  const queries = [
    {
      name: "아파트",
      query: "아파트 OR 아파트단지 OR 아파트건설 OR 아파트매매 OR 아파트분양",
      category: "아파트",
    },
    {
      name: "오피스텔",
      query: "오피스텔 OR 원룸 OR 투룸 OR 원투룸",
      category: "오피스텔",
    },
    {
      name: "다가구",
      query: "다가구 OR 연립주택 OR 빌라 OR 연립",
      category: "다가구",
    },
    {
      name: "단독주택",
      query: "단독주택 OR 단독가구 OR 주택 OR 단독",
      category: "단독가구",
    },
    {
      name: "전세 월세",
      query: "전세 OR 월세 OR 임대 OR 보증금 OR 계약",
      category: "전세월세",
    },
  ];

  // API 요청 지연 함수
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // 뉴스 가져오기 함수
  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      // 로컬 스토리지에서 마지막 뉴스 수집 시간 확인
      const lastFetchTime = localStorage.getItem("lastNewsFetchTime");
      const currentTime = new Date().getTime();
      const oneDayInMs = 24 * 60 * 60 * 1000; // 24시간

      // 24시간 내에 이미 뉴스를 가져왔다면 저장된 뉴스 사용
      if (lastFetchTime && currentTime - parseInt(lastFetchTime) < oneDayInMs) {
        const savedNews = localStorage.getItem("savedNews");
        const savedCategorizedNews = localStorage.getItem(
          "savedCategorizedNews"
        );
        const savedKeywords = localStorage.getItem("savedKeywords");

        if (savedNews && savedCategorizedNews && savedKeywords) {
          console.log("저장된 뉴스를 사용합니다. (24시간 내 재사용)");
          setNews(JSON.parse(savedNews));
          setCategorizedNews(JSON.parse(savedCategorizedNews));
          setKeywords(JSON.parse(savedKeywords));
          setLoading(false);
          return;
        }
      }

      // 24시간이 지났거나 저장된 뉴스가 없으면 새로 가져오기
      console.log("새로운 뉴스를 가져옵니다...");

      const allArticles = [];

      // API 호출 횟수를 더욱 줄이기 위해 카테고리별로 선택적 수집
      const priorityQueries = [
        { name: "아파트", query: "아파트 OR 아파트단지", category: "아파트" },
        { name: "오피스텔", query: "오피스텔 OR 원룸", category: "오피스텔" },
        { name: "다가구", query: "다가구 OR 연립주택", category: "다가구" },
        { name: "단독주택", query: "단독주택 OR 주택", category: "단독가구" },
        { name: "전세 월세", query: "전세 OR 월세", category: "전세월세" },
      ];

      for (const queryItem of priorityQueries) {
        console.log(`${queryItem.name} 쿼리 시작: ${queryItem.query}`);

        try {
          // 모든 카테고리를 1페이지만, 페이지당 8개로 최소화
          const pageSize = 8;

          const queryUrl = `${NEWS_API_URL}?q=${encodeURIComponent(
            queryItem.query
          )}&language=ko&sortBy=publishedAt&pageSize=${pageSize}&page=1&apiKey=${API_KEY}`;
          console.log(`${queryItem.name} 쿼리 요청: ${queryUrl}`);

          const response = await fetch(queryUrl, {
            headers: { "X-API-Key": API_KEY },
          });

          console.log(`${queryItem.name} 응답 상태: ${response.status}`);

          if (response.status === 429) {
            console.log(
              `▶${queryItem.name} 429 에러: API 요청 한도를 초과했습니다. 저장된 뉴스가 있다면 사용합니다.`
            );

            // 저장된 뉴스가 있는지 확인
            const savedNews = localStorage.getItem("savedNews");
            if (savedNews) {
              console.log("저장된 뉴스를 사용합니다.");
              const parsedNews = JSON.parse(savedNews);
              setNews(parsedNews);

              const savedCategorizedNews = localStorage.getItem(
                "savedCategorizedNews"
              );
              const savedKeywords = localStorage.getItem("savedKeywords");

              if (savedCategorizedNews)
                setCategorizedNews(JSON.parse(savedCategorizedNews));
              if (savedKeywords) setKeywords(JSON.parse(savedKeywords));

              setLoading(false);
              return;
            } else {
              throw new Error(
                "API 요청 한도를 초과했습니다. 24시간 후에 다시 시도해주세요."
              );
            }
          }

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.articles && data.articles.length > 0) {
            const articlesWithCategory = data.articles.map((article) => ({
              ...article,
              category: queryItem.category,
            }));
            allArticles.push(...articlesWithCategory);
            console.log(
              `${queryItem.name} 수집된 뉴스: ${articlesWithCategory.length}개`
            );
          }

          // 카테고리 간 요청 간격 조정 (15초 대기로 증가)
          if (priorityQueries.indexOf(queryItem) < priorityQueries.length - 1) {
            console.log(
              `${queryItem.name} 완료. 다음 카테고리까지 15초 대기...`
            );
            await delay(15000);
          }
        } catch (pageError) {
          console.log(`▶${queryItem.name} 오류: ${pageError.message}`);
          // 개별 카테고리 오류 시에도 계속 진행
          continue;
        }
      }

      // 중복 제거
      const uniqueArticles = allArticles.filter(
        (article, index, self) =>
          index === self.findIndex((a) => a.url === article.url)
      );

      console.log(`현재 총 뉴스 개수: ${uniqueArticles.length}`);

      if (uniqueArticles.length === 0) {
        throw new Error("표시할 뉴스가 없습니다.");
      }

      setNews(uniqueArticles);

      // 카테고리별로 뉴스 분류
      const categorized = {};
      uniqueArticles.forEach((article) => {
        if (!categorized[article.category]) {
          categorized[article.category] = [];
        }
        categorized[article.category].push(article);
      });
      setCategorizedNews(categorized);

      // 키워드 추출
      const extractedKeywords = extractKeywords(uniqueArticles);
      setKeywords(extractedKeywords);

      // 성공적으로 뉴스를 가져왔다면 로컬 스토리지에 저장
      localStorage.setItem("lastNewsFetchTime", currentTime.toString());
      localStorage.setItem("savedNews", JSON.stringify(uniqueArticles));
      localStorage.setItem("savedCategorizedNews", JSON.stringify(categorized));
      localStorage.setItem("savedKeywords", JSON.stringify(extractedKeywords));

      console.log("뉴스가 로컬 스토리지에 저장되었습니다.");
    } catch (error) {
      console.log(`▶ 뉴스 가져오기 오류: ${error.message}`);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 키워드 추출 함수
  const extractKeywords = (newsData) => {
    if (!newsData || newsData.length === 0) return [];

    const wordCount = {};
    const stopWords = new Set([
      "이",
      "그",
      "저",
      "것",
      "수",
      "등",
      "때",
      "곳",
      "말",
      "일",
      "년",
      "월",
      "일",
      "시",
      "분",
      "에서",
      "으로",
      "에게",
      "와",
      "과",
      "의",
      "가",
      "을",
      "를",
      "이",
      "가",
      "도",
      "는",
      "을",
      "를",
      "에",
      "로",
      "으로",
      "부터",
      "까지",
      "보다",
      "같이",
      "처럼",
      "만큼",
      "만",
      "도",
      "는",
      "도",
      "있다",
      "없다",
      "하다",
      "되다",
      "위하다",
      "위한",
      "위해서",
      "위해",
      "있는",
      "없는",
      "하는",
      "되는",
      "밝혔다",
      "밝혔습니다",
      "밝혔고",
      "밝혔으며",
      "밝혔는데",
      "밝혔지만",
      "밝혔거나",
      "밝혔든지",
      "밝혔든가",
      "올해",
      "작년",
      "내년",
      "오늘",
      "어제",
      "내일",
      "이번",
      "저번",
      "다음",
      "이전",
      "이후",
      "전",
      "후",
      "중",
      "간",
      "동안",
      "사이",
      "전후",
      "전중",
      "중후",
      "지난",
      "최근",
      "현재",
      "지금",
      "이번",
      "저번",
      "다음",
      "이전",
      "이후",
      "전",
      "후",
      "중",
      "간",
      "동안",
      "사이",
      "전후",
      "전중",
      "중후",
      "매년",
      "매월",
      "매일",
      "매주",
      "지난해",
      "작년",
      "내년",
      "올해",
      "이번해",
      "저번해",
      "다음해",
      "이전해",
      "이후해",
      "전해",
      "후해",
      "중해",
      "간해",
      "동안해",
      "사이해",
      "전후해",
      "전중해",
      "중후해",
      "많다",
      "적다",
      "크다",
      "작다",
      "높다",
      "낮다",
      "빠르다",
      "느리다",
      "좋다",
      "나쁘다",
      "같다",
      "다르다",
      "같은",
      "다른",
      "그리고",
      "또는",
      "하지만",
      "그런데",
      "그러나",
      "그래서",
      "그러면",
      "그렇다면",
      "그런",
      "그런가",
      "그런지",
      "이런",
      "저런",
      "어떤",
      "무슨",
      "어느",
      "몇",
      "얼마",
      "언제",
      "어디",
      "누가",
      "무엇",
      "어떻게",
      "왜",
      "어째서",
      "모든",
      "전체",
      "관련",
      "대해",
      "통해",
      "따라",
      "따른",
      "따라서",
      "통해",
      "통한",
      "통해서",
      "대해",
      "대한",
      "대해서",
      "것으로",
      "것을",
      "것이",
      "것은",
      "것도",
      "것만",
      "것까지",
      "것부터",
      "것보다",
      "것처럼",
      "것같이",
      "것만큼",
      "것만",
      "것도",
      "것은",
      "것이",
      "것을",
      "것의",
      "것과",
      "것와",
      "것에서",
      "것으로",
      "것에게",
      "것부터",
      "것까지",
      "것보다",
      "것같이",
      "것처럼",
      "것만큼",
      "것만",
      "것도",
      "것은",
      "것이",
      "것을",
      "것의",
      "것과",
      "것와",
      "어린이",
      "초등학교",
      "학교",
      "학생",
      "교사",
      "교육",
      "학습",
      "수업",
      "교실",
      "교과서",
      "교재",
      "교구",
      "교복",
      "교가",
      "교훈",
      "교칙",
      "교장",
      "교감",
      "교무",
      "교직원",
      "가족",
      "부모",
      "아버지",
      "어머니",
      "형제",
      "자매",
      "할아버지",
      "할머니",
      "아들",
      "딸",
      "손자",
      "손녀",
      "사촌",
      "친척",
      "친구",
      "이웃",
      "동네",
      "마을",
      "지역",
      "구역",
      "보고",
      "알고",
      "생각하고",
      "느끼고",
      "바라고",
      "희망하고",
      "기대하고",
      "걱정하고",
      "연합뉴스",
      "뉴스",
      "기사",
      "보도",
      "발표",
      "공개",
      "발표했다",
      "공개했다",
      "보도했다",
      "발표했습니다",
      "공개했습니다",
      "보도했습니다",
      "자료사진",
      "사진",
      "이미지",
      "그림",
      "도면",
      "차트",
      "그래프",
      "표",
      "목록",
      "리스트",
      "메뉴",
      "버튼",
      "링크",
      "파일",
      "폴더",
      "있었다",
      "없었다",
      "했다",
      "되었다",
      "위했다",
      "위한",
      "위해서",
      "위해",
      "따르면",
      "따른다",
      "따르고",
      "따르며",
      "따르는데",
      "따르지만",
      "따르거나",
      "따르든지",
      "따르든가",
      "열리고",
      "열린다",
      "열리고",
      "열리며",
      "열리는데",
      "열리지만",
      "열리거나",
      "열리든지",
      "열리든가",
      "붙어있다",
      "붙어있다가",
      "붙어있다고",
      "붙어있다며",
      "붙어있다면",
      "붙어있다거나",
      "붙어있다든지",
      "붙어있다든가",
      "있다",
      "있다가",
      "있다고",
      "있다며",
      "있다면",
      "있다거나",
      "있다든지",
      "있다든가",
      "있다는",
      "있다니",
      "있다고요",
      "있다며요",
      "있다면요",
      "있다거나요",
      "있다든지요",
      "있다든가요",
      "없다",
      "없다가",
      "없다고",
      "없다며",
      "없다면",
      "없다거나",
      "없다든지",
      "없다든가",
      "없다는",
      "없다니",
      "없다고요",
      "없다며요",
      "없다면요",
      "없다거나요",
      "없다든지요",
      "없다든가요",
      "하다",
      "하다가",
      "한다고",
      "한다며",
      "한다면",
      "한다거나",
      "한다든지",
      "한다든가",
      "한다는",
      "한다니",
      "한다고요",
      "한다며요",
      "한다면요",
      "한다거나요",
      "한다든지요",
      "한다든가요",
      "되다",
      "되다가",
      "된다고",
      "된다며",
      "된다면",
      "된다거나",
      "된다든지",
      "된다든가",
      "된다는",
      "된다니",
      "된다고요",
      "된다며요",
      "된다면요",
      "된다거나요",
      "된다든지요",
      "된다든가요",
      "위하다",
      "위하다가",
      "위한다고",
      "위한다며",
      "위한다면",
      "위한다거나",
      "위한다든지",
      "위한다든가",
      "위한다는",
      "위한다니",
      "위한다고요",
      "위한다며요",
      "위한다면요",
      "위한다거나요",
      "위한다든지요",
      "위한다든가요",
      "위한",
      "위해서",
      "위해",
      "있는",
      "없는",
      "하는",
      "되는",
      "위하는",
      "밝혔다",
      "밝혔습니다",
      "밝혔고",
      "밝혔으며",
      "밝혔는데",
      "밝혔지만",
      "밝혔거나",
      "밝혔든지",
      "밝혔든가",
      "알려졌다",
      "밝혀졌다",
      "확인됐다",
      "발견됐다",
      "발견했다",
      "발견했습니다",
      "발견됐습니다",
      "보고됐다",
      "보고했다",
      "보고했습니다",
      "보고됐습니다",
      "열리고",
      "열린다",
      "열리고",
      "열리며",
      "열리는데",
      "열리지만",
      "열리거나",
      "열리든지",
      "열리든가",
      "지난",
      "최근",
      "현재",
      "지금",
      "이번",
      "저번",
      "다음",
      "이전",
      "이후",
      "전",
      "후",
      "중",
      "간",
      "동안",
      "사이",
      "전후",
      "전중",
      "중후",
      "매년",
      "매월",
      "매일",
      "매주",
      "여름",
      "겨울",
      "봄",
      "가을",
      "방학",
      "휴가",
      "휴식",
      "여행",
      "출장",
      "외출",
      "외박",
      "숙박",
      "숙식",
      "식사",
      "점심",
      "저녁",
      "아침",
      "새벽",
      "밤",
      "낮",
    ]);

    // 뉴스 제목과 설명에서 단어 추출
    newsData.forEach((article) => {
      const text = `${article.title || ""} ${article.description || ""}`;

      // 한글과 영문 단어 추출
      const koreanWords = text.match(/[가-힣]+/g) || [];
      const englishWords = text.toLowerCase().match(/\b[a-z]+\b/g) || [];

      [...koreanWords, ...englishWords].forEach((word) => {
        // 불용어 제거 및 의미있는 단어만 선택
        if (
          word.length > 1 &&
          !stopWords.has(word) &&
          !stopWords.has(word.toLowerCase()) &&
          !/^\d+$/.test(word) &&
          !/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(word) &&
          word.length >= 4 &&
          /[가-힣]/.test(word) &&
          !/^[가-힣]+(으로|을|이|은|도|만|까지|부터|보다|같이|처럼|만큼)$/.test(
            word
          ) &&
          !/^[가-힣]+(하고|하며|이고|이거나|이지만|이므로|이어서|이어도|이어야|이어라)$/.test(
            word
          ) &&
          !/^[가-힣]+(이다|입니다|이었다|였습니다|이었다가|였습니다가)$/.test(
            word
          ) &&
          !/^[가-힣]+(었다|습니다|었다가|습니다가|었다고|습니다고|었다며|습니다며)$/.test(
            word
          ) &&
          !/^[가-힣]+(고|며|거나|지만|므로|어서|어도|어야|어라|어요|어서요|어도요|어야요|어라요)$/.test(
            word
          ) &&
          !/^[가-힣]+(있다|없다|하다|되다|위하다|위한|위해서|위해)$/.test(
            word
          ) &&
          !/^[가-힣]+(있다가|없다가|하다가|되다가|위하다가)$/.test(word) &&
          !/^[가-힣]+(있다고|없다고|한다고|된다고|위한다고)$/.test(word) &&
          !/^[가-힣]+(있다며|없다며|한다며|된다며|위한다며)$/.test(word) &&
          !/^[가-힣]+(있다면|없다면|한다면|된다면|위한다면)$/.test(word) &&
          !/^[가-힣]+(있다거나|없다거나|한다거나|된다거나|위한다거나)$/.test(
            word
          ) &&
          !/^[가-힣]+(있다든지|없다든지|한다든지|된다든지|위한다든지)$/.test(
            word
          ) &&
          !/^[가-힣]+(있다든가|없다든가|한다든가|된다든가|위한다든가)$/.test(
            word
          ) &&
          !/^[가-힣]+(있다는|없다는|한다는|된다는|위한다는)$/.test(word) &&
          !/^[가-힣]+(있다니|없다니|한다니|된다니|위한다니)$/.test(word) &&
          !/^[가-힣]+(있다고요|없다고요|한다고요|된다고요|위한다고요)$/.test(
            word
          ) &&
          !/^[가-힣]+(있다며요|없다며요|한다며요|된다며요|위한다며요)$/.test(
            word
          ) &&
          !/^[가-힣]+(있다면요|없다면요|한다면요|된다면요|위한다면요)$/.test(
            word
          ) &&
          !/^[가-힣]+(있다거나요|없다거나요|한다거나요|된다거나요|위한다거나요)$/.test(
            word
          ) &&
          !/^[가-힣]+(있다든지요|없다든지요|한다든지요|된다든지요|위한다든지요)$/.test(
            word
          ) &&
          !/^[가-힣]+(있다든가요|없다든가요|한다든가요|된다든가요|위한다든가요)$/.test(
            word
          ) &&
          !/^[가-힣]+(어있다|어있다가|어있다고|어있다며|어있다면|어있다거나|어있다든지|어있다든가)$/.test(
            word
          ) &&
          !/^[가-힣]+(어있다는|어있다니|어있다고요|어있다며요|어있다면요|어있다거나요|어있다든지요|어있다든가요)$/.test(
            word
          ) &&
          !/^[가-힣]+(고있다|고있다가|고있다고|고있다며|고있다면|고있다거나|고있다든지|고있다든가)$/.test(
            word
          ) &&
          !/^[가-힣]+(고있다는|고있다니|고있다고요|고있다며요|고있다면요|고있다거나요|고있다든지요|고있다든가요)$/.test(
            word
          ) &&
          !/^[가-힣]+(며있다|며있다가|며있다고|며있다며|며있다면|며있다거나|며있다든지|며있다든가)$/.test(
            word
          ) &&
          !/^[가-힣]+(며있다는|며있다니|며있다고요|며있다며요|며있다면요|며있다거나요|며있다든지요|며있다든가요)$/.test(
            word
          ) &&
          !/^(이|그|저|어떤|무슨|어느|몇|얼마|언제|어디|누가|무엇|어떻게|왜|어째서)[가-힣]*$/.test(
            word
          ) &&
          !/^[가-힣]*(이|가|을|를|은|는|도|만|까지|부터|보다|같이|처럼|만큼)$/.test(
            word
          ) &&
          !/^(연합|뉴스|기사|보도|발표|공개|자료|사진|이미지|그림|도면|차트|그래프|표|목록|리스트|메뉴|버튼|링크|파일|폴더)/.test(
            word
          ) &&
          !/^(지난|최근|현재|지금|이번|저번|다음|이전|이후|전|후|중|간|동안|사이|전후|전중|중후|매년|매월|매일|매주)/.test(
            word
          ) &&
          !/^(여름|겨울|봄|가을|방학|휴가|휴식|여행|출장|외출|외박|숙박|숙식|식사|점심|저녁|아침|새벽|밤|낮)/.test(
            word
          )
        ) {
          wordCount[word] = (wordCount[word] || 0) + 1;
        }
      });
    });

    // 빈도수 순으로 정렬하고 TOP10 선택
    const sortedKeywords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word, count], index) => {
        let change, changeValue;

        if (index === 0) {
          change = "up";
          changeValue = Math.floor(count * 0.25) + 1;
        } else if (index <= 2) {
          change = Math.random() > 0.15 ? "up" : "down";
          changeValue = Math.floor(count * 0.2) + 1;
        } else if (index <= 4) {
          change = Math.random() > 0.5 ? "up" : "down";
          changeValue = Math.floor(count * 0.15) + 1;
        } else if (index <= 6) {
          change = Math.random() > 0.25 ? "down" : "up";
          changeValue = Math.floor(count * 0.12) + 1;
        } else {
          change = Math.random() > 0.2 ? "down" : "up";
          changeValue = Math.floor(count * 0.08) + 1;
        }

        changeValue = Math.min(changeValue, Math.floor(count * 0.4));
        changeValue = Math.max(changeValue, 1);

        return {
          rank: index + 1,
          word,
          count,
          change,
          changeValue,
        };
      });

    return sortedKeywords;
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "날짜 없음";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getDisplayNews = () => {
    if (selectedCategory === "전체") {
      return news;
    }
    return categorizedNews[selectedCategory] || [];
  };

  // 페이징 처리를 위한 함수들
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = getDisplayNews().slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(getDisplayNews().length / newsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // 페이지 상단으로 스크롤
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // 카테고리 변경 시 첫 페이지로
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>뉴스를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>오류가 발생했습니다</h3>
        <p>{error}</p>
        {error.includes("API 요청 한도를 초과") && (
          <div className="error-help">
            <p>
              💡 <strong>해결 방법:</strong>
            </p>
            <ul>
              <li>24시간 후에 자동으로 새로운 뉴스를 가져옵니다</li>
              <li>브라우저를 새로고침하면 저장된 뉴스를 볼 수 있습니다</li>
              <li>NewsAPI의 무료 계정은 시간당 100회 요청으로 제한됩니다</li>
              <li>
                로컬 스토리지에 저장된 뉴스를 활용하여 API 호출을 최소화합니다
              </li>
            </ul>
          </div>
        )}
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="no-news">
        <p>표시할 뉴스가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="news-container">
        {/* 챗봇 버튼 - 최상단 오른쪽 */}
        <div className="chatbot-top">
          <button
            className="chatbot-button"
            onClick={openChatbot}
            title="챗봇이 현재 뉴스를 수집하고 있습니다. 클릭하여 챗봇과 대화하세요!"
          >
            <img src="/chatbot.png" alt="챗봇" className="chatbot-icon" />
            <span className="chatbot-text">뉴스 챗봇</span>
          </button>
        </div>

        {/* 신문 마스트헤드 */}
        <div className="newspaper-masthead">
          <h1>부동산 뉴스</h1>
          <div className="masthead-info"></div>
        </div>

        {/* 카테고리 선택 탭 */}
        <div className="category-tabs">
          <button
            className={`category-tab ${
              selectedCategory === "전체" ? "active" : ""
            }`}
            onClick={() => handleCategoryChange("전체")}
          >
            전체 ({news.length})
          </button>
          {Object.keys(categorizedNews).map((category) => (
            <button
              key={category}
              className={`category-tab ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => handleCategoryChange(category)}
            >
              {category} ({categorizedNews[category]?.length || 0})
            </button>
          ))}
        </div>

        {/* 날짜 정보 - 리스트 위 보더 바로 위 왼쪽 */}
        <div className="date-header">
          <span className="date-info">{formatDate(new Date())}</span>
        </div>

        {/* 신문 본문 - 메인 기사와 사이드바 레이아웃 */}
        <div className="newspaper-body">
          {/* 왼쪽 메인 영역 */}
          <div className="main-section">
            {/* 메인 헤드라인 기사 - 2열 레이아웃 */}
            {currentNews.length > 0 && (
              <div className="main-headline">
                <div className="headline-layout">
                  {/* 왼쪽 메인 기사 */}
                  <div className="main-article">
                    <h2 className="main-title">
                      <a
                        href={currentNews[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {currentNews[0].title}
                      </a>
                    </h2>

                    <p className="main-lead">
                      {currentNews[0].description
                        ? currentNews[0].description.length > 150
                          ? currentNews[0].description.substring(0, 150) + "..."
                          : currentNews[0].description
                        : "메인 기사 설명이 없습니다."}
                    </p>

                    {/* 메인 이미지 */}
                    <div className="main-image">
                      {currentNews[0].urlToImage ? (
                        <img
                          src={currentNews[0].urlToImage}
                          alt={currentNews[0].title}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "block";
                          }}
                        />
                      ) : null}
                      <div
                        className="no-image-placeholder"
                        style={{
                          display: currentNews[0].urlToImage ? "none" : "block",
                        }}
                      >
                        🏠
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽 두 번째 기사 */}
                  {currentNews.length > 1 && (
                    <div className="second-article">
                      <h3 className="second-title">
                        <a
                          href={currentNews[1].url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {currentNews[1].title}
                        </a>
                      </h3>

                      <p className="second-lead">
                        {currentNews[1].description
                          ? currentNews[1].description.length > 120
                            ? currentNews[1].description.substring(0, 120) +
                              "..."
                            : currentNews[1].description
                          : "두 번째 기사 설명이 없습니다."}
                      </p>

                      {/* 두 번째 기사 이미지 */}
                      <div className="second-image">
                        {currentNews[1].urlToImage ? (
                          <img
                            src={currentNews[1].urlToImage}
                            alt={currentNews[1].title}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "block";
                            }}
                          />
                        ) : null}
                        <div
                          className="no-image-placeholder"
                          style={{
                            display: currentNews[1].urlToImage
                              ? "none"
                              : "block",
                          }}
                        >
                          🏠
                        </div>
                      </div>

                      <div className="second-source">
                        {currentNews[1].source?.name || "출처 없음"} |
                        {currentNews[1].publishedAt
                          ? formatDate(currentNews[1].publishedAt)
                          : "날짜 없음"}
                      </div>
                    </div>
                  )}
                </div>

                {/* 메인 기사 출처/날짜 */}
                <div className="main-source">
                  {currentNews[0].source?.name || "출처 없음"} |
                  {currentNews[0].publishedAt
                    ? formatDate(currentNews[0].publishedAt)
                    : "날짜 없음"}
                </div>
              </div>
            )}

            {/* 왼쪽 열 추가 기사들 */}
            <div className="left-column-articles">
              {currentNews.slice(2, 8).map((article, index) => (
                <div key={index + 2} className="side-article">
                  <h3 className="side-title">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {article.title}
                    </a>
                  </h3>
                  <p className="side-excerpt">
                    {article.description
                      ? article.description.length > 80
                        ? article.description.substring(0, 80) + "..."
                        : article.description
                      : "기사 설명이 없습니다."}
                  </p>
                  <div className="side-meta">
                    {article.source?.name || "출처 없음"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 오른쪽 사이드바 영역 - 제한된 기사 수만 표시 */}
          <div className="right-sidebar">
            {currentNews
              .slice(8, 8 + sidebarNewsPerPage) // 8번째부터 23번째까지 (15개 기사)
              .map((article, index) => (
                <div key={index + 8} className="sidebar-article">
                  <h4 className="sidebar-title">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {article.title}
                    </a>
                  </h4>
                  <p className="sidebar-excerpt">
                    {article.description
                      ? article.description.length > 50
                        ? article.description.substring(0, 50) + "..."
                        : article.description
                      : "기사 설명이 없습니다."}
                  </p>
                  <div className="sidebar-meta">
                    {article.source?.name || "출처 없음"}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 페이징 네비게이션 */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              이전
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter((pageNum) => {
                // 현재 페이지 주변 5페이지만 표시
                return (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  Math.abs(pageNum - currentPage) <= 2
                );
              })
              .map((pageNum, index, array) => {
                // 건너뛴 페이지 표시
                if (index > 0 && pageNum - array[index - 1] > 1) {
                  return (
                    <span
                      key={`ellipsis-${pageNum}`}
                      className="pagination-ellipsis"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${
                      pageNum === currentPage ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              다음
            </button>
          </div>
        )}
      </div>

      <div className="sidebar-container">
        {/* 트렌딩 키워드 컴포넌트 */}
        <div className="trending-container">
          <div className="trending-header">
            <h2>🔥 실시간 검색어 순위</h2>
            <div className="trending-time">
              {new Date().toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              기준
            </div>
          </div>

          <div className="trending-list">
            {keywords.map((keyword) => (
              <div key={keyword.rank} className="trending-item">
                <div className="rank-section">
                  <span className="rank-number">
                    {keyword.rank === 1
                      ? "🥇"
                      : keyword.rank === 2
                      ? "🥈"
                      : keyword.rank === 3
                      ? "🥉"
                      : keyword.rank}
                  </span>
                </div>

                <div className="keyword-section">
                  <span className="keyword-text">{keyword.word}</span>
                  <span className="keyword-count">({keyword.count}회)</span>
                </div>

                <div className="change-section">
                  <img
                    src={
                      keyword.change === "up" ? "/arrow.png" : "/arrow(1).png"
                    }
                    alt={keyword.change === "up" ? "순위 상승" : "순위 하락"}
                    className="change-icon"
                    style={{
                      width: "16px",
                      height: "16px",
                    }}
                  />
                  <span
                    className="change-value"
                    style={{
                      color: keyword.change === "up" ? "#2ed573" : "#ff4757",
                    }}
                  >
                    {keyword.changeValue}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="trending-footer">
            <span className="update-info">실시간 업데이트</span>
            <span className="refresh-time">1분마다 갱신</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListComponent;
