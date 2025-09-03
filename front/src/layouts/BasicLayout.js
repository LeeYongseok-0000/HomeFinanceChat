import { Outlet } from "react-router-dom";
import BasicMenu from "../components/menus/BasicMenu";

const BasicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {children ? (
        // children이 있으면 children을 렌더링 (memberRouter에서 사용)
        children
      ) : (
        // children이 없으면 기본 구조 렌더링 (root router에서 사용)
        <>
          <BasicMenu />
          <div className="flex-1">
            <Outlet />
          </div>
        </>
      )}

      {/* Footer */}
      <footer
        className="text-gray-900 w-full"
        style={{ backgroundColor: "white" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 메인 푸터 콘텐츠 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* 회사 정보 */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <span className="text-xl font-bold text-gray-900">
                  부동산 신용 추천
                </span>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                최신 기술과 데이터 분석을 통해 안전하고 신뢰할 수 있는 부동산
                신용 추천을 제공합니다. 전문적인 분석으로 여러분의 투자 성공을
                도와드립니다.
              </p>
              <div className="flex space-x-4">
                {/* 페이스북 */}
                <a
                  href="#"
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                  title="Facebook"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* X (구 트위터) */}
                <a
                  href="#"
                  className="text-gray-500 hover:text-black transition-colors"
                  title="X (Twitter)"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* 인스타그램 */}
                <a
                  href="#"
                  className="text-gray-500 hover:text-pink-600 transition-colors"
                  title="Instagram"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>

                {/* 유튜브 */}
                <a
                  href="#"
                  className="text-gray-500 hover:text-red-600 transition-colors"
                  title="YouTube"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>


              </div>
            </div>

            {/* 서비스 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                서비스
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    부동산 분석
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    신용 평가
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    맞춤 추천
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    투자 상담
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    시장 동향
                  </a>
                </li>
              </ul>
            </div>

            {/* 고객 지원 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                고객 지원
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    고객센터
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    자주 묻는 질문
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    1:1 문의
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    이용약관
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    개인정보처리방침
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="border-t border-gray-400 pt-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-gray-900">고객센터</h4>
                <p className="text-gray-600">1588-1234</p>
                <p className="text-gray-500 text-sm">평일 09:00 - 18:00</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900">이메일</h4>
                <p className="text-gray-600">support@realestate-credit.com</p>
                <p className="text-gray-500 text-sm">24시간 접수 가능</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900">주소</h4>
                <p className="text-gray-600">서울특별시 강남구 테헤란로 123</p>
                <p className="text-gray-500 text-sm">부동산빌딩 15층</p>
              </div>
            </div>
          </div>

          {/* 하단 정보 */}
          <div className="border-t border-gray-400 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-500 text-sm mb-4 md:mb-0">
                <p>&copy; 2024 부동산 신용 추천 플랫폼. All rights reserved.</p>
                <p className="mt-1">
                  사업자등록번호: 123-45-67890 | 대표: 홍길동
                </p>
              </div>
              <div className="flex space-x-6 text-sm">
                <a
                  href="#"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  이용약관
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  개인정보처리방침
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  쿠키 정책
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BasicLayout;
