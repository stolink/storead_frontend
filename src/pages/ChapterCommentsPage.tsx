/**
 * 챕터 댓글 전용 페이지
 * 대댓글, 좋아요, 정렬(좋아요순/최신순) 지원
 */
import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CommentItemView } from '@/components/comments/CommentItemView';
import { usePublicChapter, usePublicWork } from '@/hooks/useDiscovery';
import { useComments, useCreateComment, useCreateReply, useToggleCommentLike } from '@/hooks/useComments';
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
    const createReply = useCreateReply();
    const toggleLike = useToggleCommentLike();

    // 댓글 평탄화 및 정렬
    // 댓글 평탄화 및 정렬
    const allComments = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

    const sortedComments = useMemo(() => {
        const topLevelComments = allComments.filter((c) => c.parentId === null);
        return [...topLevelComments].sort((a, b) => {
            if (sortBy === 'popular') {
                return b.likeCount - a.likeCount;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [allComments, sortBy]);

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

    // 대댓글 작성 (useCallback으로 안정화)
    // ✅ useCreateReply 훅을 사용하여 올바른 엔드포인트(POST /comments/{parentId}/replies) 호출
    const handleSubmitReply = useCallback(async (parentId: string) => {
        console.log('[DEBUG] handleSubmitReply called:', { parentId, replyContent, isAuthenticated });
        if (!replyContent.trim() || !isAuthenticated) {
            console.log('[DEBUG] Reply skipped - validation failed');
            return;
        }
        try {
            console.log('[DEBUG] Calling createReply.mutateAsync...');
            await createReply.mutateAsync({
                parentId,
                content: replyContent.trim(),
            });
            console.log('[DEBUG] createReply.mutateAsync completed');
            setReplyContent('');
            setReplyTo(null);
        } catch (error) {
            console.error('대댓글 작성 실패:', error);
        }
    }, [replyContent, isAuthenticated, createReply]);

    // 좋아요 토글 핸들러 (useCallback으로 안정화)
    const handleToggleLike = useCallback((commentId: string) => {
        toggleLike.mutate(commentId);
    }, [toggleLike]);

    // 답글 대상 설정 핸들러 (useCallback으로 안정화)
    const handleSetReplyTo = useCallback((commentId: string | null) => {
        setReplyTo(commentId);
    }, []);

    // 답글 내용 변경 핸들러 (useCallback으로 안정화)
    const handleReplyContentChange = useCallback((content: string) => {
        setReplyContent(content);
    }, []);

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
                            <CommentItemView
                                key={comment.id}
                                comment={comment}
                                replyToId={replyTo}
                                replyContent={replyContent}
                                allComments={allComments}
                                dividerClass={dividerClass}
                                onToggleLike={handleToggleLike}
                                onSetReplyTo={handleSetReplyTo}
                                onReplyContentChange={handleReplyContentChange}
                                onSubmitReply={handleSubmitReply}
                            />
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
