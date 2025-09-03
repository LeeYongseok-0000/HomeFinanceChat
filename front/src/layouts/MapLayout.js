import { Outlet } from "react-router-dom";
import BasicMenu from "../components/menus/BasicMenu";

const MapLayout = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden map-layout">
      <BasicMenu />

      {/* 메인 콘텐츠 영역 - 전체 화면 차지 */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default MapLayout;
