import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPropertyDetail, addPropertyInquiry } from "../../api/propertyApi";
import useModal from "../../hooks/useModal";
import ResultModal from "../common/ResultModal";
import { getCurrentUser } from "../../util/jwtUtil";

const ReplyComponent = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const { modalState, showModal, handleModalClose } = useModal();

  const [property, setProperty] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    contactPhone: "",
    contactEmail: "",
    preferredTime: "",
    budget: "",
    moveInDate: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const currentUser = getCurrentUser();

  const preferredTimes = [
    "오전 (09:00-12:00)",
    "오후 (12:00-18:00)",
    "저녁 (18:00-21:00)",
    "협의 가능",
  ];

  const budgetRanges = [
    "1억원 미만",
    "1억원-3억원",
    "3억원-5억원",
    "5억원-10억원",
    "10억원 이상",
    "협의",
  ];

  useEffect(() => {
    loadPropertyDetail();
  }, [propertyId]);

  const loadPropertyDetail = async () => {
    try {
      const data = await getPropertyDetail(propertyId);
      setProperty(data);

      // 로그인한 사용자 정보로 기본값 설정
      if (currentUser) {
        setFormData((prev) => ({
          ...prev,
          contactEmail: currentUser.email || "",
          contactPhone: currentUser.phone || "",
        }));
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "매물 정보를 불러오는데 실패했습니다.";
      setError(errorMsg);
      showModal("오류", errorMsg, () => {});
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      showModal(
        "로그인 필요",
        "매물 문의를 위해서는 로그인이 필요합니다.",
        () => {}
      );
      return;
    }

    if (!formData.title.trim()) {
      showModal("입력 오류", "제목을 입력해주세요.", () => {});
      return;
    }

    if (!formData.content.trim()) {
      showModal("입력 오류", "문의 내용을 입력해주세요.", () => {});
      return;
    }

    if (!formData.contactPhone.trim()) {
      showModal("입력 오류", "연락처를 입력해주세요.", () => {});
      return;
    }

    setIsSubmitting(true);

    try {
      await addPropertyInquiry(propertyId, formData);
      showModal(
        "성공",
        "매물 문의가 등록되었습니다. 빠른 시일 내에 연락드리겠습니다.",
        () => {
          navigate(`/property/read/${propertyId}`);
        }
      );
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "매물 문의 등록에 실패했습니다.";
      showModal("오류", errorMsg, () => {});
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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
          onClick={() => navigate("/property/list")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">매물 문의</h1>
          <button
            onClick={() => navigate(`/property/read/${propertyId}`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← 돌아가기
          </button>
        </div>
        <p className="text-gray-600">매물에 대한 문의사항을 남겨주세요</p>
      </div>

      {/* 매물 정보 요약 */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          문의 대상 매물
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">제목:</span>
            <p className="font-medium text-gray-800">{property.title}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">매물 유형:</span>
            <p className="font-medium text-gray-800">{property.propertyType}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">가격:</span>
            <p className="font-medium text-gray-800">
              {property.price || "가격 협의"}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">위치:</span>
            <p className="font-medium text-gray-800">
              {property.roadAddress || "위치 정보 없음"}
            </p>
          </div>
        </div>
      </div>

      {/* 문의 폼 */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        {/* 문의 제목 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            문의 제목 *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="문의 제목을 입력하세요 (예: 매물 상담 문의, 견학 요청 등)"
            required
          />
        </div>

        {/* 문의 내용 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            문의 내용 *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="6"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="구체적인 문의사항을 자세히 입력해주세요. 매물에 대한 궁금한 점이나 요청사항을 말씀해주세요."
            required
          />
        </div>

        {/* 연락처 정보 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            연락처 정보
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연락처 *
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="010-0000-0000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example@email.com"
              />
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            추가 정보
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                선호 연락 시간
              </label>
              <select
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택해주세요</option>
                {preferredTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                예산 범위
              </label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택해주세요</option>
                {budgetRanges.map((budget) => (
                  <option key={budget} value={budget}>
                    {budget}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                입주 희망일
              </label>
              <input
                type="date"
                name="moveInDate"
                value={formData.moveInDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </div>

        {/* 안내사항 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            📋 문의 시 안내사항
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 입력하신 연락처로 빠른 시일 내에 연락드리겠습니다.</li>
            <li>• 상세한 상담을 위해 가능한 한 구체적으로 문의해주세요.</li>
            <li>
              • 부동산 중개업소를 통해 안전하고 신뢰할 수 있는 거래가
              이루어집니다.
            </li>
          </ul>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(`/property/read/${propertyId}`)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "문의 중..." : "문의 등록"}
          </button>
        </div>
      </form>

      {/* 결과 모달 */}
      {modalState.isOpen && (
        <ResultModal
          title={modalState.title}
          content={modalState.content}
          callbackFn={handleModalClose}
        />
      )}
    </div>
  );
};

export default ReplyComponent;
