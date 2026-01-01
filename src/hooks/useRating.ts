/**
 * 별점(Rating) 관련 TanStack Query 훅
 * 별점 조회, 등록/수정 (낙관적 업데이트 포함)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import type { RatingResponse } from '@/types';

/**
 * 챕터 별점 조회 (내 별점 + 평균)
 * GET /api/chapters/{id}/rating
 */
export const useChapterRating = (chapterId: string) => {
    return useQuery<RatingResponse>({
        queryKey: ['chapterRating', chapterId],
        queryFn: async () => {
            const { data } = await api.get(`/chapters/${chapterId}/rating`);
            return data;
        },
        enabled: !!chapterId,
    });
};

/**
 * 작품 전체 별점 조회
 * GET /api/works/{id}/rating
 */
export const useWorkRating = (workId: string) => {
    return useQuery<RatingResponse>({
        queryKey: ['workRating', workId],
        queryFn: async () => {
            const { data } = await api.get(`/works/${workId}/rating`);
            return data;
        },
        enabled: !!workId,
    });
};

interface SubmitRatingParams {
    chapterId: string;
    score: number; // 1~10
}

/**
 * 별점 등록/수정 (낙관적 업데이트)
 * POST /api/chapters/{id}/rating
 */
export const useSubmitRating = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ chapterId, score }: SubmitRatingParams) => {
            const { data } = await api.post(`/chapters/${chapterId}/rating`, { score });
            return data;
        },
        // 낙관적 업데이트: 서버 응답 전에 UI 먼저 업데이트
        onMutate: async ({ chapterId, score }) => {
            // 진행 중인 쿼리 취소
            await queryClient.cancelQueries({ queryKey: ['chapterRating', chapterId] });

            // 이전 데이터 스냅샷 저장
            const previousRating = queryClient.getQueryData<RatingResponse>([
                'chapterRating',
                chapterId,
            ]);

            // 낙관적으로 캐시 업데이트
            queryClient.setQueryData<RatingResponse>(
                ['chapterRating', chapterId],
                (old) => {
                    if (!old) {
                        return { myRating: score, avgRating: score, ratingCount: 1 };
                    }
                    // 기존 내 별점이 있으면 평균 재계산 (간략화)
                    const wasRated = old.myRating !== null;
                    const newCount = wasRated ? old.ratingCount : old.ratingCount + 1;
                    const oldSum = old.avgRating * old.ratingCount;
                    const newSum = wasRated
                        ? oldSum - (old.myRating || 0) + score
                        : oldSum + score;

                    return {
                        myRating: score,
                        avgRating: newSum / newCount,
                        ratingCount: newCount,
                    };
                }
            );

            return { previousRating };
        },
        // 에러 시 롤백
        onError: (_err, { chapterId }, context) => {
            console.error('[DEBUG] Rating API error:', _err);
            if (context?.previousRating) {
                queryClient.setQueryData(['chapterRating', chapterId], context.previousRating);
            }
        },
        // 완료 후 서버 데이터로 갱신
        onSettled: (_data, _error, { chapterId }) => {
            queryClient.invalidateQueries({ queryKey: ['chapterRating', chapterId] });
            queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] });
        },
    });
};

/**
 * 별점 삭제
 * DELETE /api/chapters/{id}/rating
 */
export const useDeleteRating = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (chapterId: string) => {
            await api.delete(`/chapters/${chapterId}/rating`);
        },
        onSuccess: (_data, chapterId) => {
            queryClient.invalidateQueries({ queryKey: ['chapterRating', chapterId] });
            queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] });
        },
    });
};
