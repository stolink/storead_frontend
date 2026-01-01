/**
 * 북마크(읽은 위치) 관련 TanStack Query 훅
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Bookmark } from "@/types";

/**
 * 챕터 북마크 조회
 * GET /api/bookmarks/{chapterId}
 */
export const useBookmark = (chapterId: string) => {
  return useQuery<Bookmark | null>({
    queryKey: ["bookmark", chapterId],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/bookmarks/${chapterId}`);
        return data;
      } catch {
        return null; // 북마크가 없는 경우
      }
    },
    enabled: !!chapterId,
  });
};

interface SaveBookmarkParams {
  chapterId: string;
  position: number;
}

/**
 * 북마크 저장/수정
 * POST /api/bookmarks/{chapterId}
 */
export const useSaveBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chapterId, position }: SaveBookmarkParams) => {
      const { data } = await api.post(`/bookmarks/${chapterId}`, { position });
      return data;
    },
    onSuccess: (_data, { chapterId }) => {
      queryClient.invalidateQueries({ queryKey: ["bookmark", chapterId] });
    },
  });
};

interface ReadingProgress {
  lastChapterId: string;
  lastChapterNumber: number;
  lastPosition: number;
}

/**
 * 작품별 읽기 진행도 조회
 * GET /api/works/{workId}/reading-progress
 * 로그인된 사용자만 호출
 */
export const useReadingProgress = (workId: string) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery<ReadingProgress | null>({
    queryKey: ["readingProgress", workId],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/works/${workId}/reading-progress`);
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!workId && isAuthenticated, // 로그인된 경우에만 API 호출
  });
};
