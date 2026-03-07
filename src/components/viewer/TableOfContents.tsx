/**
 * 목차 사이드바 컴포넌트
 * 좌측 슬라이딩 출현, 현재 챕터 하이라이트
 */
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  useThemeStore,
  dividerThemeClasses,
  cardThemeClasses,
} from "@/stores/useTheme";
import type { Chapter } from "@/types";

interface TableOfContentsProps {
  chapters: Chapter[];
  currentChapterId: string;
  workTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TableOfContents = ({
  chapters,
  currentChapterId,
  workTitle,
  isOpen,
  onClose,
}: TableOfContentsProps) => {
  const { theme } = useThemeStore();

  // 챕터 번호순 정렬
  const sortedChapters = [...chapters].sort(
    (a, b) => a.chapterNumber - b.chapterNumber,
  );

  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* 사이드바 / 바텀시트 */}
      <aside
        className={cn(
          "fixed z-50 transform transition-transform duration-300 ease-out flex flex-col shadow-2xl",
          // 모바일: 바텀 시트 (하단에서 슬라이드 업)
          "bottom-0 left-0 right-0 w-full h-[85vh] rounded-t-3xl",
          isOpen ? "translate-y-0" : "translate-y-full",
          // 데스크탑: 좌측 사이드바 (좌측에서 슬라이드 인)
          "md:top-0 md:bottom-auto md:w-80 md:h-full md:rounded-none",
          isOpen
            ? "md:translate-y-0 md:translate-x-0"
            : "md:translate-y-0 md:-translate-x-full",
          cardThemeClasses[theme],
        )}
      >
        {/* 모바일용 드래그 핸들 (시각적 표시) */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full mx-auto my-3 md:hidden shrink-0" />

        {/* 헤더 */}
        <div
          className={cn(
            "flex items-center justify-between px-6 pb-4 pt-2 md:pt-6 border-b shrink-0",
            dividerThemeClasses[theme],
          )}
        >
          <h2 className="font-serif font-bold text-lg truncate">{workTitle}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 챕터 목록 */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <ul className={cn("divide-y", dividerThemeClasses[theme])}>
            {sortedChapters.map((chapter) => (
              <li key={chapter.id}>
                <Link
                  to={`/chapters/${chapter.id}`}
                  onClick={onClose}
                  className={cn(
                    "block px-4 py-3 transition-colors font-serif",
                    chapter.id === currentChapterId
                      ? "bg-mocha-400/20 text-mocha-700 font-medium"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800",
                  )}
                >
                  <span className="text-sm opacity-60 mr-2">
                    {chapter.chapterNumber}화
                  </span>
                  <span className="text-sm">{chapter.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default TableOfContents;
