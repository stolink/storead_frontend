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

// Query Key Factory
export const commentKeys = {
  all: ["comments"] as const,
  lists: () => [...commentKeys.all, "list"] as const,
  list: (chapterId: string, relationId: string = "", sort: string = "latest") =>
    [
      ...commentKeys.lists(),
      String(chapterId),
      String(relationId),
      sort,
    ] as const,
  replies: (commentId: string) =>
    [...commentKeys.all, "replies", commentId] as const,
};

/**
 * 챕터 댓글 목록 조회 (무한 스크롤)
 * GET /api/chapters/{chapterId}/comments
 */
export const useComments = (
  chapterId: string,
  relationId?: string,
  sort: string = "latest",
) => {
  return useInfiniteQuery<PaginatedResponse<Comment>>({
    queryKey: commentKeys.list(chapterId, relationId, sort),
    queryFn: async ({ pageParam }) => {
      const cid = String(chapterId);
      const { data } = await api.get(`/chapters/${cid}/comments`, {
        params: {
          relationId,
          sort,
          cursor: pageParam,
          page: typeof pageParam === "number" ? pageParam : 0,
        },
      });
      // 백엔드 응답 구조: { code, status, data: { comments: [...], pagination: {...} } }
      const responseData = data.data || data;
      const rawComments = responseData.comments || responseData.data || [];

      // DTO Mapping
      const mappedComments = rawComments.map(
        (
          c: Comment & {
            userId?: string;
            userNickname?: string;
            userAvatarUrl?: string;
          },
        ) => ({
          ...c,
          author: c.author || {
            id: c.userId,
            nickname: c.userNickname,
            profileImageUrl: c.userAvatarUrl,
          },
        }),
      );

      return {
        data: Array.isArray(mappedComments) ? mappedComments : [],
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
    queryKey: commentKeys.replies(commentId),
    queryFn: async () => {
      const { data } = await api.get(`/comments/${commentId}/replies`);
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
    mutationFn: async (payload: CreateCommentRequest) => {
      const fullPayload: CreateCommentRequest = {
        chapterId,
        relationId,
        ...payload,
      };
      if (!fullPayload.chapterId) {
        throw new Error("chapterId is required");
      }
      const { data } = await api.post(
        `/chapters/${fullPayload.chapterId}/comments`,
        fullPayload,
      );
      return data;
    },
    onSuccess: () => {
      // 해당 챕터의 모든 댓글 캐시를 무효화
      // commentKeys.lists() -> ["comments", "list"]
      // invalidateQueries({ queryKey: ["comments", "list", chapterId] })
      queryClient.invalidateQueries({
        queryKey: [...commentKeys.lists(), String(chapterId)],
        exact: false,
      });
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
        relationId,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      // 대댓글 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: commentKeys.replies(variables.parentId),
      });

      // 해당 챕터의 댓글 캐시도 무효화 (답글 수 업데이트 등)
      queryClient.invalidateQueries({
        queryKey: [...commentKeys.lists(), String(chapterId)],
        exact: false,
      });
    },
  });
};

const updateCommentInCache = (
  oldData:
    | { pages: PaginatedResponse<Comment>[]; pageParams: unknown[] }
    | undefined,
  commentId: string,
  newIsLiked: boolean,
  newLikeCount: number,
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
          : comment,
      ),
    })),
  } as typeof oldData;
};

/**
 * 댓글 좋아요 토글 (낙관적 업데이트)
 * POST /api/comments/{id}/like
 */
export const useToggleCommentLike = (
  chapterId: string,
  relationId?: string,
  sort: string = "latest",
) => {
  const queryClient = useQueryClient();
  const listQueryKey = commentKeys.list(chapterId, relationId, sort);

  return useMutation({
    mutationFn: async ({
      commentId,
      parentId,
    }: {
      commentId: string;
      parentId?: string | null;
    }) => {
      const { data } = await api.post(`/comments/${commentId}/like`);
      const responseData = data.data || data;
      return {
        commentId,
        parentId,
        isLiked: responseData.isLiked,
        likeCount: responseData.likeCount,
      };
    },
    onMutate: async ({ commentId }) => {
      // 1. Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: listQueryKey });

      // 2. Snapshot the previous value
      const previousData = queryClient.getQueryData(listQueryKey);

      // 3. Optimistic Update
      queryClient.setQueryData<{
        pages: PaginatedResponse<Comment>[];
        pageParams: unknown[];
      }>(listQueryKey, (oldData) => {
        if (!oldData) return oldData;
        const target = findCommentInPages(oldData, commentId);
        if (!target) return oldData;

        const newLiked = !target.isLiked;
        const newCount = target.isLiked
          ? target.likeCount - 1
          : target.likeCount + 1;

        return updateCommentInCache(oldData, commentId, newLiked, newCount);
      });

      return { previousData, listQueryKey };
    },
    onSuccess: (data, _, context) => {
      // 4. Server Response Update
      if (context?.listQueryKey) {
        queryClient.setQueryData<{
          pages: PaginatedResponse<Comment>[];
          pageParams: unknown[];
        }>(context.listQueryKey, (oldData) =>
          updateCommentInCache(
            oldData,
            data.commentId,
            data.isLiked,
            data.likeCount,
          ),
        );
      }

      // Safety: Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: context?.listQueryKey });
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.listQueryKey, context.previousData);
      }
      // Re-fetch on error
      queryClient.invalidateQueries({ queryKey: context?.listQueryKey });
    },
  });
};

// Helper to find comment in paginated data
const findCommentInPages = (
  data: { pages: PaginatedResponse<Comment>[] },
  commentId: string,
) => {
  for (const page of data.pages) {
    const comment = page.data.find((c) => c.id === commentId);
    if (comment) return comment;
  }
  return null;
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
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
};
