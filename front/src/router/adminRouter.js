import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import AdminNavigation from "../components/common/AdminNavigation";

const Loading = <div>Loading....</div>;
const RealEstateAdmin = lazy(() =>
  import("../pages/admin/RealEstateAdminPage")
);
const PropertyApproval = lazy(() =>
  import("../pages/admin/PropertyApprovalPage")
);
const PropertyReviewRequestDetail = lazy(() =>
  import("../pages/admin/PropertyReviewRequestDetailPage")
);

// 관리자 전용 레이아웃 컴포넌트
const AdminLayout = () => {
  return (
    <>
      <AdminNavigation />
      <Outlet />
    </>
  );
};

const adminRouter = () => {
  return [
    {
      path: "",
      element: <AdminLayout />,
      children: [
        {
          path: "real-estate-transactions",
          element: (
            <Suspense fallback={Loading}>
              <RealEstateAdmin />
            </Suspense>
          ),
        },
        {
          path: "property-approval",
          element: (
            <Suspense fallback={Loading}>
              <PropertyApproval />
            </Suspense>
          ),
        },
        {
          path: "property-review-requests/:id",
          element: (
            <Suspense fallback={Loading}>
              <PropertyReviewRequestDetail />
            </Suspense>
          ),
        },
      ],
    },
  ];
};

export default adminRouter;
