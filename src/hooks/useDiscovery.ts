/**
 * 탐색(Discovery) 관련 TanStack Query 훅
 * 공개 작품 목록, 검색, 작품/챕터 상세 조회
 *
 * 참고: 백엔드에 실제 데이터가 존재하므로 데모 폴백 제거됨
 */
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import api from "@/api/client";
import type { Work, Chapter, Genre, PaginatedResponse } from "@/types";

interface DiscoveryParams {
    genre?: Genre | string; // 단일 장르
    genres?: string[]; // 다중 장르
    status?: string; // 연재중/완결 등
    sort?: "latest" | "popular" | "rating" | "createdAt" | "likeCount";
    order?: "asc" | "desc";
    page?: number;
    limit?: number;
    size?: number; // limit과 동일
    enabled?: boolean; // 조건부 쿼리 활성화 (기본: true)
    keyword?: string; // 검색어
}

interface SearchParams {
    q: string;
    genre?: Genre;
    page?: number;
}

/**
 * 공개 작품 목록 조회
 * GET /api/discovery/works
 * 30초마다 자동 갱신 (실시간 순위용)
 */
export const useDiscoveryWorks = (params?: DiscoveryParams) => {
    // enabled 옵션을 별도로 추출하여 API 파라미터에서 제외
    const { enabled = true, ...restParams } = params || {};

    return useQuery<PaginatedResponse<Work>>({
        queryKey: ["discovery", restParams],
        queryFn: async () => {
            // 백엔드 API는 'genres' (배열)를 기대하므로 'genre' 단일 값을 변환
            // 또한 백엔드는 'size'를 기대하지만 프론트엔드에서 'limit'을 사용할 수 있으므로 변환
            const apiParams: Record<string, unknown> = { ...restParams };

            // genre -> genres 변환 (단일 값을 배열로)
            if (restParams?.genre && !restParams?.genres) {
                apiParams.genres = [restParams.genre];
                delete apiParams.genre;
            }

            // limit -> size 변환 (백엔드 파라미터명에 맞춤)
            if (restParams?.limit && !restParams?.size) {
                apiParams.size = restParams.limit;
                delete apiParams.limit;
            }

            const { data } = await api.get("/discovery/works", { params: apiParams });
            // 백엔드 응답: { code, status, message, data: { works: [], pagination: ... } }
            const responseData = data.data;
            const works = responseData?.works || [];

            // 필터링 제거: 모든 작품 표시 (chapterCount 필터는 프로덕션에서 필요 시 재활성화)
            // 기존: const filteredWorks = works.filter((work: Work) => (work.chapterCount || 0) > 0);

            return {
                data: works,
                hasMore: responseData?.pagination?.hasNext || false,
            };
        },
        // enabled 옵션 적용 (providedWorks가 있을 때 불필요한 API 호출 방지)
        enabled: enabled,
        // 검색어 등이 없을 때만 30초마다 자동 갱신 (실시간 순위 표시용)
        // 검색어 등이 없을 때만 30초마다 자동 갱신 (실시간 순위 표시용)
        refetchInterval: (_query) => {
            // 정렬/필터링 조건이 있거나 검색 모드인 경우(query가 유효한 경우) 자동 갱신 중단 여부 결정

            // 단순 레이아웃 옵션(limit, size, page, enabled)은 자동 갱신을 방해하지 않도록 함
            // keyword(검색)나 status(상태 필터)가 있을 때만 중단
            // genre의 경우 장르별 실시간 랭킹이나 신작 목록 갱신을 위해 갱신 허용 가능

            const hasKeyword = restParams?.keyword && restParams.keyword.length > 0;
            // status 필터링이 걸려있으면(완결작 보기 등) 리스트가 고정되는 것이 나을 수 있으나, 신작 업데이트를 위해 갱신 허용할 수도 있음.
            // 여기서는 AI 리뷰 피드백에 따라 "실제 필터링/검색 관련 파라미터" 중 명확히 갱신을 멈춰야 할 것만 체크

            if (hasKeyword) {
                return false;
            }
            return 30000;
        },
    });
};

/**
 * 작품 검색
 * GET /api/discovery/search
 */
export const useSearchWorks = (
    query: string,
    params?: Omit<SearchParams, "q">
) => {
    return useQuery<PaginatedResponse<Work>>({
        queryKey: ["search", query, params],
        queryFn: async () => {
            const { data } = await api.get("/discovery/search", {
                params: { keyword: query, ...params },
            });
            const responseData = data.data;

            return {
                data: responseData?.works || [],
                hasMore: responseData?.pagination?.hasNext || false,
            };
        },
        enabled: query.length > 0, // 검색어가 있을 때만 요청
    });
};

/**
 * 작품 상세 조회 (공개용)
 * GET /api/discovery/works/{id}
 */
export const usePublicWork = (id: string) => {
    return useQuery<Work>({
        queryKey: ["work", id],
        queryFn: async () => {
            const { data } = await api.get(`/discovery/works/${id}`);
            // 백엔드 응답에 chapters가 이미 포함된 경우 그대로 반환
            return data.data;
        },
        enabled: !!id,
    });
};

