import React, { useState, useEffect } from 'react';
import useModal from '../hooks/useModal';
import useSearchCache from '../hooks/useSearchCache';
import PageComponent from './common/PageComponent';
import SearchRankingComponent from './SearchRankingComponent';
import { API_SERVER_HOST } from '../api/backendApi';
import { apartmentRentApi } from '../api/apartmentRentApi';
import { officeTelSaleApi } from '../api/officeTelSaleApi';
import { officeTelRentApi } from '../api/officeTelRentApi';
import { detachedHouseSaleApi } from '../api/detachedHouseSaleApi';
import { detachedHouseRentApi } from '../api/detachedHouseRentApi';
import { rowHouseSaleApi } from '../api/rowHouseSaleApi';
import { rowHouseRentApi } from '../api/rowHouseRentApi';

import MarketPriceChart from './property/MarketPriceChart';

const RealEstateSearchComponent = () => {
    const [searchForm, setSearchForm] = useState({
        searchKeyword: '',
        searchSigungu: '',
        searchLegalDong: '',
        searchComplexName: '',
        propertyType: '',
        transactionType: '',
        rentType: ''
    });
    
    // 주택유형 옵션 추가
    const propertyTypeOptions = [
        { value: '', label: '전체' },
        { value: '아파트', label: '아파트' },
        { value: '오피스텔', label: '오피스텔' },
        { value: '단독/다가구', label: '단독/다가구' },
        { value: '연립/다세대', label: '연립/다세대' }
    ];
    
    const [transactions, setTransactions] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]); // 전체 검색 결과 저장
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10); // 한 페이지당 10개
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    // PageComponent용 serverData 구조
    const [serverData, setServerData] = useState({
        prev: false,
        next: false,
        prevPage: 0,
        nextPage: 0,
        pageNumList: [],
        current: 0
    });
    
    // 도로명 실거래가 차트 관련 상태
    const [selectedRoadName, setSelectedRoadName] = useState('');
    const [roadTransactionData, setRoadTransactionData] = useState(null);
    const [showRoadChart, setShowRoadChart] = useState(false);
    const [chartLoading, setChartLoading] = useState(false);
    
    const [sigunguList, setSigunguList] = useState([]);
    const [selectedSido, setSelectedSido] = useState('');
    const [sidoSigunguData, setSidoSigunguData] = useState({});
    const [legalDongList, setLegalDongList] = useState([]);
    
    const { showModal } = useModal();
    const { getFromCache, setCacheData, generateCacheKey, cacheSize } = useSearchCache();
    
    // 시군구 목록 로드
    useEffect(() => {
        // 시군구 목록을 정적 데이터로 설정
        const staticSigunguData = {
            '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구'],
            '부산광역시': ['강서구', '금정구', '남구', '동구', '동래구', '부산진구', '북구'],
            '대구광역시': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
            '인천광역시': ['계양구', '남구', '남동구', '동구', '부평구', '서구', '연수구'],
            '대전광역시': ['대덕구', '동구', '서구', '유성구', '중구']
        };
        setSidoSigunguData(staticSigunguData);
    }, []);
    
    // 법정동 정적 데이터 설정 (각 구당 3개 이하)
    const staticLegalDongData = {
        '강남구': ['개포동', '논현동', '대치동'],
        '강동구': ['고덕동', '길동', '천호동'],
        '강북구': ['미아동', '번동', '수유동'],
        '강서구': ['가양동', '공항동', '화곡동'],
        '관악구': ['봉천동', '신림동', '남현동'],
        '광진구': ['구의동', '군자동', '자양동'],
        '구로구': ['개봉동', '구로동', '신도림동'],
        '금정구': ['구서동', '금사동', '부곡동'],
        '남구': ['대연동', '문현동', '용당동'],
        '동구': ['범일동', '수정동', '초량동'],
        '동래구': ['명륜동', '복천동', '온천동'],
        '부산진구': ['가야동', '개금동', '서면동'],
        '북구': ['구포동', '덕천동', '만덕동'],
        '달서구': ['갈산동', '감삼동', '상인동'],
        '달성군': ['가창면', '구지면', '논공면'],
        '동구': ['각산동', '검사동', '봉산동'],
        '북구': ['검단동', '관문동', '구암동'],
        '서구': ['내당동', '내덕동', '본동'],
        '수성구': ['가천동', '고모동', '교동'],
        '중구': ['계산동', '교동', '남성로동'],
        '계양구': ['계산동', '동양동', '작전동'],
        '남구': ['관동동', '구월동', '만수동'],
        '남동구': ['구월동', '만수동', '논현동'],
        '동구': ['만석동', '화수동', '화평동'],
        '부평구': ['부평동', '십정동', '일신동'],
        '서구': ['검단동', '연희동', '청라동'],
        '연수구': ['동춘동', '선학동', '연수동'],
        '대덕구': ['덕암동', '목상동', '부족동'],
        '동구': ['대동', '대청동', '산내동'],
        '서구': ['가수원동', '갈마동', '괴정동'],
        '유성구': ['관평동', '구즉동', '노은동'],
        '중구': ['구도동', '대사동', '목동']
    };
    
    // 시군구 변경 시 법정동 목록 가져오기
    useEffect(() => {
        if (searchForm.searchSigungu) {
            const legalDongs = staticLegalDongData[searchForm.searchSigungu] || [];
            setLegalDongList(legalDongs);
        } else {
            setLegalDongList([]);
        }
    }, [searchForm.searchSigungu]);
    
    const handleSidoChange = (e) => {
        const selectedValue = e.target.value;
        setSelectedSido(selectedValue);
        // 시도 변경 시 시군구와 법정동 초기화
        setSearchForm(prev => ({
            ...prev,
            searchSigungu: '',
            searchLegalDong: ''
        }));
        setLegalDongList([]);
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSearch = async () => {
        setLoading(true);
        try {
            console.log('검색 시작 - 검색 조건:', searchForm);
            
            // 캐시에서 검색 결과 확인
            const cacheKey = generateCacheKey(searchForm);
            const cachedResult = getFromCache(cacheKey);
            
            if (cachedResult) {
                console.log('캐시에서 검색 결과 조회:', cachedResult);
                setAllTransactions(cachedResult.data);
                setTotalElements(cachedResult.totalElements);
                setTotalPages(cachedResult.totalPages);
                setCurrentPage(1);
                
                const currentPageData = getCurrentPageData(cachedResult.data, 1, pageSize);
                setTransactions(currentPageData);
                updateServerData(1, cachedResult.totalPages);
                
                setLoading(false);
                return;
            }
            
            let data;
            let convertedData = []; // 전월세 데이터 변환용 변수 선언
            let allTransactions = []; // 전체 데이터를 저장할 배열
            let rentData = []; // 전월세 데이터를 저장할 배열
            
            // 거래구분에 따라 다른 API 호출
            const selectedTypes = searchForm.transactionTypes || [];
            
            // 전세나 월세가 선택된 경우
            if (selectedTypes.includes('전세') || selectedTypes.includes('월세')) {
                
                // 전세가 선택된 경우
                if (selectedTypes.includes('전세')) {
                    if (searchForm.propertyType === '오피스텔') {
                        // 오피스텔 전세 검색
                        const officeTelRentSearchDTO = {
                            sigungu: searchForm.searchSigungu || null,
                            complexName: searchForm.searchComplexName || null,
                            rentType: '전세'
                        };
                        
                        // 빈 값 제거
                        Object.keys(officeTelRentSearchDTO).forEach(key => {
                            if (!officeTelRentSearchDTO[key]) delete officeTelRentSearchDTO[key];
                        });
                        
                        const officeTelRentResult = await officeTelRentApi.searchOfficeTelRents(officeTelRentSearchDTO);
                        console.log('오피스텔 전세 검색 결과:', officeTelRentResult);
                        
                        // 오피스텔 전세 데이터 변환
                        const 전세Data = officeTelRentResult.map(item => ({
                            complexName: item.complexName,
                            sigungu: item.sigungu,
                            transactionAmount: item.deposit, // 보증금을 거래가격으로 표시
                            exclusiveArea: item.exclusiveArea,
                            dong: '', // 오피스텔은 동 정보가 없을 수 있음
                            floor: item.floor,
                            contractDate: item.contractDate,
                            constructionYear: item.constructionYear,
                            roadName: item.roadName,
                            housingType: '오피스텔',
                            // 전세 추가 정보
                            deposit: item.deposit,
                            monthlyRent: item.monthlyRent,
                            rentType: item.rentType,
                            transactionType: '전세' // 실제 선택된 타입
                        }));
                        rentData = [...rentData, ...전세Data];
                    }
                }
                
                // 월세가 선택된 경우
                if (selectedTypes.includes('월세')) {
                    if (searchForm.propertyType === '오피스텔') {
                        // 오피스텔 월세 검색
                        const officeTelRentSearchDTO = {
                            sigungu: searchForm.searchSigungu || null,
                            complexName: searchForm.searchComplexName || null,
                            rentType: '월세'
                        };
                        
                        // 빈 값 제거
                        Object.keys(officeTelRentSearchDTO).forEach(key => {
                            if (!officeTelRentSearchDTO[key]) delete officeTelRentSearchDTO[key];
                        });
                        
                        const officeTelRentResult = await officeTelRentApi.searchOfficeTelRents(officeTelRentSearchDTO);
                        console.log('오피스텔 월세 검색 결과:', officeTelRentResult);
                        
                        // 오피스텔 월세 데이터 변환
                        const 월세Data = officeTelRentResult.map(item => ({
                            complexName: item.complexName,
                            sigungu: item.sigungu,
                            transactionAmount: item.deposit, // 보증금을 거래가격으로 표시
                            exclusiveArea: item.exclusiveArea,
                            dong: '', // 오피스텔은 동 정보가 없을 수 있음
                            floor: item.floor,
                            contractDate: item.contractDate,
                            constructionYear: item.constructionYear,
                            roadName: item.roadName,
                            housingType: '오피스텔',
                            // 월세 추가 정보
                            deposit: item.deposit,
                            monthlyRent: item.monthlyRent,
                            rentType: item.rentType,
                            transactionType: '월세' // 실제 선택된 타입
                        }));
                        rentData = [...rentData, ...월세Data];
                    }
                }
            }
            
            // 전세나 월세가 선택된 경우 (계속)
            if (selectedTypes.includes('전세') || selectedTypes.includes('월세')) {
                if (searchForm.propertyType === '단독/다가구') {
                    // 단독/다가구 전/월세 검색
                    const detachedHouseRentSearchDTO = {
                        sigungu: searchForm.searchSigungu || null,
                        rentType: searchForm.rentType || null
                        // housingType은 제거 - 모든 단독/다가구 유형을 검색
                    };
                    
                    // 빈 값 제거
                    Object.keys(detachedHouseRentSearchDTO).forEach(key => {
                        if (!detachedHouseRentSearchDTO[key]) delete detachedHouseRentSearchDTO[key];
                    });
                    
                    console.log('단독/다가구 전/월세 검색 조건:', detachedHouseRentSearchDTO);
                    const detachedHouseRentResult = await detachedHouseRentApi.searchDetachedHouseRents(detachedHouseRentSearchDTO);
                    console.log('단독/다가구 전/월세 검색 결과:', detachedHouseRentResult);
                    
                    // 단독/다가구 전/월세 데이터 변환
                    rentData = detachedHouseRentResult.map(item => ({
                        complexName: `${item.housingType} (${item.roadName})`, // 주택유형과 도로명으로 표시
                        sigungu: item.sigungu,
                        transactionAmount: item.deposit, // 보증금을 거래가격으로 표시
                        exclusiveArea: item.contractArea, // 계약면적을 전용면적으로 표시
                        dong: '', // 단독/다가구는 동 정보가 없음
                        floor: 1, // 단독/다가구는 1층으로 표시
                        contractDate: item.contractDate,
                        constructionYear: item.constructionYear,
                        roadName: item.roadName,
                        housingType: item.housingType,
                        // 전월세 추가 정보
                        deposit: item.deposit,
                        monthlyRent: item.monthlyRent,
                        rentType: item.rentType,
                        transactionType: '전/월세' // 거래구분 추가
                    }));
                } else if (searchForm.propertyType === '연립/다세대') {
                    // 연립/다세대 전/월세 검색
                    const rowHouseRentSearchDTO = {
                        sigungu: searchForm.searchSigungu || null,
                        buildingName: searchForm.searchComplexName || null,
                        rentType: searchForm.rentType || null
                    };
                    
                    // 빈 값 제거
                    Object.keys(rowHouseRentSearchDTO).forEach(key => {
                        if (!rowHouseRentSearchDTO[key]) delete rowHouseRentSearchDTO[key];
                    });
                    
                    console.log('연립/다세대 전/월세 검색 조건:', rowHouseRentSearchDTO);
                    const rowHouseRentResult = await rowHouseRentApi.searchRowHouseRents(rowHouseRentSearchDTO);
                    console.log('연립/다세대 전/월세 검색 결과:', rowHouseRentResult);
                    
                    // 연립/다세대 전/월세 데이터 변환
                    rentData = rowHouseRentResult.map(item => ({
                        complexName: `${item.buildingName} (${item.housingType})`, // 건물명과 주택유형으로 표시
                        sigungu: item.sigungu,
                        transactionAmount: item.deposit, // 보증금을 거래가격으로 표시
                        exclusiveArea: item.exclusiveArea, // 전용면적
                        dong: '', // 연립/다세대는 동 정보가 없음
                        floor: item.floor, // 층 정보 있음
                        contractDate: item.contractDate,
                        constructionYear: item.constructionYear,
                        roadName: item.roadName,
                        housingType: item.housingType,
                        // 전월세 추가 정보
                        deposit: item.deposit,
                        monthlyRent: item.monthlyRent,
                        rentType: item.rentType,
                        transactionType: '전/월세' // 거래구분 추가
                    }));
                } else {
                    // 아파트 등 일반 전/월세 검색
                    const searchDTO = {
                        sigungu: searchForm.searchSigungu,
                        legalDong: searchForm.searchLegalDong,
                        complexName: searchForm.searchComplexName,
                        housingType: searchForm.propertyType,
                        rentType: searchForm.rentType || '전세' // 기본값 전세
                    };
                    
                    const result = await apartmentRentApi.searchApartmentRents(searchDTO);
                    
                    // 전월세 데이터를 매매 데이터와 동일한 형식으로 변환
                    rentData = result.map(item => ({
                        complexName: item.complexName,
                        sigungu: item.sigungu,
                        transactionAmount: item.deposit, // 보증금을 거래가격으로 표시
                        exclusiveArea: item.exclusiveArea,
                        dong: '', // 전월세는 동 정보가 없을 수 있음
                        floor: item.floor,
                        contractDate: item.contractDate,
                        constructionYear: item.constructionYear,
                        roadName: item.roadName,
                        housingType: item.housingType,
                        // 전월세 추가 정보
                        deposit: item.deposit,
                        monthlyRent: item.monthlyRent,
                        rentType: item.rentType,
                        transactionType: '전/월세' // 거래구분 추가
                    }));
                }
                
                // 전세/월세 데이터를 전체 데이터에 추가
                allTransactions = [...allTransactions, ...rentData];
            }
            
            // 매매가 선택된 경우
            if (selectedTypes.includes('매매')) {
                // 매매 검색 (아파트 + 오피스텔)
                let saleData = [];
                
                if (searchForm.propertyType === '오피스텔') {
                    // 오피스텔 매매 검색
                    const officeTelSearchDTO = {
                        sigungu: searchForm.searchSigungu || null,
                        complexName: searchForm.searchComplexName || null
                    };
                    
                    // 빈 값 제거
                    Object.keys(officeTelSearchDTO).forEach(key => {
                        if (!officeTelSearchDTO[key]) delete officeTelSearchDTO[key];
                    });
                    
                    const officeTelResult = await officeTelSaleApi.searchOfficeTelSales(officeTelSearchDTO);
                    console.log('오피스텔 매매 검색 결과:', officeTelResult);
                    
                    // 오피스텔 데이터 변환
                    saleData = officeTelResult.map(item => ({
                        complexName: item.complexName,
                        sigungu: item.sigungu,
                        transactionAmount: item.transactionAmount,
                        exclusiveArea: item.exclusiveArea,
                        dong: '', // 오피스텔은 동 정보가 없을 수 있음
                        floor: item.floor,
                        contractDate: item.contractDate,
                        constructionYear: item.constructionYear,
                        roadName: item.roadName,
                        housingType: '오피스텔',
                        transactionType: '매매'
                    }));
                } else if (searchForm.propertyType === '단독/다가구') {
                    // 단독/다가구 매매 검색
                    const detachedHouseSearchDTO = {
                        sigungu: searchForm.searchSigungu || null
                        // housingType은 제거 - 모든 단독/다가구 유형을 검색
                    };
                    
                    // 빈 값 제거
                    Object.keys(detachedHouseSearchDTO).forEach(key => {
                        if (!detachedHouseSearchDTO[key]) delete detachedHouseSearchDTO[key];
                    });
                    
                    console.log('단독/다가구 매매 검색 조건:', detachedHouseSearchDTO);
                    const detachedHouseResult = await detachedHouseSaleApi.searchDetachedHouseSales(detachedHouseSearchDTO);
                    console.log('단독/다가구 매매 검색 결과:', detachedHouseResult);
                    
                    // 단독/다가구 데이터 변환
                    saleData = detachedHouseResult.map(item => ({
                        complexName: `${item.housingType} (${item.roadName})`, // 주택유형과 도로명으로 표시
                        sigungu: item.sigungu,
                        transactionAmount: item.transactionAmount,
                        exclusiveArea: item.totalArea, // 연면적을 전용면적으로 표시
                        dong: '', // 단독/다가구는 동 정보가 없음
                        floor: 1, // 단독/다가구는 1층으로 표시
                        contractDate: item.contractDate,
                        constructionYear: item.constructionYear,
                        roadName: item.roadName,
                        housingType: item.housingType,
                        transactionType: '매매'
                    }));
                } else if (searchForm.propertyType === '연립/다세대') {
                    // 연립/다세대 매매 검색
                    const rowHouseSearchDTO = {
                        sigungu: searchForm.searchSigungu || null,
                        buildingName: searchForm.searchComplexName || null
                    };
                    
                    // 빈 값 제거
                    Object.keys(rowHouseSearchDTO).forEach(key => {
                        if (!rowHouseSearchDTO[key]) delete rowHouseSearchDTO[key];
                    });
                    
                    console.log('연립/다세대 매매 검색 조건:', rowHouseSearchDTO);
                    const rowHouseResult = await rowHouseSaleApi.searchRowHouseSales(rowHouseSearchDTO);
                    console.log('연립/다세대 매매 검색 결과:', rowHouseResult);
                    
                    // 연립/다세대 데이터 변환
                    saleData = rowHouseResult.map(item => ({
                        complexName: `${item.buildingName} (${item.housingType})`, // 건물명과 주택유형으로 표시
                        sigungu: item.sigungu,
                        transactionAmount: item.transactionAmount,
                        exclusiveArea: item.exclusiveArea, // 전용면적
                        dong: '', // 연립/다세대는 동 정보가 없음
                        floor: item.floor, // 층 정보 있음
                        contractDate: item.contractDate,
                        constructionYear: item.constructionYear,
                        roadName: item.roadName,
                        housingType: item.housingType,
                        transactionType: '매매'
                    }));
                } else {
                    // 아파트 등 일반 매매 검색
                    const response = await fetch(`${API_SERVER_HOST}/api/apartment-sale/search?page=${currentPage}&size=20`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(searchForm)
                    });
                    
                    if (response.ok) {
                        data = await response.json();
                        // 매매 데이터에 거래구분 추가
                        saleData = data.content.map(item => ({
                            ...item,
                            transactionType: '매매'
                        }));
                    } else {
                        showModal('오류', '검색 중 오류가 발생했습니다.');
                        return;
                    }
                }
                
                allTransactions = [...saleData];
                setTransactions(allTransactions);
                setTotalPages(1); // 오피스텔은 페이지네이션 없음
                setTotalElements(allTransactions.length);
                setCurrentPage(0);
            } else {
                // 전체 검색 (매매 + 전월세)
                const searchPromises = [];
                
                // 전월세 검색 - 기본 조건만 사용
                let rentSearchPromise;
                
                if (searchForm.propertyType === '오피스텔') {
                    // 오피스텔 전/월세 검색
                    const officeTelRentSearchDTO = {
                        sigungu: searchForm.searchSigungu || null,
                        complexName: searchForm.searchComplexName || null
                    };
                    
                    // 빈 값 제거
                    Object.keys(officeTelRentSearchDTO).forEach(key => {
                        if (!officeTelRentSearchDTO[key]) delete officeTelRentSearchDTO[key];
                    });
                    
                    rentSearchPromise = officeTelRentApi.searchOfficeTelRents(officeTelRentSearchDTO);
                } else if (searchForm.propertyType === '단독/다가구') {
                    // 단독/다가구 전/월세 검색
                    const detachedHouseRentSearchDTO = {
                        sigungu: searchForm.searchSigungu || null
                        // housingType은 제거 - 모든 단독/다가구 유형을 검색
                    };
                    
                    // 빈 값 제거
                    Object.keys(detachedHouseRentSearchDTO).forEach(key => {
                        if (!detachedHouseRentSearchDTO[key]) delete detachedHouseRentSearchDTO[key];
                    });
                    
                    console.log('전체 검색 - 단독/다가구 전/월세 검색 조건:', detachedHouseRentSearchDTO);
                    rentSearchPromise = detachedHouseRentApi.searchDetachedHouseRents(detachedHouseRentSearchDTO);
                } else if (searchForm.propertyType === '연립/다세대') {
                    // 연립/다세대 전/월세 검색
                    const rowHouseRentSearchDTO = {
                        sigungu: searchForm.searchSigungu || null,
                        buildingName: searchForm.searchComplexName || null,
                        rentType: searchForm.rentType || null
                    };
                    
                    // 빈 값 제거
                    Object.keys(rowHouseRentSearchDTO).forEach(key => {
                        if (!rowHouseRentSearchDTO[key]) delete rowHouseRentSearchDTO[key];
                    });
                    
                    console.log('전체 검색 - 연립/다세대 전/월세 검색 조건:', rowHouseRentSearchDTO);
                    rentSearchPromise = rowHouseRentApi.searchRowHouseRents(rowHouseRentSearchDTO);
                } else {
                    // 아파트 등 일반 전/월세 검색
                    const rentSearchDTO = {
                        sigungu: searchForm.searchSigungu || null,
                        legalDong: searchForm.searchLegalDong || null,
                        complexName: searchForm.searchComplexName || null,
                        housingType: searchForm.propertyType || null
                    };
                    
                    // 빈 값 제거
                    Object.keys(rentSearchDTO).forEach(key => {
                        if (!rentSearchDTO[key]) delete rentSearchDTO[key];
                    });
                    
                    rentSearchPromise = apartmentRentApi.searchApartmentRents(rentSearchDTO);
                }
                
                searchPromises.push(rentSearchPromise);
                
                // 매매 검색 - 기본 조건만 사용
                let saleSearchPromise;
                
                if (searchForm.propertyType === '오피스텔') {
                    // 오피스텔 매매 검색
                    const officeTelSearchDTO = {
                        sigungu: searchForm.searchSigungu || null,
                        complexName: searchForm.searchComplexName || null
                    };
                    
                    // 빈 값 제거
                    Object.keys(officeTelSearchDTO).forEach(key => {
                        if (!officeTelSearchDTO[key]) delete officeTelSearchDTO[key];
                    });
                    
                    saleSearchPromise = officeTelSaleApi.searchOfficeTelSales(officeTelSearchDTO);
                } else if (searchForm.propertyType === '단독/다가구') {
                    // 단독/다가구 매매 검색
                    const detachedHouseSearchDTO = {
                        sigungu: searchForm.searchSigungu || null
                        // housingType은 제거 - 모든 단독/다가구 유형을 검색
                    };
                    
                    // 빈 값 제거
                    Object.keys(detachedHouseSearchDTO).forEach(key => {
                        if (!detachedHouseSearchDTO[key]) delete detachedHouseSearchDTO[key];
                    });
                    
                    console.log('전체 검색 - 단독/다가구 매매 검색 조건:', detachedHouseSearchDTO);
                    saleSearchPromise = detachedHouseSaleApi.searchDetachedHouseSales(detachedHouseSearchDTO);
                } else if (searchForm.propertyType === '연립/다세대') {
                    // 연립/다세대 매매 검색
                    const rowHouseSearchDTO = {
                        sigungu: searchForm.searchSigungu || null,
                        buildingName: searchForm.searchComplexName || null
                    };
                    
                    // 빈 값 제거
                    Object.keys(rowHouseSearchDTO).forEach(key => {
                        if (!rowHouseSearchDTO[key]) delete rowHouseSearchDTO[key];
                    });
                    
                    console.log('전체 검색 - 연립/다세대 매매 검색 조건:', rowHouseSearchDTO);
                    saleSearchPromise = rowHouseSaleApi.searchRowHouseSales(rowHouseSearchDTO);
                } else {
                    // 아파트 등 일반 매매 검색
                    const saleSearchBody = {};
                    if (searchForm.searchSigungu) saleSearchBody.searchSigungu = searchForm.searchSigungu;
                    if (searchForm.searchLegalDong) saleSearchBody.searchLegalDong = searchForm.searchLegalDong;
                    if (searchForm.searchComplexName) saleSearchBody.searchComplexName = searchForm.searchComplexName;
                    if (searchForm.propertyType) saleSearchBody.propertyType = searchForm.propertyType;
                    
                    saleSearchPromise = fetch(`${API_SERVER_HOST}/api/apartment-sale/search?page=0&size=100`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(saleSearchBody)
                    }).then(response => response.ok ? response.json() : { content: [] });
                }
                
                searchPromises.push(saleSearchPromise);
                
                // 두 API를 병렬로 호출
                const [rentResult, saleResult] = await Promise.all(searchPromises);
                
                console.log('전월세 검색 결과:', rentResult);
                console.log('매매 검색 결과:', saleResult);
                
                // 전월세 데이터 변환
                let rentData = [];
                
                if (searchForm.propertyType === '오피스텔') {
                    // 오피스텔 전/월세 데이터 변환
                    rentData = rentResult.map(item => ({
                        complexName: item.complexName,
                        sigungu: item.sigungu,
                        transactionAmount: item.deposit,
                        exclusiveArea: item.exclusiveArea,
                        dong: '',
                        floor: item.floor,
                        contractDate: item.contractDate,
                        constructionYear: item.constructionYear,
                        roadName: item.roadName,
                        housingType: '오피스텔',
                        deposit: item.deposit,
                        monthlyRent: item.monthlyRent,
                        rentType: item.rentType,
                        transactionType: '전/월세'
                    }));
                } else if (searchForm.propertyType === '단독/다가구') {
                    // 단독/다가구 전/월세 데이터 변환
                    rentData = rentResult.map(item => ({
                        complexName: `${item.housingType} (${item.roadName})`, // 주택유형과 도로명으로 표시
                        sigungu: item.sigungu,
                        transactionAmount: item.deposit,
                        exclusiveArea: item.contractArea, // 계약면적을 전용면적으로 표시
                        dong: '',
                        floor: 1, // 단독/다가구는 1층으로 표시
                        contractDate: item.contractDate,
                        constructionYear: item.constructionYear,
                        roadName: item.roadName,
                        housingType: item.housingType,
                        deposit: item.deposit,
                        monthlyRent: item.monthlyRent,
                        rentType: item.rentType,
                        transactionType: '전/월세'
                    }));
                } else if (searchForm.propertyType === '연립/다세대') {
                    // 연립/다세대 전/월세 데이터 변환
                    rentData = rentResult.map(item => ({
                        complexName: `${item.buildingName} (${item.housingType})`, // 건물명과 주택유형으로 표시
                        sigungu: item.sigungu,
                        transactionAmount: item.deposit, // 보증금을 거래가격으로 표시
                        exclusiveArea: item.exclusiveArea, // 전용면적
                        dong: '', // 연립/다세대는 동 정보가 없음
                        floor: item.floor, // 층 정보 있음
                        contractDate: item.contractDate,
                        constructionYear: item.constructionYear,
                        roadName: item.roadName,
                        housingType: item.housingType,
                        // 전월세 추가 정보
                        deposit: item.deposit,
                        monthlyRent: item.monthlyRent,
                        rentType: item.rentType,
                        transactionType: '전/월세'
                    }));
                } else {
                    // 아파트 등 일반 전/월세 데이터 변환
                    rentData = rentResult.map(item => ({
                        complexName: item.complexName,
                        sigungu: item.sigungu,
                        transactionAmount: item.deposit,
                        exclusiveArea: item.exclusiveArea,
                        dong: '',
                        floor: item.floor,
                        contractDate: item.contractDate,
                        constructionYear: item.constructionYear,
                        roadName: item.roadName,
                        housingType: item.housingType,
                        deposit: item.deposit,
                        monthlyRent: item.monthlyRent,
                        rentType: item.rentType,
                        transactionType: '전/월세'
                    }));
                }
                
                // 매매 데이터에 거래구분 추가
                let saleData = [];
                
                if (searchForm.propertyType === '오피스텔') {
                    // 오피스텔 데이터 변환
                    saleData = saleResult.map(item => ({
                        complexName: item.complexName,
                        sigungu: item.sigungu,
                        transactionAmount: item.transactionAmount,
                        exclusiveArea: item.exclusiveArea,
                        dong: '', // 오피스텔은 동 정보가 없을 수 있음
                        floor: item.floor,
                        contractDate: item.contractDate,
                        constructionYear: item.constructionYear,
                        roadName: item.roadName,
                        housingType: '오피스텔',
                        transactionType: '매매'
                    }));
                } else if (searchForm.propertyType === '단독/다가구') {
                    // 단독/다가구 데이터 변환
                    saleData = saleResult.map(item => ({
                        complexName: `${item.housingType} (${item.roadName})`, // 주택유형과 도로명으로 표시
                        sigungu: item.sigungu,
                        transactionAmount: item.transactionAmount,
                        exclusiveArea: item.totalArea, // 연면적을 전용면적으로 표시
                        dong: '', // 단독/다가구는 동 정보가 없음
                        floor: 1, // 단독/다가구는 1층으로 표시
                        contractDate: item.contractDate,
                        constructionYear: item.constructionYear,
                        roadName: item.roadName,
                        housingType: item.housingType,
                        transactionType: '매매',
                        // 추가 정보
                        totalArea: item.totalArea,
                        landArea: item.landArea,
                        roadCondition: item.roadCondition
                    }));
                } else if (searchForm.propertyType === '연립/다세대') {
                    // 연립/다세대 데이터 변환
                    saleData = saleResult.map(item => ({
                        complexName: `${item.buildingName} (${item.housingType})`, // 건물명과 주택유형으로 표시
                        sigungu: item.sigungu,
                        transactionAmount: item.transactionAmount,
                        exclusiveArea: item.exclusiveArea, // 전용면적
                        dong: '', // 연립/다세대는 동 정보가 없음
                        floor: item.floor, // 층 정보 있음
                        contractDate: item.contractDate,
                        constructionYear: item.constructionYear,
                        roadName: item.roadName,
                        housingType: item.housingType,
                        transactionType: '매매'
                    }));
                } else {
                    // 일반 매매 데이터
                    saleData = saleResult.content ? saleResult.content.map(item => ({
                        ...item,
                        transactionType: '매매'
                    })) : [];
                }
                
                console.log('변환된 전월세 데이터:', rentData);
                console.log('변환된 매매 데이터:', saleData);
                
                // 두 데이터 합치기
                allTransactions = [...rentData, ...saleData];
                
                console.log('합쳐진 전체 데이터:', allTransactions);
                
                // 계약일 기준으로 정렬 (최신순)
                allTransactions.sort((a, b) => new Date(b.contractDate) - new Date(a.contractDate));
                
                // 전체 데이터 저장
                setAllTransactions(allTransactions);
                setTotalElements(allTransactions.length);
                const calculatedTotalPages = Math.ceil(allTransactions.length / pageSize);
                setTotalPages(calculatedTotalPages);
                setCurrentPage(1);
                
                // 현재 페이지 데이터만 설정
                const currentPageData = getCurrentPageData(allTransactions, 1, pageSize);
                setTransactions(currentPageData);
                
                updateServerData(1, calculatedTotalPages);
                
                // 검색 결과를 캐시에 저장
                const cacheData = {
                    data: allTransactions,
                    totalElements: allTransactions.length,
                    totalPages: calculatedTotalPages
                };
                setCacheData(cacheKey, cacheData);
                console.log('검색 결과를 캐시에 저장:', cacheKey);
            }
            
            // 검색 결과가 없으면 검색 결과만 초기화 (검색 조건은 유지)
            if (allTransactions.length === 0) {
                setTimeout(() => {
                    setTransactions([]);
                    setTotalPages(0);
                    setTotalElements(0);
                    setCurrentPage(1);
                    showModal('알림', '검색 결과가 없습니다.');
                }, 1000);
            }
            
            // 검색 결과 설정
            setAllTransactions(allTransactions);
            setTotalElements(allTransactions.length);
            setTotalPages(Math.ceil(allTransactions.length / pageSize));
            setCurrentPage(1);
            
            const currentPageData = getCurrentPageData(allTransactions, 1, pageSize);
            setTransactions(currentPageData);
            updateServerData(1, Math.ceil(allTransactions.length / pageSize));
            
        } catch (error) {
            console.error('검색 오류:', error);
            showModal('오류', '검색 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };
    
    const handlePageChange = (newPage) => {
        const targetPage = newPage.page;
        setCurrentPage(targetPage);
        
        // 전체 데이터에서 해당 페이지 데이터만 추출
        const currentPageData = getCurrentPageData(allTransactions, targetPage, pageSize);
        setTransactions(currentPageData);
        
        updateServerData(targetPage, totalPages);
    };
    
    // PageComponent용 serverData 업데이트 함수
    const updateServerData = (current, totalPages) => {
        const pageNumList = [];
        const startPage = Math.max(1, Math.min(totalPages - 4, current - 2));
        const endPage = Math.min(totalPages, startPage + 4);
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumList.push(i);
        }
        
        setServerData({
            prev: current > 1,
            next: current < totalPages,
            prevPage: current - 1,
            nextPage: current + 1,
            pageNumList: pageNumList,
            current: current
        });
    };
    
    // 현재 페이지에 해당하는 데이터만 반환하는 함수
    const getCurrentPageData = (allData, currentPage, pageSize) => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return allData.slice(startIndex, endIndex);
    };
    
    const formatPrice = (price) => {
        if (!price) return '-';
        if (price >= 10000) {
            return (price / 10000).toFixed(1) + '억원';
        }
        return price + '만원';
    };
    
    const formatArea = (area) => {
        if (!area) return '-';
        return area + '㎡';
    };
    
    const formatDate = (date) => {
        if (!date) return '-';
        return date.toString();
    };
    
    // 매물 클릭 시 도로명 기준 실거래가 차트 표시
    const handlePropertyClick = (roadName) => {
        if (!roadName) {
            showModal('알림', '도로명 정보가 없습니다.');
            return;
        }
        
        setSelectedRoadName(roadName);
        setChartLoading(true);
        setShowRoadChart(true);
        
        // 기존 검색 결과에서 같은 도로명을 가진 매물들만 필터링
        // 검색한 거래 유형에 맞는 데이터만 필터링
        const sameRoadTransactions = allTransactions.filter(t => {
            if (t.roadName !== roadName) return false;
            
            // 검색한 거래 유형에 따라 필터링
            if (searchForm.transactionTypes && searchForm.transactionTypes.length > 0) {
                return searchForm.transactionTypes.includes(t.transactionType);
            }
            
            // 거래 유형이 지정되지 않았다면 모든 유형 허용
            return true;
        });
        
        if (sameRoadTransactions.length === 0) {
            showModal('알림', '해당 도로명의 실거래가 데이터가 없습니다.');
            setChartLoading(false);
            setShowRoadChart(false);
            return;
        }
        
        // MarketPriceChart에 맞는 데이터 형식으로 변환
        const marketPrices = {
            sales: sameRoadTransactions.map(t => ({
                contractDate: t.contractDate,
                transactionAmount: t.transactionType === '매매' ? t.transactionAmount : t.deposit,
                exclusiveArea: t.exclusiveArea,
                complexName: t.complexName,
                sigungu: t.sigungu,
                roadName: t.roadName,
                transactionType: t.transactionType
            }))
        };
        
        setRoadTransactionData(marketPrices);
        setChartLoading(false);
    };
    
    // 차트 닫기
    const handleCloseChart = () => {
        setShowRoadChart(false);
        setSelectedRoadName('');
        setRoadTransactionData(null);
    };
    
    return (
        <div className="max-w-7xl mx-auto p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">부동산 실거래가 검색</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* 메인 검색 영역 */}
                <div className="lg:col-span-4">
                   
            

            
            {/* 검색 폼 */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 min-w-[150px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        시도
                    </label>
                    <select
                        name="selectedSido"
                        value={selectedSido}
                        onChange={handleSidoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">전체</option>
                        <option value="서울특별시">서울특별시</option>
                        <option value="부산광역시">부산광역시</option>
                        <option value="대구광역시">대구광역시</option>
                        <option value="인천광역시">인천광역시</option>
                        <option value="대전광역시">대전광역시</option>
                    </select>
                </div>
                
                <div className="lg:col-span-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        시군구
                    </label>
                    <select
                        name="searchSigungu"
                        value={searchForm.searchSigungu}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">전체</option>
                        {selectedSido && sidoSigunguData[selectedSido] ? sidoSigunguData[selectedSido].map((sigungu, index) => (
                            <option key={index} value={sigungu}>{sigungu}</option>
                        )) : null}
                    </select>
                </div>
                
                <div className="lg:col-span-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        법정동
                    </label>
                    <select
                        name="searchLegalDong"
                        value={searchForm.searchLegalDong}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!searchForm.searchSigungu}
                    >
                        <option value="">전체</option>
                        {legalDongList.map((legalDong, index) => (
                            <option key={index} value={legalDong}>{legalDong}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            {/* 유형과 구분을 아래로 이동 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                <div className="lg:col-span-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        유형
                    </label>
                    <select
                        name="propertyType"
                        value={searchForm.propertyType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">전체</option>
                        <option value="아파트">아파트</option>
                        <option value="오피스텔">오피스텔</option>
                        <option value="연립/다세대">연립/다세대</option>
                        <option value="단독/다가구">단독/다가구</option>
                    </select>
                </div>
                
                <div className="lg:col-span-2 min-w-[400px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        구분
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setSearchForm(prev => ({ ...prev, transactionTypes: [] }))}
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                                !searchForm.transactionTypes || searchForm.transactionTypes.length === 0
                                    ? 'bg-blue-600 text-white border-blue-600' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            전체
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const currentTypes = searchForm.transactionTypes || [];
                                if (currentTypes.includes('매매')) {
                                    setSearchForm(prev => ({
                                        ...prev,
                                        transactionTypes: currentTypes.filter(type => type !== '매매')
                                    }));
                                } else {
                                    setSearchForm(prev => ({
                                        ...prev,
                                        transactionTypes: [...currentTypes, '매매']
                                    }));
                                }
                            }}
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                                (searchForm.transactionTypes || []).includes('매매')
                                    ? 'bg-blue-600 text-white border-blue-600' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            매매
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const currentTypes = searchForm.transactionTypes || [];
                                if (currentTypes.includes('전세')) {
                                    setSearchForm(prev => ({
                                        ...prev,
                                        transactionTypes: currentTypes.filter(type => type !== '전세')
                                    }));
                                } else {
                                    setSearchForm(prev => ({
                                        ...prev,
                                        transactionTypes: [...currentTypes, '전세']
                                    }));
                                }
                            }}
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                                (searchForm.transactionTypes || []).includes('전세')
                                    ? 'bg-blue-600 text-white border-blue-600' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            전세
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const currentTypes = searchForm.transactionTypes || [];
                                if (currentTypes.includes('월세')) {
                                    setSearchForm(prev => ({
                                        ...prev,
                                        transactionTypes: currentTypes.filter(type => type !== '월세')
                                    }));
                                } else {
                                    setSearchForm(prev => ({
                                        ...prev,
                                        transactionTypes: [...currentTypes, '월세']
                                    }));
                                }
                            }}
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                                (searchForm.transactionTypes || []).includes('월세')
                                    ? 'bg-blue-600 text-white border-blue-600' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            월세
                        </button>
                    </div>
                </div>
            </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            단지명
                        </label>
                        <input
                            type="text"
                            name="searchComplexName"
                            value={searchForm.searchComplexName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="단지명을 입력하세요"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            검색어
                        </label>
                        <input
                            type="text"
                            name="searchKeyword"
                            value={searchForm.searchKeyword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="단지명, 도로명 등"
                        />
                    </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                    >
                        {loading ? '검색 중...' : '검색'}
                    </button>
                    
                    <button
                        onClick={() => {
                            setSearchForm({
                                searchKeyword: '',
                                searchSigungu: '',
                                searchLegalDong: '',
                                searchComplexName: '',
                                propertyType: '',
                                transactionTypes: [],
                                rentType: ''
                            });
                            setCurrentPage(0);
                            setLegalDongList([]);
                        }}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                    >
                        초기화
                    </button>
                </div>
            </div>
            
                        {/* 검색 결과 */}
            {transactions.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                검색 결과 ({totalElements.toLocaleString()}건)
                            </h3>
                            
                            {/* 검색 조건 요약 */}
                            <div className="flex items-center gap-3 text-sm">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                    🏙️ 시도: {selectedSido || '전체'}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                    📍 시군구: {searchForm.searchSigungu || '전체'}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                    🏘️ 법정동: {searchForm.searchLegalDong || '전체'}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                    🏠 주택유형: {searchForm.propertyType || '전체'}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                    💰 거래구분: {searchForm.transactionTypes && searchForm.transactionTypes.length > 0 ? searchForm.transactionTypes.join(', ') : '전체'}
                                </span>
                                {searchForm.searchComplexName && (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                                        🏢 단지명: {searchForm.searchComplexName}
                                    </span>
                                )}
                                {searchForm.searchKeyword && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                        🔍 검색어: {searchForm.searchKeyword}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        단지명
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        거래구분
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {(searchForm.transactionTypes || []).includes('전세') || (searchForm.transactionTypes || []).includes('월세') ? '보증금' : '거래가격'}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        면적
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        동/층
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        도로명
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map((transaction, index) => (
                                    <tr 
                                        key={index} 
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handlePropertyClick(transaction.roadName)}
                                        title="클릭하여 동일 도로명 실거래가 차트 보기"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {transaction.complexName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                transaction.transactionType === '전세'
                                                    ? 'bg-green-100 text-green-800' 
                                                    : transaction.transactionType === '월세'
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {transaction.transactionType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                            {transaction.transactionType === '전세' || transaction.transactionType === '월세' ? (
                                                <div>
                                                    <div>보증금: {formatPrice(transaction.deposit)}</div>
                                                    {transaction.monthlyRent > 0 && (
                                                        <div className="text-sm text-gray-600">월세: {formatPrice(transaction.monthlyRent)}</div>
                                                    )}
                                                </div>
                                            ) : (
                                                formatPrice(transaction.transactionAmount)
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatArea(transaction.exclusiveArea)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {transaction.dong && transaction.dong.trim() !== '' ? `${transaction.dong}동` : ''} {transaction.floor}층
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {transaction.roadName}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* 페이지네이션 */}
                    {totalPages > 0 && (
                        <PageComponent 
                            serverData={serverData} 
                            movePage={handlePageChange} 
                        />
                    )}
                </div>
            )}
            
            {/* 검색 결과가 없을 때 */}
            {!loading && transactions.length === 0 && totalElements === 0 && (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                    <div className="text-gray-400 text-6xl mb-4">🏠</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                    <p className="text-gray-500">검색 조건을 변경하여 다시 시도해보세요.</p>
                </div>
            )}
                </div>
                
                {/* 오른쪽 인기 검색어 순위 */}
                <div className="lg:col-span-1">
                    <SearchRankingComponent />
                </div>
            </div>
            
            {/* 도로명 실거래가 차트 모달 */}
            {showRoadChart && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {selectedRoadName} 도로명 실거래가 분석
                            </h2>
                            <button
                                onClick={handleCloseChart}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {chartLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">실거래가 데이터를 불러오는 중...</p>
                                </div>
                            ) : roadTransactionData ? (
                                <MarketPriceChart 
                                    marketPrices={roadTransactionData} 
                                />
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    데이터를 불러올 수 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealEstateSearchComponent;
