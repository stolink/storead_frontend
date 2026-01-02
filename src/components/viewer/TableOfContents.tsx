/**
 * 목차 사이드바 컴포넌트
 * 좌측 슬라이딩 출현, 현재 챕터 하이라이트
 */
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    useThemeStore,
    dividerThemeClasses,
    cardThemeClasses,
} from '@/stores/useTheme';
import type { Chapter } from '@/types';

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
        (a, b) => a.chapterNumber - b.chapterNumber
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

            {/* 사이드바 */}
            <aside
                className={cn(
                    'fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300 ease-out',
                    cardThemeClasses[theme],
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* 헤더 */}
                <div
                    className={cn(
                        'flex items-center justify-between p-4 border-b',
                        dividerThemeClasses[theme]
                    )}
                >
                    <h2 className="font-serif font-bold text-lg truncate">
                        {workTitle}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 챕터 목록 */}
                <div className="overflow-y-auto h-[calc(100%-60px)]">
                    <ul className={cn('divide-y', dividerThemeClasses[theme])}>
                        {sortedChapters.map((chapter) => (
                            <li key={chapter.id}>
                                <Link
                                    to={`/chapters/${chapter.id}`}
                                    onClick={onClose}
                                    className={cn(
                                        'block px-4 py-3 transition-colors font-serif',
                                        chapter.id === currentChapterId
                                            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium'
                                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
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
