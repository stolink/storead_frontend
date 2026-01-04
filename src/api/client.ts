/**
 * API 클라이언트 설정
 * Axios 인스턴스 및 인터셉터
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";

// API 기본 URL - Vite 프록시 사용 시 상대 경로 필요
const API_URL = import.meta.env.VITE_API_URL || "/api";

// Axios 인스턴스 생성
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true, // 쿠키 기반 인증을 위해 필수
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 필요시 요청 로깅 등
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 쿠키 기반 인증이므로 Authorization 헤더 불필요
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리 및 토큰 만료 핸들링
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // 요청별 설정에서 인터셉터 무시 옵션 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error.config as any)?.skipAuthHandler) {
      return Promise.reject(error);
    }

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
