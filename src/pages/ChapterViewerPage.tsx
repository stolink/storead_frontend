/**
 * 챕터 뷰어 페이지
 * 전역 테마, 플로팅 리모컨, 페이지/스크롤 모드, 보안 뷰어, 별점, 댓글
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Network,
  Minus,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SecureViewer } from '@/components/viewer/SecureViewer';
import { StarRating } from '@/components/rating/StarRating';
import { CommentList } from '@/components/comments/CommentList';
import { usePublicChapter, usePublicChapters } from '@/hooks/useDiscovery';
import { useChapterRating, useSubmitRating } from '@/hooks/useRating';
import { useSaveBookmark } from '@/hooks/useBookmark';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  useThemeStore,
  themeClasses,
  headerThemeClasses,
  backgroundThemeClasses,
  cardThemeClasses,
  type Theme,
} from '@/stores/useTheme';

type ViewMode = 'scroll' | 'page';
type LineHeight = 1.5 | 1.8 | 2;

/**
 * 챕터 뷰어 페이지 컴포넌트
 */
export const ChapterViewerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  // 뷰어 설정 상태
  const [viewMode, setViewMode] = useState<ViewMode>('scroll');
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState<LineHeight>(1.8);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // 로그인 필수 체크
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/chapters/${id}` } });
    }
  }, [isAuthenticated, id, navigate]);

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
  const prevChapter =
    currentIndex > 0 ? sortedChapters?.[currentIndex - 1] : null;
  const nextChapter =
    sortedChapters && currentIndex < sortedChapters.length - 1
      ? sortedChapters[currentIndex + 1]
      : null;

  // 페이지 모드용 콘텐츠 분할 (간단한 문단 기준)
  const contentPages = chapter?.content?.split('\n\n').filter(Boolean) || [];
  const totalPages = Math.max(1, Math.ceil(contentPages.length / 2));

  // 페이지 이동 함수
  const goToPrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    } else if (prevChapter) {
      navigate(`/chapters/${prevChapter.id}`);
    }
  }, [currentPage, prevChapter, navigate]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    } else if (nextChapter) {
      navigate(`/chapters/${nextChapter.id}`);
    }
  }, [currentPage, totalPages, nextChapter, navigate]);

  // 페이지 모드: 클릭 영역으로 페이지 전환
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (viewMode !== 'page') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const halfWidth = rect.width / 2;

    if (clickX < halfWidth) {
      goToPrevPage();
    } else {
      goToNextPage();
    }
  };

  // 읽은 위치 저장 (스크롤 시)
  useEffect(() => {
    if (!id || !isAuthenticated || viewMode !== 'scroll') return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      saveBookmark.mutate({ chapterId: id, position: scrollPosition });
    };

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
  }, [id, isAuthenticated, viewMode, saveBookmark]);

  // 별점 제출
  const handleRatingChange = (score: number) => {
    if (!id || !isAuthenticated) return;
    submitRating.mutate({ chapterId: id, score });
  };

  // 테마별 스타일
  const bgClass = backgroundThemeClasses[theme];
  const headerClass = headerThemeClasses[theme];
  const cardClass = cardThemeClasses[theme];
  const textClass = themeClasses[theme];

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgClass}`}>
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgClass}`}>
        <p className={textClass}>챕터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bgClass}`}>
      {/* 상단 네비게이션 - 전역 테마 적용 */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-sm border-b transition-colors duration-300 ${headerClass}`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/works/${chapter.workId}`)}
            >
              <Home className="h-5 w-5" />
            </Button>
            <div className={textClass}>
              <p className="text-sm opacity-70">{chapter.chapterNumber}화</p>
              <h1 className="font-semibold truncate max-w-xs">
                {chapter.title}
              </h1>
            </div>
          </div>

          {/* 이전/다음 버튼 (스크롤 모드에서만 표시) */}
          {viewMode === 'scroll' && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!prevChapter}
                onClick={() =>
                  prevChapter && navigate(`/chapters/${prevChapter.id}`)
                }
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!nextChapter}
                onClick={() =>
                  nextChapter && navigate(`/chapters/${nextChapter.id}`)
                }
              >
                다음
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="flex relative">
        {/* 플로팅 리모컨 (우측 고정) */}
        <aside className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden md:block">
          <div className={`border rounded-lg shadow-lg p-4 w-48 transition-colors duration-300 ${cardClass}`}>
            <div className="space-y-4">
              {/* 관계도 버튼 */}
              <button className="w-full flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Network className="w-4 h-4" />
                <span className="text-sm">관계도</span>
              </button>

              {/* 설정 토글 */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showSettings
                    ? 'bg-purple-600 text-white'
                    : theme === 'light'
                      ? 'bg-zinc-100 hover:bg-zinc-200'
                      : theme === 'dark'
                        ? 'bg-zinc-700 hover:bg-zinc-600'
                        : 'bg-amber-100 hover:bg-amber-200'
                  }`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">설정</span>
              </button>

              {/* 설정 패널 */}
              {showSettings && (
                <div className="space-y-4 pt-4 border-t">
                  {/* 글자 크기 */}
                  <div>
                    <label className="text-xs opacity-70 mb-2 block">
                      글자 크기
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setFontSize(Math.max(12, fontSize - 2))
                        }
                        className="p-1 bg-zinc-100 dark:bg-zinc-700 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm flex-1 text-center">
                        {fontSize}px
                      </span>
                      <button
                        onClick={() =>
                          setFontSize(Math.min(24, fontSize + 2))
                        }
                        className="p-1 bg-zinc-100 dark:bg-zinc-700 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* 테마 */}
                  <div>
                    <label className="text-xs opacity-70 mb-2 block">
                      테마
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['light', 'dark', 'sepia'] as Theme[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`px-2 py-1 text-xs rounded transition-colors ${theme === t
                              ? 'bg-purple-600 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-700'
                            }`}
                        >
                          {t === 'light'
                            ? '라이트'
                            : t === 'dark'
                              ? '다크'
                              : '세피아'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 줄 간격 */}
                  <div>
                    <label className="text-xs opacity-70 mb-2 block">
                      줄 간격
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {([1.5, 1.8, 2] as LineHeight[]).map((lh) => (
                        <button
                          key={lh}
                          onClick={() => setLineHeight(lh)}
                          className={`px-2 py-1 text-xs rounded transition-colors ${lineHeight === lh
                              ? 'bg-purple-600 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-700'
                            }`}
                        >
                          {lh}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 뷰어 모드 토글 */}
              <div className="pt-4 border-t">
                <label className="text-xs opacity-70 mb-2 block">
                  뷰어 모드
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setViewMode('scroll')}
                    className={`px-3 py-2 text-xs rounded transition-colors ${viewMode === 'scroll'
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-700'
                      }`}
                  >
                    스크롤
                  </button>
                  <button
                    onClick={() => setViewMode('page')}
                    className={`px-3 py-2 text-xs rounded transition-colors ${viewMode === 'page'
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-700'
                      }`}
                  >
                    페이지
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-12">
          {/* 챕터 제목 */}
          <div className={`mb-8 ${textClass}`}>
            <h1 className="text-3xl font-bold mb-2">
              제{chapter.chapterNumber}장: {chapter.title}
            </h1>
            <p className="opacity-70">작품명 - 작가명</p>
          </div>

          {/* 리더 콘텐츠 */}
          {viewMode === 'scroll' ? (
            // 스크롤 모드
            <div
              className={`rounded-lg p-12 shadow-sm transition-colors duration-300 ${cardClass}`}
              style={{ fontSize: `${fontSize}px`, lineHeight }}
            >
              <SecureViewer content={chapter.content} className="mb-8" />
            </div>
          ) : (
            // 페이지 모드 - 클릭 영역으로 페이지 전환
            <div className="relative">
              <div
                onClick={handlePageClick}
                className={`grid grid-cols-2 gap-8 cursor-pointer select-none rounded-lg p-8 shadow-sm transition-colors duration-300 min-h-[60vh] ${cardClass}`}
                style={{ fontSize: `${fontSize}px`, lineHeight }}
                title="좌측 클릭: 이전 페이지 / 우측 클릭: 다음 페이지"
              >
                {/* 왼쪽 페이지 */}
                <div className={textClass}>
                  {contentPages.slice(currentPage * 2, currentPage * 2 + 1).map((p, i) => (
                    <p key={i} className="mb-4">
                      {p}
                    </p>
                  ))}
                </div>
                {/* 오른쪽 페이지 */}
                <div className={textClass}>
                  {contentPages.slice(currentPage * 2 + 1, currentPage * 2 + 2).map((p, i) => (
                    <p key={i} className="mb-4">
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              {/* 페이지 표시 */}
              <div className="flex justify-center items-center mt-4">
                <span className={`text-sm ${textClass} opacity-70`}>
                  {currentPage + 1} / {totalPages}
                </span>
              </div>

              {/* 클릭 안내 오버레이 */}
              <div className="absolute inset-0 pointer-events-none flex">
                <div className="w-1/2 flex items-center justify-start pl-4 opacity-0 hover:opacity-30 transition-opacity">
                  <ChevronLeft className="w-12 h-12 text-zinc-500" />
                </div>
                <div className="w-1/2 flex items-center justify-end pr-4 opacity-0 hover:opacity-30 transition-opacity">
                  <ChevronRight className="w-12 h-12 text-zinc-500" />
                </div>
              </div>
            </div>
          )}

          {/* 하단 액션 영역 */}
          <div className={`rounded-lg p-6 mb-8 shadow mt-8 transition-colors duration-300 ${cardClass}`}>
            {/* 별점 */}
            <div className="mb-6">
              <h3 className={`font-semibold mb-3 ${textClass}`}>
                이 회차의 별점을 남겨주세요
              </h3>
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <StarRating
                    value={rating?.myRating ?? 0}
                    onChange={handleRatingChange}
                    size="lg"
                  />
                  {rating?.myRating && (
                    <span className="text-sm opacity-70">
                      내 별점: {rating.myRating}점
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm opacity-70">
                  별점을 남기려면 로그인하세요.
                </p>
              )}

              {/* 평균 별점 */}
              <div className="mt-3 flex items-center gap-2 text-sm opacity-70">
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
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => navigate(`/chapters/${nextChapter.id}`)}
              >
                다음 화 보기
                <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            )}
          </div>

          {/* 댓글 */}
          <div className={`rounded-lg p-6 shadow transition-colors duration-300 ${cardClass}`}>
            <CommentList chapterId={id || ''} />
          </div>
        </main>
      </div>

      {/* 플로팅 바 (모바일) */}
      <div className={`fixed bottom-0 left-0 right-0 md:hidden border-t p-3 transition-colors duration-300 ${cardClass}`}>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={!prevChapter && currentPage === 0}
            onClick={goToPrevPage}
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
            disabled={!nextChapter && currentPage >= totalPages - 1}
            onClick={goToNextPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChapterViewerPage;
