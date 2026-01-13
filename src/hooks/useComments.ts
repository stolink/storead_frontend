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
export const useComments = (chapterId: string, relationId?: string, sort: string = 'latest') => {
  return useInfiniteQuery<PaginatedResponse<Comment>>({
    queryKey: ["comments", String(chapterId), relationId ? String(relationId) : undefined, sort],
    queryFn: async ({ pageParam }) => {
      const cid = String(chapterId);
      const rid = relationId ? String(relationId) : undefined;

      if (!rid) {
        return { data: [], hasMore: false, nextCursor: undefined };
      }
      const { data } = await api.get(`/chapters/${cid}/comments`, {
        params: {
          relationId,
          sort,
          cursor: pageParam,
          page: typeof pageParam === 'number' ? pageParam : 0
        },
      });
      // 백엔드 응답 구조: { code, status, data: { comments: [...], pagination: {...} } }
      const responseData = data.data || data;
      const rawComments = responseData.comments || responseData.data || [];
      const rawCount = Array.isArray(rawComments) ? rawComments.length : 0;

      console.log(`[DEBUG] useComments (rid: ${rid}):`, {
        rawCount,
        firstCommentKeys: rawCount > 0 ? Object.keys(rawComments[0]) : [],
        firstCommentSample: rawCount > 0 ? rawComments[0] : null,
      });

      let filteredComments = rawComments;
      // [Safety] Client-side filtering to ensure comments belong to the active relation
      // This prevents legacy data with empty relationId from leaking into the list.
      if (Array.isArray(rawComments) && rid) {
        filteredComments = rawComments.filter((c: any) => {
          // Try different possible field names
          const cRid = c.relationId || c.relation_id || c.linkId || c.activeRelationId;
          return String(cRid) === rid;
        });
      }

      console.log(`[DEBUG] Filter result (rid: ${rid}):`, {
        filteredCount: filteredComments.length,
      });

      return {
        data: Array.isArray(filteredComments) ? filteredComments : [],
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
  return useQuery<Comment[]>({
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
export const useCreateComment = (chapterId: string, relationId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newComment: CreateCommentRequest) => {
      // console.log("[DEBUG] creating comment payload:", newComment);
      const { data } = await api.post(`/chapters/${chapterId}/comments`, newComment);
      return data;
    },
    onSuccess: () => {
      // 댓글 목록 갱신 (관계별 격리 키 준수 + 모든 정렬 상태 키 무효화)
      queryClient.invalidateQueries({ queryKey: ["comments", chapterId, relationId] });
    },
  });
};

/**
 * 대댓글 생성
 * POST /api/comments/{parentId}/replies
 */
export const useCreateReply = (chapterId: string, relationId?: string) => {
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
        chapterId,
        relationId, // 대댓글에도 관계 ID 포함하여 격리 강화
      });
      return data;
    },
    onSuccess: () => {
      // 부모 댓글이 속한 챕터 및 관계의 댓글 목록 갱신 (모든 정렬 상태 포함)
      queryClient.invalidateQueries({ queryKey: ["comments", chapterId, relationId] });
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
            likeCount: Math.max(0, newLikeCount),
          }
          : comment
      ),
    })),
  } as typeof oldData;
};

/**
 * 댓글 좋아요 토글 (낙관적 업데이트)
 * POST /api/comments/{id}/like
 * 
 * @param chapterId - 현재 챕터 ID (상태 오염 방지를 위해 특정 챕터만 업데이트)
 */
export const useToggleCommentLike = (chapterId: string, relationId?: string, sort: string = 'latest') => {
  const queryClient = useQueryClient();
  const commentQueryKey = ["comments", chapterId, relationId, sort];

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { data } = await api.post(`/comments/${commentId}/like`);
      const responseData = data.data || data;
      return {
        commentId,
        isLiked: responseData.isLiked,
        likeCount: responseData.likeCount,
      };
    },
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: commentQueryKey });
      const previousData = queryClient.getQueryData<{ pages: PaginatedResponse<Comment>[]; pageParams: unknown[] }>(
        commentQueryKey
      );

      queryClient.setQueryData<{ pages: PaginatedResponse<Comment>[]; pageParams: unknown[] }>(
        commentQueryKey,
        (oldData) => {
          if (!oldData) return oldData;

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
    onSuccess: (data) => {
      queryClient.setQueryData<{ pages: PaginatedResponse<Comment>[]; pageParams: unknown[] }>(
        commentQueryKey,
        (oldData) => updateCommentInCache(oldData, data.commentId, data.isLiked, data.likeCount)
      );
    },
    onError: (_error, _commentId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(commentQueryKey, context.previousData);
      }
    },
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
