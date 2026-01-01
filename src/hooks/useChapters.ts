/**
 * 챕터(Chapters) 관련 TanStack Query 훅 - 작가용
 * 챕터 목록 조회, 상세 조회, 수정, 삭제
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import type { Chapter } from '@/types';

/**
 * 작품의 챕터 목록 조회 (작가용)
 * GET /api/works/{workId}/chapters
 */
export const useWorkChapters = (workId: string) => {
    return useQuery<Chapter[]>({
        queryKey: ['workChapters', workId],
        queryFn: async () => {
            const { data } = await api.get(`/works/${workId}/chapters`);
            return data;
        },
        enabled: !!workId,
    });
};

/**
 * 챕터 상세 조회 (작가용)
 * GET /api/chapters/{id}
 */
export const useChapter = (chapterId: string) => {
    return useQuery<Chapter>({
        queryKey: ['chapter', chapterId],
        queryFn: async () => {
            const { data } = await api.get(`/chapters/${chapterId}`);
            return data;
        },
        enabled: !!chapterId,
    });
};

interface UpdateChapterParams {
    title?: string;
    content?: string;
    chapterNumber?: number;
    status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
    scheduledAt?: string; // ISO 날짜 문자열
}

/**
 * 챕터 수정
 * PATCH /api/chapters/{id}
 */
export const useUpdateChapter = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            chapterId,
            params,
        }: {
            chapterId: string;
            params: UpdateChapterParams;
        }) => {
            const { data } = await api.patch(`/chapters/${chapterId}`, params);
            return data as Chapter;
        },
        onSuccess: (updatedChapter) => {
            // 챕터 상세 캐시 업데이트
            queryClient.setQueryData(['chapter', updatedChapter.id], updatedChapter);
            // 작품의 챕터 목록 갱신
            if (updatedChapter.workId) {
                queryClient.invalidateQueries({
                    queryKey: ['workChapters', updatedChapter.workId],
                });
            }
        },
    });
};

/**
 * 챕터 삭제
 * DELETE /api/chapters/{id}
 */
export const useDeleteChapter = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            chapterId,
            workId,
        }: {
            chapterId: string;
            workId: string;
        }) => {
            await api.delete(`/chapters/${chapterId}`);
            return { chapterId, workId };
        },
        onSuccess: ({ chapterId, workId }) => {
            // 캐시에서 삭제된 챕터 제거
            queryClient.removeQueries({ queryKey: ['chapter', chapterId] });
            // 작품의 챕터 목록 갱신
            queryClient.invalidateQueries({ queryKey: ['workChapters', workId] });
            // 내 작품 목록도 갱신 (챕터 수 변경)
            queryClient.invalidateQueries({ queryKey: ['myWorks'] });
        },
    });
};
