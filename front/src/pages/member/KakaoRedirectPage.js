import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAccessToken, getMemberWithAccessToken } from "../../api/kakaoApi";
import { login } from "../../slices/loginSlice";
import { useDispatch } from "react-redux";
import useCustomLogin from "../../hooks/useCustomLogin";
import useModal from "../../hooks/useModal";
import ResultModal from "../../components/common/ResultModal";

const KakaoRedirectPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { moveToPath } = useCustomLogin();
  const { modalState, showModal, handleModalClose } = useModal();

  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCode, setProcessedCode] = useState(null);

  const authCode = searchParams.get("code");

  useEffect(() => {
    if (!authCode || isProcessing || processedCode === authCode) {
      return;
    }

    // 이미 처리된 코드인지 확인
    if (processedCode === authCode) {
      console.log("⚠️ 이미 처리된 인가 코드입니다.");
      return;
    }

    setIsProcessing(true);
    setProcessedCode(authCode);

    (async () => {
      try {
        console.log("🔄 카카오 로그인 처리 시작");
        console.log("🔍 인가 코드:", authCode);

        // 1) 인가 코드로 카카오 Access Token 발급
        const accessToken = await getAccessToken(authCode);
        console.log("✅ AccessToken 발급 성공:", accessToken);

        // 2) 발급받은 토큰으로 우리 백엔드에 로그인/가입 처리 요청
        const memberInfo = await getMemberWithAccessToken(accessToken);
        console.log("✅ 회원 정보 조회 성공:", memberInfo);

        // 3) Redux state + 쿠키에 저장
        dispatch(login(memberInfo));

        // 4) 로그인 후 리다이렉트할 경로
        console.log("✅ 카카오 로그인 완료, 메인 페이지로 이동");
        moveToPath("/main"); // 메인 페이지로 이동
      } catch (err) {
        console.error("❌ 카카오 리다이렉트 처리 중 오류:", err);

        let errorMessage = "카카오 로그인 처리 중 오류가 발생했습니다.";

        // 구체적인 에러 메시지 처리
        if (
          err.message &&
          err.message.includes("authorization code not found")
        ) {
          errorMessage = "인증 코드가 만료되었습니다. 다시 로그인해주세요.";
        } else if (err.message && err.message.includes("invalid_grant")) {
          errorMessage = "인증이 만료되었습니다. 다시 로그인해주세요.";
        } else if (err.message) {
          errorMessage = err.message;
        }

        showModal("로그인 실패", errorMessage, () => {
          // 로그인 페이지로 이동
          moveToPath("/member/login");
        });
      } finally {
        setIsProcessing(false);
      }
    })();
  }, [authCode, isProcessing, processedCode, dispatch, moveToPath, showModal]);

  // 에러 발생 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!authCode) {
      console.log("⚠️ 인가 코드가 없습니다. 로그인 페이지로 이동");
      navigate("/member/login");
    }
  }, [authCode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700 mb-2">
          카카오 로그인 처리 중입니다...
        </p>
        <p className="text-sm text-gray-500">잠시만 기다려주세요</p>

        {/* 처리 중일 때만 표시 */}
        {isProcessing && (
          <div className="mt-4">
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <p className="text-sm">로그인 정보를 확인하고 있습니다...</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalState.isOpen && (
        <ResultModal
          title={modalState.title}
          content={modalState.content}
          callbackFn={handleModalClose}
        />
      )}
    </div>
  );
};

export default KakaoRedirectPage;
