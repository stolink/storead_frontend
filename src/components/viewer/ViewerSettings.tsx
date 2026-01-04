import { Minus, Plus, Sun, Moon, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type ViewerSettings,
  type ViewerTheme,
  type LineHeight,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  FONT_SIZE_STEP,
} from "@/lib/viewerSettings";

interface ViewerSettingsProps {
  settings: ViewerSettings;
  onChange: (settings: ViewerSettings) => void;
  className?: string;
}

/**
 * 뷰어 설정 컴포넌트
 */
export const ViewerSettingsPanel = ({
  settings,
  onChange,
  className,
}: ViewerSettingsProps) => {
  const { fontSize, theme, lineHeight } = settings;

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.min(
      FONT_SIZE_MAX,
      Math.max(FONT_SIZE_MIN, fontSize + delta)
    );
    onChange({ ...settings, fontSize: newSize });
  };

  const handleThemeChange = (newTheme: ViewerTheme) => {
    onChange({ ...settings, theme: newTheme });
  };

  const handleLineHeightChange = (newLineHeight: LineHeight) => {
    onChange({ ...settings, lineHeight: newLineHeight });
  };

  return (
    <div
      className={cn(
        "p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700",
        className
      )}
    >
      {/* 폰트 크기 조절 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
          글자 크기
        </label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleFontSizeChange(-FONT_SIZE_STEP)}
            disabled={fontSize <= FONT_SIZE_MIN}
            aria-label="글자 크기 줄이기"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-14 text-center font-medium">{fontSize}px</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleFontSizeChange(FONT_SIZE_STEP)}
            disabled={fontSize >= FONT_SIZE_MAX}
            aria-label="글자 크기 늘리기"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 테마 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
          테마
        </label>
        <div className="flex gap-2">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => handleThemeChange("light")}
            className="flex-1"
          >
            <Sun className="h-4 w-4 mr-1" />
            라이트
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => handleThemeChange("dark")}
            className="flex-1"
          >
            <Moon className="h-4 w-4 mr-1" />
            다크
          </Button>
          <Button
            variant={theme === "sepia" ? "default" : "outline"}
            size="sm"
            onClick={() => handleThemeChange("sepia")}
            className="flex-1"
          >
            <Palette className="h-4 w-4 mr-1" />
            세피아
          </Button>
        </div>
      </div>

      {/* 줄 간격 */}
      <div>
        <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
          줄 간격
        </label>
        <div className="flex gap-2">
          {([1.5, 1.8, 2.0] as LineHeight[]).map((lh) => (
            <Button
              key={lh}
              variant={lineHeight === lh ? "default" : "outline"}
              size="sm"
              onClick={() => handleLineHeightChange(lh)}
              className="flex-1"
            >
              {lh}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewerSettingsPanel;
