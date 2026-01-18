/**
 * Zustand 인증 상태 관리 스토어
 * 쿠키 기반 인증 - 토큰 관리 불필요
 * persist 제거: 서버에서 인증 상태를 확인하여 탭 간 일관성 유지
 */
import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Actions
  setAuth: (user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (user) => {
    set({ user, isAuthenticated: true });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    // 멀티 탭 로그아웃 동기화
    localStorage.setItem("auth-logout", Date.now().toString());
  },

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  setLoading: (loading) => set({ isLoading: loading }),
}));

// 멀티 탭 로그아웃 감지 이벤트 리스너
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === "auth-logout") {
      useAuthStore.getState().logout();
    }
  });
}
