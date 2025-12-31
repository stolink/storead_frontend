/**
 * 챕터 뷰어 페이지
 * 보안 뷰어, 별점, 댓글
 */
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SecureViewer } from '@/components/viewer/SecureViewer';
import { StarRating } from '@/components/rating/StarRating';
import { CommentList } from '@/components/comments/CommentList';
import { usePublicChapter, usePublicChapters } from '@/hooks/useDiscovery';
import { useChapterRating, useSubmitRating } from '@/hooks/useRating';
import { useSaveBookmark } from '@/hooks/useBookmark';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect } from 'react';

/**
 * 챕터 뷰어 페이지 컴포넌트
 */
export const ChapterViewerPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    const { data: chapter, isLoading } = usePublicChapter(id || '');
    const { data: chapters } = usePublicChapters(chapter?.workId || '');
    const { data: rating } = useChapterRating(id || '');
    const submitRating = useSubmitRating();
    const saveBookmark = useSaveBookmark();

    // 현재/이전/다음 챕터 찾기
    const sortedChapters = chapters?.sort(
        (a, b) => a.chapterNumber - b.chapterNumber
    );
    const currentIndex = sortedChapters?.findIndex((c) => c.id === id) ?? -1;
    const prevChapter = currentIndex > 0 ? sortedChapters?.[currentIndex - 1] : null;
    const nextChapter =
        sortedChapters && currentIndex < sortedChapters.length - 1
            ? sortedChapters[currentIndex + 1]
            : null;

    // 읽은 위치 저장 (스크롤 시)
    useEffect(() => {
        if (!id || !isAuthenticated) return;

        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            saveBookmark.mutate({ chapterId: id, position: scrollPosition });
        };

        // 디바운스 처리
        let timeoutId: ReturnType<typeof setTimeout>;
        const debouncedScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleScroll, 1000);
        };

        window.addEventListener('scroll', debouncedScroll);
        return () => {
            window.removeEventListener('scroll', debouncedScroll);
            clearTimeout(timeoutId);
        };
    }, [id, isAuthenticated, saveBookmark]);

    // 별점 제출
    const handleRatingChange = (score: number) => {
        if (!id || !isAuthenticated) return;
        submitRating.mutate({ chapterId: id, score });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!chapter) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                <p>챕터를 찾을 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
            {/* 상단 네비게이션 */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/works/${chapter.workId}`)}
                        >
                            <Home className="h-5 w-5" />
                        </Button>
                        <div>
                            <p className="text-sm text-zinc-500">{chapter.chapterNumber}화</p>
                            <h1 className="font-semibold truncate max-w-xs">{chapter.title}</h1>
                        </div>
                    </div>

                    {/* 이전/다음 */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!prevChapter}
                            onClick={() => prevChapter && navigate(`/chapters/${prevChapter.id}`)}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            이전
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!nextChapter}
                            onClick={() => nextChapter && navigate(`/chapters/${nextChapter.id}`)}
                        >
                            다음
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* 본문 (보안 뷰어) */}
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <SecureViewer content={chapter.content} className="mb-8" />

                {/* 하단 액션 영역 */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 mb-8 shadow">
                    {/* 별점 */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-3">이 회차의 별점을 남겨주세요</h3>
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <StarRating
                                    value={rating?.myRating ?? 0}
                                    onChange={handleRatingChange}
                                    size="lg"
                                />
                                {rating?.myRating && (
                                    <span className="text-sm text-zinc-500">
                                        내 별점: {rating.myRating}점
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-500">
                                별점을 남기려면 로그인하세요.
                            </p>
                        )}

                        {/* 평균 별점 */}
                        <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
                            <span>평균</span>
                            <StarRating
                                value={rating?.avgRating ?? 0}
                                readOnly
                                size="sm"
                                showScore
                                ratingCount={rating?.ratingCount}
                            />
                        </div>
                    </div>

                    {/* 다음화 버튼 */}
                    {nextChapter && (
                        <Button
                            size="lg"
                            className="w-full"
                            onClick={() => navigate(`/chapters/${nextChapter.id}`)}
                        >
                            다음 화 보기
                            <ChevronRight className="h-5 w-5 ml-1" />
                        </Button>
                    )}
                </div>

                {/* 댓글 */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow">
                    <CommentList chapterId={id || ''} />
                </div>
            </main>

            {/* 플로팅 바 (모바일) */}
            <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-3">
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!prevChapter}
                        onClick={() => prevChapter && navigate(`/chapters/${prevChapter.id}`)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <StarRating
                        value={rating?.myRating ?? 0}
                        onChange={isAuthenticated ? handleRatingChange : undefined}
                        readOnly={!isAuthenticated}
                        size="sm"
                    />

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!nextChapter}
                        onClick={() => nextChapter && navigate(`/chapters/${nextChapter.id}`)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChapterViewerPage;
