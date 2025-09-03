import React, { useState, useEffect } from "react";
import useModal from "../../hooks/useModal";
import { API_SERVER_HOST } from "../../api/backendApi";
import { apartmentRentApi } from "../../api/apartmentRentApi";
import { officeTelSaleApi } from "../../api/officeTelSaleApi";
import { officeTelRentApi } from "../../api/officeTelRentApi";
import { detachedHouseSaleApi } from "../../api/detachedHouseSaleApi";
import { detachedHouseRentApi } from "../../api/detachedHouseRentApi";
import { rowHouseSaleApi } from "../../api/rowHouseSaleApi";
import { rowHouseRentApi } from "../../api/rowHouseRentApi";

const RealEstateSearchComponent = () => {
  const [searchForm, setSearchForm] = useState({
    searchKeyword: "",
    searchSigungu: "",
    searchLegalDong: "",
    searchComplexName: "",
    propertyType: "",
    transactionType: "",
    rentType: "",
  });

  // 주택유형 옵션 추가
  const propertyTypeOptions = [
    { value: "", label: "전체" },
    { value: "아파트", label: "아파트" },
    { value: "오피스텔", label: "오피스텔" },
    { value: "단독/다가구", label: "단독/다가구" },
    { value: "연립/다세대", label: "연립/다세대" },
  ];

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [sigunguList, setSigunguList] = useState([]);
  const [selectedSido, setSelectedSido] = useState("");
  const [sidoSigunguData, setSidoSigunguData] = useState({});
  const [legalDongList, setLegalDongList] = useState([]);

  const { showModal } = useModal();

  // 시군구 목록 로드
  useEffect(() => {
    // 시군구 목록을 정적 데이터로 설정
    const staticSigunguData = {
      서울특별시: [
        "강남구",
        "강동구",
        "강북구",
        "강서구",
        "관악구",
        "광진구",
        "구로구",
      ],
      부산광역시: [
        "강서구",
        "금정구",
        "남구",
        "동구",
        "동래구",
        "부산진구",
        "북구",
      ],
      대구광역시: [
        "남구",
        "달서구",
        "달성군",
        "동구",
        "북구",
        "서구",
        "수성구",
        "중구",
      ],
      인천광역시: [
        "계양구",
        "남구",
        "남동구",
        "동구",
        "부평구",
        "서구",
        "연수구",
      ],
      대전광역시: ["대덕구", "동구", "서구", "유성구", "중구"],
    };
    setSidoSigunguData(staticSigunguData);
  }, []);

  // 법정동 정적 데이터 설정 (각 구당 3개 이하)
  const staticLegalDongData = {
    강남구: ["개포동", "논현동", "대치동"],
    강동구: ["고덕동", "길동", "천호동"],
    강북구: ["미아동", "번동", "수유동"],
    강서구: ["가양동", "공항동", "화곡동"],
    관악구: ["봉천동", "신림동", "남현동"],
    광진구: ["구의동", "군자동", "자양동"],
    구로구: ["개봉동", "구로동", "신도림동"],
    금정구: ["구서동", "금사동", "부곡동"],
    남구: ["대연동", "문현동", "용당동"],
    동구: ["범일동", "수정동", "초량동"],
    동래구: ["명륜동", "복천동", "온천동"],
    부산진구: ["가야동", "개금동", "서면동"],
    북구: ["구포동", "덕천동", "만덕동"],
    달서구: ["갈산동", "감삼동", "상인동"],
    달성군: ["가창면", "구지면", "논공면"],
    동구: ["각산동", "검사동", "봉산동"],
    북구: ["검단동", "관문동", "구암동"],
    서구: ["내당동", "내덕동", "본동"],
    수성구: ["가천동", "고모동", "교동"],
    중구: ["계산동", "교동", "남성로동"],
    계양구: ["계산동", "동양동", "작전동"],
    남구: ["관동동", "구월동", "만수동"],
    남동구: ["구월동", "만수동", "논현동"],
    동구: ["만석동", "화수동", "화평동"],
    부평구: ["부평동", "십정동", "일신동"],
    서구: ["검단동", "연희동", "청라동"],
    연수구: ["동춘동", "선학동", "연수동"],
    대덕구: ["덕암동", "목상동", "부족동"],
    동구: ["대동", "대청동", "산내동"],
    서구: ["가수원동", "갈마동", "괴정동"],
    유성구: ["관평동", "구즉동", "노은동"],
    중구: ["구도동", "대사동", "목동"],
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
    setSearchForm((prev) => ({
      ...prev,
      searchSigungu: "",
      searchLegalDong: "",
    }));
    setLegalDongList([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      console.log("검색 시작 - 검색 조건:", searchForm);
      let data;
      let convertedData = []; // 전월세 데이터 변환용 변수 선언
      let allTransactions = []; // 전체 데이터를 저장할 배열

      // 거래구분에 따라 다른 API 호출
      if (searchForm.transactionType === "전/월세") {
        // 전월세 검색 (아파트 + 오피스텔)
        let rentData = [];

        if (searchForm.propertyType === "오피스텔") {
          // 오피스텔 전/월세 검색
          const officeTelRentSearchDTO = {
            sigungu: searchForm.searchSigungu || null,
            complexName: searchForm.searchComplexName || null,
            rentType: searchForm.rentType || null,
          };

          // 빈 값 제거
          Object.keys(officeTelRentSearchDTO).forEach((key) => {
            if (!officeTelRentSearchDTO[key])
              delete officeTelRentSearchDTO[key];
          });

          const officeTelRentResult =
            await officeTelRentApi.searchOfficeTelRents(officeTelRentSearchDTO);
          console.log("오피스텔 전/월세 검색 결과:", officeTelRentResult);

          // 오피스텔 전/월세 데이터 변환
          rentData = officeTelRentResult.map((item) => ({
            complexName: item.complexName,
            sigungu: item.sigungu,
            transactionAmount: item.deposit, // 보증금을 거래가격으로 표시
            exclusiveArea: item.exclusiveArea,
            dong: "", // 오피스텔은 동 정보가 없을 수 있음
            floor: item.floor,
            contractDate: item.contractDate,
            constructionYear: item.constructionYear,
            roadName: item.roadName,
            housingType: "오피스텔",
            // 전월세 추가 정보
            deposit: item.deposit,
            monthlyRent: item.monthlyRent,
            rentType: item.rentType,
            transactionType: "전/월세", // 거래구분 추가
          }));
        } else if (searchForm.propertyType === "단독/다가구") {
          // 단독/다가구 전/월세 검색
          const detachedHouseRentSearchDTO = {
            sigungu: searchForm.searchSigungu || null,
            rentType: searchForm.rentType || null,
            // housingType은 제거 - 모든 단독/다가구 유형을 검색
          };

          // 빈 값 제거
          Object.keys(detachedHouseRentSearchDTO).forEach((key) => {
            if (!detachedHouseRentSearchDTO[key])
              delete detachedHouseRentSearchDTO[key];
          });

          console.log(
            "단독/다가구 전/월세 검색 조건:",
            detachedHouseRentSearchDTO
          );
          const detachedHouseRentResult =
            await detachedHouseRentApi.searchDetachedHouseRents(
              detachedHouseRentSearchDTO
            );
          console.log(
            "단독/다가구 전/월세 검색 결과:",
            detachedHouseRentResult
          );

          // 단독/다가구 전/월세 데이터 변환
          rentData = detachedHouseRentResult.map((item) => ({
            complexName: `${item.housingType} (${item.roadName})`, // 주택유형과 도로명으로 표시
            sigungu: item.sigungu,
            transactionAmount: item.deposit, // 보증금을 거래가격으로 표시
            exclusiveArea: item.contractArea, // 계약면적을 전용면적으로 표시
            dong: "", // 단독/다가구는 동 정보가 없음
            floor: 1, // 단독/다가구는 1층으로 표시
            contractDate: item.contractDate,
            constructionYear: item.constructionYear,
            roadName: item.roadName,
            housingType: item.housingType,
            // 전월세 추가 정보
            deposit: item.deposit,
            monthlyRent: item.monthlyRent,
            rentType: item.rentType,
            transactionType: "전/월세", // 거래구분 추가
          }));
        } else if (searchForm.propertyType === "연립/다세대") {
          // 연립/다세대 전/월세 검색
          const rowHouseRentSearchDTO = {
            sigungu: searchForm.searchSigungu || null,
            buildingName: searchForm.searchComplexName || null,
            rentType: searchForm.rentType || null,
          };

          // 빈 값 제거
          Object.keys(rowHouseRentSearchDTO).forEach((key) => {
            if (!rowHouseRentSearchDTO[key]) delete rowHouseRentSearchDTO[key];
          });

          console.log("연립/다세대 전/월세 검색 조건:", rowHouseRentSearchDTO);
          const rowHouseRentResult = await rowHouseRentApi.searchRowHouseRents(
            rowHouseRentSearchDTO
          );
          console.log("연립/다세대 전/월세 검색 결과:", rowHouseRentResult);

          // 연립/다세대 전/월세 데이터 변환
          rentData = rowHouseRentResult.map((item) => ({
            complexName: `${item.buildingName} (${item.housingType})`, // 건물명과 주택유형으로 표시
            sigungu: item.sigungu,
            transactionAmount: item.deposit, // 보증금을 거래가격으로 표시
            exclusiveArea: item.exclusiveArea, // 전용면적
            dong: "", // 연립/다세대는 동 정보가 없음
            floor: item.floor, // 층 정보 있음
            contractDate: item.contractDate,
            constructionYear: item.constructionYear,
            roadName: item.roadName,
            housingType: item.housingType,
            // 전월세 추가 정보
            deposit: item.deposit,
            monthlyRent: item.monthlyRent,
            rentType: item.rentType,
            transactionType: "전/월세", // 거래구분 추가
          }));
        } else {
          // 아파트 등 일반 전/월세 검색
          const searchDTO = {
            sigungu: searchForm.searchSigungu,
            legalDong: searchForm.searchLegalDong,
            complexName: searchForm.searchComplexName,
            housingType: searchForm.propertyType,
            rentType: searchForm.rentType || "전세", // 기본값 전세
          };

          const result = await apartmentRentApi.searchApartmentRents(searchDTO);

          // 전월세 데이터를 매매 데이터와 동일한 형식으로 변환
          rentData = result.map((item) => ({
            complexName: item.complexName,
            sigungu: item.sigungu,
            transactionAmount: item.deposit, // 보증금을 거래가격으로 표시
            exclusiveArea: item.exclusiveArea,
            dong: "", // 전월세는 동 정보가 없을 수 있음
            floor: item.floor,
            contractDate: item.contractDate,
            constructionYear: item.constructionYear,
            roadName: item.roadName,
            housingType: item.housingType,
            // 전월세 추가 정보
            deposit: item.deposit,
            monthlyRent: item.monthlyRent,
            rentType: item.rentType,
            transactionType: "전/월세", // 거래구분 추가
          }));
        }

        allTransactions = [...rentData];
        setTransactions(allTransactions);
        setTotalPages(1); // 전월세는 페이지네이션 없음
        setTotalElements(allTransactions.length);
        setCurrentPage(0);
      } else if (searchForm.transactionType === "매매") {
        // 매매 검색 (아파트 + 오피스텔)
        let saleData = [];

        if (searchForm.propertyType === "오피스텔") {
          // 오피스텔 매매 검색
          const officeTelSearchDTO = {
            sigungu: searchForm.searchSigungu || null,
            complexName: searchForm.searchComplexName || null,
          };

          // 빈 값 제거
          Object.keys(officeTelSearchDTO).forEach((key) => {
            if (!officeTelSearchDTO[key]) delete officeTelSearchDTO[key];
          });

          const officeTelResult = await officeTelSaleApi.searchOfficeTelSales(
            officeTelSearchDTO
          );
          console.log("오피스텔 매매 검색 결과:", officeTelResult);

          // 오피스텔 데이터 변환
          saleData = officeTelResult.map((item) => ({
            complexName: item.complexName,
            sigungu: item.sigungu,
            transactionAmount: item.transactionAmount,
            exclusiveArea: item.exclusiveArea,
            dong: "", // 오피스텔은 동 정보가 없을 수 있음
            floor: item.floor,
            contractDate: item.contractDate,
            constructionYear: item.constructionYear,
            roadName: item.roadName,
            housingType: "오피스텔",
            transactionType: "매매",
          }));
        } else if (searchForm.propertyType === "단독/다가구") {
          // 단독/다가구 매매 검색
          const detachedHouseSearchDTO = {
            sigungu: searchForm.searchSigungu || null,
            // housingType은 제거 - 모든 단독/다가구 유형을 검색
          };

          // 빈 값 제거
          Object.keys(detachedHouseSearchDTO).forEach((key) => {
            if (!detachedHouseSearchDTO[key])
              delete detachedHouseSearchDTO[key];
          });

          console.log("단독/다가구 매매 검색 조건:", detachedHouseSearchDTO);
          const detachedHouseResult =
            await detachedHouseSaleApi.searchDetachedHouseSales(
              detachedHouseSearchDTO
            );
          console.log("단독/다가구 매매 검색 결과:", detachedHouseResult);

          // 단독/다가구 데이터 변환
          saleData = detachedHouseResult.map((item) => ({
            complexName: `${item.housingType} (${item.roadName})`, // 주택유형과 도로명으로 표시
            sigungu: item.sigungu,
            transactionAmount: item.transactionAmount,
            exclusiveArea: item.totalArea, // 연면적을 전용면적으로 표시
            dong: "", // 단독/다가구는 동 정보가 없음
            floor: 1, // 단독/다가구는 1층으로 표시
            contractDate: item.contractDate,
            constructionYear: item.constructionYear,
            roadName: item.roadName,
            housingType: item.housingType,
            transactionType: "매매",
          }));
        } else if (searchForm.propertyType === "연립/다세대") {
          // 연립/다세대 매매 검색
          const rowHouseSearchDTO = {
            sigungu: searchForm.searchSigungu || null,
            buildingName: searchForm.searchComplexName || null,
          };

          // 빈 값 제거
          Object.keys(rowHouseSearchDTO).forEach((key) => {
            if (!rowHouseSearchDTO[key]) delete rowHouseSearchDTO[key];
          });

          console.log("연립/다세대 매매 검색 조건:", rowHouseSearchDTO);
          const rowHouseResult = await rowHouseSaleApi.searchRowHouseSales(
            rowHouseSearchDTO
          );
          console.log("연립/다세대 매매 검색 결과:", rowHouseResult);

          // 연립/다세대 데이터 변환
          saleData = rowHouseResult.map((item) => ({
            complexName: `${item.buildingName} (${item.housingType})`, // 건물명과 주택유형으로 표시
            sigungu: item.sigungu,
            transactionAmount: item.transactionAmount,
            exclusiveArea: item.exclusiveArea, // 전용면적
            dong: "", // 연립/다세대는 동 정보가 없음
            floor: item.floor, // 층 정보 있음
            contractDate: item.contractDate,
            constructionYear: item.constructionYear,
            roadName: item.roadName,
            housingType: item.housingType,
            transactionType: "매매",
          }));
        } else {
          // 아파트 등 일반 매매 검색
          const response = await fetch(
            `${API_SERVER_HOST}/api/apartment-sale/search?page=${currentPage}&size=20`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(searchForm),
            }
          );

          if (response.ok) {
            data = await response.json();
            // 매매 데이터에 거래구분 추가
            saleData = data.content.map((item) => ({
              ...item,
              transactionType: "매매",
            }));
          } else {
            showModal("오류", "검색 중 오류가 발생했습니다.");
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

        if (searchForm.propertyType === "오피스텔") {
          // 오피스텔 전/월세 검색
          const officeTelRentSearchDTO = {
            sigungu: searchForm.searchSigungu || null,
            complexName: searchForm.searchComplexName || null,
          };

          // 빈 값 제거
          Object.keys(officeTelRentSearchDTO).forEach((key) => {
            if (!officeTelRentSearchDTO[key])
              delete officeTelRentSearchDTO[key];
          });

          rentSearchPromise = officeTelRentApi.searchOfficeTelRents(
            officeTelRentSearchDTO
          );
        } else if (searchForm.propertyType === "단독/다가구") {
          // 단독/다가구 전/월세 검색
          const detachedHouseRentSearchDTO = {
            sigungu: searchForm.searchSigungu || null,
            // housingType은 제거 - 모든 단독/다가구 유형을 검색
          };

          // 빈 값 제거
          Object.keys(detachedHouseRentSearchDTO).forEach((key) => {
            if (!detachedHouseRentSearchDTO[key])
              delete detachedHouseRentSearchDTO[key];
          });

          console.log(
            "전체 검색 - 단독/다가구 전/월세 검색 조건:",
            detachedHouseRentSearchDTO
          );
          rentSearchPromise = detachedHouseRentApi.searchDetachedHouseRents(
            detachedHouseRentSearchDTO
          );
        } else if (searchForm.propertyType === "연립/다세대") {
          // 연립/다세대 전/월세 검색
          const rowHouseRentSearchDTO = {
            sigungu: searchForm.searchSigungu || null,
            buildingName: searchForm.searchComplexName || null,
            rentType: searchForm.rentType || null,
          };

          // 빈 값 제거
          Object.keys(rowHouseRentSearchDTO).forEach((key) => {
            if (!rowHouseRentSearchDTO[key]) delete rowHouseRentSearchDTO[key];
          });

          console.log(
            "전체 검색 - 연립/다세대 전/월세 검색 조건:",
            rowHouseRentSearchDTO
          );
          rentSearchPromise = rowHouseRentApi.searchRowHouseRents(
            rowHouseRentSearchDTO
          );
        } else {
          // 아파트 등 일반 전/월세 검색
          const rentSearchDTO = {
            sigungu: searchForm.searchSigungu || null,
            legalDong: searchForm.searchLegalDong || null,
            complexName: searchForm.searchComplexName || null,
            housingType: searchForm.propertyType || null,
          };

          // 빈 값 제거
          Object.keys(rentSearchDTO).forEach((key) => {
            if (!rentSearchDTO[key]) delete rentSearchDTO[key];
          });

          rentSearchPromise =
            apartmentRentApi.searchApartmentRents(rentSearchDTO);
        }

        searchPromises.push(rentSearchPromise);

        // 매매 검색 - 기본 조건만 사용
        let saleSearchPromise;

        if (searchForm.propertyType === "오피스텔") {
          // 오피스텔 매매 검색
          const officeTelSearchDTO = {
            sigungu: searchForm.searchSigungu || null,
            complexName: searchForm.searchComplexName || null,
          };

          // 빈 값 제거
          Object.keys(officeTelSearchDTO).forEach((key) => {
            if (!officeTelSearchDTO[key]) delete officeTelSearchDTO[key];
          });

          saleSearchPromise =
            officeTelSaleApi.searchOfficeTelSales(officeTelSearchDTO);
        } else if (searchForm.propertyType === "단독/다가구") {
          // 단독/다가구 매매 검색
          const detachedHouseSearchDTO = {
            sigungu: searchForm.searchSigungu || null,
            // housingType은 제거 - 모든 단독/다가구 유형을 검색
          };

          // 빈 값 제거
          Object.keys(detachedHouseSearchDTO).forEach((key) => {
            if (!detachedHouseSearchDTO[key])
              delete detachedHouseSearchDTO[key];
          });

          console.log(
            "전체 검색 - 단독/다가구 매매 검색 조건:",
            detachedHouseSearchDTO
          );
          saleSearchPromise = detachedHouseSaleApi.searchDetachedHouseSales(
            detachedHouseSearchDTO
          );
        } else if (searchForm.propertyType === "연립/다세대") {
          // 연립/다세대 매매 검색
          const rowHouseSearchDTO = {
            sigungu: searchForm.searchSigungu || null,
            buildingName: searchForm.searchComplexName || null,
          };

          // 빈 값 제거
          Object.keys(rowHouseSearchDTO).forEach((key) => {
            if (!rowHouseSearchDTO[key]) delete rowHouseSearchDTO[key];
          });

          console.log(
            "전체 검색 - 연립/다세대 매매 검색 조건:",
            rowHouseSearchDTO
          );
          saleSearchPromise =
            rowHouseSaleApi.searchRowHouseSales(rowHouseSearchDTO);
        } else {
          // 아파트 등 일반 매매 검색
          const saleSearchBody = {};
          if (searchForm.searchSigungu)
            saleSearchBody.searchSigungu = searchForm.searchSigungu;
          if (searchForm.searchLegalDong)
            saleSearchBody.searchLegalDong = searchForm.searchLegalDong;
          if (searchForm.searchComplexName)
            saleSearchBody.searchComplexName = searchForm.searchComplexName;
          if (searchForm.propertyType)
            saleSearchBody.propertyType = searchForm.propertyType;

          saleSearchPromise = fetch(
            `${API_SERVER_HOST}/api/apartment-sale/search?page=0&size=100`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(saleSearchBody),
            }
          ).then((response) =>
            response.ok ? response.json() : { content: [] }
          );
        }

        searchPromises.push(saleSearchPromise);

        // 두 API를 병렬로 호출
        const [rentResult, saleResult] = await Promise.all(searchPromises);

        console.log("전월세 검색 결과:", rentResult);
        console.log("매매 검색 결과:", saleResult);

        // 전월세 데이터 변환
        let rentData = [];

        if (searchForm.propertyType === "오피스텔") {
          // 오피스텔 전/월세 데이터 변환
          rentData = rentResult.map((item) => ({
            complexName: item.complexName,
            sigungu: item.sigungu,
            transactionAmount: item.deposit,
            exclusiveArea: item.exclusiveArea,
            dong: "",
            floor: item.floor,
            contractDate: item.contractDate,
            constructionYear: item.constructionYear,
            roadName: item.roadName,
            housingType: "오피스텔",
            deposit: item.deposit,
            monthlyRent: item.monthlyRent,
            rentType: item.rentType,
            transactionType: "전/월세",
          }));
        } else if (searchForm.propertyType === "단독/다가구") {
          // 단독/다가구 전/월세 데이터 변환
          rentData = rentResult.map((item) => ({
            complexName: `${item.housingType} (${item.roadName})`, // 주택유형과 도로명으로 표시
            sigungu: item.sigungu,
            transactionAmount: item.deposit,
            exclusiveArea: item.contractArea, // 계약면적을 전용면적으로 표시
            dong: "",
            floor: 1, // 단독/다가구는 1층으로 표시
            contractDate: item.contractDate,
            constructionYear: item.constructionYear,
            roadName: item.roadName,
            housingType: item.housingType,
            deposit: item.deposit,
            monthlyRent: item.monthlyRent,
            rentType: item.rentType,
            transactionType: "전/월세",
          }));
        } else if (searchForm.propertyType === "연립/다세대") {
          // 연립/다세대 전/월세 데이터 변환
          rentData = rentResult.map((item) => ({
            complexName: `${item.buildingName} (${item.housingType})`, // 건물명과 주택유형으로 표시
            sigungu: item.sigungu,
            transactionAmount: item.deposit, // 보증금을 거래가격으로 표시
            exclusiveArea: item.exclusiveArea, // 전용면적
            dong: "", // 연립/다세대는 동 정보가 없음
            floor: item.floor, // 층 정보 있음
            contractDate: item.contractDate,
            constructionYear: item.constructionYear,
            roadName: item.roadName,
            housingType: item.housingType,
            // 전월세 추가 정보
            deposit: item.deposit,
            monthlyRent: item.monthlyRent,
            rentType: item.rentType,
            transactionType: "전/월세",
          }));
        } else {
          // 아파트 등 일반 전/월세 데이터 변환
          rentData = rentResult.map((item) => ({
            complexName: item.complexName,
            sigungu: item.sigungu,
            transactionAmount: item.deposit,
            exclusiveArea: item.exclusiveArea,
            dong: "",
            floor: item.floor,
            contractDate: item.contractDate,
            constructionYear: item.constructionYear,
            roadName: item.roadName,
            housingType: item.housingType,
            deposit: item.deposit,
            monthlyRent: item.monthlyRent,
            rentType: item.rentType,
            transactionType: "전/월세",
          }));
        }

        // 매매 데이터에 거래구분 추가
        let saleData = [];

        if (searchForm.propertyType === "오피스텔") {
          // 오피스텔 데이터 변환
          saleData = saleResult.map((item) => ({
            complexName: item.complexName,
            sigungu: item.sigungu,
            transactionAmount: item.transactionAmount,
            exclusiveArea: item.exclusiveArea,
            dong: "", // 오피스텔은 동 정보가 없을 수 있음
            floor: item.floor,
            contractDate: item.contractDate,
            constructionYear: item.constructionYear,
            roadName: item.roadName,
            housingType: "오피스텔",
            transactionType: "매매",
          }));
        } else if (searchForm.propertyType === "단독/다가구") {
          // 단독/다가구 데이터 변환
          saleData = saleResult.map((item) => ({
            complexName: `${item.housingType} (${item.roadName})`, // 주택유형과 도로명으로 표시
            sigungu: item.sigungu,
            transactionAmount: item.transactionAmount,
            exclusiveArea: item.totalArea, // 연면적을 전용면적으로 표시
            dong: "", // 단독/다가구는 동 정보가 없음
            floor: 1, // 단독/다가구는 1층으로 표시
            contractDate: item.contractDate,
            constructionYear: item.constructionYear,
            roadName: item.roadName,
            housingType: item.housingType,
            transactionType: "매매",
            // 추가 정보
            totalArea: item.totalArea,
            landArea: item.landArea,
            roadCondition: item.roadCondition,
          }));
        } else if (searchForm.propertyType === "연립/다세대") {
          // 연립/다세대 데이터 변환
          saleData = saleResult.map((item) => ({
            complexName: `${item.buildingName} (${item.housingType})`, // 건물명과 주택유형으로 표시
            sigungu: item.sigungu,
            transactionAmount: item.transactionAmount,
            exclusiveArea: item.exclusiveArea, // 전용면적
            dong: "", // 연립/다세대는 동 정보가 없음
            floor: item.floor, // 층 정보 있음
            contractDate: item.contractDate,
            constructionYear: item.constructionYear,
            roadName: item.roadName,
            housingType: item.housingType,
            transactionType: "매매",
          }));
        } else {
          // 일반 매매 데이터
          saleData = saleResult.content
            ? saleResult.content.map((item) => ({
                ...item,
                transactionType: "매매",
              }))
            : [];
        }

        console.log("변환된 전월세 데이터:", rentData);
        console.log("변환된 매매 데이터:", saleData);

        // 두 데이터 합치기
        allTransactions = [...rentData, ...saleData];

        console.log("합쳐진 전체 데이터:", allTransactions);

        // 계약일 기준으로 정렬 (최신순)
        allTransactions.sort(
          (a, b) => new Date(b.contractDate) - new Date(a.contractDate)
        );

        setTransactions(allTransactions);
        setTotalPages(1); // 전체 검색은 페이지네이션 없음
        setTotalElements(allTransactions.length);
        setCurrentPage(0);
      }

      // 검색 결과가 없으면 검색 결과만 초기화 (검색 조건은 유지)
      if (allTransactions.length === 0) {
        setTimeout(() => {
          setTransactions([]);
          setTotalPages(0);
          setTotalElements(0);
          setCurrentPage(0);
          showModal("알림", "검색 결과가 없습니다.");
        }, 1000);
      }
    } catch (error) {
      console.error("검색 오류:", error);
      showModal("오류", "검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // 페이지 변경 후 검색 실행
    setTimeout(() => handleSearch(), 100);
  };

  const formatPrice = (price) => {
    if (!price) return "-";
    if (price >= 10000) {
      return (price / 10000).toFixed(1) + "억원";
    }
    return price + "만원";
  };

  const formatArea = (area) => {
    if (!area) return "-";
    return area + "㎡";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return date.toString();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        부동산 실거래가 검색
      </h2>

      {/* 검색 폼 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
              {selectedSido && sidoSigunguData[selectedSido]
                ? sidoSigunguData[selectedSido].map((sigungu, index) => (
                    <option key={index} value={sigungu}>
                      {sigungu}
                    </option>
                  ))
                : null}
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
                <option key={index} value={legalDong}>
                  {legalDong}
                </option>
              ))}
            </select>
          </div>

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

          <div className="lg:col-span-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              구분
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setSearchForm((prev) => ({ ...prev, transactionType: "" }))
                }
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  !searchForm.transactionType ||
                  searchForm.transactionType === ""
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                전체
              </button>
              <button
                type="button"
                onClick={() =>
                  setSearchForm((prev) => ({
                    ...prev,
                    transactionType: "매매",
                  }))
                }
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  searchForm.transactionType === "매매"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                매매
              </button>
              <button
                type="button"
                onClick={() =>
                  setSearchForm((prev) => ({
                    ...prev,
                    transactionType: "전/월세",
                  }))
                }
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  searchForm.transactionType === "전/월세"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                전/월세
              </button>
            </div>

            {/* 전월세 구분 선택 (전월세 선택 시에만 표시) */}
            {searchForm.transactionType === "전/월세" && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전월세 구분
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSearchForm((prev) => ({ ...prev, rentType: "전세" }))
                    }
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      searchForm.rentType === "전세"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    전세
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSearchForm((prev) => ({ ...prev, rentType: "월세" }))
                    }
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      searchForm.rentType === "월세"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    월세
                  </button>
                </div>
              </div>
            )}
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
            {loading ? "검색 중..." : "검색"}
          </button>

          <button
            onClick={() => {
              setSearchForm({
                searchKeyword: "",
                searchSigungu: "",
                searchLegalDong: "",
                searchComplexName: "",
                propertyType: "",
                transactionType: "",
                rentType: "",
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
            <h3 className="text-lg font-semibold text-gray-800">
              검색 결과 ({totalElements.toLocaleString()}건)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    단지명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    시군구
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    거래구분
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {searchForm.transactionType === "전/월세"
                      ? "보증금"
                      : "거래가격"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    면적
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    동/층
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    계약일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    건축년도
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    도로명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주택유형
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.complexName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.sigungu}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          transaction.transactionType === "전/월세"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {transaction.transactionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {transaction.transactionType === "전/월세" ? (
                        <div>
                          <div>보증금: {formatPrice(transaction.deposit)}</div>
                          {transaction.monthlyRent > 0 && (
                            <div className="text-sm text-gray-600">
                              월세: {formatPrice(transaction.monthlyRent)}
                            </div>
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
                      {transaction.dong && transaction.dong.trim() !== ""
                        ? `${transaction.dong}동`
                        : ""}{" "}
                      {transaction.floor}층
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.contractDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.constructionYear}년
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.roadName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.housingType}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50"
              >
                이전
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                  if (pageNum >= totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-md ${
                        pageNum === currentPage
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          )}
        </div>
      )}

      {/* 검색 결과가 없을 때 */}
      {!loading && transactions.length === 0 && totalElements === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🏠</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-gray-500">
            검색 조건을 변경하여 다시 시도해보세요.
          </p>
        </div>
      )}
    </div>
  );
};

export default RealEstateSearchComponent;
