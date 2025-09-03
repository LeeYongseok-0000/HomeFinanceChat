import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllReviewRequests,
  approveReviewRequest,
  rejectReviewRequest,
  cancelApprovedReviewRequest,
  convertApprovedRequestsToProperties,
} from "../../api/propertyReviewRequestApi";
import { getCookie } from "../../util/cookieUtil";

function PropertyReviewRequestListComponent() {
  const navigate = useNavigate();
  const [reviewRequests, setReviewRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    loadReviewRequests();
  }, []);

  const loadReviewRequests = async () => {
    try {
      setLoading(true);
      const requests = await getAllReviewRequests();
      setReviewRequests(requests);
    } catch (error) {
      console.error("검수 요청 목록 조회 실패:", error);
      alert("검수 요청 목록을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveReviewRequest(id, reviewComment);
      alert("검수 요청이 승인되었습니다.");
      setShowActionModal(false);
      setReviewComment("");
      loadReviewRequests();
    } catch (error) {
      console.error("승인 실패:", error);
      alert("승인 처리에 실패했습니다.");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectReviewRequest(id, reviewComment);
      alert("검수 요청이 거절되었습니다.");
      setShowActionModal(false);
      setReviewComment("");
      loadReviewRequests();
    } catch (error) {
      console.error("거절 실패:", error);
      alert("거절 처리에 실패했습니다.");
    }
  };

  const handleCancelApproval = async (id) => {
    try {
      await cancelApprovedReviewRequest(id, reviewComment);
      alert("승인이 취소되었습니다.");
      setShowActionModal(false);
      setReviewComment("");
      loadReviewRequests();
    } catch (error) {
      console.error("승인 취소 실패:", error);
      alert("승인 취소에 실패했습니다.");
    }
  };

  const handleConvertToProperties = async () => {
    try {
      const result = await convertApprovedRequestsToProperties();
      alert(
        result ||
          "승인된 검수 요청이 Property로 변환되고 목록에서 제거되었습니다."
      );
      loadReviewRequests();
    } catch (error) {
      console.error("변환 실패:", error);
      const errorMessage =
        error.response?.data || "Property 변환에 실패했습니다.";
      alert(`변환 실패: ${errorMessage}`);
    }
  };

  const openActionModal = (type, request) => {
    setActionType(type);
    setSelectedRequest(request);
    setShowActionModal(true);
  };

  const handleAction = () => {
    if (!selectedRequest) return;

    switch (actionType) {
      case "approve":
        handleApprove(selectedRequest.id);
        break;
      case "reject":
        handleReject(selectedRequest.id);
        break;
      case "cancel-approval":
        handleCancelApproval(selectedRequest.id);
        break;
      default:
        break;
    }
  };

  const handlePropertyClick = (request) => {
    // 검수 요청 상세 페이지로 이동
    navigate(`/admin/property-review-requests/${request.id}`);
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
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          매물 검수 요청 관리
        </h2>
        <p className="text-sm text-gray-600">
          사용자가 제출한 매물 검수 요청을 관리합니다.
        </p>
      </div>

      {/* 승인된 요청을 Property로 변환하는 버튼 */}
      <div className="mb-4">
        <button
          onClick={handleConvertToProperties}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          승인된 요청 업로드{" "}
        </button>
      </div>

      {/* 검수 요청 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                매물명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                요청자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                매물유형
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                거래유형
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가격
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                요청일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviewRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(request.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handlePropertyClick(request)}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {request.name}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.memberName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.propertyType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.transactionType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {request.status === "PENDING" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openActionModal("approve", request)}
                        className="text-green-600 hover:text-green-900"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => openActionModal("reject", request)}
                        className="text-red-600 hover:text-red-900"
                      >
                        거절
                      </button>
                    </div>
                  )}
                  {request.status === "APPROVED" && (
                    <div className="flex space-x-2">
                      <span className="text-green-600">승인됨</span>
                      <button
                        onClick={() =>
                          openActionModal("cancel-approval", request)
                        }
                        className="text-orange-600 hover:text-orange-900"
                      >
                        승인취소
                      </button>
                    </div>
                  )}
                  {request.status === "REJECTED" && (
                    <span className="text-red-600">거절됨</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 상세 정보 모달 */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                매물 상세 정보
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <div>
                  <strong>매물명:</strong> {selectedRequest.name}
                </div>
                <div>
                  <strong>설명:</strong> {selectedRequest.description}
                </div>
                <div>
                  <strong>가격:</strong> {selectedRequest.price}
                </div>
                <div>
                  <strong>매물유형:</strong> {selectedRequest.propertyType}
                </div>
                <div>
                  <strong>거래유형:</strong> {selectedRequest.transactionType}
                </div>
                {selectedRequest.monthlyRent && (
                  <div>
                    <strong>월세:</strong> {selectedRequest.monthlyRent}
                  </div>
                )}
                <div>
                  <strong>주소:</strong> {selectedRequest.roadAddress}
                </div>
                <div>
                  <strong>상세주소:</strong> {selectedRequest.detailAddress}
                </div>
                <div>
                  <strong>면적:</strong> {selectedRequest.area}㎡
                </div>
                <div>
                  <strong>방 개수:</strong> {selectedRequest.rooms}
                </div>
                <div>
                  <strong>화장실 개수:</strong> {selectedRequest.bathrooms}
                </div>
                <div>
                  <strong>층수:</strong> {selectedRequest.floor}/
                  {selectedRequest.totalFloors}
                </div>
                <div>
                  <strong>준공년도:</strong> {selectedRequest.yearBuilt}
                </div>
                <div>
                  <strong>주차:</strong> {selectedRequest.parking}
                </div>
                <div>
                  <strong>난방:</strong> {selectedRequest.heating}
                </div>
                <div>
                  <strong>반려동물:</strong> {selectedRequest.petAllowed}
                </div>
                {selectedRequest.reviewComment && (
                  <div>
                    <strong>검수 코멘트:</strong>{" "}
                    {selectedRequest.reviewComment}
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 승인/거절 모달 */}
      {showActionModal && selectedRequest && (
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
                  onClick={handleAction}
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
}

export default PropertyReviewRequestListComponent;
