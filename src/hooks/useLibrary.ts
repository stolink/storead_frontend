/**
 * 라이브러리(내 서재) 관련 TanStack Query 훅
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Library } from "@/types";

/**
 * 내 서재 목록 조회
 * GET /api/library
 * 로그인된 사용자만 호출
 */
export const useLibrary = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery<Library[]>({
    queryKey: ["library"],
    queryFn: async () => {
      const { data } = await api.get("/library");


      let items: any[] = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data.data && Array.isArray(data.data)) {
        items = data.data;
      } else if (data.data && data.data.items && Array.isArray(data.data.items)) {
        items = data.data.items;
      }

      // Backend returns flattened structure (workTitle, workSynopsis, etc.)
      // Frontend expects nested structure (work: { title, synopsis... })
      // Mapper logic:
      return items.map((item: any) => ({
        id: item.id,
        workId: item.workId,
        userId: item.userId || '', // response might not have userId
        createdAt: item.addedAt || item.createdAt,
        updatedAt: item.addedAt || item.updatedAt,
        work: {
          id: item.workId,
          title: item.workTitle,
          synopsis: item.workSynopsis,
          coverImageUrl: item.workCoverImageUrl,
          genre: item.workGenre,
          status: item.workStatus,
          authorNickname: item.authorNickname,
          authorId: "", // Not provided in flat response
          ratingSum: 0, // Not provided
          ratingCount: 0, // Not provided
          createdAt: "",
          updatedAt: "",
        }
      })) as Library[];
    },
    enabled: isAuthenticated,
  });
};

/**
 * 작품 서재에 담기
 * POST /api/library/{workId}
 */
export const useAddToLibrary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workId: string) => {
      // console.log('[DEBUG] Adding to library:', workId);
      const { data } = await api.post(`/library/${workId}`);
      // console.log('[DEBUG] Add to library response:', data);
      // 백엔드 응답 구조: { code, status, data: {...} }
      return data.data || data;
    },
    // 낙관적 업데이트: 서버 응답 전에 즉시 UI 반영
    onMutate: async (workId) => {
      await queryClient.cancelQueries({ queryKey: ["library"] });
      const previousLibrary = queryClient.getQueryData<Library[]>(["library"]);

      // 임시 항목 추가 (서버 응답 후 실제 데이터로 대체됨)
      queryClient.setQueryData<Library[]>(["library"], (old) => {
        const tempItem: Library = {
          id: `temp-${workId}`,
          workId,
          userId: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (!old || !Array.isArray(old)) return [tempItem];
        return [...old, tempItem];
      });

      return { previousLibrary };
    },
    onError: (_err, _workId, context) => {
      console.error('Add to library failed:', _err);
      // 에러 시 이전 상태로 롤백
      if (context?.previousLibrary) {
        queryClient.setQueryData(["library"], context.previousLibrary);
      }
    },
    onSettled: (_data, _error, workId) => {
      // 서버 응답과 동기화
      queryClient.invalidateQueries({ queryKey: ["library"] });
      // 작품 상세 정보(isInLibrary 등)도 갱신
      queryClient.invalidateQueries({ queryKey: ["work", workId] });
      queryClient.invalidateQueries({ queryKey: ["discovery"] });
    },
  });
};


/**
 * 서재에서 작품 제거
 * DELETE /api/library/{workId}
 */
export const useRemoveFromLibrary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workId: string) => {
      // console.log('[DEBUG] Removing from library:', workId);
      await api.delete(`/library/${workId}`);
    },
    // 낙관적 업데이트
    onMutate: async (workId) => {
      await queryClient.cancelQueries({ queryKey: ["library"] });
      const previousLibrary = queryClient.getQueryData<Library[]>(["library"]);

      // 배열 형태로 낙관적 업데이트
      queryClient.setQueryData<Library[]>(["library"], (old) => {
        if (!old || !Array.isArray(old)) return old;
        return old.filter((item: Library) => item.workId !== workId);
      });

      return { previousLibrary };
    },
    onError: (_err, _workId, context) => {
      console.error('Remove from library failed:', _err);
      if (context?.previousLibrary) {
        queryClient.setQueryData(["library"], context.previousLibrary);
      }
    },
    onSettled: (_data, _error, workId) => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
      queryClient.invalidateQueries({ queryKey: ["work", workId] });
      queryClient.invalidateQueries({ queryKey: ["discovery"] });
    },
  });
};

/**
 * 작품이 서재에 있는지 확인하는 유틸리티 훅
 */
export const useIsInLibrary = (workId: string) => {
  const { data: library } = useLibrary();
  return library?.some((item) => String(item.workId) === String(workId)) ?? false;
};
