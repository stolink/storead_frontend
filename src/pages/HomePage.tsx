/**
 * 공개 홈 페이지
 * 추천 캐러셀 + 개인화 추천 섹션 + 작품 그리드 + 실시간 순위
 */
import { useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { FeaturedCarousel } from '@/components/home/FeaturedCarousel';
import { ContentGrid } from '@/components/home/ContentGrid';
import { BookCard } from '@/components/home/BookCard';
import { RankingList } from '@/components/home/RankingList';
import { ContinueReadingSection } from '@/components/home/ContinueReadingSection';
import { WorkGridSection } from '@/components/home/WorkGridSection';
import { PersonalizedRecommendationSection } from '@/components/home/PersonalizedRecommendationSection';
import { useDiscoveryWorks, useSearchWorks, useRankings } from '@/hooks/useDiscovery';
import { useThemeStore, backgroundThemeClasses } from '@/stores/useTheme';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * 홈 페이지 컴포넌트
 * - 캐러셀: 상위 5개 작품
 * - 개인화 섹션 (로그인 사용자): 읽던 작품 + 취향 추천
 * - 콘텐츠 그리드: 전체 작품 목록
 * - 실시간 순위: 좋아요 기준 상위 10개 (30초마다 갱신)
 */
export const HomePage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

  // 검색어가 있으면 검색 결과, 없으면 전체 작품
  // 30초마다 자동 갱신 (refetchInterval: 30000ms)
  const { data: discoveryData, isLoading: discoveryLoading } = useDiscoveryWorks();
  const { data: searchData, isLoading: searchLoading } = useSearchWorks(searchQuery);

  // 실시간 인기 순위용 데이터 (likeCount DESC 정렬, 30초마다 자동 갱신)
  const { data: rankingData } = useRankings('REALTIME');
  const rankingWorks = rankingData?.data || [];

  const isSearching = searchQuery.length > 0;
  // 데모 데이터 구조: { data: Work[], hasMore: boolean }
  const works = isSearching ? searchData?.data : discoveryData?.data;
  const isLoading = isSearching ? searchLoading : discoveryLoading;

  // 테마별 텍스트 색상
  const textColorClass = theme === 'light'
    ? 'text-zinc-900'
    : theme === 'dark'
      ? 'text-zinc-100'
      : 'text-amber-900';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${backgroundThemeClasses[theme]}`}>
      {/* 검색 결과 표시 */}
      {isSearching && (
        <div className={`container mx-auto px-6 py-4 ${textColorClass}`}>
          <p className="text-lg">
            <span className="font-semibold">"{searchQuery}"</span> 검색 결과
          </p>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-mocha-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* 카테고리 네비게이션 (검색 중이 아닐 때만) */}
          {!isSearching && (
            <div className="container mx-auto px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 mb-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-4">
                <CategoryLink label="홈" path="/" isActive={true} />
                <CategoryLink label="판타지" path="/category/FANTASY" />
                <CategoryLink label="로맨스" path="/category/ROMANCE" />
                <CategoryLink label="무협" path="/category/MARTIAL_ARTS" />
                <CategoryLink label="랭킹" path="/ranking" />
              </div>
            </div>
          )}

          {/* 상단 히어로 섹션 (캐러셀 + 실시간 순위) */}
          {!isSearching && works && works.length > 0 && (
            <div className="container mx-auto px-6 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[500px]">
                {/* 메인 배너 (3칸) */}
                <div className="lg:col-span-3 h-full">
                  <FeaturedCarousel works={works.slice(0, 5)} />
                </div>

                {/* 실시간 순위 (1칸) */}
                <div className="lg:col-span-1 h-full overflow-hidden flex flex-col">
                  {/* limit=5로 제한 및 더보기 링크 - 백엔드 랭킹 API 사용 */}
                  <RankingList works={rankingWorks} title="실시간 인기 순위" limit={5} moreLink="/ranking" />
                </div>
              </div>
            </div>
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

          {/* 인기 콘텐츠 (고정 그리드 6개) */}
          {!isSearching && (
            <div className="container mx-auto px-6 py-8">
              {/* 인기 작품 헤더 - 타이틀 옆 > 스타일 */}
              <div className="flex items-center gap-2 mb-6">
                <Link
                  to="/category/ALL?sort=popular"
                  className="group flex items-center gap-1 cursor-pointer"
                >
                  <h2 className="text-2xl font-bold font-heading text-zinc-900 dark:text-zinc-100 group-hover:text-mocha-600 transition-colors">
                    인기 작품
                  </h2>
                  <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-mocha-600 transition-colors" />
                </Link>
              </div>

              {/* 6개 그리드 */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {(works ? works.slice(0, 6) : Array(6).fill(null)).map((work, idx) => (
                  work ? (
                    <div key={work.id}>
                      <BookCard work={work} />
                    </div>
                  ) : (
                    <div key={idx} className="aspect-[2/3] bg-zinc-100 rounded-lg animate-pulse" />
                  )
                ))}
              </div>
            </div>
          )}

          {/* 장르별 섹션 (그리드) */}
          {!isSearching && (
            <div className="pb-12 space-y-8">
              <WorkGridSection title="판타지 소설" genre="FANTASY" limit={6} moreLink="/category/FANTASY" />
              <WorkGridSection title="로맨스 소설" genre="ROMANCE" limit={6} moreLink="/category/ROMANCE" />
              <WorkGridSection title="무협 소설" genre="MARTIAL_ARTS" limit={6} moreLink="/category/MARTIAL_ARTS" />
            </div>
          )}

          {/* 검색 결과일 때만 ContentGrid 표시 */}
          {isSearching && (
            <div className="container mx-auto px-6 py-8">
              <ContentGrid
                works={works || []}
                title="검색 결과"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

// 카테고리 링크 컴포넌트
import { Link } from 'react-router-dom';
function CategoryLink({ label, path, isActive }: { label: string, path: string, isActive?: boolean }) {
  return (
    <Link
      to={path}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${isActive
        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' // 홈은 활성 상태 스타일 (데모용)
        : path === window.location.pathname // 실제 활성 상태 체크는 useLocation 필요하지만 여기선 간단히
          ? 'bg-zinc-900 text-white'
          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
        }`}
    >
      {label}
    </Link>
  );
}

export default HomePage;
