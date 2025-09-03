import React from "react";

const CreditScoreModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-2xl w-full mx-4 relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>

        {/* QR 코드 */}
        <div className="flex items-center justify-center min-h-[320px]">
          <img
            src="/QRcode.png"
            alt="Toss 신용점수 확인 QR코드"
            className="w-96 h-80 object-contain"
          />
        </div>

        {/* 인식이 안될 경우 안내 */}
        <div className="text-center mt-4">
          <p className="text-gray-600 text-sm mb-2">인식이 안되세요?</p>
          <a
            href="https://toss.im/tossfeed/article/toss-free-credit-rating-service"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            토스 신용등급 무료 조회 서비스 바로가기
          </a>
        </div>
      </div>
    </div>
  );
};

export default CreditScoreModal;
