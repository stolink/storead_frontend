/**
 * 댓글 아이템 컴포넌트
 * 재귀적 렌더링으로 계층형 댓글 지원
 */
import { useState } from 'react';
import { Heart, MessageCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Comment } from '@/types';
import { useReplies, useCreateReply, useToggleCommentLike, useDeleteComment } from '@/hooks/useComments';
import { useAuthStore } from '@/stores/useAuthStore';

interface CommentItemProps {
    /** 댓글 데이터 */
    comment: Comment;
    /** 현재 깊이 (들여쓰기용) */
    depth?: number;
    /** 최대 깊이 */
    maxDepth?: number;
}

/**
 * 댓글 아이템 컴포넌트
 * 대댓글을 재귀적으로 렌더링
 */
export const CommentItem = ({
    comment,
    depth = 0,
    maxDepth = 3,
}: CommentItemProps) => {
    const [showReplies, setShowReplies] = useState(false);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    const { user } = useAuthStore();
    const { data: replies, isLoading: repliesLoading } = useReplies(comment.id, showReplies);
    const createReply = useCreateReply();
    const toggleLike = useToggleCommentLike();
    const deleteComment = useDeleteComment();

    const isAuthor = user?.id === comment.userId;

    // 대댓글 작성
    const handleSubmitReply = async () => {
        if (!replyContent.trim()) return;
        try {
            await createReply.mutateAsync({
                parentId: comment.id,
                content: replyContent.trim(),
            });
            setReplyContent('');
            setShowReplyInput(false);
            setShowReplies(true);
        } catch (error) {
            console.error('대댓글 작성 실패:', error);
        }
    };

    // 좋아요 토글
    const handleToggleLike = () => {
        toggleLike.mutate(comment.id);
    };

    // 삭제
    const handleDelete = () => {
        if (window.confirm('댓글을 삭제하시겠습니까?')) {
            deleteComment.mutate(comment.id);
        }
    };

    // 상대적 시간 계산
    const getRelativeTime = (date: string) => {
        const now = new Date();
        const commentDate = new Date(date);
        const diffMs = now.getTime() - commentDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return '방금 전';
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        return commentDate.toLocaleDateString('ko-KR');
    };

    return (
        <div
            className={cn(
                'py-4',
                depth > 0 && 'ml-6 border-l-2 border-zinc-200 dark:border-zinc-700 pl-4'
            )}
        >
            {/* 댓글 헤더 */}
            <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author?.profileImageUrl} />
                    <AvatarFallback>
                        {comment.author?.nickname?.charAt(0) || 'U'}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    {/* 작성자 정보 */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                            {comment.author?.nickname || '익명'}
                        </span>
                        <span className="text-xs text-zinc-400">
                            {getRelativeTime(comment.createdAt)}
                        </span>
                    </div>

                    {/* 댓글 내용 */}
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
                        {comment.content}
                    </p>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-4 mt-2">
                        {/* 좋아요 */}
                        <button
                            onClick={handleToggleLike}
                            className={cn(
                                'flex items-center gap-1 text-xs transition-colors',
                                comment.isLiked
                                    ? 'text-red-500'
                                    : 'text-zinc-400 hover:text-red-500'
                            )}
                        >
                            <Heart
                                className={cn('h-4 w-4', comment.isLiked && 'fill-current')}
                            />
                            <span>{comment.likeCount}</span>
                        </button>

                        {/* 답글 (최대 깊이 미만일 때만) */}
                        {depth < maxDepth && (
                            <button
                                onClick={() => setShowReplyInput(!showReplyInput)}
                                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600"
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span>답글</span>
                            </button>
                        )}

                        {/* 삭제 (작성자만) */}
                        {isAuthor && (
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-500"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>삭제</span>
                            </button>
                        )}
                    </div>

                    {/* 답글 입력 */}
                    {showReplyInput && (
                        <div className="mt-3 space-y-2">
                            <Textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="답글을 입력하세요..."
                                className="min-h-[80px] text-sm"
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowReplyInput(false)}
                                >
                                    취소
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSubmitReply}
                                    disabled={!replyContent.trim() || createReply.isPending}
                                >
                                    {createReply.isPending ? '등록 중...' : '등록'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* 대댓글 토글 버튼 */}
                    {comment.parentId === null && (replies?.length || 0) > 0 && (
                        <button
                            onClick={() => setShowReplies(!showReplies)}
                            className="flex items-center gap-1 mt-2 text-xs text-blue-500 hover:text-blue-600"
                        >
                            {showReplies ? (
                                <>
                                    <ChevronUp className="h-4 w-4" />
                                    답글 숨기기
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4" />
                                    답글 {replies?.length}개 보기
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* 대댓글 목록 (재귀) */}
            {showReplies && !repliesLoading && replies && (
                <div className="mt-2">
                    {replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            depth={depth + 1}
                            maxDepth={maxDepth}
                        />
                    ))}
                </div>
            )}

            {/* 대댓글 로딩 중 */}
            {showReplies && repliesLoading && (
                <div className="ml-6 mt-2 text-sm text-zinc-400">답글을 불러오는 중...</div>
            )}
        </div>
    );
};

export default CommentItem;
