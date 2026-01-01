/**
 * 댓글 리스트 컴포넌트
 * 무한 스크롤 + 테마 연동 + 접기/더보기 기능
 */
import { useEffect, useRef, useState } from 'react';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommentItem } from './CommentItem';
import { useComments } from '@/hooks/useComments';
import { cn } from '@/lib/utils';
import {
    useThemeStore,
    themeClasses,
    dividerThemeClasses,
} from '@/stores/useTheme';

interface CommentListProps {
    chapterId: string;
    /** 초기에 접힌 상태로 시작할지 */
    collapsedByDefault?: boolean;
}

export const CommentList = ({
    chapterId,
    collapsedByDefault = false,
}: CommentListProps) => {
    const { theme } = useThemeStore();
    const [isCollapsed, setIsCollapsed] = useState(collapsedByDefault);
    const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const {
        data,
        isLoading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useComments(chapterId);

    // 모든 페이지의 댓글을 평탄화
    const comments = data?.pages.flatMap((page) => page.data) ?? [];

    // 최상위 댓글만 필터 (parentId가 null인 것)
    const topLevelComments = comments.filter((c) => c.parentId === null);

    // 정렬 적용
    const sortedComments = [...topLevelComments].sort((a, b) => {
        if (sortBy === 'popular') {
            return b.likeCount - a.likeCount;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // 접힌 상태면 상위 3개만 표시
    const displayedComments = isCollapsed ? sortedComments.slice(0, 3) : sortedComments;

    // Intersection Observer로 무한 스크롤
    useEffect(() => {
        if (isCollapsed) return; // 접힌 상태면 무한 스크롤 비활성화

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
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, isCollapsed]);

    return (
        <div className={cn('transition-colors', themeClasses[theme])}>
            {/* 헤더: 댓글 수 + 정렬 */}
            <div
                className={cn(
                    'flex items-center justify-between pb-4 border-b mb-4',
                    dividerThemeClasses[theme]
                )}
            >
                <h3 className="font-serif font-bold text-lg">
                    전체 댓글 <span className="text-purple-600">{comments.length}</span>
                </h3>
                <div className="flex items-center gap-2 text-sm">
                    <button
                        onClick={() => setSortBy('latest')}
                        className={cn(
                            'transition-opacity',
                            sortBy === 'latest' ? 'opacity-100 font-medium' : 'opacity-50'
                        )}
                    >
                        최신순
                    </button>
                    <span className="opacity-30">|</span>
                    <button
                        onClick={() => setSortBy('popular')}
                        className={cn(
                            'transition-opacity',
                            sortBy === 'popular' ? 'opacity-100 font-medium' : 'opacity-50'
                        )}
                    >
                        추천순
                    </button>
                </div>
            </div>

            {/* 댓글 목록 */}
            <div className={cn('divide-y', dividerThemeClasses[theme])}>
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin opacity-50" />
                    </div>
                ) : displayedComments.length === 0 ? (
                    <div className="text-center py-16 opacity-50">
                        <p className="mb-2 font-serif">아직 댓글이 없습니다.</p>
                        <p className="text-sm">첫 번째 댓글을 남겨보세요!</p>
                    </div>
                ) : (
                    displayedComments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))
                )}
            </div>

            {/* 더보기/접기 버튼 */}
            {sortedComments.length > 3 && (
                <div className="flex justify-center mt-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="gap-1"
                    >
                        {isCollapsed ? (
                            <>
                                <ChevronDown className="w-4 h-4" />
                                댓글 더보기 ({sortedComments.length - 3}개)
                            </>
                        ) : (
                            <>
                                <ChevronUp className="w-4 h-4" />
                                접기
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* 무한 스크롤 트리거 */}
            {!isCollapsed && <div ref={loadMoreRef} className="h-4" />}

            {/* 추가 로딩 중 */}
            {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin opacity-50" />
                </div>
            )}
        </div>
    );
};

export default CommentList;
