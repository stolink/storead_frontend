/**
 * API 클라이언트 설정
 * Axios 인스턴스 및 인터셉터
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// API 기본 URL - Vite 프록시 사용 시 상대 경로 필요
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Axios 인스턴스 생성
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 인증 토큰 자동 첨부
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";

// 응답 인터셉터: 에러 처리 및 토큰 만료 핸들링
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 Zustand 스토어를 통해 로그아웃 및 모달 오픈
      // React 컴포넌트 외부이므로 getState() 사용
      useAuthStore.getState().logout();
      useAuthModalStore.getState().openAuthModal(window.location.pathname);
    }
    return Promise.reject(error);
  }
);

export default api;
