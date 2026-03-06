/**
 * 작가용 챕터 내보내기 폼
 * React Hook Form + Zod 유효성 검증
 */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  exportChapterSchema,
  type ExportChapterFormData,
  useMyWorks,
  useExportChapter,
} from "@/hooks/useExportChapter";
import type { Genre } from "@/types";

interface ExportChapterFormProps {
  /** 에디터에서 가져온 원고 내용 */
  initialContent?: string;
  /** 내보내기 성공 시 콜백 */
  onSuccess?: (result: { workId: string; chapterId: string }) => void;
  /** 취소 콜백 */
  onCancel?: () => void;
  /** 추가 클래스 */
  className?: string;
}

const GENRE_OPTIONS: { value: Genre; label: string }[] = [
  { value: "FANTASY", label: "판타지" },
  { value: "ROMANCE", label: "로맨스" },
  { value: "MARTIAL_ARTS", label: "무협" },
  { value: "THRILLER", label: "스릴러" },
  { value: "SF", label: "SF" },
  { value: "DRAMA", label: "드라마" },
];

/**
 * 작가용 챕터 내보내기 폼
 *
 * 기능:
 * - 기존 작품 선택 또는 신규 작품 생성
 * - 챕터 제목, 번호, 내용 입력
 * - Zod 스키마로 유효성 검증
 */
