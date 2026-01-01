/**
 * 콘텐츠 그리드 컴포넌트
 * 인기 작품들을 그리드 형태로 표시
 */
import { BookCard } from './BookCard';
import type { Work } from '@/types';

interface ContentGridProps {
    works: Work[];
    title?: string;
}

export function ContentGrid({ works, title = '인기 콘텐츠' }: ContentGridProps) {
    if (!works || works.length === 0) {
        return (
            <section className="container mx-auto px-6 py-12">
                <h2 className="text-3xl font-bold text-zinc-900 mb-8">{title}</h2>
                <div className="text-center py-16 text-zinc-500">
                    작품이 없습니다.
                </div>
            </section>
        );
    }

    return (
        <section className="container mx-auto px-6 py-12">
            <h2 className="text-3xl font-bold text-zinc-900 mb-8">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {works.map((work) => (
                    <BookCard key={work.id} work={work} />
                ))}
            </div>
        </section>
    );
}

export default ContentGrid;
