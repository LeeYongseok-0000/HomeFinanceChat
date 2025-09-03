import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import "./MapComponent.css";
import FilterNavBar from "./filter/FilterNavBar";
import {
  getPropertyDetail,
  getMarketPrice,
  likeProperty,
} from "../api/propertyApi";
import { formatAmountToKorean } from "../util/currencyUtil";
import MarketPriceChart from "./property/MarketPriceChart";
import TransactionHistoryChart from "./property/TransactionHistoryChart";
import { getCurrentUser } from "../util/jwtUtil";
import { getMaxPurchaseAmount } from "../api/memberApi";
import ImageModal from "./common/ImageModal";

function MapComponent() {
  const mapRef = useRef(null);
  const propertyDetailRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [map, setMap] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [places, setPlaces] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState("전체");
  const [showFilters, setShowFilters] = useState(false);
  const [filterForm, setFilterForm] = useState({
    transactionType: "",
    rentType: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    roomCount: "",
    depositMin: "",
    depositMax: "",
    monthlyRentMin: "",
    monthlyRentMax: "",
    jeonseMin: "",
    jeonseMax: "",
    saleMin: "",
    saleMax: "",
    bathroomCount: "",
    floor: "",
    completionYearMin: "",
    completionYearMax: "",
    areaMin: "",
    areaMax: "",
    // 추가옵션 필터
    elevator: false,
    airConditioner: false,
    washingMachine: false,
    induction: false,
    balcony: false,
    shoeCabinet: false,
    bathtub: false,
    wardrobe: false,
    tv: false,
    refrigerator: false,
    sink: false,
    fireAlarm: false,
    parking: false,
    petFriendly: false,
  });
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [properties, setProperties] = useState([]); // 매물 목록 상태 추가
  const [showPropertyList, setShowPropertyList] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null); // 선택된 매물 정보

  // 페이징 처리 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10); // 페이지당 항목 수를 10개로 변경

  // 거래 유형 상태 추가
  const [selectedTransactionType, setSelectedTransactionType] =
    useState("전체");

  // 선택된 매물의 현재 이미지 인덱스
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 이미지 모달 상태
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalInitialIndex, setModalInitialIndex] = useState(0);

  // 사용자 최대 구매 가능액 상태
  const [userMaxPurchaseAmount, setUserMaxPurchaseAmount] = useState(null);
  const [isUserConditionFilterActive, setIsUserConditionFilterActive] =
    useState(false);

  // 면적 단위 토글 상태 (㎡/평)
  const [isAreaInPyeong, setIsAreaInPyeong] = useState(false);

  // 매물 마커 ref 추가
  const propertyMarkers = useRef([]);

  // 상단 nav바 필터 상태 관리 - FilterNavBar에서 자체 관리하도록 제거
  // const [activeFilter, setActiveFilter] = useState(null); // 현재 활성화된 필터
  // const [dropdownPosition, setDropdownPosition] = useState({ top: 150, left: 20 }); // FilterNavBar로 이동됨
  const [filterItems, setFilterItems] = useState([
    { id: "transactionType", label: "월세/전세/매매" },
    { id: "area", label: "면적" },
    { id: "roomCount", label: "방 개수" },
    { id: "bathroomCount", label: "화장실" },
    { id: "floor", label: "층수" },
    { id: "completionYear", label: "준공년도" },
    { id: "additionalOptions", label: "추가옵션" },
    {
      id: "userCondition",
      label: `${getCurrentUser()?.nickname || "사용자"}님의 조건`,
    },
  ]);

  // 이미지 모달 열기
  const openImageModal = (index) => {
    setModalInitialIndex(index);
    setIsImageModalOpen(true);
  };

  // 이미지 모달 닫기
  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  // 면적 단위 변환 함수
  const convertArea = (areaInM2) => {
    if (!areaInM2) return "정보없음";

    if (isAreaInPyeong) {
      // ㎡를 평으로 변환 (1㎡ = 0.3025평)
      const pyeong = areaInM2 * 0.3025;
      return `${Math.round(pyeong)}평`;
    } else {
      // 평을 ㎡로 변환
      return `${areaInM2}㎡`;
    }
  };

  // 사용자 최대 구매 가능액 가져오기
  const loadUserMaxPurchaseAmount = async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.email) {
        const data = await getMaxPurchaseAmount(currentUser.email);
        if (data && data.maxPurchaseAmount) {
          setUserMaxPurchaseAmount(data.maxPurchaseAmount);
          console.log("사용자 최대 구매 가능액:", data.maxPurchaseAmount);
        }
      }
    } catch (error) {
      console.error("사용자 최대 구매 가능액 로드 실패:", error);
    }
  };

  // 사용자 조건 필터 토글
  const toggleUserConditionFilter = () => {
    setIsUserConditionFilterActive(!isUserConditionFilterActive);
  };

  // 면적 단위 토글 함수
  const toggleAreaUnit = () => {
    setIsAreaInPyeong(!isAreaInPyeong);
  };

  // 사용자 최대 구매 가능액 로드
  useEffect(() => {
    loadUserMaxPurchaseAmount();
  }, []);

  // 외부 클릭 감지 - 매물 상세정보 모달 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        propertyDetailRef.current &&
        !propertyDetailRef.current.contains(event.target)
      ) {
        // 이미지 모달이 열려있으면 이미지 모달만 닫기
        if (isImageModalOpen) {
          setIsImageModalOpen(false);
          return;
        }

        // 이미지 모달이 닫혀있을 때만 매물 상세정보 모달 닫기
        setSelectedProperty(null);
        setCurrentImageIndex(0);
        setModalInitialIndex(0);
      }
    };

    if (selectedProperty) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedProperty, isImageModalOpen]);

  // 1) Kakao Maps 스크립트 로드 (services만)
  useEffect(() => {
    console.log("카카오 맵 초기화 시작");

    // API 키 확인
    const apiKey = process.env.REACT_APP_KAKAO_MAP_KEY;
    console.log("API 키:", apiKey);

    if (!apiKey) {
      console.error("카카오 맵 API 키가 설정되지 않았습니다!");
      console.error(
        "front/.env 파일에 REACT_APP_KAKAO_MAP_KEY=your_api_key를 추가해주세요."
      );
      return;
    }

    // 이미 로드된 스크립트가 있는지 확인
    if (document.querySelector('script[src*="dapi.kakao.com"]')) {
      console.log("카카오 맵 SDK가 이미 로드되어 있습니다.");
      initializeMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`;
    script.async = true;

    script.onload = () => {
      console.log("카카오 맵 SDK 로드 완료");
      initializeMap();
    };

    script.onerror = (error) => {
      console.error("카카오 맵 SDK 로드 실패:", error);
    };

    document.head.appendChild(script);

    function initializeMap() {
      if (!window.kakao) {
        console.error("카카오 맵 SDK가 로드되지 않았습니다.");
        return;
      }

      window.kakao.maps.load(() => {
        console.log("카카오 맵 로드 완료");

        const mapElement = document.getElementById("map");
        console.log("지도 엘리먼트:", mapElement);

        if (!mapElement) {
          console.error("지도 엘리먼트를 찾을 수 없습니다");
          return;
        }

        try {
          const initialMap = new window.kakao.maps.Map(mapElement, {
            center: new window.kakao.maps.LatLng(37.5665, 126.978),
            level: 3,
            draggable: true,
            zoomable: true,
            scrollwheel: true,
          });

          setMap(initialMap);
          console.log("지도 초기화 완료");

          // 사용자 위치 가져오기
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setUserPosition({ lat: latitude, lng: longitude });
                console.log("사용자 위치:", { lat: latitude, lng: longitude });

                // 사용자 위치로 지도 중심 이동
                const userLatLng = new window.kakao.maps.LatLng(
                  latitude,
                  longitude
                );
                initialMap.setCenter(userLatLng);
                initialMap.setLevel(3);

                // 사용자 위치 마커 추가
                const userMarker = new window.kakao.maps.Marker({
                  position: userLatLng,
                  map: initialMap,
                });
              },
              (error) => {
                console.error("위치 정보를 가져올 수 없습니다:", error);
              }
            );
          }
        } catch (error) {
          console.error("지도 초기화 실패:", error);
        }
      });
    }

    return () => {
      // 컴포넌트 언마운트 시 정리
      if (map) {
        map.destroy();
      }
    };
  }, []);

  // URL 쿼리 파라미터 처리 - propertyType이 전달되면 해당 부동산 유형 자동 선택
  useEffect(() => {
    const propertyType = searchParams.get("propertyType");
    const searchQuery = searchParams.get("search");

    if (propertyType) {
      // URL 쿼리 파라미터에 따라 부동산 유형 매핑
      const propertyTypeMap = {
        apartment: "아파트",
        officetel: "오피스텔",
        detached: "단독주택",
        rowhouse: "연립/다세대",
        all: "전체",
      };

      const mappedType = propertyTypeMap[propertyType];
      if (mappedType) {
        setSelectedPropertyType(mappedType);
        console.log(`URL 쿼리 파라미터로 ${mappedType} 선택됨`);
      }
    }

    if (searchQuery) {
      // 검색어가 전달되면 검색창에 설정하고 자동 검색 실행
      setSearchKeyword(decodeURIComponent(searchQuery));
      console.log(
        `URL 쿼리 파라미터로 검색어 설정: ${decodeURIComponent(searchQuery)}`
      );

      // 지도가 로드된 후에 검색 실행
      if (map) {
        setTimeout(() => {
          handleSearch();
        }, 100);
      }
    }
  }, [searchParams, map]);

  // 지도 로드 후 검색 쿼리 파라미터가 있으면 자동 검색 실행
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (
      map &&
      searchQuery &&
      searchKeyword === decodeURIComponent(searchQuery)
    ) {
      // 지도가 로드되고 검색어가 설정되어 있으면 자동 검색 실행
      setTimeout(() => {
        handleSearch();
      }, 500); // 지도 렌더링을 위한 약간의 지연
    }
  }, [map, searchParams, searchKeyword]);

  // 초기 로드 시 Property 데이터 자동 표시
  useEffect(() => {
    // 검색어가 있으면 검색된 결과만 표시, 없으면 모든 매물 표시
    if (searchKeyword.trim()) {
      // 검색어가 있을 때는 검색된 결과만 표시
      return;
    } else {
      // 검색어가 없을 때는 모든 매물 표시
      if (selectedPropertyType === "전체") {
        fetchPropertyData();
      } else if (selectedPropertyType !== "전체") {
        fetchPropertyDataByType(selectedPropertyType);
      }
    }
  }, [selectedPropertyType, searchKeyword]);

  // 검색어 분석 및 매칭 함수
  const analyzeSearchKeyword = (keyword) => {
    const analysis = {
      regions: [],
      propertyTypes: [],
      transactionTypes: [],
      keywords: [],
      isRoadAddress: false
    };

    // 지역명 매칭 (더 포괄적으로)
    const regionKeywords = [
      '강남', '강북', '강동', '강서', '관악', '광진', '구로', '금천', '노원', '도봉', '동대문', '동작', '마포', '서대문', '서초', '성동', '성북', '송파', '양천', '영등포', '용산', '은평', '종로', '중구', '중랑',
      '수원', '성남', '용인', '안산', '안양', '부천', '광명', '평택', '과천', '오산', '시흥', '군포', '의왕', '하남', '이천', '안성', '김포', '화성', '광주', '여주', '양평', '고양', '의정부', '동두천', '구리', '남양주', '파주', '양주', '포천', '연천', '가평', '춘천', '원주', '강릉', '태백', '정선', '속초', '영월', '평창', '횡성', '철원', '화천', '양구', '인제', '고성', '양양', '동해', '삼척', '울진', '울릉', '청주', '충주', '제천', '보은', '옥천', '영동', '증평', '진천', '괴산', '음성', '단양', '천안', '공주', '보령', '아산', '서산', '논산', '계룡', '당진', '금산', '부여', '서천', '청양', '홍성', '예산', '태안', '전주', '군산', '익산', '정읍', '남원', '김제', '완주', '진안', '무주', '장수', '임실', '순창', '고창', '부안', '여수', '순천', '나주', '광양', '담양', '곡성', '구례', '고흥', '보성', '화순', '장흥', '강진', '해남', '영암', '무안', '함평', '영광', '장성', '완도', '진도', '신안', '포항', '경주', '김천', '안동', '구미', '영주', '영천', '상주', '문경', '경산', '군위', '의성', '청송', '영양', '영덕', '청도', '고령', '성주', '칠곡', '예천', '봉화', '울진', '울릉', '창원', '마산', '진주', '통영', '사천', '김해', '밀양', '거제', '양산', '의령', '함안', '창녕', '고성', '남해', '하동', '산청', '함양', '거창', '합천', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '제주'
    ];

    // 매물 유형 매칭
    const propertyTypeKeywords = {
      '아파트': ['아파트', 'APT', 'apt', '아파트', '아파트'],
      '오피스텔': ['오피스텔', '오피스', 'OP', 'op', '오피스텔'],
      '연립/다세대': ['연립', '다세대', '빌라', '빌라', '연립주택', '다세대주택'],
      '단독주택': ['단독주택', '단독', '주택', '집', '단독', '주택']
    };

    // 거래 유형 매칭
    const transactionTypeKeywords = {
      '매매': ['매매', '매매', '팔기', '사기', '매매'],
      '전세': ['전세', '전세', '전세'],
      '월세': ['월세', '월세', '월세']
    };

    const lowerKeyword = keyword.toLowerCase();

    // 도로명 주소 여부 확인 (로, 길 + 숫자 패턴)
    const roadAddressPattern = /(로|길)\s*\d+/;
    if (roadAddressPattern.test(keyword)) {
      analysis.isRoadAddress = true;
      console.log("도로명 주소 패턴 감지:", keyword);
    }

    // 지역명 매칭
    regionKeywords.forEach(region => {
      if (lowerKeyword.includes(region.toLowerCase())) {
        analysis.regions.push(region);
      }
    });

    // 매물 유형 매칭
    Object.entries(propertyTypeKeywords).forEach(([type, keywords]) => {
      if (keywords.some(k => lowerKeyword.includes(k.toLowerCase()))) {
        analysis.propertyTypes.push(type);
      }
    });

    // 거래 유형 매칭
    Object.entries(transactionTypeKeywords).forEach(([type, keywords]) => {
      if (keywords.some(k => lowerKeyword.includes(k.toLowerCase()))) {
        analysis.transactionTypes.push(type);
      }
    });

    // 일반 키워드 (지역, 매물유형, 거래유형이 아닌 것들)
    analysis.keywords = [keyword];

    console.log("검색어 분석 완료:", analysis);
    return analysis;
  };

  // 2) 검색 기능
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }

    if (!map) {
      alert("지도가 로드되지 않았습니다.");
      return;
    }

    try {
      // 기존 마커들 제거
      markers.forEach((marker) => marker.setMap(null));
      setMarkers([]);

      // 검색어 분석
      const searchAnalysis = analyzeSearchKeyword(searchKeyword);
      console.log("검색어 분석 결과:", searchAnalysis);

      // 도로명이나 지역명이 포함된 검색인지 확인
      const isLocationSearch = searchAnalysis.regions.length > 0 || 
                              searchKeyword.includes('로') || 
                              searchKeyword.includes('길') || 
                              searchKeyword.includes('동') || 
                              searchKeyword.includes('구') ||
                              searchKeyword.includes('시') ||
                              searchKeyword.includes('군') ||
                              searchKeyword.includes('번지') ||
                              /\d+/.test(searchKeyword); // 숫자가 포함된 경우 (도로명 주소)

      console.log("위치 검색 여부:", isLocationSearch, "검색어:", searchKeyword);

      if (isLocationSearch) {
      // 장소 검색 서비스 객체 생성
      const ps = new window.kakao.maps.services.Places();

      // 장소 검색 실행
      ps.keywordSearch(searchKeyword, (data, status) => {
          console.log("카카오 맵 검색 결과:", { status, data, keyword: searchKeyword });
          
          if (status === window.kakao.maps.services.Status.OK && data && data.length > 0) {
            console.log("장소 검색 성공:", data);
          setPlaces(data);

          // 검색 결과에 대한 마커 생성
          const newMarkers = [];
          const bounds = new window.kakao.maps.LatLngBounds();

          data.forEach((place) => {
            const marker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(place.y, place.x),
              map: map,
            });

            // 마커 클릭 시 정보창 표시
            const infowindow = new window.kakao.maps.InfoWindow({
              content: `
                <div style="padding:10px;min-width:200px;">
                  <h3>${place.place_name}</h3>
                  <p>${place.address_name}</p>
                  ${place.phone ? `<p>전화: ${place.phone}</p>` : ""}
                </div>
              `,
            });

            window.kakao.maps.event.addListener(marker, "click", () => {
              infowindow.open(map, marker);
            });

            newMarkers.push(marker);
            bounds.extend(new window.kakao.maps.LatLng(place.y, place.x));
          });

          setMarkers(newMarkers);

          // 검색 결과가 지도에 모두 보이도록 지도 범위 재설정
            if (newMarkers.length > 0) {
          map.setBounds(bounds);
            }

          // 검색어에 따른 매물 데이터 필터링
          searchPropertiesByKeyword(searchKeyword);
        } else {
            console.log("장소 검색 결과 없음, 매물 검색만 진행");
          setPlaces([]);
            // 장소 검색 결과가 없어도 매물 검색은 진행
            searchPropertiesByKeyword(searchKeyword);
          }
        });
      } else {
        // 지역명이 아닌 일반 검색의 경우 매물 검색만 진행
        console.log("일반 검색, 매물 검색만 진행");
        setPlaces([]);
        searchPropertiesByKeyword(searchKeyword);
      }
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      alert("검색 중 오류가 발생했습니다.");
      // 오류 발생 시에도 매물 검색은 시도
      searchPropertiesByKeyword(searchKeyword);
    }
  };

  // 검색어에 따른 매물 데이터 검색 - 개선된 검색
  const searchPropertiesByKeyword = async (keyword) => {
    try {
      setFilteredProperties([]); // 로딩 중 빈 배열로 설정

      // 검색어 분석
      const searchAnalysis = analyzeSearchKeyword(keyword);
      console.log("매물 검색 시작 - 검색어 분석 결과:", searchAnalysis);

      // 현재 사용자 정보 가져오기
      const currentUser = getCurrentUser();
      const memberEmail = currentUser ? currentUser.email : null;

      // 백엔드 서버 주소 (환경변수 또는 기본값)
      const backendUrl =
        process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

      // 도로명 주소 검색인 경우 특별 처리
      if (searchAnalysis.isRoadAddress) {
        console.log("도로명 주소 검색 감지, 정확한 검색 시도");
        
        // 도로명 주소 검색을 위한 특별 쿼리
        const roadSearchParams = new URLSearchParams({
          page: "0",
          size: pageSize.toString(),
          searchKeyword: keyword,
          searchType: "roadAddress", // 도로명 주소 검색 타입 지정
        });

        if (memberEmail) {
          roadSearchParams.append("memberEmail", memberEmail);
        }

        console.log("도로명 주소 검색 쿼리:", roadSearchParams.toString());

        // 도로명 주소 검색 시도
        const roadResponse = await fetch(
          `${backendUrl}/api/property/map?${roadSearchParams.toString()}`
        );

        if (roadResponse.ok) {
          const roadData = await roadResponse.json();
          console.log("도로명 주소 검색 결과:", roadData);

          if (roadData.content && roadData.content.length > 0) {
            // 도로명 주소 검색 결과가 있으면 해당 결과 사용
            processSearchResults(roadData, keyword);
            return;
          } else {
            console.log("도로명 주소 검색 결과 없음, 일반 검색으로 진행");
          }
        } else {
          console.log("도로명 주소 검색 실패, 일반 검색으로 진행");
        }
      }

      // 일반 검색 또는 도로명 검색 실패 시
      const queryParams = new URLSearchParams({
        page: "0",
        size: pageSize.toString(),
        searchKeyword: keyword,
      });

      // 검색어 분석 결과를 바탕으로 필터 추가
      if (searchAnalysis.propertyTypes.length > 0) {
        // 검색어에 매물 유형이 포함된 경우 해당 유형으로 필터링
        queryParams.append("propertyType", searchAnalysis.propertyTypes[0]);
        console.log("매물 유형 필터 적용:", searchAnalysis.propertyTypes[0]);
      } else if (selectedPropertyType && selectedPropertyType !== "전체") {
        // 검색어에 매물 유형이 없으면 현재 선택된 유형 사용
        queryParams.append("propertyType", selectedPropertyType);
        console.log("현재 선택된 매물 유형 필터 적용:", selectedPropertyType);
      }

      if (searchAnalysis.transactionTypes.length > 0) {
        // 검색어에 거래 유형이 포함된 경우 해당 유형으로 필터링
        queryParams.append("transactionType", searchAnalysis.transactionTypes[0]);
        console.log("거래 유형 필터 적용:", searchAnalysis.transactionTypes[0]);
      } else if (selectedTransactionType && selectedTransactionType !== "전체") {
        // 검색어에 거래 유형이 없으면 현재 선택된 유형 사용
        queryParams.append("transactionType", selectedTransactionType);
        console.log("현재 선택된 거래 유형 필터 적용:", selectedTransactionType);
      }

      // 사용자 이메일 추가
      if (memberEmail) {
        queryParams.append("memberEmail", memberEmail);
      }

      console.log("일반 검색 쿼리 파라미터:", queryParams.toString());
      console.log("검색 요청 URL:", `${backendUrl}/api/property/map?${queryParams.toString()}`);

      const response = await fetch(
        `${backendUrl}/api/property/map?${queryParams.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("일반 검색 결과:", data);
        processSearchResults(data, keyword);
        } else {
        console.error("매물 검색 실패:", response.status, response.statusText);
        setFilteredProperties([]);
        setTotalElements(0);
        setTotalPages(1);
          setCurrentPage(1);
        }
    } catch (error) {
      console.error("매물 검색 중 오류 발생:", error);
      setFilteredProperties([]);
      setTotalElements(0);
      setTotalPages(1);
      setCurrentPage(1);
    }
  };

  // 검색 결과 처리 함수
  const processSearchResults = (data, keyword) => {
    console.log("검색 결과 처리 시작:", data);

    if (!data.content || data.content.length === 0) {
      console.log("검색 결과가 없습니다.");
      setProperties([]);
      setFilteredProperties([]);
      setTotalPages(1);
      setTotalElements(0);
      setCurrentPage(1);
      return;
    }

    // 검색어 분석
    const searchAnalysis = analyzeSearchKeyword(keyword);

    // 도로명 주소 검색인 경우 추가 프론트엔드 필터링
    let filteredContent = data.content;
    if (searchAnalysis && searchAnalysis.isRoadAddress) {
      filteredContent = data.content.filter((property) => {
        const address = property.roadAddress || property.address || property.location;
        return address && address !== "주소 정보 없음" && address !== "." && 
               address.toLowerCase().includes(keyword.toLowerCase());
      });
      console.log("도로명 주소 검색 프론트엔드 필터링 결과:", {
        원본: data.content.length,
        필터링후: filteredContent.length
      });
    }

    // 추가옵션 필터가 적용된 경우 프론트엔드에서 추가 필터링
    if (filterForm.additionalOptions && filterForm.additionalOptions.length > 0) {
      const selectedOptions = filterForm.additionalOptions;
      filteredContent = filteredContent.filter((property) => {
        // 매물이 선택된 옵션 중 하나라도 가지고 있는지 확인
        return selectedOptions.some(option => {
          // 옵션 값이 true, "가능", "Y", 1 등인지 확인하는 헬퍼 함수
          const hasOptionValue = (value) => {
            // null, undefined도 "가능"으로 간주 (기본적으로 해당 옵션이 있다고 가정)
            if (value === null || value === undefined) return true;
            if (value === true || value === 1) return true;
            if (typeof value === 'string') {
              const lowerValue = value.toLowerCase().trim();
              // 빈 문자열도 "가능"으로 간주 (백엔드에서 빈 문자열로 저장하는 경우)
              if (lowerValue === '') return true;
              // 문자열 "true"도 true로 간주
              if (lowerValue === 'true') return true;
              // 문자열 "false"는 false로 간주
              if (lowerValue === 'false') return false;
              return lowerValue === 'y' || lowerValue === 'yes' || lowerValue === '있음';
            }
            return false;
          };

          switch (option) {
            case 'elevator':
              return hasOptionValue(property.elevator);
            case 'airConditioner':
              return hasOptionValue(property.airConditioner);
            case 'washingMachine':
              return hasOptionValue(property.washingMachine);
            case 'induction':
              return hasOptionValue(property.induction);
            case 'balcony':
              return hasOptionValue(property.balcony);
            case 'shoeCabinet':
              return hasOptionValue(property.shoeCabinet);
            case 'bathtub':
              return hasOptionValue(property.bathtub);
            case 'wardrobe':
              return hasOptionValue(property.wardrobe);
            case 'tv':
              return hasOptionValue(property.tv);
            case 'refrigerator':
              return hasOptionValue(property.refrigerator);
            case 'sink':
              return hasOptionValue(property.sink);
            case 'fireAlarm':
              return hasOptionValue(property.fireAlarm);
            case 'parking':
              return hasOptionValue(property.parking);
            case 'petFriendly':
              return hasOptionValue(property.petFriendly);
            default:
              return false;
          }
        });
      });
      console.log("추가옵션 프론트엔드 필터링 결과:", {
        원본: data.content.length,
        필터링후: filteredContent.length,
        선택된옵션: selectedOptions
      });
    }

    // 페이지네이션 정보 업데이트
    const totalFilteredElements = filteredContent.length;
    const totalFilteredPages = Math.ceil(totalFilteredElements / 10); // 페이지당 10개

    // 추가옵션 필터가 적용된 경우에만 프론트엔드 페이징 정보 업데이트
    if (filterForm.additionalOptions && filterForm.additionalOptions.length > 0) {
      setTotalPages(totalFilteredPages);
      setTotalElements(totalFilteredElements);
      setCurrentPage(1);
      console.log("추가옵션 필터로 인한 프론트엔드 페이징 적용:", {
        totalPages: totalFilteredPages,
        totalElements: totalFilteredElements,
        currentPage: 1
      });
    } else {
      // 추가옵션 필터가 없는 경우 백엔드의 원래 페이징 정보 유지
      // 이 경우 백엔드에서 받은 페이징 정보를 그대로 사용
      console.log("백엔드 페이징 정보 유지 (추가옵션 필터 없음)");
    }

    // 매물 마커 생성 및 표시
    const newPropertyMarkers = [];
    const processedProperties = [];

    filteredContent.forEach((property, index) => {
      // 주소 정리
      const cleanAddress = (() => {
        const address = property.roadAddress || property.address || property.location;
        if (address && address !== "주소 정보 없음" && address !== "." && address.trim() !== "") {
          return address.trim();
        }
        return "주소 정보 없음";
      })();

      // 좌표가 있는 경우에만 마커 생성
      if (property.latitude && property.longitude) {
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(
            property.latitude,
            property.longitude
          ),
        });

        // 마커 클릭 이벤트
        marker.addListener("click", () => {
          setSelectedProperty(property);
          setCurrentImageIndex(0);
          setModalInitialIndex(0);
        });

        newPropertyMarkers.push(marker);
        marker.setMap(map);

        // 마커에 매물 정보 저장
        marker.propertyData = property;
      }

      // 매물 정보 처리
      const processedProperty = {
        ...property,
        location: cleanAddress,
        roadAddress: cleanAddress,
        address: cleanAddress,
      };

      processedProperties.push(processedProperty);
    });

    // 기존 마커 제거
    if (propertyMarkers.current.length > 0) {
      propertyMarkers.current.forEach((marker) => {
        marker.setMap(null);
      });
    }

    // 새 마커 저장
    propertyMarkers.current = newPropertyMarkers;

    // 필터링된 매물 목록 설정
    setFilteredProperties(processedProperties);
    setShowPropertyList(true);

    console.log("검색 결과 처리 완료:", {
      총매물수: totalFilteredElements,
      총페이지수: totalFilteredPages,
      현재페이지: 1,
      처리된매물수: processedProperties.length,
      마커생성수: newPropertyMarkers.length
    });
  };

  // 3) 매물 유형 선택
  const handlePropertyTypeClick = (propertyType) => {
    setSelectedPropertyType(propertyType);
    setSelectedTransactionType("전체"); // 거래 유형을 전체로 리셋
    setCurrentPage(1); // 첫 페이지로 리셋
    setShowFilters(false);

    // 현재 활성화된 필터 정보 구성
    const currentFilters = {};
    if (filterForm.areaMin) currentFilters.areaMin = filterForm.areaMin;
    if (filterForm.areaMax) currentFilters.areaMax = filterForm.areaMax;
    if (filterForm.roomCount) currentFilters.roomCount = filterForm.roomCount;
    if (filterForm.bathroomCount)
      currentFilters.bathroomCount = filterForm.bathroomCount;
    if (filterForm.floor) currentFilters.floor = filterForm.floor;
    if (filterForm.completionYearMin)
      currentFilters.yearBuiltMin = filterForm.completionYearMin;
    if (filterForm.completionYearMax)
      currentFilters.yearBuiltMax = filterForm.completionYearMax;

    // 모든 매물 유형에서 Property API 사용
    if (propertyType === "전체") {
      fetchPropertyData(1, "전체", currentFilters);
    } else {
      // 특정 매물 유형 선택 시 해당 유형으로 필터링
      fetchPropertyDataByType(propertyType, 1, "전체", currentFilters);
    }
  };

  // Property 매물 데이터 가져오기 (특정 유형별)
  const fetchPropertyDataByType = async (
    propertyType,
    page = 1,
    transactionType = "전체",
    additionalFilters = {}
  ) => {
    try {
      setFilteredProperties([]); // 로딩 중 빈 배열로 설정

      // 현재 사용자 정보 가져오기
      const currentUser = getCurrentUser();
      const memberEmail = currentUser ? currentUser.email : null;

      // 백엔드 서버 주소 (환경변수 또는 기본값)
      const backendUrl =
        process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

      // 사용자 이메일을 쿼리 파라미터에 추가
      const queryParams = new URLSearchParams({
        page: (page - 1).toString(),
        size: pageSize.toString(),
        propertyType: propertyType,
        transactionType: transactionType,
      });

      // 추가 필터 파라미터들을 쿼리에 추가
      if (additionalFilters) {
        console.log("=== fetchPropertyDataByType - additionalFilters ===");
        console.log("additionalFilters:", additionalFilters);
        Object.keys(additionalFilters).forEach((key) => {
          if (
            additionalFilters[key] !== null &&
            additionalFilters[key] !== undefined &&
            additionalFilters[key] !== ""
          ) {
            queryParams.append(key, additionalFilters[key]);
            console.log(
              `쿼리 파라미터 추가: ${key} = ${additionalFilters[key]}`
            );
          }
        });
        console.log("최종 쿼리 파라미터:", queryParams.toString());
        console.log("==========================================");
      }

      if (memberEmail) {
        queryParams.append("memberEmail", memberEmail);
      }

      const response = await fetch(
        `${backendUrl}/api/property/map?${queryParams.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`Property 매물 데이터 (${propertyType}):`, data);
        console.log("백엔드 응답 전체 구조:", JSON.stringify(data, null, 2));
        console.log("페이징 정보:", {
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          currentPage: data.currentPage,
          size: data.size,
        });
        console.log("매물 개수:", data.content ? data.content.length : "content 없음");
        console.log("전체 매물 수:", data.totalElements);
        console.log("전체 페이지 수:", data.totalPages);

        // 페이징 정보 설정 - 백엔드의 페이징 정보를 우선적으로 사용
        if (data.totalPages !== undefined && data.totalElements !== undefined) {
          // 백엔드에서 페이징 정보를 제공하는 경우
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
          setCurrentPage(page);
          console.log("백엔드 페이징 정보 사용:", {
            totalPages: data.totalPages,
            totalElements: data.totalElements,
            currentPage: page,
          });
        } else {
          // 페이징 정보가 없는 경우 기본값 설정
          const estimatedPages = Math.ceil(
            (data.content?.length || data.length) / pageSize
          );
          setTotalPages(Math.max(estimatedPages, 1));
          setTotalElements(data.content?.length || data.length || 0);
          setCurrentPage(1);
          console.log("기본 페이징 상태 설정:", {
            totalPages: Math.max(estimatedPages, 1),
            totalElements: data.content?.length || data.length || 0,
            currentPage: 1,
          });
        }

        // 지도 표시용으로 데이터 변환
        const mapData = data.content
          ? data.content.map((item) => {
              // 주소 정보 검증 및 정리
              const cleanAddress = (() => {
                const address = item.roadAddress || item.address;
                if (address && address !== "주소 정보 없음" && address !== "." && address.trim() !== "") {
                  return address.trim();
                }
                return "주소 정보 없음";
              })();

              return {
              id: item.id,
              name: item.title || `매물 ${item.id}`,
                location: cleanAddress,
              price: item.price || "가격 정보 없음",
              area: item.area || 0,
              transactionType: item.propertyType || "기타",
              x: item.longitude || 127.0, // 경도 (기본값: 서울)
              y: item.latitude || 37.5, // 위도 (기본값: 서울)
              floor: item.floor || 0,
              roomCount: item.rooms || 0,
              buildYear: item.yearBuilt || 0,
              content: item.content || "",
              writer: item.writer || "익명",
              imageUrls: item.imageUrls || [],
              transactionStatus: item.transactionStatus,
              status: item.status,
              isLiked: item.isLiked || false, // 좋아요 상태 추가
                // 추가옵션 필드들 추가
                elevator: item.elevator,
                airConditioner: item.airConditioner,
                washingMachine: item.washingMachine,
                induction: item.induction,
                balcony: item.balcony,
                shoeCabinet: item.shoeCabinet,
                bathtub: item.bathtub,
                wardrobe: item.wardrobe,
                tv: item.tv,
                refrigerator: item.refrigerator,
                sink: item.sink,
                fireAlarm: item.fireAlarm,
                parking: item.parking,
                petFriendly: item.petAllowed,
              };
            })
          : data.map((item) => {
              // 주소 정보 검증 및 정리
              const cleanAddress = (() => {
                const address = item.roadAddress || item.address;
                if (address && address !== "주소 정보 없음" && address !== "." && address.trim() !== "") {
                  return address.trim();
                }
                return "주소 정보 없음";
              })();

              return {
              id: item.id,
              name: item.title || `매물 ${item.id}`,
                location: cleanAddress,
              price: item.price || "가격 정보 없음",
              area: item.area || 0,
              transactionType: item.propertyType || "기타",
              x: item.longitude || 127.0, // 경도 (기본값: 서울)
              y: item.latitude || 37.5, // 위도 (기본값: 서울)
              floor: item.floor || 0,
              roomCount: item.rooms || 0,
              buildYear: item.yearBuilt || 0,
              content: item.content || "",
              writer: item.writer || "익명",
              imageUrls: item.imageUrls || [],
              transactionStatus: item.transactionStatus,
              status: item.status,
              isLiked: item.isLiked || false, // 좋아요 상태 추가
                // 추가옵션 필드들 추가
                elevator: item.elevator,
                airConditioner: item.airConditioner,
                washingMachine: item.washingMachine,
                induction: item.induction,
                balcony: item.balcony,
                shoeCabinet: item.shoeCabinet,
                bathtub: item.bathtub,
                wardrobe: item.wardrobe,
                tv: item.tv,
                refrigerator: item.refrigerator,
                sink: item.sink,
                fireAlarm: item.fireAlarm,
                parking: item.parking,
                petFriendly: item.petAllowed,
              };
            });

        // 추가옵션 필터가 적용된 경우 프론트엔드에서 추가 필터링
        let filteredMapData = mapData;
        if (additionalFilters.options && additionalFilters.options.length > 0) {
          const selectedOptions = additionalFilters.options;
          filteredMapData = mapData.filter((property) => {
            // 매물이 선택된 옵션 중 하나라도 가지고 있는지 확인
            return selectedOptions.some(option => {
              // 옵션 값이 true, "가능", "Y", 1 등인지 확인하는 헬퍼 함수
              const hasOptionValue = (value) => {
                if (value === true || value === 1) return true;
                if (typeof value === 'string') {
                  const lowerValue = value.toLowerCase().trim();
                  return lowerValue === '가능' || lowerValue === 'y' || lowerValue === 'yes' || lowerValue === '있음';
                }
                return false;
              };

              switch (option) {
                case 'elevator':
                  return hasOptionValue(property.elevator);
                case 'airConditioner':
                  return hasOptionValue(property.airConditioner);
                case 'washingMachine':
                  return hasOptionValue(property.washingMachine);
                case 'induction':
                  return hasOptionValue(property.induction);
                case 'balcony':
                  return hasOptionValue(property.balcony);
                case 'shoeCabinet':
                  return hasOptionValue(property.shoeCabinet);
                case 'bathtub':
                  return hasOptionValue(property.bathtub);
                case 'wardrobe':
                  return hasOptionValue(property.wardrobe);
                case 'tv':
                  return hasOptionValue(property.tv);
                case 'refrigerator':
                  return hasOptionValue(property.refrigerator);
                case 'sink':
                  return hasOptionValue(property.sink);
                case 'fireAlarm':
                  return hasOptionValue(property.fireAlarm);
                case 'parking':
                  return hasOptionValue(property.parking);
                case 'petFriendly':
                  return hasOptionValue(property.petFriendly);
                default:
                  return false;
              }
            });
          });
          console.log("fetchPropertyDataByType 추가옵션 프론트엔드 필터링 결과:", {
            원본: mapData.length,
            필터링후: filteredMapData.length,
            선택된옵션: selectedOptions
          });
          
          // 추가옵션 필터가 적용된 경우에만 프론트엔드 페이징 정보 업데이트
          const totalFilteredElements = filteredMapData.length;
          const totalFilteredPages = Math.ceil(totalFilteredElements / pageSize);
          
          setTotalPages(totalFilteredPages);
          setTotalElements(totalFilteredElements);
          setCurrentPage(1);
          console.log("추가옵션 필터로 인한 프론트엔드 페이징 적용:", {
            totalPages: totalFilteredPages,
            totalElements: totalFilteredElements,
            currentPage: 1
          });
        }
        // 추가옵션 필터가 없는 경우 백엔드의 원래 페이징 정보 유지 (이미 위에서 설정됨)

        // 거래 상태에 따라 정렬: 거래 진행중인 매물을 먼저, 거래완료된 매물을 나중에
        const sortedMapData = filteredMapData.sort((a, b) => {
          const aIsCompleted =
            a.transactionStatus === 0 || a.status === "거래완료";
          const bIsCompleted =
            b.transactionStatus === 0 || b.status === "거래완료";

          if (aIsCompleted === bIsCompleted) {
            return 0; // 둘 다 같으면 원래 순서 유지
          }
          return aIsCompleted ? 1 : -1; // 거래완료된 매물을 뒤로
        });

        setFilteredProperties(sortedMapData);
        setShowPropertyList(true);

        // 지도에 마커 표시
        if (map && sortedMapData.length > 0) {
          displayPropertyMarkers(sortedMapData);
        }
      } else {
        console.error(
          `Property 매물 데이터 가져오기 실패 (${propertyType}):`,
          response.status,
          response.statusText
        );

        // 응답 내용 확인
        const responseText = await response.text();
        console.error("응답 내용:", responseText);

        setFilteredProperties([]);
        setShowPropertyList(true);
      }
    } catch (error) {
      console.error(
        `Property 매물 데이터 가져오기 오류 (${propertyType}):`,
        error
      );

      // 네트워크 오류인지 확인
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        console.error(
          "백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요."
        );
      }

      setFilteredProperties([]);
      setShowPropertyList(true);
    }
  };

  // 거래 유형 선택 처리
  const handleTransactionTypeClick = (transactionType) => {
    setSelectedTransactionType(transactionType);
    setCurrentPage(1); // 첫 페이지로 리셋

    // 현재 활성화된 필터 정보 구성
    const currentFilters = {};
    if (filterForm.areaMin) currentFilters.areaMin = filterForm.areaMin;
    if (filterForm.areaMax) currentFilters.areaMax = filterForm.areaMax;
    if (filterForm.roomCount) currentFilters.roomCount = filterForm.roomCount;
    if (filterForm.bathroomCount)
      currentFilters.bathroomCount = filterForm.bathroomCount;
    if (filterForm.floor) currentFilters.floor = filterForm.floor;
    if (filterForm.completionYearMin)
      currentFilters.yearBuiltMin = filterForm.completionYearMin;
    if (filterForm.completionYearMax)
      currentFilters.yearBuiltMax = filterForm.completionYearMax;

    if (selectedPropertyType === "전체") {
      fetchPropertyData(1, transactionType, currentFilters);
    } else {
      // 특정 매물 유형 선택 시 해당 유형으로 필터링
      fetchPropertyDataByType(
        selectedPropertyType,
        1,
        transactionType,
        currentFilters
      );
    }
  };

  // Property 매물 데이터 가져오기
  const fetchPropertyData = async (
    page = 1,
    transactionType = "전체",
    additionalFilters = {}
  ) => {
    try {
      setFilteredProperties([]); // 로딩 중 빈 배열로 설정

      // 현재 사용자 정보 가져오기
      const currentUser = getCurrentUser();
      const memberEmail = currentUser ? currentUser.email : null;

      // 백엔드 서버 주소 (환경변수 또는 기본값)
      const backendUrl =
        process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

      // 사용자 이메일을 쿼리 파라미터에 추가
      const queryParams = new URLSearchParams({
        page: (page - 1).toString(),
        size: pageSize.toString(),
        transactionType: transactionType,
      });

      // 추가 필터 파라미터들을 쿼리에 추가
      if (additionalFilters) {
        console.log("=== fetchPropertyData - additionalFilters ===");
        console.log("additionalFilters:", additionalFilters);
        Object.keys(additionalFilters).forEach((key) => {
          if (
            additionalFilters[key] !== null &&
            additionalFilters[key] !== undefined &&
            additionalFilters[key] !== ""
          ) {
            queryParams.append(key, additionalFilters[key]);
            console.log(
              `쿼리 파라미터 추가: ${key} = ${additionalFilters[key]}`
            );
          }
        });
        console.log("최종 쿼리 파라미터:", queryParams.toString());
        console.log("==========================================");
      }

      if (memberEmail) {
        queryParams.append("memberEmail", memberEmail);
      }

      const response = await fetch(
        `${backendUrl}/api/property/map?${queryParams.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Property 매물 데이터:", data);
        console.log("백엔드 응답 전체 구조:", JSON.stringify(data, null, 2));
        console.log("페이징 정보:", {
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          currentPage: data.currentPage,
          size: data.size,
        });
        console.log("매물 개수:", data.content ? data.content.length : "content 없음");
        console.log("전체 매물 수:", data.totalElements);
        console.log("전체 페이지 수:", data.totalPages);

        // 페이징 정보 설정 - 백엔드의 페이징 정보를 우선적으로 사용
        if (data.totalPages !== undefined && data.totalElements !== undefined) {
          // 백엔드에서 페이징 정보를 제공하는 경우
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
          setCurrentPage(page);
          console.log("백엔드 페이징 정보 사용:", {
            totalPages: data.totalPages,
            totalElements: data.totalElements,
            currentPage: page,
          });
        } else {
          // 페이징 정보가 없는 경우 기본값 설정
          const estimatedPages = Math.ceil(
            (data.content?.length || data.length) / pageSize
          );
          setTotalPages(Math.max(estimatedPages, 1));
          setTotalElements(data.content?.length || data.length || 0);
          setCurrentPage(1);
          console.log("기본 페이징 상태 설정:", {
            totalPages: Math.max(estimatedPages, 1),
            totalElements: data.content?.length || data.length || 0,
            currentPage: 1,
          });
        }

        // 지도 표시용으로 데이터 변환
        const mapData = data.content
          ? data.content.map((item) => {
              // 주소 정보 검증 및 정리
              const cleanAddress = (() => {
                const address = item.roadAddress || item.address;
                if (address && address !== "주소 정보 없음" && address !== "." && address.trim() !== "") {
                  return address.trim();
                }
                return "주소 정보 없음";
              })();

              return {
              id: item.id,
              name: item.title || `매물 ${item.id}`,
                location: cleanAddress,
              price: item.price || "가격 정보 없음",
              area: item.area || 0,
              transactionType: item.propertyType || "기타",
              x: item.longitude || 127.0, // 경도 (기본값: 서울)
              y: item.latitude || 37.5, // 위도 (기본값: 서울)
              floor: item.floor || 0,
              roomCount: item.rooms || 0,
              buildYear: item.yearBuilt || 0,
              content: item.content || "",
              writer: item.writer || "익명",
              imageUrls: item.imageUrls || [],
              transactionStatus: item.transactionStatus,
              status: item.status,
              isLiked: item.isLiked || false, // 좋아요 상태 추가
                // 추가옵션 필드들 추가
                elevator: item.elevator,
                airConditioner: item.airConditioner,
                washingMachine: item.washingMachine,
                induction: item.induction,
                balcony: item.balcony,
                shoeCabinet: item.shoeCabinet,
                bathtub: item.bathtub,
                wardrobe: item.wardrobe,
                tv: item.tv,
                refrigerator: item.refrigerator,
                sink: item.sink,
                fireAlarm: item.fireAlarm,
                parking: item.parking,
                petFriendly: item.petAllowed,
              };
            })
          : data.map((item) => {
              // 주소 정보 검증 및 정리
              const cleanAddress = (() => {
                const address = item.roadAddress || item.address;
                if (address && address !== "주소 정보 없음" && address !== "." && address.trim() !== "") {
                  return address.trim();
                }
                return "주소 정보 없음";
              })();

              return {
              id: item.id,
              name: item.title || `매물 ${item.id}`,
                location: cleanAddress,
              price: item.price || "가격 정보 없음",
              area: item.area || 0,
              transactionType: item.propertyType || "기타",
              x: item.longitude || 127.0, // 경도 (기본값: 서울)
              y: item.latitude || 37.5, // 위도 (기본값: 서울)
              floor: item.floor || 0,
              roomCount: item.rooms || 0,
              buildYear: item.yearBuilt || 0,
              content: item.content || "",
              writer: item.writer || "익명",
              imageUrls: item.imageUrls || [],
              transactionStatus: item.transactionStatus,
              status: item.status,
              isLiked: item.isLiked || false, // 좋아요 상태 추가
                // 추가옵션 필드들 추가
                elevator: item.elevator,
                airConditioner: item.airConditioner,
                washingMachine: item.washingMachine,
                induction: item.induction,
                balcony: item.balcony,
                shoeCabinet: item.shoeCabinet,
                bathtub: item.bathtub,
                wardrobe: item.wardrobe,
                tv: item.tv,
                refrigerator: item.refrigerator,
                sink: item.sink,
                fireAlarm: item.fireAlarm,
                parking: item.parking,
                petFriendly: item.petAllowed,
              };
            });

        // 추가옵션 필터가 적용된 경우 프론트엔드에서 추가 필터링
        let filteredMapData = mapData;
        if (additionalFilters.options && additionalFilters.options.length > 0) {
          const selectedOptions = additionalFilters.options;
          filteredMapData = mapData.filter((property) => {
            // 매물이 선택된 옵션 중 하나라도 가지고 있는지 확인
            return selectedOptions.some(option => {
              // 옵션 값이 true, "가능", "Y", 1 등인지 확인하는 헬퍼 함수
              const hasOptionValue = (value) => {
                if (value === true || value === 1) return true;
                if (typeof value === 'string') {
                  const lowerValue = value.toLowerCase().trim();
                  return lowerValue === '가능' || lowerValue === 'y' || lowerValue === 'yes' || lowerValue === '있음';
                }
                return false;
              };

              switch (option) {
                case 'elevator':
                  return hasOptionValue(property.elevator);
                case 'airConditioner':
                  return hasOptionValue(property.airConditioner);
                case 'washingMachine':
                  return hasOptionValue(property.washingMachine);
                case 'induction':
                  return hasOptionValue(property.induction);
                case 'balcony':
                  return hasOptionValue(property.balcony);
                case 'shoeCabinet':
                  return hasOptionValue(property.shoeCabinet);
                case 'bathtub':
                  return hasOptionValue(property.bathtub);
                case 'wardrobe':
                  return hasOptionValue(property.wardrobe);
                case 'tv':
                  return hasOptionValue(property.tv);
                case 'refrigerator':
                  return hasOptionValue(property.refrigerator);
                case 'sink':
                  return hasOptionValue(property.sink);
                case 'fireAlarm':
                  return hasOptionValue(property.fireAlarm);
                case 'parking':
                  return hasOptionValue(property.parking);
                case 'petFriendly':
                  return hasOptionValue(property.petFriendly);
                default:
                  return false;
              }
            });
          });
          console.log("fetchPropertyData 추가옵션 프론트엔드 필터링 결과:", {
            원본: mapData.length,
            필터링후: filteredMapData.length,
            선택된옵션: selectedOptions
          });
        }

        // 거래 상태에 따라 정렬: 거래 진행중인 매물을 먼저, 거래완료된 매물을 나중에
        const sortedMapData = filteredMapData.sort((a, b) => {
          const aIsCompleted =
            a.transactionStatus === 0 || a.status === "거래완료";
          const bIsCompleted =
            b.transactionStatus === 0 || b.status === "거래완료";

          if (aIsCompleted === bIsCompleted) {
            return 0; // 둘 다 같으면 원래 순서 유지
          }
          return aIsCompleted ? 1 : -1; // 거래완료된 매물을 뒤로
        });

        setFilteredProperties(sortedMapData);
        setShowPropertyList(true);

        // 지도에 마커 표시
        if (map && sortedMapData.length > 0) {
          displayPropertyMarkers(sortedMapData);
        }
      } else {
        console.error(
          "Property 매물 데이터 가져오기 실패:",
          response.status,
          response.statusText
        );

        // 응답 내용 확인
        const responseText = await response.text();
        console.error("응답 내용:", responseText);

        setFilteredProperties([]);
        setShowPropertyList(true);
      }
    } catch (error) {
      console.error("Property 매물 데이터 가져오기 오류:", error);

      // 네트워크 오류인지 확인
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        console.error(
          "백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요."
        );
      }

      setFilteredProperties([]);
      setShowPropertyList(true);
    }
  };

  // 지도에 매물 마커 표시
  const displayPropertyMarkers = (properties) => {
    // 기존 마커들 제거
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);

    const newMarkers = [];
    const bounds = new window.kakao.maps.LatLngBounds();

    properties.forEach((property) => {
      if (property.y && property.x) {
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(property.y, property.x),
          map: map,
        });

        // 마커 클릭 시 정보창 표시
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `
            <div style="padding:10px;min-width:250px;">
              <h3 style="margin:0 0 8px 0;color:#1f2937;">${property.name}</h3>
              <p style="margin:4px 0;color:#6b7280;">${property.location}</p>
              <p style="margin:4px 0;color:#3b82f6;font-weight:600;">
                ${formatAmountToKorean(property.price)}
              </p>
              <p style="margin:4px 0;color:#374151;">면적: ${
                property.area
              }㎡</p>
              <p style="margin:4px 0;color:#374151;">거래유형: ${
                property.transactionType
              }</p>
              <p style="margin:4px 0;color:#374151;">작성자: ${
                property.writer
              }</p>
            </div>
          `,
        });

        window.kakao.maps.event.addListener(marker, "click", () => {
          infowindow.open(map, marker);
        });

        newMarkers.push(marker);
        bounds.extend(new window.kakao.maps.LatLng(property.y, property.x));
      }
    });

    setMarkers(newMarkers);

    // 모든 마커가 지도에 보이도록 범위 조정
    if (newMarkers.length > 0) {
      map.setBounds(bounds);
    }
  };

  // 4) 필터 토글
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // 5) 필터 입력 처리
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 6) 필터 옵션 클릭 처리
  const handleFilterOptionClick = (field, value) => {
    setFilterForm((prev) => ({
      ...prev,
      [field]: prev[field] === value ? "" : value,
    }));
  };

  // 매물 클릭 핸들러
  const handlePropertyClick = (property) => {
    // 이전 상태 완전 초기화
    setSelectedProperty(null);
    setCurrentImageIndex(0);
    setIsImageModalOpen(false);
    setModalInitialIndex(0);

    // 새로운 매물 선택
    setTimeout(() => {
      setSelectedProperty(property);
    }, 0);
  };

  // 좋아요 클릭 핸들러
  const handleLikeClick = async (propertyId) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.email) {
        alert("로그인이 필요합니다.");
        return;
      }

      await likeProperty(propertyId, currentUser.email);

      // 매물 목록 새로고침하여 좋아요 상태 업데이트
      // 현재 활성화된 필터 정보 구성
      const currentFilters = {};
      if (filterForm.areaMin) currentFilters.areaMin = filterForm.areaMin;
      if (filterForm.areaMax) currentFilters.areaMax = filterForm.areaMax;
      if (filterForm.roomCount) currentFilters.roomCount = filterForm.roomCount;
      if (filterForm.bathroomCount)
        currentFilters.bathroomCount = filterForm.bathroomCount;
      if (filterForm.floor) currentFilters.floor = filterForm.floor;
      if (filterForm.completionYearMin)
        currentFilters.yearBuiltMin = filterForm.completionYearMin;
      if (filterForm.completionYearMax)
        currentFilters.yearBuiltMax = filterForm.completionYearMax;

      if (selectedPropertyType === "전체") {
        fetchPropertyData(currentPage, "전체", currentFilters);
      } else {
        fetchPropertyDataByType(
          selectedPropertyType,
          currentPage,
          "전체",
          currentFilters
        );
      }

      // alert 제거 - 좋아요 상태가 시각적으로 변경되어 사용자가 알 수 있음
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  // 페이지 변경 처리
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);

    // 현재 활성화된 필터 정보 구성
    const currentFilters = {};
    if (filterForm.areaMin) currentFilters.areaMin = filterForm.areaMin;
    if (filterForm.areaMax) currentFilters.areaMax = filterForm.areaMax;
    if (filterForm.roomCount) currentFilters.roomCount = filterForm.roomCount;
    if (filterForm.bathroomCount)
      currentFilters.bathroomCount = filterForm.bathroomCount;
    if (filterForm.floor) currentFilters.floor = filterForm.floor;
    if (filterForm.completionYearMin)
      currentFilters.yearBuiltMin = filterForm.completionYearMin;
    if (filterForm.completionYearMax)
      currentFilters.yearBuiltMax = filterForm.completionYearMax;

    if (selectedPropertyType === "전체") {
      fetchPropertyData(newPage, "전체", currentFilters);
    } else {
      // 특정 매물 유형 선택 시 해당 유형으로 필터링
      fetchPropertyDataByType(
        selectedPropertyType,
        newPage,
        "전체",
        currentFilters
      );
    }
  };

  // 필터 적용 시 첫 페이지로 이동
  const applyFilters = () => {
    setCurrentPage(1); // 첫 페이지로 리셋

    // 현재 활성화된 필터 정보 구성
    const currentFilters = {};
    if (filterForm.areaMin) currentFilters.areaMin = filterForm.areaMin;
    if (filterForm.areaMax) currentFilters.areaMax = filterForm.areaMax;
    if (filterForm.roomCount) currentFilters.roomCount = filterForm.roomCount;
    if (filterForm.bathroomCount)
      currentFilters.bathroomCount = filterForm.bathroomCount;
    if (filterForm.floor) currentFilters.floor = filterForm.floor;
    if (filterForm.completionYearMin)
      currentFilters.yearBuiltMin = filterForm.completionYearMin;
    if (filterForm.completionYearMax)
      currentFilters.yearBuiltMax = filterForm.completionYearMax;

    if (selectedPropertyType === "전체") {
      fetchPropertyData(1, "전체", currentFilters);
    } else {
      // 특정 매물 유형 선택 시 해당 유형으로 필터링
      fetchPropertyDataByType(selectedPropertyType, 1, "전체", currentFilters);
    }
    setShowFilters(false);
  };

  // 8) 필터 초기화
  const resetFilters = () => {
    setFilterForm({
      transactionType: "",
      rentType: "",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      roomCount: "",
    });
    setSelectedTransactionType("전체"); // 거래 유형도 전체로 초기화
    setFilteredProperties([]);
    setShowPropertyList(false);
  };

  // nav바 필터 적용 로직
  const applyNavBarFilters = async (appliedFilters) => {
    console.log("Navbar filters applied:", appliedFilters);
    const { transactionTypes, additionalOptions } = appliedFilters;
    
    // filterForm에서 선택된 추가옵션들을 추출
    const selectedAdditionalOptions = [];
    if (filterForm.elevator) selectedAdditionalOptions.push('elevator');
    if (filterForm.airConditioner) selectedAdditionalOptions.push('airConditioner');
    if (filterForm.washingMachine) selectedAdditionalOptions.push('washingMachine');
    if (filterForm.induction) selectedAdditionalOptions.push('induction');
    if (filterForm.balcony) selectedAdditionalOptions.push('balcony');
    if (filterForm.shoeCabinet) selectedAdditionalOptions.push('shoeCabinet');
    if (filterForm.bathtub) selectedAdditionalOptions.push('bathtub');
    if (filterForm.wardrobe) selectedAdditionalOptions.push('wardrobe');
    if (filterForm.tv) selectedAdditionalOptions.push('tv');
    if (filterForm.refrigerator) selectedAdditionalOptions.push('refrigerator');
    if (filterForm.sink) selectedAdditionalOptions.push('sink');
    if (filterForm.fireAlarm) selectedAdditionalOptions.push('fireAlarm');
    if (filterForm.parking) selectedAdditionalOptions.push('parking');
    if (filterForm.petFriendly) selectedAdditionalOptions.push('petFriendly');

    // nav바 필터의 transactionTypes를 백엔드 API 형식으로 변환
    let apiTransactionType = "전체";

    if (transactionTypes && transactionTypes.length > 0) {
      // 선택된 거래 유형이 있는 경우
      const hasRent =
        transactionTypes.includes("월세") || transactionTypes.includes("전세");
      const hasSale = transactionTypes.includes("매매");

      if (hasRent && hasSale) {
        // 월세/전세와 매매가 모두 선택된 경우
        apiTransactionType = "전체";
      } else if (hasRent && !hasSale) {
        // 월세나 전세만 선택된 경우 (매매 제외) - 각각 개별로 처리
        if (
          transactionTypes.includes("월세") &&
          transactionTypes.includes("전세")
        ) {
          // 월세와 전세 모두 선택된 경우
          apiTransactionType = "전/월세";
        } else if (transactionTypes.includes("월세")) {
          // 월세만 선택된 경우
          apiTransactionType = "월세";
        } else if (transactionTypes.includes("전세")) {
          // 전세만 선택된 경우
          apiTransactionType = "전세";
        }
      } else if (hasSale && !hasRent) {
        // 매매만 선택된 경우 (월세/전세 제외)
        apiTransactionType = "매매";
      }
    }

    console.log("변환된 거래 유형:", apiTransactionType);
    console.log("선택된 거래 유형들:", transactionTypes);
    console.log("선택된 추가옵션:", selectedAdditionalOptions);

    // 상세 필터 조건 구성
    const additionalFilters = {};

    if (transactionTypes && transactionTypes.length > 0) {
      if (transactionTypes.includes("월세")) {
        if (filterForm.depositMin)
          additionalFilters.depositMin = filterForm.depositMin;
        if (filterForm.depositMax)
          additionalFilters.depositMax = filterForm.depositMax;
        if (filterForm.monthlyRentMin)
          additionalFilters.monthlyRentMin = filterForm.monthlyRentMin;
        if (filterForm.monthlyRentMax)
          additionalFilters.monthlyRentMax = filterForm.monthlyRentMax;
      }
      if (transactionTypes.includes("전세")) {
        if (filterForm.jeonseMin)
          additionalFilters.jeonseMin = filterForm.jeonseMin;
        if (filterForm.jeonseMax)
          additionalFilters.jeonseMax = filterForm.jeonseMax;
      }
      if (transactionTypes.includes("매매")) {
        if (filterForm.saleMin) additionalFilters.saleMin = filterForm.saleMin;
        if (filterForm.saleMax) additionalFilters.saleMax = filterForm.saleMax;
      }
    }

    // 면적 필터 추가
    if (filterForm.areaMin) additionalFilters.areaMin = filterForm.areaMin;
    if (filterForm.areaMax) additionalFilters.areaMax = filterForm.areaMax;

    // 방 개수 필터 추가
    if (filterForm.roomCount)
      additionalFilters.roomCount = filterForm.roomCount;

    // 화장실 개수 필터 추가
    if (filterForm.bathroomCount)
      additionalFilters.bathroomCount = filterForm.bathroomCount;

    // 층수 필터 추가
    if (filterForm.floor) additionalFilters.floor = filterForm.floor;

    // 준공년도 필터 추가
    if (filterForm.completionYearMin)
      additionalFilters.yearBuiltMin = filterForm.completionYearMin;
    if (filterForm.completionYearMax)
      additionalFilters.yearBuiltMax = filterForm.completionYearMax;

    // 사용자 조건 필터 추가 (최대 구매 가능액)
    if (isUserConditionFilterActive && userMaxPurchaseAmount) {
      additionalFilters.maxPrice = userMaxPurchaseAmount;
      console.log("사용자 조건 필터 적용:", {
        maxPrice: userMaxPurchaseAmount,
      });
    }

    // 추가옵션 필터 추가 - filterForm에서 직접 추출한 옵션 사용
    if (selectedAdditionalOptions.length > 0) {
      additionalFilters.options = selectedAdditionalOptions;
      console.log("추가옵션 필터 적용:", selectedAdditionalOptions);
    }

    // filterForm의 현재 상태 로깅
    console.log("현재 filterForm 상태:", {
      elevator: filterForm.elevator,
      airConditioner: filterForm.airConditioner,
      washingMachine: filterForm.washingMachine,
      induction: filterForm.induction,
      balcony: filterForm.balcony,
      shoeCabinet: filterForm.shoeCabinet,
      bathtub: filterForm.bathtub,
      wardrobe: filterForm.wardrobe,
      tv: filterForm.tv,
      refrigerator: filterForm.refrigerator,
      sink: filterForm.sink,
      fireAlarm: filterForm.fireAlarm,
      parking: filterForm.parking,
      petFriendly: filterForm.petFriendly
    });

    // 현재 선택된 매물 유형에 따라 API 호출
    if (selectedPropertyType === "전체") {
      fetchPropertyData(1, apiTransactionType, additionalFilters);
    } else {
      fetchPropertyDataByType(
        selectedPropertyType,
        1,
        apiTransactionType,
        additionalFilters
      );
    }

    // 추가옵션 필터가 적용된 경우, 필터링된 결과의 실제 개수를 반영
    if (selectedAdditionalOptions.length > 0) {
      // 백엔드 응답을 기다린 후 프론트엔드에서 추가 필터링하여 실제 개수 업데이트
      setTimeout(() => {
        // 현재 표시된 매물들 중에서 추가옵션 필터를 만족하는 매물만 카운트
        console.log("=== 추가옵션 필터링 디버깅 ===");
        console.log("선택된 옵션들:", selectedAdditionalOptions);
        console.log("전체 매물 수:", filteredProperties.length);
        
        // 첫 번째 매물의 추가옵션 필드 값 확인
        if (filteredProperties.length > 0) {
          const firstProperty = filteredProperties[0];
          console.log("첫 번째 매물 추가옵션 필드:", {
            id: firstProperty.id,
            title: firstProperty.title,
            parking: firstProperty.parking,
            petFriendly: firstProperty.petFriendly,
            elevator: firstProperty.elevator,
            airConditioner: firstProperty.airConditioner
          });
        }
        
        console.log("=== 필터링 시작 ===");
        console.log("필터링할 매물들:", filteredProperties.map(p => ({ id: p.id, parking: p.parking, petFriendly: p.petFriendly })));
        console.log("선택된 옵션들:", selectedAdditionalOptions);
        
        const filteredCount = filteredProperties.filter(property => {
          // 매물이 선택된 옵션 중 하나라도 가지고 있는지 확인
          const result = selectedAdditionalOptions.some(option => {
            // 옵션 값이 true, "가능", "Y", 1 등인지 확인하는 헬퍼 함수
            const hasOptionValue = (value) => {
              // null, undefined, 빈 문자열은 "불가능"으로 간주 (정보가 없는 경우)
              if (value === null || value === undefined || value === '') return false;
              if (value === true || value === 1) return true;
              if (typeof value === 'string') {
                const lowerValue = value.toLowerCase().trim();
                // 문자열 "true"는 true로 간주
                if (lowerValue === 'true') return true;
                // 문자열 "false"는 false로 간주
                if (lowerValue === 'false') return false;
                return lowerValue === 'y' || lowerValue === 'yes' || lowerValue === '있음';
              }
              return false;
            };

            let optionResult = false;
            switch (option) {
              case 'elevator':
                optionResult = hasOptionValue(property.elevator);
                break;
              case 'airConditioner':
                optionResult = hasOptionValue(property.airConditioner);
                break;
              case 'washingMachine':
                optionResult = hasOptionValue(property.washingMachine);
                break;
              case 'induction':
                optionResult = hasOptionValue(property.induction);
                break;
              case 'balcony':
                optionResult = hasOptionValue(property.balcony);
                break;
              case 'shoeCabinet':
                optionResult = hasOptionValue(property.shoeCabinet);
                break;
              case 'bathtub':
                optionResult = hasOptionValue(property.bathtub);
                break;
              case 'wardrobe':
                optionResult = hasOptionValue(property.wardrobe);
                break;
              case 'tv':
                optionResult = hasOptionValue(property.tv);
                break;
              case 'refrigerator':
                optionResult = hasOptionValue(property.refrigerator);
                break;
              case 'sink':
                optionResult = hasOptionValue(property.sink);
                break;
              case 'fireAlarm':
                optionResult = hasOptionValue(property.fireAlarm);
                break;
              case 'parking':
                // 편의시설 옵션과 동일한 방식으로 처리
                optionResult = hasOptionValue(property.parking);
                console.log(`매물 ${property.id} parking 필터 결과:`, {
                  option: 'parking',
                  value: property.parking,
                  result: optionResult
                });
                break;
              case 'petFriendly':
                // 편의시설 옵션과 동일한 방식으로 처리
                optionResult = hasOptionValue(property.petFriendly);
                console.log(`매물 ${property.id} petFriendly 필터 결과:`, {
                  option: 'petFriendly',
                  value: property.petFriendly,
                  result: optionResult
                });
                break;
              default:
                optionResult = false;
            }
            return optionResult;
          });
          
          if (property.id <= 3) { // 처음 3개 매물만 로그
            console.log(`매물 ${property.id} 최종 필터 결과:`, {
              parking: property.parking,
              petFriendly: property.petFriendly,
              result: result
            });
          }
          
          return result;
        }).length;

        // 필터링된 결과를 실제 filteredProperties에 반영
        const filteredPropertiesList = filteredProperties.filter(property => {
          // 매물이 선택된 옵션 중 하나라도 가지고 있는지 확인
          return selectedAdditionalOptions.some(option => {
            let optionResult = false;
            
            // 옵션 값이 true, "가능", "Y", 1 등인지 확인하는 헬퍼 함수
            const hasOptionValue = (value) => {
              // null, undefined, 빈 문자열은 "불가능"으로 간주 (정보가 없는 경우)
              if (value === null || value === undefined || value === '') return false;
              if (value === true || value === 1) return true;
              if (typeof value === 'string') {
                const lowerValue = value.toLowerCase().trim();
                // 문자열 "true"는 true로 간주
                if (lowerValue === 'true') return true;
                // 문자열 "false"는 false로 간주
                if (lowerValue === 'false') return false;
                return lowerValue === 'y' || lowerValue === 'yes' || lowerValue === '있음';
              }
              return false;
            };
            
            switch (option) {
              case 'elevator':
                optionResult = hasOptionValue(property.elevator);
                break;
              case 'airConditioner':
                optionResult = hasOptionValue(property.airConditioner);
                break;
              case 'washingMachine':
                optionResult = hasOptionValue(property.washingMachine);
                break;
              case 'induction':
                optionResult = hasOptionValue(property.induction);
                break;
              case 'balcony':
                optionResult = hasOptionValue(property.balcony);
                break;
              case 'shoeCabinet':
                optionResult = hasOptionValue(property.shoeCabinet);
                break;
              case 'bathtub':
                optionResult = hasOptionValue(property.bathtub);
                break;
              case 'wardrobe':
                optionResult = hasOptionValue(property.wardrobe);
                break;
              case 'tv':
                optionResult = hasOptionValue(property.tv);
                break;
              case 'refrigerator':
                optionResult = hasOptionValue(property.refrigerator);
                break;
              case 'sink':
                optionResult = hasOptionValue(property.sink);
                break;
              case 'fireAlarm':
                optionResult = hasOptionValue(property.fireAlarm);
                break;
              case 'parking':
                // 편의시설 옵션과 동일한 방식으로 처리
                optionResult = hasOptionValue(property.parking);
                break;
              case 'petFriendly':
                // 편의시설 옵션과 동일한 방식으로 처리
                optionResult = hasOptionValue(property.petFriendly);
                break;
              default:
                optionResult = false;
            }
            return optionResult;
          });
        });
        
        // 필터링된 결과를 실제 상태에 반영
        setFilteredProperties(filteredPropertiesList);
        
        // 필터링된 결과의 실제 개수로 업데이트
        setTotalElements(filteredPropertiesList.length);
        setTotalPages(Math.ceil(filteredPropertiesList.length / pageSize));
        setCurrentPage(1);
        
        console.log("필터링 결과:", {
          원본매물수: filteredProperties.length,
          필터링후매물수: filteredPropertiesList.length,
          총페이지수: Math.ceil(filteredPropertiesList.length / pageSize)
        });
        console.log("=== 디버깅 완료 ===");
      }, 100); // 백엔드 응답을 기다리기 위한 지연
    }

    // 콘솔에 상세 정보 출력
    console.log("=== 필터 적용 상세 정보 ===");
    console.log("선택된 매물 유형:", selectedPropertyType);
    console.log("선택된 거래 유형들:", transactionTypes);
    console.log("API 호출 거래 유형:", apiTransactionType);
    console.log("선택된 추가옵션:", additionalOptions);
    console.log("========================");

    // 추가: 각 거래 유형별 상세 조건도 콘솔에 출력
    if (transactionTypes && transactionTypes.length > 0) {
      console.log("=== 상세 필터 조건 ===");
      if (transactionTypes.includes("월세")) {
        console.log("월세 조건:", {
          보증금: `${filterForm.depositMin || 0} ~ ${
            filterForm.depositMax || "무제한"
          }`,
          월세: `${filterForm.monthlyRentMin || 0} ~ ${
            filterForm.monthlyRentMax || "무제한"
          }`,
        });
      }
      if (transactionTypes.includes("전세")) {
        console.log("전세 조건:", {
          전세가: `${filterForm.jeonseMin || 0} ~ ${
            filterForm.jeonseMax || "무제한"
          }`,
        });
      }
      if (transactionTypes.includes("매매")) {
        console.log("매매 조건:", {
          매매가: `${filterForm.saleMin || 0} ~ ${
            filterForm.saleMax || "무제한"
          }`,
        });
      }
      console.log("=====================");
      console.log("백엔드로 전송되는 추가 필터:", additionalFilters);
    }

    // 면적 필터 정보 출력
    if (filterForm.areaMin || filterForm.areaMax) {
      console.log("면적 조건:", {
        면적: `${filterForm.areaMin || 0} ~ ${
          filterForm.areaMax || "무제한"
        } m²`,
      });
      console.log("면적 필터 원본 값:", {
        areaMin: filterForm.areaMin,
        areaMax: filterForm.areaMax,
        areaMinType: typeof filterForm.areaMin,
        areaMaxType: typeof filterForm.areaMax,
      });
    }

    // 방 개수 필터 정보 출력
    if (filterForm.roomCount) {
      console.log("방 개수 조건:", {
        방개수: `${filterForm.roomCount}개`,
      });
    }

    // 화장실 개수 필터 정보 출력
    if (filterForm.bathroomCount) {
      console.log("화장실 개수 조건:", {
        화장실개수: `${filterForm.bathroomCount}개`,
      });
    }

    // 층수 필터 정보 출력
    if (filterForm.floor) {
      console.log("층수 조건:", {
        층수: `${filterForm.floor}층`,
      });
    }

    // 준공년도 필터 정보 출력
    if (filterForm.completionYearMin || filterForm.completionYearMax) {
      console.log("준공년도 조건:", {
        준공년도: `${filterForm.completionYearMin || "무제한"} ~ ${
          filterForm.completionYearMax || "무제한"
        }년`,
      });
    }

    // 추가옵션 필터 정보 출력
    if (selectedAdditionalOptions && selectedAdditionalOptions.length > 0) {
      console.log("추가옵션 조건:", {
        선택된옵션: selectedAdditionalOptions.join(", "),
      });
    }
  };

  return (
    <div className="map-container">
      {/* 상단 네비게이션 바 */}
      <FilterNavBar
        filterItems={filterItems}
        filterForm={filterForm}
        setFilterForm={setFilterForm}
        userMaxPurchaseAmount={userMaxPurchaseAmount}
        isUserConditionFilterActive={isUserConditionFilterActive}
        onUserConditionToggle={toggleUserConditionFilter}
        onFilterApply={(appliedFilters) => {
          console.log("=== MapComponent - onFilterApply 호출됨 ===");
          console.log("받은 appliedFilters:", appliedFilters);
          console.log("현재 선택된 매물 유형:", selectedPropertyType);

          // appliedFilters를 filterForm에 반영
          if (appliedFilters) {
            setFilterForm(prev => ({
              ...prev,
              ...appliedFilters
            }));
            console.log("filterForm 업데이트됨:", appliedFilters);
          }

          // nav바 필터와 사이드바 매물 유형을 통합해서 API 호출
          console.log("applyNavBarFilters 호출 시작");
          applyNavBarFilters(appliedFilters);
          console.log("=== MapComponent - onFilterApply 완료 ===");
        }}
      />
      {/* 메인 콘텐츠 */}
      <div className="main-content-wrapper">
        {/* 매물 종류 사이드바 - 왼쪽 */}
        <div className="property-category-sidebar">
          {/* 매물 유형 선택 버튼들 */}
          <div className="property-category-buttons">
            <div
              className={`property-category-item ${
                selectedPropertyType === "전체" ? "active" : ""
              }`}
              onClick={() => handlePropertyTypeClick("전체")}
            >
              <div className="property-category-icon">🏠</div>
              <div className="property-category-text">전체</div>
            </div>
            <div
              className={`property-category-item ${
                selectedPropertyType === "아파트" ? "active" : ""
              }`}
              onClick={() => handlePropertyTypeClick("아파트")}
            >
              <div className="property-category-icon">
                <img
                  src="/hotel(2).png"
                  alt="아파트"
                  style={{ width: "24px", height: "24px" }}
                />
              </div>
              <div className="property-category-text">아파트</div>
            </div>
            <div
              className={`property-category-item ${
                selectedPropertyType === "오피스텔" ? "active" : ""
              }`}
              onClick={() => handlePropertyTypeClick("오피스텔")}
            >
              <div className="property-category-icon">
                <img
                  src="/hotel.svg"
                  alt="오피스텔"
                  style={{ width: "24px", height: "24px" }}
                />
              </div>
              <div className="property-category-text">오피스텔</div>
            </div>
            <div
              className={`property-category-item ${
                selectedPropertyType === "연립/다세대" ? "active" : ""
              }`}
              onClick={() => handlePropertyTypeClick("연립/다세대")}
            >
              <div className="property-category-icon">
                <img
                  src="/house.png"
                  alt="연립/다세대"
                  style={{ width: "24px", height: "24px" }}
                />
              </div>
              <div className="property-category-text">연립/다세대</div>
            </div>
            <div
              className={`property-category-item ${
                selectedPropertyType === "단독주택" ? "active" : ""
              }`}
              onClick={() => handlePropertyTypeClick("단독주택")}
            >
              <div className="property-category-icon">
                <img
                  src="/house(1).png"
                  alt="단독주택"
                  style={{ width: "24px", height: "24px" }}
                />
              </div>
              <div className="property-category-text">단독주택</div>
            </div>
          </div>
        </div>

        {/* 매물 리스트 사이드바 - 중간 */}
        <div className="map-sidebar">
          {/* 검색창 */}
          <div className="search-controls">
            <div className="search-input-group">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="지역, 지하철역, 단지명 검색"
                className="search-input"
                title="예시: 강남 아파트, 서초 오피스텔, 용인 단독주택, 월세, 매매 등"
              />
              <button
                type="submit"
                className="search-button"
                onClick={handleSearch}
              >
                검색
              </button>
              {searchKeyword && (
                <button
                  type="button"
                  className="clear-search-button"
                  onClick={() => {
                    setSearchKeyword("");
                    setFilteredProperties([]);
                    setPlaces([]);
                    // 기존 마커들 제거
                    markers.forEach((marker) => marker.setMap(null));
                    setMarkers([]);
                    // 페이징 정보 초기화
                    setCurrentPage(1);
                    setTotalPages(1);
                    setTotalElements(0);
                    // 모든 매물 데이터 다시 로드
                    if (selectedPropertyType === "전체") {
                      fetchPropertyData();
                    } else {
                      fetchPropertyDataByType(selectedPropertyType);
                    }
                  }}
                  title="검색어 지우기"
                >
                  ×
                </button>
              )}
            </div>



            {/* 거래 유형 선택 버튼들 */}
            <div className="transaction-type-buttons">
              <button
                className={`transaction-type-btn ${
                  selectedTransactionType === "전체" ? "active" : ""
                }`}
                onClick={() => handleTransactionTypeClick("전체")}
              >
                전체
              </button>
              <button
                className={`transaction-type-btn ${
                  selectedTransactionType === "매매" ? "active" : ""
                }`}
                onClick={() => handleTransactionTypeClick("매매")}
              >
                매매
              </button>
              <button
                className={`transaction-type-btn ${
                  selectedTransactionType === "전/월세" ? "active" : ""
                }`}
                onClick={() => handleTransactionTypeClick("전/월세")}
              >
                전/월세
              </button>
            </div>
          </div>

          {/* 필터 섹션 */}
          {showFilters && (
            <div className="filter-section">
              <div className="filter-header">
                <h3>{selectedPropertyType} 필터</h3>
                <button className="close-filter" onClick={toggleFilters}>
                  ×
                </button>
              </div>

              <div className="filter-options">
                <div className="filter-group">
                  <label>거래 유형</label>
                  <div className="filter-buttons">
                    <button
                      className={`filter-option ${
                        filterForm.transactionType === "" ? "active" : ""
                      }`}
                      onClick={() =>
                        handleFilterOptionClick("transactionType", "")
                      }
                    >
                      전체
                    </button>
                    <button
                      className={`filter-option ${
                        filterForm.transactionType === "매매" ? "active" : ""
                      }`}
                      onClick={() =>
                        handleFilterOptionClick("transactionType", "매매")
                      }
                    >
                      매매
                    </button>
                    <button
                      className={`filter-option ${
                        filterForm.transactionType === "전/월세" ? "active" : ""
                      }`}
                      onClick={() =>
                        handleFilterOptionClick("transactionType", "전/월세")
                      }
                    >
                      전/월세
                    </button>
                  </div>
                </div>

                {/* 전월세 구분 선택 (전월세 선택 시에만 표시) */}
                {filterForm.transactionType === "전/월세" && (
                  <div className="filter-group">
                    <label>전월세 구분</label>
                    <div className="filter-buttons">
                      <button
                        className={`filter-option ${
                          filterForm.rentType === "전세" ? "active" : ""
                        }`}
                        onClick={() =>
                          handleFilterOptionClick("rentType", "전세")
                        }
                      >
                        전세
                      </button>
                      <button
                        className={`filter-option ${
                          filterForm.rentType === "월세" ? "active" : ""
                        }`}
                        onClick={() =>
                          handleFilterOptionClick("rentType", "월세")
                        }
                      >
                        월세
                      </button>
                    </div>
                  </div>
                )}

                <div className="filter-group">
                  <label>가격 범위 (만원)</label>
                  <div className="price-inputs">
                    <input
                      type="number"
                      name="minPrice"
                      value={filterForm.minPrice}
                      onChange={handleFilterChange}
                      placeholder="최소"
                      className="price-input"
                    />
                    <span>~</span>
                    <input
                      type="number"
                      name="maxPrice"
                      value={filterForm.maxPrice}
                      onChange={handleFilterChange}
                      placeholder="최대"
                      className="price-input"
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label>면적 (㎡)</label>
                  <div className="area-inputs">
                    <input
                      type="number"
                      name="minArea"
                      value={filterForm.minArea}
                      onChange={handleFilterChange}
                      placeholder="최소"
                      className="area-input"
                    />
                    <span>~</span>
                    <input
                      type="number"
                      name="maxArea"
                      value={filterForm.maxArea}
                      onChange={handleFilterChange}
                      placeholder="최대"
                      className="area-input"
                    />
                  </div>
                </div>

                <div className="filter-actions">
                  <button className="apply-filter" onClick={applyFilters}>
                    필터 적용
                  </button>
                  <button className="reset-filter" onClick={resetFilters}>
                    초기화
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 검색 결과 리스트 */}
          <div className="search-results-container">
            {filteredProperties.length > 0 ? (
              <div>
                <div className="search-results-list">
                  <div className="search-results-header">
                    {searchKeyword ? (
                      <>
                        🔍 "{searchKeyword}" 검색 결과: {totalElements}개 (페이지 {currentPage} / {totalPages})
                        {(() => {
                          const analysis = analyzeSearchKeyword(searchKeyword);
                          const filters = [];
                          
                          // 도로명 주소 검색인 경우 특별 표시
                          if (analysis.isRoadAddress) {
                            filters.push(`📍 도로명 주소 검색`);
                          }
                          
                          if (analysis.regions.length > 0) {
                            filters.push(`지역: ${analysis.regions.join(', ')}`);
                          }
                          if (analysis.propertyTypes.length > 0) {
                            filters.push(`매물유형: ${analysis.propertyTypes.join(', ')}`);
                          }
                          if (analysis.transactionTypes.length > 0) {
                            filters.push(`거래유형: ${analysis.transactionTypes.join(', ')}`);
                          }
                          
                          return filters.length > 0 ? (
                            <div className="search-filters-info">
                              <span className="search-filters-label">적용된 필터:</span>
                              {filters.map((filter, index) => (
                                <span key={index} className={`search-filter-tag ${filter.includes('도로명') ? 'road-address-tag' : ''}`}>
                                  {filter}
                                </span>
                              ))}
                            </div>
                          ) : null;
                        })()}
                      </>
                    ) : (
                      <>
                        📋 매물 목록: {(() => {
                          // 추가옵션 필터가 적용된 경우 필터링된 결과의 실제 개수 표시
                          const hasAdditionalOptions = filterForm.elevator || filterForm.airConditioner || 
                                                     filterForm.washingMachine || filterForm.induction || 
                                                     filterForm.balcony || filterForm.shoeCabinet || 
                                                     filterForm.bathtub || filterForm.wardrobe || 
                                                     filterForm.tv || filterForm.refrigerator || 
                                                     filterForm.sink || filterForm.fireAlarm || 
                                                     filterForm.parking || filterForm.petFriendly;
                          
                          if (hasAdditionalOptions) {
                            // 현재 표시된 매물들 중에서 추가옵션 필터를 만족하는 매물만 카운트
                            const filteredCount = filteredProperties.filter(property => {
                              // 편의시설 옵션들
                              if (filterForm.elevator && !property.elevator) return false;
                              if (filterForm.airConditioner && !property.airConditioner) return false;
                              if (filterForm.washingMachine && !property.washingMachine) return false;
                              if (filterForm.induction && !property.induction) return false;
                              if (filterForm.balcony && !property.balcony) return false;
                              if (filterForm.shoeCabinet && !property.shoeCabinet) return false;
                              if (filterForm.bathtub && !property.bathtub) return false;
                              if (filterForm.wardrobe && !property.wardrobe) return false;
                              if (filterForm.tv && !property.tv) return false;
                              if (filterForm.refrigerator && !property.refrigerator) return false;
                              if (filterForm.sink && !property.sink) return false;
                              if (filterForm.fireAlarm && !property.fireAlarm) return false;
                              
                              // 주차와 반려동물 옵션
                              if (filterForm.parking) {
                                const parkingValue = property.parking;
                                if (!(parkingValue === true || parkingValue === 1 || 
                                    (typeof parkingValue === 'string' && 
                                     (parkingValue.toLowerCase() === 'true' || 
                                      parkingValue.toLowerCase() === '가능' || 
                                      parkingValue.toLowerCase() === 'y' || 
                                      parkingValue.toLowerCase() === 'yes' || 
                                      parkingValue.toLowerCase() === '있음' || 
                                      parkingValue === '')))) {
                                  return false;
                                }
                              }
                              
                              if (filterForm.petFriendly) {
                                const petValue = property.petFriendly;
                                if (!(petValue === true || petValue === 1 || 
                                    (typeof petValue === 'string' && 
                                     (petValue.toLowerCase() === 'true' || 
                                      petValue.toLowerCase() === '가능' || 
                                      petValue.toLowerCase() === 'y' || 
                                      petValue.toLowerCase() === 'yes' || 
                                      petValue.toLowerCase() === '있음' || 
                                      petValue === '')))) {
                                  return false;
                                }
                              }
                              
                              return true;
                            }).length;
                            
                            const filteredPages = Math.ceil(filteredCount / pageSize);
                            return `${filteredCount}개 (페이지 ${currentPage} / ${filteredPages})`;
                          } else {
                            // 추가옵션 필터가 없는 경우 전체 매물 수 표시
                            return `${totalElements}개 (페이지 ${currentPage} / ${totalPages})`;
                          }
                        })()}
                        {(() => {
                          // 현재 적용된 필터들 표시
                          const activeFilters = [];
                          
                          // 거래 유형 필터
                          if (selectedTransactionType && selectedTransactionType !== "전체") {
                            activeFilters.push(`거래유형: ${selectedTransactionType}`);
                          }
                          
                          // 매물 유형 필터
                          if (selectedPropertyType && selectedPropertyType !== "전체") {
                            activeFilters.push(`매물유형: ${selectedPropertyType}`);
                          }
                          
                          // 추가옵션 필터 (filterForm에서 확인)
                          const selectedOptions = [];
                          if (filterForm.elevator) selectedOptions.push("엘리베이터");
                          if (filterForm.airConditioner) selectedOptions.push("에어컨");
                          if (filterForm.washingMachine) selectedOptions.push("세탁기");
                          if (filterForm.induction) selectedOptions.push("인덕션");
                          if (filterForm.balcony) selectedOptions.push("발코니");
                          if (filterForm.shoeCabinet) selectedOptions.push("신발장");
                          if (filterForm.bathtub) selectedOptions.push("욕조");
                          if (filterForm.wardrobe) selectedOptions.push("옷장");
                          if (filterForm.tv) selectedOptions.push("TV");
                          if (filterForm.refrigerator) selectedOptions.push("냉장고");
                          if (filterForm.sink) selectedOptions.push("싱크대");
                          if (filterForm.fireAlarm) selectedOptions.push("화재경보기");
                          if (filterForm.parking) selectedOptions.push("주차");
                          if (filterForm.petFriendly) selectedOptions.push("반려동물");
                          
                          if (selectedOptions.length > 0) {
                            activeFilters.push(`추가옵션: ${selectedOptions.join(', ')}`);
                          }
                          
                          // 사용자 조건 필터
                          if (isUserConditionFilterActive && userMaxPurchaseAmount) {
                            activeFilters.push(`사용자조건: ${formatAmountToKorean(userMaxPurchaseAmount)} 이하`);
                          }
                          
                          return activeFilters.length > 0 ? (
                            <div className="search-filters-info">
                              <span className="search-filters-label">적용된 필터:</span>
                              {activeFilters.map((filter, index) => (
                                <span key={index} className="search-filter-tag">
                                  {filter}
                                </span>
                              ))}
                            </div>
                          ) : null;
                        })()}
                      </>
                    )}
                  </div>
                  {filteredProperties.map((property, i) => (
                    <div
                      key={i}
                      className="search-result-item"
                      onClick={async () => {
                        try {
                          // 매물 상세 정보 가져오기
                          const detailedProperty = await getPropertyDetail(
                            property.id
                          );
                          console.log("상세 매물 정보:", detailedProperty);
                          console.log("상세 매물 필드들:", {
                            propertyType: detailedProperty.propertyType,
                            price: detailedProperty.price,
                            area: detailedProperty.area,
                            rooms: detailedProperty.rooms,
                            bathrooms: detailedProperty.bathrooms,
                            floor: detailedProperty.floor,
                            totalFloors: detailedProperty.totalFloors,
                            yearBuilt: detailedProperty.yearBuilt,
                            address: detailedProperty.roadAddress,
                            parking: detailedProperty.parking,
                            heating: detailedProperty.heating,
                            petAllowed: detailedProperty.petAllowed,
                            elevator: detailedProperty.elevator,
                            balcony: detailedProperty.balcony,
                            tv: detailedProperty.tv,
                            airConditioner: detailedProperty.airConditioner,
                          });

                          // 실거래가 데이터 가져오기
                          try {
                            const marketPriceData = await getMarketPrice(
                              property.id
                            );
                            console.log("실거래가 데이터:", marketPriceData);
                            console.log("실거래가 데이터 구조:", {
                              sales: marketPriceData?.sales,
                              rents: marketPriceData?.rents,
                              salesLength: marketPriceData?.sales?.length || 0,
                              rentsLength: marketPriceData?.rents?.length || 0,
                            });

                            // 상세 매물 정보에 실거래가 데이터 추가
                            detailedProperty.marketPrices = marketPriceData;
                          } catch (marketError) {
                            console.error(
                              "실거래가 데이터 가져오기 실패:",
                              marketError
                            );
                            detailedProperty.marketPrices = {
                              sales: [],
                              rents: [],
                            };
                          }

                          // 선택된 매물 설정 (상세 정보 포함)
                          console.log("최종 선택된 매물:", detailedProperty);
                          console.log(
                            "매물 도로명 주소:",
                            detailedProperty.roadAddress
                          );
                          console.log(
                            "매물 상세 주소:",
                            detailedProperty.detailAddress
                          );

                          // 이전 상태 완전 초기화
                          setSelectedProperty(null);
                          setCurrentImageIndex(0);
                          setIsImageModalOpen(false);
                          setModalInitialIndex(0);

                          // 새로운 매물 선택
                          setTimeout(() => {
                            setSelectedProperty(detailedProperty);
                          }, 0);
                          // 댓글 목록 로드
                          // loadInquiries(detailedProperty.id); // 댓글 관련 로직 제거
                        } catch (error) {
                          console.error("매물 상세 정보 가져오기 실패:", error);
                          // 실패 시에도 상태 초기화 후 기본 정보 표시
                          setSelectedProperty(null);
                          setCurrentImageIndex(0);
                          setIsImageModalOpen(false);
                          setModalInitialIndex(0);

                          setTimeout(() => {
                            setSelectedProperty(property);
                          }, 0);
                        }

                        // 지도 중심 이동
                        const pos = new window.kakao.maps.LatLng(
                          parseFloat(property.y),
                          parseFloat(property.x)
                        );
                        map.setCenter(pos);

                        // 지도 크기 재조정
                        setTimeout(() => {
                          if (map) {
                            map.relayout();
                          }
                        }, 100);
                      }}
                    >
                      {/* 썸네일 이미지 */}
                      <div className="result-thumbnail relative">
                        {property.imageUrls && property.imageUrls.length > 0 ? (
                          <img
                            src={`${
                              process.env.REACT_APP_BACKEND_URL ||
                              "http://localhost:8080"
                            }/files/${property.imageUrls[0]}`}
                            alt={property.name}
                            className="thumbnail-image"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`thumbnail-placeholder ${
                            property.imageUrls && property.imageUrls.length > 0
                              ? "hidden"
                              : ""
                          }`}
                        >
                          🏠
                        </div>

                        {/* 좋아요 버튼 - 우측 상단 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeClick(property.id);
                          }}
                          className="absolute top-2 right-2 z-20 hover:scale-110 transition-transform duration-200"
                        >
                          <span className="text-lg drop-shadow-lg">
                            {property.isLiked ? "❤️" : "🤍"}
                          </span>
                        </button>

                        {/* 거래완료 오버레이 */}
                        {(property.transactionStatus === 0 ||
                          property.status === "거래완료") && (
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
                            <div className="text-white font-bold text-sm bg-red-600 bg-opacity-90 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm">
                              🏠 거래완료
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="result-number">{i + 1}</div>
                      <div
                        className="result-content"
                        onClick={() => handlePropertyClick(property)}
                      >
                        <div className="result-name">{property.name}</div>
                        <div className="result-address">
                          {(() => {
                            // 주소 정보를 우선순위에 따라 표시
                            const address = property.roadAddress || property.address || property.location;
                            if (address && address !== "주소 정보 없음" && address !== ".") {
                              return address;
                            }
                            return "주소 정보 없음";
                          })()} · {property.area || 0}㎡ ·{" "}
                          {formatAmountToKorean(property.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 페이지네이션 */}
                <div className="pagination-container">
                  <div className="pagination">
                    {/* 이전 페이지 버튼 */}
                    <button
                      className={`pagination-btn ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      이전
                    </button>

                    {/* 페이지 번호들 */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          className={`pagination-btn ${
                            currentPage === pageNum ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* 다음 페이지 버튼 */}
                    <button
                      className={`pagination-btn ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      다음
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-search-message">
                <div className="empty-search-icon">
                  {searchKeyword ? "🔍" : "🏠"}
                </div>
                <p>
                  {(() => {
                    const analysis = analyzeSearchKeyword(searchKeyword);
                    if (analysis.isRoadAddress) {
                      return `"${searchKeyword}" 도로명 주소에 대한 검색 결과가 없습니다`;
                    }
                    return `"${searchKeyword}"에 대한 검색 결과가 없습니다`;
                  })()}
                </p>
                <p style={{ fontSize: "14px", color: "#9ca3af" }}>
                  {(() => {
                    const analysis = analyzeSearchKeyword(searchKeyword);
                    if (analysis.isRoadAddress) {
                      return "해당 도로명 주소와 관련된 매물이 등록되지 않았습니다";
                    }
                    return "다른 검색어를 입력하거나 필터를 조정해보세요";
                  })()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 지도 영역 - 오른쪽 큰 영역 */}
        <div className="map-main-content">
          <div className="map-wrapper">
            <div className="map-container-wrapper">
              <div id="map"></div>
            </div>
          </div>

          {/* 상세 정보 오버레이 - 지도 위에 표시 */}
          {selectedProperty && (
            <div ref={propertyDetailRef} className="property-detail-overlay">
              <div className="detail-header">
                <button
                  className="close-detail-btn"
                  onClick={() => setSelectedProperty(null)}
                >
                  ✕
                </button>
                <h3>매물 상세정보</h3>
              </div>

              <div className="detail-content">
                {/* 매물 기본 정보 */}
                <div className="detail-section">
                  <div className="detail-header-with-like">
                    <h4 className="detail-title">
                      {selectedProperty.title || selectedProperty.name}
                    </h4>
                    {/* 좋아요 버튼 */}
                    <button
                      onClick={() => handleLikeClick(selectedProperty.id)}
                      className="like-btn-detail"
                    >
                      <span className="text-xl">
                        {selectedProperty.isLiked ? "❤️" : "🤍"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 매물 이미지 */}
                <div className="detail-section">
                  <div className="property-images">
                    {selectedProperty.imageUrls &&
                    selectedProperty.imageUrls.length > 0 ? (
                      <div className="main-image-container">
                        <img
                          src={`${
                            process.env.REACT_APP_BACKEND_URL ||
                            "http://localhost:8080"
                          }/files/${
                            selectedProperty.imageUrls[currentImageIndex]
                          }`}
                          alt={selectedProperty.name}
                          className="main-image cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openImageModal(currentImageIndex)}
                        />
                      </div>
                    ) : (
                      <div className="no-image-placeholder">
                        <div className="no-image-icon">🏠</div>
                        <p>이미지가 없습니다</p>
                      </div>
                    )}

                    {/* 썸네일 이미지들 */}
                    {selectedProperty.imageUrls &&
                      selectedProperty.imageUrls.length > 1 && (
                        <div className="thumbnail-images">
                          {selectedProperty.imageUrls
                            .slice(0, 5)
                            .map((imageUrl, index) => (
                              <img
                                key={index}
                                src={`${
                                  process.env.REACT_APP_BACKEND_URL ||
                                  "http://localhost:8080"
                                }/files/${imageUrl}`}
                                alt={`썸네일 ${index + 1}`}
                                className={`thumbnail-image ${
                                  index === currentImageIndex ? "active" : ""
                                }`}
                                onClick={() => setCurrentImageIndex(index)}
                                onDoubleClick={() => openImageModal(index)}
                                title="더블클릭으로 확대보기"
                              />
                            ))}
                          {selectedProperty.imageUrls.length > 5 && (
                            <div className="more-images">
                              +{selectedProperty.imageUrls.length - 5}
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </div>

                {/* 매물 가격 정보 */}
                <div className="detail-section">
                  <p className="detail-price">
                    {formatAmountToKorean(selectedProperty.price)}
                  </p>
                </div>

                {/* 매물 설명 */}
                <div className="detail-section">
                  <h4>매물 설명</h4>
                  <div className="detail-description">
                    {selectedProperty.description ||
                      selectedProperty.content ||
                      "매물에 대한 상세한 설명이 없습니다."}
                  </div>
                </div>

                {/* 매물 상세 정보 */}
                <div className="detail-section">
                  <h4>상세 정보</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label font-bold">매물 유형:</span>
                      <span className="detail-value">
                        {selectedProperty.propertyType || "정보없음"}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label font-bold">거래 유형:</span>
                      <span className="detail-value">
                        {selectedProperty.transactionType || "정보없음"}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label font-bold">면적:</span>
                      <div className="flex items-center gap-2">
                        <span className="detail-value">
                          {convertArea(selectedProperty.area)}
                        </span>
                        <button
                          onClick={toggleAreaUnit}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title={isAreaInPyeong ? "㎡로 보기" : "평으로 보기"}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label font-bold">방 개수:</span>
                      <span className="detail-value">
                        {selectedProperty.rooms
                          ? `${selectedProperty.rooms}개`
                          : "정보없음"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label font-bold">화장실:</span>
                      <span className="detail-value">
                        {selectedProperty.bathrooms
                          ? `${selectedProperty.bathrooms}개`
                          : "정보없음"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label font-bold">현재 층:</span>
                      <span className="detail-value">
                        {selectedProperty.floor
                          ? `${selectedProperty.floor}층`
                          : "정보없음"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label font-bold">전체 층수:</span>
                      <span className="detail-value">
                        {selectedProperty.totalFloors
                          ? `${selectedProperty.totalFloors}층`
                          : "정보없음"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label font-bold">준공년도:</span>
                      <span className="detail-value">
                        {selectedProperty.yearBuilt
                          ? `${selectedProperty.yearBuilt}년`
                          : "정보없음"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label font-bold">주소:</span>
                      <span className="detail-value">
                        {selectedProperty.roadAddress || "정보없음"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label font-bold">주차:</span>
                      <span className="detail-value">
                        {selectedProperty.parking === true ||
                        selectedProperty.parking === "true"
                          ? "가능"
                          : selectedProperty.parking === false ||
                            selectedProperty.parking === "false"
                          ? "불가능"
                          : selectedProperty.parking || "정보없음"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label font-bold">난방:</span>
                      <span className="detail-value">
                        {selectedProperty.heating || "정보없음"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label font-bold">반려동물:</span>
                      <span className="detail-value">
                        {selectedProperty.petAllowed === true ||
                        selectedProperty.petAllowed === "true"
                          ? "가능"
                          : selectedProperty.petAllowed === false ||
                            selectedProperty.petAllowed === "false"
                          ? "불가능"
                          : selectedProperty.petAllowed || "정보없음"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 옵션 */}
                <div className="detail-section">
                  <h4>옵션</h4>
                  <div className="options-grid">
                    {selectedProperty.elevator && (
                      <div className="option-item">
                        <img
                          src="/elevator.png"
                          alt="엘리베이터"
                          className="option-icon"
                        />
                        <span>엘리베이터</span>
                      </div>
                    )}
                    {selectedProperty.balcony && (
                      <div className="option-item">
                        <img
                          src="/balcony.png"
                          alt="발코니"
                          className="option-icon"
                        />
                        <span>발코니</span>
                      </div>
                    )}
                    {selectedProperty.tv && (
                      <div className="option-item">
                        <img src="/tv.png" alt="TV" className="option-icon" />
                        <span>TV</span>
                      </div>
                    )}
                    {selectedProperty.airConditioner && (
                      <div className="option-item">
                        <img
                          src="/air-conditioning.png"
                          alt="에어컨"
                          className="option-icon"
                        />
                        <span>에어컨</span>
                      </div>
                    )}
                    {selectedProperty.shoeCabinet && (
                      <div className="option-item">
                        <img
                          src="/sneaker.png"
                          alt="신발장"
                          className="option-icon"
                        />
                        <span>신발장</span>
                      </div>
                    )}
                    {selectedProperty.refrigerator && (
                      <div className="option-item">
                        <img
                          src="/refrigerator.png"
                          alt="냉장고"
                          className="option-icon"
                        />
                        <span>냉장고</span>
                      </div>
                    )}
                    {selectedProperty.washingMachine && (
                      <div className="option-item">
                        <img
                          src="/washingmachine.png"
                          alt="세탁기"
                          className="option-icon"
                        />
                        <span>세탁기</span>
                      </div>
                    )}
                    {selectedProperty.bathtub && (
                      <div className="option-item">
                        <img
                          src="/bathtub.png"
                          alt="욕조"
                          className="option-icon"
                        />
                        <span>욕조</span>
                      </div>
                    )}
                    {selectedProperty.sink && (
                      <div className="option-item">
                        <img
                          src="/washing-dish.png"
                          alt="싱크대"
                          className="option-icon"
                        />
                        <span>싱크대</span>
                      </div>
                    )}
                    {selectedProperty.induction && (
                      <div className="option-item">
                        <img
                          src="/stove.png"
                          alt="인덕션"
                          className="option-icon"
                        />
                        <span>인덕션</span>
                      </div>
                    )}
                    {selectedProperty.wardrobe && (
                      <div className="option-item">
                        <img
                          src="/hanger.png"
                          alt="옷장"
                          className="option-icon"
                        />
                        <span>옷장</span>
                      </div>
                    )}
                    {selectedProperty.fireAlarm && (
                      <div className="option-item">
                        <img
                          src="/fire.png"
                          alt="화재경보기"
                          className="option-icon"
                        />
                        <span>화재경보기</span>
                      </div>
                    )}
                    {!selectedProperty.elevator &&
                      !selectedProperty.balcony &&
                      !selectedProperty.tv &&
                      !selectedProperty.airConditioner &&
                      !selectedProperty.shoeCabinet &&
                      !selectedProperty.refrigerator &&
                      !selectedProperty.washingMachine &&
                      !selectedProperty.bathtub &&
                      !selectedProperty.sink &&
                      !selectedProperty.induction &&
                      !selectedProperty.wardrobe &&
                      !selectedProperty.fireAlarm && (
                        <div className="no-options">
                          <div className="no-options-icon">📋</div>
                          등록된 옵션이 없습니다.
                        </div>
                      )}
                  </div>
                </div>

                {/* 실거래가 정보 */}
                <div className="detail-section">
                  <h4>거래정보</h4>
                  {(() => {
                    // 실거래가 데이터가 있는지 확인
                    const hasMarketData =
                      selectedProperty.marketPrices &&
                      ((selectedProperty.marketPrices.sales &&
                        selectedProperty.marketPrices.sales.length > 0) ||
                        (selectedProperty.marketPrices.rents &&
                          selectedProperty.marketPrices.rents.length > 0));

                    if (!hasMarketData) {
                      return (
                        <div className="text-center text-gray-500 py-4">
                          <div className="text-xl mb-2">📊</div>
                          <p className="text-sm mb-1">
                            이전 거래정보가 없습니다
                          </p>
                          <p className="text-xs text-gray-400">
                            해당 지역의 실거래가 데이터가 아직 등록되지
                            않았습니다.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {/* 실거래가 차트 */}
                        <div>
                          {console.log("TransactionHistoryChart 렌더링 시도:", {
                            marketPrices: selectedProperty?.marketPrices,
                            roadAddress: selectedProperty?.roadAddress,
                          })}
                          <TransactionHistoryChart
                            marketPrices={selectedProperty.marketPrices}
                            roadNameAddress={selectedProperty.roadAddress}
                          />
                        </div>

                        {/* 최근 실거래가 요약 */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-3">
                            최근 실거래가 요약
                          </h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">매매:</span>
                              <span className="ml-2 font-medium text-blue-600">
                                {(() => {
                                  const sales =
                                    selectedProperty.marketPrices?.sales || [];
                                  if (sales.length === 0) return "정보없음";
                                  const avgPrice = Math.round(
                                    sales.reduce(
                                      (sum, sale) =>
                                        sum + parseInt(sale.transactionAmount),
                                      0
                                    ) / sales.length
                                  );
                                  return `${formatAmountToKorean(
                                    avgPrice
                                  )}만원`;
                                })()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">전세:</span>
                              <span className="ml-2 font-medium text-green-600">
                                {(() => {
                                  const rents =
                                    selectedProperty.marketPrices?.rents || [];
                                  const jeonseRents = rents.filter(
                                    (rent) =>
                                      !rent.monthlyRent ||
                                      rent.monthlyRent === "0" ||
                                      rent.monthlyRent === "0만원" ||
                                      rent.monthlyRent === 0 ||
                                      rent.monthlyRent === ""
                                  );
                                  if (jeonseRents.length === 0)
                                    return "정보없음";
                                  const avgPrice = Math.round(
                                    jeonseRents.reduce(
                                      (sum, rent) =>
                                        sum + parseInt(rent.deposit),
                                      0
                                    ) / jeonseRents.length
                                  );
                                  return `${formatAmountToKorean(
                                    avgPrice
                                  )}만원`;
                                })()}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-gray-500">
                            <p>• 매매: 해당 지역의 매매 실거래가 평균</p>
                            <p>• 전세: 해당 지역의 전세 실거래가 평균</p>
                          </div>
                        </div>

                        {/* 매매 실거래가 테이블 */}
                        {selectedProperty.marketPrices.sales &&
                          selectedProperty.marketPrices.sales.length > 0 && (
                            <div>
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-medium text-gray-700">
                                  매매 실거래가
                                </h4>
                                <span className="text-sm text-gray-500">
                                  총{" "}
                                  {selectedProperty.marketPrices.sales.length}건
                                </span>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="min-w-full bg-gray-50 rounded text-xs">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                                        계약일
                                      </th>
                                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                                        거래금액
                                      </th>
                                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                                        면적
                                      </th>
                                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                                        층
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedProperty.marketPrices.sales.map(
                                      (sale, index) => (
                                        <tr
                                          key={index}
                                          className="border-b border-gray-200 hover:bg-gray-50"
                                        >
                                          <td className="px-2 py-1 text-xs text-gray-600">
                                            {sale.contractDate}
                                          </td>
                                          <td className="px-2 py-1 text-xs text-gray-600 font-medium">
                                            {formatAmountToKorean(
                                              sale.transactionAmount
                                            )}
                                          </td>
                                          <td className="px-2 py-1 text-xs text-gray-600">
                                            {sale.exclusiveArea}㎡
                                          </td>
                                          <td className="px-2 py-1 text-xs text-gray-600">
                                            {sale.floor}층
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                        {/* 전월세 실거래가 */}
                        {selectedProperty.marketPrices.rents &&
                          selectedProperty.marketPrices.rents.length > 0 && (
                            <div>
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-medium text-gray-700">
                                  전월세 실거래가
                                </h4>
                                <span className="text-sm text-gray-500">
                                  총{" "}
                                  {selectedProperty.marketPrices.rents.length}건
                                </span>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="min-w-full bg-gray-50 rounded text-xs">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                                        계약일
                                      </th>
                                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                                        보증금
                                      </th>
                                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                                        월세
                                      </th>
                                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                                        면적
                                      </th>
                                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                                        층
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedProperty.marketPrices.rents.map(
                                      (rent, index) => {
                                        // 전세/월세 구분
                                        const isJeonse =
                                          rent.rentCategory === "전세" ||
                                          !rent.monthlyRent ||
                                          rent.monthlyRent === "0" ||
                                          rent.monthlyRent === "0만원" ||
                                          rent.monthlyRent === 0 ||
                                          rent.monthlyRent === "";

                                        return (
                                          <tr
                                            key={index}
                                            className={`border-b border-gray-200 hover:bg-gray-50 ${
                                              isJeonse
                                                ? "bg-blue-50"
                                                : "bg-yellow-50"
                                            }`}
                                          >
                                            <td className="px-2 py-1 text-xs text-gray-600">
                                              {rent.contractDate}
                                            </td>
                                            <td className="px-2 py-1 text-xs text-gray-600 font-medium">
                                              {formatAmountToKorean(
                                                rent.deposit
                                              )}
                                            </td>
                                            <td className="px-2 py-1 text-xs text-gray-600 font-medium">
                                              {isJeonse
                                                ? "전세"
                                                : formatAmountToKorean(
                                                    rent.monthlyRent
                                                  )}
                                            </td>
                                            <td className="px-2 py-1 text-xs text-gray-600">
                                              {rent.exclusiveArea}㎡
                                            </td>
                                            <td className="px-2 py-1 text-xs text-gray-600">
                                              {rent.floor}층
                                            </td>
                                          </tr>
                                        );
                                      }
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 이미지 모달 */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={closeImageModal}
        images={selectedProperty?.imageUrls || []}
        initialIndex={modalInitialIndex}
      />
    </div>
  );
}

export default MapComponent;
