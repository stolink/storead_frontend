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
      console.log('[DEBUG] Library API Response:', data);

      // API 응답 구조에 따라 데이터 반환
      // 예상: ApiResponse { code, status, data: { items: [...] } }
      if (data.data && Array.isArray(data.data.items)) {
        return data.data.items;
      }
      // 또는 { code, status, data: [...] }
      if (Array.isArray(data.data)) {
        return data.data;
      }

      return data.data || [];
    },
    // select 옵션 제거 (queryFn에서 이미 처리)
    enabled: isAuthenticated, // 로그인된 경우에만 API 호출
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
      const { data } = await api.post(`/library/${workId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
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
      await api.delete(`/library/${workId}`);
    },
    // 낙관적 업데이트
    onMutate: async (workId) => {
      await queryClient.cancelQueries({ queryKey: ["library"] });
      const previousLibrary = queryClient.getQueryData<any>(["library"]);

      queryClient.setQueryData<any>(["library"], (old: any) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.filter((item: Library) => item.workId !== workId),
        };
      });

      return { previousLibrary };
    },
    onError: (_err, _workId, context) => {
      if (context?.previousLibrary) {
        queryClient.setQueryData(["library"], context.previousLibrary);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });
};

/**
 * 작품이 서재에 있는지 확인하는 유틸리티 훅
 */
export const useIsInLibrary = (workId: string) => {
  const { data: library } = useLibrary();
  return library?.some((item) => item.workId === workId) ?? false;
};
