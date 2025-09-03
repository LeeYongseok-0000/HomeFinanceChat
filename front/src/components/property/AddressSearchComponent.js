import React, { useState, useEffect } from "react";

const AddressSearchComponent = ({
  initialAddress = "",
  onAddressSelect,
  onAddressChange,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialAddress);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // 도로명 주소 검색 API 호출
  const searchAddress = async (keyword) => {
    if (!keyword || keyword.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // 도로명 주소 검색 API (공공데이터포털 또는 카카오 주소 API 사용)
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
          keyword
        )}`,
        {
          headers: {
            Authorization: `KakaoAK ${
              process.env.REACT_APP_KAKAO_REST_API_KEY ||
              "your_kakao_rest_api_key"
            }`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.documents || []);
      } else {
        console.error("주소 검색 실패:", response.status);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("주소 검색 오류:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // initialAddress가 변경될 때 searchTerm 업데이트
  useEffect(() => {
    setSearchTerm(initialAddress);
  }, [initialAddress]);

  // 검색어 입력 시 검색 실행
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchAddress(searchTerm);
      }
    }, 300); // 300ms 딜레이로 API 호출 최적화

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 주소 선택 시
  const handleAddressSelect = (address) => {
    setSearchTerm(address.address_name);
    setShowResults(false);
    onAddressSelect(address);
    onAddressChange(address.address_name);
  };

  // 검색 결과 숨기기
  const handleBlur = () => {
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className="relative">
      {/* 주소 검색 입력창 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
            onAddressChange(e.target.value);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={handleBlur}
          placeholder="도로명 주소를 검색하세요 (예: 강남대로)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => searchAddress(searchTerm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          검색
        </button>
      </div>

      {/* 검색 결과 드롭다운 */}
      {showResults && (searchResults.length > 0 || isSearching) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">검색 중...</div>
          ) : (
            <>
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleAddressSelect(result)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-800">
                    {result.address_name}
                  </div>
                  {result.road_address && (
                    <div className="text-sm text-gray-600 mt-1">
                      {result.road_address.address_name}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* 검색 결과가 없을 때 */}
      {showResults &&
        !isSearching &&
        searchResults.length === 0 &&
        searchTerm.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            <div className="p-4 text-center text-gray-500">
              검색 결과가 없습니다.
            </div>
          </div>
        )}
    </div>
  );
};

export default AddressSearchComponent;
