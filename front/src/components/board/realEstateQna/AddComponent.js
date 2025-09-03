import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createRealEstateQna } from "../../../api/realEstateQnaApi";
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

const AddComponent = () => {
  const navigate = useNavigate();
  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // 지도 관련 상태
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchAddress, setSearchAddress] = useState("");

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
  }, [navigate]);

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

  // 주소 검색 및 지도에 표시 (Places API 사용)
  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) {
      alert("검색할 장소를 입력해주세요.");
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
      setLoading(true);

      // FormData 생성
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("category", "부동산 Q&A");
      formData.append("topic", form.topic.join(", "));
      formData.append("roadAddress", form.roadAddress);
      formData.append("writer", memberInfo.email); // writer 정보 추가

      // 이미지 추가
      images.forEach((image, index) => {
        formData.append("images", image.file);
      });

      const response = await createRealEstateQna(formData);

      if (response) {
        alert(SUCCESS_MESSAGES.CREATE);
        navigate("/board/real-estate-qna");
      }
    } catch (error) {
      console.error("Q&A 등록 실패:", error);

      // 더 구체적인 에러 메시지 표시
      if (error.response) {
        const errorData = error.response.data;
        if (errorData && errorData.message) {
          alert(`등록 실패: ${errorData.message}`);
        } else if (errorData && typeof errorData === "string") {
          alert(`등록 실패: ${errorData}`);
        } else {
          alert(
            `등록 실패: ${error.response.status} - ${error.response.statusText}`
          );
        }
      } else if (error.message) {
        alert(`등록 실패: ${error.message}`);
      } else {
        alert(ERROR_MESSAGES.VALIDATION_ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("작성을 취소하시겠습니까?")) {
      navigate("/board/real-estate-qna");
    }
  };

  const provinces = getProvinces();
  const cities = getCities(form.province);

  if (!memberInfo) {
    return null;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      {/* 뒤로가기 버튼 */}
      <div style={{ marginBottom: "25px" }}>
        <button
          onClick={() => navigate("/board/real-estate-qna")}
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
          부동산 Q&A 작성
        </h1>
        <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
          부동산에 대한 궁금한 점을 질문해보세요.
        </p>
      </div>

      {/* 작성 폼 */}
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
            주소를 검색하면 지도가 표시됩니다.
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

        {/* 이미지 업로드 */}
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
            이미지 (선택사항)
          </label>
          <BoardImageUpload
            images={images}
            onImagesChange={setImages}
            maxCount={IMAGE_UPLOAD.MAX_COUNT}
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
            disabled={loading}
            style={{
              padding: "15px 30px",
              backgroundColor: loading ? "#ccc" : COLORS.PRIMARY,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {loading ? "등록 중..." : "Q&A 등록"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddComponent;
