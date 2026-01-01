/**
 * 챕터 뷰어 인터랙션 바
 * 좋아요 (중앙 하트), 마이크로 카피, 공유하기
 * 테마 연동
 */
import { useState } from 'react';
import { Heart, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    useThemeStore,
    themeClasses,
    dividerThemeClasses,
} from '@/stores/useTheme';

interface InteractionBarProps {
    likeCount?: number;
    isLiked?: boolean;
    onLike?: () => void;
    onShare?: () => void;
}

export const InteractionBar = ({
    likeCount = 0,
    isLiked = false,
    onLike,
    onShare,
}: InteractionBarProps) => {
    const { theme } = useThemeStore();
    const [isAnimating, setIsAnimating] = useState(false);

    // 좋아요 클릭 핸들러 (애니메이션 포함)
    const handleLikeClick = () => {
        setIsAnimating(true);
        onLike?.();
        setTimeout(() => setIsAnimating(false), 300);
    };

    return (
        <div
            className={cn(
                'py-12 border-t border-b transition-colors',
                dividerThemeClasses[theme],
                themeClasses[theme]
            )}
        >
            {/* 중앙 좋아요 영역 */}
            <div className="flex flex-col items-center gap-4">
                {/* 하트 버튼 */}
                <button
                    onClick={handleLikeClick}
                    className={cn(
                        'group flex flex-col items-center gap-2 transition-all duration-200',
                        isAnimating && 'scale-110'
                    )}
                    aria-label="좋아요"
                >
                    <div
                        className={cn(
                            'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200',
                            isLiked
                                ? 'bg-red-50 dark:bg-red-900/20'
                                : 'bg-zinc-100 dark:bg-zinc-800 group-hover:bg-red-50 dark:group-hover:bg-red-900/20'
                        )}
                    >
                        <Heart
                            className={cn(
                                'w-8 h-8 transition-all duration-200',
                                isLiked
                                    ? 'fill-red-500 text-red-500'
                                    : 'text-zinc-400 group-hover:text-red-400'
                            )}
                        />
                    </div>
                    <span className="text-2xl font-bold">
                        {likeCount.toLocaleString()}
                    </span>
                </button>

                {/* 마이크로 카피 */}
                <p className="text-sm opacity-60 font-serif">
                    이 화가 재미있으셨나요?
                </p>

                {/* 공유 버튼 */}
                <button
                    onClick={onShare}
                    className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity mt-2"
                >
                    <Share2 className="w-4 h-4" />
                    <span>공유하기</span>
                </button>
            </div>
        </div>
    );
};

export default InteractionBar;
