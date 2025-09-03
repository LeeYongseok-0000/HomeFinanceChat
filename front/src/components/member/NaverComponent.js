import { Link } from "react-router-dom";
import { getNaverLoginLink } from "../../api/naverApi";

const NaverComponent = () => {
  const link = getNaverLoginLink();

  return (
    <Link
      to={link}
      className="
        w-16 h-16
        rounded-full
        bg-[#03C75A]
        hover:bg-[#02b351]
        active:bg-[#029e47]
        shadow-lg
        hover:shadow-xl
        transition-all
        duration-200
        flex items-center justify-center
        group
      "
      title="네이버로 로그인"
    >
      {/* 네이버 아이콘 */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-8 h-8 fill-current text-white group-hover:scale-110 transition-transform duration-200"
      >
        <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
      </svg>
    </Link>
  );
};

export default NaverComponent;
