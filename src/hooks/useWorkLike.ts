/**
 * 작품 좋아요 관련 TanStack Query 훅
 * 작품 전체에 대한 단일 좋아요 (유저당 1회)
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
 */
export const useWorkLike = (workId: string) => {
    const { isAuthenticated } = useAuthStore();

    return useQuery<WorkLikeStatus>({
        queryKey: ['workLike', workId],
        queryFn: async () => {
            const { data } = await api.get(`/works/${workId}/like`);
            return data.data || { isLiked: false, likeCount: 0 };
        },
        enabled: !!workId && isAuthenticated,
    });
};

/**
 * 작품 좋아요 토글
 * POST /api/works/{workId}/like (toggle)
 * 중복 방지: 이미 좋아요 한 경우 취소, 아닌 경우 추가
 */
export const useToggleWorkLike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (workId: string) => {
            const { data } = await api.post(`/works/${workId}/like`);
            return data;
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
        onError: (_err, workId, context) => {
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
