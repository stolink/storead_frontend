/**
 * 챕터 댓글 전용 페이지
 * 대댓글, 좋아요, 정렬(좋아요순/최신순) 지원
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePublicChapter, usePublicWork } from '@/hooks/useDiscovery';
import { useComments, useCreateComment, useToggleCommentLike } from '@/hooks/useComments';
import { useAuthStore } from '@/stores/useAuthStore';
import {
    useThemeStore,
    themeClasses,
    headerThemeClasses,
    backgroundThemeClasses,
    cardThemeClasses,
    dividerThemeClasses,
} from '@/stores/useTheme';
import { cn } from '@/lib/utils';
import type { Comment } from '@/types';

type SortBy = 'latest' | 'popular';

export const ChapterCommentsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { theme } = useThemeStore();
    const { isAuthenticated, user } = useAuthStore();

    const [sortBy, setSortBy] = useState<SortBy>('latest');
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    // 데이터 페칭
    const { data: chapter } = usePublicChapter(id || '');
    const { data: work } = usePublicWork(chapter?.workId || '');
    const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useComments(id || '');
    const createComment = useCreateComment();
    const toggleLike = useToggleCommentLike();

    // 댓글 평탄화 및 정렬
    const allComments = data?.pages.flatMap((page) => page.data) ?? [];
    const topLevelComments = allComments.filter((c) => c.parentId === null);
    const sortedComments = [...topLevelComments].sort((a, b) => {
        if (sortBy === 'popular') {
            return b.likeCount - a.likeCount;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // 테마 클래스
    const bgClass = backgroundThemeClasses[theme];
    const headerClass = headerThemeClasses[theme];
    const cardClass = cardThemeClasses[theme];
    const textClass = themeClasses[theme];
    const dividerClass = dividerThemeClasses[theme];

    // 댓글 작성
    const handleSubmitComment = async () => {
        if (!newComment.trim() || !isAuthenticated || !id) return;
        try {
            await createComment.mutateAsync({
                chapterId: id,
                data: { content: newComment.trim() },
            });
            setNewComment('');
        } catch (error) {
            console.error('댓글 작성 실패:', error);
        }
    };

    // 대댓글 작성
    const handleSubmitReply = async (parentId: string) => {
        if (!replyContent.trim() || !isAuthenticated || !id) return;
        try {
            await createComment.mutateAsync({
                chapterId: id,
                data: { content: replyContent.trim(), parentId },
            });
            setReplyContent('');
            setReplyTo(null);
        } catch (error) {
            console.error('대댓글 작성 실패:', error);
        }
    };

    // 상대 시간 계산
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

    // 댓글 아이템 렌더링
    const CommentItemView = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
        const replies = allComments.filter((c) => c.parentId === comment.id);

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
                                onClick={() => toggleLike.mutate(comment.id)}
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
                                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                    className="text-xs opacity-50 hover:opacity-100"
                                >
                                    답글
                                </button>
                            )}
                        </div>

                        {/* 대댓글 입력 */}
                        {replyTo === comment.id && (
                            <div className="mt-3 flex gap-2">
                                <Textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="답글을 입력하세요..."
                                    className="min-h-[60px] text-sm"
                                />
                                <div className="flex flex-col gap-1">
                                    <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                                        등록
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>
                                        취소
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 대댓글 목록 */}
                        {replies.length > 0 && (
                            <div className={cn('border-l-2 mt-2', dividerClass)}>
                                {replies.map((reply) => (
                                    <CommentItemView key={reply.id} comment={reply} isReply />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={cn('min-h-screen transition-colors', bgClass)}>
            {/* 헤더 */}
            <header className={cn('sticky top-0 z-40 backdrop-blur-sm border-b', headerClass)}>
                <div className="flex items-center px-4 h-14">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className={cn('ml-2', textClass)}>
                        <p className="text-xs opacity-60">{work?.title}</p>
                        <p className="text-sm font-serif">{chapter?.chapterNumber}화 댓글</p>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 pb-24">
                {/* 정렬 필터 */}
                <div className={cn('flex items-center justify-between py-4 border-b', dividerClass)}>
                    <span className={cn('font-serif font-medium', textClass)}>
                        댓글 <span className="text-purple-600">{allComments.length}</span>
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                        <button
                            onClick={() => setSortBy('latest')}
                            className={cn(sortBy === 'latest' ? 'font-medium' : 'opacity-50')}
                        >
                            최신순
                        </button>
                        <span className="opacity-30">|</span>
                        <button
                            onClick={() => setSortBy('popular')}
                            className={cn(sortBy === 'popular' ? 'font-medium' : 'opacity-50')}
                        >
                            좋아요순
                        </button>
                    </div>
                </div>

                {/* 댓글 목록 */}
                <div className={cn('divide-y', dividerClass)}>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin opacity-50" />
                        </div>
                    ) : sortedComments.length === 0 ? (
                        <div className="text-center py-16 opacity-50">
                            <p className="mb-2 font-serif">아직 댓글이 없습니다.</p>
                            <p className="text-sm">첫 번째 댓글을 남겨보세요!</p>
                        </div>
                    ) : (
                        sortedComments.map((comment) => (
                            <CommentItemView key={comment.id} comment={comment} />
                        ))
                    )}
                </div>

                {/* 더보기 */}
                {hasNextPage && (
                    <div className="flex justify-center py-4">
                        <Button variant="ghost" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                            {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : '더보기'}
                        </Button>
                    </div>
                )}
            </main>

            {/* 하단 고정 입력창 */}
            {isAuthenticated ? (
                <div className={cn('fixed bottom-0 left-0 right-0 border-t backdrop-blur-sm p-4', cardClass, dividerClass)}>
                    <div className="max-w-2xl mx-auto flex gap-2">
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback>{user?.nickname?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="댓글을 입력하세요..."
                            className={cn(
                                'flex-1 bg-transparent border rounded-full px-4 py-2 text-sm outline-none',
                                'focus:ring-2 focus:ring-purple-500',
                                dividerClass
                            )}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                        />
                        <Button
                            size="icon"
                            onClick={handleSubmitComment}
                            disabled={!newComment.trim() || createComment.isPending}
                            className="rounded-full bg-purple-600 hover:bg-purple-700 shrink-0"
                        >
                            <Send className="w-4 h-4 text-white" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className={cn('fixed bottom-0 left-0 right-0 border-t backdrop-blur-sm p-4 text-center text-sm opacity-60', cardClass)}>
                    댓글을 작성하려면 로그인하세요.
                </div>
            )}
        </div>
    );
};

export default ChapterCommentsPage;
