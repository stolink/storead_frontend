/**
 * 콘텐츠 보안 커스텀 훅
 * 텍스트 무단 복사 방지 (우클릭, 복사, 드래그, 개발자도구 차단)
 */
import { useEffect, type RefObject } from 'react';

interface UseSecureContentOptions {
    /** 우클릭 메뉴 차단 여부 */
    disableContextMenu?: boolean;
    /** 복사/붙여넣기 차단 여부 */
    disableCopy?: boolean;
    /** 드래그 차단 여부 */
    disableDrag?: boolean;
    /** 개발자 도구 단축키 차단 여부 */
    disableDevTools?: boolean;
    /** 텍스트 선택 차단 여부 */
    disableSelection?: boolean;
}

const defaultOptions: UseSecureContentOptions = {
    disableContextMenu: true,
    disableCopy: true,
    disableDrag: true,
    disableDevTools: true,
    disableSelection: true,
};

/**
 * 콘텐츠 보안 훅
 * 지정된 요소의 텍스트 무단 복사를 방지합니다.
 *
 * @param ref - 보안을 적용할 요소의 ref
 * @param options - 보안 옵션 (기본값: 모두 활성화)
 *
 * @example
 * ```tsx
 * const viewerRef = useRef<HTMLDivElement>(null);
 * useSecureContent(viewerRef);
 *
 * return <div ref={viewerRef}>{content}</div>;
 * ```
 */
export const useSecureContent = (
    ref: RefObject<HTMLElement | null>,
    options: UseSecureContentOptions = defaultOptions
) => {
    const mergedOptions = { ...defaultOptions, ...options };

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handlers: Array<{ event: string; handler: EventListener; target: EventTarget }> = [];

        // 우클릭 방지
        if (mergedOptions.disableContextMenu) {
            const handleContextMenu = (e: Event) => {
                e.preventDefault();
                return false;
            };
            element.addEventListener('contextmenu', handleContextMenu);
            handlers.push({ event: 'contextmenu', handler: handleContextMenu, target: element });
        }

        // 복사/붙여넣기 방지
        if (mergedOptions.disableCopy) {
            const handleCopy = (e: Event) => {
                e.preventDefault();
                return false;
            };
            element.addEventListener('copy', handleCopy);
            element.addEventListener('cut', handleCopy);
            handlers.push({ event: 'copy', handler: handleCopy, target: element });
            handlers.push({ event: 'cut', handler: handleCopy, target: element });
        }

        // 드래그 방지
        if (mergedOptions.disableDrag) {
            const handleDragStart = (e: Event) => {
                e.preventDefault();
                return false;
            };
            element.addEventListener('dragstart', handleDragStart);
            handlers.push({ event: 'dragstart', handler: handleDragStart, target: element });
        }

        // 개발자 도구 단축키 차단
        if (mergedOptions.disableDevTools) {
            const handleKeyDown = (e: Event) => {
                const keyEvent = e as KeyboardEvent;
                // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
                if (
                    keyEvent.key === 'F12' ||
                    (keyEvent.ctrlKey && keyEvent.shiftKey && keyEvent.key === 'I') ||
                    (keyEvent.ctrlKey && keyEvent.shiftKey && keyEvent.key === 'J') ||
                    (keyEvent.ctrlKey && keyEvent.key === 'u') ||
                    (keyEvent.ctrlKey && keyEvent.key === 'U')
                ) {
                    e.preventDefault();
                    return false;
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            handlers.push({ event: 'keydown', handler: handleKeyDown, target: document });
        }

        // 텍스트 선택 방지 (CSS로도 적용하지만 이벤트로 이중 보안)
        if (mergedOptions.disableSelection) {
            const handleSelectStart = (e: Event) => {
                e.preventDefault();
                return false;
            };
            element.addEventListener('selectstart', handleSelectStart);
            handlers.push({ event: 'selectstart', handler: handleSelectStart, target: element });
        }

        // Cleanup
        return () => {
            handlers.forEach(({ event, handler, target }) => {
                target.removeEventListener(event, handler);
            });
        };
    }, [ref, mergedOptions]);
};

export default useSecureContent;
