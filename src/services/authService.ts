/**
 * 인증 서비스
 * 로그인, 회원가입, 토큰 갱신 등 인증 관련 API 호출
 */
import api from "@/api/client";
import type { User } from "@/types";

export interface AuthResponse {
  user: User;
  expiresIn: number; // 초 단위
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export const authService = {
  register: async (payload: {
    email: string;
    password: string;
    nickname: string;
  }) => {
    const response = await api.post<ApiResponse<User>>(
      "/auth/register",
      payload
    );
    return response.data;
  },

  login: async (payload: { email: string; password: string }) => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      payload
    );
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<null>>("/auth/logout");
    return response.data;
  },

  refresh: async () => {
    // 쿠키 기반 - body 없이 POST (쿠키 자동 전송)
    const response =
      await api.post<ApiResponse<{ expiresIn: number }>>("/auth/refresh");
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },

  updateMe: async (payload: Partial<Pick<User, "nickname" | "profileImageUrl">>) => {
    const response = await api.patch<ApiResponse<User>>("/auth/me", payload);
    return response.data;
  },
};

