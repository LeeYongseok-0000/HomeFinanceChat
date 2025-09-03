import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import useLogin from "../hooks/useCustomLogin";
import { getCurrentUser } from "../util/jwtUtil";
import { getCreditInfo } from "../api/memberApi";

function LandingComponent() {
  const { isLogin, doLogout } = useLogin();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisText, setAnalysisText] = useState("AI 분석 중...");
  const [creditInfo, setCreditInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 신용등급과 소득등급 계산 함수 (마이페이지와 동일한 기준)
  const getCreditGrade = (creditScore) => {
    if (!creditScore) return { grade: "N/A", color: "gray", fillLevel: 0 };

    if (creditScore >= 800)
      return { grade: "A+", color: "green", fillLevel: 95 };
    if (creditScore >= 700)
      return { grade: "A", color: "green", fillLevel: 85 };
    if (creditScore >= 600)
      return { grade: "B+", color: "lightgreen", fillLevel: 75 };
    if (creditScore >= 500)
      return { grade: "B", color: "lightgreen", fillLevel: 65 };
    if (creditScore >= 400)
      return { grade: "C+", color: "yellow", fillLevel: 55 };
    if (creditScore >= 300)
      return { grade: "C", color: "yellow", fillLevel: 45 };
    return { grade: "D", color: "orange", fillLevel: 35 }; // 300점 미만은 모두 D 등급
  };

  const getIncomeGrade = (income) => {
    if (!income) return { grade: "N/A", color: "gray", fillLevel: 0 };

    // 마이페이지와 동일한 기준: 만원 단위 (3600 = 3600만원)
    if (income >= 10000)
      return { grade: "고소득", color: "green", fillLevel: 90 };
    if (income >= 5000)
      return { grade: "중상위소득", color: "lightgreen", fillLevel: 75 };
    if (income >= 3000)
      return { grade: "중소득", color: "yellow", fillLevel: 60 };
    if (income >= 1000)
      return { grade: "중하위소득", color: "orange", fillLevel: 45 };
    return { grade: "저소득", color: "red", fillLevel: 30 };
  };

  // 사용자 신용정보 가져오기
  useEffect(() => {
    const fetchCreditInfo = async () => {
      if (!isLogin) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.email) {
          const creditData = await getCreditInfo(currentUser.email);
          setCreditInfo(creditData?.creditInfo || null);
        }
      } catch (error) {
        console.error("❌ 신용정보 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditInfo();
  }, [isLogin]);

  return (
    <>
      <div
        className="h-[700px] flex flex-col relative overflow-hidden"
        style={{
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* 배경 이미지 */}
        <div className="absolute top-0 left-0 right-0 w-full h-full">
          <img
            src="/example.jpg"
            alt="AI 부동산 플랫폼 배경"
            className="absolute top-0 left-0 w-full h-full object-cover"
            style={{ zIndex: 0, objectPosition: "center top" }}
          />
        </div>

        {/* 메인 콘텐츠 */}
        <div className="relative z-20 w-full h-full px-8 py-16 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col h-full">
              {/* 상단: AI 분석 매물 추천 텍스트 */}
              <motion.div
                className="flex-1 flex items-center justify-center mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <div className="text-center">
                  {/* 메인 제목 */}
                  <motion.h1
                    className="text-6xl font-bold mb-4 leading-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    <span className="text-gray-900 drop-shadow-lg">
                      AI 분석 매물 추천
                    </span>
                  </motion.h1>

                  <motion.h2
                    className="text-3xl font-medium mb-6 text-gray-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    정확하고{" "}
                    <span className="text-gray-900 font-semibold">
                      유용한 정보
                    </span>
                  </motion.h2>

                  {/* 설명 텍스트 */}
                  <motion.p
                    className="text-lg leading-relaxed mb-6 text-gray-700 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                  >
                    AI와 빅데이터가 만드는 스마트한 부동산,
                    <br />
                    믿을 수 있는 매물 추천 플랫폼
                  </motion.p>

                  {/* 메인 버튼 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                  >
                    <Link
                      to="/main"
                      className="inline-flex items-center px-8 py-4 bg-gray-300 text-white text-lg font-semibold rounded-xl hover:bg-gray-400 shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      시작하기 →
                    </Link>
                  </motion.div>
                </div>
              </motion.div>

              {/* 오른쪽 상단: 챗봇 영역 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="absolute top-[150px] right-32 w-[340px] h-[480px] bg-white/80 rounded-xl p-4 border border-gray-200 shadow-xl"
              >
                <h3 className="text-black text-lg font-semibold mb-3">
                  AI 챗봇
                </h3>
                <p className="text-gray-700 text-sm mb-4">
                  실시간으로 부동산 관련 질문에 답변해드립니다
                </p>
                <div className="space-y-2 mb-4">
                  {/* 챗봇 헤더 */}
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <span className="text-black text-xs font-medium">
                      부동산 AI 어시스턴트
                    </span>
                  </div>

                  {/* 대화 내용 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-2xl rounded-br-md max-w-[180px] shadow-sm">
                        부동산 시장 동향 알려줘
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-2xl rounded-bl-md max-w-[180px] shadow-sm">
                        현재 시장은 안정적인 추세를 보이고 있어요
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-2xl rounded-br-md max-w-[180px] shadow-sm">
                        투자 추천 지역은?
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-2xl rounded-bl-md max-w-[180px] shadow-sm">
                        강남구와 송파구가 투자 가치가 높습니다
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-2xl rounded-br-md max-w-[180px] shadow-sm">
                        최근 정책 변화는?
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-2xl rounded-bl-md max-w-[180px] shadow-sm">
                        규제 완화와 금리 인하로 시장이 활성화되고 있어요
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-2xl rounded-br-md max-w-[180px] shadow-sm">
                        투자 수익률은?
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-2xl rounded-bl-md max-w-[180px] shadow-sm">
                        연 5-8% 예상됩니다
                      </div>
                    </div>
                  </div>
                </div>

                {/* 챗봇과 대화하기 버튼 */}
                <div className="mt-4">
                  <Link to="/chatbot">
                    <button className="w-full bg-gray-300 text-white text-xs px-3 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-all shadow-md">
                      챗봇과 대화하기
                    </button>
                  </Link>
                </div>
              </motion.div>

              {/* 중앙 하단: 그래프 영역 */}
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="absolute bottom-[68px] left-[800px] w-[550px] bg-white/80 rounded-xl p-4 border border-gray-200 shadow-xl"
              >
                <motion.h3
                  className="text-black text-lg font-semibold mb-3 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.8 }}
                >
                  AI가 분석한 내 자산, 최적의 매물만 제안합니다
                </motion.h3>
                <motion.div
                  className="h-28 bg-white rounded-lg border border-gray-200 relative p-3 mx-auto"
                  style={{ width: "500px" }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 2.0 }}
                >
                  {/* Tailwind CSS로 만든 그래프 */}
                  <div className="w-full h-full relative">
                    {/* 가로 눈금자 3줄 */}
                    <motion.div
                      className="absolute top-1/4 left-0 right-0 h-px bg-gray-300/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 2.0 }}
                    />
                    <motion.div
                      className="absolute top-1/2 left-0 right-0 h-px bg-gray-300/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 2.1 }}
                    />
                    <motion.div
                      className="absolute top-3/4 left-0 right-0 h-px bg-gray-300/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 2.2 }}
                    />

                    {/* 세로 눈금자 4줄 */}
                    <motion.div
                      className="absolute top-0 bottom-0 left-1/4 w-px bg-gray-300/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 2.0 }}
                    />
                    <motion.div
                      className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-300/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 2.1 }}
                    />
                    <motion.div
                      className="absolute top-0 bottom-0 left-3/4 w-px bg-gray-300/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 2.2 }}
                    />

                    {/* 연결된 그래프 선 - 데이터 포인트를 선으로 연결 */}
                    <div className="absolute inset-0">
                      {/* 그래프 선 - 데이터 포인트들을 선으로 연결 */}
                      <svg className="w-full h-full absolute inset-0">
                        {/* 그래프 선 경로 - 데이터 포인트 위치에 정확히 맞춤 */}
                        <motion.path
                          d="M 0 55 L 62.5 60 L 125 47 L 187.5 55 L 250 47 L 312.5 30 L 375 40 L 437.5 20 L 500 20"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, delay: 2.4 }}
                        />

                        {/* 데이터 포인트들 - 꺾임 지점에 배치 */}
                        <motion.circle
                          cx="0"
                          cy="55"
                          r="3"
                          fill="white"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth="2"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 2.6 }}
                        />
                        <motion.circle
                          cx="62.5"
                          cy="60"
                          r="3"
                          fill="white"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth="2"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 2.7 }}
                        />
                        <motion.circle
                          cx="125"
                          cy="47"
                          r="3"
                          fill="white"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth="2"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 2.8 }}
                        />
                        <motion.circle
                          cx="187.5"
                          cy="55"
                          r="3"
                          fill="white"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth="2"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 2.9 }}
                        />
                        <motion.circle
                          cx="250"
                          cy="47"
                          r="3"
                          fill="white"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth="2"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 3.0 }}
                        />
                        <motion.circle
                          cx="312.5"
                          cy="30"
                          r="3"
                          fill="white"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth="2"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 3.1 }}
                        />
                        <motion.circle
                          cx="375"
                          cy="40"
                          r="3"
                          fill="white"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth="2"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 3.2 }}
                        />
                        <motion.circle
                          cx="437.5"
                          cy="20"
                          r="3"
                          fill="white"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth="2"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 3.3 }}
                        />
                        <motion.circle
                          cx="500"
                          cy="20"
                          r="3"
                          fill="white"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth="2"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 3.4 }}
                        />
                      </svg>
                    </div>

                    {/* 날짜 레이블 - 8개 포인트에 맞게 업데이트 */}
                    <motion.div
                      className="absolute bottom-1 left-0 right-0 flex justify-between text-xs text-gray-700 px-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 3.6 }}
                    >
                      <span>8/20</span>
                      <span>8/23</span>
                      <span>8/26</span>
                      <span>8/29</span>
                      <span>9/1</span>
                      <span>9/4</span>
                      <span>9/7</span>
                      <span>9/10</span>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LandingComponent;
