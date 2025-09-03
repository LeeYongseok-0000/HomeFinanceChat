import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatAmountToKorean } from "../../util/currencyUtil";

const TransactionHistoryChart = ({ marketPrices, roadNameAddress }) => {
  console.log("TransactionHistoryChart 컴포넌트 렌더링됨");
  console.log("props marketPrices:", marketPrices);
  console.log("props roadNameAddress:", roadNameAddress);
  
     const [selectedType, setSelectedType] = useState("매매"); // 매매 또는 전세
   const [chartData, setChartData] = useState([]);

  useEffect(() => {
    console.log("=== TransactionHistoryChart useEffect 실행 ===");
    console.log("marketPrices:", marketPrices);
    console.log("roadNameAddress:", roadNameAddress);
    console.log("marketPrices 타입:", typeof marketPrices);
    console.log("roadNameAddress 타입:", typeof roadNameAddress);
    
    if (!marketPrices) {
      console.log("❌ marketPrices가 없음");
      setChartData([]);
      return;
    }
    
    if (!roadNameAddress) {
      console.log("❌ roadNameAddress가 없음");
      setChartData([]);
      return;
    }
    
    console.log("✅ 모든 조건 충족, 데이터 처리 시작");

    // 선택된 거래 유형에 따른 데이터 필터링
    let filteredData = [];
    
         if (selectedType === "매매") {
       filteredData = marketPrices.sales || [];
       console.log("매매 데이터:", filteredData);
       // 첫 번째 아이템의 구조 확인
       if (filteredData.length > 0) {
         console.log("매매 데이터 첫 번째 아이템 구조:", Object.keys(filteredData[0]));
         console.log("매매 데이터 첫 번째 아이템:", filteredData[0]);
       }
     } else if (selectedType === "전세") {
       filteredData = (marketPrices.rents || []).filter(rent => {
         // 전세 데이터만 필터링 (월세가 0이거나 없는 경우)
         return !rent.monthlyRent || 
                rent.monthlyRent === "0" || 
                rent.monthlyRent === "0만원" || 
                rent.monthlyRent === 0 || 
                rent.monthlyRent === "";
       });
       console.log("전세 데이터:", filteredData);
       // 첫 번째 아이템의 구조 확인
       if (filteredData.length > 0) {
         console.log("전세 데이터 첫 번째 아이템 구조:", Object.keys(filteredData[0]));
         console.log("전세 데이터 첫 번째 아이템:", filteredData[0]);
       }
     }

     // 도로명 주소 필터링 로직 수정
     console.log("도로명 주소 필터링 전 데이터 개수:", filteredData.length);
     console.log("찾고 있는 도로명 주소:", roadNameAddress);
     console.log("marketPrices.propertyAddress:", marketPrices.propertyAddress);
     
     // 주소 비교 로직 수정 - 더 유연하게 처리
     let addressMatch = false;
     
     // 1. 정확한 일치 확인
     if (marketPrices.propertyAddress === roadNameAddress) {
       addressMatch = true;
       console.log("✅ 정확한 도로명 주소 일치!");
     }
     // 2. 부분 일치 확인 (도로명만 비교)
     else if (marketPrices.propertyAddress && roadNameAddress) {
       const marketRoad = marketPrices.propertyAddress.split(' ')[0]; // 첫 번째 부분만 추출
       const searchRoad = roadNameAddress.split(' ')[0];
       
       if (marketRoad === searchRoad) {
         addressMatch = true;
         console.log("✅ 도로명 부분 일치:", marketRoad, "===", searchRoad);
       }
     }
     
     if (!addressMatch) {
       console.log("❌ 도로명 주소 불일치, 하지만 테스트를 위해 데이터 유지");
       console.log("marketPrices.propertyAddress:", marketPrices.propertyAddress);
       console.log("roadNameAddress:", roadNameAddress);
       // 테스트를 위해 데이터를 유지 (나중에 제거 가능)
     }
     
     console.log("도로명 주소 필터링 후 데이터 개수:", filteredData.length);

         // 데이터가 없으면 빈 배열 반환
     if (filteredData.length === 0) {
       console.log("❌ 필터링된 데이터가 없음");
       setChartData([]);
       return;
     }

    // 계약일 기준으로 정렬
    filteredData.sort((a, b) => new Date(a.contractDate) - new Date(b.contractDate));

         // 최근 1년 데이터만 필터링 (2024.08 ~ 2025.08)
     const cutoffDate = new Date(2024, 7, 1); // 2024년 8월 1일
     
     console.log("날짜 필터링 전 데이터 개수:", filteredData.length);
     console.log("날짜 필터링 기준:", cutoffDate.toISOString());
     
     filteredData = filteredData.filter(item => {
       const itemDate = new Date(item.contractDate);
       const isValid = itemDate >= cutoffDate;
       console.log(`아이템 날짜: ${item.contractDate} -> ${itemDate.toISOString()} -> ${isValid ? '유효' : '제외'}`);
       return isValid;
     });
     
     console.log("날짜 필터링 후 데이터 개수:", filteredData.length);

         // 월별 데이터 그룹화 (2024.09 ~ 2025.08, 총 12개월)
     const monthlyData = {};
     
     // 12개월 키 생성 (2024.09 ~ 2025.08)
     const months = [];
     for (let year = 2024; year <= 2025; year++) {
       for (let month = 1; month <= 12; month++) {
         if ((year === 2024 && month >= 9) || (year === 2025 && month <= 8)) {
           const monthKey = `${year}.${String(month).padStart(2, '0')}`;
           months.push({
             key: monthKey,
             year: year,
             month: month,
             label: `${year}년 ${month}월`
           });
         }
       }
     }
     
     // 각 월별로 초기화
     months.forEach(month => {
       monthlyData[month.key] = {
         month: month.key,
         year: month.year,
         monthNum: month.month,
         label: month.label,
         prices: [],
         count: 0
       };
     });
     
     filteredData.forEach(item => {
       const date = new Date(item.contractDate);
       const year = date.getFullYear();
       const month = date.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
       
       console.log(`아이템 처리: ${item.contractDate} -> ${year}년 ${month}월`);
       
       // 월별 키 생성
       const monthKey = `${year}.${String(month).padStart(2, '0')}`;
       
       console.log(`월별 키: ${monthKey}`);
       
               if (monthlyData[monthKey]) {
          // 가격 데이터 추가 (억 단위로 변환)
          let price;
          if (selectedType === "매매") {
            price = convertPriceToBillion(parseInt(item.transactionAmount));
            console.log(`매매 가격 추가: ${item.transactionAmount} -> ${price}억 (${monthKey})`);
          } else {
            price = convertPriceToBillion(parseInt(item.deposit));
            console.log(`전세 가격 추가: ${item.deposit} -> ${price}억 (${monthKey})`);
          }
          
          monthlyData[monthKey].prices.push(price);
          monthlyData[monthKey].count++;
          
          console.log(`${monthKey} 월 업데이트: 가격 ${price}억, 개수 ${monthlyData[monthKey].count}`);
        } else {
          console.log(`❌ ${monthKey} 월을 찾을 수 없음`);
        }
     });

         // 차트 데이터 형식으로 변환
     console.log("월별 데이터 요약:");
     Object.keys(monthlyData).forEach(key => {
       const data = monthlyData[key];
       console.log(`${key}: 가격 ${data.prices.length}개, 거래 ${data.count}건, 가격들: [${data.prices.join(', ')}]`);
     });
     
     const chartDataArray = months.map(month => {
       const data = monthlyData[month.key];
       if (data.prices.length === 0) {
         console.log(`${month.key} 월: 데이터 없음`);
         return {
           month: month.key,
           label: month.label,
           year: month.year,
           monthNum: month.month,
           averagePrice: 0,
           transactionCount: 0,
           maxPrice: 0,
           minPrice: 0
         };
       }
       
       const averagePrice = Math.round(data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length);
       const maxPrice = Math.max(...data.prices);
       const minPrice = Math.min(...data.prices);
       
       console.log(`${month.key} 월: 평균 ${averagePrice}, 최대 ${maxPrice}, 최소 ${minPrice}, 거래 ${data.count}건`);
       
       return {
         month: month.key,
         label: month.label,
         year: month.year,
         monthNum: month.month,
         averagePrice: averagePrice,
         transactionCount: data.count,
         maxPrice: maxPrice,
         minPrice: minPrice
       };
     });
     
     console.log("최종 차트 데이터:", chartDataArray);

         console.log("최종 차트 데이터:", chartDataArray);
     console.log("차트 데이터 길이:", chartDataArray.length);
     
     // 차트 데이터가 비어있어도 기본 12개월 구조는 보여주기
     if (chartDataArray.length === 0) {
       console.log("차트 데이터가 비어있음 - 기본 12개월 구조 생성");
       const defaultData = months.map(month => ({
         month: month.key,
         label: month.label,
         year: month.year,
         monthNum: month.month,
         averagePrice: 0,
         transactionCount: 0,
         maxPrice: 0,
         minPrice: 0
       }));
       setChartData(defaultData);
     } else {
       setChartData(chartDataArray);
     }
   }, [marketPrices, roadNameAddress, selectedType]);

     // 가격을 억 단위로 변환 (소수점 첫째자리까지)
   const formatPriceToBillion = (priceInBillion) => {
     if (!priceInBillion) return 0;
     return Math.round(priceInBillion * 10) / 10; // 소수점 첫째자리까지 반올림
   };

     // Y축 눈금 생성 (억 단위) - 0억부터 15억까지 고정
   const generateYTicks = () => {
     // 0억부터 15억까지 3억씩 간격으로 표시
     return [0, 3, 6, 9, 12, 15];
   };

   // 가격 데이터를 억 단위로 변환하는 함수
   const convertPriceToBillion = (priceInMillion) => {
     if (!priceInMillion || priceInMillion === 0) return 0;
     return priceInMillion / 10000; // 1억 = 10000만원
   };

     // 커스텀 툴팁
   const CustomTooltip = ({ active, payload, label }) => {
     if (active && payload && payload.length) {
       const data = payload[0].payload;
       const monthNames = [
         '1월', '2월', '3월', '4월', '5월', '6월',
         '7월', '8월', '9월', '10월', '11월', '12월'
       ];
       const monthName = monthNames[data.monthNum - 1];
       const monthLabel = `${data.year}년 ${monthName}`;
       const quarterInfo = getQuarterInfo(data.year, data.monthNum);
       
       return (
         <div className="bg-black text-white p-3 rounded-lg shadow-lg border-0">
           <p className="font-medium mb-2">{monthLabel}</p>
           <p className="text-xs text-gray-300 mb-2">{quarterInfo}</p>
           <p className="text-yellow-300">
             평균 {formatPriceToBillion(data.averagePrice)}억
           </p>
           <p className="text-blue-300">
             거래 {data.transactionCount}건
           </p>
           <p className="text-xs text-gray-300">
             최고: {formatPriceToBillion(data.maxPrice)}억
           </p>
           <p className="text-xs text-gray-300">
             최저: {formatPriceToBillion(data.minPrice)}억
           </p>
         </div>
       );
     }
     return null;
   };

     // 분기 정보 생성 함수
   const getQuarterInfo = (year, month) => {
     if (month >= 9 && month <= 11) return `${year}년 3분기 (9-11월)`;
     else if (month >= 12 || month <= 2) {
       if (month === 12) return `${year}년 4분기 (12월)`;
       else return `${year}년 1분기 (1-2월)`;
     }
     else if (month >= 3 && month <= 5) return `${year}년 2분기 (3-5월)`;
     else if (month >= 6 && month <= 8) return `${year}년 3분기 (6-8월)`;
     
     return `${year}년 ${month}월`;
   };

     // 데이터가 없는 경우
   if (!marketPrices) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-700">
            {selectedType} 실거래가
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType("매매")}
              className={`px-3 py-1 text-sm rounded ${
                selectedType === "매매"
                  ? "bg-blue-600 text-white font-medium"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              매매
            </button>
            <button
              onClick={() => setSelectedType("전세")}
              className={`px-3 py-1 text-sm rounded ${
                selectedType === "전세"
                  ? "bg-blue-600 text-white font-medium"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              전세
            </button>
          </div>
        </div>
        <div className="text-center text-gray-500 py-8">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-sm mb-1">
            {selectedType} 실거래가 데이터가 없습니다
          </p>
          <p className="text-xs text-gray-400">
            해당 지역의 {selectedType} 실거래가 데이터가 아직 등록되지 않았습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* 헤더 및 탭 */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium text-gray-700">
          {selectedType} 실거래가
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedType("매매")}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              selectedType === "매매"
                ? "bg-blue-600 text-white font-medium"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            매매
          </button>
          <button
            onClick={() => setSelectedType("전세")}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              selectedType === "전세"
                ? "bg-blue-600 text-white font-medium"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            전세
          </button>
        </div>
      </div>

      

      {/* 차트 */}
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
                     {/* X축 - 월별 */}
           <XAxis
             dataKey="month"
             tick={{ fontSize: 12, fill: '#6b7280' }}
             tickLine={false}
             axisLine={{ stroke: '#d1d5db' }}
             tickFormatter={(value) => {
               const [year, month] = value.split('.');
               const monthNum = parseInt(month);
               const monthNames = [
                 '1월', '2월', '3월', '4월', '5월', '6월',
                 '7월', '8월', '9월', '10월', '11월', '12월'
               ];
               return monthNames[monthNum - 1];
             }}
           />
          
                     {/* Y축 - 가격 (억 단위) */}
           <YAxis
             yAxisId="left"
             tick={{ fontSize: 12, fill: '#6b7280' }}
             tickLine={false}
             axisLine={{ stroke: '#d1d5db' }}
             ticks={[0, 3, 6, 9, 12, 15]}
             tickFormatter={(value) => `${value}억`}
             domain={[0, 15]}
             allowDataOverflow={false}
             label={{ 
               value: `${selectedType} 가격`, 
               angle: -90, 
               position: 'insideLeft',
               style: { textAnchor: 'middle', fill: '#6b7280' }
             }}
           />
          
                     {/* Y축 - 거래량 (숨김 처리하되 범위 제한은 유지) */}
           <YAxis
             yAxisId="right"
             orientation="right"
             tick={false}
             tickLine={false}
             axisLine={false}
             label={false}
             domain={[0, 10]}
           />
          
          {/* 툴팁 */}
          <Tooltip content={<CustomTooltip />} />
          
          {/* 범례 */}
          <Legend />
          
                     {/* 가격 선 그래프 */}
           <Line
             yAxisId="left"
             type="monotone"
             dataKey="averagePrice"
             stroke="#fbbf24"
             strokeWidth={3}
             dot={{ fill: "#fbbf24", strokeWidth: 2, r: 5 }}
             name="가격"
             connectNulls={false}
             strokeDasharray=""
             strokeLinecap="round"
             strokeLinejoin="round"
             isAnimationActive={true}
             animationDuration={1000}
             animationBegin={0}
             animationEasing="ease-out"
           />
          
          {/* 거래량 막대 그래프 */}
          <Bar
            yAxisId="right"
            dataKey="transactionCount"
            fill="#60a5fa"
            opacity={0.7}
            name="거래량"
            radius={[2, 2, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* 요약 정보 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                 <h5 className="text-sm font-medium text-gray-700 mb-2">
           📊 {selectedType} 거래 요약
         </h5>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-600">총 거래:</span>
            <span className="ml-2 font-medium text-blue-600">
              {chartData.reduce((sum, item) => sum + item.transactionCount, 0)}건
            </span>
          </div>
                     <div>
             <span className="text-gray-600">평균가:</span>
             <span className="ml-2 font-medium text-green-600">
               {formatPriceToBillion(
                 Math.round(
                   chartData.filter(item => item.averagePrice > 0).reduce((sum, item) => sum + item.averagePrice, 0) / 
                   Math.max(chartData.filter(item => item.averagePrice > 0).length, 1)
                 )
               )}억
             </span>
           </div>
           <div>
             <span className="text-gray-600">최고가:</span>
             <span className="ml-2 font-medium text-red-600">
               {(() => {
                 const validPrices = chartData.filter(item => item.averagePrice > 0).map(item => item.averagePrice);
                 return validPrices.length > 0 ? formatPriceToBillion(Math.max(...validPrices)) : 0;
               })()}억
             </span>
           </div>
           <div>
             <span className="text-gray-600">최저가:</span>
             <span className="ml-2 font-medium text-blue-600">
               {(() => {
                 const validPrices = chartData.filter(item => item.averagePrice > 0).map(item => item.averagePrice);
                 return validPrices.length > 0 ? formatPriceToBillion(Math.min(...validPrices)) : 0;
               })()}억
             </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryChart;
