import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { BookCard } from './BookCard';
import type { Work } from '@/types';
import { useDiscoveryWorks } from '@/hooks/useDiscovery';

interface WorkGridSectionProps {
    title: string;
    genre?: string; // e.g. 'FANTASY'
    limit?: number;
    moreLink?: string;
    works?: Work[]; // Directly provided works (optional)
}

/**
 * 작품 그리드 섹션 컴포넌트
 * - 6열 반응형 그리드 레이아웃
 * - providedWorks가 없을 때만 API 호출 (성능 최적화)
 */
export const WorkGridSection = ({ title, genre, limit = 6, moreLink, works: providedWorks }: WorkGridSectionProps) => {
    const navigate = useNavigate();

    // providedWorks가 없을 때만 API 호출 (TanStack Query enabled 옵션 활용)
    const { data: fetchedData, isLoading } = useDiscoveryWorks({
        genre: genre,
        limit: limit,
        sort: 'latest',
        enabled: !providedWorks // providedWorks가 있으면 API 호출 비활성화
    });

    const works = providedWorks || fetchedData?.data || [];


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
                        <h2 className="text-2xl font-heading font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-mocha-600 transition-colors">
                            {title}
                        </h2>
                        {moreLink && (
                            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-mocha-600 transition-colors mt-0.5" />
                        )}
                    </div>
                </div>

                {/* 고정 6열 그리드 (Most Popular와 동일한 레이아웃) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {works.slice(0, limit).map((work) => (
                        <div key={work.id}>
                            <BookCard work={work} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
