/**
 * 탐색(Discovery) 관련 TanStack Query 훅
 * 공개 작품 목록, 검색, 작품/챕터 상세 조회
 *
 * 참고: 백엔드에 실제 데이터가 존재하므로 데모 폴백 제거됨
 */
import { useQuery } from "@tanstack/react-query";
import api from "@/api/client";
import type { Work, Chapter, Genre, PaginatedResponse } from "@/types";

interface DiscoveryParams {
    genre?: Genre;
    sort?: "latest" | "popular" | "rating";
    page?: number;
    limit?: number;
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
    return useQuery<PaginatedResponse<Work>>({
        queryKey: ["discovery", params],
        queryFn: async () => {
            const { data } = await api.get("/discovery/works", { params });
            // 백엔드 응답: { code, status, message, data: { works: [], pagination: ... } }
            const responseData = data.data;
            const works = responseData?.works || [];

            // 회차(Episode)가 0개인 작품은 리스트에 노출되지 않도록 필터링
            // RankingList 등 UI 컴포넌트에서 중복 필터링하지 않도록 여기서 확실하게 처리
            const filteredWorks = works.filter((work: Work) => (work.chapterCount || 0) > 0);

            return {
                data: filteredWorks,
                hasMore: responseData?.pagination?.hasNext || false,
            };
        },
        // 검색어 등이 없을 때만 30초마다 자동 갱신 (실시간 순위 표시용)
        refetchInterval: (_query) => {
            // 정렬/필터링 조건이 있거나 검색 모드인 경우(query가 유효한 경우) 자동 갱신 중단
            // 참고: useQuery의 queryKey에 params가 포함되어 있으므로 params 변경 시 쿼리가 다시 실행됨
            const hasSearchParams = params && Object.keys(params).length > 0;
            const hasKeyword = params && 'keyword' in params && !!params.keyword;

            if (hasSearchParams || hasKeyword) {
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
