/**
 * 뷰어 설정 컴포넌트
 * 폰트 크기, 테마, 줄 간격 조절
 */
import { useState, useEffect } from 'react';
import { Minus, Plus, Sun, Moon, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewerTheme = 'light' | 'dark' | 'sepia';
export type LineHeight = 1.5 | 1.8 | 2.0;

interface ViewerSettings {
    fontSize: number;
    theme: ViewerTheme;
    lineHeight: LineHeight;
}

interface ViewerSettingsProps {
    settings: ViewerSettings;
    onChange: (settings: ViewerSettings) => void;
    className?: string;
}

const FONT_SIZE_MIN = 14;
const FONT_SIZE_MAX = 24;
const FONT_SIZE_STEP = 2;

const STORAGE_KEY = 'viewer-settings';

/**
 * 뷰어 설정 기본값
 */
export const defaultViewerSettings: ViewerSettings = {
    fontSize: 18,
    theme: 'light',
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

/**
 * 뷰어 설정 훅
 */
export const useViewerSettings = () => {
    const [settings, setSettings] = useState<ViewerSettings>(defaultViewerSettings);

    useEffect(() => {
        setSettings(loadViewerSettings());
    }, []);

    const updateSettings = (newSettings: Partial<ViewerSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        saveViewerSettings(updated);
    };

    return { settings, updateSettings };
};

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
        const newSize = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, fontSize + delta));
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
                'p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700',
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
                        variant={theme === 'light' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleThemeChange('light')}
                        className="flex-1"
                    >
                        <Sun className="h-4 w-4 mr-1" />
                        라이트
                    </Button>
                    <Button
                        variant={theme === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleThemeChange('dark')}
                        className="flex-1"
                    >
                        <Moon className="h-4 w-4 mr-1" />
                        다크
                    </Button>
                    <Button
                        variant={theme === 'sepia' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleThemeChange('sepia')}
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
                            variant={lineHeight === lh ? 'default' : 'outline'}
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
