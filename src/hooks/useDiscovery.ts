/**
 * 탐색(Discovery) 관련 TanStack Query 훅
 * 공개 작품 목록, 검색, 작품/챕터 상세 조회
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

// TODO: 백엔드 연결 시 제거 (데모 데이터)
import { DEMO_WORKS, DEMO_CHAPTERS } from "@/data/demo";

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
    queryKey: ["discovery", params],
    queryFn: async () => {
      try {
        const { data } = await api.get("/discovery/works", { params });
        // 백엔드 응답: { code, status, message, data: { works: [], pagination: ... } }
        // ApiResponse 래퍼를 벗겨내야 함 (axios response.data -> ApiResponse -> ApiResponse.data)
        const responseData = data.data;

        return {
          data: responseData.works,
          hasMore: responseData.pagination.hasNext,
        };
      } catch (error) {
        console.warn("[Demo] 백엔드 연결 실패, 데모 데이터를 사용합니다.");
        return {
          data: DEMO_WORKS,
          hasMore: false,
        };
      }
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
      try {
        const { data } = await api.get("/discovery/search", {
          params: { q: query, ...params },
        });
        const responseData = data.data;

        return {
          data: responseData.works,
          hasMore: responseData.pagination.hasNext,
        };
      } catch (error) {
        // 데모 검색 (제목 필터링)
        const filtered = DEMO_WORKS.filter((w) => w.title.includes(query));
        return {
          data: filtered,
          hasMore: false,
        };
      }
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
      try {
        const { data } = await api.get(`/discovery/works/${id}`);
        return data.data;
      } catch (error) {
        const work = DEMO_WORKS.find((w) => w.id === id);
        if (!work) throw error;
        return work;
      }
    },
    enabled: !!id,
  });
};

/**
 * 작품의 챕터 목록 조회
 * GET /api/discovery/works/{workId}/chapters (공개용은 discovery 경로 사용)
 */
export const usePublicChapters = (workId: string) => {
  return useQuery<Chapter[]>({
    queryKey: ["chapters", workId],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/discovery/chapters/${workId}`);
        return data.data;
      } catch (error) {
        return DEMO_CHAPTERS[workId] || [];
      }
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
    queryKey: ["chapter", id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/discovery/chapters/${id}`);
        return data.data;
      } catch (error) {
        // 데모 챕터 찾기
        for (const workId in DEMO_CHAPTERS) {
          const found = DEMO_CHAPTERS[workId].find((c) => c.id === id);
          if (found) return found;
        }
        throw error;
      }
    },
    enabled: !!id,
  });
};
