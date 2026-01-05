/**
 * 읽던 작품 섹션 컴포넌트
 * 
 * "[사용자 이름] 님이 읽던 작품" 섹션
 * 가로 스크롤 형태로 읽다가 중단한 작품들을 표시합니다.
 */
import { Link } from 'react-router-dom';
import { BookOpen, Play } from 'lucide-react';
import { useContinueReading } from '@/hooks/useDiscovery';
import { useAuthStore } from '@/stores/useAuthStore';
// import { Button } from '@/components/ui/button';
import type { Work } from '@/types';

// 진행률 표시 컴포넌트
function ProgressBar({ progress }: { progress: number }) {
    return (
        <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
            <div
                className="h-full bg-mocha-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
        </div>
    );
}

export function ContinueReadingSection() {
    const { user } = useAuthStore();
    const { data: continueReadingItems, isLoading } = useContinueReading();

    // 읽던 작품이 없으면 섹션 숨김
    if (!continueReadingItems || continueReadingItems.length === 0) {
        return null;
    }

    // 사용자 이름 (없으면 기본값)
    const userName = user?.nickname || '회원';

    // 최대 4개까지만 표시 (고정 레이아웃)
    const displayItems = continueReadingItems.slice(0, 4);

    return (
        <section className="py-8 border-b border-zinc-100 dark:border-zinc-800">
            {/* 섹션 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    <span className="text-mocha-600">{userName}</span> 님이 읽던 작품
                </h2>
            </div>

            {/* 로딩 상태 */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-[4/3] bg-zinc-200 rounded-lg mb-3" />
                            <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-zinc-200 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : (
                /* 고정 그리드 컨테이너 */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayItems.map((item) => (
                        <div key={item.id} className="w-full">
                            <ContinueReadingCard
                                work={item.work}
                                lastChapterId={item.lastChapterId}
                                lastChapterNumber={item.lastChapterNumber}
                                progress={item.progress}
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

// 읽던 작품 카드 컴포넌트
interface ContinueReadingCardProps {
    work: Work;
    lastChapterId: string;
    lastChapterNumber: number;
    progress: number;
}

function ContinueReadingCard({
    work,
    lastChapterId,
    lastChapterNumber,
    progress
}: ContinueReadingCardProps) {
    return (
        <div className="w-full group">
            {/* 표지 이미지 */}
            <Link
                to={`/chapters/${lastChapterId}`}
                className="block relative aspect-[4/3] bg-zinc-200 rounded-lg overflow-hidden mb-3 shadow-md hover:shadow-xl transition-all duration-300"
            >
                {work.coverImageUrl ? (
                    <img
                        src={work.coverImageUrl}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-mocha-400 to-mocha-700 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-white/60" />
                    </div>
                )}

                {/* 이어보기 오버레이 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white rounded-full p-3 shadow-lg">
                            <Play className="h-6 w-6 text-mocha-600 fill-mocha-600" />
                        </div>
                    </div>
                </div>

                {/* 현재 진행 화수 표시 */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-md">
                    제{lastChapterNumber}화
                </div>
            </Link>

            {/* 작품 정보 */}
            <div className="px-1">
                <Link to={`/works/${work.id}`}>
                    <h3 className="font-medium text-zinc-900 line-clamp-1 group-hover:text-mocha-600 transition-colors">
                        {work.title}
                    </h3>
                </Link>

                {/* 진행률 바 */}
                <div className="mt-2">
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                        <span>진행률</span>
                        <span>{progress}%</span>
                    </div>
                    <ProgressBar progress={progress} />
                </div>
            </div>
        </div>
    );
}

export default ContinueReadingSection;
