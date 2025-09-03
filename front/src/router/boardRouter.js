import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import BasicMenu from "../components/menus/BasicMenu";

const Loading = <div>Loading....</div>;

// 새로운 카테고리별 페이지들
const VillageStoryList = lazy(() => import("../pages/board/villageStory/ListPage"));
const VillageStoryAdd = lazy(() => import("../pages/board/villageStory/AddPage"));
const VillageStoryRead = lazy(() => import("../pages/board/villageStory/ReadPage"));
const VillageStoryModify = lazy(() => import("../pages/board/villageStory/ModifyPage"));

const RealEstateQnaList = lazy(() => import("../pages/board/realEstateQna/ListPage"));
const RealEstateQnaAdd = lazy(() => import("../pages/board/realEstateQna/AddPage"));
const RealEstateQnaRead = lazy(() => import("../pages/board/realEstateQna/ReadPage"));
const RealEstateQnaModify = lazy(() => import("../pages/board/realEstateQna/ModifyPage"));

const VillageQnaList = lazy(() => import("../pages/board/villageQna/ListPage"));
const VillageQnaAdd = lazy(() => import("../pages/board/villageQna/AddPage"));
const VillageQnaRead = lazy(() => import("../pages/board/villageQna/ReadPage"));
const VillageQnaModify = lazy(() => import("../pages/board/villageQna/ModifyPage"));

// 레이아웃 컴포넌트
const Layout = () => {
  return (
    <>
      <BasicMenu />
      <Outlet />
    </>
  );
};

const boardRouter = () => {
  return [
    {
      path: "",
      element: <Layout />,
      children: [
        // 새로운 카테고리별 라우트들
        {
          path: "village-story",
          element: (
            <Suspense fallback={Loading}>
              <VillageStoryList />
            </Suspense>
          ),
        },
        {
          path: "village-story/add",
          element: (
            <Suspense fallback={Loading}>
              <VillageStoryAdd />
            </Suspense>
          ),
        },
        {
          path: "village-story/read/:id",
          element: (
            <Suspense fallback={Loading}>
              <VillageStoryRead />
            </Suspense>
          ),
        },
        {
          path: "village-story/modify/:id",
          element: (
            <Suspense fallback={Loading}>
              <VillageStoryModify />
            </Suspense>
          ),
        },

        {
          path: "real-estate-qna",
          element: (
            <Suspense fallback={Loading}>
              <RealEstateQnaList />
            </Suspense>
          ),
        },
        {
          path: "real-estate-qna/add",
          element: (
            <Suspense fallback={Loading}>
              <RealEstateQnaAdd />
            </Suspense>
          ),
        },
        {
          path: "real-estate-qna/read/:id",
          element: (
            <Suspense fallback={Loading}>
              <RealEstateQnaRead />
            </Suspense>
          ),
        },
        {
          path: "real-estate-qna/modify/:id",
          element: (
            <Suspense fallback={Loading}>
              <RealEstateQnaModify />
            </Suspense>
          ),
        },

        {
          path: "village-qna",
          element: (
            <Suspense fallback={Loading}>
              <VillageQnaList />
            </Suspense>
          ),
        },
        {
          path: "village-qna/add",
          element: (
            <Suspense fallback={Loading}>
              <VillageQnaAdd />
            </Suspense>
          ),
        },
        {
          path: "village-qna/read/:id",
          element: (
            <Suspense fallback={Loading}>
              <VillageQnaRead />
            </Suspense>
          ),
        },
        {
          path: "village-qna/modify/:id",
          element: (
            <Suspense fallback={Loading}>
              <VillageQnaModify />
            </Suspense>
          ),
        },

        // 기본 경로를 village-story로 리다이렉트 (새로운 구조)
        {
          path: "",
          element: (
            <Suspense fallback={Loading}>
              <VillageStoryList />
            </Suspense>
          ),
        },
      ],
    },
  ];
};

export default boardRouter;
