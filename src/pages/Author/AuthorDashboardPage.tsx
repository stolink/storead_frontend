/**
 * 작가 대시보드 페이지
 * 내 작품 목록 관리 (조회, 수정, 삭제)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExternalEditorUrl } from '@/utils/navigation';
import { useMyWorks } from '@/hooks/useExportChapter';
import { useDeleteWork } from '@/hooks/useWorks';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import type { Work } from '@/types';

// 장르 한글 매핑
const GENRE_LABELS: Record<string, string> = {
    FANTASY: '판타지',
    ROMANCE: '로맨스',
    MARTIAL_ARTS: '무협',
    THRILLER: '스릴러',
    SF: 'SF',
    DRAMA: '드라마',
};

// 상태 한글 매핑
const STATUS_LABELS: Record<string, string> = {
    ONGOING: '연재중',
    HIATUS: '휴재',
    COMPLETED: '완결',
    DRAFT: '임시저장',
};

// 상태 색상 매핑
const STATUS_COLORS: Record<string, string> = {
    ONGOING: 'bg-green-500',
    HIATUS: 'bg-yellow-500',
    COMPLETED: 'bg-blue-500',
    DRAFT: 'bg-gray-500',
};

export const AuthorDashboardPage = () => {
    const navigate = useNavigate();
    const { data: works, isLoading, error } = useMyWorks();
    const deleteWork = useDeleteWork();

    // 삭제 확인 모달
    const [deleteTarget, setDeleteTarget] = useState<Work | null>(null);

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            await deleteWork.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
        } catch (err) {
            console.error('작품 삭제 실패:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">작품 목록을 불러오는데 실패했습니다.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper">
            {/* 헤더 */}
            <header className="bg-cloud-50 border-b border-mocha-400">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* 뒤로가기 버튼 - 홈으로 이동 */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/')}
                                aria-label="홈으로 이동"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-ink">
                                    내 작품 관리
                                </h1>
                                <p className="text-mocha-700 mt-1">
                                    작품을 관리하고 새로운 챕터를 작성하세요
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => window.location.href = getExternalEditorUrl()}
                            className="bg-mocha-500 hover:bg-mocha-700 text-paper"
                        >
                            + 새 작품 만들기 (에디터로 이동)
                        </Button>
                    </div>
                </div>
            </header>

            {/* 작품 목록 */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                {works && works.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {works.map((work) => (
                            <Card
                                key={work.id}
                                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                                onClick={() => navigate(`/author/works/${work.id}/chapters`)}
                            >
                                {/* 커버 이미지 */}
                                <div className="aspect-[3/4] bg-gradient-to-br from-mocha-400 to-mocha-700 relative">
                                    {work.coverImageUrl ? (
                                        <img
                                            src={work.coverImageUrl}
                                            alt={work.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-white text-4xl font-bold opacity-50">
                                                {work.title.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    {/* 상태 배지 */}
                                    <Badge
                                        className={`absolute top-2 right-2 ${STATUS_COLORS[work.status] || 'bg-gray-500'}`}
                                    >
                                        {STATUS_LABELS[work.status] || work.status}
                                    </Badge>
                                </div>

                                <CardHeader className="pb-2">
                                    <CardTitle className="line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                        {work.title}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        <Badge variant="outline">
                                            {GENRE_LABELS[work.genre] || work.genre}
                                        </Badge>
                                        <span className="text-xs text-mocha-500">
                                            📖 {work.chapterCount || 0}화
                                        </span>
                                        <span className="text-xs">
                                            ⭐ {work.ratingCount > 0
                                                ? (work.ratingSum / work.ratingCount).toFixed(1)
                                                : '-'}
                                        </span>
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pb-2">
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                        {work.synopsis}
                                    </p>
                                </CardContent>

                                <CardFooter className="flex justify-end pt-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteTarget(work);
                                        }}
                                    >
                                        삭제
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="bg-cloud-50 rounded-xl shadow-paper p-12 text-center border border-mocha-400">
                        <p className="text-mocha-700 mb-4">
                            아직 작성한 작품이 없습니다.
                        </p>
                        <Button
                            onClick={() => window.location.href = getExternalEditorUrl()}
                            className="bg-mocha-500 hover:bg-mocha-700 text-paper"
                        >
                            첫 번째 작품 만들기 (에디터로 이동)
                        </Button>
                    </div>
                )}
            </main>

            {/* 삭제 확인 모달 */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>작품을 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            "{deleteTarget?.title}" 작품과 모든 챕터가 영구적으로 삭제됩니다.
                            이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteWork.isPending ? '삭제 중...' : '삭제'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AuthorDashboardPage;
