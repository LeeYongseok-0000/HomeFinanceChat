import React, { useState, useEffect, useRef } from "react";

const PropertyInfoModal = ({ property, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("description");
  const modalRef = useRef(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !property) return null;

  const tabs = [
    { id: "description", label: "설명" },
    { id: "agency", label: "중개사무소 정보" },
    { id: "otherProperties", label: "중개사무소의 다른 방" },
  ];

  const renderDescriptionTab = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">매물 상세 정보</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-600">매물 유형:</span>
            <span className="ml-2 text-gray-800">{property.propertyType}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">가격:</span>
            <span className="ml-2 text-gray-800">{property.price}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">면적:</span>
            <span className="ml-2 text-gray-800">{property.area}㎡</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">방 개수:</span>
            <span className="ml-2 text-gray-800">{property.rooms}개</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">화장실:</span>
            <span className="ml-2 text-gray-800">{property.bathrooms}개</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">현재 층:</span>
            <span className="ml-2 text-gray-800">{property.floor}층</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">전체 층수:</span>
            <span className="ml-2 text-gray-800">{property.totalFloors}층</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">준공년도:</span>
            <span className="ml-2 text-gray-800">{property.yearBuilt}년</span>
          </div>
          <div className="col-span-2">
            <span className="font-medium text-gray-600">주소:</span>
            <span className="ml-2 text-gray-800">{property.address}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">매물 설명</h4>
        <p className="text-gray-700 text-sm whitespace-pre-wrap">
          {property.content}
        </p>
      </div>
    </div>
  );

  const renderAgencyTab = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">중개사무소 정보</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">대표명:</span>
            <span className="text-gray-800">정문기</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">중개등록번호:</span>
            <span className="text-gray-800">11410-2025-00034</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">대표번호:</span>
            <span className="text-gray-800">02-333-4939</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-800 text-sm text-center">
          로그인하지 않아도 문자문의가 가능!
        </p>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg transition-colors">
          📞 전화문의
        </button>
        <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg transition-colors">
          💬 채팅문의
        </button>
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors">
          문자문의
        </button>
      </div>

      <button className="w-full bg-red-100 hover:bg-red-200 text-red-700 p-3 rounded-lg transition-colors">
        신고하기
      </button>
    </div>
  );

  const renderOtherPropertiesTab = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">
          중개사무소의 다른 방
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {/* 예시 매물 1 */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-sm">
                  월세 1000/70
                </div>
                <div className="text-gray-600 text-xs">
                  원룸 | 3층 | 16.52m² | 관리비 70,000원
                </div>
              </div>
            </div>
          </div>

          {/* 예시 매물 2 */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-sm">
                  월세 500/60
                </div>
                <div className="text-gray-600 text-xs">
                  원룸 | 2층 | 16.52m² | 관리비 60,000원
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return renderDescriptionTab();
      case "agency":
        return renderAgencyTab();
      case "otherProperties":
        return renderOtherPropertiesTab();
      default:
        return renderDescriptionTab();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        {/* 헤더 */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">매물 정보</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default PropertyInfoModal;
