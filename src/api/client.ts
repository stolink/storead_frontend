/**
 * API 클라이언트 설정
 * Axios 인스턴스 및 인터셉터
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";

// API 기본 URL - Vite 환경 변수 사용
const API_URL = import.meta.env.VITE_API_URL || "/api";

// Axios 인스턴스 생성
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true, // 쿠키 기반 인증을 위해 필수
  headers: {
    "Content-Type": "application/json",
  },
  // Spring Boot는 배열 파라미터를 genres=A&genres=B 형식으로 받아야 함
  // 기본 axios는 genres[]=A&genres[]=B 형식으로 보내서 500 에러 발생
  paramsSerializer: {
    serialize: (params) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, v));
        } else if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      return searchParams.toString();
    },
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

// 모든 훅에서 default import를 사용하므로 호환성을 위해 추가
export default api;
