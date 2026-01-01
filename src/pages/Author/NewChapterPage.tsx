/**
 * 새 챕터 작성 페이지
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWork } from '@/hooks/useWorks';
import { useWorkChapters } from '@/hooks/useChapters';
import { useCreateChapter } from '@/hooks/useExportChapter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';

// 유효성 검사 스키마
const newChapterSchema = z.object({
    title: z.string().min(1, '제목을 입력하세요'),
    content: z.string().min(100, '내용은 최소 100자 이상 입력하세요'),
    chapterNumber: z.number().min(1, '1 이상의 회차 번호를 입력하세요'),
});

type NewChapterFormValues = z.infer<typeof newChapterSchema>;

export const NewChapterPage = () => {
    const { workId } = useParams<{ workId: string }>();
    const navigate = useNavigate();
    const { data: work, isLoading: workLoading } = useWork(workId || '');
    const { data: chapters } = useWorkChapters(workId || '');
    const createChapter = useCreateChapter();

    // 다음 회차 번호 자동 계산
    const nextChapterNumber = chapters
        ? Math.max(...chapters.map((c) => c.chapterNumber), 0) + 1
        : 1;

    const form = useForm<NewChapterFormValues>({
        resolver: zodResolver(newChapterSchema),
        defaultValues: {
            title: '',
            content: '',
            chapterNumber: nextChapterNumber,
        },
    });

    // 챕터 목록 로드 후 회차 번호 업데이트
    if (chapters && form.getValues('chapterNumber') !== nextChapterNumber) {
        form.setValue('chapterNumber', nextChapterNumber);
    }

    const onSubmit = async (data: NewChapterFormValues) => {
        if (!workId) return;

        try {
            await createChapter.mutateAsync({
                workId,
                chapterData: {
                    title: data.title,
                    content: data.content,
                    chapterNumber: data.chapterNumber,
                },
            });
            // 생성 완료 후 챕터 관리 페이지로 이동
            navigate(`/author/works/${workId}/chapters`);
        } catch (err) {
            console.error('챕터 생성 실패:', err);
        }
    };

    if (workLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            </div>
        );
    }

    if (!work) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">작품을 찾을 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <Card>
                    <CardHeader>
                        <button
                            onClick={() => navigate(`/author/works/${workId}/chapters`)}
                            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-2 text-sm"
                        >
                            ← 챕터 목록으로
                        </button>
                        <CardTitle>새 챕터 작성</CardTitle>
                        <CardDescription>
                            "{work.title}"의 새로운 챕터를 작성하세요
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* 회차 번호 */}
                                <FormField
                                    control={form.control}
                                    name="chapterNumber"
                                    render={({ field }) => (
                                        <FormItem className="max-w-xs">
                                            <FormLabel>회차 번호</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(parseInt(e.target.value) || 1)
                                                    }
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                다음 회차: {nextChapterNumber}화
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 제목 */}
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>챕터 제목</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="이번 회차의 제목을 입력하세요"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 내용 */}
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>내용</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="챕터 내용을 작성하세요..."
                                                    rows={25}
                                                    className="font-mono resize-y min-h-[400px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <div className="flex justify-between text-xs text-zinc-500 mt-1">
                                                <span>최소 100자 이상</span>
                                                <span>{field.value.length.toLocaleString()}자</span>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 버튼 */}
                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => navigate(`/author/works/${workId}/chapters`)}
                                    >
                                        취소
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={createChapter.isPending}
                                    >
                                        {createChapter.isPending ? '발행 중...' : '챕터 발행'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default NewChapterPage;
