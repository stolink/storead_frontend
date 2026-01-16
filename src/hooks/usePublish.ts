/**
 * 커뮤니티 게시 관련 TanStack Query 훅
 * 통합 게시 API 연동
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";

/**
 * 게시 요청 타입
 */
export interface PublishRequest {
  draftId: string;
  chapterNumber?: number;
  title?: string;
}

/**
 * 게시 응답 타입
 */
export interface PublishResponse {
  workId: string;
  chapterId: string;
  workCreated: boolean;
}

/**
 * 커뮤니티 게시
 * POST /api/community/publish
 *
 * 이 API가 처리하는 것:
 * 1. Draft 조회
 * 2. Work 없으면 자동 생성 (projectId 기반)
 * 3. Chapter 생성
 * 4. graphSnapshot → Work.characterGraphData 저장
 * 5. Draft 삭제
 */
export const usePublish = () => {
  const queryClient = useQueryClient();

  return useMutation<PublishResponse, Error, PublishRequest>({
    mutationFn: async (request: PublishRequest) => {
      const { data } = await api.post("/community/publish", request);
      return data.data;
    },
    onSuccess: (result, variables) => {
      // Draft 캐시 제거
      queryClient.removeQueries({ queryKey: ["draft", variables.draftId] });
      // 작품 정보 및 챕터 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["myWorks"] });
      queryClient.invalidateQueries({ queryKey: ["discoveryWorks"] });
      queryClient.invalidateQueries({ queryKey: ["work", result.workId] });
      queryClient.invalidateQueries({ queryKey: ["workChapters", result.workId] });
    },
  });
};
