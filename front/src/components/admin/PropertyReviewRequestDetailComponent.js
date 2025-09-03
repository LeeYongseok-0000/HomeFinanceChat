import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getReviewRequest,
  approveReviewRequest,
  rejectReviewRequest,
  cancelApprovedReviewRequest,
} from "../../api/propertyReviewRequestApi";

const PropertyReviewRequestDetailComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    loadReviewRequest();
  }, [id]);

  const loadReviewRequest = async () => {
    try {
      setLoading(true);
      const data = await getReviewRequest(id);
      console.log("검수 요청 상세 데이터:", data);
      console.log("이미지 URLs:", data.imageUrls);
      setRequest(data);
    } catch (error) {
      console.error("검수 요청 상세 조회 실패:", error);
      alert("검수 요청을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await approveReviewRequest(id, reviewComment);
      alert("검수 요청이 승인되었습니다.");
      setShowActionModal(false);
      setReviewComment("");
      loadReviewRequest(); // 상태 업데이트
    } catch (error) {
      console.error("승인 실패:", error);
      alert("승인 처리에 실패했습니다.");
    }
  };

  const handleReject = async () => {
    try {
      await rejectReviewRequest(id, reviewComment);
      alert("검수 요청이 거절되었습니다.");
      setShowActionModal(false);
      setReviewComment("");
      loadReviewRequest(); // 상태 업데이트
    } catch (error) {
      console.error("거절 실패:", error);
      alert("거절 처리에 실패했습니다.");
    }
  };

  const handleCancelApproval = async () => {
    try {
      await cancelApprovedReviewRequest(id, reviewComment);
      alert("승인이 취소되었습니다.");
      setShowActionModal(false);
      setReviewComment("");
      loadReviewRequest(); // 상태 업데이트
    } catch (error) {
      console.error("승인 취소 실패:", error);
      alert("승인 취소에 실패했습니다.");
    }
  };

  const openActionModal = (type) => {
    setActionType(type);
    setShowActionModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { text: "대기중", color: "bg-yellow-100 text-yellow-800" },
      APPROVED: { text: "승인", color: "bg-green-100 text-green-800" },
      REJECTED: { text: "거절", color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span
        className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">
          검수 요청을 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">검수 요청 상세</h1>
          <button
            onClick={() => navigate("/admin/property-approval")}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>

        {/* 상태 및 요청자 정보 */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">상태:</span>
            {getStatusBadge(request.status)}
          </div>
          <div className="text-sm text-gray-600">
            요청자: {request.memberName} ({request.memberEmail})
          </div>
          <div className="text-sm text-gray-600">
            요청일: {new Date(request.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      {/* 매물 정보 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">매물 정보</h2>

        {/* 이미지 섹션 */}
        {request.imageUrls && request.imageUrls.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">매물 이미지</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {request.imageUrls.map((imageUrl, index) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden rounded-lg"
                >
                  <img
                    src={`${
                      process.env.REACT_APP_BACKEND_URL ||
                      "http://localhost:8080"
                    }/files/${imageUrl}`}
                    alt={`매물 이미지 ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">기본 정보</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>매물명:</strong> {request.name}
              </div>
              <div>
                <strong>설명:</strong> {request.description}
              </div>
              <div>
                <strong>가격:</strong> {request.price}
              </div>
              <div>
                <strong>매물유형:</strong> {request.propertyType}
              </div>
              <div>
                <strong>거래유형:</strong> {request.transactionType}
              </div>
              {request.monthlyRent && (
                <div>
                  <strong>월세:</strong> {request.monthlyRent}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">위치 정보</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>도로명주소:</strong> {request.roadAddress}
              </div>
              <div>
                <strong>상세주소:</strong> {request.detailAddress}
              </div>
              {request.latitude && request.longitude && (
                <div>
                  <strong>좌표:</strong> {request.latitude}, {request.longitude}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium text-gray-700 mb-2">상세 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>면적:</strong> {request.area}㎡
            </div>
            <div>
              <strong>방 개수:</strong> {request.rooms}
            </div>
            <div>
              <strong>화장실 개수:</strong> {request.bathrooms}
            </div>
            <div>
              <strong>층수:</strong> {request.floor}/{request.totalFloors}
            </div>
            <div>
              <strong>준공년도:</strong> {request.yearBuilt}
            </div>
            <div>
              <strong>주차:</strong> {request.parking}
            </div>
            <div>
              <strong>난방:</strong> {request.heating}
            </div>
            <div>
              <strong>반려동물:</strong> {request.petAllowed}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium text-gray-700 mb-2">옵션</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <strong>엘리베이터:</strong> {request.elevator ? "있음" : "없음"}
            </div>
            <div>
              <strong>발코니:</strong> {request.balcony ? "있음" : "없음"}
            </div>
            <div>
              <strong>TV:</strong> {request.tv ? "있음" : "없음"}
            </div>
            <div>
              <strong>에어컨:</strong>{" "}
              {request.airConditioner ? "있음" : "없음"}
            </div>
            <div>
              <strong>신발장:</strong> {request.shoeCabinet ? "있음" : "없음"}
            </div>
            <div>
              <strong>냉장고:</strong> {request.refrigerator ? "있음" : "없음"}
            </div>
            <div>
              <strong>세탁기:</strong>{" "}
              {request.washingMachine ? "있음" : "없음"}
            </div>
            <div>
              <strong>욕조:</strong> {request.bathtub ? "있음" : "없음"}
            </div>
            <div>
              <strong>싱크대:</strong> {request.sink ? "있음" : "없음"}
            </div>
            <div>
              <strong>인덕션:</strong> {request.induction ? "있음" : "없음"}
            </div>
            <div>
              <strong>옷장:</strong> {request.wardrobe ? "있음" : "없음"}
            </div>
            <div>
              <strong>화재경보기:</strong> {request.fireAlarm ? "있음" : "없음"}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium text-gray-700 mb-2">매물 설명</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-800 whitespace-pre-wrap">
              {request.description}
            </p>
          </div>
        </div>
      </div>

      {/* 검수 코멘트 */}
      {request.reviewComment && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            검수 코멘트
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-800">{request.reviewComment}</p>
          </div>
        </div>
      )}

      {/* 검수 작업 버튼 */}
      {request.status === "PENDING" && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            검수 작업
          </h2>
          <div className="flex space-x-4">
            <button
              onClick={() => openActionModal("approve")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              승인
            </button>
            <button
              onClick={() => openActionModal("reject")}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              거절
            </button>
          </div>
        </div>
      )}

      {/* 승인 취소 버튼 */}
      {request.status === "APPROVED" && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            승인 취소
          </h2>
          <div className="flex space-x-4">
            <button
              onClick={() => openActionModal("cancel-approval")}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              승인 취소
            </button>
          </div>
        </div>
      )}

      {/* 승인/거절 모달 */}
      {showActionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {actionType === "approve"
                  ? "검수 요청 승인"
                  : actionType === "reject"
                  ? "검수 요청 거절"
                  : "승인 취소"}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  코멘트 (선택사항)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="검수 코멘트를 입력하세요"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    if (actionType === "approve") {
                      handleApprove();
                    } else if (actionType === "reject") {
                      handleReject();
                    } else if (actionType === "cancel-approval") {
                      handleCancelApproval();
                    }
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    actionType === "approve"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : actionType === "reject"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  {actionType === "approve"
                    ? "승인"
                    : actionType === "reject"
                    ? "거절"
                    : "승인취소"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyReviewRequestDetailComponent;
