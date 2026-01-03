/**
 * 챕터 뷰어 페이지 (e-Reader 스타일)
 *
 * 미니멀 헤더 + BookReaderModal 스타일 본문 구조:
 * - 스크롤 모드: 정교한 여백의 article 구조
 * - 책 모드: CSS columnCount 2단 + columnRule 중앙 구분선
 * - 클릭 영역으로 페이지 전환 (시각적 피드백)
 */
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  MessageCircle,
  Menu,
  Minus,
  Plus,
  Network,
  BookOpen,
  ScrollText,
  Library,
  Star,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SecureViewer } from "@/components/viewer/SecureViewer";
import { TableOfContents } from "@/components/viewer/TableOfContents";
import { GraphModal } from "@/components/viewer/GraphModal";
import {
  usePublicChapter,
  usePublicChapters,
  usePublicWork,
} from "@/hooks/useDiscovery";
import { useSaveBookmark } from "@/hooks/useBookmark";
import { useChapterRating, useSubmitRating } from "@/hooks/useRating";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { useThemeStore, type Theme } from "@/stores/useTheme";
import { cn } from "@/lib/utils";
import { RatingModal } from "@/components/rating/RatingModal";
import { adaptGraphSnapshot } from "@/adapters/graphSnapshotAdapter";
import DOMPurify from "dompurify";

type ViewMode = "scroll" | "page";
type LineHeight = 1.5 | 1.8 | 2;

/**
 * 테마별 스타일 (BookReaderModal의 getThemeStyle 재현)
 */
const getThemeStyle = (theme: Theme) => {
  const styles = {
    light: {
      container: "bg-white text-zinc-900",
      text: "text-zinc-900",
      bg: "bg-white",
      columnRule: "rgba(0, 0, 0, 0.1)",
      hover: "hover:bg-zinc-100",
    },
    dark: {
      container: "bg-black text-white",
      text: "text-white",
      bg: "bg-black",
      columnRule: "rgba(255, 255, 255, 0.1)",
      hover: "hover:bg-zinc-900",
    },
    sepia: {
      container: "bg-amber-50 text-amber-900",
      text: "text-amber-900",
      bg: "bg-amber-50",
      columnRule: "rgba(180, 83, 9, 0.15)",
      hover: "hover:bg-amber-100",
    },
    ivory: {
      container: "bg-[#FFFFF0] text-[#5D4E37]",
      text: "text-[#5D4E37]",
      bg: "bg-[#FFFFF0]",
      columnRule: "rgba(93, 78, 55, 0.15)",
      hover: "hover:bg-[#F5F5DC]",
    },
  };
  return styles[theme];
};

/**
 * 본문에서 HTML 제목 태그 제거 (h1~h6)
 */
const stripHeaderTags = (content: string): string => {
  if (!content) return "";
  return content.replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, "");
};

/**
 * 줄바꿈 처리 (\n -> <br />)
 */
const formatContent = (content: string): string => {
  if (!content) return "";
  return content.replace(/\n/g, "<br />");
};

