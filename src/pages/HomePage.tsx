/**
 * 공개 홈 페이지
 * 추천 캐러셀 + 개인화 추천 섹션 + 작품 그리드 + 실시간 순위
 */
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { ContentGrid } from "@/components/home/ContentGrid";
import { TrendKeywordBar } from "@/components/home/TrendKeywordBar";
import { CategoryNavbar } from "@/components/layout/CategoryNavbar";

import { Skeleton } from "@/components/ui/skeleton";
import {
  RankingList,
  RankingListSkeleton,
} from "@/components/home/RankingList";
import { ContinueReadingSection } from "@/components/home/ContinueReadingSection";

import { DenseThemeSection } from "@/components/home/DenseThemeSection";
import { ScrollableSection } from "@/components/home/ScrollableSection";
import { Sparkles, TrendingUp, Zap } from "lucide-react";

import { PersonalizedRecommendationSection } from "@/components/home/PersonalizedRecommendationSection";
import {
  useDiscoveryWorks,
  useSearchWorks,
  useRankings,
} from "@/hooks/useDiscovery";
import { useInfiniteDiscoveryWorks } from "@/hooks/useInfiniteDiscovery";
import { useThemeStore, backgroundThemeClasses } from "@/stores/useTheme";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * 홈 페이지 컴포넌트
 * - 캐러셀: 상위 5개 작품
 * - 개인화 섹션 (로그인 사용자): 읽던 작품 + 취향 추천
 * - 콘텐츠 그리드: 전체 작품 목록
 * - 실시간 순위: 좋아요 기준 상위 10개 (30초마다 갱신)
 */
