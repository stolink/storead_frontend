/**
 * 작가용 챕터 내보내기 폼
 * React Hook Form + Zod 유효성 검증
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    exportChapterSchema,
    type ExportChapterFormData,
    useMyWorks,
    useExportChapter,
} from '@/hooks/useExportChapter';
import type { Genre } from '@/types';

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
    { value: 'FANTASY', label: '판타지' },
    { value: 'ROMANCE', label: '로맨스' },
    { value: 'MARTIAL_ARTS', label: '무협' },
    { value: 'THRILLER', label: '스릴러' },
    { value: 'SF', label: 'SF' },
    { value: 'DRAMA', label: '드라마' },
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
    initialContent = '',
    onSuccess,
    onCancel,
    className,
}: ExportChapterFormProps) => {
    const { data: myWorks, isLoading: worksLoading } = useMyWorks();
    const { exportChapter, isLoading: exporting } = useExportChapter();

    const form = useForm<ExportChapterFormData>({
        resolver: zodResolver(exportChapterSchema),
        defaultValues: {
            isNewWork: myWorks?.length === 0,
            workId: undefined,
            newWork: {
                title: '',
                synopsis: '',
                genre: 'FANTASY',
            },
            chapterTitle: '',
            chapterNumber: 1,
            content: initialContent,
        },
    });

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = form;

    const isNewWork = watch('isNewWork');

    const onSubmit = async (data: ExportChapterFormData) => {
        try {
            const result = await exportChapter(data);
            onSuccess?.({ workId: result.workId, chapterId: result.chapter.id });
        } catch (error) {
            console.error('내보내기 실패:', error);
        }
    };

    return (
        <Card className={cn('max-w-2xl mx-auto', className)}>
            <CardHeader>
                <CardTitle>챕터 내보내기</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* 작품 선택 섹션 */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">작품 선택</h3>

                        {/* 신규/기존 선택 */}
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    {...register('isNewWork')}
                                    value="false"
                                    checked={!isNewWork}
                                    onChange={() => form.setValue('isNewWork', false)}
                                    className="w-4 h-4"
                                />
                                <span>기존 작품에 추가</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    {...register('isNewWork')}
                                    value="true"
                                    checked={isNewWork}
                                    onChange={() => form.setValue('isNewWork', true)}
                                    className="w-4 h-4"
                                />
                                <span>신규 작품 생성</span>
                            </label>
                        </div>

                        {/* 기존 작품 선택 */}
                        {!isNewWork && (
                            <div>
                                <label className="block text-sm font-medium mb-1">작품 선택</label>
                                {worksLoading ? (
                                    <div className="text-sm text-zinc-400">로딩 중...</div>
                                ) : myWorks?.length === 0 ? (
                                    <div className="text-sm text-zinc-400">
                                        등록된 작품이 없습니다. 신규 작품을 생성하세요.
                                    </div>
                                ) : (
                                    <select
                                        {...register('workId')}
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
                                    <p className="text-sm text-red-500 mt-1">{errors.workId.message}</p>
                                )}
                            </div>
                        )}

                        {/* 신규 작품 정보 */}
                        {isNewWork && (
                            <div className="space-y-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium mb-1">작품 제목</label>
                                    <Input
                                        {...register('newWork.title')}
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
                                        {...register('newWork.genre')}
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
                                    <label className="block text-sm font-medium mb-1">줄거리</label>
                                    <Textarea
                                        {...register('newWork.synopsis')}
                                        placeholder="작품 줄거리를 입력하세요 (최소 10자)"
                                        className="min-h-[100px]"
                                    />
                                    {errors.newWork?.synopsis && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.newWork.synopsis.message}
                                        </p>
                                    )}
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
                                <label className="block text-sm font-medium mb-1">회차 번호</label>
                                <Input
                                    type="number"
                                    min={1}
                                    {...register('chapterNumber', { valueAsNumber: true })}
                                    placeholder="1"
                                />
                                {errors.chapterNumber && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.chapterNumber.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">챕터 제목</label>
                                <Input
                                    {...register('chapterTitle')}
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
                            <label className="block text-sm font-medium mb-1">본문 내용</label>
                            <Textarea
                                {...register('content')}
                                placeholder="본문 내용을 입력하세요"
                                className="min-h-[200px]"
                            />
                            {errors.content && (
                                <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
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
                                '내보내기'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ExportChapterForm;
