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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SecureViewer } from "@/components/viewer/SecureViewer";
import { TableOfContents } from "@/components/viewer/TableOfContents";
import {
  usePublicChapter,
  usePublicChapters,
  usePublicWork,
} from "@/hooks/useDiscovery";
import { useSaveBookmark } from "@/hooks/useBookmark";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { useThemeStore, type Theme } from "@/stores/useTheme";
import { cn } from "@/lib/utils";

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
      container: "bg-zinc-900 text-zinc-100",
      text: "text-zinc-100",
      bg: "bg-zinc-900",
      columnRule: "rgba(255, 255, 255, 0.1)",
      hover: "hover:bg-zinc-800",
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

  // 본문에서 제목 태그 제거 + 줄바꿈 처리
  const cleanContent = useMemo(() => {
    const stripped = stripHeaderTags(chapter?.content || "");
    return formatContent(stripped);
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
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
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
          {/* 좌측: 홈(작품 페이지) + TOC 토글 + 챕터 정보 */}
          <div className="flex items-center gap-1">
            {/* 작품 홈(챕터 목록)으로 이동 */}
            <button
              onClick={() => chapter?.workId && navigate(`/works/${chapter.workId}`)}
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
                  ? "bg-purple-600 text-white"
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
                  ? "bg-purple-600 text-white"
                  : cn(styles.hover, styles.text)
              )}
              title="스크롤 모드"
            >
              <ScrollText className="w-4 h-4" />
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
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-purple-600" />
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
                    __html: formatContent(contentPages[currentPage * 2] || ""),
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
                        "border-purple-300 hover:border-purple-600 hover:bg-purple-50/50",
                        styles.text
                      )}
                    >
                      <ChevronRight className="w-12 h-12 text-purple-400" />
                      <div className="text-center">
                        <p className="text-lg font-semibold mb-1">다음 화로 이동</p>
                        <p className="text-sm opacity-60">
                          {nextChapter.chapterNumber}화: {nextChapter.title}
                        </p>
                      </div>
                    </button>
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatContent(contentPages[currentPage * 2 + 1] || ""),
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
          className="w-12 h-12 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* 설정 팝업 */}
        {showSettings && (
          <div className="absolute bottom-16 right-0 w-64 rounded-2xl shadow-2xl border p-4 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
            <div className="space-y-4">
              {/* 관계도 버튼 */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                <Network className="w-4 h-4" />
                <span className="text-sm font-medium">관계도</span>
              </button>

              {/* 글자 크기 */}
              <div>
                <label className="text-xs opacity-50 mb-2 block">
                  글자 크기
                </label>
                <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                    className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium">{fontSize}px</span>
                  <button
                    onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                    className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 테마 */}
              <div>
                <label className="text-xs opacity-50 mb-2 block">테마</label>
                <div className="grid grid-cols-4 gap-1">
                  {(["light", "dark", "sepia", "ivory"] as Theme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        "py-2 text-[10px] rounded-lg transition-all font-medium",
                        theme === t
                          ? "bg-purple-600 text-white scale-105"
                          : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      )}
                    >
                      {t === "light"
                        ? "화이트"
                        : t === "dark"
                          ? "다크"
                          : t === "sepia"
                            ? "세피아"
                            : "아이보리"}
                    </button>
                  ))}
                </div>
              </div>

              {/* 줄 간격 */}
              <div>
                <label className="text-xs opacity-50 mb-2 block">줄 간격</label>
                <div className="grid grid-cols-3 gap-1">
                  {([1.5, 1.8, 2] as LineHeight[]).map((lh) => (
                    <button
                      key={lh}
                      onClick={() => setLineHeight(lh)}
                      className={cn(
                        "py-2 text-xs rounded-lg transition-all font-medium",
                        lineHeight === lh
                          ? "bg-purple-600 text-white"
                          : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      )}
                    >
                      {lh}
                    </button>
                  ))}
                </div>
              </div>

              {/* 뷰어 모드 */}
              <div>
                <label className="text-xs opacity-50 mb-2 block">
                  뷰어 모드
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setViewMode("scroll")}
                    className={cn(
                      "py-2 text-xs rounded-lg transition-all font-medium",
                      viewMode === "scroll"
                        ? "bg-purple-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    )}
                  >
                    스크롤
                  </button>
                  <button
                    onClick={() => setViewMode("page")}
                    className={cn(
                      "py-2 text-xs rounded-lg transition-all font-medium",
                      viewMode === "page"
                        ? "bg-purple-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
    </div>
  );
};

export default ChapterViewerPage;
