/**
 * 작품(Works) 관련 TanStack Query 훅 - 작가용
 * 작품 CRUD (조회, 수정, 삭제)
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import type { Work, Genre } from "@/types";

/**
 * 작품 상세 조회 (작가용)
 * GET /api/works/{id}
 */
export const useWork = (workId: string) => {
  return useQuery<Work>({
    queryKey: ["work", workId],
    queryFn: async () => {
      const { data } = await api.get(`/works/${workId}`);
      return data;
    },
    enabled: !!workId,
  });
};

interface UpdateWorkParams {
  title?: string;
  synopsis?: string;
  genre?: Genre;
  coverImageUrl?: string;
  status?: "DRAFT" | "ONGOING" | "COMPLETED" | "HIATUS";
}

/**
 * 작품 수정
 * PATCH /api/works/{id}
 */
export const useUpdateWork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workId,
      params,
    }: {
      workId: string;
      params: UpdateWorkParams;
    }) => {
      const { data } = await api.patch(`/works/${workId}`, params);
      return data as Work;
    },
    onSuccess: (updatedWork, { workId }) => {
      // 작품 상세 캐시 업데이트
      queryClient.setQueryData(["work", workId], updatedWork);
      // 내 작품 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["myWorks"] });
    },
  });
};

/**
 * 작품 삭제
 * DELETE /api/works/{id}
 */
export const useDeleteWork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workId: string) => {
      await api.delete(`/works/${workId}`);
      return workId;
    },
    onSuccess: (deletedWorkId) => {
      // 캐시에서 삭제된 작품 제거
      queryClient.removeQueries({ queryKey: ["work", deletedWorkId] });
      // 내 작품 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["myWorks"] });
    },
  });
};
/**
 * projectId로 작품 조회
 * GET /api/works?projectId={projectId}
 */
export const useWorkByProjectId = (projectId: string | null) => {
  return useQuery<{ works: Work[] }>({
    queryKey: ["work", "byProjectId", projectId],
    queryFn: async () => {
      const { data } = await api.get(`/works?projectId=${projectId}`);
      return data.data; // { works: [...] }
    },
    enabled: !!projectId,
  });
};
