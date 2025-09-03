import React from "react";
import { Link, useLocation } from "react-router-dom";

const AdminNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/admin/real-estate-transactions",
      label: "실거래가 데이터 관리",
      description: "부동산 실거래가 데이터 조회 및 관리",
    },
    {
      path: "/admin/property-approval",
      label: "매물 검수 요청",
      description: "등록 요청 매물 검수 및 승인",
    },
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">관리자 메뉴</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block p-4 rounded-lg border-2 transition-all hover:shadow-md ${
              location.pathname === item.path
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <h3 className="font-medium text-gray-900 mb-2">{item.label}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminNavigation;
