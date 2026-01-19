/**
 * 장르별 카테고리 페이지
 * /category/:genreId
 *
 * 기능:
 * - 서브 카테고리 탭 (장르 그룹핑)
 * - 필터 (상태, 정렬)
 * - 무한 스크롤
 * - 뷰 모드 (그리드/리스트)
 */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useCategoryWorks } from "@/hooks/useDiscovery";
import { BookCard } from "@/components/home/BookCard";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import {
  LayoutGrid,
  List as ListIcon,
  Loader2,
  ChevronDown,
  Star,
  MessageSquare,
} from "lucide-react";
import type { Work } from "@/types";

// 장르 매핑 및 서브장르 정의
// Genre Enum: FANTASY, ROMANCE, ROMANCE_FANTASY, TRADITIONAL_FANTASY, MARTIAL_ARTS, MODERN_FANTASY, MYSTERY, THRILLER, SF, DRAMA, COMEDY, HORROR, OTHER
const GENRE_GROUPS: Record<
  string,
  { label: string; tabs: { label: string; value: string }[] }
> = {
  ALL: {
    label: "전체",
    tabs: [{ label: "전체", value: "ALL" }],
  },
  FANTASY: {
    label: "판타지",
    tabs: [
      {
        label: "전체",
        value:
          "FANTASY,HEROIC_FANTASY,DARK_FANTASY,URBAN_FANTASY,HIGH_FANTASY,ISEKAI,MODERN_FANTASY,TRADITIONAL_FANTASY,ROMANCE_FANTASY",
      },
      { label: "영웅 판타지", value: "HEROIC_FANTASY" },
      { label: "다크 판타지", value: "DARK_FANTASY" },
      { label: "어반 판타지", value: "URBAN_FANTASY" },
      { label: "하이 판타지", value: "HIGH_FANTASY" },
      { label: "이세계", value: "ISEKAI" },
      { label: "현대판타지", value: "MODERN_FANTASY" },
      { label: "정통판타지", value: "TRADITIONAL_FANTASY" },
    ],
  },
  ROMANCE: {
    label: "로맨스",
    tabs: [
      { label: "전체", value: "ROMANCE,ROMANCE_FANTASY" },
      { label: "정통 로맨스", value: "ROMANCE" },
      { label: "로맨스판타지", value: "ROMANCE_FANTASY" },
    ],
  },
  MARTIAL_ARTS: {
    label: "무협",
    tabs: [{ label: "전체", value: "MARTIAL_ARTS" }],
  },
  // 기타 장르는 기본 처리
};