export const ChapterViewerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  // 뷰어 설정 상태 (기존 네이밍 유지)
  const [viewMode, setViewMode] = useState<ViewMode>("scroll");
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState<LineHeight>(1.8);
  const [currentPage, setCurrentPage] = useState(0);

  // UI 상태
  const [showTOC, setShowTOC] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);

  const { openAuthModal } = useAuthModalStore();

  // 로그인 필수 체크 - 현재 위치에서 모달만 띄우기
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal(`/chapters/${id}`);
    }
  }, [isAuthenticated, id, openAuthModal]);

  // 데이터 페칭
  const { data: chapter, isLoading } = usePublicChapter(id || "");
  const { data: chapters } = usePublicChapters(chapter?.workId || "");
  const { data: work } = usePublicWork(chapter?.workId || "");
  const saveBookmark = useSaveBookmark();

  // 실제 graphSnapshot 데이터 사용
  const graphData = useMemo(() => {
    console.log("[DEBUG] chapter 전체 데이터:", chapter);
    console.log("[DEBUG] graphSnapshot 원본:", chapter?.graphSnapshot);

    if (!chapter?.graphSnapshot) {
      console.log("[DEBUG] graphSnapshot이 없습니다!");
      return null;
    }

    const adapted = adaptGraphSnapshot(chapter.graphSnapshot as any);
    console.log("[DEBUG] adaptGraphSnapshot 결과:", adapted);
    return adapted;
  }, [chapter?.graphSnapshot]);

  // 별점 데이터 및 제출 훅
  const { data: ratingData } = useChapterRating(id || "");
  const submitRating = useSubmitRating();

  // 별점 제출 핸들러
  const handleSubmitRating = (score: number) => {
    if (id) {
      submitRating.mutate({ chapterId: id, workId: chapter?.workId, score });
    }
  };

  // 본문에서 제목 태그 제거 + 줄바꿈 처리
  const cleanContent = useMemo(() => {
    const stripped = stripHeaderTags(chapter?.content || "");
    return DOMPurify.sanitize(formatContent(stripped));
  }, [chapter?.content]);

  // 마지막 읽은 챕터 저장 (로컬 스토리지) - 이어서 읽기용
  useEffect(() => {
    if (id && chapter?.workId && isAuthenticated) {
      localStorage.setItem(`lastChapter_${chapter.workId}`, id);
    }
  }, [id, chapter?.workId, isAuthenticated]);

  // 챕터 변경 시 페이지 초기화 (2-3 해결: 다음화 이동 시 첫 페이지로)
  useEffect(() => {
    setCurrentPage(0);
  }, [id]);

  // 현재/이전/다음 챕터 찾기 (기존 로직 유지)
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

  // cleanContent에서 페이지 모드용 콘텐츠 분할 (HTML 태그 제거된 콘텐츠 기반)
  const rawContent = useMemo(
    () => stripHeaderTags(chapter?.content || ""),
    [chapter?.content]
  );
  const contentPages = useMemo(
    () => rawContent.split("\n\n").filter(Boolean),
    [rawContent]
  );
  // 2단 레이아웃: 한 페이지에 2개의 문단 표시
  const totalPages = Math.max(1, Math.ceil(contentPages.length / 2));

  // 페이지 모드 마지막 페이지 여부 (다음화 안내 UI용)
  const isLastPage = currentPage >= totalPages - 1;

  // 페이지 이동 함수 (기존 네이밍 유지)
  const goToPrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    } else if (prevChapter) {
      navigate(`/chapters/${prevChapter.id}`);
    }
  }, [currentPage, prevChapter, navigate]);

  // goToNextPage: 마지막 페이지에서는 바로 이동하지 않음 (하단 배너로 유도)
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
    // 마지막 페이지에서 우측 클릭 시 바로 이동하지 않음 - 하단 배너로 유도
  }, [currentPage, totalPages]);

  // 읽은 위치 저장 (throttle + ref로 중복 호출 방지)
  const lastSavedPosition = useRef<number>(0);
  useEffect(() => {
    if (!id || !isAuthenticated || viewMode !== "scroll") return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // 이전 저장 위치와 100px 이상 차이가 있을 때만 저장
      if (Math.abs(scrollPosition - lastSavedPosition.current) > 100) {
        lastSavedPosition.current = scrollPosition;
        saveBookmark.mutate({ chapterId: id, position: scrollPosition });
      }
    };

    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 1000);
    };

    window.addEventListener("scroll", debouncedScroll);
    return () => {
      window.removeEventListener("scroll", debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [id, isAuthenticated, viewMode, saveBookmark]);

  // 테마 스타일 가져오기
  const styles = getThemeStyle(theme);

  if (isLoading) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          styles.container
        )}
      >
        <div className="animate-spin h-8 w-8 border-4 border-mocha-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          styles.container
        )}
      >
        <p className={styles.text}>챕터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        styles.container
      )}
    >
      {/* ====== 미니멀 상단 헤더 ====== */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 backdrop-blur-sm",
          styles.bg,
          "bg-opacity-80"
        )}
      >
        <div className="flex items-center justify-between px-3 h-12">
          {/* 좌측: 홈 + 라이브러리 + TOC 토글 + 챕터 정보 */}
          <div className="flex items-center gap-1">
            {/* 홈(작품 목록)으로 이동 */}
            <button
              onClick={() => navigate("/")}
              className={cn(
                "p-2 rounded-full transition-colors",
                styles.hover,
                styles.text
              )}
              title="홈으로 이동"
            >
              <Home className="h-4 w-4" />
            </button>
            {/* 작품 상세(챕터 목록)으로 이동 */}
            <button
              onClick={() =>
                chapter?.workId && navigate(`/works/${chapter.workId}`)
              }
              className={cn(
                "p-2 rounded-full transition-colors",
                styles.hover,
                styles.text
              )}
              title="작품으로 이동"
            >
              <Library className="h-4 w-4" />
            </button>
            {/* 목차 사이드바 토글 */}
            <button
              onClick={() => setShowTOC(true)}
              className={cn(
                "p-2 rounded-full transition-colors",
                styles.hover,
                styles.text
              )}
            >
              <Menu className="h-4 w-4" />
            </button>
            {/* 챕터 정보: {번호}화 : {제목} */}
            <span
              className={cn(
                "text-sm truncate max-w-[200px] md:max-w-md",
                styles.text
              )}
            >
              <span className="opacity-50">{chapter.chapterNumber}화</span>
              <span className="mx-1.5 opacity-30">:</span>
              <span className="font-semibold">{chapter.title}</span>
            </span>
          </div>

          {/* 우측: 뷰어 모드, 댓글, 이전/다음 */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setViewMode("page")}
              className={cn(
                "p-2 rounded-full transition-colors",
                viewMode === "page"
                  ? "bg-mocha-500 text-paper"
                  : cn(styles.hover, styles.text)
              )}
              title="책 모드"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("scroll")}
              className={cn(
                "p-2 rounded-full transition-colors",
                viewMode === "scroll"
                  ? "bg-mocha-500 text-paper"
                  : cn(styles.hover, styles.text)
              )}
              title="스크롤 모드"
            >
              <ScrollText className="w-4 h-4" />
            </button>

            {/* 별점 아이콘 */}
            <button
              onClick={() => setShowRatingModal(true)}
              className={cn(
                "p-2 rounded-full transition-colors flex items-center gap-1",
                styles.hover,
                styles.text
              )}
              title="별점"
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  ratingData?.myRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-current"
                )}
              />
              {ratingData && ratingData.ratingCount > 0 && (
                <span className="text-xs font-medium opacity-70">
                  {(ratingData.avgRating / 2).toFixed(1)}
                </span>
              )}
            </button>

            {/* 댓글 아이콘 */}
            <button
              onClick={() => navigate(`/chapters/${id}/comments`)}
              className={cn(
                "p-2 rounded-full transition-colors relative",
                styles.hover,
                styles.text
              )}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-mocha-500" />
            </button>

            {/* 이전/다음화 */}
            <button
              disabled={!prevChapter}
              onClick={() =>
                prevChapter && navigate(`/chapters/${prevChapter.id}`)
              }
              className={cn(
                "p-2 rounded-full transition-colors",
                prevChapter
                  ? cn(styles.hover, styles.text)
                  : "opacity-30 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={!nextChapter}
              onClick={() =>
                nextChapter && navigate(`/chapters/${nextChapter.id}`)
              }
              className={cn(
                "p-2 rounded-full transition-colors",
                nextChapter
                  ? cn(styles.hover, styles.text)
                  : "opacity-30 cursor-not-allowed"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* TOC 사이드바 */}
      <TableOfContents
        chapters={sortedChapters || []}
        currentChapterId={id || ""}
        workTitle={work?.title || "작품명"}
        isOpen={showTOC}
        onClose={() => setShowTOC(false)}
      />

      {/* ====== 본문 영역 (BookModeContent 구조) ====== */}
      <main className="pt-12 pb-24 min-h-screen">
        {viewMode === "scroll" ? (
          /* ====== 스크롤 모드: article 구조 ====== */
          <article
            className={cn(
              "max-w-2xl mx-auto px-8 py-12 font-serif",
              styles.text
            )}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight,
            }}
          >
            <SecureViewer content={cleanContent} isHtml />
          </article>
        ) : (
          /* ====== 책 모드: Grid 2단 레이아웃 + 중앙 구분선 ====== */
          <div className="relative h-[calc(100vh-8rem)] flex flex-col">
            {/* 클릭 영역 (본문과 동일한 레이아웃으로 정렬) */}
            <div className="absolute inset-0 z-0 px-8 md:px-16 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                {/* 왼쪽 클릭 영역 (이전 페이지) */}
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 0 && !prevChapter}
                  className={cn(
                    "flex items-center justify-start pl-4 transition-colors",
                    currentPage > 0 || prevChapter
                      ? styles.hover
                      : "cursor-default",
                    "opacity-0 hover:opacity-100"
                  )}
                >
                  <ChevronLeft className="w-8 h-8 opacity-30" />
                </button>

                {/* 오른쪽 클릭 영역 (다음 페이지) */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages - 1 && !nextChapter}
                  className={cn(
                    "hidden md:flex items-center justify-end pr-4 transition-colors",
                    currentPage < totalPages - 1 || nextChapter
                      ? styles.hover
                      : "cursor-default",
                    "opacity-0 hover:opacity-100"
                  )}
                >
                  <ChevronRight className="w-8 h-8 opacity-30" />
                </button>
              </div>
            </div>

            {/* 본문 컨테이너 (Grid 2단) - 텍스트가 앞에 */}
            <div
              className={cn(
                "flex-1 px-8 md:px-16 py-8 font-serif overflow-hidden relative z-10 pointer-events-none",
                styles.text
              )}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                {/* 왼쪽 페이지 */}
                <div
                  className="overflow-hidden"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      formatContent(contentPages[currentPage * 2] || "")
                    ),
                  }}
                />
                {/* 오른쪽 페이지 (중앙 구분선) */}
                <div
                  className="overflow-hidden hidden md:block"
                  style={{
                    borderLeft: `1px solid ${styles.columnRule}`,
                    paddingLeft: "1.5rem",
                  }}
                >
                  {/* 마지막 페이지이고 다음 챕터가 있으면 다음화 카드 표시 */}
                  {isLastPage && nextChapter && !contentPages[currentPage * 2 + 1] ? (
                    <button
                      onClick={() => navigate(`/chapters/${nextChapter.id}`)}
                      className={cn(
                        "w-full h-full flex flex-col items-center justify-center gap-4",
                        "rounded-xl border-2 border-dashed transition-all pointer-events-auto",
                        "border-mocha-400 hover:border-mocha-500 hover:bg-mocha-400/10",
                        styles.text
                      )}
                    >
                      <ChevronRight className="w-12 h-12 text-mocha-500" />
                      <div className="text-center">
                        <p className="text-lg font-semibold mb-1">
                          다음 화로 이동
                        </p>
                        <p className="text-sm opacity-60">
                          {nextChapter.chapterNumber}화: {nextChapter.title}
                        </p>
                      </div>
                    </button>
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          formatContent(contentPages[currentPage * 2 + 1] || "")
                        ),
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 페이지 번호 (하단 중앙, 희미하게) */}
            <div className="text-center py-4">
              <span className={cn("text-xs opacity-30", styles.text)}>
                {currentPage + 1} / {totalPages}
              </span>
            </div>
          </div>
        )}

        {/* 다음화 안내 (스크롤 모드에서만) */}
        {nextChapter && viewMode === "scroll" && (
          <div className="max-w-2xl mx-auto px-8 mt-16">
            <button
              onClick={() => navigate(`/chapters/${nextChapter.id}`)}
              className={cn(
                "w-full py-4 text-center opacity-50 hover:opacity-100 transition-opacity",
                styles.text
              )}
            >
              <span className="text-sm">다음 화에서 계속...</span>
              <ChevronRight className="inline h-4 w-4 ml-1" />
            </button>
          </div>
        )}
      </main>

      {/* ====== 우측 하단 FAB (설정) ====== */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
          className="w-12 h-12 rounded-full shadow-lg bg-mocha-500 hover:bg-mocha-700 text-paper"
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* 설정 팝업 - 사진 2 스타일 */}
        {showSettings && (
          <div className="absolute bottom-16 right-0 w-72 rounded-2xl shadow-2xl border p-5 bg-paper border-mocha-400 text-ink">
            <div className="space-y-5">
              {/* 관계도 보기 버튼 */}
              <button
                onClick={() => {
                  console.log("[DEBUG] 관계도 버튼 클릭됨");
                  console.log(
                    "[DEBUG] showGraphModal 상태 변경 전:",
                    showGraphModal
                  );
                  console.log("[DEBUG] graphData:", graphData);
                  setShowGraphModal(true);
                  console.log("[DEBUG] showGraphModal 상태 변경 후: true");
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-mocha-400 text-ink rounded-xl hover:bg-mocha-400/10 transition-colors"
              >
                <Network className="w-4 h-4" />
                <span className="text-sm font-medium">관계도 보기</span>
              </button>

              {/* 글자 크기 */}
              <div>
                <label className="text-xs text-mocha-700 mb-2 block">
                  글자 크기
                </label>
                <div className="flex items-center justify-between border border-mocha-400 rounded-lg">
                  <button
                    onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                    className="p-3 hover:bg-mocha-400/10 rounded-l-lg transition-colors"
                  >
                    <Minus className="w-4 h-4 text-ink" />
                  </button>
                  <span className="text-sm font-medium text-ink">{fontSize}px</span>
                  <button
                    onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                    className="p-3 hover:bg-mocha-400/10 rounded-r-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 text-ink" />
                  </button>
                </div>
              </div>

              {/* 테마 - 사진 1 스타일: 테두리로 선택 표시 */}
              <div>
                <label className="text-xs text-ink mb-2 block">테마</label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { key: "light", label: "화이트", bg: "bg-white", border: "border-ink" },
                    { key: "dark", label: "다크", bg: "bg-espresso-900", border: "border-mocha-400" },
                    { key: "sepia", label: "세피아", bg: "bg-amber-50", border: "border-amber-400" },
                    { key: "ivory", label: "아이보리", bg: "bg-[#FFFFF0]", border: "border-amber-200" },
                  ] as const).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTheme(t.key)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg border-2 transition-all",
                          t.bg,
                          theme === t.key
                            ? `${t.border} ring-2 ring-mocha-400 ring-offset-1`
                            : "border-mocha-400/30"
                        )}
                      />
                      <span className="text-[10px] text-ink">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 줄 간격 - 테두리 선택 스타일 */}
              <div>
                <label className="text-xs text-mocha-700 mb-2 block">줄 간격</label>
                <div className="grid grid-cols-3 gap-2">
                  {([1.5, 1.8, 2] as LineHeight[]).map((lh) => (
                    <button
                      key={lh}
                      onClick={() => setLineHeight(lh)}
                      className={cn(
                        "py-2 text-sm rounded-lg transition-all font-medium border-2",
                        lineHeight === lh
                          ? "border-mocha-500 bg-mocha-500 text-paper"
                          : "border-mocha-400 text-ink hover:bg-mocha-400/10"
                      )}
                    >
                      {lh}
                    </button>
                  ))}
                </div>
              </div>

              {/* 뷰어 모드 - 테두리 선택 스타일 */}
              <div>
                <label className="text-xs text-mocha-700 mb-2 block">
                  뷰어 모드
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setViewMode("scroll")}
                    className={cn(
                      "py-2 text-sm rounded-lg transition-all font-medium border-2",
                      viewMode === "scroll"
                        ? "border-mocha-500 bg-mocha-500 text-paper"
                        : "border-mocha-400 text-ink hover:bg-mocha-400/10"
                    )}
                  >
                    스크롤
                  </button>
                  <button
                    onClick={() => setViewMode("page")}
                    className={cn(
                      "py-2 text-sm rounded-lg transition-all font-medium border-2",
                      viewMode === "page"
                        ? "border-mocha-500 bg-mocha-500 text-paper"
                        : "border-mocha-400 text-ink hover:bg-mocha-400/10"
                    )}
                  >
                    페이지
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 별점 모달 (페이지 모드에서 헤더 별점 아이콘 클릭 시) */}
      <RatingModal
        open={showRatingModal}
        onOpenChange={setShowRatingModal}
        currentRating={ratingData?.myRating ?? null}
        avgRating={ratingData?.avgRating ?? 0}
        ratingCount={ratingData?.ratingCount ?? 0}
        onSubmit={handleSubmitRating}
        isSubmitting={submitRating.isPending}
      />

      {/* 관계도 모달 */}
      <GraphModal
        isOpen={showGraphModal}
        onClose={() => setShowGraphModal(false)}
        characters={graphData?.characters ?? []}
        links={graphData?.links ?? []}
        chapterNumber={chapter.chapterNumber}
      />
    </div>
  );
};

export default ChapterViewerPage;
