/**
 * 챕터 관리 페이지
 * 작품의 챕터 목록 조회, 수정, 삭제
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWork } from '@/hooks/useWorks';
import { useWorkChapters, useDeleteChapter } from '@/hooks/useChapters';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import type { Chapter } from '@/types';

export const ChapterManagePage = () => {
    const { workId } = useParams<{ workId: string }>();
    const navigate = useNavigate();
    const { data: work, isLoading: workLoading } = useWork(workId || '');
    const { data: chapters, isLoading: chaptersLoading } = useWorkChapters(workId || '');
    const deleteChapter = useDeleteChapter();

    // 삭제 확인 모달
    const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null);

    const handleDelete = async () => {
        if (!deleteTarget || !workId) return;

        try {
            await deleteChapter.mutateAsync({
                chapterId: deleteTarget.id,
                workId: workId,
            });
            setDeleteTarget(null);
        } catch (err) {
            console.error('챕터 삭제 실패:', err);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (workLoading || chaptersLoading) {
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
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            {/* 헤더 */}
            <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <button
                                onClick={() => navigate('/author')}
                                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-2 text-sm"
                            >
                                ← 작품 목록으로
                            </button>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {work.title}
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                                챕터 관리 · 총 {chapters?.length || 0}개
                            </p>
                        </div>
                        <Button onClick={() => navigate(`/author/works/${workId}/chapters/new`)}>
                            + 새 챕터 작성
                        </Button>
                    </div>
                </div>
            </header>

            {/* 챕터 목록 */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>챕터 목록</CardTitle>
                        <CardDescription>
                            챕터를 선택하여 수정하거나 삭제할 수 있습니다
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {chapters && chapters.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16">회차</TableHead>
                                        <TableHead>제목</TableHead>
                                        <TableHead className="w-24 text-center">조회수</TableHead>
                                        <TableHead className="w-24 text-center">별점</TableHead>
                                        <TableHead className="w-32">작성일</TableHead>
                                        <TableHead className="w-40 text-right">작업</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {chapters
                                        .sort((a, b) => a.chapterNumber - b.chapterNumber)
                                        .map((chapter) => (
                                            <TableRow key={chapter.id}>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {chapter.chapterNumber}화
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {chapter.title}
                                                </TableCell>
                                                <TableCell className="text-center text-zinc-500">
                                                    {chapter.viewCount.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {chapter.ratingCount > 0
                                                        ? `⭐ ${(chapter.ratingSum / chapter.ratingCount).toFixed(1)}`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="text-zinc-500 text-sm">
                                                    {formatDate(chapter.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/author/chapters/${chapter.id}/edit`
                                                                )
                                                            }
                                                        >
                                                            수정
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => setDeleteTarget(chapter)}
                                                        >
                                                            삭제
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                                    아직 작성된 챕터가 없습니다.
                                </p>
                                <Button
                                    onClick={() => navigate(`/author/works/${workId}/chapters/new`)}
                                >
                                    첫 번째 챕터 작성하기
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* 삭제 확인 모달 */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>챕터를 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            "{deleteTarget?.title}" 챕터가 영구적으로 삭제됩니다.
                            이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteChapter.isPending ? '삭제 중...' : '삭제'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ChapterManagePage;
