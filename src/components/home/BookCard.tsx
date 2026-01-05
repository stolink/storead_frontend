/**
 * 북 카드 컴포넌트
 * 작품 표지와 제목을 표시하는 카드
 * 
 * 기능:
 * - 호버 시 퀵 액션 오버레이 표시 (관심 등록, 첫 화 보기)
 * - 장르 태그 Glassmorphism 효과로 가독성 개선
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Heart, Play } from 'lucide-react';
import type { Work } from '@/types';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAuthModalStore } from '@/stores/useAuthModalStore';
import { useToggleWorkLike, useWorkLike } from '@/hooks/useWorkLike';
// import { useAddToLibrary, useIsInLibrary } from '@/hooks/useLibrary';
import { Button } from '@/components/ui/button';

// 장르 레이블 매핑
const GENRE_LABELS: Record<string, string> = {
    FANTASY: '판타지',
    ROMANCE: '로맨스',
    MARTIAL_ARTS: '무협',
    THRILLER: '스릴러',
    SF: 'SF',
    DRAMA: '드라마',
};

interface BookCardProps {
    work: Work;
    category?: string;
    showQuickActions?: boolean; // 퀵 액션 오버레이 표시 여부
}

export function BookCard({ work, category, showQuickActions = true }: BookCardProps) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const { openAuthModal } = useAuthModalStore();
    const [isHovered, setIsHovered] = useState(false);

    // 좋아요 및 서재 상태
    const { data: likeStatus } = useWorkLike(work.id);
    const toggleWorkLike = useToggleWorkLike();

    // 장르 레이블 (category가 있으면 그것을, 없으면 work.genre 사용)
    const genreLabel = category || (work.genre ? GENRE_LABELS[work.genre] || work.genre : null);

    // 관심 등록 (좋아요) 핸들러 - 서재와 분리하여 순수 좋아요 기능으로 변경
    const handleQuickLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            openAuthModal(window.location.pathname);
            return;
        }

        toggleWorkLike.mutate(work.id);
    };

    // 첫 화 보기 핸들러
    const handleFirstChapter = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            openAuthModal(window.location.pathname);
            return;
        }

        // 작품 상세 페이지로 이동 (첫 화는 상세페이지에서 선택)
        navigate(`/works/${work.id}`);
    };

    return (
        <Link
            to={`/works/${work.id}`}
            className="group cursor-pointer block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 표지 이미지 (3:4 비율) */}
            <div className="relative aspect-[3/4] bg-zinc-200 rounded-lg overflow-hidden mb-3 shadow-md hover:shadow-xl transition-all duration-300">
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

                {/* 장르 태그 - Glassmorphism 효과로 가독성 개선 */}
                <div className="absolute top-3 left-3 flex gap-1 z-10">
                    {genreLabel && (
                        <div
                            className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                            style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(4px)',
                                color: '#3D302A',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            {genreLabel}
                        </div>
                    )}
                </div>

                {/* 상태 배지 (HOT, NEW) */}
                <div className="absolute top-3 right-3 flex flex-col gap-1 z-10 pointer-events-none">
                    {/* HOT Badge: likes > 50 (임시 기준) */}
                    {(work.likeCount || 0) >= 50 && (
                        <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                            HOT
                        </div>
                    )}
                    {/* NEW Badge: created within 7 days */}
                    {new Date(work.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                        <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            NEW
                        </div>
                    )}
                </div>

                {/* 퀵 액션 오버레이 - 호버 시 표시 */}
                {showQuickActions && (
                    <div
                        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        {/* 하단 그라데이션 배경 */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.5) 40%, transparent 100%)'
                            }}
                        />

                        {/* 액션 버튼들 */}
                        <div className="relative z-10 p-3 flex gap-2">
                            {/* 관심 등록 버튼 */}
                            <Button
                                size="sm"
                                variant="secondary"
                                className={`h-9 w-9 p-0 rounded-full transition-colors ${likeStatus?.isLiked
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-white/90 hover:bg-white text-zinc-700'
                                    }`}
                                onClick={handleQuickLike}
                            >
                                <Heart
                                    className={`w-4 h-4 ${likeStatus?.isLiked ? 'fill-current' : ''
                                        }`}
                                />
                            </Button>

                            {/* 첫 화 보기 버튼 */}
                            <Button
                                size="sm"
                                className="flex-1 h-9 bg-mocha-500 hover:bg-mocha-600 text-white font-medium text-sm rounded-full"
                                onClick={handleFirstChapter}
                            >
                                <Play className="w-4 h-4 mr-1.5 fill-current" />
                                첫 화 보기
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* 제목 */}
            <div className="px-2">
                <h3 className="text-zinc-900 mb-1 line-clamp-2 group-hover:text-zinc-700 transition-colors font-medium">
                    {work.title}
                </h3>
                {(work.author?.nickname || work.authorNickname) && (
                    <p className="text-sm text-zinc-500">
                        {work.author?.nickname || work.authorNickname}
                    </p>
                )}
            </div>
        </Link>
    );
}

export default BookCard;
