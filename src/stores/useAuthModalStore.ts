/**
 * AuthModal 전역 상태 관리 스토어
 * 어디서든 로그인 모달을 열 수 있고, 로그인 후 돌아갈 경로도 저장
 */
import { create } from "zustand";

interface AuthModalState {
  isOpen: boolean;
  returnPath: string | null;
  openAuthModal: (returnPath?: string) => void;
  closeAuthModal: () => void;
  clearReturnPath: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  returnPath: null,
  openAuthModal: (returnPath?: string) =>
    set({
      isOpen: true,
      returnPath: returnPath || null,
    }),
  closeAuthModal: () => set({ isOpen: false }),
  clearReturnPath: () => set({ returnPath: null }),
}));