/**
 * 작품의 챕터 목록 조회
 * 참고: /api/discovery/works/{id} 응답에 chapters 필드가 포함되므로
 * usePublicWork를 활용하여 챕터 목록을 가져옴
 */
export const usePublicChapters = (workId: string) => {
    const workQuery = usePublicWork(workId);

    return {
        ...workQuery,
        // work.chapters를 반환하도록 data 필드 재정의
        data: workQuery.data?.chapters || [],
    };
};

/**
 * 챕터 상세 조회 (공개용)
 * GET /api/discovery/chapters/{id}
 */
export const usePublicChapter = (id: string) => {
    return useQuery<Chapter>({
        queryKey: ["chapter", id],
        queryFn: async () => {
            const { data } = await api.get(`/discovery/chapters/${id}`);
            return data.data;
        },
        enabled: !!id,
    });
};

// === 개인화 추천 관련 훅 ===

interface ContinueReadingItem {
    id: string;
    workId: string;
    lastChapterId: string;
    lastChapterNumber: number;
    progress: number;
    lastReadAt: string;
    work: Work;
}

/**
 * 읽던 작품 목록 조회 (로그인 사용자 전용)
 * GET /api/discovery/continue-reading
 * 
 * 사용자가 읽다가 중단한 작품 목록을 반환합니다.
 */
export const useContinueReading = () => {
    return useQuery<ContinueReadingItem[]>({
        queryKey: ["continueReading"],
        queryFn: async () => {
            try {
                const { data } = await api.get("/discovery/continue-reading");
                return data.data || [];
            } catch {
                // API가 아직 없는 경우 빈 배열 반환
                return [];
            }
        },
        staleTime: 60000, // 1분간 캐시 유지
    });
};

/**
 * 태그 기반 개인화 추천 작품 조회 (로그인 사용자 전용)
 * GET /api/discovery/recommendations
 * 
 * 사용자가 읽은 작품들의 장르/태그를 분석하여
 * 비슷한 취향의 작품을 추천합니다.
 */
export const useTagBasedRecommendations = () => {
    return useQuery<Work[]>({
        queryKey: ["tagBasedRecommendations"],
        queryFn: async () => {
            try {
                const { data } = await api.get("/discovery/recommendations");
                return data.data || [];
            } catch {
                // API가 아직 없는 경우 빈 배열 반환
                return [];
            }
        },
        staleTime: 300000, // 5분간 캐시 유지
    });
};

/**
 * 전체 개인화 추천 데이터 조회
 * 읽던 작품 + 태그 기반 추천을 한 번에 조회
 */
export const usePersonalizedRecommendations = () => {
    const continueReadingQuery = useContinueReading();
    const recommendationsQuery = useTagBasedRecommendations();

    return {
        continueReading: continueReadingQuery.data || [],
        recommendations: recommendationsQuery.data || [],
        isLoading: continueReadingQuery.isLoading || recommendationsQuery.isLoading,
        isError: continueReadingQuery.isError || recommendationsQuery.isError,
    };
};

/**
 * 카테고리별 작품 목록 조회 (무한 스크롤)
 * - 장르, 상태, 정렬 필터 지원
 */
export const useCategoryWorks = (
    genreId: string | undefined,
    params?: Omit<DiscoveryParams, 'genre'>
) => {
    return useInfiniteQuery({
        queryKey: ['category', genreId, params],
        queryFn: async ({ pageParam = 0 }) => {
            // genreId가 있을 때만 호출됨
            if (!genreId) return { data: [], hasMore: false, nextPage: undefined };

            const queryParams: Record<string, unknown> = {
                page: pageParam,
                size: params?.limit || 20,
                sort: params?.sort || 'createdAt',
                order: params?.order || 'desc'
            };

            // 다중 장르 처리 (comma separated)
            if (genreId.includes(',')) {
                queryParams.genres = genreId;
            } else {
                queryParams.genres = genreId;
            }

            if (params?.status) queryParams.status = params.status;

            const { data } = await api.get('/discovery/works', { params: queryParams });
            const responseData = data.data; // { works, pagination }

            return {
                data: responseData?.works || [],
                hasMore: responseData?.pagination?.hasNext || false,
                nextPage: responseData?.pagination?.hasNext ? pageParam + 1 : undefined
            };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        enabled: !!genreId,
    });
};

/**
 * 랭킹 조회
 * 탭 비활성 시 백그라운드 폴링 중단
 */
export const useRankings = (period: string, genre?: string) => {
    return useQuery<PaginatedResponse<Work>>({
        queryKey: ['rankings', period, genre],
        queryFn: async () => {
            const { data } = await api.get('/discovery/rankings', {
                params: { period, genre, size: 100 }
            });
            const responseData = data.data;
            return {
                data: responseData?.works || [],
                hasMore: false
            };
        },
        refetchInterval: 30000,
        refetchIntervalInBackground: false, // 탭 비활성 시 백그라운드 폴링 중단
        refetchOnWindowFocus: true, // 탭 포커스 시 자동 갱신
    });
};