export const ExportChapterForm = ({
  initialContent = "",
  onSuccess,
  onCancel,
  className,
}: ExportChapterFormProps) => {
  const { data: myWorks, isLoading: worksLoading } = useMyWorks();
  const { exportChapter, isLoading: exporting } = useExportChapter();

  const form = useForm<ExportChapterFormData>({
    resolver: zodResolver(exportChapterSchema),
    defaultValues: {
      isNewWork: false,
      workId: "",
      newWork: {
        title: "",
        synopsis: "",
        genre: "FANTASY",
        accessType: "FREE",
      },
      chapterTitle: "",
      chapterNumber: 1,
      content: initialContent,
      accessType: "FREE",
      price: 100,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const isNewWork = watch("isNewWork");

  // Handle initial isNewWork state based on myWorks
  useEffect(() => {
    if (!worksLoading && myWorks && myWorks.length === 0) {
      form.setValue("isNewWork", true);
    }
  }, [myWorks, worksLoading, form]);

  const onSubmit = async (data: ExportChapterFormData) => {
    try {
      const result = await exportChapter(data);
      onSuccess?.({ workId: result.workId, chapterId: result.chapter.id });
    } catch (error) {
      console.error("내보내기 실패:", error);
    }
  };

  return (
    <Card className={cn("max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle>챕터 내보내기</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((data) =>
            onSubmit(data as unknown as ExportChapterFormData),
          )}
          className="space-y-6"
        >
          {/* 작품 선택 섹션 */}
          <div className="space-y-4">
            <h3 className="font-semibold">작품 선택</h3>

            {/* 신규/기존 선택 */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="false"
                  checked={!isNewWork}
                  onChange={() => form.setValue("isNewWork", false)}
                  className="w-4 h-4"
                />
                <span>기존 작품에 추가</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="true"
                  checked={isNewWork}
                  onChange={() => form.setValue("isNewWork", true)}
                  className="w-4 h-4"
                />
                <span>신규 작품 생성</span>
              </label>
            </div>

            {/* 기존 작품 선택 */}
            {!isNewWork && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  작품 선택
                </label>
                {worksLoading ? (
                  <div className="text-sm text-zinc-400">로딩 중...</div>
                ) : myWorks?.length === 0 ? (
                  <div className="text-sm text-zinc-400">
                    등록된 작품이 없습니다. 신규 작품을 생성하세요.
                  </div>
                ) : (
                  <select
                    {...register("workId")}
                    className="w-full p-2 border border-zinc-300 rounded-md dark:bg-zinc-800 dark:border-zinc-600"
                  >
                    <option value="">작품을 선택하세요</option>
                    {myWorks?.map((work) => (
                      <option key={work.id} value={work.id}>
                        {work.title}
                      </option>
                    ))}
                  </select>
                )}
                {errors.workId && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.workId.message}
                  </p>
                )}
              </div>
            )}

            {/* 신규 작품 정보 */}
            {isNewWork && (
              <div className="space-y-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    작품 제목
                  </label>
                  <Input
                    {...register("newWork.title")}
                    placeholder="작품 제목을 입력하세요"
                  />
                  {errors.newWork?.title && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.newWork.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">장르</label>
                  <select
                    {...register("newWork.genre")}
                    className="w-full p-2 border border-zinc-300 rounded-md dark:bg-zinc-800 dark:border-zinc-600"
                  >
                    {GENRE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    줄거리
                  </label>
                  <Textarea
                    {...register("newWork.synopsis")}
                    placeholder="작품 줄거리를 입력하세요 (최소 10자)"
                    className="min-h-[100px]"
                  />
                  {errors.newWork?.synopsis && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.newWork.synopsis.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    작품 공개 방식
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-md border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex-1">
                      <input
                        type="radio"
                        {...register("newWork.accessType")}
                        value="FREE"
                        className="w-4 h-4"
                      />
                      <div className="text-xs">
                        <span className="font-bold block">무료 작품</span>
                        <span className="text-zinc-500">
                          기본적으로 무료로 연재됩니다.
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-md border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex-1">
                      <input
                        type="radio"
                        {...register("newWork.accessType")}
                        value="PAID"
                        className="w-4 h-4"
                      />
                      <div className="text-xs">
                        <span className="font-bold block text-mocha-600">
                          유료 작품
                        </span>
                        <span className="text-zinc-500">
                          유료 연재를 목표로 하는 작품입니다.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-zinc-200 dark:border-zinc-700" />

          {/* 챕터 정보 섹션 */}
          <div className="space-y-4">
            <h3 className="font-semibold">챕터 정보</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  회차 번호
                </label>
                <Input
                  type="number"
                  min={1}
                  {...register("chapterNumber", { valueAsNumber: true })}
                  placeholder="1"
                />
                {errors.chapterNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.chapterNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  챕터 제목
                </label>
                <Input
                  {...register("chapterTitle")}
                  placeholder="예: 1화. 시작"
                />
                {errors.chapterTitle && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.chapterTitle.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                본문 내용
              </label>
              <Textarea
                {...register("content")}
                placeholder="본문 내용을 입력하세요"
                className="min-h-[200px]"
              />
              {errors.content && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.content.message}
                </p>
              )}
            </div>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-700" />

          {/* 유료화 설정 섹션 */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              유료화 설정
              <span className="text-xs font-normal text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                Optional
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  공개 방식
                </label>
                <div className="flex gap-3">
                  <label
                    className={`flex-1 cursor-pointer border rounded-xl p-4 transition-all ${
                      watch("accessType") === "FREE"
                        ? "border-mocha-500 bg-mocha-50 dark:bg-mocha-900/20 ring-1 ring-mocha-500"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        {...register("accessType")}
                        value="FREE"
                        className="w-4 h-4 text-mocha-600 focus:ring-mocha-500"
                      />
                      <div>
                        <span className="block font-bold text-sm">
                          무료 공개
                        </span>
                        <span className="text-xs text-zinc-500">
                          모든 독자가 자유롭게 열람합니다.
                        </span>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex-1 cursor-pointer border rounded-xl p-4 transition-all ${
                      watch("accessType") === "PAID"
                        ? "border-mocha-500 bg-mocha-50 dark:bg-mocha-900/20 ring-1 ring-mocha-500"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        {...register("accessType")}
                        value="PAID"
                        className="w-4 h-4 text-mocha-600 focus:ring-mocha-500"
                      />
                      <div>
                        <span className="block font-bold text-sm">
                          유료 판매
                        </span>
                        <span className="text-xs text-zinc-500">
                          크레딧으로 구매해야 열람합니다.
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {watch("accessType") === "PAID" && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                  <label className="block text-sm font-medium mb-1 text-mocha-600 dark:text-mocha-400">
                    판매 가격 (Credit)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step={100}
                      {...register("price", { valueAsNumber: true })}
                      placeholder="100"
                      className="pl-9 font-bold text-lg"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      C
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1.5 ml-1">
                    * 최소 100C 부터 설정 가능합니다. (100C = 100원)
                  </p>
                  {errors.price && (
                    <p className="text-sm text-red-500 mt-1 font-medium bg-red-50 p-2 rounded-lg">
                      {errors.price.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                취소
              </Button>
            )}
            <Button type="submit" disabled={exporting}>
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  내보내기 중...
                </>
              ) : (
                "내보내기"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExportChapterForm;
