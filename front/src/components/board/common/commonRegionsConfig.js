// 지역 설정 - 모든 게시판 타입에서 공통으로 사용
export const REGIONS = {
  "시/도": [
    "서울특별시",
    "부산광역시",
    "대구광역시",
    "인천광역시",
    "광주광역시",
    "대전광역시",
    "울산광역시",  
  ],
  "시/군/구": {
    "서울특별시": [
      "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구",
      "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구",
      "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"
    ],
    "부산광역시": [
      "강서구", "금정구", "남구", "동구", "동래구", "부산진구", "북구", "사상구",
      "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구", "기장군"
    ],
    "대구광역시": [
      "남구", "달서구", "동구", "북구", "서구", "수성구", "중구", "달성군"
    ],
    "인천광역시": [
      "계양구", "남구", "남동구", "동구", "부평구", "서구", "연수구", "중구", "강화군", "옹진군"
    ],
    "광주광역시": [
      "광산구", "남구", "동구", "북구", "서구"
    ],
    "대전광역시": [
      "대덕구", "동구", "서구", "유성구", "중구"
    ],
    "울산광역시": [
      "남구", "동구", "북구", "중구", "울주군"
    ]
    
  }
};

// 지역 데이터를 쉽게 사용할 수 있도록 헬퍼 함수들
export const getProvinces = () => REGIONS["시/도"];

export const getCities = (province) => {
  return REGIONS["시/군/구"][province] || [];
};

export const getDistricts = (province, city) => {
  // 현재 구조에서는 시/군/구까지만 제공
  // 필요시 읍/면/동 데이터 추가 가능
  return [];
};

// 지역 전체 이름 조합 함수
export const getFullRegionName = (province, city, district = "") => {
  let fullName = province;
  if (city) {
    fullName += ` ${city}`;
  }
  if (district) {
    fullName += ` ${district}`;
  }
  return fullName;
};

// 지역 검색 함수
export const searchRegions = (keyword) => {
  const results = [];
  
  REGIONS["시/도"].forEach(province => {
    if (province.includes(keyword)) {
      results.push({ type: "province", name: province });
    }
    
    const cities = getCities(province);
    cities.forEach(city => {
      if (city.includes(keyword)) {
        results.push({ type: "city", name: city, province });
      }
    });
  });
  
  return results;
};
