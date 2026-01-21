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
import { motion, AnimatePresence } from "framer-motion";
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
  MessageSquare,
  X,
  Send,
  Sparkles,
  Lock,
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
import { type Theme } from "@/stores/useTheme";
import { cn } from "@/lib/utils";
import { RatingModal } from "@/components/rating/RatingModal";
import { adaptGraphSnapshot } from "@/adapters/graphSnapshotAdapter";
import { useCredits } from "@/hooks/useCredits";
import { useQueryClient } from "@tanstack/react-query";
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
      container: "bg-mocha-900 text-white",
      text: "text-white",
      bg: "bg-mocha-900",
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

// 구매 오버레이 컴포넌트
const PurchaseOverlay = ({
  price,
  balance,
  isUsing,
  onPurchase,
}: {
  price: number;
  balance: number;
  isUsing: boolean;
  onPurchase: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 rounded-3xl border-2 border-dashed border-mocha-200 bg-mocha-50/30 backdrop-blur-sm animate-in fade-in zoom-in duration-500">
    <div className="w-16 h-16 rounded-full bg-mocha-500 flex items-center justify-center mb-6 shadow-xl shadow-mocha-500/20">
      <Lock className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-2xl font-black text-espresso-900 mb-2">
      유료 회차입니다
    </h3>
    <p className="text-mocha-600 mb-8 text-center max-w-sm">
      이 챕터를 계속 읽으려면 {price} 크레딧이 필요합니다.
      <br />
      구매 후 영구 소장하여 언제든 다시 볼 수 있습니다.
    </p>

    <div className="bg-white/80 p-6 rounded-2xl shadow-sm border border-mocha-100 mb-8 w-full max-w-xs flex flex-col items-center">
      <div className="text-xs font-bold text-mocha-400 uppercase tracking-widest mb-1">
        My Balance
      </div>
      <div className="text-2xl font-black text-mocha-900 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        {balance.toLocaleString()} C
      </div>
    </div>

    <Button
      onClick={onPurchase}
      disabled={isUsing}
      className="w-full max-w-xs h-14 rounded-2xl bg-mocha-600 hover:bg-mocha-700 text-white font-black text-lg shadow-lg hover:shadow-mocha-600/30 transition-all hover:-translate-y-1"
    >
      {isUsing ? "처리 중..." : `${price} 크레딧으로 구매`}
    </Button>

    <p className="mt-6 text-xs text-mocha-400">
      구매 즉시 크레딧이 차감되며 취소가 불가능합니다.
    </p>
  </div>
);

export const ChapterViewerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // [FIX] Reset state when ID changes during render phase to avoid useEffect cascading renders
  const [prevId, setPrevId] = useState(id);
  const [currentPage, setCurrentPage] = useState(0);

  if (id !== prevId) {
    setPrevId(id);
    setCurrentPage(0);
  }

  // 뷰어 전용 테마 상태 (전역 테마와 분리)
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("viewer_theme") as Theme;
    if (stored) return stored;

    // 시스템 설정 감지 (저장된 설정이 없을 경우)
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("viewer_theme", newTheme);
  };

  // [Sync] 다른 탭에서 테마 변경 시 동기화 & 시스템 설정 변경 감지
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "viewer_theme" && e.newValue) {
        setThemeState(e.newValue as Theme);
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("viewer_theme")) {
        setThemeState(e.matches ? "dark" : "light");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, []);

  // 뷰어 설정 상태
  const [viewMode, setViewMode] = useState<ViewMode>("scroll");
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight] = useState<LineHeight>(1.8);

  // 책 모드: CSS Column 기반 동적 페이지 수 계산을 위한 ref와 상태
  const bookModeContentRef = useRef<HTMLDivElement>(null);
  const [calculatedTotalPages, setCalculatedTotalPages] = useState(1);

  // UI 상태
  const [showTOC, setShowTOC] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [activeInlineComment, setActiveInlineComment] = useState<{
    index: number;
    text: string;
  } | null>(null);
  const [inlineComments, setInlineComments] = useState<Record<number, unknown[]>>(
    {},
  );

  const { openAuthModal } = useAuthModalStore();

  // 로그인 필수 체크
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

  const queryClient = useQueryClient();
  const { balance, creditAsync, isUsing } = useCredits();

  // 챕터 구매 핸들러
  const handlePurchase = async () => {
    if (!chapter || !id) return;

    if (balance < (chapter.price || 0)) {
      alert("크레딧이 부족합니다. 충전 후 이용해주세요.");
      navigate("/credits/charge");
      return;
    }

    if (
      confirm(`${chapter.price} 크레딧을 사용하여 이 챕터를 구매하시겠습니까?`)
    ) {
      try {
        await creditAsync({
          amount: chapter.price || 0,
          description: `Chapter Purchase: ${chapter.title}`,
          referenceType: "CHAPTER",
          referenceId: id,
        });

        // 구매 성공 시 챕터 정보 무효화하여 최신 상태(isPurchased=true) 반영
        queryClient.invalidateQueries({ queryKey: ["chapter", id] });
        queryClient.invalidateQueries({ queryKey: ["work", chapter.workId] });
      } catch (error) {
        console.error("구매 실패:", error);
        alert("구매 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 실제 graphSnapshot 데이터 사용 및 파싱 로직 강화
  // 우선순위: chapter.graphSnapshot > work.characterGraphData
  const parsedSnapshot = useMemo(() => {
    // 1. 챕터에 graphSnapshot이 있으면 사용
    const raw = chapter?.graphSnapshot || work?.characterGraphData;
    if (!raw) return null;

    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error("[DEBUG] graphSnapshot 파싱 실패:", e);
        return null;
      }
    }
    return raw;
  }, [chapter?.graphSnapshot, work?.characterGraphData]);

  const graphData = useMemo(() => {
    if (!parsedSnapshot) return null;
    return adaptGraphSnapshot(parsedSnapshot);
  }, [parsedSnapshot]);

  // 별점 데이터 및 제출 훅
  const { data: ratingData } = useChapterRating(id || "");
  const submitRating = useSubmitRating();

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

  // 마지막 읽은 챕터 저장
  useEffect(() => {
    if (id && chapter?.workId && isAuthenticated) {
      localStorage.setItem(`lastChapter_${chapter.workId}`, id);
    }
  }, [id, chapter?.workId, isAuthenticated]);

  // 현재/이전/다음 챕터 찾기
  const sortedChapters = chapters?.sort(
    (a, b) => a.chapterNumber - b.chapterNumber,
  );
  const currentIndex = sortedChapters?.findIndex((c) => c.id === id) ?? -1;
  const prevChapter =
    currentIndex > 0 ? sortedChapters?.[currentIndex - 1] : null;
  const nextChapter =
    sortedChapters && currentIndex < sortedChapters.length - 1
      ? sortedChapters[currentIndex + 1]
      : null;

  // 책 모드: 렌더링된 콘텐츠의 실제 스크롤 너비를 기반으로 페이지 수 동적 계산
  // CSS Column으로 브라우저가 자동 분할하므로, 이중 개행 분할 방식은 더 이상 사용하지 않음
  const isLastPage = currentPage >= calculatedTotalPages - 1;

  // 책 모드 콘텐츠 렌더 후 실제 페이지 수 계산 (ResizeObserver 사용으로 안정성 향상)
  useEffect(() => {
    if (viewMode === 'page' && bookModeContentRef.current) {
      const container = bookModeContentRef.current;

      // 페이지 수 계산 함수
      const calculatePages = () => {
        if (container) {
          const scrollWidth = container.scrollWidth;
          const clientWidth = container.clientWidth;
          // 한 "화면"(2단)이 하나의 페이지
          const pages = Math.max(1, Math.ceil(scrollWidth / clientWidth));
          setCalculatedTotalPages(pages);
        }
      };

      // ResizeObserver로 레이아웃 변경 감지
      const resizeObserver = new ResizeObserver(() => {
        // 레이아웃 안정화를 위해 requestAnimationFrame 사용
        requestAnimationFrame(calculatePages);
      });

      resizeObserver.observe(container);

      // 초기 계산 (콘텐츠 로드 직후)
      requestAnimationFrame(calculatePages);

      return () => resizeObserver.disconnect();
    }
  }, [viewMode, cleanContent, fontSize, lineHeight]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    } else if (prevChapter) {
      navigate(`/chapters/${prevChapter.id}`);
    }
  }, [currentPage, prevChapter, navigate]);

  const goToNextPage = useCallback(() => {
    if (currentPage < calculatedTotalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, calculatedTotalPages]);

  // 읽은 위치 저장
  const lastSavedPosition = useRef<number>(0);
  useEffect(() => {
    if (!id || !isAuthenticated || viewMode !== "scroll") return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
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

  const styles = getThemeStyle(theme);

  if (isLoading) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          styles.container,
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
          styles.container,
        )}
      >
        <p className="text-styles">챕터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        theme === "dark" && "dark",
        styles.container,
      )}
    >
      {/* ====== 미니멀 상단 헤더 ====== */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b transition-colors duration-300",
          styles.bg,
          "bg-opacity-80 border-mocha-100/20",
        )}
      >
        <div className="flex items-center justify-between px-3 h-12">
          {/* 좌측: 홈 + 라이브러리 + TOC 토글 + 챕터 정보 */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("/")}
              className={cn(
                "p-2 rounded-full transition-colors",
                styles.hover,
                styles.text,
              )}
              title="홈으로 이동"
            >
              <Home className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                chapter?.workId && navigate(`/works/${chapter.workId}`)
              }
              className={cn(
                "p-2 rounded-full transition-colors",
                styles.hover,
                styles.text,
              )}
              title="작품으로 이동"
            >
              <Library className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowTOC(true)}
              className={cn(
                "p-2 rounded-full transition-colors",
                styles.hover,
                styles.text,
              )}
            >
              <Menu className="h-4 w-4" />
            </button>
            <span
              className={cn(
                "text-sm truncate max-w-[200px] md:max-w-md",
                styles.text,
              )}
            >
              <span className="opacity-50">{chapter.chapterNumber}화</span>
              <span className="mx-1.5 opacity-30">:</span>
              <span className="font-semibold">{chapter.title}</span>
            </span>
          </div>

          {/* 우측: 뷰어 모드, 댓글, 이전/다음 */}
          <div className="flex items-center gap-0.5">
            {/* 크레딧 잔액 표시 (헤더 우측) */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-mocha-50/50 mr-2 border border-mocha-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-black text-mocha-700">
                {balance.toLocaleString()} C
              </span>
            </div>

            <button
              onClick={() => setViewMode("page")}
              className={cn(
                "p-2 rounded-full transition-colors",
                viewMode === "page"
                  ? "bg-mocha-500 text-paper"
                  : cn(styles.hover, styles.text),
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
                  : cn(styles.hover, styles.text),
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
                styles.text,
              )}
              title="별점"
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  ratingData?.myRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-current",
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
                styles.text,
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
                  : "opacity-30 cursor-not-allowed",
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
                  : "opacity-30 cursor-not-allowed",
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
              styles.text,
            )}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight,
            }}
          >
            {chapter.accessType === "PAID" && !chapter.isPurchased ? (
              <PurchaseOverlay
                price={chapter.price || 0}
                balance={balance}
                isUsing={isUsing}
                onPurchase={handlePurchase}
              />
            ) : (
              <>
                <SecureViewer
                  content={cleanContent}
                  isHtml
                  onCommentClick={(index, text) =>
                    setActiveInlineComment({ index, text })
                  }
                  commentCounts={Object.keys(inlineComments).reduce(
                    (acc, key) => {
                      acc[Number(key)] = inlineComments[Number(key)].length;
                      return acc;
                    },
                    {} as Record<number, number>,
                  )}
                />
              </>
            )}
          </article>
        ) : (
          /* ====== 책 모드: Grid 2단 레이아웃 + 중앙 구분선 ====== */
          <div className="relative h-[calc(100vh-8rem)] flex flex-col">
            {chapter.accessType === "PAID" && !chapter.isPurchased ? (
              <div className="flex-1 flex items-center justify-center">
                <PurchaseOverlay
                  price={chapter.price || 0}
                  balance={balance}
                  isUsing={isUsing}
                  onPurchase={handlePurchase}
                />
              </div>
            ) : (
              <>
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
                        "opacity-0 hover:opacity-100",
                      )}
                    >
                      <ChevronLeft className="w-8 h-8 opacity-30" />
                    </button>

                    {/* 오른쪽 클릭 영역 (다음 페이지) */}
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage >= calculatedTotalPages - 1 && !nextChapter}
                      className={cn(
                        "hidden md:flex items-center justify-end pr-4 transition-colors",
                        currentPage < calculatedTotalPages - 1 || nextChapter
                          ? styles.hover
                          : "cursor-default",
                        "opacity-0 hover:opacity-100",
                      )}
                    >
                      <ChevronRight className="w-8 h-8 opacity-30" />
                    </button>
                  </div>
                </div>

                {/* 본문 컨테이너 (CSS Column 기반 슬라이드) */}
                <div
                  ref={bookModeContentRef}
                  className={cn(
                    "flex-1 px-8 md:px-16 py-8 font-serif overflow-hidden relative z-10",
                    styles.text,
                  )}
                >
                  {/* CSS Column으로 자동 분할되는 콘텐츠 + translateX로 페이지 전환 */}
                  <div
                    className="h-full transition-transform duration-300 ease-out"
                    style={{
                      columnCount: 2,
                      columnGap: '2.5rem',
                      columnFill: 'auto',
                      columnRule: `1px solid ${styles.columnRule}`,
                      height: '100%',
                      // 전체 콘텐츠 너비: 페이지 수 × 100%
                      width: `${calculatedTotalPages * 100}%`,
                      // 현재 페이지로 슬라이드 이동
                      transform: `translateX(-${currentPage * (100 / calculatedTotalPages)}%)`,
                      fontSize: `${fontSize}px`,
                      lineHeight,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: cleanContent,
                    }}
                  />
                </div>

                {/* 마지막 페이지에서 다음화 안내 오버레이 */}
                {isLastPage && nextChapter && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <button
                      onClick={() => navigate(`/chapters/${nextChapter.id}`)}
                      className={cn(
                        "max-w-xs flex flex-col items-center justify-center gap-4 p-8",
                        "rounded-xl border-2 border-dashed transition-all pointer-events-auto",
                        "border-mocha-400 hover:border-mocha-500 hover:bg-mocha-400/10",
                        "bg-white/90 dark:bg-mocha-900/90 backdrop-blur-sm shadow-lg",
                        styles.text,
                      )}
                    >
                      <ChevronRight className="w-10 h-10 text-mocha-500" />
                      <div className="text-center">
                        <p className="text-lg font-semibold mb-1">
                          다음 화로 이동
                        </p>
                        <p className="text-sm opacity-60">
                          {nextChapter.chapterNumber}화: {nextChapter.title}
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </>
            )}


            {/* 페이지 번호 (하단 중앙, 희미하게) */}
            <div className="text-center py-4">
              <span className={cn("text-xs opacity-30", styles.text)}>
                {currentPage + 1} / {calculatedTotalPages}
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
                styles.text,
              )}
            >
              <span className="text-sm">다음 화에서 계속...</span>
              <ChevronRight className="inline h-4 w-4 ml-1" />
            </button>
          </div>
        )}

        {/* ====== 인라인 댓글 사이드 패널 (프로토타입) ====== */}
        <AnimatePresence>
          {activeInlineComment && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "fixed top-12 right-0 bottom-0 w-80 z-40 border-l shadow-2xl flex flex-col",
                styles.bg,
                theme === "light" ? "border-mocha-100" : "border-zinc-800",
              )}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-mocha-500" />
                  문단 댓글
                </h3>
                <button
                  onClick={() => setActiveInlineComment(null)}
                  className="p-1 hover:bg-mocha-50 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-mocha-50/30 dark:bg-black/20 italic text-xs mb-2 border-b">
                <p className="line-clamp-3 opacity-60">
                  "{activeInlineComment.text}"
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(inlineComments[activeInlineComment.index] || []).length >
                  0 ? (
                  (inlineComments[activeInlineComment.index] as { content: string; createdAt: string }[]).map((c, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-xs font-bold text-mocha-600">
                        익명 독자
                      </p>
                      <p className="text-sm bg-white dark:bg-zinc-800 p-3 rounded-2xl shadow-sm">
                        {c.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 opacity-30 flex flex-col items-center gap-2">
                    <MessageSquare className="w-8 h-8" />
                    <p className="text-sm">첫 번째 댓글을 남겨보세요.</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t">
                <div className="relative">
                  <textarea
                    placeholder="응원의 한마디 또는 감상을 적어주세요."
                    className="w-full bg-mocha-50 dark:bg-zinc-800 border-none rounded-2xl p-4 pr-12 text-sm focus:ring-2 focus:ring-mocha-500 resize-none h-24"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        const content = e.currentTarget.value.trim();
                        if (content) {
                          setInlineComments((prev) => ({
                            ...prev,
                            [activeInlineComment.index]: [
                              ...(prev[activeInlineComment.index] || []),
                              { content, createdAt: new Date().toISOString() },
                            ],
                          }));
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                  <button className="absolute right-3 bottom-3 p-2 bg-mocha-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-center mt-3 opacity-40">
                  작품의 성장을 돕는 예쁜 댓글을 남겨주세요.
                </p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      {/* ====== 우측 하단 FAB (설정) ====== */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
          className="w-12 h-12 rounded-full shadow-lg bg-mocha-500 hover:bg-mocha-600 text-white btn-glow transition-transform hover:scale-105"
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* 설정 팝업 - 테마 기반 스타일 적용 */}
        {showSettings && (
          <div
            className={cn(
              "absolute bottom-16 right-0 w-72 rounded-2xl shadow-2xl border p-5 transition-colors duration-300 backdrop-blur-xl bg-opacity-90",
              styles.bg,
              styles.text,
              theme === "light" ? "border-mocha-400/50" : "border-zinc-700/50",
            )}
          >
            <div className="space-y-5">
              {/* 관계도 보기 버튼 */}
              <button
                onClick={() => {
                  console.log("[DEBUG] 관계도 버튼 클릭됨");
                  setShowGraphModal(true);
                }}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl transition-colors",
                  theme === "dark"
                    ? "border-zinc-600 hover:bg-zinc-800 text-zinc-200"
                    : "border-mocha-400 text-ink hover:bg-mocha-400/10",
                )}
              >
                <Network className="w-4 h-4" />
                <span className="text-sm font-medium">관계도 보기</span>
              </button>

              {/* 글자 크기 */}
              <div>
                <label
                  className={cn("text-xs mb-2 block opacity-70", styles.text)}
                >
                  글자 크기
                </label>
                <div
                  className={cn(
                    "flex items-center justify-between border rounded-lg",
                    theme === "dark" ? "border-zinc-600" : "border-mocha-400",
                  )}
                >
                  <button
                    onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                    className={cn(
                      "p-3 rounded-l-lg transition-colors",
                      theme === "dark"
                        ? "hover:bg-zinc-800 text-zinc-200"
                        : "hover:bg-mocha-400/10 text-ink",
                    )}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className={cn("text-sm font-medium", styles.text)}>
                    {fontSize}px
                  </span>
                  <button
                    onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                    className={cn(
                      "p-3 rounded-r-lg transition-colors",
                      theme === "dark"
                        ? "hover:bg-zinc-800 text-zinc-200"
                        : "hover:bg-mocha-400/10 text-ink",
                    )}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 테마 - 사진 1 스타일: 테두리로 선택 표시 */}
              <div>
                <label
                  className={cn("text-xs mb-2 block opacity-70", styles.text)}
                >
                  테마
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(
                    [
                      {
                        key: "light",
                        label: "화이트",
                        bg: "bg-white",
                        border: "border-ink",
                      },
                      {
                        key: "dark",
                        label: "다크",
                        bg: "bg-mocha-900",
                        border: "border-mocha-400",
                      },
                      {
                        key: "sepia",
                        label: "세피아",
                        bg: "bg-amber-50",
                        border: "border-amber-400",
                      },
                      {
                        key: "ivory",
                        label: "아이보리",
                        bg: "bg-[#FFFFF0]",
                        border: "border-amber-200",
                      },
                    ] as const
                  ).map((t) => (
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
                            ? `border-mocha-500 ring-2 ring-mocha-400 ring-offset-1`
                            : "border-transparent shadow-sm",
                        )}
                      />
                      <span
                        className={cn("text-[10px] opacity-80", styles.text)}
                      >
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 인물 관계도 모달 */}
      <GraphModal
        isOpen={showGraphModal}
        onClose={() => setShowGraphModal(false)}
        characters={graphData?.characters ?? []}
        links={graphData?.links ?? []}
        graphSnapshot={parsedSnapshot}
        chapterId={id}
      />

      {/* 별점 모달 */}
      <RatingModal
        open={showRatingModal}
        onOpenChange={setShowRatingModal}
        onSubmit={handleSubmitRating}
        currentRating={ratingData?.myRating || 0}
        avgRating={ratingData?.avgRating || 0}
        ratingCount={ratingData?.ratingCount || 0}
      />
    </div>
  );
};

export default ChapterViewerPage;
