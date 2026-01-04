export type ViewerTheme = "light" | "dark" | "sepia";
export type LineHeight = 1.5 | 1.8 | 2.0;

export interface ViewerSettings {
  fontSize: number;
  theme: ViewerTheme;
  lineHeight: LineHeight;
}

const FONT_SIZE_MIN = 14;
const FONT_SIZE_MAX = 24;
const FONT_SIZE_STEP = 2;

const STORAGE_KEY = "viewer-settings";

/**
 * 뷰어 설정 기본값
 */
export const defaultViewerSettings: ViewerSettings = {
  fontSize: 18,
  theme: "light",
  lineHeight: 1.8,
};

/**
 * localStorage에서 설정 불러오기
 */
export const loadViewerSettings = (): ViewerSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultViewerSettings, ...JSON.parse(saved) };
    }
  } catch {
    // 파싱 실패 시 기본값 사용
  }
  return defaultViewerSettings;
};

/**
 * localStorage에 설정 저장
 */
export const saveViewerSettings = (settings: ViewerSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // 저장 실패 무시
  }
};

export { FONT_SIZE_MIN, FONT_SIZE_MAX, FONT_SIZE_STEP };
