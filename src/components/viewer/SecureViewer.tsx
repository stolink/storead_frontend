/**
 * 보안 뷰어 컴포넌트
 * 텍스트 무단 복사 방지 + 가독성 설정
 */
import { useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSecureContent } from '@/hooks/useSecureContent';
import {
    ViewerSettingsPanel,
    useViewerSettings,
    type ViewerTheme,
} from './ViewerSettings';

interface SecureViewerProps {
    /** 본문 콘텐츠 (HTML 또는 텍스트) */
    content: string;
    /** HTML로 렌더링할지 여부 */
    isHtml?: boolean;
    /** 추가 클래스 */
    className?: string;
}

/**
 * 테마별 스타일
 */
const themeStyles: Record<ViewerTheme, string> = {
    light: 'bg-white text-zinc-900',
    dark: 'bg-zinc-900 text-zinc-100',
    sepia: 'bg-amber-50 text-amber-900',
};

/**
 * 보안 뷰어 컴포넌트
 *
 * 보안 기능:
 * - 우클릭 메뉴 차단
 * - 텍스트 복사/붙여넣기 차단
 * - 드래그 차단
 * - 개발자 도구 단축키 차단
 * - CSS user-select: none 적용
 *
 * 가독성 설정:
 * - 테마 (라이트/다크/세피아)
 * - 폰트 크기 조절 (14px ~ 24px)
 * - 줄 간격 조절 (1.5 / 1.8 / 2.0)
 */
export const SecureViewer = ({
    content,
    isHtml = false,
    className,
}: SecureViewerProps) => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const [showSettings, setShowSettings] = useState(false);
    const { settings, updateSettings } = useViewerSettings();

    // 보안 훅 적용
    useSecureContent(viewerRef);

    const { fontSize, theme, lineHeight } = settings;

    return (
        <div className={cn('relative', className)}>
            {/* 설정 버튼 */}
            <div className="absolute top-4 right-4 z-10">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSettings(!showSettings)}
                    aria-label="뷰어 설정"
                >
                    <Settings className="h-4 w-4" />
                </Button>

                {/* 설정 패널 */}
                {showSettings && (
                    <>
                        {/* 배경 클릭 시 닫기 */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowSettings(false)}
                        />
                        <div className="absolute top-12 right-0 z-20">
                            <ViewerSettingsPanel
                                settings={settings}
                                onChange={updateSettings}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* 본문 영역 */}
            <div
                ref={viewerRef}
                className={cn(
                    // 기본 스타일
                    'p-8 rounded-lg min-h-[60vh]',
                    // 보안 스타일
                    'select-none',
                    // 테마 스타일
                    themeStyles[theme]
                )}
                style={{
                    fontSize: `${fontSize}px`,
                    lineHeight,
                    // 추가 보안 CSS
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    userSelect: 'none',
                    WebkitTouchCallout: 'none',
                }}
                // 인라인 이벤트 핸들러 (이중 보안)
                onContextMenu={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
            >
                {isHtml ? (
                    <div
                        className="prose prose-lg max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                ) : (
                    <div className="whitespace-pre-wrap break-words">{content}</div>
                )}
            </div>
        </div>
    );
};

export default SecureViewer;
