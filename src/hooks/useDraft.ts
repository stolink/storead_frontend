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
