/**
 * 금액을 한국어로 변환하는 유틸리티 함수
 */

/**
 * 만원 단위 숫자를 한국어 금액 표현으로 변환 (억과 천 단위까지만)
 * @param {number|string} amount - 만원 단위 금액
 * @returns {string} 한국어 금액 표현 (예: "1억5천만원")
 */
export const formatAmountToKorean = (amount) => {
  if (!amount || amount === 0) return "0원";

  const num = parseInt(amount);
  if (isNaN(num)) return "0원";

  // 만원 단위를 억원 단위로 변환
  if (num < 10000) {
    return `${num}만원`;
  }

  const billion = Math.floor(num / 10000);
  const million = num % 10000;

  if (million === 0) {
    return `${billion}억원`;
  } else {
    // 천 단위까지만 표시하고 나머지는 숫자로
    if (million >= 1000) {
      const thousandMillion = Math.floor(million / 1000);
      const remainingMillion = million % 1000;

      if (remainingMillion === 0) {
        return `${billion}억${thousandMillion}천만원`;
      } else {
        return `${billion}억${thousandMillion}천${remainingMillion}만원`;
      }
    } else {
      return `${billion}억${million}만원`;
    }
  }
};

/**
 * 원 단위 숫자를 한국어 금액 표현으로 변환
 * @param {number|string} amount - 원 단위 금액
 * @returns {string} 한국어 금액 표현 (예: "1억5천만원")
 */
export const formatWonToKorean = (amount) => {
  if (!amount || amount === 0) return "0원";

  const num = parseInt(amount);
  if (isNaN(num)) return "0원";

  // 원 단위를 억원 단위로 변환
  if (num < 100000000) {
    // 1억원 미만인 경우
    if (num < 10000) {
      return `${num}원`;
    } else if (num < 100000000) {
      const million = Math.floor(num / 10000);
      const won = num % 10000;
      if (won === 0) {
        return `${million}만원`;
      } else {
        return `${million}만${won}원`;
      }
    }
  }

  const billion = Math.floor(num / 100000000);
  const remaining = num % 100000000;
  const million = Math.floor(remaining / 10000);

  if (remaining === 0) {
    return `${billion}억원`;
  } else if (million === 0) {
    const won = remaining;
    return `${billion}억${won}원`;
  } else {
    const won = remaining % 10000;
    if (won === 0) {
      return `${billion}억${million}만원`;
    } else {
      return `${billion}억${million}만${won}원`;
    }
  }
};

/**
 * 한국어 금액 표현을 만원 단위 숫자로 변환
 * @param {string} koreanAmount - 한국어 금액 표현
 * @returns {number} 만원 단위 금액
 */
export const parseKoreanAmount = (koreanAmount) => {
  if (!koreanAmount || koreanAmount === "0원") return 0;

  let result = 0;

  // 억 단위 처리
  if (koreanAmount.includes("억")) {
    // "억원"만 입력된 경우 1억원으로 처리
    if (koreanAmount === "억원") {
      result += 10000;
    } else {
      const parts = koreanAmount.split("억");
      const billion = parseInt(parts[0]);
      result += billion * 10000;

      // 천만원 단위 처리
      if (parts[1] && parts[1].includes("천만원")) {
        const million = parseInt(parts[1].replace("천만원", ""));
        result += million * 1000;
      }
    }
  } else if (koreanAmount.includes("천만원")) {
    // "천만원"만 입력된 경우 1천만원으로 처리
    if (koreanAmount === "천만원") {
      result += 1000;
    } else {
      const million = parseInt(koreanAmount.replace("천만원", ""));
      result += million * 1000;
    }
  } else if (koreanAmount.includes("만원")) {
    // "만원"만 입력된 경우 1만원으로 처리
    if (koreanAmount === "만원") {
      result += 1;
    } else {
      const million = parseInt(koreanAmount.replace("만원", ""));
      result += million;
    }
  }

  return result;
};

/**
 * 입력값이 숫자인지 확인
 * @param {string} value - 입력값
 * @returns {boolean} 숫자인지 여부
 */
export const isNumeric = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};
