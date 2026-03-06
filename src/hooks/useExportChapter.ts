/**
 * 작가용 내보내기(Export) 관련 훅
 * React Hook Form + Zod 스키마
 *
 * 참고: 백엔드에 실제 데이터가 존재하므로 데모 폴백 제거됨
 */
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import api from "@/api/client";
import type { Work, Chapter, Genre } from "@/types";

// === Zod 스키마 ===

/** 신규 작품 정보 스키마 */
const newWorkSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요"),
  synopsis: z.string().min(10, "줄거리는 최소 10자 이상 입력하세요"),
  genre: z.enum([
    "FANTASY",
    "ROMANCE",
    "MARTIAL_ARTS",
    "THRILLER",
    "SF",
    "DRAMA",
  ] as const),
  coverImageUrl: z.string().optional(),
  isFree: z.boolean().optional(),
  accessType: z.enum(["FREE", "PAID"]).optional(),
});

/** 챕터 내보내기 스키마 */
export const exportChapterSchema = z
  .object({
    // 작품 선택
    isNewWork: z.boolean(),
    workId: z.string().uuid().optional(),
    newWork: newWorkSchema.optional(),
    // 챕터 정보
    chapterTitle: z.string().min(1, "챕터 제목을 입력하세요"),
    chapterNumber: z.number().min(1, "1 이상의 회차 번호를 입력하세요"),
    content: z.string().min(1, "내용이 없습니다"),
    // 유료화 설정
    accessType: z.enum(["FREE", "PAID"]),
    price: z.number().min(0),
  })
  .refine(
    (data) => {
      // 기존 작품 선택 시 workId 필수
      if (!data.isNewWork && !data.workId) {
        return false;
      }
      // 신규 작품 시 newWork 필수
      if (data.isNewWork && !data.newWork) {
        return false;
      }
      // 유료 설정 시 가격 필수 (0원 이상)
      if (data.accessType === "PAID" && data.price < 100) {
        return false; // 최소 100 크레딧
      }
      return true;
    },
    {
      message:
        "입력 정보를 확인하세요 (유료 챕터는 최소 100C 이상이어야 합니다)",
      path: ["price"], // 에러 표시 위치
    },
  );

export type ExportChapterFormData = z.infer<typeof exportChapterSchema>;

// === 훅 ===

/**
 * 내 작품 목록 조회 (작가용)
 * GET /api/works
 */
export const useMyWorks = () => {
  return useQuery<Work[]>({
    queryKey: ["myWorks"],
    queryFn: async () => {
      const { data } = await api.get("/works");
      // 백엔드 응답: { code, status, data: { works: [...], pagination: {...} } }
      // 또는 { code, status, data: [...] } 형태일 수 있음
      const responseData = data.data;
      const works = Array.isArray(responseData)
        ? responseData
        : responseData?.works || [];

      return works;
    },
  });
};

/**
 * 작품 생성
 * POST /api/works
 */
export const useCreateWork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workData: {
      title: string;
      synopsis: string;
      genre: Genre;
      coverImageUrl?: string;
      isFree?: boolean;
      accessType?: "FREE" | "PAID";
    }) => {
      const { data } = await api.post("/works", workData);
      return data as Work;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myWorks"] });
    },
  });
};

/**
 * 챕터 생성 (내보내기)
 * POST /api/works/{workId}/chapters
 */
export const useCreateChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workId,
      chapterData,
    }: {
      workId: string;
      chapterData: {
        title: string;
        content: string;
        chapterNumber: number;
        accessType: "FREE" | "PAID";
        price: number;
      };
    }) => {
      const { data } = await api.post(`/works/${workId}/chapters`, chapterData);
      return data as Chapter;
    },
    onSuccess: (_data, { workId }) => {
      queryClient.invalidateQueries({ queryKey: ["chapters", workId] });
      queryClient.invalidateQueries({ queryKey: ["myWorks"] });
    },
  });
};

/**
 * 원고 내보내기 통합 훅
 * 신규 작품 생성 + 챕터 생성을 순차적으로 처리
 */
export const useExportChapter = () => {
  const createWork = useCreateWork();
  const createChapter = useCreateChapter();

  const exportChapter = async (formData: ExportChapterFormData) => {
    let workId = formData.workId;

    // 신규 작품인 경우 먼저 작품 생성
    if (formData.isNewWork && formData.newWork) {
      const newWork = await createWork.mutateAsync(formData.newWork);
      workId = newWork.id;
    }

    if (!workId) {
      throw new Error("작품 ID가 없습니다");
    }

    // 챕터 생성
    const chapter = await createChapter.mutateAsync({
      workId,
      chapterData: {
        title: formData.chapterTitle,
        content: formData.content,
        chapterNumber: formData.chapterNumber,
        accessType: formData.accessType,
        price: formData.price,
      },
    });

    return { workId, chapter };
  };

  return {
    exportChapter,
    isLoading: createWork.isPending || createChapter.isPending,
    error: createWork.error || createChapter.error,
  };
};
