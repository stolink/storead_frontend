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
        params: {
          cursor: pageParam,
          // pageParam이 문자열(커서)일 경우 page 파라미터로 전송하지 않음
          page: typeof pageParam === 'number' ? pageParam : 0
        },
      });
      // console.log('[DEBUG] Comments API Response:', data);

      // 백엔드 응답 구조: { code, status, data: { comments: [...], pagination: {...} } }
      const responseData = data.data || data;
      const comments = responseData.comments || responseData.data || [];

      return {
        data: Array.isArray(comments) ? comments : [],
        hasMore: responseData.pagination?.hasNext || false,
        nextCursor: responseData.pagination?.nextCursor,
      };
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
export const useReplies = (commentId: string, isOpen: boolean) => {
  return useQuery({
    queryKey: ["replies", commentId],
    queryFn: async () => {
      const { data } = await api.get(`/comments/${commentId}/replies`);
      // console.log('[DEBUG] Replies API Response:', data);
      const responseData = data.data || data;
      return responseData || [];
    },
    enabled: !!commentId && isOpen,
  });
};

/**
 * 댓글 생성
 * POST /api/comments
 */
export const useCreateComment = (chapterId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newComment: CreateCommentRequest) => {
      // console.log("[DEBUG] creating comment payload:", newComment);
      const { data } = await api.post("/comments", newComment);
      return data;
    },
    onSuccess: () => {
      // 댓글 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["comments", chapterId] });
    },
  });
};

/**
 * 대댓글 생성
 * POST /api/comments/{parentId}/replies
 */
export const useCreateReply = (chapterId: string) => {
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
        chapterId: parseInt(chapterId), // 챕터 ID 포함
      });
      return data;
    },
    onSuccess: () => {
      // 부모 댓글의 답글 목록은 invalidateQueries로 갱신
      // (지금은 간단히 전체 comments 쿼리를 무효화하거나, 해당 comment의 답글만 refetch 할 수도 있음)
      queryClient.invalidateQueries({ queryKey: ["comments", chapterId] });

      // 부모 댓글이 속한 챕터의 댓글 목록도 갱신
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
};

const updateCommentInCache = (
  oldData: { pages: PaginatedResponse<Comment>[]; pageParams: unknown[] } | undefined,
  commentId: string,
  newIsLiked: boolean,
  newLikeCount: number
) => {
  if (!oldData) return oldData;
  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.map((comment) =>
        comment.id === commentId
          ? {
            ...comment,
            isLiked: newIsLiked,
            likeCount: newLikeCount,
          }
          : comment
      ),
    })),
  };
};

/**
 * 댓글 좋아요 토글 (낙관적 업데이트)
 * POST /api/comments/{id}/like
 * 
 * @param chapterId - 현재 챕터 ID (상태 오염 방지를 위해 특정 챕터만 업데이트)
 */
export const useToggleCommentLike = (chapterId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { data } = await api.post(`/comments/${commentId}/like`);
      // 서버 응답에서 isLiked, likeCount 추출
      const responseData = data.data || data;
      return {
        commentId,
        isLiked: responseData.isLiked,
        likeCount: responseData.likeCount,
      };
    },
    // 낙관적 업데이트 - 특정 chapterId의 댓글만 업데이트 (상태 오염 방지)
    onMutate: async (commentId) => {
      // 해당 챕터의 댓글 쿼리만 취소
      await queryClient.cancelQueries({ queryKey: ["comments", chapterId] });

      // 이전 상태 저장 (롤백용)
      const previousData = queryClient.getQueryData<{ pages: PaginatedResponse<Comment>[]; pageParams: unknown[] }>(
        ["comments", chapterId]
      );

      // 낙관적 업데이트
      queryClient.setQueryData<{ pages: PaginatedResponse<Comment>[]; pageParams: unknown[] }>(
        ["comments", chapterId],
        (oldData) => {
          if (!oldData) return oldData;

          // 현재 상태 찾기
          let targetComment: Comment | undefined;
          for (const page of oldData.pages) {
            targetComment = page.data.find(c => c.id === commentId);
            if (targetComment) break;
          }

          if (!targetComment) return oldData;

          return updateCommentInCache(
            oldData,
            commentId,
            !targetComment.isLiked,
            targetComment.isLiked ? targetComment.likeCount - 1 : targetComment.likeCount + 1
          );
        }
      );

      return { previousData };
    },
    // 서버 응답으로 캐시 최종 업데이트 (Race Condition 방지)
    onSuccess: (data) => {
      queryClient.setQueryData<{ pages: PaginatedResponse<Comment>[]; pageParams: unknown[] }>(
        ["comments", chapterId],
        (oldData) => updateCommentInCache(oldData, data.commentId, data.isLiked, data.likeCount)
      );
    },
    // 에러 시 롤백
    onError: (_error, _commentId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["comments", chapterId], context.previousData);
      }
    },
    // invalidation을 onSettled에서 제거하여 서버 응답 유지
    onSettled: () => {
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
