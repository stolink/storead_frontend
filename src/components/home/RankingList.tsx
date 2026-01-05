/**
 * 실시간 순위 컴포넌트
 * 순위 변동 시 롤링 애니메이션 적용
 * 30초마다 자동 갱신
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Work } from '@/types';

interface RankingListProps {
    works: Work[];
    title?: string;
}

/**
 * 실시간 인기 순위 컴포넌트
 * - likeCount 기준 정렬
 * - 순위 변동 시 하이라이트 애니메이션
 * - 상위 3위 골드 배경
 */
export const RankingList = ({ works, title = '실시간 인기 순위' }: RankingListProps) => {
    const navigate = useNavigate();
    const [animatingIndices, setAnimatingIndices] = useState<Set<number>>(new Set());
    const prevWorksRef = useRef<Work[]>([]);

    // 좋아요 기준으로 정렬 후 상위 10개 선택
    const sortedWorks = useMemo(() => {
        return [...works].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0)).slice(0, 10);
    }, [works]);

    useEffect(() => {
        // 순위 변동 감지 및 애니메이션
        if (prevWorksRef.current.length > 0) {
            const newAnimating = new Set<number>();

            sortedWorks.forEach((work, index) => {
                const prevIndex = prevWorksRef.current.findIndex(w => w.id === work.id);
                // 순위가 변경되었거나 새로 진입한 경우 애니메이션
                if (prevIndex !== index) {
                    newAnimating.add(index);
                }
            });

            if (newAnimating.size > 0) {
                setAnimatingIndices(newAnimating);
                // 500ms 후 애니메이션 해제
                const timer = setTimeout(() => setAnimatingIndices(new Set()), 500);
                return () => clearTimeout(timer);
            }
        }

        prevWorksRef.current = sortedWorks;
    }, [sortedWorks]);

    /**
     * 순위 변동 아이콘 렌더링
     * - NEW: 새로 진입
     * - ▲: 순위 상승
     * - ▼: 순위 하락
     * - -: 변동 없음
     */
    const getRankChangeIcon = (work: Work, currentIndex: number) => {
        if (prevWorksRef.current.length === 0) {
            return <span className="text-gray-400">-</span>;
        }

        const prevIndex = prevWorksRef.current.findIndex(w => w.id === work.id);

        if (prevIndex === -1) {
            return <span className="text-emerald-500 text-xs font-bold">NEW</span>;
        }
        if (prevIndex > currentIndex) {
            return <span className="text-red-500">▲</span>;
        }
        if (prevIndex < currentIndex) {
            return <span className="text-blue-500">▼</span>;
        }
        return <span className="text-gray-400">-</span>;
    };

    if (sortedWorks.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 sticky top-24">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-ink dark:text-white">{title}</h3>
                <span className="text-xs text-mocha-400 dark:text-zinc-500">
                    30초마다 갱신
                </span>
            </div>

            {/* 순위 리스트 */}
            <div className="space-y-2">
                {sortedWorks.map((work, index) => (
                    <div
                        key={work.id}
                        onClick={() => navigate(`/works/${work.id}`)}
                        className={`
              flex items-center gap-3 p-3 rounded-lg cursor-pointer
              hover:bg-mocha-100 dark:hover:bg-zinc-700 
              transition-all duration-300 ease-in-out
              ${animatingIndices.has(index)
                                ? 'bg-yellow-50 dark:bg-yellow-900/20 scale-[1.02] shadow-md'
                                : ''}
            `}
                    >
                        {/* 순위 번호 - 상위 3위 골드 배경 */}
                        <span className={`
              w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm flex-shrink-0
              ${index < 3
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm'
                                : 'bg-mocha-100 dark:bg-zinc-600 text-mocha-600 dark:text-zinc-300'}
            `}>
                            {index + 1}
                        </span>

                        {/* 순위 변동 표시 */}
                        <span className="w-8 text-center text-sm flex-shrink-0">
                            {getRankChangeIcon(work, index)}
                        </span>

                        {/* 작품 정보 */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-ink dark:text-white truncate text-sm">
                                {work.title}
                            </p>
                            <p className="text-xs text-mocha-500 dark:text-zinc-400 truncate">
                                {work.authorNickname || '작가'}
                            </p>
                        </div>

                        {/* 좋아요 수 */}
                        <div className="text-right text-xs text-mocha-500 dark:text-zinc-400 flex-shrink-0">
                            <span className="flex items-center gap-1">
                                ❤️ {work.likeCount || 0}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RankingList;
