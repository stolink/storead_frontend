/**
 * 전역 테마 상태 관리
 * 라이트, 다크, 세피아, 아이보리 테마 지원
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

// 테마 타입 정의
export type Theme = "light" | "dark" | "sepia" | "ivory";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// 테마별 CSS 클래스 (사용자 요구 색상 기반)
export const themeClasses: Record<Theme, string> = {
  light: "bg-white text-[#222222]",
  dark: "bg-[#1A1A1A] text-[#CCCCCC]",
  sepia: "bg-amber-50 text-amber-900",
  ivory: "bg-[#F4EBD9] text-[#594739]",
};

// 테마별 헤더 스타일
export const headerThemeClasses: Record<Theme, string> = {
  light: "bg-white/95 border-[#EEEEEE]",
  dark: "bg-[#1A1A1A]/95 border-[#333333]",
  sepia: "bg-amber-100/95 border-amber-200",
  ivory: "bg-[#F4EBD9]/95 border-[#E0D5BC]",
};

// 테마별 카드 스타일
export const cardThemeClasses: Record<Theme, string> = {
  light: "bg-white border-[#EEEEEE]",
  dark: "bg-[#1A1A1A] border-[#333333]",
  sepia: "bg-amber-50 border-amber-200",
  ivory: "bg-[#F4EBD9] border-[#E0D5BC]",
};

// 테마별 배경 스타일
export const backgroundThemeClasses: Record<Theme, string> = {
  light: "bg-zinc-50",
  dark: "bg-zinc-950",
  sepia: "bg-amber-100",
  ivory: "bg-[#FAF6F0]",
};

// 테마별 구분선 스타일 (새로 추가)
export const dividerThemeClasses: Record<Theme, string> = {
  light: "border-[#EEEEEE]",
  dark: "border-[#333333]",
  sepia: "border-amber-200",
  ivory: "border-[#E0D5BC]",
};

// 테마별 댓글 미리보기 배경 (베스트 댓글용)
export const previewBgClasses: Record<Theme, string> = {
  light: "bg-[#FBF9F7]",
  dark: "bg-[#252525]",
  sepia: "bg-amber-100/50",
  ivory: "bg-[#FBF9F7]",
};

/**
 * HTML 요소에 dark 클래스 토글 (Tailwind dark mode 지원)
 * 현재 미사용이지만 향후 다크모드 전역 적용 시 사용 예정
 */
const _updateHtmlDarkClass = (theme: Theme) => {
  if (typeof document !== "undefined") {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }
};

// 다크모드 전역 적용 시 setTheme 내에서 _updateHtmlDarkClass(theme) 호출
void _updateHtmlDarkClass;

/**
 * 전역 테마 스토어
 * localStorage에 저장되어 새로고침 후에도 유지됨
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => {
        set({ theme });
      },
    }),
    {
      name: "storead-theme",
    },
  ),
);

export default useThemeStore;
