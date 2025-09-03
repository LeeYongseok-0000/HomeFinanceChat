import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import BasicMenu from "../components/menus/BasicMenu";
import BasicLayout from "../layouts/BasicLayout";

const Loading = <div>Loading....</div>;
const Login = lazy(() => import("../pages/member/LoginPage"));
const Join = lazy(() => import("../pages/member/JoinPage"));
const CreditInfo = lazy(() => import("../pages/member/CreditInfoPage"));
const MyPage = lazy(() => import("../pages/member/MyPage"));
const KakaoRedirect = lazy(() => import("../pages/member/KakaoRedirectPage"));
const NaverRedirect = lazy(() => import("../pages/member/NaverRedirectPage"));
const GoogleRedirect = lazy(() => import("../pages/member/GoogleRedirectPage"));
// const MemberModify = lazy(() => import("../pages/member/ModifyPage"));

// 레이아웃 컴포넌트 - BasicLayout 사용
const Layout = () => {
  return (
    <BasicLayout>
      <BasicMenu />
      <Outlet />
    </BasicLayout>
  );
};

const memberRouter = () => {
  return [
    {
      path: "",
      element: <Layout />,
      children: [
        {
          path: "login",
          element: (
            <Suspense fallback={Loading}>
              <Login />
            </Suspense>
          ),
        },
        {
          path: "join",
          element: (
            <Suspense fallback={Loading}>
              <Join />
            </Suspense>
          ),
        },
        {
          path: "credit-info",
          element: (
            <Suspense fallback={Loading}>
              <CreditInfo />
            </Suspense>
          ),
        },
        {
          path: "mypage",
          element: (
            <Suspense fallback={Loading}>
              <MyPage />
            </Suspense>
          ),
        },
        {
          path: "kakao",
          element: (
            <Suspense fallback={Loading}>
              <KakaoRedirect />
            </Suspense>
          ),
        },
        {
          path: "naver",
          element: (
            <Suspense fallback={Loading}>
              <NaverRedirect />
            </Suspense>
          ),
        },
        {
          path: "google",
          element: (
            <Suspense fallback={Loading}>
              <GoogleRedirect />
            </Suspense>
          ),
        },
        // {
        //   path: "modify",
        //   element: (
        //     <Suspense fallback={Loading}>
        //       <MemberModify />
        //     </Suspense>
        //   ),
        // },
      ],
    },
  ];
};

export default memberRouter;
