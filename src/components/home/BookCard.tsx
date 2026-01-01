/**
 * 북 카드 컴포넌트
 * 작품 표지와 제목을 표시하는 카드
 */
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import type { Work } from '@/types';

interface BookCardProps {
    work: Work;
    category?: string;
}

export function BookCard({ work, category }: BookCardProps) {
    return (
        <Link to={`/works/${work.id}`} className="group cursor-pointer">
            {/* 표지 이미지 (3:4 비율) */}
            <div className="relative aspect-[3/4] bg-zinc-200 rounded-lg overflow-hidden mb-3 shadow-md hover:shadow-xl transition-shadow">
                {work.coverImageUrl ? (
                    <img
                        src={work.coverImageUrl}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-300 to-zinc-400 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-zinc-500" />
                    </div>
                )}
                {/* 카테고리 배지 */}
                {category && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                        <span className="text-sm text-zinc-700">{category}</span>
                    </div>
                )}
            </div>
            {/* 제목 */}
            <div className="px-2">
                <h3 className="text-zinc-900 mb-1 line-clamp-2 group-hover:text-zinc-700 transition-colors font-medium">
                    {work.title}
                </h3>
                {work.author?.nickname && (
                    <p className="text-sm text-zinc-500">{work.author.nickname}</p>
                )}
            </div>
        </Link>
    );
}

export default BookCard;
