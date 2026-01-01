/**
 * 새 작품 생성 페이지
 */
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateWork } from '@/hooks/useExportChapter';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// 유효성 검사 스키마
const newWorkSchema = z.object({
    title: z.string().min(1, '제목을 입력하세요'),
    synopsis: z.string().min(10, '줄거리는 최소 10자 이상 입력하세요'),
    genre: z.enum(['FANTASY', 'ROMANCE', 'MARTIAL_ARTS', 'THRILLER', 'SF', 'DRAMA']),
    coverImageUrl: z.string().url('올바른 URL 형식이 아닙니다').optional().or(z.literal('')),
});

type NewWorkFormValues = z.infer<typeof newWorkSchema>;

const GENRE_OPTIONS = [
    { value: 'FANTASY', label: '판타지' },
    { value: 'ROMANCE', label: '로맨스' },
    { value: 'MARTIAL_ARTS', label: '무협' },
    { value: 'THRILLER', label: '스릴러' },
    { value: 'SF', label: 'SF' },
    { value: 'DRAMA', label: '드라마' },
];

export const NewWorkPage = () => {
    const navigate = useNavigate();
    const createWork = useCreateWork();

    const form = useForm<NewWorkFormValues>({
        resolver: zodResolver(newWorkSchema),
        defaultValues: {
            title: '',
            synopsis: '',
            genre: 'FANTASY',
            coverImageUrl: '',
        },
    });

    const onSubmit = async (data: NewWorkFormValues) => {
        try {
            const newWork = await createWork.mutateAsync({
                title: data.title,
                synopsis: data.synopsis,
                genre: data.genre,
                coverImageUrl: data.coverImageUrl || undefined,
            });
            // 생성 완료 후 작품 관리 페이지로 이동
            navigate(`/author/works/${newWork.id}`);
        } catch (err) {
            console.error('작품 생성 실패:', err);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <Card>
                    <CardHeader>
                        <button
                            onClick={() => navigate('/author')}
                            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-2 text-sm"
                        >
                            ← 작품 목록으로
                        </button>
                        <CardTitle>새 작품 만들기</CardTitle>
                        <CardDescription>
                            새로운 작품의 기본 정보를 입력하세요
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
                                                <Input placeholder="작품 제목을 입력하세요" {...field} />
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
                                                        <SelectValue placeholder="장르를 선택하세요" />
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

                                {/* 줄거리 */}
                                <FormField
                                    control={form.control}
                                    name="synopsis"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>줄거리</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="작품의 줄거리를 입력하세요. 독자들이 작품을 선택할 때 참고하는 중요한 정보입니다."
                                                    rows={5}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                최소 10자 이상 입력해주세요
                                            </FormDescription>
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
                                            <FormDescription>
                                                작품 표지로 사용할 이미지 URL을 입력하세요
                                            </FormDescription>
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
                                        onClick={() => navigate('/author')}
                                    >
                                        취소
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={createWork.isPending}
                                    >
                                        {createWork.isPending ? '생성 중...' : '작품 만들기'}
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

export default NewWorkPage;
