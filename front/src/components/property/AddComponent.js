import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  createPropertyReviewRequest,
  uploadReviewRequestImage,
} from "../../api/propertyReviewRequestApi";
import { getCookie } from "../../util/cookieUtil";

const propertyTypes = ["아파트", "연립/다세대", "단독주택", "오피스텔"];

function AddComponent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    propertyType: "",
    transactionType: "", // 거래 유형 추가
    monthlyRent: "", // 월세 금액 추가
    address: "",
    roadAddress: "",
    detailAddress: "",
    latitude: null,
    longitude: null,
    rooms: "",
    bathrooms: "",
    area: "",
    floor: "",
    totalFloors: "",
    yearBuilt: "",
    parking: "",
    heating: "",
    petAllowed: "",
    elevator: false,
    balcony: false,
    tv: false,
    airConditioner: false,
    shoeCabinet: false,
    refrigerator: false,
    washingMachine: false,
    bathtub: false,
    sink: false,
    induction: false,
    wardrobe: false,
    fireAlarm: false,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(false);

  // 카카오 맵 관련 상태
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  useEffect(() => {
    const memberInfo = getCookie("member");
    if (memberInfo && memberInfo.email) {
      // 사용자 정보가 있으면 기본값 설정
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCancel = () => {
    if (
      window.confirm("작성을 취소하시겠습니까? 작성 중인 내용이 사라집니다.")
    ) {
      navigate("/property/list");
    }
  };

  // 카카오 맵 초기화
  useEffect(() => {
    const initializeMap = () => {
      if (
        mapRef.current &&
        window.kakao &&
        window.kakao.maps &&
        window.kakao.maps.LatLng &&
        !mapLoaded
      ) {
        try {
          const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 시청
            level: 3,
          };

          const kakaoMap = new window.kakao.maps.Map(mapRef.current, options);
          setMap(kakaoMap);
          setMapLoaded(true);
        } catch (error) {
          console.error("카카오 맵 초기화 중 오류 발생:", error);
        }
      }
    };

    // 카카오 맵 API가 로드될 때까지 대기
    const checkKakaoMap = () => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
        initializeMap();
      } else {
        console.log("❌ 카카오 맵 API가 로드되지 않음");
      }
    };

    checkKakaoMap();
  }, [mapLoaded]);

  // 주소 검색 함수
  const searchAddress = () => {
    if (!formData.roadAddress.trim()) {
      alert("도로명 주소를 입력해주세요.");
      return;
    }

    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.LatLng) {
      alert("카카오 맵 API가 로드되지 않았습니다.");
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(formData.roadAddress, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

        // 기존 마커 제거
        if (marker) {
          marker.setMap(null);
        }

        // 새 마커 생성
        const newMarker = new window.kakao.maps.Marker({
          position: coords,
        });

        newMarker.setMap(map);
        setMarker(newMarker);

        // 지도 중심 이동
        map.setCenter(coords);
        map.setLevel(3);

        // 인포윈도우 생성
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${formData.roadAddress}</div>`,
        });

        infowindow.open(map, newMarker);

        // 3초 후 인포윈도우 닫기
        setTimeout(() => {
          infowindow.close();
        }, 3000);

        // 좌표 설정
        setFormData((prev) => ({
          ...prev,
          address: formData.roadAddress,
          latitude: parseFloat(result[0].y),
          longitude: parseFloat(result[0].x),
        }));
      } else {
        alert("주소를 찾을 수 없습니다. 정확한 도로명 주소를 입력해주세요.");
      }
    });
  };

  const handleOptionChange = (optionKey) => {
    setFormData((prev) => ({
      ...prev,
      [optionKey]: !prev[optionKey],
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    console.log(
      "선택된 파일들:",
      files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    );

    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    console.log(
      "유효한 이미지 파일들:",
      validFiles.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    );

    if (validFiles.length + imageFiles.length > 5) {
      alert("최대 5장까지 업로드 가능합니다.");
      return;
    }

    setImageFiles((prev) => [...prev, ...validFiles]);

    // 이미지 미리보기 생성
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    console.log("이미지 제거:", index);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const heatingTypes = ["개별난방", "중앙난방", "지역난방", "기타"];

  const propertyOptions = [
    {
      key: "elevator",
      label: "엘리베이터",
      icon: "elevator.png",
      isImage: true,
    },
    {
      key: "balcony",
      label: "발코니",
      icon: "balcony.png",
      isImage: true,
    },
    { key: "tv", label: "TV", icon: "tv.png", isImage: true },
    {
      key: "airConditioner",
      label: "에어컨",
      icon: "air-conditioning.png",
      isImage: true,
    },
    { key: "shoeCabinet", label: "신발장", icon: "sneaker.png", isImage: true },
    {
      key: "refrigerator",
      label: "냉장고",
      icon: "refrigerator.png",
      isImage: true,
    },
    {
      key: "washingMachine",
      label: "세탁기",
      icon: "washingmachine.png",
      isImage: true,
    },
    { key: "bathtub", label: "욕조", icon: "bathtub.png", isImage: true },
    { key: "sink", label: "싱크대", icon: "washing-dish.png", isImage: true },
    { key: "induction", label: "인덕션", icon: "stove.png", isImage: true },
    { key: "wardrobe", label: "옷장", icon: "hanger.png", isImage: true },
    { key: "fireAlarm", label: "화재경보기", icon: "fire.png", isImage: true },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 로그인 확인
    if (!getCookie("member")) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }

    // 필수 필드 검증
    if (
      !formData.name ||
      !formData.description ||
      !formData.propertyType ||
      !formData.transactionType ||
      !formData.price
    ) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    try {
      const memberInfo = getCookie("member");

      // memberInfo 파싱 (JSON 문자열인 경우)
      let parsedMemberInfo;
      try {
        parsedMemberInfo =
          typeof memberInfo === "string" ? JSON.parse(memberInfo) : memberInfo;
      } catch (error) {
        console.error("memberInfo 파싱 실패:", error);
        alert("사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.");
        return;
      }

      // 사용자 정보 확인
      if (
        !parsedMemberInfo ||
        (!parsedMemberInfo.email && !parsedMemberInfo.nickname)
      ) {
        alert("사용자 정보가 없습니다. 다시 로그인해주세요.");
        return;
      }

      // Property 테이블에 저장
      const propertyFormData = new FormData();
      propertyFormData.append("title", formData.name);
      propertyFormData.append("content", formData.description);
      propertyFormData.append(
        "writer",
        parsedMemberInfo.nickname || parsedMemberInfo.email
      );
      propertyFormData.append("writerEmail", parsedMemberInfo.email);
      propertyFormData.append("price", formData.price || "");
      propertyFormData.append("area", formData.area || "");
      propertyFormData.append("rooms", formData.rooms || "");
      propertyFormData.append("bathrooms", formData.bathrooms || "");
      propertyFormData.append("roadAddress", formData.roadAddress || "");
      propertyFormData.append("detailAddress", formData.detailAddress || "");
      propertyFormData.append("floor", formData.floor || "");
      propertyFormData.append("totalFloors", formData.totalFloors || "");
      propertyFormData.append("yearBuilt", formData.yearBuilt || "");
      propertyFormData.append("propertyType", formData.propertyType);
      propertyFormData.append("transactionType", formData.transactionType);
      propertyFormData.append("monthlyRent", formData.monthlyRent || "");
      propertyFormData.append("parking", formData.parking || "");
      propertyFormData.append("heating", formData.heating || "");
      propertyFormData.append("petAllowed", formData.petAllowed || "");
      propertyFormData.append("elevator", formData.elevator || false);
      propertyFormData.append("balcony", formData.balcony || false);
      propertyFormData.append("tv", formData.tv || false);
      propertyFormData.append(
        "airConditioner",
        formData.airConditioner || false
      );
      propertyFormData.append("shoeCabinet", formData.shoeCabinet || false);
      propertyFormData.append("refrigerator", formData.refrigerator || false);
      propertyFormData.append(
        "washingMachine",
        formData.washingMachine || false
      );
      propertyFormData.append("bathtub", formData.bathtub || false);
      propertyFormData.append("sink", formData.sink || false);
      propertyFormData.append("induction", formData.induction || false);
      propertyFormData.append("wardrobe", formData.wardrobe || false);
      propertyFormData.append("fireAlarm", formData.fireAlarm || false);

      // 이미지 파일들 추가
      if (formData.images && formData.images.length > 0) {
        for (let i = 0; i < formData.images.length; i++) {
          propertyFormData.append("images", formData.images[i]);
        }
      }

      // FormData 내용 로그 출력 (디버깅용)
      console.log("=== FormData 내용 ===");
      for (let [key, value] of propertyFormData.entries()) {
        console.log(`${key}:`, value);
      }
      console.log("=====================");

      // 검수 요청 데이터 생성 (이미지 없이)
      const reviewRequestData = {
        memberEmail: parsedMemberInfo.email,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        propertyType: formData.propertyType,
        transactionType: formData.transactionType,
        monthlyRent: formData.monthlyRent,
        address: formData.roadAddress,
        roadAddress: formData.roadAddress,
        detailAddress: formData.detailAddress,
        latitude: formData.latitude,
        longitude: formData.longitude,
        rooms: formData.rooms,
        bathrooms: formData.bathrooms,
        area: formData.area,
        floor: formData.floor,
        totalFloors: formData.totalFloors,
        yearBuilt: formData.yearBuilt,
        parking: formData.parking,
        heating: formData.heating,
        petAllowed: formData.petAllowed,
        elevator: formData.elevator,
        balcony: formData.balcony,
        tv: formData.tv,
        airConditioner: formData.airConditioner,
        shoeCabinet: formData.shoeCabinet,
        refrigerator: formData.refrigerator,
        washingMachine: formData.washingMachine,
        bathtub: formData.bathtub,
        sink: formData.sink,
        induction: formData.induction,
        wardrobe: formData.wardrobe,
        fireAlarm: formData.fireAlarm,
      };

      const reviewResponse = await createPropertyReviewRequest(
        reviewRequestData
      );
      console.log("검수 요청 완료:", reviewResponse);

      // 이미지가 있으면 업로드
      console.log("업로드할 이미지 파일들:", imageFiles);
      if (imageFiles && imageFiles.length > 0) {
        try {
          console.log(`총 ${imageFiles.length}개의 이미지 업로드 시작`);
          for (let i = 0; i < imageFiles.length; i++) {
            const imageFile = imageFiles[i];
            console.log(
              `이미지 ${i + 1} 업로드 중:`,
              imageFile.name,
              imageFile.size,
              imageFile.type
            );
            const uploadResult = await uploadReviewRequestImage(
              reviewResponse.id,
              imageFile
            );
            console.log(`이미지 ${i + 1} 업로드 완료:`, uploadResult);
          }
        } catch (error) {
          console.error("이미지 업로드 실패:", error);
          alert("매물 등록은 완료되었지만 이미지 업로드에 실패했습니다.");
        }
      } else {
        console.log("업로드할 이미지가 없습니다.");
      }

      alert(
        "매물 검수 요청이 성공적으로 제출되었습니다. 관리자 검수 후 매물이 등록됩니다."
      );
      navigate("/property/list");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "매물 등록에 실패했습니다.";
      alert(errorMsg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          매물 검수 요청
        </h2>
        <p className="text-sm text-gray-600">
          <span className="text-red-500">*</span>은 필수 입력 요소입니다. 검수
          요청 후 관리자 승인 시 매물이 등록됩니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              매물 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="매물 제목을 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              매물 유형 <span className="text-red-500">*</span>
            </label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택해주세요</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              거래 유형 <span className="text-red-500">*</span>
            </label>
            <select
              name="transactionType"
              value={formData.transactionType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택해주세요</option>
              <option value="매매">매매</option>
              <option value="전세">전세</option>
              <option value="월세">월세</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.transactionType === "월세" ? "보증금" : "가격"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="가격을 입력하세요 (예: 5000만원)"
              required
            />
          </div>

          {/* 월세 선택 시 월세 금액 입력 필드 */}
          {formData.transactionType === "월세" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                월세 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="monthlyRent"
                value={formData.monthlyRent || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="월세를 입력하세요 (예: 50만원)"
                required
              />
            </div>
          )}
        </div>

        {/* 면적 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              면적 (㎡)
            </label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="면적을 입력하세요"
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              방 개수
            </label>
            <input
              type="number"
              name="rooms"
              value={formData.rooms}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="방 개수를 입력하세요"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              화장실 개수
            </label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="화장실 개수를 입력하세요"
              min="0"
            />
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주차
            </label>
            <select
              name="parking"
              value={formData.parking}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택해주세요</option>
              <option value="true">가능</option>
              <option value="false">불가능</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              난방
            </label>
            <select
              name="heating"
              value={formData.heating}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택해주세요</option>
              {heatingTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 건물 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              층수
            </label>
            <input
              type="number"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="현재 층수를 입력하세요"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전체 층수
            </label>
            <input
              type="number"
              name="totalFloors"
              value={formData.totalFloors}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="전체 층수를 입력하세요"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              준공년도
            </label>
            <input
              type="number"
              name="yearBuilt"
              value={formData.yearBuilt}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="준공년도를 입력하세요"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        {/* 편의시설 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              반려동물
            </label>
            <select
              name="petAllowed"
              value={formData.petAllowed}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택해주세요</option>
              <option value="true">가능</option>
              <option value="false">불가능</option>
            </select>
          </div>
        </div>

        {/* 옵션 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            옵션 (12개)
          </label>
          <div className="grid grid-cols-3 gap-4">
            {propertyOptions.map((option) => (
              <div key={option.key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={option.key}
                  checked={formData[option.key]}
                  onChange={() => handleOptionChange(option.key)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label
                  htmlFor={option.key}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {option.isImage ? (
                    <img
                      src={`/${option.icon}`}
                      alt={option.label}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <span className="text-lg">{option.icon}</span>
                  )}
                  <span>{option.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* 주소 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            도로명 주소
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              name="roadAddress"
              value={formData.roadAddress}
              onChange={handleChange}
              placeholder="도로명 주소를 입력하세요"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={searchAddress}
              disabled={!mapLoaded}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                mapLoaded
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
            >
              {mapLoaded ? "지도에서 찾기" : "지도 로딩 중..."}
            </button>
          </div>

          {/* 카카오 맵 */}
          <div
            ref={mapRef}
            className="w-full h-80 border border-gray-300 rounded-md mt-2 relative"
          >
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-gray-500">지도 로딩 중...</div>
              </div>
            )}
          </div>

          {/* 상세 주소 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세 주소
            </label>
            <input
              type="text"
              name="detailAddress"
              value={formData.detailAddress}
              onChange={handleChange}
              placeholder="상세 주소를 입력하세요 (동, 호수 등)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 매물 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            매물 설명 <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="6"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="매물에 대한 상세한 설명을 입력하세요"
            required
          />
        </div>

        {/* 이미지 업로드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            매물 이미지
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            여러 장의 이미지를 선택할 수 있습니다. (최대 10장)
          </p>
        </div>

        {/* 이미지 미리보기 */}
        {imagePreview.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 미리보기
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreview.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`미리보기 ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            검수 요청
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddComponent;
