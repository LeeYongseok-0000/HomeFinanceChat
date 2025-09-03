import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPropertyDetail,
  deleteProperty,
  likeProperty,
  getMarketPrice,
} from "../../api/propertyApi";
import {
  getPropertyInquiries,
  createPropertyInquiry,
  createInquiryReply,
  deletePropertyInquiry,
  deleteInquiryReply,
} from "../../api/propertyApi";
import { getCookie } from "../../util/cookieUtil";
import { maskEmail } from "../../util/emailUtil";
import { formatAmountToKorean } from "../../util/currencyUtil";
import { getCurrentUser } from "../../util/jwtUtil";

// 실거래가 API 함수들 import
import { createApartmentSale } from "../../api/apartmentSaleApi";
import { createApartmentRent } from "../../api/apartmentRentApi";
import { createOfficeTelSale } from "../../api/officeTelSaleApi";
import { createOfficeTelRent } from "../../api/officeTelRentApi";
import { createDetachedHouseSale } from "../../api/detachedHouseSaleApi";
import { createDetachedHouseRent } from "../../api/detachedHouseRentApi";
import { createRowHouseSale } from "../../api/rowHouseSaleApi";
import { createRowHouseRent } from "../../api/rowHouseRentApi";

import MarketPriceChart from "./MarketPriceChart";

// boolean 값을 텍스트로 변환하는 함수
const formatBooleanValue = (value) => {
  // 문자열 "true"/"false"도 처리
  if (value === true || value === "true") {
    return "가능";
  } else if (value === false || value === "false") {
    return "불가능";
  }
  return value;
};

