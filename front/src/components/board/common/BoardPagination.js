import React from "react";

const BoardPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  onPrevPage,
  onNextPage,
}) => {
  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // 최대 표시할 페이지 수
    
    if (totalPages <= maxVisiblePages) {
      // 전체 페이지가 5개 이하면 모든 페이지 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지를 중심으로 좌우 2개씩 표시
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // endPage가 totalPages에 도달했을 때 startPage 조정
      if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return null; // 페이지가 1개 이하면 표시하지 않음
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "10px",
      marginTop: "30px",
      marginBottom: "20px"
    }}>
      {/* 이전 페이지 버튼 */}
      <button
        onClick={onPrevPage}
        disabled={currentPage === 1}
        style={{
          padding: "8px 12px",
          backgroundColor: currentPage === 1 ? "#e9ecef" : "#007bff",
          color: currentPage === 1 ? "#6c757d" : "white",
          border: "none",
          borderRadius: "4px",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          fontSize: "14px",
          transition: "all 0.2s ease"
        }}
      >
        이전
      </button>

      {/* 페이지 번호들 */}
      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            padding: "8px 12px",
            backgroundColor: currentPage === page ? "#007bff" : "#f8f9fa",
            color: currentPage === page ? "white" : "#495057",
            border: `1px solid ${currentPage === page ? "#007bff" : "#dee2e6"}`,
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: currentPage === page ? "bold" : "normal",
            transition: "all 0.2s ease",
            minWidth: "40px"
          }}
          onMouseEnter={(e) => {
            if (currentPage !== page) {
              e.currentTarget.style.backgroundColor = "#e9ecef";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== page) {
              e.currentTarget.style.backgroundColor = "#f8f9fa";
            }
          }}
        >
          {page}
        </button>
      ))}

      {/* 다음 페이지 버튼 */}
      <button
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        style={{
          padding: "8px 12px",
          backgroundColor: currentPage === totalPages ? "#e9ecef" : "#007bff",
          color: currentPage === totalPages ? "#6c757d" : "white",
          border: "none",
          borderRadius: "4px",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          fontSize: "14px",
          transition: "all 0.2s ease"
        }}
      >
        다음
      </button>
    </div>
  );
};

export default BoardPagination;
