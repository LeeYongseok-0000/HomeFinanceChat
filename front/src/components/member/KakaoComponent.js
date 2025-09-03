import { Link } from "react-router-dom";
import { getKakaoLoginLink } from "../../api/kakaoApi";

const KakaoComponent = () => {
  const link = getKakaoLoginLink();

  return (
    <Link
      to={link}
      className="
        w-16 h-16
        rounded-full
        bg-[#FEE500]
        hover:bg-[#fde32a]
        active:bg-[#ffd400]
        shadow-lg
        hover:shadow-xl
        transition-all
        duration-200
        flex items-center justify-center
        group
      "
      title="카카오로 로그인"
    >
      {/* 카카오 아이콘 */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className="w-8 h-8 fill-current text-black group-hover:scale-110 transition-transform duration-200"
      >
        <path d="M18 10c0 3.866-3.582 7-8 7-1.933 0-3.737-.625-5.13-1.686L2 17l1.359-2.871C2.593 13.08 2 11.586 2 10 2 6.134 5.582 3 10 3s8 3.134 8 7z" />
      </svg>
    </Link>
  );
};

export default KakaoComponent;
