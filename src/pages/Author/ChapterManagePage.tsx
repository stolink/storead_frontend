/**
 * 챕터 관리 페이지
 * 작품의 챕터 목록 조회, 수정, 삭제
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { navigateToExternalEditor } from '@/utils/navigation';
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
            <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 font-serif">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <button
                                onClick={() => navigate('/author')}
                                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-2 text-sm sans-serif"
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
                        <Button
                            onClick={() => {
                                navigateToExternalEditor(work.projectId);
                            }}
                            className="bg-zinc-900 text-white hover:bg-zinc-800"
                        >
                            + 새 챕터 작성
                        </Button>
                    </div>
                </div>
            </header>

            {/* 챕터 목록 */}
            <main className="max-w-6xl mx-auto px-4 py-8 font-serif">
                <Card className="border-none shadow-none bg-transparent">
                    <CardHeader className="px-0 pt-0 pb-6">
                        <CardTitle>회차 목록</CardTitle>
                        <CardDescription>
                            회차를 선택하여 수정하거나 삭제할 수 있습니다
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                        {chapters && chapters.length > 0 ? (
                            <Table className="divide-y divide-[#EEEEEE]">
                                <TableHeader>
                                    <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                                        <TableHead className="w-20 text-center font-medium text-zinc-500">번호</TableHead>
                                        <TableHead className="font-medium text-zinc-500">회차 제목</TableHead>
                                        <TableHead className="w-32 text-center font-medium text-zinc-500">상태</TableHead>
                                        <TableHead className="w-32 text-center font-medium text-zinc-500">등록일</TableHead>
                                        <TableHead className="w-24 text-right font-medium text-zinc-500">작업</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-[#EEEEEE]">
                                    {chapters
                                        .sort((a, b) => a.chapterNumber - b.chapterNumber)
                                        .map((chapter) => (
                                            <TableRow key={chapter.id} className="hover:bg-zinc-50/50 transition-colors border-b border-[#EEEEEE]">
                                                <TableCell className="text-center text-zinc-500">
                                                    {chapter.chapterNumber}
                                                </TableCell>
                                                <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                                                    {chapter.title}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`font-normal ${chapter.status === 'PUBLISHED'
                                                            ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                                                            : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                                            }`}
                                                    >
                                                        {chapter.status === 'PUBLISHED' ? '발행' : '임시저장'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center text-zinc-500 text-sm">
                                                    {formatDate(chapter.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-zinc-500 hover:text-zinc-900"
                                                            onClick={() => {
                                                                navigateToExternalEditor(
                                                                    work.projectId,
                                                                    chapter.documentId
                                                                );
                                                            }}
                                                        >
                                                            수정
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
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
                            <div className="text-center py-20">
                                <p className="text-zinc-400 dark:text-zinc-500 font-serif">
                                    아직 작성된 회차가 없습니다. 상단의 "새 챕터 작성" 버튼을 눌러 회차를 추가하세요.
                                </p>
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
