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
export const useComments = (
  chapterId: string,
  relationId?: string,
  sort: string = "latest",
) => {
  // [FIX] relationId가 있을 때만 쿼리 실행하여 로딩 무한 표시 방지
  return useInfiniteQuery<PaginatedResponse<Comment>>({
    queryKey: ["comments", String(chapterId), String(relationId || ""), sort],
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

      // DTO Mapping: 백엔드는 userNickname/userAvatarUrl 필드를 평탄하게 보내지만,
      // 프론트엔드 UI(RelationshipCommentList)는 author 객체를 기대합니다.
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

      // [Safety] 현재 백엔드 응답 DTO에 relationId 필드가 누락되어 있어
      // 클라이언트 사이드 필터링을 일시적으로 비활성화합니다.
      // 백엔드 API가 쿼리 파라미터(relationId)로 이미 필터링을 수행한다면 안전합니다.
      // 그렇지 않다면 모든 챕터 댓글이 노출되지만, 아예 보이지 않는 것보다는 낫습니다.
      const filteredComments = mappedComments;

      return {
        data: Array.isArray(filteredComments) ? filteredComments : [],
        hasMore: responseData.pagination?.hasNext || false,
        nextCursor: responseData.pagination?.nextCursor,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    // [FIX] chapterId만 있으면 쿼리 실행 (relationId는 선택적)
    // ChapterCommentsPage는 relationId 없이 일반 챕터 댓글을 조회함
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
    mutationFn: async (payload: CreateCommentRequest) => {
      const fullPayload: CreateCommentRequest = {
        chapterId,
        relationId,
        ...payload,
      };
      // Ensure chapterId is present (API requirement)
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
      // [FIX] 해당 챕터의 모든 댓글 캐시를 무효화 (relationId, sort 무관)
      queryClient.invalidateQueries({
        queryKey: ["comments", chapterId],
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
        relationId, // 대댓글에도 관계 ID 포함하여 격리 강화
      });
      return data;
    },
    onSuccess: (_, variables) => {
      // [FIX] 대댓글 목록 캐시 무효화 (즉시 반영)
      queryClient.invalidateQueries({
        queryKey: ["replies", variables.parentId],
      });

      // 해당 챕터의 댓글 캐시도 무효화 (답글 수 업데이트 등)
      queryClient.invalidateQueries({
        queryKey: ["comments", chapterId],
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
 *
 * @param chapterId - 현재 챕터 ID (상태 오염 방지를 위해 특정 챕터만 업데이트)
 */
export const useToggleCommentLike = (
  chapterId: string,
  relationId?: string,
  sort: string = "latest",
) => {
  const queryClient = useQueryClient();
  const rootQueryKey = [
    "comments",
    String(chapterId),
    String(relationId || ""),
    sort,
  ];

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
      // 1. Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["comments", String(chapterId)],
      });

      // 2. Snapshot the previous value (for rollback)
      const previousRootData = queryClient.getQueryData(rootQueryKey);

      // 3. Optimistic Update: Update ALL relevant caches (Root Only)
      queryClient.setQueriesData<{
        pages: PaginatedResponse<Comment>[];
        pageParams: unknown[];
      }>({ queryKey: ["comments", String(chapterId)] }, (oldData) => {
        if (!oldData) return oldData;
        const target = findCommentInPages(oldData, commentId);
        if (!target) return oldData;

        const newLiked = !target.isLiked;
        const newCount = target.isLiked
          ? target.likeCount - 1
          : target.likeCount + 1;

        return updateCommentInCache(oldData, commentId, newLiked, newCount);
      });

      return { previousRootData, rootQueryKey };
    },
    onSuccess: (data) => {
      // 4. Server Response Update: Update ALL relevant caches with authoritative data
      queryClient.setQueriesData<{
        pages: PaginatedResponse<Comment>[];
        pageParams: unknown[];
      }>({ queryKey: ["comments", String(chapterId)] }, (oldData) =>
        updateCommentInCache(
          oldData,
          data.commentId,
          data.isLiked,
          data.likeCount,
        ),
      );
    },
    onError: (_error, _variables, context) => {
      // On error, easiest is to invalidate to re-sync
      queryClient.invalidateQueries({
        queryKey: ["comments", String(chapterId)],
      });
      if (context?.previousRootData) {
        queryClient.setQueryData(
          context.rootQueryKey,
          context.previousRootData,
        );
      }
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
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
};
