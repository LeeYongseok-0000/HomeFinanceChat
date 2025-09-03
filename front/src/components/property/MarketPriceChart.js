import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MarketPriceChart = ({ marketPrices }) => {
  if (!marketPrices || !marketPrices.sales || marketPrices.sales.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-medium text-gray-700 mb-4">
          매매 실거래가 차트
        </h4>
        <div className="text-center text-gray-500 py-8">
          <div className="text-2xl mb-2">📊</div>
          매매 실거래가 데이터가 없습니다.
        </div>
      </div>
    );
  }

  // 매매 실거래가 데이터 가공 (계약일 순서대로 정렬)
  const salesData = marketPrices.sales
    .map((sale) => ({
      date: sale.contractDate,
      price: parseInt(sale.transactionAmount),
      area: sale.exclusiveArea,
      type: "매매",
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // 계약일 순서대로 정렬

  // 매매 통계 계산
  const maxPrice = Math.max(...salesData.map((s) => s.price));
  const minPrice = Math.min(...salesData.map((s) => s.price));
  const avgPrice = Math.round(
    salesData.reduce((sum, s) => sum + s.price, 0) / salesData.length
  );

  return (
    <div className="space-y-6">
      {/* 매매 실거래가 차트 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-medium text-gray-700 mb-4">
          매매 실거래가 (계약일 순)
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{
                value: "매매가 (만원)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value, name) => [
                `${value}만원`,
                name === "price" ? "매매가" : "면적",
              ]}
              labelFormatter={(label) => `계약일: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#82ca9d"
              strokeWidth={3}
              dot={{ fill: "#82ca9d", strokeWidth: 2, r: 5 }}
              name="매매가"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* 가격 변동 분석 */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 mb-2">
            📈 가격 변동 분석
          </h5>
          <div className="grid grid-cols-2 gap-4 text-xs">
            {salesData.length > 1 && (
              <>
                <div>
                  <span className="text-gray-600">첫 거래:</span>
                  <span className="ml-2 font-medium text-blue-600">
                    {salesData[0].date} - {salesData[0].price}만원
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">최근 거래:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {salesData[salesData.length - 1].date} -{" "}
                    {salesData[salesData.length - 1].price}만원
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">가격 변동:</span>
                  <span
                    className={`ml-2 font-medium ${
                      salesData[salesData.length - 1].price > salesData[0].price
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {salesData[salesData.length - 1].price > salesData[0].price
                      ? "↗️ 상승"
                      : "↘️ 하락"}
                    (
                    {Math.abs(
                      salesData[salesData.length - 1].price - salesData[0].price
                    )}
                    만원)
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">변동률:</span>
                  <span
                    className={`ml-2 font-medium ${
                      salesData[salesData.length - 1].price > salesData[0].price
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {Math.round(
                      (Math.abs(
                        salesData[salesData.length - 1].price -
                          salesData[0].price
                      ) /
                        salesData[0].price) *
                        100
                    )}
                    %
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 매매 통계 요약 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-medium text-gray-700 mb-4">매매 통계</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>최고가:</span>
            <span className="font-medium text-red-600">{maxPrice}만원</span>
          </div>
          <div className="flex justify-between">
            <span>최저가:</span>
            <span className="font-medium text-blue-600">{minPrice}만원</span>
          </div>
          <div className="flex justify-between">
            <span>평균가:</span>
            <span className="font-medium text-green-600">{avgPrice}만원</span>
          </div>
          <div className="flex justify-between">
            <span>거래 건수:</span>
            <span className="font-medium">{salesData.length}건</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPriceChart;
