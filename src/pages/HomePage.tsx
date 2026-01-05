/**
 * 공개 홈 페이지
 * 추천 캐러셀 + 작품 그리드 + 실시간 순위
 */
import { useSearchParams } from 'react-router-dom';
import { FeaturedCarousel } from '@/components/home/FeaturedCarousel';
import { ContentGrid } from '@/components/home/ContentGrid';
import { RankingList } from '@/components/home/RankingList';
import { useDiscoveryWorks, useSearchWorks } from '@/hooks/useDiscovery';
import { useThemeStore, backgroundThemeClasses } from '@/stores/useTheme';

/**
 * 홈 페이지 컴포넌트
 * - 캐러셀: 상위 5개 작품
 * - 콘텐츠 그리드: 전체 작품 목록
 * - 실시간 순위: 좋아요 기준 상위 10개 (30초마다 갱신)
 */
export const HomePage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const { theme } = useThemeStore();

  // 검색어가 있으면 검색 결과, 없으면 전체 작품
  // 30초마다 자동 갱신 (refetchInterval: 30000ms)
  const { data: discoveryData, isLoading: discoveryLoading } = useDiscoveryWorks();
  const { data: searchData, isLoading: searchLoading } = useSearchWorks(searchQuery);

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
          {/* 검색 중이 아닐 때만 캐러셀 표시 */}
          {!isSearching && works && works.length > 0 && (
            <FeaturedCarousel works={works.slice(0, 5)} />
          )}

          {/* 메인 콘텐츠 + 실시간 순위 레이아웃 */}
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* 메인 콘텐츠 그리드 */}
              <div className="lg:col-span-3">
                <ContentGrid
                  works={works || []}
                  title={isSearching ? '검색 결과' : '인기 콘텐츠'}
                />
              </div>

              {/* 사이드바: 실시간 순위 (검색 중이 아닐 때만) */}
              {!isSearching && works && works.length > 0 && (
                <div className="lg:col-span-1">
                  <RankingList works={works} title="실시간 인기 순위" />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
