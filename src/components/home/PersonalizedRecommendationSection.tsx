/**
 * 취향 저격 추천 섹션 컴포넌트
 * 
 * 사용자가 읽은 작품의 태그를 분석하여 유사한 작품을 추천합니다.
 * 고정 그리드 형태로 6개 표시합니다.
 */
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTagBasedRecommendations } from '@/hooks/useDiscovery';
import { BookCard } from '@/components/home/BookCard';
import { GENRE_LABELS } from '@/constants/genres';

export function PersonalizedRecommendationSection() {
    const { data: recommendations, isLoading } = useTagBasedRecommendations();

    // 추천 작품이 없으면 섹션 숨김
    if (!recommendations || recommendations.length === 0) {
        return null;
    }

    // 최대 6개까지만 표시 (고정 레이아웃)
    const displayItems = recommendations.slice(0, 6);

    return (
        <section className="py-8">
            {/* 섹션 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        취향 저격 추천작
                    </h2>
                </div>
                {/* More 링크 */}
                <Link to="/category/ALL?sort=popular" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors">
                    More &gt;
                </Link>
            </div>

            {/* 추천 이유 태그 */}
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                당신이 좋아하는 장르와 비슷한 작품들을 모았어요 ✨
            </p>

            {/* 로딩 상태 */}
            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-[2/3] bg-zinc-200 rounded-lg mb-3" />
                            <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-zinc-200 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : (
                /* 고정 그리드 컨테이너 (6개) */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {displayItems.map((work) => (
                        <div key={work.id}>
                            <BookCard
                                work={work}
                                category={GENRE_LABELS[work.genre] || work.genre}
                                showQuickActions={true}
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default PersonalizedRecommendationSection;