export const CategoryPage = () => {
  const { genreId } = useParams<{ genreId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  // const navigate = useNavigate(); // Removed unused

  // URL 파라미터 상태 동기화
  const initialSubGenre =
    searchParams.get("sub") || GENRE_GROUPS[genreId!]?.tabs[0].value || genreId;
  const searchQuery = searchParams.get("search") || "";

  // [FIX] Render phase state reset to satisfy strict lint rules
  const [prevGenreId, setPrevGenreId] = useState(genreId);
  const [selectedGenreValue, setSelectedGenreValue] = useState<
    string | undefined
  >(initialSubGenre);

  if (genreId !== prevGenreId) {
    setPrevGenreId(genreId);
    const defaultTab = GENRE_GROUPS[genreId!]?.tabs[0].value || genreId;
    setSelectedGenreValue(searchParams.get("sub") || defaultTab);
  }

  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status") || "",
  ); // '' or 'ONGOING', 'COMPLETED'
  const [accessTypeFilter, setAccessTypeFilter] = useState<string>(
    searchParams.get("access") || "",
  ); // '' or 'FREE', 'PAID'
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "rating">(
    () => {
      const sort = searchParams.get("sort");
      if (sort === "popular" || sort === "rating") return sort;
      return "latest";
    }
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 무한 스크롤 옵저버
  const { containerRef, isVisible } = useIntersectionObserver();

  // 데이터 쿼리
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useCategoryWorks(selectedGenreValue, {
      status: statusFilter,
      accessType: accessTypeFilter,
      sort:
        sortBy === "latest"
          ? "createdAt"
          : sortBy === "popular"
            ? "likeCount"
            : "rating",
      order: "desc",
      limit: 20,
      keyword: searchQuery,
    });

  // 무한 스크롤 트리거
  useEffect(() => {
    if (isVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 필터 변경 시 URL 업데이트
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedGenreValue && selectedGenreValue !== genreId)
      params.set("sub", selectedGenreValue);
    if (statusFilter) params.set("status", statusFilter);
    if (accessTypeFilter) params.set("access", accessTypeFilter);
    if (sortBy !== "latest") params.set("sort", sortBy);
    
    // 검색어 파라미터 유지
    const currentSearch = searchParams.get("search");
    if (currentSearch) {
      params.set("search", currentSearch);
    }

    // 현재 파라미터와 다른 경우에만 업데이트하여 무한 루프 방지
    const currentString = searchParams.toString();
    const newString = params.toString();

    if (currentString !== newString) {
      setSearchParams(params, { replace: true });
    }
  }, [
    selectedGenreValue,
    statusFilter,
    accessTypeFilter,
    sortBy,
    genreId,
    setSearchParams,
    searchParams,
  ]);

  // UI 헬퍼
  const currentGroup = genreId ? GENRE_GROUPS[genreId] : undefined;
  const title = currentGroup?.label || genreId;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-20">
      {/* 헤더 & 탭 - 통합 Sticky로 변경 */}
      <div className="glass-warm border-b border-mocha-100/50 sticky top-0 z-20 backdrop-blur-md">
        <div className="container mx-auto px-6 py-6 transition-all duration-300">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-4xl font-heading font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-none mb-2">
                {title}
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-serif italic">
                엄선된 {title} 작품을 만나보세요.
              </p>
            </div>

            {/* Follow Genre 버튼 - 백엔드 API 구현 후 활성화
                        <Button
                            variant="outline"
                            className="rounded-full border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-all font-bold"
                        >
                            + Follow Genre
                        </Button>
                        */}
          </div>

          {/* 서브 장르 탭 */}
          {currentGroup && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {currentGroup.tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedGenreValue(tab.value)}
                  className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
                    selectedGenreValue === tab.value
                      ? "bg-mocha-500 text-white shadow-lg scale-105"
                      : "glass hover:bg-mocha-50 hover:text-mocha-900 text-zinc-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 필터 바 - 헤더 내부에 포함되어 있음 */}
        <div className="container mx-auto px-6 py-3 flex items-center justify-between border-t border-mocha-100/30 bg-white/30 backdrop-blur-sm">
          <div className="flex gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mr-2">
              필터
            </span>
            <FilterBadge
              label="전체"
              isActive={statusFilter === ""}
              onClick={() => setStatusFilter("")}
            />
            <FilterBadge
              label="연재중"
              isActive={statusFilter === "ONGOING"}
              onClick={() => setStatusFilter("ONGOING")}
            />
            <FilterBadge
              label="완결"
              isActive={statusFilter === "COMPLETED"}
              onClick={() => setStatusFilter("COMPLETED")}
            />
          </div>

          <div className="flex gap-2 items-center ml-4 border-l border-mocha-100/30 pl-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mr-2">
              가격
            </span>
            <FilterBadge
              label="전체"
              isActive={accessTypeFilter === ""}
              onClick={() => setAccessTypeFilter("")}
            />
            <FilterBadge
              label="무료"
              isActive={accessTypeFilter === "FREE"}
              onClick={() => setAccessTypeFilter("FREE")}
            />
            <FilterBadge
              label="유료"
              isActive={accessTypeFilter === "PAID"}
              onClick={() => setAccessTypeFilter("PAID")}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* 정렬 드롭다운 - 클릭 방식 */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-mocha-600 transition-colors uppercase tracking-wide"
              >
                {sortBy === "latest"
                  ? "최신순"
                  : sortBy === "popular"
                    ? "인기순"
                    : "별점순"}
                <ChevronDown
                  className={`w-4 h-4 ml-1 transition-transform ${sortDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {sortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-100 dark:border-zinc-800 z-30 overflow-hidden ring-1 ring-black/5">
                  <button
                    onClick={() => {
                      setSortBy("popular");
                      setSortDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${sortBy === "popular" ? "bg-zinc-50 dark:bg-zinc-800 text-mocha-600" : ""}`}
                  >
                    인기순
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("latest");
                      setSortDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${sortBy === "latest" ? "bg-zinc-50 dark:bg-zinc-800 text-mocha-600" : ""}`}
                  >
                    최신순
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("rating");
                      setSortDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${sortBy === "rating" ? "bg-zinc-50 dark:bg-zinc-800 text-mocha-600" : ""}`}
                  >
                    별점순
                  </button>
                </div>
              )}
            </div>

            {/* 뷰 모드 토글 */}
            <div className="flex bg-white dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white" : "text-zinc-400 hover:text-zinc-600"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white" : "text-zinc-400 hover:text-zinc-600"}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <>
            {data?.pages.map((page, i) => (
              <div
                key={i}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-6"
                    : "flex flex-col gap-4 mb-6"
                }
              >
                {page.data.map((work: Work) =>
                  viewMode === "grid" ? (
                    <BookCard
                      key={work.id}
                      work={work}
                      showQuickActions={true}
                    />
                  ) : (
                    <ListViewItem key={work.id} work={work} />
                  ),
                )}
              </div>
            ))}

            {/* 무한 스크롤 트리거 */}
            <div
              ref={containerRef}
              className="h-10 flex justify-center items-center"
            >
              {isFetchingNextPage && (
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// 필터 배지 컴포넌트
function FilterBadge({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
        isActive
          ? "bg-mocha-600 text-white border-mocha-600"
          : "glass text-zinc-600 border-mocha-200/50 hover:border-mocha-300"
      }`}
    >
      {label}
    </button>
  );
}

// 리스트 뷰 아이템 컴포넌트
function ListViewItem({ work }: { work: Work }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/works/${work.id}`)}
      className="flex gap-4 p-4 glass-card rounded-xl hover-glow transition-all duration-300 cursor-pointer"
    >
      {/* 썸네일 */}
      <div className="w-24 h-32 shrink-0 bg-zinc-200 rounded-md overflow-hidden">
        {work.coverImageUrl && (
          <img
            src={work.coverImageUrl}
            alt={work.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 py-1">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            {work.title}
          </h3>
          <div className="flex gap-2 text-xs text-zinc-500">
            <span>{work.genre}</span>
            <span>|</span>
            <span>{work.status === "ONGOING" ? "연재중" : "완결"}</span>
          </div>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
          {work.author?.nickname || work.authorNickname}
        </p>
        <p className="text-sm text-zinc-500 line-clamp-2 mb-3">
          {work.synopsis}
        </p>

        <div className="flex gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {work.ratingSum && work.ratingCount
              ? (work.ratingSum / work.ratingCount).toFixed(1)
              : "0.0"}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            댓글 0{" "}
            {/* 댓글 수는 Work 엔티티에 없어서 0으로 표시하거나 API 수정 필요 */}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;
