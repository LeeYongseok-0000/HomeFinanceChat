import { Suspense, lazy } from "react";

const Loading = <div>Loading....</div>;
const LoanInput = lazy(() => import("../pages/loan/LoanInputPage"));
const LoanResult = lazy(() => import("../pages/loan/LoanResultPage"));

const loanRouter = () => [
  {
    path: "input",
    element: (
      <Suspense fallback={Loading}>
        <LoanInput />
      </Suspense>
    ),
  },
  {
    path: "result",
    element: (
      <Suspense fallback={Loading}>
        <LoanResult />
      </Suspense>
    ),
  },
];

export default loanRouter;
