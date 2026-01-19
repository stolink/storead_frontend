/**
 * API 클라이언트 설정
 * Axios 인스턴스 및 인터셉터
 * Web Locks API를 사용하여 탭 간 토큰 refresh 동기화
 */
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { QueryClient } from "@tanstack/react-query";

// API 기본 URL - Vite 환경 변수 사용
const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "/api";

// 재시도 플래그를 위한 타입 확장
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 백엔드 ApiResponse 형태에 맞는 Refresh 응답 타입
interface RefreshResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

// QueryClient 인스턴스를 저장 (App에서 설정)
let queryClientInstance: QueryClient | null = null;

export const setQueryClient = (client: QueryClient) => {
  queryClientInstance = client;
};

const clearCacheAndLogout = () => {
  useAuthStore.getState().logout();
  if (queryClientInstance) {
    queryClientInstance.clear();
  }
  // 로그인 모달 열기
  useAuthModalStore.getState().openAuthModal(window.location.pathname);
};

// Promise 큐잉: 동시 refresh 요청을 하나로 통합
let refreshPromise: Promise<void> | null = null;

// 마지막 refresh 실패 시간 (10초간 재시도 방지)
let lastRefreshFailureTime: number | null = null;
const REFRESH_FAILURE_COOLDOWN = 10000; // 10초

/**
 * 토큰 갱신을 보장하는 함수
 * 이미 refresh가 진행 중이면 같은 Promise를 반환하여 중복 요청 방지
 */
const ensureTokenRefreshed = async (): Promise<void> => {
  // 최근 실패했다면 쿨다운 기간 동안 재시도하지 않음
  if (
    lastRefreshFailureTime &&
    Date.now() - lastRefreshFailureTime < REFRESH_FAILURE_COOLDOWN
  ) {
    console.log("[Auth] Refresh failed recently. Skipping retry (cooldown).");
    throw new Error("Refresh on cooldown after failure");
  }

  if (refreshPromise) {
    console.log(
      "[Auth] Refresh already in progress. Waiting for existing request..."
    );
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      // 마지막 성공 refresh 시간 확인 (3초 내 재요청이면 스킵)
      const lastRefreshTime = localStorage.getItem("last_refresh_time");
      const now = Date.now();

      if (lastRefreshTime && now - parseInt(lastRefreshTime) < 3000) {
        console.log("[Auth] Token refreshed recently. Skipping refresh.");
        return;
      }

      console.log("[Auth] Sending refresh request...");
      const response = await api.post<RefreshResponse>("/auth/refresh");

      // 응답 검증 (타입 안전)
      const responseData = response.data;
      if (responseData && responseData.success === false) {
        throw new Error(
          responseData.error?.message || "Refresh returned success: false"
        );
      }

      console.log("[Auth] Refresh successful.");
      localStorage.setItem("last_refresh_time", Date.now().toString());
      lastRefreshFailureTime = null; // 성공 시 실패 기록 초기화
    } catch (error) {
      lastRefreshFailureTime = Date.now(); // 실패 시간 기록
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Axios 인스턴스 생성
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true, // 쿠키 기반 인증을 위해 필수
  // Content-Type은 axios가 데이터 타입에 따라 자동 설정
  // Spring Boot는 배열 파라미터를 genres=A&genres=B 형식으로 받아야 함
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

// 요청 인터셉터: X-User-Id 추가 (선택적)
api.interceptors.request.use(
  (config) => {
    const { user } = useAuthStore.getState();

    // User ID가 있다면 X-User-Id 헤더 사용 (레거시 대응용)
    if (user?.id) {
      config.headers["X-User-Id"] = user.id;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 시 토큰 재발급 시도
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // 401 에러이고, 재시도가 아닌 경우에만 토큰 재발급 시도
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // 인증된 적 없는 익명 유저는 refresh 시도하지 않음 (단, 초기 세션 복원을 위한 /auth/me 요청은 예외)
      const { isAuthenticated } = useAuthStore.getState();
      const isSessionRestore = originalRequest.url?.includes("/auth/me");

      if (!isAuthenticated && !isSessionRestore) {
        console.log("[Auth] 401 error for anonymous user. Skipping refresh.");
        return Promise.reject(error);
      }

      console.log("[Auth] 401 error detected. Attempting to refresh token...");

      // /auth/refresh 요청 자체가 실패한 경우는 재시도하지 않음
      if (originalRequest.url?.includes("/auth/refresh")) {
        console.log("[Auth] Refresh token request failed. Logging out.");
        clearCacheAndLogout();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        console.log(
          "[Auth] Acquiring refresh lock for " + originalRequest.url + "..."
        );

        // Web Locks API + Promise 큐잉으로 탭 간/동시 요청 모두 처리
        await navigator.locks.request("auth_refresh_lock", async () => {
          await ensureTokenRefreshed();
        });

        // 락 해제 후 원래 요청 재시도
        console.log("[Auth] Retrying original request: " + originalRequest.url);
        return api(originalRequest);
      } catch (refreshError) {
        console.error("[Auth] Refresh process failed:", refreshError);

        // 이미 다른 요청에 의해 로그아웃 처리 중일 수 있으므로 중복 실행 방지
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          console.log("[Auth] Logging out due to refresh failure.");
          clearCacheAndLogout();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
