import React from "react";
import { Outlet } from "react-router-dom";
import "./ChatBotLayout.css";

const ChatBotLayout = () => {
  return (
    <div className="chatbot-layout">
      {/* 로고 섹션 - 중앙 정렬 */}
      <div className="logo-section">
        <img src="/Logo4.png" alt="로고" className="logo" />
      </div>

      {/* 챗봇 컨텐츠 */}
      <div className="chatbot-content">
        <Outlet />
      </div>
    </div>
  );
};

export default ChatBotLayout;
