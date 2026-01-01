/**
 * 댓글(Comments) 관련 TanStack Query 훅
 * 무한 스크롤, 댓글 생성, 좋아요 토글 (낙관적 업데이트)
 */
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/api/client";
import type { Comment, PaginatedResponse, CreateCommentRequest } from "@/types";

/**
 * 챕터 댓글 목록 조회 (무한 스크롤)
 * GET /api/chapters/{chapterId}/comments
 */
export const useComments = (chapterId: string) => {
  return useInfiniteQuery<PaginatedResponse<Comment>>({
    queryKey: ["comments", chapterId],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get(`/chapters/${chapterId}/comments`, {
        params: { cursor: pageParam },
      });
      return data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!chapterId,
  });
};

/**
 * 대댓글 조회 (Lazy Loading)
 * GET /api/comments/{id}/replies
 */
export const useReplies = (commentId: string, enabled: boolean = false) => {
  return useQuery<Comment[]>({
    queryKey: ["replies", commentId],
    queryFn: async () => {
      const { data } = await api.get(`/comments/${commentId}/replies`);
      return data;
    },
    enabled: enabled && !!commentId,
  });
};

interface CreateCommentParams {
  chapterId: string;
  data: CreateCommentRequest;
}

/**
 * 댓글 작성
 * POST /api/chapters/{chapterId}/comments
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chapterId, data }: CreateCommentParams) => {
      console.log('[DEBUG] Creating comment:', { chapterId, data });
      const response = await api.post(`/chapters/${chapterId}/comments`, data);
      console.log('[DEBUG] Comment created:', response.data);
      return response.data;
    },
    onError: (error) => {
      console.error('[DEBUG] Comment creation failed:', error);
    },
    onSuccess: (_data, { chapterId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", chapterId] });
    },
  });
};

/**
 * 대댓글 작성
 * POST /api/comments/{id}/replies
 */
export const useCreateReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      parentId,
      content,
    }: {
      parentId: string;
      content: string;
    }) => {
      const { data } = await api.post(`/comments/${parentId}/replies`, {
        content,
      });
      return data;
    },
    onSuccess: (_data, { parentId }) => {
      queryClient.invalidateQueries({ queryKey: ["replies", parentId] });
      // 부모 댓글이 속한 챕터의 댓글 목록도 갱신
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
};

/**
 * 댓글 좋아요 토글 (낙관적 업데이트)
 * POST /api/comments/{id}/like
 */
export const useToggleCommentLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { data } = await api.post(`/comments/${commentId}/like`);
      return data;
    },
    // 낙관적 업데이트 (setQueriesData로 간소화)
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });

      // setQueriesData로 'comments' 키를 포함하는 모든 쿼리 일괄 업데이트
      queryClient.setQueriesData<{ pages?: PaginatedResponse<Comment>[] }>(
        { queryKey: ["comments"] },
        (oldData) => {
          if (!oldData?.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.map((comment) =>
                comment.id === commentId
                  ? {
                    ...comment,
                    isLiked: !comment.isLiked,
                    likeCount: comment.isLiked
                      ? comment.likeCount - 1
                      : comment.likeCount + 1,
                  }
                  : comment
              ),
            })),
          };
        }
      );

      return {};
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
};

/**
 * 댓글 삭제
 * DELETE /api/comments/{id}
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      await api.delete(`/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
};
