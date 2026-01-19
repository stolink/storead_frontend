import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/api/client";
import type { Work, PaginatedResponse, Genre } from "@/types";

interface DiscoveryParams {
  genre?: Genre | string;
  genres?: string[];
  status?: string;
  sort?: "latest" | "popular" | "rating" | "createdAt" | "likeCount";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  size?: number;
  enabled?: boolean;
  keyword?: string;
  accessType?: string; // FREE / PAID
}

export const useInfiniteDiscoveryWorks = (
  params: DiscoveryParams = {},
) => {
  return useInfiniteQuery<PaginatedResponse<Work>>({
    queryKey: ["discovery", "infinite", params],
    queryFn: async ({ pageParam = 0 }) => {
      // Transform params for API
      const apiParams: Record<string, unknown> = {
        ...params,
        page: pageParam,
        size: params.size || 20,
      };

      // Handle genres array conversion if needed (same as regular hook)
      if (params.genre && !params.genres) {
        apiParams.genres = [params.genre];
        delete apiParams.genre;
      }

      const { data } = await api.get("/discovery/works", { params: apiParams });
      const responseData = data.data;

      // Normalize response to match PaginatedResponse interface
      return {
        data: responseData?.works || [],
        hasMore: responseData?.pagination?.hasNext || false,
        pagination: responseData?.pagination,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const hasNext = lastPage?.pagination?.hasNext;
      return hasNext ? allPages.length : undefined;
    },
  });
};
