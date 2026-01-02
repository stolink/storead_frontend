/**
 * 작품 좋아요 관련 TanStack Query 훅
 * 작품 전체에 대한 단일 좋아요 (유저당 1회)
 * 
 * 백엔드 API:
 * - POST /api/works/{id}/like: 좋아요 토글
 * - GET /api/works/{id}/like: 현재 좋아요 상태 및 총 좋아요 수 조회
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
// import { useAuthStore } from '@/stores/useAuthStore';

interface WorkLikeStatus {
    isLiked: boolean;
    likeCount: number;
}

/**
 * 작품 좋아요 상태 조회
 * GET /api/works/{id}/like
 */
export const useWorkLike = (workId: string) => {
    // const { isAuthenticated } = useAuthStore();

    return useQuery<WorkLikeStatus>({
        queryKey: ['workLike', workId],
        queryFn: async () => {
            try {
                const { data } = await api.get(`/works/${workId}/like`);
                const result = data.data || data;
                return {
                    isLiked: result.isLiked ?? false,
                    likeCount: result.likeCount ?? 0,
                };
            } catch (error) {
                // console.warn('Work like API error:', error);
                return { isLiked: false, likeCount: 0 };
            }
        },
        enabled: !!workId,
        staleTime: 0,
        refetchOnMount: true, // 페이지 재진입 시 항상 최신 상태 확인
    });
};

/**
 * 작품 좋아요 토글
 * POST /api/works/{id}/like
 */
export const useToggleWorkLike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (workId: string) => {
            const { data } = await api.post(`/works/${workId}/like`);
            const responseData = data.data || data;
            return { workId, ...responseData }; // workId를 반환 데이터에 포함
        },
        onSuccess: (_data, variables) => {
            // 서버 응답으로 캐시 즉시 업데이트 (낙관적 업데이트 제거)
            // MutationFn이 반환한 데이터(_data)에 workId가 있다고 보장하기 어려우므로 variables 사용
            const workId = variables;
            queryClient.invalidateQueries({ queryKey: ['workLike', workId] });
        },
        onSettled: (_data, _error, variables) => {
            const workId = variables;
            // work 쿼리도 무효화하여 discovery 데이터 등과 동기화
            queryClient.invalidateQueries({ queryKey: ['work', workId] });
            queryClient.invalidateQueries({ queryKey: ['discovery'] });
        }
    });
};

export default useWorkLike;
