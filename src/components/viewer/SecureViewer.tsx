/**
 * 보안 뷰어 컴포넌트
 * 텍스트 무단 복사 방지 (설정 UI 제거 - 외부에서 제어)
 */
import { useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useSecureContent } from "@/hooks/useSecureContent";
import { MessageSquarePlus } from "lucide-react";

interface SecureViewerProps {
  /** 본문 콘텐츠 (HTML 또는 텍스트) */
  content: string;
  /** HTML로 렌더링할지 여부 */
  isHtml?: boolean;
  /** 추가 클래스 */
  className?: string;
  /** 인라인 댓글 클릭 핸들러 */
  onCommentClick?: (paragraphIndex: number, text: string) => void;
  /** 단락별 댓글 수 맵 */
  commentCounts?: Record<number, number>;
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
  onCommentClick,
  commentCounts = {},
}: SecureViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  // 보안 훅 적용
  useSecureContent(viewerRef);

  // 단락별로 분할 (단순 개행 기준 프로토타입)
  const paragraphs = useMemo(() => {
    if (!content) return [];
    // <br /> 또는 \n 기반으로 분할 시도
    return content.split(/<br\s*\/?>|\n/gi).filter((p) => p.trim().length > 0);
  }, [content]);

  // HTML 태그 제거 및 텍스트 추출 헬퍼
  const getPlainText = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  return (
    <div
      ref={viewerRef}
      className={cn("select-none space-y-4", className)}
      style={{
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {paragraphs.length > 0 ? (
        paragraphs.map((para, idx) => (
          <div
            key={idx}
            className="group relative pr-8 transition-colors duration-200"
          >
            {isHtml ? (
              <div
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: para }}
              />
            ) : (
              <div className="whitespace-pre-wrap break-words">{para}</div>
            )}

            {/* 인라인 댓글 트리거 */}
            <button
              onClick={() => onCommentClick?.(idx, getPlainText(para))}
              className="absolute right-0 top-1 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded-md hover:bg-mocha-100 dark:hover:bg-zinc-800 text-mocha-400 hover:text-mocha-600 flex items-center gap-1"
            >
              <MessageSquarePlus className="w-4 h-4" />
              {commentCounts[idx] > 0 && (
                <span className="text-[10px] font-bold">
                  {commentCounts[idx]}
                </span>
              )}
            </button>
          </div>
        ))
      ) : (
        <div className="text-center opacity-30 py-8">내용이 없습니다.</div>
      )}
    </div>
  );
};

export default SecureViewer;