function ReadComponent() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ content: "", writer: "" });
  const [replyForm, setReplyForm] = useState({ content: "", writer: "" });
  const [replyingTo, setReplyingTo] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [slideDirection, setSlideDirection] = useState("right");

  const [marketPrices, setMarketPrices] = useState({ sales: [], rents: [] });

  // 컴포넌트 마운트 시 사용자 정보 설정
  useEffect(() => {
    const memberInfo = getCookie("member");
    if (memberInfo && memberInfo.email) {
      setInquiryForm((prev) => ({ ...prev, writer: memberInfo.email }));
      setReplyForm((prev) => ({ ...prev, writer: memberInfo.email }));
    }
  }, []);

  const handleEdit = (property) => {
    // 수정 페이지로 이동
    navigate(`/property/modify/${property.id}`);
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm("정말로 이 매물을 삭제하시겠습니까?")) {
      try {
        await deleteProperty(propertyId);
        alert("매물이 삭제되었습니다.");
        navigate("/property/list");
      } catch (error) {
        console.error("매물 삭제에 실패했습니다:", error);
        alert("매물 삭제에 실패했습니다.");
      }
    }
  };

  const handleBackToList = () => {
    navigate("/property/list");
  };

  useEffect(() => {
    console.log("ReadComponent 마운트됨, propertyId:", propertyId);
    if (propertyId) {
      loadPropertyDetail();
      loadInquiries();
      loadMarketPrices();
    } else {
      console.log("propertyId가 없습니다.");
    }
  }, [propertyId]);

  // 이미지 전환 함수 (슬라이드 효과)
  const changeImage = (direction) => {
    if (
      !property ||
      !property.imageUrls ||
      property.imageUrls.length <= 1 ||
      isRotating
    )
      return;

    setSlideDirection(direction);
    setIsRotating(true);

    setTimeout(() => {
      if (direction === "prev") {
        const prevIndex =
          currentImageIndex > 0
            ? currentImageIndex - 1
            : property.imageUrls.length - 1;
        setCurrentImageIndex(prevIndex);
      } else if (direction === "next") {
        const nextIndex =
          currentImageIndex < property.imageUrls.length - 1
            ? currentImageIndex + 1
            : 0;
        setCurrentImageIndex(nextIndex);
      }

      setTimeout(() => {
        setIsRotating(false);
      }, 300);
    }, 300);
  };

  // 키보드 방향키 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!property || !property.imageUrls || property.imageUrls.length <= 1)
        return;

      if (e.key === "ArrowLeft") {
        changeImage("prev");
      } else if (e.key === "ArrowRight") {
        changeImage("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [property, currentImageIndex, isRotating]);

  const loadPropertyDetail = async () => {
    try {
      console.log("매물 상세 정보 로딩 시작 - ID:", propertyId);
      const currentUser = getCurrentUser();
      const memberEmail = currentUser ? currentUser.email : null;
      const data = await getPropertyDetail(propertyId, memberEmail);
      console.log("매물 상세 정보 로딩 완료:", data);
      console.log("이미지 URLs:", data.imageUrls);
      setProperty(data);
    } catch (error) {
      console.error("매물 상세 정보 로딩 실패:", error);
      setError("매물 정보를 불러오는데 실패했습니다: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadInquiries = async () => {
    try {
      console.log("댓글 목록 로딩 시작 - 매물 ID:", propertyId);
      const data = await getPropertyInquiries(propertyId);
      console.log("댓글 목록 로딩 완료:", data);
      setInquiries(data);
    } catch (error) {
      console.error("댓글 목록을 불러오는데 실패했습니다:", error);
    }
  };

  // 실거래가 조회
  const loadMarketPrices = async () => {
    try {
      console.log("실거래가 조회 시작 - propertyId:", propertyId);
      console.log("Property 정보:", property);
      console.log("Property address:", property?.address);
      console.log("Property area:", property?.area);

      const data = await getMarketPrice(propertyId);
      console.log("실거래가 API 응답:", data);

      setMarketPrices(data);
    } catch (error) {
      console.error("실거래가 조회 실패:", error);
    }
  };

  const handleInquiryChange = (e) => {
    const { name, value } = e.target;
    setInquiryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReplyChange = (e) => {
    const { name, value } = e.target;
    setReplyForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryForm.content.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const memberInfo = getCookie("member");
      const inquiryData = {
        content: inquiryForm.content,
        writer: memberInfo ? memberInfo.name || "익명" : "익명",
        writerEmail: inquiryForm.writer,
      };

      console.log("댓글 작성 시도 - 매물 ID:", propertyId);
      console.log("댓글 데이터:", inquiryData);
      console.log("memberInfo:", memberInfo);

      await createPropertyInquiry(propertyId, inquiryData);
      setInquiryForm({ content: "", writer: inquiryForm.writer });
      setShowInquiryForm(false);
      loadInquiries(); // 댓글 목록 새로고침
    } catch (error) {
      console.error("댓글 작성 에러 상세:", error);
      alert("댓글 작성에 실패했습니다: " + error.message);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyForm.content.trim()) {
      alert("답글 내용을 입력해주세요.");
      return;
    }

    try {
      const memberInfo = getCookie("member");
      const replyData = {
        content: replyForm.content,
        writer: memberInfo ? memberInfo.name || "익명" : "익명",
        writerEmail: replyForm.writer,
      };

      await createInquiryReply(replyingTo.id, replyData);
      setReplyForm({ content: "", writer: replyForm.writer });
      setReplyingTo(null);
      loadInquiries(); // 댓글 목록 새로고침
    } catch (error) {
      alert("답글 작성에 실패했습니다.");
    }
  };

  const handleInquiryDelete = async (inquiryId) => {
    if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      try {
        const memberInfo = getCookie("member");
        await deletePropertyInquiry(inquiryId, memberInfo.email);
        loadInquiries(); // 댓글 목록 새로고침
      } catch (error) {
        alert("댓글 삭제에 실패했습니다.");
      }
    }
  };

  const handleReplyDelete = async (replyId) => {
    if (window.confirm("정말로 이 답글을 삭제하시겠습니까?")) {
      try {
        const memberInfo = getCookie("member");
        await deleteInquiryReply(replyId, memberInfo.email);
        loadInquiries(); // 댓글 목록 새로고침
      } catch (error) {
        alert("답글 삭제에 실패했습니다.");
      }
    }
  };

  const handleLike = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.email) {
        alert("로그인이 필요합니다.");
        return;
      }

      await likeProperty(propertyId, currentUser.email);
      loadPropertyDetail(); // 좋아요 상태 새로고침
    } catch (error) {
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  const handleTransactionComplete = async () => {
    if (window.confirm("해당 매물의 거래가 완료되었습니까?")) {
      try {
        // 현재 날짜를 거래일자로 설정
        const contractDate = new Date().toISOString().split("T")[0];

        // Property 정보를 기반으로 실거래가 데이터 생성
        // 컬럼명을 정확히 매핑
        const realEstateData = {
          // ApartmentSale/ApartmentRent 테이블의 컬럼명과 정확히 일치
          sigungu: property.roadAddress?.split(" ")[1] || "시군구",
          contractDate: contractDate,
          transactionAmount:
            parseInt(property.price.replace(/[^0-9]/g, "")) || 0,
          constructionYear:
            parseInt(property.yearBuilt) || new Date().getFullYear(),
          roadName: property.roadAddress || "도로명",
          transactionType: property.transactionType,
        };

        // 매물 유형에 따라 다른 필드 추가
        // 실거래가 저장 성공 여부를 추적하는 변수
        let realEstateSaveSuccess = true;
        let errorMessage = "";

        if (property.propertyType === "아파트") {
          if (property.transactionType === "매매") {
            // ApartmentSale 테이블의 컬럼명과 정확히 일치
            realEstateData.complexName = property.title || "아파트"; // complex_name 컬럼
            realEstateData.exclusiveArea = parseFloat(property.area) || 30.0; // exclusive_area 컬럼
            realEstateData.dong = property.detailAddress || "101동"; // dong 컬럼
            realEstateData.floor = parseInt(property.floor) || 1; // floor 컬럼
            realEstateData.housingType = "아파트"; // housing_type 컬럼
            // transactionAmount, sigungu, contractDate, constructionYear, roadName, transactionType은 이미 설정됨

            // 디버깅: 전송되는 데이터 로그
            console.log("아파트 매매 실거래가 데이터:", realEstateData);

            // 아파트 매매 API 호출
            try {
              await createApartmentSale(realEstateData);
              console.log("아파트 매매 실거래가 등록 성공");
            } catch (error) {
              console.error("아파트 매매 실거래가 등록 실패:", error);
              realEstateSaveSuccess = false;
              errorMessage = "아파트 매매 실거래가 저장 실패";
            }
          } else {
            // ApartmentRent 테이블의 컬럼명과 정확히 일치
            realEstateData.complexName = property.title || "아파트"; // complex_name 컬럼
            realEstateData.rentType = property.transactionType; // rent_type 컬럼
            realEstateData.exclusiveArea = parseFloat(property.area) || 30.0; // exclusive_area 컬럼
            realEstateData.deposit =
              parseInt(property.price.replace(/[^0-9]/g, "")) || 0; // deposit 컬럼
            realEstateData.monthlyRent =
              property.transactionType === "월세"
                ? parseInt(property.monthlyRent?.replace(/[^0-9]/g, "") || "0")
                : 0; // monthly_rent 컬럼
            realEstateData.floor = parseInt(property.floor) || 1; // floor 컬럼
            realEstateData.housingType = "아파트"; // housing_type 컬럼
            // sigungu, contractDate, constructionYear, roadName, transactionType은 이미 설정됨

            // 디버깅: 전송되는 데이터 로그
            console.log("아파트 전월세 실거래가 데이터:", realEstateData);

            // 아파트 전월세 API 호출
            try {
              await createApartmentRent(realEstateData);
              console.log("아파트 전월세 실거래가 등록 성공");
            } catch (error) {
              console.error("아파트 전월세 실거래가 등록 실패:", error);
              realEstateSaveSuccess = false;
              errorMessage = "아파트 전월세 실거래가 저장 실패";
            }
          }
        } else if (property.propertyType === "오피스텔") {
          if (property.transactionType === "매매") {
            realEstateData.complexName = property.title || "오피스텔"; // 단지명
            realEstateData.exclusiveArea = parseFloat(property.area) || 30.0; // 전용면적
            realEstateData.transactionAmount = parseInt(
              property.price.replace(/[^0-9]/g, "") || "0"
            ); // 거래금액
            realEstateData.floor = parseInt(property.floor) || 1; // 층
            realEstateData.transactionType = "매매"; // 거래구분 명시적 설정
            realEstateData.housingType = "오피스텔"; // 주택유형 설정
            // sigungu, contractDate, constructionYear, roadName은 이미 설정됨

            // 디버깅: 전송되는 데이터 로그
            console.log("오피스텔 매매 실거래가 데이터:", realEstateData);
            console.log("데이터 타입 확인:", {
              complexName: typeof realEstateData.complexName,
              exclusiveArea: typeof realEstateData.exclusiveArea,
              transactionAmount: typeof realEstateData.transactionAmount,
              floor: typeof realEstateData.floor,
              sigungu: typeof realEstateData.sigungu,
              contractDate: typeof realEstateData.contractDate,
              constructionYear: typeof realEstateData.constructionYear,
              roadName: typeof realEstateData.roadName,
              transactionType: typeof realEstateData.transactionType,
            });

            // 오피스텔 매매 API 호출
            try {
              await createOfficeTelSale(realEstateData);
              console.log("오피스텔 매매 실거래가 등록 성공");
            } catch (error) {
              console.error("오피스텔 매매 실거래가 등록 실패:", error);
              realEstateSaveSuccess = false;
              errorMessage = "오피스텔 매매 실거래가 저장 실패";
            }
          } else {
            realEstateData.complexName = property.title || "오피스텔"; // 단지명
            realEstateData.rentType = property.transactionType; // 전월세구분
            realEstateData.exclusiveArea = parseFloat(property.area) || 30.0; // 전용면적
            realEstateData.deposit =
              parseInt(property.price.replace(/[^0-9]/g, "")) || 0; // 보증금
            realEstateData.monthlyRent =
              property.transactionType === "월세"
                ? parseInt(property.monthlyRent?.replace(/[^0-9]/g, "") || "0")
                : 0; // 월세금
            realEstateData.floor = parseInt(property.floor) || 1; // 층
            realEstateData.transactionType = property.transactionType; // 거래구분 명시적 설정
            realEstateData.housingType = "오피스텔"; // 주택유형 설정
            // sigungu, contractDate, constructionYear, roadName은 이미 설정됨

            // 디버깅: 전송되는 데이터 로그
            console.log("오피스텔 전월세 실거래가 데이터:", realEstateData);

            // 오피스텔 전월세 API 호출
            try {
              await createOfficeTelRent(realEstateData);
              console.log("오피스텔 전월세 실거래가 등록 성공");
            } catch (error) {
              console.error("오피스텔 전월세 실거래가 등록 실패:", error);
              realEstateSaveSuccess = false;
              errorMessage = "오피스텔 전월세 실거래가 저장 실패";
            }
          }
        } else if (property.propertyType === "단독주택") {
          if (property.transactionType === "매매") {
            realEstateData.housingType = "단독주택";
            realEstateData.roadCondition = "포장";
            realEstateData.totalArea = parseFloat(property.area) || 0;
            realEstateData.landArea = parseFloat(property.area) || 0;
            realEstateData.transactionAmount = parseInt(
              property.price.replace(/[^0-9]/g, "") || "0"
            ); // 거래금액 추가
            realEstateData.transactionType = "매매"; // 거래구분 명시적 설정

            // 단독주택 매매 API 호출
            try {
              await createDetachedHouseSale(realEstateData);
              console.log("단독주택 매매 실거래가 등록 성공");
            } catch (error) {
              console.error("단독주택 매매 실거래가 등록 실패:", error);
              realEstateSaveSuccess = false;
              errorMessage = "단독주택 매매 실거래가 저장 실패";
            }
          } else {
            realEstateData.housingType = "단독주택";
            realEstateData.rentType = property.transactionType;
            realEstateData.contractArea = parseFloat(property.area) || 0; // exclusiveArea -> contractArea로 변경
            realEstateData.roadCondition = "포장"; // 도로조건 설정
            realEstateData.deposit =
              parseInt(property.price.replace(/[^0-9]/g, "")) || 0;
            realEstateData.monthlyRent =
              property.transactionType === "월세"
                ? parseInt(property.monthlyRent?.replace(/[^0-9]/g, "") || "0")
                : 0;
            realEstateData.floor = parseInt(property.floor) || 1;
            realEstateData.transactionType = property.transactionType; // 거래구분 명시적 설정

            // 단독주택 전월세 API 호출
            try {
              await createDetachedHouseRent(realEstateData);
              console.log("단독주택 전월세 실거래가 등록 성공");
            } catch (error) {
              console.error("단독주택 전월세 실거래가 등록 실패:", error);
              realEstateSaveSuccess = false;
              errorMessage = "단독주택 전월세 실거래가 저장 실패";
            }
          }
        } else if (property.propertyType === "연립/다세대") {
          if (property.transactionType === "매매") {
            realEstateData.housingType = "연립/다세대";
            realEstateData.roadCondition = "포장";
            realEstateData.totalArea = parseFloat(property.area) || 0;
            realEstateData.landArea = parseFloat(property.area) || 0;
            realEstateData.transactionAmount = parseInt(
              property.price.replace(/[^0-9]/g, "") || "0"
            ); // 거래금액 추가
            realEstateData.transactionType = "매매"; // 거래구분 명시적 설정

            // 연립/다세대 매매 API 호출
            try {
              await createRowHouseSale(realEstateData);
              console.log("연립/다세대 매매 실거래가 등록 성공");
            } catch (error) {
              console.error("연립/다세대 매매 실거래가 등록 실패:", error);
              realEstateSaveSuccess = false;
              errorMessage = "연립/다세대 매매 실거래가 저장 실패";
            }
          } else {
            realEstateData.housingType = "연립/다세대";
            realEstateData.rentType = property.transactionType;
            realEstateData.exclusiveArea = parseFloat(property.area) || 30.0; // 기본값 30㎡
            realEstateData.deposit = parseInt(
              property.price.replace(/[^0-9]/g, "") || 0
            );
            realEstateData.monthlyRent =
              property.transactionType === "월세"
                ? parseInt(property.monthlyRent?.replace(/[^0-9]/g, "") || "0")
                : 0;
            realEstateData.floor = parseInt(property.floor) || 1; // 기본값 1층
            realEstateData.transactionType = property.transactionType; // 거래구분 명시적 설정

            // 연립/다세대 전월세 API 호출
            try {
              await createRowHouseRent(realEstateData);
              console.log("연립/다세대 전월세 실거래가 등록 성공");
            } catch (error) {
              console.error("연립/다세대 전월세 실거래가 등록 실패:", error);
              realEstateSaveSuccess = false;
              errorMessage = "연립/다세대 전월세 실거래가 저장 실패";
            }
          }
        }

        // 실거래가 저장이 실패했으면 Property 거래 상태 업데이트하지 않음
        if (!realEstateSaveSuccess) {
          throw new Error(errorMessage);
        }

        // Property 테이블의 거래 상태를 0(거래 완료)으로 업데이트
        await fetch(
          `http://localhost:8080/api/property/${property.id}/transaction-status?transactionStatus=0`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Property 테이블의 status를 "거래완료"로 업데이트
        await fetch(
          `http://localhost:8080/api/property/${property.id}/status?status=거래완료`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        alert("거래가 완료되었습니다. 실거래가 테이블에 저장되었습니다.");

        // 실거래가 정보 새로고침
        loadMarketPrices();

        // Property 정보 새로고침 (거래 상태 변경 반영)
        loadPropertyDetail();
      } catch (error) {
        console.error("거래 완료 처리 실패:", error);
        alert("거래 완료 처리에 실패했습니다.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">
          {error || "매물을 찾을 수 없습니다."}
        </p>
        <button
          onClick={handleBackToList}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const memberInfo = getCookie("member");
  const isOwner = memberInfo && memberInfo.email === property.writerEmail;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 매물 헤더 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-800">
                {property.title}
              </h1>
              {/* 좋아요 버튼 */}

              <button
                onClick={handleLike}
                className={
                  "px-6 py-3 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-300"
                }
              >
                {property.isLiked ? "❤️" : "🤍"}
              </button>

              {/* 거래완료 버튼 - 작성자만 표시 */}
              {isOwner && (
                <button
                  onClick={handleTransactionComplete}
                  disabled={
                    property.transactionStatus === 0 ||
                    property.status === "거래완료"
                  }
                  className={`font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm ${
                    property.transactionStatus === 0 ||
                    property.status === "거래완료"
                      ? "bg-gray-400 cursor-not-allowed text-gray-200"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                  title={
                    property.transactionStatus === 0 ||
                    property.status === "거래완료"
                      ? "이미 거래가 완료된 매물입니다."
                      : "거래가 완료되었을 때만 클릭해주세요. 실거래가 테이블에 저장됩니다."
                  }
                >
                  🏠{" "}
                  {property.transactionStatus === 0 ||
                  property.status === "거래완료"
                    ? "거래완료됨"
                    : "거래완료"}
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>작성자: {maskEmail(property.writerEmail)}</span>
              <span>
                작성일: {new Date(property.createdAt).toLocaleDateString()}
              </span>
              {property.updatedAt !== property.createdAt && (
                <span>
                  수정일: {new Date(property.updatedAt).toLocaleDateString()}
                </span>
              )}
              <span>조회수: {property.viewCount || 0}</span>
              <span>좋아요: {property.likeCount || 0}</span>
            </div>
          </div>

          {/* 매물 정보 모달 버튼 */}
          <div className="flex gap-3">
            {/* 매물 수정/삭제 버튼 - 작성자만 표시 */}
            {isOwner && (
              <>
                <button
                  onClick={() => handleEdit(property)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(property.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 이미지 갤러리 */}
      {property.imageUrls && property.imageUrls.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            매물 이미지 ({property.imageUrls.length}개)
          </h3>

          <div className="flex items-center justify-center gap-4">
            {/* 왼쪽 서브 이미지 */}
            {property.imageUrls.length > 1 && (
              <div
                className="w-48 h-36 cursor-pointer transition-transform hover:scale-105"
                onClick={() => changeImage("prev")}
              >
                <img
                  src={`${
                    process.env.REACT_APP_BACKEND_URL || "http://localhost:8080"
                  }/files/${
                    property.imageUrls[
                      currentImageIndex > 0
                        ? currentImageIndex - 1
                        : property.imageUrls.length - 1
                    ]
                  }`}
                  alt="왼쪽 서브 이미지"
                  className="w-full h-full object-cover rounded-lg border-2 border-gray-200 opacity-70"
                />
              </div>
            )}

            {/* 메인 이미지 */}
            <div className="flex-1 max-w-2xl text-center">
              <img
                src={`${
                  process.env.REACT_APP_BACKEND_URL || "http://localhost:8080"
                }/files/${property.imageUrls[currentImageIndex]}`}
                alt="메인 이미지"
                className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  console.error("이미지 로드 실패:", e.target.src);
                  e.target.style.display = "none";
                }}
                onLoad={() => {
                  console.log(
                    "이미지 로드 성공:",
                    `${
                      process.env.REACT_APP_BACKEND_URL ||
                      "http://localhost:8080"
                    }/files/${property.imageUrls[currentImageIndex]}`
                  );
                }}
              />
            </div>

            {/* 오른쪽 서브 이미지 */}
            {property.imageUrls.length > 1 && (
              <div
                className="w-48 h-36 cursor-pointer transition-transform hover:scale-105"
                onClick={() => changeImage("next")}
              >
                <img
                  src={`${
                    process.env.REACT_APP_BACKEND_URL || "http://localhost:8080"
                  }/files/${
                    property.imageUrls[
                      currentImageIndex < property.imageUrls.length - 1
                        ? currentImageIndex + 1
                        : 0
                    ]
                  }`}
                  alt="오른쪽 서브 이미지"
                  className="w-full h-full object-cover rounded-lg border-2 border-gray-200 opacity-70"
                />
              </div>
            )}
          </div>

          {/* 썸네일 이미지들 */}
          {property.imageUrls.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {property.imageUrls.map((imageUrl, index) => (
                <img
                  key={index}
                  src={`${
                    process.env.REACT_APP_BACKEND_URL || "http://localhost:8080"
                  }/files/${imageUrl}`}
                  alt={`썸네일 ${index + 1}`}
                  className={`w-20 h-16 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                    index === currentImageIndex
                      ? "border-blue-500 opacity-70"
                      : "border-gray-200 hover:scale-110"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 매물 정보 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">매물 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-gray-700">매물 유형:</span>{" "}
            {property.propertyType}
          </div>
          <div>
            <span className="font-medium text-gray-700">거래 유형:</span>{" "}
            {property.transactionType}
          </div>
          <div>
            <span className="font-medium text-gray-700">가격:</span>{" "}
            {formatAmountToKorean(property.price)}
          </div>
          <div>
            <span className="font-medium text-gray-700">면적:</span>{" "}
            {property.area}㎡
          </div>
          <div>
            <span className="font-medium text-gray-700">방 개수:</span>{" "}
            {property.rooms}개
          </div>
          <div>
            <span className="font-medium text-gray-700">화장실:</span>{" "}
            {property.bathrooms}개
          </div>
          <div>
            <span className="font-medium text-gray-700">현재 층:</span>{" "}
            {property.floor}층
          </div>
          <div>
            <span className="font-medium text-gray-700">전체 층수:</span>{" "}
            {property.totalFloors}층
          </div>
          <div>
            <span className="font-medium text-gray-700">준공년도:</span>{" "}
            {property.yearBuilt}년
          </div>
          <div>
            <span className="font-medium text-gray-700">주소:</span>{" "}
            {property.roadAddress}
          </div>
          <div>
            <span className="font-medium text-gray-700">주차:</span>{" "}
            {(() => {
              console.log(
                "주차 값:",
                property.parking,
                "타입:",
                typeof property.parking
              );
              return formatBooleanValue(property.parking);
            })()}
          </div>
          <div>
            <span className="font-medium text-gray-700">난방:</span>{" "}
            {(() => {
              console.log(
                "난방 값:",
                property.heating,
                "타입:",
                typeof property.heating
              );
              return formatBooleanValue(property.heating);
            })()}
          </div>

          <div>
            <span className="font-medium text-gray-700">반려동물:</span>{" "}
            {(() => {
              console.log(
                "반려동물 값:",
                property.petAllowed,
                "타입:",
                typeof property.petAllowed
              );
              return formatBooleanValue(property.petAllowed);
            })()}
          </div>
        </div>
      </div>

      {/* 옵션 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">옵션</h3>
        {(() => {
          console.log("옵션 데이터 확인:", {
            elevator: property.elevator,
            balcony: property.balcony,
            tv: property.tv,
            airConditioner: property.airConditioner,
            shoeCabinet: property.shoeCabinet,
            refrigerator: property.refrigerator,
            washingMachine: property.washingMachine,
            bathtub: property.bathtub,
            sink: property.sink,
            induction: property.induction,
            wardrobe: property.wardrobe,
            fireAlarm: property.fireAlarm,
          });

          const hasOptions =
            property.elevator ||
            property.balcony ||
            property.tv ||
            property.airConditioner ||
            property.shoeCabinet ||
            property.refrigerator ||
            property.washingMachine ||
            property.bathtub ||
            property.sink ||
            property.induction ||
            property.wardrobe ||
            property.fireAlarm;

          if (!hasOptions) {
            return (
              <div className="text-center text-gray-500 py-8">
                <div className="text-2xl mb-2">📋</div>
                등록된 옵션이 없습니다.
              </div>
            );
          }

          return (
            <div className="grid grid-cols-3 gap-4">
              {property.elevator && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <img
                    src="/elevator.png"
                    alt="엘리베이터"
                    className="w-6 h-6 object-contain"
                  />
                  <span>엘리베이터</span>
                </div>
              )}
              {property.balcony && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <img
                    src="/balcony.png"
                    alt="발코니"
                    className="w-6 h-6 object-contain"
                  />
                  <span>발코니</span>
                </div>
              )}
              {property.tv && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <img
                    src="/tv.png"
                    alt="TV"
                    className="w-6 h-6 object-contain"
                  />
                  <span>TV</span>
                </div>
              )}
              {property.airConditioner && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <img
                    src="/air-conditioning.png"
                    alt="에어컨"
                    className="w-6 h-6 object-contain"
                  />
                  <span>에어컨</span>
                </div>
              )}
              {property.shoeCabinet && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <img
                    src="/sneaker.png"
                    alt="신발장"
                    className="w-6 h-6 object-contain"
                  />
                  <span>신발장</span>
                </div>
              )}
              {property.refrigerator && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <img
                    src="/refrigerator.png"
                    alt="냉장고"
                    className="w-6 h-6 object-contain"
                  />
                  <span>냉장고</span>
                </div>
              )}
              {property.washingMachine && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <img
                    src="/washingmachine.png"
                    alt="세탁기"
                    className="w-6 h-6 object-contain"
                  />
                  <span>세탁기</span>
                </div>
              )}
              {property.bathtub && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <img
                    src="/bathtub.png"
                    alt="욕조"
                    className="w-6 h-6 object-contain"
                  />
                  <span>욕조</span>
                </div>
              )}
              {property.sink && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <img
                    src="/washing-dish.png"
                    alt="싱크대"
                    className="w-6 h-6 object-contain"
                  />
                  <span>싱크대</span>
                </div>
              )}
              {property.induction && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <img
                    src="/stove.png"
                    alt="인덕션"
                    className="w-6 h-6 object-contain"
                  />
                  <span>인덕션</span>
                </div>
              )}
              {property.wardrobe && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <img
                    src="/hanger.png"
                    alt="옷장"
                    className="w-6 h-6 object-contain"
                  />
                  <span>옷장</span>
                </div>
              )}
              {property.fireAlarm && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <img
                    src="/fire.png"
                    alt="화재경보기"
                    className="w-6 h-6 object-contain"
                  />
                  <span>화재경보기</span>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* 실거래가 정보 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          실거래가 정보
        </h3>

        {(() => {
          const hasSales = marketPrices.sales && marketPrices.sales.length > 0;
          const hasRents = marketPrices.rents && marketPrices.rents.length > 0;

          if (!hasSales && !hasRents) {
            return (
              <div className="text-center text-gray-500 py-8">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-lg mb-2">이전 거래정보가 없습니다</p>
                <p className="text-sm text-gray-400">
                  해당 지역의 실거래가 데이터가 아직 등록되지 않았습니다.
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-6">
              {/* 매매 실거래가 차트 */}
              {hasSales && (
                <div>
                  <MarketPriceChart marketPrices={marketPrices} />
                </div>
              )}

              {/* 매매 실거래가 테이블 */}
              {hasSales && (
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-3">
                    매매 실거래가
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-50 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            계약일
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            거래금액
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            면적
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            층
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketPrices.sales.map((sale, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {sale.contractDate}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600 font-medium">
                              {formatAmountToKorean(sale.transactionAmount)}만원
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {sale.exclusiveArea}㎡
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {sale.floor}층
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 전월세 실거래가 */}
              {hasRents && (
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-3">
                    전월세 실거래가
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-50 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            계약일
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            보증금
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            월세
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            면적
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            층
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketPrices.rents.map((rent, index) => {
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
                                isJeonse ? "bg-blue-50" : "bg-yellow-50"
                              }`}
                            >
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {rent.contractDate}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600 font-medium">
                                {formatAmountToKorean(rent.deposit)}만원
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600 font-medium">
                                {isJeonse
                                  ? "전세"
                                  : `${formatAmountToKorean(
                                      rent.monthlyRent
                                    )}만원`}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {rent.exclusiveArea}㎡
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {rent.floor}층
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* 매물 설명 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">매물 설명</h3>
        <div className="whitespace-pre-wrap text-gray-700">
          {property.content}
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            댓글 ({inquiries.length})
          </h3>
          <button
            onClick={() => setShowInquiryForm(!showInquiryForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            댓글 작성
          </button>
        </div>

        {/* 댓글 작성 폼 */}
        {showInquiryForm && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-medium text-gray-800 mb-4">
              댓글 작성
            </h4>
            <form onSubmit={handleInquirySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  작성자
                </label>
                <input
                  name="writer"
                  value={inquiryForm.writer}
                  onChange={handleInquiryChange}
                  placeholder="작성자를 입력하세요"
                  required
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div className="mb-4">
                <textarea
                  name="content"
                  value={inquiryForm.content}
                  onChange={handleInquiryChange}
                  placeholder="내용을 입력하세요"
                  rows="4"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowInquiryForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 댓글 목록 */}
        {inquiries.length > 0 ? (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">
                      {inquiry.writer}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {inquiry.writerEmail ===
                    (memberInfo ? memberInfo.email : "") && (
                    <button
                      onClick={() => handleInquiryDelete(inquiry.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <div className="text-gray-700 mb-3">{inquiry.content}</div>

                {/* 답글 목록 */}
                {inquiry.replies && inquiry.replies.length > 0 && (
                  <div className="ml-6 space-y-2">
                    {inquiry.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-800 text-sm">
                              {reply.writer}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {reply.writerEmail ===
                            (memberInfo ? memberInfo.email : "") && (
                            <button
                              onClick={() => handleReplyDelete(reply.id)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                        <div className="text-gray-700 text-sm">
                          {reply.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 답글 작성 폼 */}
                {replyingTo && replyingTo.id === inquiry.id ? (
                  <div className="ml-6 mt-3 bg-gray-50 rounded-lg p-3">
                    <form onSubmit={handleReplySubmit}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          작성자
                        </label>
                        <input
                          name="writer"
                          value={replyForm.writer}
                          onChange={handleReplyChange}
                          placeholder="작성자를 입력하세요"
                          required
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100 cursor-not-allowed text-sm"
                        />
                      </div>
                      <div className="mb-3">
                        <textarea
                          name="content"
                          value={replyForm.content}
                          onChange={handleReplyChange}
                          placeholder="답글 내용을 입력하세요"
                          rows="2"
                          required
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                        >
                          취소
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          등록
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="flex justify-between items-center mt-3">
                    <button
                      onClick={() => setReplyingTo(inquiry)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      💬 답글
                      {inquiry.replies && inquiry.replies.length > 0 && (
                        <span className="ml-1">({inquiry.replies.length})</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <div className="text-2xl mb-2">💬</div>
            아직 댓글이 없습니다.
          </div>
        )}
      </div>

      {/* 목록으로 돌아가기 버튼 */}
      <div className="text-center mt-8">
        <button
          onClick={handleBackToList}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default ReadComponent;
