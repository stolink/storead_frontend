/**
 * 보안 뷰어 컴포넌트
 * 텍스트 무단 복사 방지 (설정 UI 제거 - 외부에서 제어)
 */
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { useSecureContent } from '@/hooks/useSecureContent';

interface SecureViewerProps {
    /** 본문 콘텐츠 (HTML 또는 텍스트) */
    content: string;
    /** HTML로 렌더링할지 여부 */
    isHtml?: boolean;
    /** 추가 클래스 */
    className?: string;
}

/**
 * 보안 뷰어 컴포넌트 (단순화 버전)
 * 
 * 보안 기능:
 * - 우클릭 메뉴 차단
 * - 텍스트 복사/붙여넣기 차단
 * - 드래그 차단
 * 
 * 가독성 설정은 외부(ChapterViewerPage)에서 제어
 */
export const SecureViewer = ({
    content,
    isHtml = false,
    className,
}: SecureViewerProps) => {
    const viewerRef = useRef<HTMLDivElement>(null);

    // 보안 훅 적용
    useSecureContent(viewerRef);

    return (
        <div
            ref={viewerRef}
            className={cn(
                // 보안 스타일
                'select-none',
                className
            )}
            style={{
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
    );
};

export default SecureViewer;
