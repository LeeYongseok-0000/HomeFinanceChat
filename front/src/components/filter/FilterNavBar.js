import React, { useState, useEffect, useRef } from "react";
import "./FilterNavBar.css";
import { formatAmountToKorean } from "../../util/currencyUtil";

const FilterNavBar = ({
  filterItems,
  filterForm,
  setFilterForm,
  userMaxPurchaseAmount,
  isUserConditionFilterActive,
  onUserConditionToggle,
  onFilterApply,
}) => {
  // activeFilter 상태를 컴포넌트 내부에서 관리
  const [activeFilter, setActiveFilter] = useState(null);
  const navFiltersRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 150,
    left: 20,
  });

  // 필터 전체 초기화 함수
  const handleResetAllFilters = () => {
    console.log("모든 필터 초기화");

    // 필터 폼 초기화
    const resetForm = {
      transactionTypes: [], // 배열로 초기화
      rentType: "",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      roomCount: "",
      depositMin: "",
      depositMax: "",
      monthlyRentMin: "",
      monthlyRentMax: "",
      jeonseMin: "",
      jeonseMax: "",
      saleMin: "",
      saleMax: "",
      bathroomCount: "",
      floor: "",
      completionYearMin: "",
      completionYearMax: "",
      areaMin: "",
      areaMax: "",
      // 추가옵션 필터 초기화
      elevator: false,
      airConditioner: false,
      washingMachine: false,
      induction: false,
      balcony: false,
      shoeCabinet: false,
      bathtub: false,
      wardrobe: false,
      tv: false,
      refrigerator: false,
      sink: false,
      fireAlarm: false,
      parking: false,
      petFriendly: false,
      // 추가옵션 배열도 초기화
      additionalOptions: [],
    };

    setFilterForm(resetForm);

    // 활성 필터 닫기
    setActiveFilter(null);

    // 부모 컴포넌트에 초기화 알림
    if (onFilterApply) {
      onFilterApply(resetForm);
    }

    console.log("모든 필터가 초기화되었습니다.");
  };

  // 필터 클릭 핸들러
  const handleFilterClick = (filterId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log("=== 필터 클릭 이벤트 시작 ===");
    console.log("클릭된 필터 ID:", filterId);
    console.log("클릭 전 activeFilter:", activeFilter);
    console.log("이벤트 타겟:", event?.target?.className);

    // 같은 필터를 클릭한 경우 즉시 드롭다운 닫기
    if (activeFilter === filterId) {
      console.log("✅ 같은 필터 클릭 - 드롭다운 닫기 실행");
      setActiveFilter(null);
      console.log("✅ setActiveFilter(null) 호출 완료");
      return;
    }

    // 클릭된 요소의 위치 계산
    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      const newPosition = {
        top: rect.bottom + 5, // 요소 바로 아래 + 5px 여백
        left: rect.left, // 요소와 같은 x축 위치
      };
      setDropdownPosition(newPosition);
      console.log("📍 드롭다운 위치 설정:", newPosition);
    }

    // 다른 필터 클릭 시 드롭다운 열기
    console.log("🔄 다른 필터 클릭 - 드롭다운 열기 실행");
    setActiveFilter(filterId);
    console.log("🔄 setActiveFilter 호출됨, 새로운 값:", filterId);
    console.log("=== 필터 클릭 이벤트 종료 ===");
  };

  // 거래 유형 토글 함수 (중복 선택 가능)
  const toggleTransactionType = (type) => {
    setFilterForm((prev) => {
      const currentTypes = prev.transactionTypes || [];
      if (currentTypes.includes(type)) {
        // 이미 선택된 경우 제거 (한 번 더 클릭하면 해제)
        return {
          ...prev,
          transactionTypes: currentTypes.filter((t) => t !== type),
        };
      } else {
        // 선택되지 않은 경우 추가
        return {
          ...prev,
          transactionTypes: [...currentTypes, type],
        };
      }
    });
  };

  // 거래 유형이 선택되었는지 확인하는 함수
  const isTransactionTypeSelected = (type) => {
    return (filterForm.transactionTypes || []).includes(type);
  };

  // 외부 클릭 감지 (드롭다운 닫기)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // activeFilter가 없으면 아무것도 하지 않음
      if (!activeFilter) return;

      // filter-dropdown 영역을 클릭했을 때만 드롭다운을 닫지 않음
      const isClickInsideDropdown =
        filterDropdownRef.current &&
        filterDropdownRef.current.contains(event.target);

      // nav-filters 영역(필터 항목들)을 클릭했을 때도 드롭다운을 닫지 않음
      const isClickInsideNavFilters =
        navFiltersRef.current && navFiltersRef.current.contains(event.target);

      // filter-dropdown 영역과 nav-filters 영역 밖을 클릭했을 때만 드롭다운 닫기
      if (!isClickInsideDropdown && !isClickInsideNavFilters) {
        console.log("외부 클릭 감지 - 드롭다운 닫기", {
          target: event.target.tagName,
          targetClass: event.target.className,
          isClickInsideDropdown,
          isClickInsideNavFilters,
          activeFilter,
        });
        setActiveFilter(null);
      }
    };

    // ESC 키로 드롭다운 닫기
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && activeFilter) {
        console.log("ESC 키 감지 - 드롭다운 닫기");
        setActiveFilter(null);
      }
    };

    // 이벤트 리스너 등록 (여러 이벤트 타입 사용)
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    // 클린업 함수
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeFilter]);

  // 드롭다운이 열렸을 때 해당 입력 필드에 포커스
  useEffect(() => {
    if (activeFilter) {
      // 다음 렌더링 후에 포커스 설정
      setTimeout(() => {
        let targetInput = null;
        
        if (activeFilter === "area") {
          targetInput = document.querySelector('.range-input[placeholder="최소 면적"]');
        } else if (activeFilter === "roomCount") {
          targetInput = document.querySelector('.single-input[placeholder="방 수"]');
        } else if (activeFilter === "bathroomCount") {
          targetInput = document.querySelector('.single-input[placeholder="화장실 수"]');
        } else if (activeFilter === "floor") {
          targetInput = document.querySelector('.single-input[placeholder="층 수"]');
        } else if (activeFilter === "completionYear") {
          targetInput = document.querySelector('.range-input[placeholder="준공년도"]');
        }
        
        if (targetInput) {
          targetInput.focus();
        }
      }, 100);
    }
  }, [activeFilter]);

  // 필터 적용 핸들러
  const handleFilterApply = () => {
    console.log("필터 적용:", filterForm);

    // 준공년도 유효성 검사
    if (activeFilter === "completionYear") {
      const minYear = parseInt(filterForm.completionYearMin);
      const maxYear = parseInt(filterForm.completionYearMax);

      if (filterForm.completionYearMin && minYear < 1960) {
        alert("준공년도는 1960년 이후로 입력해주세요.");
        return;
      }

      if (filterForm.completionYearMax && maxYear > 2025) {
        alert("준공년도는 2025년 이전으로 입력해주세요.");
        return;
      }

      if (
        filterForm.completionYearMin &&
        filterForm.completionYearMax &&
        minYear > maxYear
      ) {
        alert("최솟값은 최댓값보다 작아야 합니다.");
        return;
      }
    }

    // 추가옵션 필터가 활성화된 경우 추가옵션 데이터 구성
    let filterData = { ...filterForm };
    
    if (activeFilter === "additionalOptions") {
      // 선택된 추가옵션들을 배열로 구성
      const selectedOptions = [];
      if (filterForm.elevator) selectedOptions.push("elevator");
      if (filterForm.airConditioner) selectedOptions.push("airConditioner");
      if (filterForm.washingMachine) selectedOptions.push("washingMachine");
      if (filterForm.induction) selectedOptions.push("induction");
      if (filterForm.balcony) selectedOptions.push("balcony");
      if (filterForm.shoeCabinet) selectedOptions.push("shoeCabinet");
      if (filterForm.bathtub) selectedOptions.push("bathtub");
      if (filterForm.wardrobe) selectedOptions.push("wardrobe");
      if (filterForm.tv) selectedOptions.push("tv");
      if (filterForm.refrigerator) selectedOptions.push("refrigerator");
      if (filterForm.sink) selectedOptions.push("sink");
      if (filterForm.fireAlarm) selectedOptions.push("fireAlarm");
      if (filterForm.parking) selectedOptions.push("parking");
      if (filterForm.petFriendly) selectedOptions.push("petFriendly");

      filterData.additionalOptions = selectedOptions;
      console.log("=== FilterNavBar - 추가옵션 필터 적용 ===");
      console.log("선택된 추가옵션들:", selectedOptions);
      console.log("filterForm 상태:", {
        elevator: filterForm.elevator,
        airConditioner: filterForm.airConditioner,
        parking: filterForm.parking,
        petFriendly: filterForm.petFriendly
      });
      console.log("전송할 filterData:", filterData);
      console.log("=== FilterNavBar 로그 완료 ===");
    }

    // 부모 컴포넌트에 필터 적용 알림
    if (onFilterApply) {
      onFilterApply(filterData);
    }

    setActiveFilter(null); // 드롭다운 닫기
  };

  // 필터 초기화 핸들러
  const handleFilterReset = () => {
    // 현재 활성화된 필터만 초기화
    const currentFilterId = activeFilter;
    if (currentFilterId === "transactionType") {
      setFilterForm((prev) => ({
        ...prev,
        transactionTypes: [], // 배열로 초기화
        depositMin: "",
        depositMax: "",
        monthlyRentMin: "",
        monthlyRentMax: "",
        jeonseMin: "",
        jeonseMax: "",
        saleMin: "",
        saleMax: "",
      }));
    } else if (currentFilterId === "area") {
      setFilterForm((prev) => ({
        ...prev,
        areaMin: "",
        areaMax: "",
      }));
    } else if (currentFilterId === "roomCount") {
      setFilterForm((prev) => ({
        ...prev,
        roomCount: "",
      }));
    } else if (currentFilterId === "bathroomCount") {
      setFilterForm((prev) => ({
        ...prev,
        bathroomCount: "",
      }));
    } else if (currentFilterId === "floor") {
      setFilterForm((prev) => ({
        ...prev,
        floor: "",
      }));
    } else if (currentFilterId === "completionYear") {
      setFilterForm((prev) => ({
        ...prev,
        completionYearMin: "",
        completionYearMax: "",
      }));
    } else if (currentFilterId === "additionalOptions") {
      // 추가옵션 필터 초기화
      setFilterForm((prev) => ({
        ...prev,
        elevator: false,
        airConditioner: false,
        washingMachine: false,
        induction: false,
        balcony: false,
        shoeCabinet: false,
        bathtub: false,
        wardrobe: false,
        tv: false,
        refrigerator: false,
        sink: false,
        fireAlarm: false,
        parking: false,
        petFriendly: false,
      }));
    }
  };

  return (
    <>
      {/* 상단 네비게이션 바 */}
      <div className="top-nav">
        {/* 필터 아이템들 */}
        <div className="nav-filters" ref={navFiltersRef}>
          {filterItems.map((item) => (
            <div
              key={item.id}
              className={`filter-item ${
                activeFilter === item.id ? "active" : ""
              }`}
              onClick={(event) => handleFilterClick(item.id, event)}
            >
              <div className="filter-item-label">{item.label}</div>
              <div
                className={`filter-arrow ${
                  activeFilter === item.id ? "up" : "down"
                }`}
              >
                ▼
              </div>
            </div>
          ))}

          {/* 모든 필터 초기화 버튼 - 준공년도 오른쪽에 배치 */}
          <button
            className="reset-all-filters-btn"
            onClick={handleResetAllFilters}
            title="모든 필터 초기화"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="reset-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 필터 드롭다운 - top-nav 밖으로 이동하여 지도 위에 표시 */}
      {activeFilter && (
        <div
          className={`filter-dropdown ${
            activeFilter === "roomCount" ? "compact-section" : ""
          }`}
          ref={filterDropdownRef}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="filter-dropdown-content">
            <div className="filter-dropdown-header">
              <h3>
                {filterItems.find((item) => item.id === activeFilter)?.label}
              </h3>
              <button
                className="close-filter"
                onClick={() => setActiveFilter(null)}
              >
                ×
              </button>
            </div>
            <div className="filter-dropdown-body">
              {/* 월세/전세/매매 필터 내용 */}
              {activeFilter === "transactionType" && (
                <div className="filter-content">
                  <div className="filter-group">
                    {/* 거래 유형 선택 */}
                    <div className="transaction-type-selection">
                      <h4 className="section-title">
                        거래 유형 선택 (중복 선택 가능)
                      </h4>
                      <div className="transaction-type-buttons">
                        <button
                          className={`transaction-type-btn ${
                            isTransactionTypeSelected("월세") ? "active" : ""
                          }`}
                          onClick={() => toggleTransactionType("월세")}
                        >
                          월세
                        </button>
                        <button
                          className={`transaction-type-btn ${
                            isTransactionTypeSelected("전세") ? "active" : ""
                          }`}
                          onClick={() => toggleTransactionType("전세")}
                        >
                          전세
                        </button>
                        <button
                          className={`transaction-type-btn ${
                            isTransactionTypeSelected("매매") ? "active" : ""
                          }`}
                          onClick={() => toggleTransactionType("매매")}
                        >
                          매매
                        </button>
                      </div>
                      {/* 선택된 거래 유형 표시 */}
                      {(filterForm.transactionTypes || []).length > 0 && (
                        <div className="selected-types">
                          선택됨:{" "}
                          {(filterForm.transactionTypes || []).join(", ")}
                        </div>
                      )}
                    </div>

                    {/* 월세 필터 - 월세 선택 시에만 표시 */}
                    {isTransactionTypeSelected("월세") && (
                      <div className="transaction-type-section">
                        <h4 className="section-title">월세 상세 조건</h4>
                        <div className="deposit-section">
                          <div className="section-label">보증금 (만원)</div>
                          <div className="filter-range-inputs">
                            <div className="range-input-container">
                              <input
                                type="number"
                                className="range-input"
                                placeholder="최소 보증금"
                                min="0"
                                value={filterForm.depositMin || ""}
                                onChange={(e) =>
                                  setFilterForm((prev) => ({
                                    ...prev,
                                    depositMin: e.target.value,
                                  }))
                                }
                              />
                              <div className="range-input-spinner">
                                <div
                                  className="spinner-arrow up"
                                  onClick={() => {
                                    const currentValue =
                                      parseInt(filterForm.depositMin) || 0;
                                    setFilterForm((prev) => ({
                                      ...prev,
                                      depositMin: currentValue + 1,
                                    }));
                                  }}
                                >
                                  ▲
                                </div>
                                <div
                                  className="spinner-arrow down"
                                  onClick={() => {
                                    const currentValue =
                                      parseInt(filterForm.depositMin) || 0;
                                    if (currentValue > 0) {
                                      setFilterForm((prev) => ({
                                        ...prev,
                                        depositMin: currentValue - 1,
                                      }));
                                    }
                                  }}
                                >
                                  ▼
                                </div>
                              </div>
                            </div>
                            <span className="range-separator">~</span>
                            <div className="range-input-container">
                              <input
                                type="number"
                                className="range-input"
                                placeholder="최대 보증금"
                                min="0"
                                value={filterForm.depositMax || ""}
                                onChange={(e) =>
                                  setFilterForm((prev) => ({
                                    ...prev,
                                    depositMax: e.target.value,
                                  }))
                                }
                              />
                              <div className="range-input-spinner">
                                <div
                                  className="spinner-arrow up"
                                  onClick={() => {
                                    const currentValue =
                                      parseInt(filterForm.depositMax) || 0;
                                    setFilterForm((prev) => ({
                                      ...prev,
                                      depositMax: currentValue + 1,
                                    }));
                                  }}
                                >
                                  ▲
                                </div>
                                <div
                                  className="spinner-arrow down"
                                  onClick={() => {
                                    const currentValue =
                                      parseInt(filterForm.depositMax) || 0;
                                    if (currentValue > 0) {
                                      setFilterForm((prev) => ({
                                        ...prev,
                                        depositMax: currentValue - 1,
                                      }));
                                    }
                                  }}
                                >
                                  ▼
                                </div>
                              </div>
                            </div>
                            <span className="range-unit">만원</span>
                          </div>
                        </div>
                        <div className="monthly-rent-section">
                          <div className="section-label">월세 (만원)</div>
                          <div className="filter-range-inputs">
                            <div className="range-input-container">
                              <input
                                type="number"
                                className="range-input"
                                placeholder="최소 월세"
                                min="0"
                                value={filterForm.monthlyRentMin || ""}
                                onChange={(e) =>
                                  setFilterForm((prev) => ({
                                    ...prev,
                                    monthlyRentMin: e.target.value,
                                  }))
                                }
                              />
                              <div className="range-input-spinner">
                                <div
                                  className="spinner-arrow up"
                                  onClick={() => {
                                    const currentValue =
                                      parseInt(filterForm.monthlyRentMin) || 0;
                                    setFilterForm((prev) => ({
                                      ...prev,
                                      monthlyRentMin: currentValue + 1,
                                    }));
                                  }}
                                >
                                  ▲
                                </div>
                                <div
                                  className="spinner-arrow down"
                                  onClick={() => {
                                    const currentValue =
                                      parseInt(filterForm.monthlyRentMin) || 0;
                                    if (currentValue > 0) {
                                      setFilterForm((prev) => ({
                                        ...prev,
                                        monthlyRentMin: currentValue - 1,
                                      }));
                                    }
                                  }}
                                >
                                  ▼
                                </div>
                              </div>
                            </div>
                            <span className="range-separator">~</span>
                            <div className="range-input-container">
                              <input
                                type="number"
                                className="range-input"
                                placeholder="최대 월세"
                                min="0"
                                value={filterForm.monthlyRentMax || ""}
                                onChange={(e) =>
                                  setFilterForm((prev) => ({
                                    ...prev,
                                    monthlyRentMax: e.target.value,
                                  }))
                                }
                              />
                              <div className="range-input-spinner">
                                <div
                                  className="spinner-arrow up"
                                  onClick={() => {
                                    const currentValue =
                                      parseInt(filterForm.monthlyRentMax) || 0;
                                    setFilterForm((prev) => ({
                                      ...prev,
                                      monthlyRentMax: currentValue + 1,
                                    }));
                                  }}
                                >
                                  ▲
                                </div>
                                <div
                                  className="spinner-arrow down"
                                  onClick={() => {
                                    const currentValue =
                                      parseInt(filterForm.monthlyRentMax) || 0;
                                    if (currentValue > 0) {
                                      setFilterForm((prev) => ({
                                        ...prev,
                                        monthlyRentMax: currentValue - 1,
                                      }));
                                    }
                                  }}
                                >
                                  ▼
                                </div>
                              </div>
                            </div>
                            <span className="range-unit">만원</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 전세 필터 - 전세 선택 시에만 표시 */}
                    {isTransactionTypeSelected("전세") && (
                      <div className="transaction-type-section">
                        <h4 className="section-title">전세</h4>
                        <div className="filter-range-inputs">
                          <div className="range-input-container">
                            <input
                              type="number"
                              className="range-input"
                              placeholder="최소 전세가"
                              min="0"
                              step="0.1"
                              value={filterForm.jeonseMin || ""}
                              onChange={(e) =>
                                setFilterForm((prev) => ({
                                  ...prev,
                                  jeonseMin: e.target.value,
                                }))
                              }
                            />
                            <div className="range-input-spinner">
                              <div
                                className="spinner-arrow up"
                                onClick={() => {
                                  const currentValue =
                                    parseFloat(filterForm.jeonseMin) || 0;
                                  setFilterForm((prev) => ({
                                    ...prev,
                                    jeonseMin: (currentValue + 0.1).toFixed(1),
                                  }));
                                }}
                              >
                                ▲
                              </div>
                              <div
                                className="spinner-arrow down"
                                onClick={() => {
                                  const currentValue =
                                    parseFloat(filterForm.jeonseMin) || 0;
                                  if (currentValue > 0) {
                                    setFilterForm((prev) => ({
                                      ...prev,
                                      jeonseMin: (currentValue - 0.1).toFixed(
                                        1
                                      ),
                                    }));
                                  }
                                }}
                              >
                                ▼
                              </div>
                            </div>
                          </div>
                          <span className="range-separator">~</span>
                          <div className="range-input-container">
                            <input
                              type="number"
                              className="range-input"
                              placeholder="최대 전세가"
                              min="0"
                              step="0.1"
                              value={filterForm.jeonseMax || ""}
                              onChange={(e) =>
                                setFilterForm((prev) => ({
                                  ...prev,
                                  jeonseMax: e.target.value,
                                }))
                              }
                            />
                            <div className="range-input-spinner">
                              <div
                                className="spinner-arrow up"
                                onClick={() => {
                                  const currentValue =
                                    parseFloat(filterForm.jeonseMax) || 0;
                                  setFilterForm((prev) => ({
                                    ...prev,
                                    jeonseMax: (currentValue + 0.1).toFixed(1),
                                  }));
                                }}
                              >
                                ▲
                              </div>
                              <div
                                className="spinner-arrow down"
                                onClick={() => {
                                  const currentValue =
                                    parseFloat(filterForm.jeonseMax) || 0;
                                  if (currentValue > 0) {
                                    setFilterForm((prev) => ({
                                      ...prev,
                                      jeonseMax: (currentValue + 0.1).toFixed(
                                        1
                                      ),
                                    }));
                                  }
                                }}
                              >
                                ▼
                              </div>
                            </div>
                          </div>
                          <span className="range-unit">억원</span>
                        </div>
                      </div>
                    )}

                    {/* 매매 필터 - 매매 선택 시에만 표시 */}
                    {isTransactionTypeSelected("매매") && (
                      <div className="transaction-type-section">
                        <h4 className="section-title">매매 상세 조건</h4>
                        <div className="filter-range-inputs">
                          <div className="range-input-container">
                            <input
                              type="number"
                              className="range-input"
                              placeholder="최소 매매가"
                              min="0"
                              step="0.1"
                              value={filterForm.saleMin || ""}
                              onChange={(e) =>
                                setFilterForm((prev) => ({
                                  ...prev,
                                  saleMin: e.target.value,
                                }))
                              }
                            />
                            <div className="range-input-spinner">
                              <div
                                className="spinner-arrow up"
                                onClick={() => {
                                  const currentValue =
                                    parseFloat(filterForm.saleMin) || 0;
                                  setFilterForm((prev) => ({
                                    ...prev,
                                    saleMin: (currentValue + 0.1).toFixed(1),
                                  }));
                                }}
                              >
                                ▲
                              </div>
                              <div
                                className="spinner-arrow down"
                                onClick={() => {
                                  const currentValue =
                                    parseFloat(filterForm.saleMin) || 0;
                                  if (currentValue > 0) {
                                    setFilterForm((prev) => ({
                                      ...prev,
                                      saleMin: (currentValue - 0.1).toFixed(1),
                                    }));
                                  }
                                }}
                              >
                                ▼
                              </div>
                            </div>
                          </div>
                          <span className="range-separator">~</span>
                          <div className="range-input-container">
                            <input
                              type="number"
                              className="range-input"
                              placeholder="최대 매매가"
                              min="0"
                              step="0.1"
                              value={filterForm.saleMax || ""}
                              onChange={(e) =>
                                setFilterForm((prev) => ({
                                  ...prev,
                                  saleMax: e.target.value,
                                }))
                              }
                            />
                            <div className="range-input-spinner">
                              <div
                                className="spinner-arrow up"
                                onClick={() => {
                                  const currentValue =
                                    parseFloat(filterForm.saleMin) || 0;
                                  setFilterForm((prev) => ({
                                    ...prev,
                                    saleMax: (currentValue + 0.1).toFixed(1),
                                  }));
                                }}
                              >
                                ▲
                              </div>
                              <div
                                className="spinner-arrow down"
                                onClick={() => {
                                  const currentValue =
                                    parseFloat(filterForm.saleMax) || 0;
                                  if (currentValue > 0) {
                                    setFilterForm((prev) => ({
                                      ...prev,
                                      saleMax: (currentValue + 0.1).toFixed(1),
                                    }));
                                  }
                                }}
                              >
                                ▼
                              </div>
                            </div>
                          </div>
                          <span className="range-unit">억원</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 면적 필터 내용 */}
              {activeFilter === "area" && (
                <div className="filter-content">
                  <div className="filter-group">
                    <div className="filter-range-inputs">
                      <div className="range-input-container">
                        <input
                          type="number"
                          className="range-input"
                          placeholder="최소 면적"
                          min="1"
                          value={filterForm.areaMin || ""}
                          onChange={(e) =>
                            setFilterForm((prev) => ({
                              ...prev,
                              areaMin: e.target.value,
                            }))
                          }
                        />
                        <div className="range-input-spinner">
                          <div
                            className="spinner-arrow up"
                            onClick={() => {
                              const currentValue =
                                parseInt(filterForm.areaMin) || 0;
                              setFilterForm((prev) => ({
                                ...prev,
                                areaMin: currentValue + 1,
                              }));
                            }}
                          >
                            ▲
                          </div>
                          <div
                            className="spinner-arrow down"
                            onClick={() => {
                              const currentValue =
                                parseInt(filterForm.areaMin) || 0;
                              if (currentValue > 1) {
                                setFilterForm((prev) => ({
                                  ...prev,
                                  areaMin: currentValue - 1,
                                }));
                              }
                            }}
                          >
                            ▼
                          </div>
                        </div>
                      </div>
                      <span className="range-separator">~</span>
                      <div className="range-input-container">
                        <input
                          type="number"
                          className="range-input"
                          placeholder="최대 면적"
                          min="1"
                          value={filterForm.areaMax || ""}
                          onChange={(e) =>
                            setFilterForm((prev) => ({
                              ...prev,
                              areaMax: e.target.value,
                            }))
                          }
                        />
                        <div className="range-input-spinner">
                          <div
                            className="spinner-arrow up"
                            onClick={() => {
                              const currentValue =
                                parseInt(filterForm.areaMax) || 0;
                              setFilterForm((prev) => ({
                                ...prev,
                                areaMax: currentValue + 1,
                              }));
                            }}
                          >
                            ▲
                          </div>
                          <div
                            className="spinner-arrow down"
                            onClick={() => {
                              const currentValue =
                                parseInt(filterForm.areaMax) || 0;
                              if (currentValue > 1) {
                                setFilterForm((prev) => ({
                                  ...prev,
                                  areaMax: currentValue - 1,
                                }));
                              }
                            }}
                          >
                            ▼
                          </div>
                        </div>
                      </div>
                      <span className="range-unit">m²</span>
                    </div>
                    {/* 평 단위 변환 표시 */}
                    <div className="area-conversion">
                      {filterForm.areaMin && (
                        <span className="conversion-text">
                          {Math.round(parseFloat(filterForm.areaMin) * 0.3025)}
                          평
                        </span>
                      )}
                      {filterForm.areaMin && filterForm.areaMax && (
                        <span className="conversion-separator"> ~ </span>
                      )}
                      {filterForm.areaMax && (
                        <span className="conversion-text">
                          {Math.round(parseFloat(filterForm.areaMax) * 0.3025)}
                          평
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 방 수 필터 내용 */}
              {activeFilter === "roomCount" && (
                <div className="filter-content">
                  <div className="filter-group">
                    <div className="filter-single-input">
                      <div className="single-input-container">
                        <input
                          type="number"
                          className="single-input"
                          placeholder="방 수"
                          min="1"
                          max="10"
                          value={filterForm.roomCount || ""}
                          onChange={(e) =>
                            setFilterForm((prev) => ({
                              ...prev,
                              roomCount: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="inline-stepper">
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => {
                            const currentValue = parseInt(filterForm.roomCount) || 0;
                            if (currentValue > 1) {
                              setFilterForm((prev) => ({
                                ...prev,
                                roomCount: currentValue - 1,
                              }));
                            }
                          }}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => {
                            const currentValue = parseInt(filterForm.roomCount) || 0;
                            if (currentValue < 10) {
                              setFilterForm((prev) => ({
                                ...prev,
                                roomCount: currentValue + 1,
                              }));
                            }
                          }}
                        >
                          +
                        </button>
                      </div>
                      <span className="single-input-unit">개</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 화장실 수 필터 내용 */}
              {activeFilter === "bathroomCount" && (
                <div className="filter-content">
                  <div className="filter-group">
                    <div className="filter-single-input">
                      <div className="single-input-container">
                        <input
                          type="number"
                          className="single-input"
                          placeholder="화장실 수"
                          min="1"
                          max="10"
                          value={filterForm.bathroomCount || ""}
                          onChange={(e) =>
                            setFilterForm((prev) => ({
                              ...prev,
                              bathroomCount: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="inline-stepper">
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => {
                            const currentValue = parseInt(filterForm.bathroomCount) || 0;
                            if (currentValue > 1) {
                              setFilterForm((prev) => ({
                                ...prev,
                                bathroomCount: currentValue - 1,
                              }));
                            }
                          }}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => {
                            const currentValue = parseInt(filterForm.bathroomCount) || 0;
                            if (currentValue < 10) {
                              setFilterForm((prev) => ({
                                ...prev,
                                bathroomCount: currentValue + 1,
                              }));
                            }
                          }}
                        >
                          +
                        </button>
                      </div>
                      <span className="single-input-unit">개</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 층 수 필터 내용 */}
              {activeFilter === "floor" && (
                <div className="filter-content">
                  <div className="filter-group">
                    <div className="filter-single-input">
                      <div className="single-input-container">
                        <input
                          type="number"
                          className="single-input"
                          placeholder="층 수"
                          min="1"
                          max="100"
                          value={filterForm.floor || ""}
                          onChange={(e) =>
                            setFilterForm((prev) => ({
                              ...prev,
                              floor: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="inline-stepper">
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => {
                            const currentValue = parseInt(filterForm.floor) || 0;
                            if (currentValue > 1) {
                              setFilterForm((prev) => ({
                                ...prev,
                                floor: currentValue - 1,
                              }));
                            }
                          }}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => {
                            const currentValue = parseInt(filterForm.floor) || 0;
                            if (currentValue < 100) {
                              setFilterForm((prev) => ({
                                ...prev,
                                floor: currentValue + 1,
                              }));
                            }
                          }}
                        >
                          +
                        </button>
                      </div>
                      <span className="single-input-unit">층</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 준공년도 필터 내용 */}
              {activeFilter === "completionYear" && (
                <div className="filter-content">
                  <div className="filter-group">
                    <div className="filter-range-inputs">
                      <div className="range-input-container">
                        <input
                          type="number"
                          className="range-input"
                          placeholder="준공년도"
                          min="1960"
                          max="2025"
                          value={filterForm.completionYearMin || ""}
                          onChange={(e) =>
                            setFilterForm((prev) => ({
                              ...prev,
                              completionYearMin: e.target.value,
                            }))
                          }
                        />
                        <div className="range-input-spinner">
                          <div
                            className="spinner-arrow up"
                            onClick={() => {
                              const currentValue =
                                parseInt(filterForm.completionYearMin) || 1960;
                              if (currentValue < 2025) {
                                setFilterForm((prev) => ({
                                  ...prev,
                                  completionYearMin: currentValue + 1,
                                }));
                              }
                            }}
                          >
                            ▲
                          </div>
                          <div
                            className="spinner-arrow down"
                            onClick={() => {
                              const currentValue =
                                parseInt(filterForm.completionYearMin) || 1960;
                              if (currentValue > 1960) {
                                setFilterForm((prev) => ({
                                  ...prev,
                                  completionYearMin: currentValue - 1,
                                }));
                              }
                            }}
                          >
                            ▼
                          </div>
                        </div>
                      </div>
                      <span className="range-separator">~</span>
                      <div className="range-input-container">
                        <input
                          type="number"
                          className="range-input"
                          placeholder="준공년도"
                          min="1960"
                          max="2025"
                          value={filterForm.completionYearMax || ""}
                          onChange={(e) =>
                            setFilterForm((prev) => ({
                              ...prev,
                              completionYearMax: e.target.value,
                            }))
                          }
                        />
                        <div className="range-input-spinner">
                          <div
                            className="spinner-arrow up"
                            onClick={() => {
                              const currentValue =
                                parseInt(filterForm.completionYearMax) || 1960;
                              if (currentValue < 2025) {
                                setFilterForm((prev) => ({
                                  ...prev,
                                  completionYearMax: currentValue + 1,
                                }));
                              }
                            }}
                          >
                            ▲
                          </div>
                          <div
                            className="spinner-arrow down"
                            onClick={() => {
                              const currentValue =
                                parseInt(filterForm.completionYearMax) || 1960;
                              if (currentValue > 1960) {
                                setFilterForm((prev) => ({
                                  ...prev,
                                  completionYearMax: currentValue - 1,
                                }));
                              }
                            }}
                          >
                            ▼
                          </div>
                        </div>
                      </div>
                      <span className="range-unit">년</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 사용자 조건 필터 내용 */}
              {activeFilter === "userCondition" && (
                <div className="filter-content">
                  <div className="filter-group">
                    <div className="user-condition-info">
                      <h4>최대 구매 가능액</h4>
                      {userMaxPurchaseAmount ? (
                        <div className="max-purchase-amount">
                          <span className="amount-value">
                            {formatAmountToKorean(userMaxPurchaseAmount)}
                          </span>
                          <span className="amount-label">이하 매물만 표시</span>
                        </div>
                      ) : (
                        <div className="no-credit-info">
                          <p>신용정보가 등록되지 않았습니다.</p>
                          <p>마이페이지에서 신용정보를 입력해주세요.</p>
                        </div>
                      )}
                    </div>
                    <div className="filter-toggle">
                      <label className="toggle-label">
                        <span>사용자 조건 필터</span>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={isUserConditionFilterActive}
                            onChange={onUserConditionToggle}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* 추가옵션 필터 내용 */}
              {activeFilter === "additionalOptions" && (
                <div className="filter-content">
                  <div className="filter-group">
                    <div className="options-section">
                      <h4 className="section-title">편의시설 옵션 (12개)</h4>
                      <div className="options-grid">
                        <label className="option-checkbox">
                          <div className="checkbox-icon-container">
                            <input
                              type="checkbox"
                              checked={filterForm.elevator || false}
                              onChange={(e) =>
                                setFilterForm((prev) => ({
                                  ...prev,
                                  elevator: e.target.checked,
                                }))
                              }
                            />
                            <span className="checkbox-custom"></span>
                            <img src="/elevator.png" alt="엘리베이터" className="option-icon" />
                          </div>
                          <span className="option-label">엘리베이터</span>
                        </label>
                        <label className="option-checkbox">
                          <div className="checkbox-icon-container">
                            <input
                              type="checkbox"
                              checked={filterForm.airConditioner || false}
                              onChange={(e) =>
                                setFilterForm((prev) => ({
                                  ...prev,
                                  airConditioner: e.target.checked,
                                }))
                              }
                            />
                            <span className="checkbox-custom"></span>
                            <img src="/air-conditioning.png" alt="에어컨" className="option-icon" />
                          </div>
                          <span className="option-label">에어컨</span>
                        </label>
                        <label className="option-checkbox">
                          <div className="checkbox-icon-container">
                            <input
                              type="checkbox"
                              checked={filterForm.washingMachine || false}
                              onChange={(e) =>
                                setFilterForm((prev) => ({
                                  ...prev,
                                  washingMachine: e.target.checked,
                                }))
                              }
                            />
                            <span className="checkbox-custom"></span>
                            <img src="/washing-machine.png" alt="세탁기" className="option-icon" />
                          </div>
                          <span className="option-label">세탁기</span>
                        </label>
                        <label className="option-checkbox">
                          <div className="checkbox-icon-container">
                            <input
                              type="checkbox"
                              checked={filterForm.induction || false}
                              onChange={(e) =>
                                setFilterForm((prev) => ({
                                  ...prev,
                                  induction: e.target.checked,
                                }))
                              }
                            />
                            <span className="checkbox-custom"></span>
                            <img src="/induction.png" alt="인덕션" className="option-icon" />
                          </div>
                          <span className="option-label">인덕션</span>
                        </label>
                        <label className="option-checkbox">
                          <div className="checkbox-icon-container">
                            <input
                              type="checkbox"
                              checked={filterForm.balcony || false}
                              onChange={(e) =>
                                setFilterForm((prev) => ({
                                  ...prev,
                                  balcony: e.target.checked,
                                }))
                              }
                            />
                            <span className="checkbox-custom"></span>
                            <img src="/balcony.png" alt="발코니" className="option-icon" />
                          </div>
                          <span className="option-label">발코니</span>
                        </label>
                        <label className="option-checkbox">
                          <div className="checkbox-icon-container">
                            <input
                              type="checkbox"
                              checked={filterForm.shoeCabinet || false}
                              onChange={(e) =>
                                setFilterForm((prev) => ({
                                  ...prev,
                                  shoeCabinet: e.target.checked,
                                }))
                              }
                            />
                            <span className="checkbox-custom"></span>
                            <img src="/shoe-cabinet.png" alt="신발장" className="option-icon" />
                          </div>
                          <span className="option-label">신발장</span>
                        </label>
                        <label className="option-checkbox">
                          <div className="checkbox-icon-container">
                            <input
                              type="checkbox"
                              checked={filterForm.bathtub || false}
                              onChange={(e) =>
                                setFilterForm((prev) => ({
                                  ...prev,
                                  bathtub: e.target.checked,
                                }))
                              }
                            />
                            <span className="checkbox-custom"></span>
                            <img src="/bathtub.png" alt="욕조" className="option-icon" />
                          </div>
                          <span className="option-label">욕조</span>
                        </label>
                        <label className="option-checkbox">
                          <div className="checkbox-icon-container">
                            <input
                              type="checkbox"
                              checked={filterForm.wardrobe || false}
                              onChange={(e) =>
                                setFilterForm((prev) => ({
                                  ...prev,
                                  wardrobe: e.target.checked,
                                }))
                              }
                            />
                            <span className="checkbox-custom"></span>
                            <img src="/wardrobe.png" alt="옷장" className="option-icon" />
                          </div>
                          <span className="option-label">옷장</span>
                        </label>
                        <label className="option-checkbox">
                          <div className="checkbox-icon-container">
                            <input
                              type="checkbox"
                              checked={filterForm.tv || false}
                              onChange={(e) =>
                                setFilterForm((prev) => ({
                                  ...prev,
                                  tv: e.target.checked,
                                }))
                              }
                            />
                            <span className="checkbox-custom"></span>
                            <img src="/tv.png" alt="TV" className="option-icon" />
                          </div>
                          <span className="option-label">TV</span>
                        </label>
                        <label className="option-checkbox">
                          <div className="checkbox-icon-container">
                            <input
                              type="checkbox"
                              checked={filterForm.refrigerator || false}
                              onChange={(e) =>
                                setFilterForm((prev) => ({
                                  ...prev,
                                  refrigerator: e.target.checked,
                                }))
                              }
                            />
                            <span className="checkbox-custom"></span>
                            <img src="/refrigerator.png" alt="냉장고" className="option-icon" />
                          </div>
                          <span className="option-label">냉장고</span>
                        </label>
                        <label className="option-checkbox">
                          <div className="checkbox-icon-container">
                            <input
                              type="checkbox"
                              checked={filterForm.sink || false}
                              onChange={(e) =>
                                setFilterForm((prev) => ({
                                  ...prev,
                                  sink: e.target.checked,
                                }))
                              }
                            />
                            <span className="checkbox-custom"></span>
                            <img src="/sink.png" alt="싱크대" className="option-icon" />
                          </div>
                          <span className="option-label">싱크대</span>
                        </label>
                        <label className="option-checkbox">
                          <div className="checkbox-icon-container">
                            <input
                              type="checkbox"
                              checked={filterForm.fireAlarm || false}
                              onChange={(e) =>
                                setFilterForm((prev) => ({
                                  ...prev,
                                  fireAlarm: e.target.checked,
                                }))
                              }
                            />
                            <span className="checkbox-custom"></span>
                            <img src="/fire-alarm.png" alt="화재경보기" className="option-icon" />
                          </div>
                          <span className="option-label">화재경보기</span>
                        </label>
                      </div>
                    </div>

                    <div className="options-section">
                      <h4 className="section-title">기타 옵션</h4>
                      <div className="other-options">
                        <label className="option-checkbox">
                          <input
                            type="checkbox"
                            checked={filterForm.parking || false}
                            onChange={(e) =>
                              setFilterForm((prev) => ({
                                ...prev,
                                parking: e.target.checked,
                              }))
                            }
                          />
                          <span className="checkbox-custom"></span>
                          <span className="option-label">주차</span>
                        </label>
                        <label className="option-checkbox">
                          <input
                            type="checkbox"
                            checked={filterForm.petFriendly || false}
                            onChange={(e) =>
                              setFilterForm((prev) => ({
                                ...prev,
                                petFriendly: e.target.checked,
                              }))
                            }
                          />
                          <span className="checkbox-custom"></span>
                          <span className="option-label">반려동물</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 필터 액션 버튼들 */}
              <div className="filter-actions">
                <button
                  className="apply-filter-btn"
                  onClick={handleFilterApply}
                >
                  적용하기
                </button>
                <button
                  className="reset-filter-btn"
                  onClick={handleFilterReset}
                >
                  초기화
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterNavBar;
