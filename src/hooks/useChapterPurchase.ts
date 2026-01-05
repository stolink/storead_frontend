/**
 * 챕터 구매 관련 TanStack Query 훅
 * 
 * 기능:
 * - 챕터 구매 가능 여부 확인
 * - 챕터 구매 실행
 * - 구매 기록 조회
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Chapter } from '@/types';

interface PurchaseCheckResponse {
    canPurchase: boolean;
    currentBalance: number;
    chapterPrice: number;
    afterBalance?: number;
    shortfall?: number;
    alreadyPurchased: boolean;
}

interface PurchaseResponse {
    success: boolean;
    chapterId: string;
    pricePaid: number;
    remainingBalance: number;
}

/**
 * 챕터 구매 가능 여부 확인
 * GET /api/chapters/{id}/purchase/check
 */
export const useChapterPurchaseCheck = (chapterId: string) => {
    const { isAuthenticated } = useAuthStore();

    return useQuery<PurchaseCheckResponse>({
        queryKey: ['chapterPurchaseCheck', chapterId],
        queryFn: async () => {
            try {
                const { data } = await api.get(`/chapters/${chapterId}/purchase/check`);
                return data.data || data;
            } catch {
                // API가 없는 경우 기본값 반환 (무료로 간주)
                return {
                    canPurchase: true,
                    currentBalance: 0,
                    chapterPrice: 0,
                    alreadyPurchased: false,
                };
            }
        },
        enabled: !!chapterId && isAuthenticated,
        staleTime: 30000, // 30초간 캐시 유지
    });
};

/**
 * 챕터 접근 권한 확인
 * GET /api/chapters/{id}/access
 * 
 * 이미 구매했거나 무료인 경우 true 반환
 */
export const useChapterAccess = (chapterId: string) => {
    const { isAuthenticated } = useAuthStore();

    return useQuery<{ hasAccess: boolean; chapter: Chapter }>({
        queryKey: ['chapterAccess', chapterId],
        queryFn: async () => {
            try {
                const { data } = await api.get(`/chapters/${chapterId}/access`);
                return data.data || data;
            } catch {
                // API가 없는 경우 접근 가능으로 간주 (무료)
                return {
                    hasAccess: true,
                    chapter: null,
                };
            }
        },
        enabled: !!chapterId && isAuthenticated,
    });
};

interface PurchaseChapterParams {
    chapterId: string;
    workId: string;
}

/**
 * 챕터 구매 실행
 * POST /api/chapters/{id}/purchase
 */
export const useChapterPurchase = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ chapterId }: PurchaseChapterParams) => {
            const { data } = await api.post(`/chapters/${chapterId}/purchase`);
            return data.data || data;
        },
        onSuccess: (_data: PurchaseResponse, { chapterId, workId }) => {
            // 구매 완료 후 관련 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ['chapterPurchaseCheck', chapterId] });
            queryClient.invalidateQueries({ queryKey: ['chapterAccess', chapterId] });
            queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] });
            queryClient.invalidateQueries({ queryKey: ['work', workId] });
            // 크레딧 잔액도 갱신
            queryClient.invalidateQueries({ queryKey: ['credits'] });
        },
        onError: (error) => {
            console.error('챕터 구매 실패:', error);
        },
    });
};

/**
 * 사용자의 구매 기록 조회
 * GET /api/users/me/purchases
 */
export const useMyPurchases = () => {
    const { isAuthenticated } = useAuthStore();

    return useQuery<{ chapterId: string; purchasedAt: string }[]>({
        queryKey: ['myPurchases'],
        queryFn: async () => {
            try {
                const { data } = await api.get('/users/me/purchases');
                return data.data || data || [];
            } catch {
                return [];
            }
        },
        enabled: isAuthenticated,
    });
};
