import React, { useState, useEffect, useRef } from "react";
import { useCustomLogin } from "../hooks/useCustomLogin";
import { useCustomMove } from "../hooks/useCustomMove";
import { useLocation } from "../hooks/useLocation";
import { useMember } from "../hooks/useMember";
import { useModal } from "../hooks/useModal";
import { API_SERVER_HOST } from "../api/backendApi";
import {
  callTextChatbot,
  callVoiceChatbot,
  callRealtimeSpeech,
  checkFlaskServerDirectly,
  checkGoogleApiStatus,
  checkOpenAIApiStatus,
} from "../api/flaskVoiceApi";
import { getParsedCookie } from "../util/cookieUtil";
import "./ChatBot.css";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [currentMicrophone, setCurrentMicrophone] = useState("");
  const [availableMicrophones, setAvailableMicrophones] = useState([]);

  // 실시간 음성 인식 관련 상태
  const [isRealtimeListening, setIsRealtimeListening] = useState(false);
  const [realtimeTranscript, setRealtimeTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  // 자동 스크롤을 위한 ref
  const messagesEndRef = useRef(null);

  // 한국어 숫자를 아라비아 숫자로 변환하는 함수
  const convertKoreanNumber = (text) => {
    const koreanNumbers = {
      하나: "1",
      한개: "1",
      한: "1",
      둘: "2",
      두개: "2",
      두: "2",
      셋: "3",
      세개: "3",
      세: "3",
      넷: "4",
      네개: "4",
      네: "4",
      다섯: "5",
      다섯개: "5",
      여섯: "6",
      여섯개: "6",
      일곱: "7",
      일곱개: "7",
      여덟: "8",
      여덟개: "8",
      아홉: "9",
      아홉개: "9",
      열: "10",
      열개: "10",
    };

    let convertedText = text;
    Object.entries(koreanNumbers).forEach(([korean, number]) => {
      convertedText = convertedText.replace(new RegExp(korean, "g"), number);
    });

    return convertedText;
  };

  // 음성 명령어 파싱 함수
  const parseVoiceCommand = (transcript) => {
    // 한국어 숫자 변환 후 소문자 변환
    const convertedTranscript = convertKoreanNumber(transcript);
    const lowerTranscript = convertedTranscript.toLowerCase();

    console.log("🎤 원본 음성:", transcript);
    console.log("🔄 변환된 텍스트:", convertedTranscript);

    // 다양한 패턴으로 방 개수와 화장실 개수 매칭
    const roomPatterns = [
      /방\s*(\d+)\s*개/,
      /(\d+)\s*개\s*방/,
      /방\s*(\d+)/,
      /(\d+)\s*방/,
      /방조개/, // "방조개" → 방 1개
      /방\s*하나/,
      /방\s*한개/,
      /방\s*한/,
      /방\s*두\s*개/, // "방 두 개" → 방 2개
      /방\s*둘/, // "방 둘" → 방 2개
    ];

    const bathroomPatterns = [
      /화장실\s*(\d+)\s*개/,
      /(\d+)\s*개\s*화장실/,
      /화장실\s*(\d+)/,
      /(\d+)\s*화장실/,
      /욕실\s*(\d+)\s*개/,
      /(\d+)\s*개\s*욕실/,
      /화장실\s*하나/,
      /화장실\s*한개/,
      /화장실\s*한/,
      /화장실\s*둘/, // "화장실 둘" → 화장실 2개
      /화장실\s*1/, // "화장실 1" → 화장실 1개
      /화장실\s*2/, // "화장실 2" → 화장실 2개
    ];

    let rooms = null;
    let bathrooms = null;

    // 방 개수 찾기
    for (const pattern of roomPatterns) {
      const match = lowerTranscript.match(pattern);
      if (match) {
        console.log(
          "🎤 방 패턴 매칭 성공:",
          pattern.toString(),
          "매치:",
          match
        );

        // 특수 패턴 처리
        if (pattern.toString().includes("방조개")) {
          rooms = 1; // "방조개" → 방 1개
          console.log("🎤 방조개 패턴 감지 → 방 1개");
        } else if (
          pattern.toString().includes("하나") ||
          pattern.toString().includes("한개") ||
          pattern.toString().includes("한")
        ) {
          rooms = 1; // "하나", "한개", "한" → 1
          console.log("🎤 하나/한개/한 패턴 감지 → 방 1개");
        } else if (
          pattern.toString().includes("두") ||
          pattern.toString().includes("둘")
        ) {
          rooms = 2; // "두", "둘" → 2
          console.log("🎤 두/둘 패턴 감지 → 방 2개");
        } else {
          rooms = parseInt(match[1]);
          console.log("🎤 숫자 패턴 감지 → 방", rooms, "개");
        }
        break;
      }
    }

    // 화장실 개수 찾기
    for (const pattern of bathroomPatterns) {
      const match = lowerTranscript.match(pattern);
      if (match) {
        console.log(
          "🎤 화장실 패턴 매칭 성공:",
          pattern.toString(),
          "매치:",
          match
        );

        // 특수 패턴 처리
        if (
          pattern.toString().includes("하나") ||
          pattern.toString().includes("한개") ||
          pattern.toString().includes("한")
        ) {
          bathrooms = 1; // "하나", "한개", "한" → 1
          console.log("🎤 하나/한개/한 패턴 감지 → 화장실 1개");
        } else if (pattern.toString().includes("둘")) {
          bathrooms = 2; // "둘" → 2
          console.log("🎤 둘 패턴 감지 → 화장실 2개");
        } else {
          bathrooms = parseInt(match[1]);
          console.log("🎤 숫자 패턴 감지 → 화장실", bathrooms, "개");
        }
        break;
      }
    }

    console.log("🎤 파싱 결과 - 방:", rooms, "화장실:", bathrooms);

    if (rooms && bathrooms) {
      console.log("🎤 완전한 매물 검색 명령:", { rooms, bathrooms });
      return {
        type: "property_search",
        rooms: rooms,
        bathrooms: bathrooms,
      };
    } else if (rooms) {
      // 방 개수만 있는 경우 (화장실은 기본값 1)
      console.log("🎤 방 개수만 파싱됨, 화장실 기본값 1:", {
        rooms,
        bathrooms: 1,
      });
      return {
        type: "property_search",
        rooms: rooms,
        bathrooms: 1,
      };
    } else if (bathrooms) {
      // 화장실 개수만 있는 경우 (방은 기본값 1)
      console.log("🎤 화장실 개수만 파싱됨, 방 기본값 1:", {
        rooms: 1,
        bathrooms,
      });
      return {
        type: "property_search",
        rooms: 1,
        bathrooms: bathrooms,
      };
    }

    // 다른 명령어들도 추가 가능
    return {
      type: "general",
      content: transcript,
    };
  };

  const sendToMapPage = (command, properties = null) => {
    console.log("sendToMapPage 호출됨:", command);
    console.log("window.parent 존재 여부:", !!window.parent);
    console.log("window.parent === window:", window.parent === window);
    console.log("window.top 존재 여부:", !!window.top);
    console.log("window.opener 존재 여부:", !!window.opener);

    const message = {
      type: "NAVIGATE_TO_MAP_WITH_FILTER",
      searchParams: {
        rooms: command.rooms,
        bathrooms: command.bathrooms,
      },
      properties: properties || [],
      action: "apply_filter_and_show_properties",
      timestamp: Date.now(),
    };

    console.log("전송할 메시지:", message);

    let messageSent = false;

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage(message, "*");
        console.log("부모 창에 postMessage 전송 완료");
        messageSent = true;
      } catch (error) {
        console.error("부모 창에 메시지 전송 실패:", error);
      }
    }

    // 2차 시도: 최상위 창에 메시지 전송
    if (window.top && window.top !== window) {
      try {
        window.top.postMessage(message, "*");
        console.log("🗺️ 최상위 창에 postMessage 전송 완료");
        messageSent = true;
      } catch (error) {
        console.error("🗺️ 최상위 창에 메시지 전송 실패:", error);
      }
    }

    // 3차 시도: opener 창에 메시지 전송
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(message, "*");
        console.log("🗺️ opener 창에 postMessage 전송 완료");
        messageSent = true;
      } catch (error) {
        console.error("🗺️ opener 창에 메시지 전송 실패:", error);
      }
    }

    if (messageSent) {
      console.log("🗺️ 메시지 전송 성공 - 지도 페이지로 이동 중...");

      // 사용자에게 지도 페이지로 이동 중임을 알림
      setTranscript("🗺️ 지도 페이지로 이동 중... 필터가 자동으로 적용됩니다.");

      // 3초 후 자동으로 지도 페이지로 이동 시도 (백업 방법)
      setTimeout(() => {
        console.log("🗺️ 3초 후 자동으로 지도 페이지로 이동...");
        if (window.parent && window.parent !== window) {
          try {
            window.parent.postMessage(message, "*");
            console.log("🗺️ 재시도: 부모 창에 메시지 전송 완료");
          } catch (error) {
            console.error("🗺️ 재시도 실패:", error);
          }
        }
      }, 3000);
    } else {
      console.log("🗺️ 모든 창에 메시지 전송 실패 - 부모 창을 찾을 수 없음");
      setTranscript(
        "⚠️ 부모 창을 찾을 수 없어 지도 페이지로 이동할 수 없습니다."
      );
    }
  };

  // 필터 조건에 맞는 매물 검색 함수
  const searchPropertiesByFilter = async (command) => {
    try {
      console.log("🔍 필터 조건으로 매물 검색 시작:", command);

      // Flask API를 통해 해당 조건의 매물 검색
      const searchParams = new URLSearchParams();
      searchParams.set("roomCount", command.rooms);
      searchParams.set("bathroomCount", command.bathrooms);

      const response = await fetch(
        `http://127.0.0.1:5000/api/search-properties?${searchParams.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("🔍 매물 검색 결과:", data);

        // 디버깅: 실제 매물 데이터 로그
        if (data.properties && data.properties.length > 0) {
          console.log("🔍 첫 번째 매물 상세 데이터:", data.properties[0]);
          console.log("🔍 첫 번째 매물 가격 정보:", {
            price: data.properties[0].price,
            priceType: typeof data.properties[0].price,
            monthly_rent: data.properties[0].monthly_rent,
            monthly_rentType: typeof data.properties[0].monthly_rent,
          });
        }

        return data;
      } else {
        console.error("🔍 매물 검색 실패:", response.status);
        return null;
      }
    } catch (error) {
      console.error("🔍 매물 검색 중 오류:", error);
      return null;
    }
  };

  // 매물 정보 응답 생성 함수
  const generatePropertyResponse = (properties, searchCriteria) => {
    if (!properties || properties.length === 0) {
      return "조건에 맞는 매물을 찾지 못했습니다.";
    }

    let response = `"${searchCriteria.room_count}개 방, ${searchCriteria.bathroom_count}개 화장실" 조건에 맞는 매물 ${properties.length}개를 찾았습니다!\n\n`;

    properties.forEach((property, index) => {
      // 매물 이름 (title 사용)
      const propertyName = property.title || `매물 ${index + 1}`;

      // 주소 표시 (우선순위: road_address > detail_address > address)
      const displayAddress =
        property.road_address ||
        property.detail_address ||
        property.address ||
        "주소 정보 없음";

      response += `${index + 1}. **${propertyName}**\n`;
      response += `   📍 ${displayAddress}\n`;

      // 간단한 가격 표시 (복잡한 변환 없이)
      if (property.price && property.price > 0) {
        response += `   💰 매매 ${property.price}\n`;
      } else if (property.monthly_rent && property.monthly_rent > 0) {
        response += `   💰 월세 ${property.monthly_rent}\n`;
      } else {
        response += `   💰 가격 정보 확인 필요\n`;
      }

      // 면적 정보 (있는 경우)
      if (property.area) {
        response += `   📐 ${property.area}㎡\n`;
      }

      // 층수 정보 (있는 경우)
      if (property.floor) {
        response += `   🏢 ${property.floor}층\n`;
      }

      response += `\n`;
    });

    response += `🗺️ 지도 페이지에서 더 자세한 정보를 확인하세요!`;
    return response;
  };

  // 스크롤을 최하단으로 이동하는 함수
  const scrollToBottom = () => {
    const chatMessages = document.querySelector(".chat-messages");
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  };

  // 메시지가 변경될 때마다 자동 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 컴포넌트 마운트 시 마이크 목록 가져오기
  useEffect(() => {
    getAvailableMicrophones();

    // Flask 서버 상태 확인
    checkFlaskServerStatus();

    // URL 파라미터 확인하여 초기 인사말 설정
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get("source");

    let welcomeMessage;

    if (source === "news") {
      // 뉴스 페이지에서 열린 경우
      welcomeMessage = {
        type: "bot",
        content: `📰 **부동산 뉴스 챗봇에 오신 것을 환영합니다!** 📰

💡 **최근 부동산 관련 뉴스를 가져왔어요:**

🏘️ **아파트 시장 동향**: 최신 아파트 매매/분양 정보
🏢 **오피스텔/원룸**: 투자 및 거주 정보
🏠 **다가구/연립**: 다양한 주거 옵션
🏡 **단독주택**: 프리미엄 주거 정보
💰 **전세/월세**: 임대 시장 현황

이 뉴스들에 대해 궁금한 점이 있으시거나, 추가로 알고 싶은 부동산 정보가 있으시면 언제든지 물어보세요! 😊

💬 **"오늘의 뉴스"를 보내보세요!** 최신 부동산 뉴스를 챗봇에게 요청해보세요! 📰✨`,
        timestamp: new Date(),
      };
    } else {
      // 메인 페이지에서 열린 경우 (기존 인사말)
      welcomeMessage = {
        type: "bot",
        content: `🏠 **스윗홈 부동산 챗봇에 오신 것을 환영합니다!** 🏠

💡 **이 사이트만의 특별한 장점을 소개해드려요:**

🏘️ **부동산 정보**: 아파트, 오피스텔, 다가구 등 다양한 매물 정보
💰 **대출 상품**: 사용자의 신용점수, 소득, 자산을 고려한 맞춤형 대출 상품 추천
📊 **신용정보 분석**: 개인 신용상황에 맞는 최적의 부동산 투자 전략 제시
🎯 **맞춤형 상담**: 개인 상황에 맞는 부동산 및 대출 상담 서비스

💬 **방 2개, 화장실 1개 매물**이나 **사용자 자산으로 볼만한 매물**을 챗봇에게 물어보세요! 🏘️✨`,
        timestamp: new Date(),
      };
    }

    setMessages([welcomeMessage]);
  }, []);

  // Flask 서버 상태 확인
  const checkFlaskServerStatus = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/health");
      if (response.ok) {
        console.log("✅ Flask 서버가 실행 중입니다.");
      } else {
        console.log("⚠️ Flask 서버 응답이 이상합니다:", response.status);
      }
    } catch (error) {
      console.log("❌ Flask 서버에 연결할 수 없습니다:", error.message);
      console.log(
        "💡 Flask 서버를 시작하려면: cd pyt/src/pyt && python app.py"
      );
    }
  };

  // 사용자 정보 가져오기
  const getUserInfo = () => {
    const memberInfo = getParsedCookie("member");
    if (memberInfo && memberInfo.email) {
      return {
        email: memberInfo.email,
        name: memberInfo.name || "사용자",
        isLoggedIn: true,
      };
    }
    return { isLoggedIn: false };
  };

  // 사용자 상세 정보 가져오기 (member, member_credit, member_role)
  const getUserDetailedInfo = async () => {
    try {
      const memberInfo = getParsedCookie("member");
      console.log("🍪 쿠키에서 가져온 member 정보:", memberInfo);

      if (!memberInfo || !memberInfo.email) {
        console.log("❌ member 쿠키 정보 없음");
        return { isLoggedIn: false };
      }

      console.log("🔍 백엔드 API 호출 시작:", memberInfo.email);

      // 백엔드 API를 통해 사용자 상세 정보 가져오기
      const detailResponse = await fetch(
        `${API_SERVER_HOST}/api/member/credit-info?email=${memberInfo.email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      console.log(
        "📡 백엔드 응답 상태:",
        detailResponse.status,
        detailResponse.ok
      );

      if (detailResponse.ok) {
        const userData = await detailResponse.json();
        console.log("✅ 사용자 상세 정보 조회 성공:", userData);
        console.log("🔍 응답 데이터 타입:", typeof userData);
        console.log("🔍 응답 데이터 키:", Object.keys(userData));
        console.log("🔍 응답 데이터 값:", Object.values(userData));

        // 백엔드 응답 구조에 맞게 데이터 매핑
        const mappedUserData = {
          nickname: userData.nickname || "N/A",
          age: userData.creditInfo?.age || "N/A",
          income: userData.creditInfo?.income || "N/A",
          creditScore: userData.creditInfo?.creditScore || "N/A",
          homeOwnership: userData.creditInfo?.homeOwnership || "N/A",
          employmentType: userData.creditInfo?.employmentType || "N/A",
          assets: userData.creditInfo?.assets || "N/A",
          debt: userData.creditInfo?.debt || "N/A",
          workPeriod: userData.creditInfo?.workPeriod || "N/A",
          mainBank: userData.creditInfo?.mainBank || "N/A",
          loanType: userData.creditInfo?.loanType || "N/A",
          collateralValue: userData.creditInfo?.collateralValue || "N/A",
          ratePreference: userData.creditInfo?.ratePreference || "N/A",
          userCondition: userData.creditInfo?.userCondition || "N/A",
        };

        console.log("🔄 매핑된 사용자 데이터:", mappedUserData);

        // 사용자 정보가 실제로 있는지 확인
        const hasActualInfo =
          mappedUserData.age != "N/A" ||
          mappedUserData.income != "N/A" ||
          mappedUserData.creditScore != "N/A" ||
          mappedUserData.homeOwnership != "N/A" ||
          mappedUserData.employmentType != "N/A" ||
          mappedUserData.assets != "N/A" ||
          mappedUserData.debt != "N/A";

        if (!hasActualInfo) {
          console.log("⚠️ 사용자 상세 정보가 입력되지 않음");
          console.log("⚠️ 백엔드 API가 빈 데이터를 반환했을 가능성");
        }

        const result = {
          ...mappedUserData,
          isLoggedIn: true,
          email: memberInfo.email,
          hasDetailedInfo: hasActualInfo,
        };

        console.log("🎯 최종 사용자 정보:", result);
        return result;
      } else {
        console.error(
          "❌ 사용자 상세 정보 조회 실패:",
          detailResponse.status,
          detailResponse.statusText
        );
        const errorText = await detailResponse.text();
        console.error("❌ 에러 응답 내용:", errorText);

        // 에러 응답을 JSON으로 파싱 시도
        try {
          const errorData = JSON.parse(errorText);
          console.error("❌ 에러 데이터:", errorData);
        } catch (e) {
          console.error("❌ 에러 응답을 JSON으로 파싱할 수 없음");
        }
        return {
          isLoggedIn: true,
          email: memberInfo.email,
          name: memberInfo.name || "사용자",
        };
      }
    } catch (error) {
      console.error("❌ 사용자 상세 정보 조회 중 오류:", error);
      const memberInfo = getParsedCookie("member");
      return {
        isLoggedIn: true,
        email: memberInfo?.email || "",
        name: memberInfo?.name || "사용자",
      };
    }
  };

  // 사용 가능한 마이크 목록 가져오기
  const getAvailableMicrophones = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(
        (device) => device.kind === "audioinput"
      );
      setAvailableMicrophones(audioInputs);

      // 기본 마이크 설정 (첫 번째 사용 가능한 마이크)
      if (audioInputs.length > 0) {
        setCurrentMicrophone(audioInputs[0].deviceId);
      }

      console.log("🎤 사용 가능한 마이크:", audioInputs);
      return audioInputs;
    } catch (error) {
      console.error("마이크 목록 조회 실패:", error);
      return [];
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      console.log("📤 메시지 전송 시작:", inputMessage);

      // 사용자 상세 정보 포함하여 Flask 챗봇 API 호출
      const userDetailedInfo = await getUserDetailedInfo();
      console.log("👤 챗봇 API 호출 시 사용할 사용자 정보:", userDetailedInfo);

      const response = await callTextChatbot(inputMessage, userDetailedInfo);
      console.log("🤖 챗봇 API 응답:", response);

      if (response.success) {
        // 뉴스 관련 질문인지 확인
        const isNewsQuestion =
          inputMessage.includes("뉴스") || inputMessage.includes("오늘의 뉴스");

        if (isNewsQuestion && response.response) {
          // 뉴스 응답을 하나의 채팅창에 표시
          const newsMessage = {
            type: "bot",
            content: response.response,
            timestamp: new Date(),
          };

          // 하나의 메시지로 추가
          setMessages((prev) => [...prev, newsMessage]);
        } else {
          // 일반 응답
          const botMessage = {
            type: "bot",
            content: response.response, // Flask 응답 형식에 맞게 수정
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
        }
      } else {
        throw new Error(response.error || "알 수 없는 오류");
      }
    } catch (error) {
      console.error("❌ 챗봇 API 호출 실패:", error);
      const errorMessage = {
        type: "bot",
        content: "죄송합니다. Flask 챗봇 서버 연결에 실패했습니다.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Flask 서버 직접 연결 테스트
  const testFlaskConnection = async () => {
    try {
      setIsLoading(true);
      const response = await checkFlaskServerDirectly();

      if (response.status === "healthy") {
        alert(
          `✅ Flask 서버 연결 성공!\n상태: ${response.status}\n메시지: ${response.message}`
        );
      } else {
        alert(
          `⚠️ Flask 서버 상태 이상\n상태: ${response.status}\n메시지: ${response.message}`
        );
      }
    } catch (error) {
      alert(`❌ Flask 서버 연결 실패\n오류: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 데이터베이스 스키마 확인
  const checkDatabaseSchema = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://127.0.0.1:5000/api/database/schema");
      const data = await response.json();

      if (data.success) {
        let schemaInfo = "📊 데이터베이스 스키마 정보:\n\n";

        if (data.schema_info) {
          for (const [tableName, tableInfo] of Object.entries(
            data.schema_info
          )) {
            schemaInfo += `**${tableName}** 테이블:\n`;
            schemaInfo += `- 컬럼: ${tableInfo.column_names.join(", ")}\n`;

            schemaInfo += "\n";
          }
        }

        alert(schemaInfo);
      } else {
        alert("❌ 데이터베이스 스키마 조회 실패!\n\n오류: " + data.error);
      }
    } catch (error) {
      alert("❌ 데이터베이스 스키마 조회 실패!\n\n오류: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 새로운 음성 인식 시스템 시작
  const startVoiceRecognition = async () => {
    if (isRecording) {
      stopVoiceRecognition();
      return;
    }

    try {
      console.log("🎤 음성 인식 시작...");
      setTranscript("🎤 음성 인식 준비 중...");

      // Flask 서버 상태 먼저 확인
      try {
        const healthCheck = await fetch("http://127.0.0.1:5000/api/health");
        if (!healthCheck.ok) {
          throw new Error("Flask 서버가 실행되지 않았습니다.");
        }
        console.log("✅ Flask 서버 연결 확인됨");
      } catch (error) {
        console.error("❌ Flask 서버 연결 실패:", error);
        setTranscript(
          "❌ Flask 서버에 연결할 수 없습니다. 서버를 시작해주세요."
        );
        return;
      }

      // 마이크 접근 (최대한 단순하게)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: currentMicrophone
            ? { exact: currentMicrophone }
            : undefined,
          // 기본 설정으로 단순화
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      console.log("🎤 마이크 스트림 획득 성공");

      // MediaRecorder 설정 (단순하게)
      const recorder = new MediaRecorder(stream);

      setMediaRecorder(recorder);
      setAudioChunks([]);
      setTranscript("🎤 음성 인식 대기 중... 말씀해주세요!");

      // 실시간 음성 인식 시작
      startRealtimeListening(stream);

      // 오디오 데이터 수집
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
          console.log("🎤 오디오 데이터 수집:", event.data.size, "bytes");
          console.log("🎤 현재 오디오 청크 개수:", audioChunks.length + 1);
        }
      };

      // 녹음 중지 시 처리
      recorder.onstop = async () => {
        console.log("🎤 녹음 중지됨");

        // 스트림 정리
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunks.length > 0) {
          await processAudioData();
        } else {
          setTranscript("🎤 음성이 감지되지 않았습니다.");
        }

        setIsRecording(false);
      };

      // 녹음 시작 (0.5초마다 데이터 수집 - 빠른 반응)
      recorder.start(500);
      setIsRecording(true);

      // 3초 후 자동 중지 (짧은 녹음 시간)
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, 3000);
    } catch (error) {
      console.error("음성 인식 시작 실패:", error);

      if (error.name === "NotAllowedError") {
        setTranscript(
          "❌ 마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요."
        );
      } else if (error.name === "NotFoundError") {
        setTranscript(
          "❌ 마이크를 찾을 수 없습니다. WO Mic이 연결되어 있는지 확인해주세요."
        );
      } else {
        setTranscript(`❌ 마이크 접근 오류: ${error.message}`);
      }

      setIsRecording(false);
    }
  };

  // 음성 인식 중지
  const stopVoiceRecognition = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
    setIsRecording(false);

    // 실시간 음성 인식 중지
    stopRealtimeListening();
  };

  // 실시간 음성 인식 시작
  const startRealtimeListening = (stream) => {
    try {
      setIsRealtimeListening(true);
      setRealtimeTranscript("🎤 실시간 음성 인식 시작...");

      // 오디오 컨텍스트 생성
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      microphone.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // 실시간 오디오 레벨 모니터링
      const updateAudioLevel = () => {
        if (!isRealtimeListening) return;

        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // 오디오 레벨을 부드럽게 업데이트 (파장 애니메이션용)
        setAudioLevel((prevLevel) => {
          const smoothing = 0.3;
          return prevLevel * (1 - smoothing) + average * smoothing;
        });

        // 음성이 감지되었을 때 실시간 텍스트 업데이트
        if (average > 15) {
          updateRealtimeTranscript(average);
        }

        requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();

      // 전역 변수로 저장하여 정리할 수 있도록
      window.currentAudioContext = audioContext;
    } catch (error) {
      console.error("실시간 음성 인식 시작 실패:", error);
      setIsRealtimeListening(false);
    }
  };

  // 실시간 음성 인식 중지
  const stopRealtimeListening = () => {
    setIsRealtimeListening(false);
    setRealtimeTranscript("");
    setAudioLevel(0);

    // 오디오 컨텍스트 정리
    if (window.currentAudioContext) {
      window.currentAudioContext.close();
      window.currentAudioContext = null;
    }
  };

  // 실시간 음성 인식 텍스트 업데이트
  const updateRealtimeTranscript = (audioLevel) => {
    // 음성 레벨에 따라 다른 메시지 표시
    let message = "";

    if (audioLevel > 50) {
      message = "🎤 음성이 매우 명확하게 들립니다...";
    } else if (audioLevel > 30) {
      message = "🎤 음성이 잘 들리고 있습니다...";
    } else if (audioLevel > 15) {
      message = "🎤 음성이 감지되었습니다...";
    } else {
      message = "🎤 음성 인식 대기 중...";
    }

    setRealtimeTranscript(message);
  };

  // 오디오 데이터 처리 및 음성 인식
  const processAudioData = async () => {
    try {
      console.log("🎤 === 음성 인식 처리 시작 ===");
      console.log("🎤 오디오 청크 개수:", audioChunks.length);
      console.log(
        "🎤 각 청크 크기:",
        audioChunks.map((chunk) => chunk.size)
      );

      setIsProcessingAudio(true);
      setTranscript("🎤 음성을 텍스트로 변환 중...");

      // 오디오 파일 생성
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const audioFile = new File([audioBlob], "voice_input.webm", {
        type: "audio/webm",
      });

      console.log("🎤 오디오 파일 생성 완료:", audioFile.size, "bytes");
      console.log("🎤 오디오 파일 타입:", audioFile.type);
      console.log("🎤 오디오 파일 이름:", audioFile.name);

      // Flask API 호출하여 음성 인식 실행 (바로 전송)
      console.log("🎤 Flask API 호출 시작...");
      console.log("🎤 API 엔드포인트: /api/speech-to-text");
      console.log("🎤 오디오 파일 크기:", audioFile.size, "bytes");

      const response = await callRealtimeSpeech(audioFile);
      console.log("🎤 Flask API 응답:", response);

      if (response.success) {
        const recognizedText = response.transcript;
        const relatedData = response.related_data;

        console.log("🎤 음성 인식 성공:", recognizedText);
        console.log("🎤 관련 데이터:", relatedData);

        setTranscript(`✅ 음성 인식 완료: "${recognizedText}"`);

        // 음성 명령어 파싱 및 처리
        const command = parseVoiceCommand(recognizedText);
        console.log("🎤 음성 명령어 파싱 결과:", command);

        if (command.type === "property_search") {
          // 부동산 검색 명령인 경우
          console.log("🏠 부동산 검색 명령 감지:", command);
          console.log(
            "🏠 방 개수:",
            command.rooms,
            "화장실 개수:",
            command.bathrooms
          );

          // 부모 창으로 지도 페이지 이동 명령 전송 (매물 정보 없이 먼저 전송)
          sendToMapPage(command);

          // 사용자 메시지 추가
          const userMessage = {
            type: "user",
            content: recognizedText,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, userMessage]);

          // 해당 조건의 매물 정보 조회 (비동기 처리)
          try {
            const propertyInfo = await searchPropertiesByFilter(command);

            // 챗봇 응답 메시지 (매물 정보 포함)
            const botMessage = {
              type: "bot",
              content: generatePropertyResponse(
                propertyInfo.properties,
                command
              ),
              timestamp: new Date(),
              searchCriteria: {
                rooms: command.rooms,
                bathrooms: command.bathrooms,
              },
            };
            setMessages((prev) => [...prev, botMessage]);

            // 3초 후 자동으로 지도 페이지로 이동
            setTimeout(() => {
              console.log("🗺️ 3초 후 자동으로 지도 페이지로 이동...");
              sendToMapPage(command, propertyInfo.properties);
            }, 3000);
          } catch (error) {
            console.error("🔍 매물 정보 조회 실패:", error);

            // 오류 발생 시 기본 응답
            const botMessage = {
              type: "bot",
              content: `🔍 "${command.rooms}개 방, ${command.bathrooms}개 화장실" 매물을 찾아드리겠습니다! 지도 페이지로 이동 중...`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);

            // 오류 발생 시에도 지도 페이지로 이동
            setTimeout(() => {
              console.log("🗺️ 오류 발생으로 지도 페이지로 이동...");
              sendToMapPage(command, []);
            }, 2000);
          }
        } else {
          // 일반적인 음성 인식 결과를 채팅창에 표시
          console.log("🎤 일반 음성 인식:", recognizedText);
          await sendVoiceQuestionToChatbot(recognizedText, relatedData);
        }
      } else {
        console.error("🎤 음성 인식 실패:", response.error);
        setTranscript(`❌ 음성 인식 실패: ${response.error}`);
        // 실패 시에도 채팅창에 메시지 표시
        await sendVoiceQuestionToChatbot(
          "음성 인식에 실패했습니다. 다시 말씀해주세요."
        );
      }
    } catch (error) {
      console.error("🎤 오디오 처리 실패:", error);
      console.error("🎤 오류 상세 정보:", error.stack);
      setTranscript("❌ 음성 처리 중 오류가 발생했습니다.");
      // 오류 발생 시에도 채팅창에 메시지 표시
      await sendVoiceQuestionToChatbot(
        "음성 처리 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsProcessingAudio(false);
    }
  };

  // 관련 데이터를 보기 좋게 포맷팅
  const formatRelatedData = (relatedData) => {
    let formattedText = "";

    if (relatedData.apartment_sale && relatedData.apartment_sale.length > 0) {
      formattedText += `🏠 아파트 매매 (${relatedData.apartment_sale.length}개):\n`;
      relatedData.apartment_sale.slice(0, 3).forEach((item, index) => {
        formattedText += `  ${index + 1}. ${item.name || "이름 없음"} - ${
          item.address || "주소 없음"
        } (${
          item.price
            ? (item.price / 100000000).toFixed(1) + "억"
            : "가격 정보 없음"
        })\n`;
      });
      formattedText += "\n";
    }

    if (relatedData.apartment_rent && relatedData.apartment_rent.length > 0) {
      formattedText += `🏠 아파트 전세/월세 (${relatedData.apartment_rent.length}개):\n`;
      relatedData.apartment_rent.slice(0, 3).forEach((item, index) => {
        formattedText += `  ${index + 1}. ${item.name || "이름 없음"} - ${
          item.address || "주소 없음"
        } (보증금: ${
          item.deposit
            ? (item.deposit / 10000).toFixed(0) + "만원"
            : "정보 없음"
        })\n`;
      });
      formattedText += "\n";
    }

    if (relatedData.location_data) {
      formattedText += `📍 지역별 통계:\n`;
      Object.entries(relatedData.location_data).forEach(([location, data]) => {
        if (data.sale_stats && data.sale_stats.count > 0) {
          formattedText += `  ${location}: 매매 ${
            data.sale_stats.count
          }개, 평균 ${
            data.sale_stats.avg_price
              ? (data.sale_stats.avg_price / 100000000).toFixed(1) + "억"
              : "정보 없음"
          }\n`;
        }
      });
      formattedText += "\n";
    }

    if (relatedData.price_data && relatedData.price_data.price_ranges) {
      formattedText += `💰 가격대별 통계:\n`;
      relatedData.price_data.price_ranges.forEach((range) => {
        formattedText += `  ${range.price_range}: ${range.count}개, 평균 ${
          range.avg_price
            ? (range.avg_price / 100000000).toFixed(1) + "억"
            : "정보 없음"
        }\n`;
      });
    }

    return formattedText || "관련 데이터가 없습니다.";
  };

  // 음성 질문을 챗봇에게 전송 (데이터베이스 정보 포함)
  const sendVoiceQuestionToChatbot = async (question, relatedData = null) => {
    try {
      // 먼저 사용자 메시지를 채팅창에 표시
      const userMessage = {
        type: "user",
        content: `🎤 ${question}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      setIsLoading(true);

      const userDetailedInfo = await getUserDetailedInfo();

      // 일반 텍스트 챗봇 API 사용 (이미 음성 인식이 완료되었으므로)
      console.log("🎤 일반 텍스트 챗봇 API 호출...");
      const response = await callTextChatbot(question, userDetailedInfo);

      if (response.success) {
        const botMessage = {
          type: "bot",
          content:
            response.ai_answer ||
            response.response ||
            "응답을 생성할 수 없습니다.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(response.error || "챗봇 응답 생성 실패");
      }
    } catch (error) {
      console.error("챗봇 질문 처리 실패:", error);
      const errorMessage = {
        type: "bot",
        content: "죄송합니다. Flask 챗봇 응답 생성에 실패했습니다.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 데이터베이스 연결 테스트
  const testDatabaseConnection = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://127.0.0.1:5000/api/test-database");
      const data = await response.json();

      if (data.success) {
        let message = `✅ 데이터베이스 연결 성공!\n\n`;
        message += `데이터베이스: ${data.database}\n`;
        message += `테이블 개수: ${data.tables.length}개\n\n`;
        message += `테이블별 레코드 수:\n`;

        Object.entries(data.table_counts).forEach(([table, count]) => {
          message += `  ${table}: ${count}개\n`;
        });

        alert(message);
      } else {
        alert(`❌ 데이터베이스 연결 실패\n오류: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ 데이터베이스 연결 실패\n오류: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <div className="message-content">
              {msg.content.split("\n").map((line, i) => {
                // 동영상 ID 감지 및 동영상 플레이어 렌더링
                if (line.includes("🔗 동영상 ID:")) {
                  const videoId = line.split("🔗 동영상 ID:")[1].trim();

                  // 동영상 ID 유효성 검증 (11자리 영문+숫자)
                  if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
                    return (
                      <div key={i}>
                        <div className="youtube-video-container">
                          <iframe
                            width="100%"
                            height="200"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                        {i < msg.content.split("\n").length - 1 && <br />}
                      </div>
                    );
                  } else {
                    // 유효하지 않은 동영상 ID인 경우
                    return (
                      <div key={i}>
                        <div className="youtube-video-container error">
                          <div className="video-error-message">
                            <div className="error-icon">⚠️</div>
                            <div className="error-text">
                              <div>동영상을 재생할 수 없음</div>
                              <div>이 동영상은 볼 수 없습니다.</div>
                            </div>
                          </div>
                        </div>
                        {i < msg.content.split("\n").length - 1 && <br />}
                      </div>
                    );
                  }
                } else if (line.includes("🌐 유튜브 링크:")) {
                  // 유튜브 링크를 클릭 가능한 링크로 변환
                  const youtubeUrl = line.split("🌐 유튜브 링크:")[1].trim();
                  return (
                    <div key={i}>
                      <div className="youtube-link-container">
                        <a
                          href={youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="youtube-link"
                        >
                          🔗 {youtubeUrl}
                        </a>
                      </div>
                      {i < msg.content.split("\n").length - 1 && <br />}
                    </div>
                  );
                } else if (line.includes("🗺️ **지도에서 보기**")) {
                  // 지도에서 보기 버튼 렌더링
                  return (
                    <div key={i}>
                      <div className="map-navigation-container">
                        <button
                          onClick={() => {
                            try {
                              console.log("🗺️ 지도 페이지로 이동 버튼 클릭됨");

                              // 현재 메시지에서 검색 조건 추출
                              const currentMessage = messages[index];
                              if (
                                currentMessage &&
                                currentMessage.searchCriteria
                              ) {
                                const { rooms, bathrooms } =
                                  currentMessage.searchCriteria;
                                console.log("🗺️ 검색 조건:", {
                                  rooms,
                                  bathrooms,
                                });

                                // 지도 페이지로 이동 명령 전송
                                const command = {
                                  type: "property_search",
                                  rooms: rooms,
                                  bathrooms: bathrooms,
                                };

                                sendToMapPage(command, []);
                              } else {
                                console.log("🗺️ 검색 조건을 찾을 수 없음");
                              }
                            } catch (error) {
                              console.error("🗺️ 지도 이동 중 오류:", error);
                            }
                          }}
                          className="map-navigation-button"
                        >
                          🗺️ 지도에서 보기
                        </button>
                      </div>
                      {i < msg.content.split("\n").length - 1 && <br />}
                    </div>
                  );
                } else if (line.includes("🚀 **바로가기**: /member/join")) {
                  // 회원가입 방법 설명 div와 바로가기 버튼 div를 분리
                  return (
                    <div key={i}>
                      {/* 회원가입 방법 설명 div */}

                      {/* 바로가기 버튼만을 담은 div */}
                      <div className="signup-quick-access-container">
                        <button
                          onClick={() => {
                            try {
                              // 챗봇 브라우저 창에서 메인 브라우저 창으로 회원가입 페이지 이동
                              console.log("현재 창 정보:", {
                                current: window.location.href,
                                parent: window.parent?.location?.href,
                                top: window.top?.location?.href,
                              });

                              // 1차 시도: postMessage로 메인 창에 이동 신호 전송 (모든 가능한 창에)
                              const targetOrigin = "*";
                              const message = {
                                type: "navigate",
                                url: "/member/join",
                              };

                              // 부모 창에 메시지 전송
                              if (window.parent && window.parent !== window) {
                                window.parent.postMessage(
                                  message,
                                  targetOrigin
                                );
                                console.log("부모 창에 postMessage 전송");
                              }

                              // 최상위 창에 메시지 전송
                              if (window.top && window.top !== window) {
                                window.top.postMessage(message, targetOrigin);
                                console.log("최상위 창에 postMessage 전송");
                              }

                              // 2차 시도: 메인 창을 찾아서 직접 이동
                              setTimeout(() => {
                                try {
                                  // 현재 열려있는 모든 창을 확인
                                  const windows = window.opener
                                    ? [window.opener]
                                    : [];

                                  // 메인 창이 열려있다면 해당 창으로 이동
                                  windows.forEach((win) => {
                                    try {
                                      if (win && !win.closed) {
                                        win.location.href = "/member/join";
                                        win.focus();
                                        console.log("메인 창으로 이동 성공");
                                      }
                                    } catch (e) {
                                      console.log("개별 창 이동 실패:", e);
                                    }
                                  });
                                } catch (e) {
                                  console.log("창 이동 시도 실패:", e);
                                }
                              }, 200);

                              // 3차 시도: 사용자에게 안내 메시지 표시
                              setTimeout(() => {
                                alert(
                                  "메인 창으로 이동 신호를 전송했습니다. 메인 창을 확인해주세요!"
                                );
                              }, 500);
                            } catch (error) {
                              console.error("페이지 이동 실패:", error);
                              // 오류 발생 시 postMessage 재시도
                              try {
                                if (window.parent && window.parent !== window) {
                                  window.parent.postMessage(
                                    { type: "navigate", url: "/member/join" },
                                    "*"
                                  );
                                }
                              } catch (finalError) {
                                console.error("최종 이동 실패:", finalError);
                              }
                            }
                          }}
                          className="signup-quick-access-btn"
                        >
                          회원가입 바로가기
                        </button>
                      </div>

                      {i < msg.content.split("\n").length - 1 && <br />}
                    </div>
                  );
                } else {
                  return (
                    <div key={i}>
                      {line}
                      {i < msg.content.split("\n").length - 1 && <br />}
                    </div>
                  );
                }
              })}
            </div>
            <div className="message-timestamp">
              {msg.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot loading-message">
            <div className="message-content">
              <span className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        )}

        {/* 음성 인식 오버레이 - 전체 화면 블러 처리 */}
        {isRecording && (
          <div className="voice-overlay">
            <div className="voice-overlay-content">
              <div className="voice-icon-container">
                <div className="voice-icon">🎤</div>
                {/* 음성 파장 애니메이션 - 동그란 파장 */}
                <div className="voice-waves">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className={`voice-wave ${
                        audioLevel > 15 ? "active" : ""
                      }`}
                      style={{
                        animationDelay: `${index * 0.3}s`,
                        animationDuration: `${1.5 + index * 0.2}s`,
                        width:
                          audioLevel > 10
                            ? `${60 + (audioLevel / 128) * 40}px`
                            : "60px",
                        height:
                          audioLevel > 10
                            ? `${60 + (audioLevel / 128) * 40}px`
                            : "60px",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="voice-status-text">
                {realtimeTranscript ||
                  transcript ||
                  "음성 인식 대기 중... 말씀해주세요!"}
              </div>
              <div className="voice-instruction">
                말씀을 마치시면 자동으로 인식됩니다
              </div>
            </div>
          </div>
        )}

        {/* 자동 스크롤을 위한 타겟 div */}
        <div ref={messagesEndRef} className="messages-end-ref" />
      </div>

      <div className="chat-input">
        <button
          onClick={startVoiceRecognition}
          disabled={isLoading || isRecording}
          className={`mic-btn ${isRecording ? "recording" : ""}`}
          title={isRecording ? "음성 인식 중지" : "음성으로 질문"}
        >
          <img
            src="/mic.png"
            alt="마이크"
            className={`mic-icon ${isRecording ? "recording" : ""}`}
          />
        </button>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="부동산 관련 질문을 입력하세요..."
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading}
          className="send-btn"
          title="메시지 전송"
        >
          <img
            src="/send.png"
            alt="전송"
            className="send-icon"
            onError={(e) => {
              console.error("이미지 로드 실패:", e.target.src);
              e.target.style.display = "none";
            }}
          />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
