/**
 * 작품 좋아요 관련 TanStack Query 훅
 * 작품 전체에 대한 단일 좋아요 (유저당 1회)
 * 
 * ⚠️ 주의: 현재 백엔드에 /api/works/{workId}/like API가 구현되어 있지 않음
 * 백엔드에는 /api/comments/{id}/like (댓글 좋아요)만 존재
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { useAuthStore } from '@/stores/useAuthStore';

interface WorkLikeStatus {
    isLiked: boolean;
    likeCount: number;
}

/**
 * 작품 좋아요 상태 조회
 * GET /api/works/{workId}/like
 * ⚠️ 백엔드 미구현 - 현재 기본값 반환
 */
export const useWorkLike = (workId: string) => {
    const { isAuthenticated } = useAuthStore();

    return useQuery<WorkLikeStatus>({
        queryKey: ['workLike', workId],
        queryFn: async () => {
            try {
                const { data } = await api.get(`/works/${workId}/like`);
                return data.data || { isLiked: false, likeCount: 0 };
            } catch (error) {
                // 404나 500 에러 시 기본값 반환 (백엔드 미구현 대응)
                console.warn('[WARN] Work like API not available:', error);
                return { isLiked: false, likeCount: 0 };
            }
        },
        enabled: !!workId && isAuthenticated,
        retry: false, // 실패 시 재시도 안함
    });
};

/**
 * 작품 좋아요 토글
 * POST /api/works/{workId}/like (toggle)
 * ⚠️ 백엔드 미구현 - 호출 시 에러 발생 가능
 */
export const useToggleWorkLike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (workId: string) => {
            console.warn('[WARN] Work like toggle API may not be available');
            const { data } = await api.post(`/works/${workId}/like`);
            return data.data || data;
        },
        // 낙관적 업데이트
        onMutate: async (workId) => {
            await queryClient.cancelQueries({ queryKey: ['workLike', workId] });
            const previousStatus = queryClient.getQueryData<WorkLikeStatus>(['workLike', workId]);

            if (previousStatus) {
                queryClient.setQueryData<WorkLikeStatus>(['workLike', workId], {
                    isLiked: !previousStatus.isLiked,
                    likeCount: previousStatus.isLiked
                        ? previousStatus.likeCount - 1
                        : previousStatus.likeCount + 1,
                });
            }

            return { previousStatus };
        },
        onError: (err, workId, context) => {
            console.error('[DEBUG] Work like toggle failed (API may not be implemented):', err);
            if (context?.previousStatus) {
                queryClient.setQueryData(['workLike', workId], context.previousStatus);
            }
        },
        onSettled: (_, __, workId) => {
            queryClient.invalidateQueries({ queryKey: ['workLike', workId] });
        },
    });
};

export default useWorkLike;
