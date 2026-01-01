/**
 * 전역 테마 상태 관리
 * 라이트, 다크, 세피아 테마 지원
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 테마 타입 정의
export type Theme = 'light' | 'dark' | 'sepia';

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

// 테마별 CSS 클래스
export const themeClasses: Record<Theme, string> = {
    light: 'bg-white text-zinc-900',
    dark: 'bg-zinc-900 text-zinc-100',
    sepia: 'bg-amber-50 text-amber-900',
};

// 테마별 헤더 스타일
export const headerThemeClasses: Record<Theme, string> = {
    light: 'bg-white/95 border-zinc-200',
    dark: 'bg-zinc-800/95 border-zinc-700',
    sepia: 'bg-amber-100/95 border-amber-200',
};

// 테마별 카드 스타일
export const cardThemeClasses: Record<Theme, string> = {
    light: 'bg-white border-zinc-200',
    dark: 'bg-zinc-800 border-zinc-700',
    sepia: 'bg-amber-50 border-amber-200',
};

// 테마별 배경 스타일
export const backgroundThemeClasses: Record<Theme, string> = {
    light: 'bg-zinc-50',
    dark: 'bg-zinc-950',
    sepia: 'bg-amber-100',
};

/**
 * 전역 테마 스토어
 * localStorage에 저장되어 새로고침 후에도 유지됨
 */
export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'light',
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'storead-theme',
        }
    )
);

export default useThemeStore;