export const HomePage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

  // 검색어가 있으면 검색 결과, 없으면 전체 작품
  // 30초마다 자동 갱신 (refetchInterval: 30000ms)
  const { data: discoveryData, isLoading: discoveryLoading } =
    useDiscoveryWorks();
  const { data: searchData, isLoading: searchLoading } =
    useSearchWorks(searchQuery);

  const [accessType, setAccessType] = useState<string>("");

  // 0. 인기 콘텐츠 (Weekly Best) - Infinite Scroll
  const {
    data: infiniteBestData,
    fetchNextPage: fetchBestNextPage,
    hasNextPage: hasBestNextPage,
    isFetchingNextPage: isFetchingBestNextPage,
  } = useInfiniteDiscoveryWorks({
    sort: "popular",
    size: 10,
    accessType,
  });
  const bestWorks = infiniteBestData?.pages.flatMap((page) => page.data) || [];

  // 1. 실시간 급상승 (Realtime Rankings)
  const { data: rankingData } = useRankings("REALTIME");
  const risingWorks = rankingData?.data || [];

  // Tab State for Rising Section
  const [activeRisingTab, setActiveRisingTab] = useState("rising");

  // 1-a. 신작 (New)
  const { data: newWorksData } = useDiscoveryWorks({
    sort: "latest",
    limit: 12,
  });
  const newWorks = newWorksData?.data || [];

  // 1-b. 완결 (Completed)
  const { data: completedWorksData } = useDiscoveryWorks({
    status: "COMPLETED",
    sort: "popular",
    limit: 12,
  });
  const completedWorks = completedWorksData?.data || [];

  // 1-c. 이벤트 (Event) - 임시로 무료 인기작 매핑
  const { data: eventWorksData } = useDiscoveryWorks({
    accessType: "FREE",
    sort: "popular",
    limit: 12,
  });
  const eventWorks = eventWorksData?.data || [];

  // Determine works to display in Rising Section
  let risingSectionWorks = risingWorks;
  if (activeRisingTab === "new") {
    risingSectionWorks = newWorks;
  } else if (activeRisingTab === "completed") {
    risingSectionWorks = completedWorks;
  } else if (activeRisingTab === "event") {
    risingSectionWorks = eventWorks;
  }
  // 'event' tab could be handled here or left empty/default

  // 2. 판타지 인기작 (Popular Fantasy)
  const { data: fantasyData } = useDiscoveryWorks({
    genre: "FANTASY",
    sort: "popular",
    limit: 12,
  });
  const fantasyWorks = fantasyData?.data || [];

  // 3. 로맨스 최신작 (Latest Romance)
  const { data: romanceData } = useDiscoveryWorks({
    genre: "ROMANCE",
    sort: "latest", // or 'popular' if preferred
    limit: 12,
  });
  const romanceWorks = romanceData?.data || [];

  const isSearching = searchQuery.length > 0;
  // 데모 데이터 구조: { data: Work[], hasMore: boolean }
  const works = isSearching ? searchData?.data : discoveryData?.data;
  const isLoading = isSearching ? searchLoading : discoveryLoading;

  // 테마별 텍스트 색상
  const textColorClass =
    theme === "light"
      ? "text-zinc-900"
      : theme === "dark"
        ? "text-zinc-100"
        : "text-amber-900";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${backgroundThemeClasses[theme]} grain-overlay`}
    >
      {/* 검색 결과 표시 */}
      {isSearching && (
        <div className={`container mx-auto px-6 py-4 ${textColorClass}`}>
          <p className="text-lg">
            <span className="font-semibold">"{searchQuery}"</span> 검색 결과
          </p>
        </div>
      )}

      {/* 로딩 상태 - Skeleton UI 적용 */}
      {isLoading ? (
        <div className="container mx-auto px-6 py-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[500px]">
            <div className="lg:col-span-3 h-full">
              <Skeleton className="w-full h-full rounded-2xl" />
            </div>
            <div className="lg:col-span-1 h-full">
              <RankingListSkeleton />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 카테고리 네비게이션 (검색 중이 아닐 때만) */}
          {!isSearching && <CategoryNavbar />}
          {/* 상단 히어로 섹션 (캐러셀 + 실시간 순위) */}
          {!isSearching && works && works.length > 0 && (
            <>
              <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[500px]">
                  {/* 메인 배너 (3칸) */}
                  <div className="lg:col-span-3 h-full">
                    <FeaturedCarousel works={works.slice(0, 5)} />
                  </div>

                  {/* 실시간 순위 (1칸) */}
                  <div className="lg:col-span-1 h-full overflow-hidden flex flex-col">
                    {/* limit=5로 제한 및 더보기 링크 - 백엔드 랭킹 API 사용 */}
                    <RankingList
                      works={risingWorks}
                      title="실시간 인기 순위"
                      limit={5}
                      moreLink="/ranking"
                    />
                  </div>
                </div>
              </div>

              {/* 트렌드 키워드 바 */}
              <TrendKeywordBar />
            </>
          )}
          {/* 개인화 추천 섹션 - 로그인한 사용자에게만 표시, 검색 중이 아닐 때만 */}
          {isAuthenticated && !isSearching && (
            <div className="container mx-auto px-6">
              {/* 읽던 작품 섹션 */}
              <ContinueReadingSection />

              {/* 취향 저격 추천작 섹션 */}
              <PersonalizedRecommendationSection />
            </div>
          )}
          {/* 인기 콘텐츠 (Weekly Best) - Scrollable Section */}
          {!isSearching && (
            <div className="space-y-4">
              <div className="container mx-auto px-6 flex items-center justify-between">
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl w-fit">
                  {[
                    { label: "전체", value: "" },
                    { label: "무료 인기", value: "FREE" },
                    { label: "유료 인기", value: "PAID" },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setAccessType(tab.value)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        accessType === tab.value
                          ? "bg-white dark:bg-zinc-700 text-espresso-900 dark:text-white shadow-sm"
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <ScrollableSection
                title="Weekly Best"
                works={bestWorks}
                moreLink={`/category/ALL?sort=popular${accessType ? `&access=${accessType}` : ""}`}
                onEndReached={() => {
                  if (hasBestNextPage) fetchBestNextPage();
                }}
                hasNextPage={hasBestNextPage}
                isFetchingNextPage={isFetchingBestNextPage}
              />
            </div>
          )}
          {/* Dense Discovery Section */}
          {!isSearching && (
            <div className="container mx-auto px-6 py-4 space-y-16 pb-20">
              {/* 1. Discovery Tabs Grid - 실시간 급상승 데이터 연결 */}
              <DenseThemeSection
                title="실시간 급상승"
                subtitle="지금 독자들이 가장 많이 찾는 작품들을 확인하세요."
                icon={<TrendingUp className="w-5 h-5" />}
                works={risingSectionWorks}
                tabs={[
                  { id: "rising", label: "⚡️ 급상승" },
                  { id: "new", label: "✨ 신작" },
                  { id: "event", label: "🎁 이벤트" },
                  { id: "completed", label: "📚 완결" },
                ]}
                onTabChange={setActiveRisingTab}
                viewAllLink="/ranking"
                maxItems={12}
                className="pt-0"
              />

              {/* 2. Personalized Theme Grid - 판타지 인기작 연결 */}
              <DenseThemeSection
                title="취향 저격 판타지"
                subtitle="#먼치킨 #성장형 #사이다"
                icon={<Sparkles className="w-5 h-5" />}
                works={fantasyWorks}
                maxItems={6}
                viewAllLink="/category/FANTASY"
              />

              {/* 3. Another Theme Grid - 로맨스 최신작 연결 */}
              <DenseThemeSection
                title="오늘의 로맨스 픽"
                subtitle="달달함이 필요한 시간"
                icon={<Zap className="w-5 h-5" />}
                works={romanceWorks}
                maxItems={6}
                viewAllLink="/category/ROMANCE"
              />
            </div>
          )}
          {/* 검색 결과일 때만 ContentGrid 표시 */}
          {isSearching && (
            <div className="container mx-auto px-6 py-8">
              <ContentGrid works={works || []} title="검색 결과" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
