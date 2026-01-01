/**
 * 챕터 편집 페이지
 * 챕터 내용 수정
 */
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useChapter, useUpdateChapter } from '@/hooks/useChapters';
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
} from '@/components/ui/form';

// 유효성 검사 스키마
const chapterSchema = z.object({
    title: z.string().min(1, '제목을 입력하세요'),
    content: z.string().min(100, '내용은 최소 100자 이상 입력하세요'),
    chapterNumber: z.number().min(1, '1 이상의 회차 번호를 입력하세요'),
});

type ChapterFormValues = z.infer<typeof chapterSchema>;

export const ChapterEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: chapter, isLoading, error } = useChapter(id || '');
    const updateChapter = useUpdateChapter();

    const form = useForm<ChapterFormValues>({
        resolver: zodResolver(chapterSchema),
        defaultValues: {
            title: '',
            content: '',
            chapterNumber: 1,
        },
    });

    // 챕터 데이터 로드 시 폼에 반영
    useEffect(() => {
        if (chapter) {
            form.reset({
                title: chapter.title,
                content: chapter.content,
                chapterNumber: chapter.chapterNumber,
            });
        }
    }, [chapter, form]);

    const onSubmit = async (data: ChapterFormValues) => {
        if (!id) return;

        try {
            await updateChapter.mutateAsync({
                chapterId: id,
                params: data,
            });
            // 수정 완료 후 챕터 관리 페이지로 이동
            if (chapter?.workId) {
                navigate(`/author/works/${chapter.workId}/chapters`);
            } else {
                navigate('/author');
            }
        } catch (err) {
            console.error('챕터 수정 실패:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            </div>
        );
    }

    if (error || !chapter) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">챕터를 불러오는데 실패했습니다.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <Card>
                    <CardHeader>
                        <button
                            onClick={() => navigate(-1)}
                            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-2 text-sm"
                        >
                            ← 뒤로 가기
                        </button>
                        <CardTitle>챕터 수정</CardTitle>
                        <CardDescription>
                            {chapter.chapterNumber}화 - 챕터 내용을 수정하세요
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
                                        <FormItem>
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
                                                <Input placeholder="챕터 제목" {...field} />
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
                                                    placeholder="챕터 내용을 입력하세요"
                                                    rows={20}
                                                    className="font-mono resize-y"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <div className="text-xs text-zinc-500 mt-1">
                                                {field.value.length.toLocaleString()}자
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 버튼 */}
                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => navigate(-1)}
                                    >
                                        취소
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={updateChapter.isPending}
                                    >
                                        {updateChapter.isPending ? '저장 중...' : '저장'}
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

export default ChapterEditPage;
