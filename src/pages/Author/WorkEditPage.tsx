/**
 * 작품 편집 페이지
 * 작품 정보 수정 (제목, 줄거리, 장르, 상태)
 */
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWork, useUpdateWork } from '@/hooks/useWorks';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// 유효성 검사 스키마
const workSchema = z.object({
    title: z.string().min(1, '제목을 입력하세요'),
    synopsis: z.string().min(10, '줄거리는 최소 10자 이상 입력하세요'),
    genre: z.enum(['FANTASY', 'ROMANCE', 'MARTIAL_ARTS', 'THRILLER', 'SF', 'DRAMA']),
    status: z.enum(['DRAFT', 'ONGOING', 'COMPLETED', 'HIATUS']),
    coverImageUrl: z.string().optional(),
});

type WorkFormValues = z.infer<typeof workSchema>;

const GENRE_OPTIONS = [
    { value: 'FANTASY', label: '판타지' },
    { value: 'ROMANCE', label: '로맨스' },
    { value: 'MARTIAL_ARTS', label: '무협' },
    { value: 'THRILLER', label: '스릴러' },
    { value: 'SF', label: 'SF' },
    { value: 'DRAMA', label: '드라마' },
];

const STATUS_OPTIONS = [
    { value: 'DRAFT', label: '임시저장' },
    { value: 'ONGOING', label: '연재중' },
    { value: 'HIATUS', label: '휴재' },
    { value: 'COMPLETED', label: '완결' },
];

export const WorkEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: work, isLoading, error } = useWork(id || '');
    const updateWork = useUpdateWork();

    const form = useForm<WorkFormValues>({
        resolver: zodResolver(workSchema),
        defaultValues: {
            title: '',
            synopsis: '',
            genre: 'FANTASY',
            status: 'DRAFT',
            coverImageUrl: '',
        },
    });

    // 작품 데이터 로드 시 폼에 반영
    useEffect(() => {
        if (work) {
            form.reset({
                title: work.title,
                synopsis: work.synopsis,
                genre: work.genre,
                status: work.status as 'DRAFT' | 'ONGOING' | 'COMPLETED' | 'HIATUS',
                coverImageUrl: work.coverImageUrl || '',
            });
        }
    }, [work, form]);

    const onSubmit = async (data: WorkFormValues) => {
        if (!id) return;

        try {
            await updateWork.mutateAsync({
                workId: id,
                params: data,
            });
            navigate('/author');
        } catch (err) {
            console.error('작품 수정 실패:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            </div>
        );
    }

    if (error || !work) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">작품을 불러오는데 실패했습니다.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>작품 수정</CardTitle>
                        <CardDescription>
                            작품 정보를 수정하세요
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* 제목 */}
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>제목</FormLabel>
                                            <FormControl>
                                                <Input placeholder="작품 제목" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 줄거리 */}
                                <FormField
                                    control={form.control}
                                    name="synopsis"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>줄거리</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="작품 줄거리를 입력하세요"
                                                    rows={5}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 장르 */}
                                <FormField
                                    control={form.control}
                                    name="genre"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>장르</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="장르 선택" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {GENRE_OPTIONS.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 상태 */}
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>연재 상태</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="상태 선택" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {STATUS_OPTIONS.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 커버 이미지 URL */}
                                <FormField
                                    control={form.control}
                                    name="coverImageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>커버 이미지 URL (선택)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="https://example.com/cover.jpg"
                                                    {...field}
                                                />
                                            </FormControl>
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
                                        onClick={() => navigate('/author')}
                                    >
                                        취소
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={updateWork.isPending}
                                    >
                                        {updateWork.isPending ? '저장 중...' : '저장'}
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

export default WorkEditPage;
