import React, { useState, useEffect, useRef } from 'react';

const ImageModal = ({ isOpen, onClose, images, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const imageRef = useRef(null);

  // 모달이 열릴 때 초기 인덱스 설정 및 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsLoading(true);
      
      // body 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      // body 스크롤 복원
      document.body.style.overflow = 'unset';
    }

    // 컴포넌트 언마운트 시 body 스크롤 복원
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleResetZoom();
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, scale]);

  // 마우스 휠 이벤트 처리
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // 마우스 다운 이벤트 처리
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  // 마우스 무브 이벤트 처리
  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // 마우스 업 이벤트 처리
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 이전 이미지로 이동
  const handlePrev = () => {
    if (images.length <= 1) return;
    setCurrentIndex(prev => 
      prev > 0 ? prev - 1 : images.length - 1
    );
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsLoading(true);
  };

  // 다음 이미지로 이동
  const handleNext = () => {
    if (images.length <= 1) return;
    setCurrentIndex(prev => 
      prev < images.length - 1 ? prev + 1 : 0
    );
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsLoading(true);
  };

  // 확대
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  // 축소
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  };

  // 확대/축소 리셋
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // 이미지 로드 완료 처리
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // 썸네일 클릭 처리
  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsLoading(true);
  };

  if (!isOpen || !images || images.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* 모달 내용 */}
      <div 
        className="relative w-[90%] h-[90%] max-w-4xl max-h-[80vh] flex items-center justify-center bg-gray-800 rounded-lg shadow-2xl border-2 border-gray-600"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[10000] text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 좌우 네비게이션 버튼 */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-[10000] text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-[10000] text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* 메인 이미지 */}
        <div className="relative flex-1 flex items-center justify-center p-4">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
          )}
          <img
            ref={imageRef}
            src={`${process.env.REACT_APP_BACKEND_URL || "http://localhost:8080"}/files/${images[currentIndex]}`}
            alt={`이미지 ${currentIndex + 1}`}
            className={`max-w-full max-h-full object-contain transition-transform duration-200 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            onLoad={handleImageLoad}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            draggable={false}
          />
        </div>

        {/* 확대/축소 컨트롤 */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-[10000] flex items-center gap-2 bg-black bg-opacity-50 rounded-lg p-2">
          <button
            onClick={handleZoomOut}
            className="text-white hover:text-gray-300 transition-colors p-2"
            title="축소 (마우스 휠 아래)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-white text-sm min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="text-white hover:text-gray-300 transition-colors p-2"
            title="확대 (마우스 휠 위)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleResetZoom}
            className="text-white hover:text-gray-300 transition-colors p-2 ml-2"
            title="원본 크기 (0)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>

        {/* 썸네일 이미지들 */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[10000] flex gap-2 bg-black bg-opacity-50 rounded-lg p-2">
            {images.map((image, index) => (
              <img
                key={index}
                src={`${process.env.REACT_APP_BACKEND_URL || "http://localhost:8080"}/files/${image}`}
                alt={`썸네일 ${index + 1}`}
                className={`w-16 h-12 object-cover rounded cursor-pointer transition-all ${
                  index === currentIndex
                    ? 'border-2 border-white opacity-100'
                    : 'border border-gray-600 opacity-60 hover:opacity-80'
                }`}
                onClick={() => handleThumbnailClick(index)}
              />
            ))}
          </div>
        )}

        {/* 이미지 인디케이터 */}
        {images.length > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[10000] flex gap-2">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-white'
                    : 'bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}

        {/* 키보드 단축키 안내 */}
        <div className="absolute top-4 left-4 z-[10000] text-white text-xs opacity-70">
          <div>← → : 이미지 이동</div>
          <div>+ - : 확대/축소</div>
          <div>0 : 원본 크기</div>
          <div>ESC : 닫기</div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
