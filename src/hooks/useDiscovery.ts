/**
 * 탐색(Discovery) 관련 TanStack Query 훅
 * 공개 작품 목록, 검색, 작품/챕터 상세 조회
 */
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import type { Work, Chapter, Genre, PaginatedResponse } from '@/types';

interface DiscoveryParams {
    genre?: Genre;
    sort?: 'latest' | 'popular' | 'rating';
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
 * GET /api/discovery
 */
export const useDiscoveryWorks = (params?: DiscoveryParams) => {
    return useQuery<PaginatedResponse<Work>>({
        queryKey: ['discovery', params],
        queryFn: async () => {
            const { data } = await api.get('/discovery', { params });
            return data;
        },
    });
};

/**
 * 작품 검색
 * GET /api/discovery/search
 */
export const useSearchWorks = (query: string, params?: Omit<SearchParams, 'q'>) => {
    return useQuery<PaginatedResponse<Work>>({
        queryKey: ['search', query, params],
        queryFn: async () => {
            const { data } = await api.get('/discovery/search', {
                params: { q: query, ...params },
            });
            return data;
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
        queryKey: ['work', id],
        queryFn: async () => {
            const { data } = await api.get(`/discovery/works/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

/**
 * 작품의 챕터 목록 조회
 * GET /api/works/{workId}/chapters (공개용은 discovery 경로 사용)
 */
export const usePublicChapters = (workId: string) => {
    return useQuery<Chapter[]>({
        queryKey: ['chapters', workId],
        queryFn: async () => {
            const { data } = await api.get(`/discovery/works/${workId}/chapters`);
            return data;
        },
        enabled: !!workId,
    });
};

/**
 * 챕터 상세 조회 (공개용)
 * GET /api/discovery/chapters/{id}
 */
export const usePublicChapter = (id: string) => {
    return useQuery<Chapter>({
        queryKey: ['chapter', id],
        queryFn: async () => {
            const { data } = await api.get(`/discovery/chapters/${id}`);
            return data;
        },
        enabled: !!id,
    });
};
