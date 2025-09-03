/**
 * Flask 음성 인식 API 호출 서비스
 * 직접 Flask 서버와 통신
 */

// Python Flask 서버 직접 연결 API 함수들
const FLASK_BASE_URL = "http://127.0.0.1:5000";

// 텍스트 챗봇 호출 (Flask 직접)
export const callTextChatbot = async (message, userInfo = {}) => {
  try {
    console.log("🤖 Flask 텍스트 챗봇 호출:", message);
    console.log("🤖 사용자 상세 정보:", userInfo);

    const response = await fetch(`${FLASK_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        user_email: userInfo.email, // 사용자 이메일 전송
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🤖 Flask 챗봇 응답:", data);
    return data;
  } catch (error) {
    console.error("🤖 Flask 텍스트 챗봇 호출 실패:", error);
    return {
      success: false,
      error: error.message,
      response: "죄송합니다. Flask 서버 연결에 실패했습니다.",
    };
  }
};

// 음성 챗봇 호출 (Flask 직접)
export const callVoiceChatbot = async (audioFile, userInfo = {}) => {
  try {
    console.log("🎤 Flask 음성 챗봇 호출 시작...");

    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("user_info", JSON.stringify(userInfo));

    const response = await fetch(`${FLASK_BASE_URL}/api/voice-chatbot`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🎤 Flask 음성 챗봇 응답:", data);
    return data;
  } catch (error) {
    console.error("🎤 Flask 음성 챗봇 호출 실패:", error);
    return {
      success: false,
      error: error.message,
      transcript: "음성 인식에 실패했습니다.",
      ai_answer: "죄송합니다. Flask 서버 연결에 실패했습니다.",
    };
  }
};

// 실시간 음성 인식 (Flask 직접)
export const callRealtimeSpeech = async (audioFile) => {
  try {
    console.log("🎤 === Flask 음성 인식 API 직접 호출 ===");
    console.log("🎤 오디오 파일:", audioFile.name, audioFile.size, "bytes");
    console.log("🎤 Flask 서버 URL:", `${FLASK_BASE_URL}/api/speech-to-text`);

    const formData = new FormData();
    formData.append("audio", audioFile);

    // FormData 내용 확인
    for (let [key, value] of formData.entries()) {
      console.log("🎤 FormData 내용:", key, value);
    }

    const response = await fetch(`${FLASK_BASE_URL}/api/speech-to-text`, {
      method: "POST",
      body: formData,
    });

    console.log("🎤 HTTP 응답 상태:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🎤 Flask API 응답 오류:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🎤 Flask API 응답 성공:", data);

    return data;
  } catch (error) {
    console.error("🎤 Flask 음성 인식 API 호출 실패:", error);
    return {
      success: false,
      error: error.message,
      transcript: "음성 인식에 실패했습니다.",
    };
  }
};

// 텍스트를 음성으로 변환 (Flask 직접)
export const callTextToSpeech = async (text, languageCode = "ko-KR") => {
  try {
    console.log("🔊 Flask TTS 호출:", text);

    const response = await fetch(`${FLASK_BASE_URL}/api/text-to-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        language_code: languageCode,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🔊 Flask TTS 응답:", data);
    return data;
  } catch (error) {
    console.error("🔊 Flask TTS 호출 실패:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// 번역 API (Flask 직접)
export const callTranslate = async (text, targetLanguage = "en") => {
  try {
    console.log("🌐 Flask 번역 API 호출:", text, "→", targetLanguage);

    const response = await fetch(`${FLASK_BASE_URL}/api/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        target_language: targetLanguage,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🌐 Flask 번역 응답:", data);
    return data;
  } catch (error) {
    console.error("🌐 Flask 번역 API 호출 실패:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Flask 서버 상태 확인
export const checkFlaskServerHealth = async () => {
  try {
    console.log("🏥 Flask 서버 상태 확인 중...");
    const response = await fetch(`${FLASK_BASE_URL}/api/health`);

    if (response.ok) {
      const data = await response.json();
      console.log("🏥 Flask 서버 상태:", data);
      return data;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("🏥 Flask 서버 상태 확인 실패:", error);
    return {
      status: "error",
      message: "Flask 서버에 연결할 수 없습니다.",
      error: error.message,
    };
  }
};

// Flask 서버 직접 연결 테스트
export const checkFlaskServerDirectly = async () => {
  try {
    console.log("🔍 Flask 서버 직접 연결 테스트...");
    const response = await fetch(`${FLASK_BASE_URL}/api/health`);

    if (response.ok) {
      const data = await response.json();
      console.log("🔍 Flask 서버 연결 성공:", data);
      return {
        status: "healthy",
        message: "Flask 서버 연결 성공",
        details: data,
      };
    } else {
      console.log("🔍 Flask 서버 응답 오류:", response.status);
      return {
        status: "error",
        message: "Flask 서버 응답 오류",
        details: `상태 코드: ${response.status}`,
      };
    }
  } catch (error) {
    console.error("🔍 Flask 서버 직접 연결 실패:", error);
    return {
      status: "error",
      message: "Flask 서버 연결 실패",
      details: error.message,
    };
  }
};

// Google API 상태 확인
export const checkGoogleApiStatus = async () => {
  try {
    console.log("🔍 Google API 상태 확인 중...");
    const response = await fetch(`${FLASK_BASE_URL}/api/check-google-api`);

    if (response.ok) {
      const data = await response.json();
      console.log("🔍 Google API 상태:", data);
      return data;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("🔍 Google API 상태 확인 실패:", error);
    return {
      status: "error",
      message: "Google API 상태 확인 실패",
      error: error.message,
    };
  }
};

// OpenAI API 상태 확인
export const checkOpenAIApiStatus = async () => {
  try {
    console.log("🔍 OpenAI API 상태 확인 중...");
    const response = await fetch(`${FLASK_BASE_URL}/api/check-openai-api`);

    if (response.ok) {
      const data = await response.json();
      console.log("🔍 OpenAI API 상태:", data);
      return data;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("🔍 OpenAI API 상태 확인 실패:", error);
    return {
      status: "error",
      message: "OpenAI API 상태 확인 실패",
      error: error.message,
    };
  }
};
