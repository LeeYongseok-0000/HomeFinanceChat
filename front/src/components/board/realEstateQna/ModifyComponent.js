import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getRealEstateQna,
  updateRealEstateQna,
} from "../../../api/realEstateQnaApi";
import { getCookie } from "../../../util/cookieUtil";
import BoardImageUpload from "../common/BoardImageUpload";
import { getProvinces, getCities } from "../common/commonRegionsConfig";
import {
  COLORS,
  TEXT_LIMITS,
  IMAGE_UPLOAD,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../common/boardConstants";
import { API_SERVER_HOST } from "../../../api/backendApi";

// 카카오 맵 스크립트 로드
const loadKakaoMapScript = () => {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve(window.kakao.maps);
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_KEY}&libraries=services`;
    script.async = true;
    script.onload = () => resolve(window.kakao.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const ModifyComponent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 폼 상태
  const [form, setForm] = useState({
    title: "",
    content: "",
    topic: [],
    province: "",
    city: "",
    roadAddress: "",
  });

  // 이미지 상태
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);

  // 지도 관련 상태
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchAddress, setSearchAddress] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [board, setBoard] = useState(null);

  const boardId = id;

  // 사용 가능한 주제 목록
  const availableTopics = [
    "매매",
    "전세",
    "월세",
    "분양",
    "개발/재개발",
    "투자",
    "세금",
    "법률",
    "시세",
    "기타",
  ];

  useEffect(() => {
    const member = getCookie("member");
    if (!member) {
      alert(ERROR_MESSAGES.UNAUTHORIZED);
      navigate("/member/login");
      return;
    }
    setMemberInfo(member);

    if (boardId) {
      loadBoard();
    }

    // 현재 위치 가져오기
    getCurrentLocation();
  }, [boardId, navigate]);

  // 현재 위치가 변경될 때마다 지도 초기화
  useEffect(() => {
    if (currentLocation) {
      initializeMapWithCurrentLocation();
    }
  }, [currentLocation]);

  // 게시글 로드 후 기존 위치 정보로 지도 초기화
  useEffect(() => {
    if (board && board.roadAddress && !map) {
      // 기존 게시글에 위치 정보가 있으면 해당 위치로 지도 표시
      handleExistingLocationDisplay();
    }
  }, [board, map]);

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("위치 정보를 가져올 수 없습니다:", error);
          // 서울 시청을 기본 위치로 설정
          setCurrentLocation({ lat: 37.5665, lng: 126.978 });
        }
      );
    } else {
      // Geolocation을 지원하지 않는 경우 서울 시청을 기본 위치로 설정
      setCurrentLocation({ lat: 37.5665, lng: 126.978 });
    }
  };

  const loadBoard = async () => {
    try {
      setLoading(true);
      const response = await getRealEstateQna(boardId);

      if (response) {
        // 작성자 확인
        if (response.writerId !== memberInfo?.id) {
          alert("수정 권한이 없습니다.");
          navigate("/board/real-estate-qna");
          return;
        }

        // 게시글 데이터 설정
        setBoard(response);

        // 폼 데이터 설정
        setForm({
          title: response.title || "",
          content: response.content || "",
          topic: response.topic ? response.topic.split(", ") : [],
          province: response.roadAddress
            ? response.roadAddress.split(" ")[0]
            : "",
          city: response.roadAddress ? response.roadAddress.split(" ")[1] : "",
          roadAddress: response.roadAddress || "",
        });

        // 기존 이미지 설정
        if (response.imageUrls && response.imageUrls.length > 0) {
          setExistingImages(response.imageUrls);
        }
      } else {
        alert("게시글을 찾을 수 없습니다.");
        navigate("/board/real-estate-qna");
      }
    } catch (error) {
      console.error("게시글 로딩 실패:", error);
      alert(ERROR_MESSAGES.NOT_FOUND);
      navigate("/board/real-estate-qna");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTopicChange = (topic) => {
    setForm((prev) => ({
      ...prev,
      topic: prev.topic.includes(topic)
        ? prev.topic.filter((t) => t !== topic)
        : [...prev.topic, topic],
    }));
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setForm((prev) => ({
      ...prev,
      province,
      city: "", // 시/도 변경 시 시/군/구 초기화
      roadAddress: province,
    }));
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setForm((prev) => ({
      ...prev,
      city,
      roadAddress: `${prev.province} ${city}`,
    }));
  };

  // 현재 위치로 지도 초기화
  const initializeMapWithCurrentLocation = async () => {
    if (!currentLocation) return;

    try {
      const kakao = await loadKakaoMapScript();

      const coords = new kakao.LatLng(currentLocation.lat, currentLocation.lng);

      // 지도 생성
      const mapContainer = document.getElementById("map");
      const mapOption = {
        center: coords,
        level: 3,
      };

      const newMap = new kakao.Map(mapContainer, mapOption);
      setMap(newMap);

      // 지도 확대/축소 컨트롤 추가
      const zoomControl = new kakao.ZoomControl();
      newMap.addControl(zoomControl, kakao.ControlPosition.RIGHT);

      // 지도 타입 컨트롤 추가
      const mapTypeControl = new kakao.MapTypeControl();
      newMap.addControl(mapTypeControl, kakao.ControlPosition.TOPRIGHT);

      // 현재 위치 마커 생성
      const currentMarker = new kakao.Marker({
        position: coords,
      });

      // 마커를 지도에 표시
      currentMarker.setMap(newMap);
      setMarker(currentMarker);

      // 현재 위치 인포윈도우 생성
      const infowindow = new kakao.InfoWindow({
        content: `<div style="padding:10px;text-align:center;min-width:150px;">
          <strong>📍 현재 위치</strong><br>
          <span style="font-size:12px;color:#666;">내가 있는 곳</span>
        </div>`,
      });

      // 인포윈도우를 마커에 표시
      infowindow.open(newMap, currentMarker);
    } catch (error) {
      console.error("카카오 맵 초기화 실패:", error);
    }
  };

  // 기존 위치 정보로 지도 표시
  const handleExistingLocationDisplay = async () => {
    if (!board.roadAddress) return;

    try {
      const kakao = await loadKakaoMapScript();

      // 장소 검색 서비스 객체 생성
      const ps = new kakao.services.Places();

      // 기존 주소로 검색하여 정확한 좌표 찾기
      ps.keywordSearch(board.roadAddress, (data, status) => {
        if (status === kakao.services.Status.OK && data.length > 0) {
          const place = data[0];
          const coords = new kakao.LatLng(place.y, place.x);

          // 지도 생성
          const mapContainer = document.getElementById("map");
          const mapOption = {
            center: coords,
            level: 3,
          };

          const newMap = new kakao.Map(mapContainer, mapOption);
          setMap(newMap);

          // 지도 확대/축소 컨트롤 추가
          const zoomControl = new kakao.ZoomControl();
          newMap.addControl(zoomControl, kakao.ControlPosition.RIGHT);

          // 지도 타입 컨트롤 추가
          const mapTypeControl = new kakao.MapTypeControl();
          newMap.addControl(mapTypeControl, kakao.ControlPosition.TOPRIGHT);

          // 마커 생성
          const newMarker = new kakao.Marker({
            position: coords,
          });

          // 마커를 지도에 표시
          newMarker.setMap(newMap);
          setMarker(newMarker);

          // 인포윈도우 생성
          const infowindow = new kakao.InfoWindow({
            content: `<div style="padding:10px;text-align:center;min-width:200px;">
              <strong>${place.place_name}</strong><br>
              <span style="font-size:12px;color:#666;">${
                place.address_name
              }</span>
              ${
                place.phone
                  ? `<br><span style="font-size:11px;color:#888;">📞 ${place.phone}</span>`
                  : ""
              }
            </div>`,
          });

          // 인포윈도우를 마커에 표시
          infowindow.open(newMap, newMarker);

          // 검색 입력 필드에 기존 주소 설정
          setSearchAddress(board.roadAddress);
        } else {
          // 검색 결과가 없으면 기본 지도만 생성
          const defaultCoords = new kakao.LatLng(37.5665, 126.978); // 서울 시청
          const mapContainer = document.getElementById("map");
          const mapOption = {
            center: defaultCoords,
            level: 3,
          };

          const newMap = new kakao.Map(mapContainer, mapOption);
          setMap(newMap);

          // 지도 컨트롤 추가
          const zoomControl = new kakao.ZoomControl();
          newMap.addControl(zoomControl, kakao.ControlPosition.RIGHT);

          const mapTypeControl = new kakao.MapTypeControl();
          newMap.addControl(mapTypeControl, kakao.ControlPosition.TOPRIGHT);

          // 검색 입력 필드에 기존 주소 설정
          setSearchAddress(board.roadAddress);
        }
      });
    } catch (error) {
      console.error("기존 위치 지도 표시 실패:", error);
    }
  };

  // 주소 검색 및 지도에 표시
  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) {
      alert("검색할 주소를 입력해주세요.");
      return;
    }

    try {
      const kakao = await loadKakaoMapScript();

      // 장소 검색 서비스 객체 생성 (Places API 사용)
      const ps = new kakao.services.Places();

      // 장소 검색 실행 (MapComponent와 동일한 방식)
      ps.keywordSearch(searchAddress, (data, status) => {
        if (status === kakao.services.Status.OK && data.length > 0) {
          const place = data[0]; // 첫 번째 검색 결과 사용
          const coords = new kakao.LatLng(place.y, place.x);

          // 기존 마커 제거
          if (marker) {
            marker.setMap(null);
          }

          // 지도 생성 (첫 번째 검색인 경우)
          if (!map) {
            const mapContainer = document.getElementById("map");
            const mapOption = {
              center: coords,
              level: 3,
            };

            const newMap = new kakao.Map(mapContainer, mapOption);
            setMap(newMap);

            // 지도 확대/축소 컨트롤 추가
            const zoomControl = new kakao.ZoomControl();
            newMap.addControl(zoomControl, kakao.ControlPosition.RIGHT);

            // 지도 타입 컨트롤 추가
            const mapTypeControl = new kakao.MapTypeControl();
            newMap.addControl(mapTypeControl, kakao.ControlPosition.TOPRIGHT);
          } else {
            // 기존 지도 중심 이동
            map.setCenter(coords);
          }

          // 마커 생성
          const newMarker = new kakao.Marker({
            position: coords,
          });

          // 마커를 지도에 표시
          newMarker.setMap(map);
          setMarker(newMarker);

          // 인포윈도우 생성 (장소 정보 포함)
          const infowindow = new kakao.InfoWindow({
            content: `<div style="padding:10px;text-align:center;min-width:200px;">
              <strong>${place.place_name}</strong><br>
              <span style="font-size:12px;color:#666;">${
                place.address_name
              }</span>
              ${
                place.phone
                  ? `<br><span style="font-size:11px;color:#888;">📞 ${place.phone}</span>`
                  : ""
              }
            </div>`,
          });

          // 인포윈도우를 마커에 표시
          infowindow.open(map, newMarker);

          // 폼에 정확한 주소 정보 설정
          setForm((prev) => ({
            ...prev,
            roadAddress: place.address_name || place.place_name,
          }));
        } else if (status === kakao.services.Status.ZERO_RESULT) {
          alert("검색 결과가 없습니다. 다른 키워드로 검색해주세요.");
        } else {
          alert("검색 중 오류가 발생했습니다.");
        }
      });
    } catch (error) {
      console.error("카카오 맵 로드 실패:", error);
      alert("지도를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!form.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!form.content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    if (form.topic.length === 0) {
      alert("주제를 하나 이상 선택해주세요.");
      return;
    }

    if (!form.province || !form.city) {
      alert("지역을 선택해주세요.");
      return;
    }

    try {
      setSubmitting(true);

      // FormData 생성
      const formData = new FormData();
      formData.append("id", boardId); // 백엔드에서 @RequestParam("id")로 받음
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append(
        "writer",
        memberInfo?.nickname || memberInfo?.email || ""
      ); // writer 필수 파라미터 추가
      formData.append("category", "부동산 Q&A");
      formData.append("topic", form.topic.join(", "));
      formData.append("roadAddress", form.roadAddress);

      // 새로 추가된 이미지들
      images.forEach((image, index) => {
        formData.append("images", image.file);
      });

      // 삭제된 이미지 정보
      if (deletedImages.length > 0) {
        console.log("삭제된 이미지들:", deletedImages);
        deletedImages.forEach((imageUrl) => {
          formData.append("deletedImages", imageUrl);
        });
      }

      const response = await updateRealEstateQna(formData);

      if (response) {
        alert(SUCCESS_MESSAGES.UPDATE);
        navigate(`/board/real-estate-qna/read/${boardId}`);
      }
    } catch (error) {
      console.error("Q&A 수정 실패:", error);
      alert(ERROR_MESSAGES.VALIDATION_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("수정을 취소하시겠습니까?")) {
      navigate(`/board/real-estate-qna/read/${boardId}`);
    }
  };

  const provinces = getProvinces();
  const cities = getCities(form.province);

  if (!memberInfo) {
    return null;
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      {/* 뒤로가기 버튼 */}
      <div style={{ marginBottom: "25px" }}>
        <button
          onClick={() => navigate(`/board/real-estate-qna/read/${boardId}`)}
          style={{
            padding: "10px 20px",
            backgroundColor: COLORS.SECONDARY,
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#5a6268";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = COLORS.SECONDARY;
          }}
        >
          ← 뒤로가기
        </button>
      </div>

      {/* 헤더 */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "40px",
          paddingBottom: "20px",
          borderBottom: `3px solid ${COLORS.PRIMARY}`,
        }}
      >
        <h1
          style={{
            margin: "0 0 10px 0",
            fontSize: "28px",
            fontWeight: "bold",
            color: COLORS.PRIMARY,
          }}
        >
          부동산 Q&A 수정
        </h1>
        <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
          Q&A 내용을 수정해보세요.
        </p>
      </div>

      {/* 수정 폼 */}
      <form onSubmit={handleSubmit}>
        {/* 제목 */}
        <div style={{ marginBottom: "30px" }}>
          <label
            htmlFor="title"
            style={{
              display: "block",
              fontSize: "16px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "10px",
            }}
          >
            제목 *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={form.title}
            onChange={handleInputChange}
            maxLength={TEXT_LIMITS.TITLE_MAX_LENGTH}
            placeholder="Q&A 제목을 입력해주세요"
            style={{
              width: "100%",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
            required
          />
          <div
            style={{
              textAlign: "right",
              marginTop: "5px",
              fontSize: "12px",
              color: "#666",
            }}
          >
            {form.title.length} / {TEXT_LIMITS.TITLE_MAX_LENGTH}
          </div>
        </div>

        {/* 주제 선택 */}
        <div style={{ marginBottom: "30px" }}>
          <label
            style={{
              display: "block",
              fontSize: "16px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "15px",
            }}
          >
            주제 * (하나 이상 선택)
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "15px",
            }}
          >
            {availableTopics.map((topic) => (
              <label
                key={topic}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  padding: "12px",
                  border: `1px solid ${
                    form.topic.includes(topic) ? COLORS.PRIMARY : "#ddd"
                  }`,
                  borderRadius: "6px",
                  backgroundColor: form.topic.includes(topic)
                    ? "#f0f8ff"
                    : "white",
                  transition: "all 0.2s ease",
                  height: "60px",
                  minHeight: "60px",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.topic.includes(topic)}
                  onChange={() => handleTopicChange(topic)}
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                    accentColor: COLORS.PRIMARY,
                  }}
                />
                <span style={{ fontWeight: "500", fontSize: "14px" }}>
                  {topic}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 지역 선택 */}
        <div style={{ marginBottom: "30px" }}>
          <label
            style={{
              display: "block",
              fontSize: "16px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "15px",
            }}
          >
            지역 *
          </label>
          <div style={{ display: "flex", gap: "15px" }}>
            {/* 시/도 선택 */}
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: "14px",
                  color: "#666",
                  marginBottom: "5px",
                  display: "block",
                }}
              >
                시/도
              </label>
              <select
                value={form.province}
                onChange={handleProvinceChange}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                <option value="">시/도를 선택하세요</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            {/* 시/군/구 선택 */}
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: "14px",
                  color: "#666",
                  marginBottom: "5px",
                  display: "block",
                }}
              >
                시/군/구
              </label>
              <select
                value={form.city}
                onChange={handleCityChange}
                disabled={!form.province}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: !form.province ? "#f8f9fa" : "white",
                }}
              >
                <option value="">시/군/구를 선택하세요</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {form.roadAddress && (
            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "#f8f9fa",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#666",
              }}
            >
              선택된 지역: <strong>{form.roadAddress}</strong>
            </div>
          )}
        </div>

        {/* 위치 검색 및 지도 */}
        <div style={{ marginBottom: "30px" }}>
          <label
            style={{
              display: "block",
              fontSize: "16px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "15px",
            }}
          >
            위치 검색 및 지도
          </label>

          {/* 주소 검색 입력 */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="장소명, 건물명, 지역명을 입력하세요 (예: 강남역, 테헤란로 123, 강남구청)"
              style={{
                flex: 1,
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              style={{
                padding: "12px 20px",
                backgroundColor: COLORS.PRIMARY,
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              주소 검색
            </button>
          </div>

          {/* 지도 표시 */}
          <div
            id="map"
            style={{
              width: "100%",
              height: "400px",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
              backgroundColor: "#f8f9fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              fontSize: "14px",
            }}
          >
            {board && board.roadAddress
              ? "기존 위치 정보를 불러오는 중..."
              : "주소를 검색하면 지도가 표시됩니다."}
          </div>
        </div>

        {/* 내용 */}
        <div style={{ marginBottom: "30px" }}>
          <label
            htmlFor="content"
            style={{
              display: "block",
              fontSize: "16px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "10px",
            }}
          >
            내용 *
          </label>
          <textarea
            id="content"
            name="content"
            value={form.content}
            onChange={handleInputChange}
            maxLength={TEXT_LIMITS.CONTENT_MAX_LENGTH}
            placeholder="질문 내용을 자세히 작성해주세요"
            rows="10"
            style={{
              width: "100%",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "16px",
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
            required
          />
          <div
            style={{
              textAlign: "right",
              marginTop: "5px",
              fontSize: "12px",
              color: "#666",
            }}
          >
            {form.content.length} / {TEXT_LIMITS.CONTENT_MAX_LENGTH}
          </div>
        </div>

        {/* 기존 이미지 */}
        {existingImages.length > 0 && (
          <div style={{ marginBottom: "30px" }}>
            <label
              style={{
                display: "block",
                fontSize: "16px",
                fontWeight: "600",
                color: "#333",
                marginBottom: "15px",
              }}
            >
              기존 이미지
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              {existingImages.map((imageUrl, index) => (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #dee2e6",
                  }}
                >
                  <img
                    src={`${API_SERVER_HOST}${imageUrl}`}
                    alt={`기존 이미지 ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const deletedImage = existingImages[index];
                      setDeletedImages((prev) => [...prev, deletedImage]);
                      setExistingImages((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                    }}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(220, 53, 69, 0.9)",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
              이미지를 클릭하면 삭제됩니다. 삭제된 이미지는 복구할 수 없습니다.
            </p>
          </div>
        )}

        {/* 새 이미지 업로드 */}
        <div style={{ marginBottom: "30px" }}>
          <label
            style={{
              display: "block",
              fontSize: "16px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "15px",
            }}
          >
            새 이미지 추가 (선택사항)
          </label>
          <BoardImageUpload
            images={images}
            onImagesChange={setImages}
            maxCount={IMAGE_UPLOAD.MAX_COUNT - existingImages.length}
            maxSize={IMAGE_UPLOAD.MAX_SIZE}
            acceptTypes={IMAGE_UPLOAD.ACCEPT_TYPES}
          />
        </div>

        {/* 버튼 영역 */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
            marginTop: "40px",
          }}
        >
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: "15px 30px",
              backgroundColor: COLORS.LIGHT,
              color: COLORS.DARK,
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "15px 30px",
              backgroundColor: submitting ? "#ccc" : COLORS.PRIMARY,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: submitting ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {submitting ? "수정 중..." : "Q&A 수정"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifyComponent;
