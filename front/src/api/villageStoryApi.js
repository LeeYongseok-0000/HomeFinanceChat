import axios from "axios";
import { API_SERVER_HOST } from "./backendApi";

const boardHost = `${API_SERVER_HOST}/api/board`;

// 게시글 생성 - "이야기" 카테고리로 고정
export const createVillageStory = async (board) => {
  try {
    // FormData인 경우와 일반 객체인 경우를 구분하여 처리
    if (board instanceof FormData) {
      console.log("=== createVillageStory API 호출 (FormData) ===");
      console.log("FormData 내용:");
      for (let [key, value] of board.entries()) {
        console.log(`${key}:`, value);
      }

      const res = await axios.post(`${boardHost}/add`, board, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } else {
      // 기존 JSON 방식 지원 (하위 호환성)
      console.log("=== createVillageStory API 호출 (JSON) ===");
      console.log("요청 데이터:", board);

      const res = await axios.post(`${boardHost}/add`, board);
      return res.data;
    }
  } catch (error) {
    console.error("createVillageStory API 에러:", error);
    if (error.response) {
      console.error("에러 응답:", error.response);
      console.error("에러 상태:", error.response.status);
      console.error("에러 데이터:", error.response.data);
    }
    throw error;
  }
};

// 게시글 수정
export const updateVillageStory = async (formData) => {
  try {
    // FormData에서 id(게시글 ID) 추출
    const bno = formData.get("id");
    if (!bno) {
      throw new Error("게시글 ID가 없습니다.");
    }

    console.log("=== updateVillageStory API 호출 ===");
    console.log("요청 URL:", `${boardHost}/modify/images`);
    console.log("게시글 ID:", bno);
    console.log("FormData 내용:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const res = await axios.put(`${boardHost}/modify/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("updateVillageStory 응답:", res);
    return res.data;
  } catch (error) {
    console.error("updateVillageStory API 에러:", error);
    if (error.response) {
      console.error("에러 응답:", error.response);
      console.error("에러 상태:", error.response.status);
      console.error("에러 데이터:", error.response.data);
    }
    throw error;
  }
};

// 게시글 조회
export const getVillageStory = async (bno) => {
  const res = await axios.get(`${boardHost}/read/${bno}`);
  return res.data;
};

// 게시글 목록 조회 - "이야기" 카테고리로 고정
export const getVillageStories = async (params = {}) => {
  try {
    const { page = 0, size = 10, searchTerm = "" } = params;

    // category를 "이야기"로 고정
    let url = `${boardHost}/list?category=${encodeURIComponent("이야기")}`;

    // 페이지네이션 파라미터 추가
    if (page !== undefined) {
      url += `&page=${page}`;
    }
    if (size !== undefined) {
      url += `&size=${size}`;
    }

    // 검색어 파라미터 추가
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }

    console.log("getVillageStories API 호출 URL:", url);
    const res = await axios.get(url);
    console.log("getVillageStories 원본 응답:", res);
    console.log("getVillageStories 응답 데이터 타입:", typeof res.data);
    console.log("getVillageStories 응답 데이터:", res.data);

    const boards = res.data;

    if (boards === null || boards === undefined) {
      console.log("응답이 null 또는 undefined입니다.");
      return { content: [], totalPages: 0, totalElements: 0 };
    }

    // Spring Boot의 Page 객체 응답 형식 지원
    if (boards.content !== undefined && Array.isArray(boards.content)) {
      console.log("Page 객체 형식 응답 감지:", boards);
      return boards;
    }

    // 기존 배열 형식 지원 (하위 호환성)
    if (Array.isArray(boards)) {
      console.log("배열 형식 응답 감지:", boards);
      return { content: boards, totalPages: 1, totalElements: boards.length };
    }

    // ResponseEntity로 감싸진 응답일 가능성
    if (boards.data !== undefined) {
      console.log("ResponseEntity 형식 응답 감지:", boards);
      const innerData = boards.data;

      if (
        innerData &&
        innerData.content !== undefined &&
        Array.isArray(innerData.content)
      ) {
        return innerData;
      }

      if (Array.isArray(innerData)) {
        return {
          content: innerData,
          totalPages: 1,
          totalElements: innerData.length,
        };
      }
    }

    console.log("알 수 없는 응답 형식:", boards);
    return { content: [], totalPages: 0, totalElements: 0 };
  } catch (error) {
    console.error("우리 마을 이야기 목록 조회 실패:", error.message);
    console.error("에러 상세 정보:", error);
    throw error;
  }
};

// 게시글 삭제
export const deleteVillageStory = async (bno) => {
  try {
    console.log("우리 마을 이야기 삭제 요청 시작 - 게시글 ID:", bno);
    const res = await axios.delete(`${boardHost}/remove/${bno}`);
    console.log("우리 마을 이야기 삭제 응답:", res);
    return res.data;
  } catch (error) {
    console.error("우리 마을 이야기 삭제 실패:", error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data);
    }
    throw error;
  }
};

// 답변 관련 API
const answerHost = `${API_SERVER_HOST}/api/answers`;

// 답변 목록 조회
export const getAnswers = async (boardId) => {
  try {
    const response = await axios.get(`${answerHost}?boardId=${boardId}`);
    // ResponseEntity로 감싸진 응답에서 실제 데이터 추출
    return response.data;
  } catch (error) {
    console.error("답변 목록 조회 실패:", error);
    throw error;
  }
};

// 답변 생성
export const createAnswer = async (data) => {
  try {
    const response = await axios.post(answerHost, data);
    // ResponseEntity로 감싸진 응답에서 실제 데이터 추출
    return response.data;
  } catch (error) {
    console.error("답변 생성 실패:", error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data);
    }
    throw error;
  }
};

// 댓글 생성
export const createReply = (answerId, data) => {
  const requestData = {
    answerId: Number(answerId),
    content: data.content,
    writer: data.writer,
  };
  console.log("API 호출 데이터:", requestData);
  return axios.post(`${API_SERVER_HOST}/api/replies`, requestData);
};

// 댓글 삭제
export const deleteReply = async (replyId) => {
  try {
    const response = await axios.delete(
      `${API_SERVER_HOST}/api/replies/${replyId}`
    );
    return response.data;
  } catch (error) {
    console.error("댓글 삭제 실패:", error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data);
    }
    throw error;
  }
};

// 답변 삭제
export const deleteAnswer = async (answerId) => {
  try {
    const response = await axios.delete(
      `${API_SERVER_HOST}/api/answers/${answerId}`
    );
    return response.data;
  } catch (error) {
    console.error("답변 삭제 실패:", error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data);
    }
    throw error;
  }
};
