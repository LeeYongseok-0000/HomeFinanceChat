import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import BasicMenu from "../components/menus/BasicMenu";

const Loading = <div>Loading....</div>;
const List = lazy(() => import("../pages/property/ListPage"));
const Read = lazy(() => import("../pages/property/ReadPage"));
const Add = lazy(() => import("../pages/property/AddPage"));
const Reply = lazy(() => import("../pages/property/ReplyPage"));
const Modify = lazy(() => import("../pages/property/ModifyPage"));

// 레이아웃 컴포넌트
const Layout = () => {
  return (
    <>
      <BasicMenu />
      <Outlet />
    </>
  );
};

const propertyRouter = () => {
  return [
    {
      path: "",
      element: <Layout />,
      children: [
        {
          path: "list",
          element: (
            <Suspense fallback={Loading}>
              <List />
            </Suspense>
          ),
        },
        {
          path: "add",
          element: (
            <Suspense fallback={Loading}>
              <Add />
            </Suspense>
          ),
        },
        {
          path: "read/:propertyId",
          element: (
            <Suspense fallback={Loading}>
              <Read />
            </Suspense>
          ),
        },
        {
          path: "modify/:propertyId",
          element: (
            <Suspense fallback={Loading}>
              <Modify />
            </Suspense>
          ),
        },
        {
          path: "reply/:propertyId",
          element: (
            <Suspense fallback={Loading}>
              <Reply />
            </Suspense>
          ),
        },
        // 기본 경로를 list로 리다이렉트
        {
          path: "",
          element: (
            <Suspense fallback={Loading}>
              <List />
            </Suspense>
          ),
        },
      ],
    },
  ];
};

export default propertyRouter;
