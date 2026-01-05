/**
 * 실시간 순위 컴포넌트
 * 순위 변동 시 롤링 애니메이션 적용
 * 30초마다 자동 갱신
 */
import { useMemo, useLayoutEffect, useRef } from 'react';
import type { Work } from '@/types';
import { RankingItem } from './RankingItem';

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
// navigate removed
export const RankingList = ({ works, title = '실시간 인기 순위' }: RankingListProps) => {

    // 1. Memoize sorted works (works passed are assumed to be valid/filtered)
    // 데이터 변경 시에만 재정렬 수행
    const sortedWorks = useMemo(() => {
        return [...works]
            .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
            .slice(0, 10);
    }, [works]);

    const prevWorksRef = useRef<Work[]>([]);
    const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const prevRectsRef = useRef<Map<string, DOMRect>>(new Map());

    // 2. FLIP Animation using useLayoutEffect
    // DOM 업데이트 후 브라우저 페인팅 전에 실행되어 깜빡임 방지
    useLayoutEffect(() => {
        const currentRects = new Map<string, DOMRect>();

        // Measure new positions
        sortedWorks.forEach(work => {
            const el = itemRefs.current.get(work.id);
            if (el) {
                currentRects.set(work.id, el.getBoundingClientRect());
            }
        });

        // Calculate and apply transforms
        sortedWorks.forEach(work => {
            const el = itemRefs.current.get(work.id);
            const prevRect = prevRectsRef.current.get(work.id);

            if (el && prevRect) {
                const newRect = currentRects.get(work.id);
                if (newRect) {
                    const dy = prevRect.top - newRect.top;

                    // 위치가 변했다면 Invert (이전 위치로 강제 이동 및 트랜지션 제거)
                    if (dy !== 0) {
                        el.style.transform = `translateY(${dy}px)`;
                        el.style.transition = 'none';

                        // Play (다음 프레임에 원래 위치로 이동 및 트랜지션 복구)
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                el.style.transform = '';
                                el.style.transition = ''; // CSS 클래스(duration-600 ease-organic) 적용
                            });
                        });
                    }
                }
            }
        });

        // Save current rects and works for next comparison
        prevRectsRef.current = currentRects;
        prevWorksRef.current = sortedWorks;

    }, [sortedWorks]);

    // Rank change icon logic
    const getRankChangeIcon = (workId: string, currentIndex: number) => {
        if (prevWorksRef.current.length === 0) return <span className="text-mocha-300">-</span>;

        const prevIndex = prevWorksRef.current.findIndex(w => w.id === workId);
        if (prevIndex === -1) return <span className="text-emerald-500 text-xs font-bold animate-pulse">NEW</span>;

        if (prevIndex > currentIndex) return <span className="text-red-500 font-bold">▲ {prevIndex - currentIndex}</span>;
        if (prevIndex < currentIndex) return <span className="text-blue-500 font-bold">▼ {currentIndex - prevIndex}</span>;

        return <span className="text-mocha-300">-</span>;
    };

    if (sortedWorks.length === 0) return null;

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 sticky top-24 transition-colors duration-300 border border-border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-bold text-ink dark:text-white">{title}</h3>
                <span className="text-xs text-mocha-400 dark:text-zinc-500 flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    실시간
                </span>
            </div>

            <div className="space-y-2 relative">
                {sortedWorks.map((work, index) => (
                    <RankingItem
                        key={work.id}
                        ref={el => {
                            if (el) itemRefs.current.set(work.id, el);
                            else itemRefs.current.delete(work.id);
                        }}
                        work={work}
                        index={index}
                        rankChange={getRankChangeIcon(work.id, index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default RankingList;
