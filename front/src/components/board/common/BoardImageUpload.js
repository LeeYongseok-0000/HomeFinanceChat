import React, { useState, useRef } from "react";

const BoardImageUpload = ({
  images = [],
  onImagesChange,
  maxCount = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // 파일 타입 검증
    if (!acceptTypes.includes(file.type)) {
      alert("지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WEBP 파일만 업로드 가능합니다.");
      return false;
    }

    // 파일 크기 검증
    if (file.size > maxSize) {
      alert(`파일 크기는 ${maxSize / (1024 * 1024)}MB 이하여야 합니다.`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(validateFile);
    
    if (images.length + validFiles.length > maxCount) {
      alert(`이미지는 최대 ${maxCount}개까지 업로드 가능합니다.`);
      return;
    }

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    onImagesChange([...images, ...newImages]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ width: "100%" }}>
      {/* 파일 입력 (숨김) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptTypes.join(",")}
        onChange={handleFileInputChange}
        style={{ display: "none" }}
      />

      {/* 드래그 앤 드롭 영역 */}
      {images.length < maxCount && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
          style={{
            border: `2px dashed ${dragActive ? "#007bff" : "#dee2e6"}`,
            borderRadius: "8px",
            padding: "40px 20px",
            textAlign: "center",
            backgroundColor: dragActive ? "#f8f9ff" : "#f8f9fa",
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "20px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#007bff";
            e.currentTarget.style.backgroundColor = "#f0f8ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#dee2e6";
            e.currentTarget.style.backgroundColor = "#f8f9fa";
          }}
        >
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>
            📷
          </div>
          <div style={{ fontSize: "16px", fontWeight: "500", color: "#495057", marginBottom: "5px" }}>
            이미지를 드래그하거나 클릭하여 업로드
          </div>
          <div style={{ fontSize: "14px", color: "#6c757d" }}>
            최대 {maxCount}개, {maxSize / (1024 * 1024)}MB 이하
          </div>
          <div style={{ fontSize: "12px", color: "#adb5bd", marginTop: "5px" }}>
            JPG, PNG, GIF, WEBP 지원
          </div>
        </div>
      )}

      {/* 업로드된 이미지 미리보기 */}
      {images.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "15px"
          }}>
            {images.map((image, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #dee2e6"
                }}
              >
                <img
                  src={image.preview}
                  alt={`이미지 ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "120px",
                    objectFit: "cover"
                  }}
                />
                
                {/* 삭제 버튼 */}
                <button
                  onClick={() => removeImage(index)}
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
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(220, 53, 69, 1)";
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(220, 53, 69, 0.9)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  ×
                </button>

                {/* 파일명 */}
                <div style={{
                  position: "absolute",
                  bottom: "0",
                  left: "0",
                  right: "0",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  fontSize: "10px",
                  padding: "4px 8px",
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  {image.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 업로드 정보 */}
      <div style={{
        fontSize: "12px",
        color: "#6c757d",
        textAlign: "center"
      }}>
        {images.length} / {maxCount} 이미지 업로드됨
      </div>
    </div>
  );
};

export default BoardImageUpload;
