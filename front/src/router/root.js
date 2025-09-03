import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import memberRouter from "./memberRouter";
import loanRouter from "./loanRouter";
import BasicLayout from "../layouts/BasicLayout";
import LandingLayout from "../layouts/LandingLayout";
import MapLayout from "../layouts/MapLayout";
import ChatBotLayout from "../layouts/ChatBotLayout";
import boardRouter from "./boardRouter";
import propertyRouter from "./propertyRouter";
import adminRouter from "./adminRouter";

const Loading = <div>Loading....</div>;
const Main = lazy(() => import("../pages/MainPage"));
const Landing = lazy(() => import("../pages/LandingPage"));
const Map = lazy(() => import("../pages/MapPage"));
const News = lazy(() => import("../pages/NewsPage"));
const RealEstate = lazy(() => import("../pages/RealEstatePage"));
const ChatBot = lazy(() => import("../pages/ChatBotPage"));
const CommunityMain = lazy(() => import("../components/CommunityMainPage"));
const AdminMain = lazy(() => import("../pages/admin/AdminMainPage"));

const root = createBrowserRouter([
  {
    path: "/",
    element: <LandingLayout />, // 랜딩페이지 전용 레이아웃
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={Loading}>
            <Landing />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/main",
    element: <BasicLayout />, // 메인페이지부터 BasicLayout 사용
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={Loading}>
            <Main />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "loan",
    element: <BasicLayout />, // loan 페이지도 BasicLayout 사용
    children: loanRouter(),
  },
  {
    path: "/map",
    element: <MapLayout />, // 맵 페이지 전용 레이아웃
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={Loading}>
            <Map />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/real-estate",
    element: <BasicLayout />, // 실거래가 페이지는 BasicLayout 사용
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={Loading}>
            <RealEstate />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/news",
    element: <BasicLayout />, // 뉴스 페이지는 BasicLayout 사용
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={Loading}>
            <News />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/community",
    element: <BasicLayout />, // 커뮤니티 페이지는 BasicLayout 사용
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={Loading}>
            <CommunityMain />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: <BasicLayout />, // 관리자 페이지는 BasicLayout 사용
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={Loading}>
            <AdminMain />
          </Suspense>
        ),
      },
      ...adminRouter(),
    ],
  },
  {
    path: "/member",
    children: memberRouter(),
  },
  {
    path: "/board",
    children: boardRouter(),
  },
  {
    path: "/property",
    children: propertyRouter(),
  },
  {
    path: "/chatbot",
    element: <ChatBotLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={Loading}>
            <ChatBot />
          </Suspense>
        ),
      },
    ],
  },
]);

export default root;
