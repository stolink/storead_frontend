import { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { BookCard } from './BookCard';
import type { Work } from '@/types';
import { useDiscoveryWorks } from '@/hooks/useDiscovery';

interface WorkListRowProps {
    title: string;
    genre?: string; // e.g. 'FANTASY'
    limit?: number;
    moreLink?: string;
    works?: Work[]; // Directly provided works (optional)
}

export const WorkListRow = ({ title, genre, limit = 10, moreLink, works: providedWorks }: WorkListRowProps) => {
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // If works are not provided, fetch them based on genre
    // 참고: sort=popular (likeCount 정렬)이 현재 백엔드에서 500 에러 발생
    //       -> 임시로 latest(createdAt)로 변경하여 사용
    const { data: fetchedData, isLoading } = useDiscoveryWorks({
        genre: genre,
        limit: limit,
        sort: 'latest' // 'popular' 사용 시 likeCount 정렬 문제로 500 에러
    });

    const works = providedWorks || fetchedData?.data || [];

    // 수평 스크롤 휠 핸들러 (passive: false로 등록하여 preventDefault 가능)
    const handleWheel = useCallback((e: WheelEvent) => {
        const container = scrollContainerRef.current;
        if (!container || e.deltaY === 0) return;

        // 스크롤 끝에 도달했는지 확인
        const isAtStart = container.scrollLeft === 0;
        const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth;

        // 스크롤 방향에 따라 끝에 도달하지 않았을 때만 preventDefault
        const isScrollingRight = e.deltaY > 0;
        const isScrollingLeft = e.deltaY < 0;

        const shouldPrevent =
            (isScrollingRight && !isAtEnd) ||
            (isScrollingLeft && !isAtStart);

        if (shouldPrevent) {
            e.preventDefault();
            container.scrollLeft += e.deltaY;
        }
    }, []);

    // addEventListener로 passive: false 옵션 적용
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [handleWheel]);

    if (!works || works.length === 0) {
        if (isLoading) return <div className="py-8 animate-pulse bg-zinc-100 dark:bg-zinc-800 h-[300px] rounded-lg mb-8" />;
        return null;
    }

    return (
        <section className="py-6 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between mb-4">
                    <div
                        onClick={() => moreLink && navigate(moreLink)}
                        className={moreLink ? "cursor-pointer group flex items-center gap-1" : ""}
                    >
                        <h2 className="text-xl font-heading font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-mocha-600 transition-colors">
                            {title}
                        </h2>
                        {moreLink && (
                            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-mocha-600 transition-colors mt-0.5" />
                        )}
                    </div>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    {works.map((work) => (
                        <div key={work.id} className="w-[160px] flex-shrink-0">
                            <BookCard work={work} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
