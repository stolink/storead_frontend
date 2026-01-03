/**
 * AuthModal 전역 상태 관리 스토어
 * 어디서든 로그인 모달을 열 수 있고, 로그인 후 돌아갈 경로도 저장
 * activeTab으로 로그인/회원가입 탭을 직접 지정 가능
 */
import { create } from "zustand";

type AuthTab = "login" | "register";

interface AuthModalState {
  isOpen: boolean;
  returnPath: string | null;
  activeTab: AuthTab;
  openAuthModal: (returnPath?: string, tab?: AuthTab) => void;
  closeAuthModal: () => void;
  clearReturnPath: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  returnPath: null,
  activeTab: "login",
  openAuthModal: (returnPath?: string, tab?: AuthTab) =>
    set({
      isOpen: true,
      returnPath: returnPath || null,
      activeTab: tab || "login",
    }),
  closeAuthModal: () => set({ isOpen: false }),
  clearReturnPath: () => set({ returnPath: null }),
}));
