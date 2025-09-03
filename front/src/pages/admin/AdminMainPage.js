import React from "react";
import AdminNavigation from "../../components/common/AdminNavigation";

const AdminMainPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          관리자 대시보드
        </h1>
        <AdminNavigation />

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            시스템 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">실거래가 데이터</h3>
              <p className="text-2xl font-bold text-blue-600">관리 가능</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900">데이터베이스</h3>
              <p className="text-2xl font-bold text-green-600">연결됨</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900">API 서버</h3>
              <p className="text-2xl font-bold text-purple-600">정상</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMainPage;
