/**
 * Draft 관련 TanStack Query 훅
 * 커뮤니티 배포 기능을 위한 Draft 조회/삭제
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";

/**
 * Draft 데이터 타입
 * Stolink에서 전달받은 게시 대기 콘텐츠
 */
export interface Draft {
  id: string;
  documentId: string;
  projectId: string;
  title: string;
  content: string;
  graphSnapshot?: object;
  createdAt: string;
  expiresAt: string;
  // Work 생성용 필드 (Stolink에서 전달)
  workTitle?: string;
  workSynopsis?: string;
  workGenre?: string;
  workCoverUrl?: string;
  // 다중 문서 지원
  documentIds?: string[];
  isMerged?: boolean;
}

/**
 * Draft 조회
 * GET /api/drafts/{draftId}
 */
export const useDraft = (draftId: string | null) => {
  return useQuery<Draft>({
    queryKey: ["draft", draftId],
    queryFn: async () => {
      const { data } = await api.get(`/drafts/${draftId}`);
      return data.data;
    },
    enabled: !!draftId,
    retry: false, // 만료된 Draft는 재시도하지 않음
    staleTime: 1000 * 60 * 5, // 5분
  });
};

/**
 * Draft 삭제 (게시 취소 시)
 * DELETE /api/drafts/{draftId}
 */
export const useDeleteDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draftId: string) => {
      await api.delete(`/drafts/${draftId}`);
      return draftId;
    },
    onSuccess: (deletedDraftId) => {
      queryClient.removeQueries({ queryKey: ["draft", deletedDraftId] });
    },
  });
};

/**
 * 다중 Draft 조회 (개별 배포 일괄 처리용)
 * 여러 draftId를 동시에 조회
 */
export const useDrafts = (draftIds: string[]) => {
  return useQuery<Draft[]>({
    queryKey: ["drafts", draftIds],
    queryFn: async () => {
      // 각 draftId에 대해 병렬 조회
      const results = await Promise.all(
        draftIds.map(async (id) => {
          const { data } = await api.get(`/drafts/${id}`);
          return data.data as Draft;
        })
      );
      return results;
    },
    enabled: draftIds.length > 0,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5분
  });
};
/**
 * Draft 수정 (실패 항목 재시도 전 수정 용도)
 * PATCH /api/drafts/{draftId}
 */
export const useUpdateDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      draftId,
      updates,
    }: {
      draftId: string;
      updates: Partial<Draft>;
    }) => {
      const { data } = await api.patch(`/drafts/${draftId}`, updates);
      return data.data as Draft;
    },
    onSuccess: (updatedDraft) => {
      queryClient.setQueryData(["draft", updatedDraft.id], updatedDraft);
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
    },
  });
};
