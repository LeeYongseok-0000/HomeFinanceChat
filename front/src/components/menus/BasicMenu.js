import { Link } from "react-router-dom";
import useLogin from "../../hooks/useCustomLogin";
import useCustomUserRoles from "../../hooks/useCustomUserRoles";
import "./BasicMenu.css";

const BasicMenu = () => {
  const { isLogin, doLogout } = useLogin();
  const { isAdmin } = useCustomUserRoles();

  return (
    <header className="bg-white border-b mt-1">
      {/* Top bar */}
      <div className="w-full flex items-center py-3 px-4 border-b border-gray-200">
        {/* 로고 - 헤더 정중앙에 위치 */}
        <div className="absolute left-1/2 transform -translate-x-1/2 my-8">
          <Link to="/main">
            <img src="/logo4.png" alt="로고" className="h-20 w-auto" />
          </Link>
        </div>

        {/* 오른쪽 버튼들 - 오른쪽에 붙임 */}
        <div className="flex items-center text-lg lg:text-xl font-bold flex-shrink-0 ml-auto mt-4">
          {/* 지도 버튼 */}
          <Link to="/map" className="menu-item text-black px-8 py-2">
            지도
          </Link>

          {/* 실거래가 버튼 */}
          <Link to="/real-estate" className="menu-item text-black px-8 py-2">
            실거래가
          </Link>

          {/* 관리자 메뉴 버튼 - 관리자 권한이 있는 경우에만 표시 */}
          {isAdmin && (
            <Link
              to="/admin"
              className="menu-item text-black px-8 py-2 whitespace-nowrap"
            >
              관리자
            </Link>
          )}

          {/* 뉴스 버튼 */}
          <Link to="/news" className="menu-item text-black px-8 py-2">
            뉴스
          </Link>

          {/* 로그인 / 마이페이지 */}
          {isLogin ? (
            <>
              <Link
                to="/member/mypage"
                className="menu-item text-black px-8 py-2"
              >
                마이페이지
              </Link>
            </>
          ) : (
            <Link to="/member/login" className="menu-item text-black px-8 py-2">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default BasicMenu;
