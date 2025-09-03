import axios from "axios";

export const API_SERVER_HOST = "http://localhost:8080";

// 기본 axios 인스턴스 생성
export const backendApi = axios.create({
  baseURL: API_SERVER_HOST,
  headers: {
    "Content-Type": "application/json",
  },
});
