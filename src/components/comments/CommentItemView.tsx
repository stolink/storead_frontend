/**
 * 댓글 아이템 뷰 컴포넌트 (ChapterCommentsPage 전용)
 * 렌더 함수 외부에 분리하여 포커스 유실 문제 해결
 */
import { memo } from 'react';
import { Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Comment } from '@/types';
import { useReplies } from '@/hooks/useComments';

interface CommentItemViewProps {
    /** 댓글 데이터 */
    comment: Comment;
    /** 대댓글 여부 */
    isReply?: boolean;
    /** 현재 답글 대상 댓글 ID */
    replyToId: string | null;
    /** 답글 내용 */
    replyContent: string;
    /** 전체 댓글 목록 (대댓글 필터링용) */
    allComments: Comment[];
    /** 테마 클래스 */
    dividerClass: string;
    /** 좋아요 토글 핸들러 */
    onToggleLike: (commentId: string) => void;
    /** 답글 대상 설정 핸들러 */
    onSetReplyTo: (commentId: string | null) => void;
    /** 답글 내용 변경 핸들러 */
    onReplyContentChange: (content: string) => void;
    /** 답글 제출 핸들러 */
    onSubmitReply: (parentId: string) => void;
}

/**
 * 상대 시간 계산 유틸리티
 */
const getRelativeTime = (date: string): string => {
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

/**
 * 댓글 아이템 뷰 컴포넌트
 * memo로 감싸서 불필요한 리렌더링 방지
 */
export const CommentItemView = memo(({
    comment,
    isReply = false,
    replyToId,
    replyContent,
    allComments,
    dividerClass,
    onToggleLike,
    onSetReplyTo,
    onReplyContentChange,
    onSubmitReply,
}: CommentItemViewProps) => {
    // 대댓글 데이터 페칭
    // 백엔드의 getComments는 최상위 댓글만 반환하므로, 대댓글은 별도로 가져와야 함
    const { data: remoteReplies } = useReplies(comment.id, (comment.replyCount || 0) > 0);
    const replies = remoteReplies || [];

    return (
        <div className={cn('py-4', isReply && 'ml-8 mt-2')}>
            <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author?.profileImageUrl} />
                    <AvatarFallback>{comment.author?.nickname?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author?.nickname || '익명'}</span>
                        <span className="text-xs opacity-50">{getRelativeTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={() => onToggleLike(comment.id)}
                            className={cn(
                                'flex items-center gap-1 text-xs transition-colors',
                                comment.isLiked ? 'text-red-500' : 'opacity-50 hover:opacity-100'
                            )}
                        >
                            <Heart className={cn('h-4 w-4', comment.isLiked && 'fill-current')} />
                            <span>{comment.likeCount}</span>
                        </button>
                        {!isReply && (
                            <button
                                onClick={() => onSetReplyTo(replyToId === comment.id ? null : comment.id)}
                                className="text-xs opacity-50 hover:opacity-100"
                            >
                                답글
                            </button>
                        )}
                    </div>

                    {/* 대댓글 입력 */}
                    {replyToId === comment.id && (
                        <div className="mt-3 flex gap-2">
                            <Textarea
                                value={replyContent}
                                onChange={(e) => onReplyContentChange(e.target.value)}
                                placeholder="답글을 입력하세요..."
                                className="min-h-[60px] text-sm"
                                autoFocus
                            />
                            <div className="flex flex-col gap-1">
                                <Button size="sm" onClick={() => onSubmitReply(comment.id)}>
                                    등록
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => onSetReplyTo(null)}>
                                    취소
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* 대댓글 목록 (재귀 렌더링) */}
                    {replies.length > 0 && (
                        <div className={cn('border-l-2 mt-2', dividerClass)}>
                            {replies.map((reply) => (
                                <CommentItemView
                                    key={reply.id}
                                    comment={reply}
                                    isReply
                                    replyToId={replyToId}
                                    replyContent={replyContent}
                                    allComments={allComments}
                                    dividerClass={dividerClass}
                                    onToggleLike={onToggleLike}
                                    onSetReplyTo={onSetReplyTo}
                                    onReplyContentChange={onReplyContentChange}
                                    onSubmitReply={onSubmitReply}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

CommentItemView.displayName = 'CommentItemView';

export default CommentItemView;
