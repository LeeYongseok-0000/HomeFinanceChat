import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getVillageStory,
  updateVillageStory,
} from "../../../api/villageStoryApi";
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
  const [deletedImages, setDeletedImages] = useState([]); // 삭제된 이미지 추적

  const boardId = id;

  // 사용 가능한 주제 목록
  const availableTopics = [
    "맛집",
    "카페",
    "쇼핑",
    "문화/예술",
    "여가/레저",
    "교통",
    "주차",
    "안전",
    "개발/재개발",
    "교육",
    "자연",
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
  }, [boardId, navigate]);

  const loadBoard = async () => {
    try {
      setLoading(true);
      const response = await getVillageStory(boardId);

      if (response) {
        // 작성자 확인
        if (response.writerId !== memberInfo?.id) {
          alert("수정 권한이 없습니다.");
          navigate("/board/village-story");
          return;
        }

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
        navigate("/board/village-story");
      }
    } catch (error) {
      console.error("게시글 로딩 실패:", error);
      alert(ERROR_MESSAGES.NOT_FOUND);
      navigate("/board/village-story");
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
      console.log("=== FormData 생성 ===");
      console.log("boardId:", boardId);
      console.log("boardId 타입:", typeof boardId);
      console.log("boardId 값:", boardId);
      console.log("memberInfo:", memberInfo);

      formData.append("id", boardId); // 백엔드에서 @RequestParam("id")로 받음
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append(
        "writer",
        memberInfo?.nickname || memberInfo?.email || ""
      ); // writer 필수 파라미터 추가
      formData.append("category", "이야기");
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

      // 기존 이미지 정보 (삭제된 이미지 제외)
      console.log("수정 전 기존 이미지 개수:", existingImages.length);
      console.log("수정 후 유지할 이미지들:", existingImages);
      console.log("삭제된 이미지 개수:", deletedImages.length);

      const response = await updateVillageStory(formData);

      if (response) {
        alert(SUCCESS_MESSAGES.UPDATE);
        navigate(`/board/village-story/read/${boardId}`);
      }
    } catch (error) {
      console.error("이야기 수정 실패:", error);
      alert(ERROR_MESSAGES.VALIDATION_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("수정을 취소하시겠습니까?")) {
      navigate(`/board/village-story/read/${boardId}`);
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
          onClick={() => navigate(`/board/village-story/read/${boardId}`)}
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
          우리 마을 이야기 수정
        </h1>
        <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
          이야기 내용을 수정해보세요.
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
            placeholder="이야기 제목을 입력해주세요"
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
                    form.topic.includes(topic) ? "#3b82f6" : "#ddd"
                  }`,
                  borderRadius: "6px",
                  backgroundColor: form.topic.includes(topic)
                    ? "#f8fff8"
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
                    accentColor: "#3b82f6",
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
            placeholder="이야기 내용을 자세히 작성해주세요"
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
            {submitting ? "수정 중..." : "이야기 수정"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifyComponent;
