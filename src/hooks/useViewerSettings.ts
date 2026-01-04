import { useState } from "react";
import {
  type ViewerSettings,
  loadViewerSettings,
  saveViewerSettings,
} from "@/lib/viewerSettings";

/**
 * 뷰어 설정 훅
 */
export const useViewerSettings = () => {
  // 초기값을 로컬 스토리지에서 바로 읽어오도록 변경 (useEffect 제거 효과)
  const [settings, setSettings] = useState<ViewerSettings>(() =>
    loadViewerSettings()
  );

  const updateSettings = (newSettings: Partial<ViewerSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveViewerSettings(updated);
  };

  return { settings, updateSettings };
};
