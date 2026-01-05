/**
 * 실시간 순위 컴포넌트
 * 순위 변동 시 롤링 애니메이션 적용
 * 30초마다 자동 갱신
 */
import { useState, useEffect, useRef } from 'react';
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
    const [displayedWorks, setDisplayedWorks] = useState<Work[]>([]);

    // 회차 없는 작품 필터링 (0개인 작품 제외)
    // useDiscovery에서도 필터링하지만 이중 안전장치 및 RankingList 단독 사용 시 대비
    const validWorks = works.filter(w => (w.chapterCount || 0) > 0);

    // 이전 순위 및 위치 추적을 위한 Refs
    const prevWorksRef = useRef<Work[]>([]);
    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const prevRectsRef = useRef<Map<string, DOMRect>>(new Map());

    useEffect(() => {
        // 좋아요 순 정렬
        const sortedWorks = [...validWorks]
            .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
            .slice(0, 10);

        // FLIP 애니메이션 전: 현재 위치(Prev) 저장
        const currentRects = new Map<string, DOMRect>();
        sortedWorks.forEach(work => {
            const el = itemRefs.current.get(work.id);
            if (el) {
                currentRects.set(work.id, el.getBoundingClientRect());
            }
        });

        // 상태 업데이트
        setDisplayedWorks(sortedWorks);

        // FLIP 애니메이션 로직은 useLayoutEffect나 useEffect 이후 실행되도록 해야함
        // 여기서는 데이터 변경 감지 후 requestAnimationFrame으로 처리
        requestAnimationFrame(() => {
            sortedWorks.forEach(work => {
                const el = itemRefs.current.get(work.id);
                const prevRect = prevRectsRef.current.get(work.id);

                if (el && prevRect) {
                    const newRect = el.getBoundingClientRect();
                    const dy = prevRect.top - newRect.top;

                    // 위치가 변했다면 transform으로 보정 후 애니메이션
                    if (dy !== 0) {
                        el.style.transform = `translateY(${dy}px)`;
                        el.style.transition = 'none';

                        requestAnimationFrame(() => {
                            // 트랜지션 적용 및 원래 위치로 이동 (버블 정렬 효과)
                            el.style.transform = '';
                            el.style.transition = 'transform 600ms cubic-bezier(0.19, 1, 0.22, 1)'; // ease-organic
                        });
                    }
                }
            });

            // 현재 위치를 다음 비교를 위해 저장
            // 단, 렌더링 직후 위치를 저장해야 하므로 setTimeout 등으로 큐 뒤로 미룸
            setTimeout(() => {
                const nextRects = new Map<string, DOMRect>();
                sortedWorks.forEach(work => {
                    const el = itemRefs.current.get(work.id);
                    if (el) nextRects.set(work.id, el.getBoundingClientRect());
                });
                prevRectsRef.current = nextRects;
                prevWorksRef.current = sortedWorks;
            }, 0);
        });

    }, [works]); // works 자체가 변경될 때 트리거

    // 아이콘 렌더링 (순위 변동)
    const getRankChangeIcon = (work: Work, currentIndex: number) => {
        if (prevWorksRef.current.length === 0) return <span className="text-mocha-300">-</span>;

        const prevIndex = prevWorksRef.current.findIndex(w => w.id === work.id);

        if (prevIndex === -1) return <span className="text-emerald-500 text-xs font-bold animate-pulse">NEW</span>;
        if (prevIndex > currentIndex) return <span className="text-red-500 font-bold">▲ {prevIndex - currentIndex}</span>;
        if (prevIndex < currentIndex) return <span className="text-blue-500 font-bold">▼ {currentIndex - prevIndex}</span>;

        return <span className="text-mocha-300">-</span>;
    };

    if (displayedWorks.length === 0) return null;

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

            <div className="space-y-2 relative" ref={listRef}>
                {displayedWorks.map((work, index) => (
                    <div
                        key={work.id}
                        ref={el => {
                            if (el) itemRefs.current.set(work.id, el);
                            else itemRefs.current.delete(work.id);
                        }}
                        onClick={() => navigate(`/works/${work.id}`)}
                        className={`
                            flex items-center gap-3 p-3 rounded-lg cursor-pointer
                            hover:bg-mocha-50 dark:hover:bg-zinc-700 
                            transition-colors duration-200
                            will-change-transform
                        `}
                    >
                        <span className={`
                            w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm flex-shrink-0
                            font-heading transition-colors duration-300
                            ${index < 3
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm'
                                : 'bg-mocha-100 dark:bg-zinc-600 text-mocha-600 dark:text-zinc-300'}
                        `}>
                            {index + 1}
                        </span>

                        <span className="w-8 text-center text-xs flex-shrink-0 font-medium">
                            {getRankChangeIcon(work, index)}
                        </span>

                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-ink dark:text-white truncate text-sm font-body">
                                {work.title}
                            </p>
                            <p className="text-xs text-mocha-500 dark:text-zinc-400 truncate">
                                {work.authorNickname || work.author?.nickname || '작가'}
                            </p>
                        </div>

                        <div className="text-right text-xs text-mocha-500 dark:text-zinc-400 flex-shrink-0 flex flex-col items-end">
                            <span className="flex items-center gap-1 font-medium">
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
