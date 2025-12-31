/**
 * 댓글 리스트 컴포넌트
 * 무한 스크롤 + Intersection Observer
 */
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CommentItem } from './CommentItem';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { useAuthStore } from '@/stores/useAuthStore';

interface CommentListProps {
    /** 챕터 ID */
    chapterId: string;
}

/**
 * 댓글 리스트 컴포넌트
 * 무한 스크롤로 댓글을 로드하고 새 댓글 작성 지원
 */
export const CommentList = ({ chapterId }: CommentListProps) => {
    const [newComment, setNewComment] = useState('');
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const { user, isAuthenticated } = useAuthStore();
    const {
        data,
        isLoading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useComments(chapterId);
    const createComment = useCreateComment();

    // 모든 페이지의 댓글을 평탄화
    const comments = data?.pages.flatMap((page) => page.data) ?? [];
    // 최상위 댓글만 필터 (parentId가 null인 것)
    const topLevelComments = comments.filter((c) => c.parentId === null);

    // Intersection Observer로 무한 스크롤
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // 새 댓글 작성
    const handleSubmit = async () => {
        if (!newComment.trim() || !isAuthenticated) return;

        try {
            await createComment.mutateAsync({
                chapterId,
                data: { content: newComment.trim() },
            });
            setNewComment('');
        } catch (error) {
            console.error('댓글 작성 실패:', error);
        }
    };

    return (
        <div className="space-y-4">
            {/* 댓글 작성 폼 */}
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                {isAuthenticated ? (
                    <>
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="댓글을 남겨보세요..."
                            className="min-h-[100px] mb-3 resize-none"
                        />
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-zinc-400">
                                {user?.nickname}으로 작성
                            </span>
                            <Button
                                onClick={handleSubmit}
                                disabled={!newComment.trim() || createComment.isPending}
                            >
                                {createComment.isPending ? '등록 중...' : '댓글 등록'}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4 text-zinc-500">
                        댓글을 작성하려면 로그인하세요.
                    </div>
                )}
            </div>

            {/* 댓글 개수 */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                    댓글 {comments.length > 0 ? `(${comments.length})` : ''}
                </h3>
            </div>

            {/* 댓글 목록 */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                    </div>
                ) : topLevelComments.length === 0 ? (
                    <div className="text-center py-8 text-zinc-400">
                        아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
                    </div>
                ) : (
                    topLevelComments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))
                )}
            </div>

            {/* 무한 스크롤 트리거 */}
            <div ref={loadMoreRef} className="h-4" />

            {/* 추가 로딩 중 */}
            {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                </div>
            )}
        </div>
    );
};

export default CommentList;
