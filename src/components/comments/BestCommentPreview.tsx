/**
 * 베스트 댓글 미리보기 컴포넌트
 * 추천 많은 댓글 1~2개를 카드 형태로 표시
 * 테마 연동
 */
import { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    useThemeStore,
    themeClasses,
    previewBgClasses,
} from '@/stores/useTheme';
import type { Comment } from '@/types';

interface BestCommentPreviewProps {
    comments: Comment[];
    onViewAll?: () => void;
}

export const BestCommentPreview = ({
    comments,
    onViewAll,
}: BestCommentPreviewProps) => {
    const { theme } = useThemeStore();

    // 추천 많은 순으로 정렬 후 상위 2개 (메모이제이션)
    const bestComments = useMemo(() => {
        return [...comments]
            .sort((a, b) => b.likeCount - a.likeCount)
            .slice(0, 2);
    }, [comments]);

    if (bestComments.length === 0) return null;

    return (
        <div className={cn('py-8 transition-colors', themeClasses[theme])}>
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-medium">베스트 댓글</h3>
                <button
                    onClick={onViewAll}
                    className="text-sm opacity-60 hover:opacity-100 transition-opacity"
                >
                    전체 보기
                </button>
            </div>

            {/* 베스트 댓글 카드 */}
            <div className="space-y-3">
                {bestComments.map((comment) => (
                    <div
                        key={comment.id}
                        className={cn(
                            'p-4 rounded-lg transition-colors',
                            previewBgClasses[theme]
                        )}
                    >
                        {/* 작성자 */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">
                                {comment.author?.nickname || '익명'}
                            </span>
                            <div className="flex items-center gap-1 text-red-500">
                                <Heart className="w-3 h-3 fill-current" />
                                <span className="text-xs">{comment.likeCount}</span>
                            </div>
                        </div>

                        {/* 댓글 내용 (2줄 제한) */}
                        <p className="text-sm opacity-80 line-clamp-2 font-serif">
                            {comment.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BestCommentPreview;
