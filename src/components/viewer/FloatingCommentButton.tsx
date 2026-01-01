/**
 * 플로팅 댓글 버튼
 * 스크롤 업 시 표시, 클릭 시 댓글 섹션으로 이동
 */
import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingCommentButtonProps {
    onClick?: () => void;
    commentCount?: number;
}

export const FloatingCommentButton = ({
    onClick,
    commentCount = 0,
}: FloatingCommentButtonProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // 스크롤 업 시 표시, 다운 시 숨김
            if (currentScrollY < lastScrollY && currentScrollY > 200) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <button
            onClick={onClick}
            className={cn(
                'fixed bottom-20 right-6 z-40 w-12 h-12 rounded-full',
                'bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm',
                'shadow-lg border border-zinc-200 dark:border-zinc-700',
                'flex items-center justify-center',
                'transition-all duration-300 ease-out',
                isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4 pointer-events-none'
            )}
            aria-label="댓글로 이동"
        >
            <MessageCircle className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
            {commentCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                    {commentCount > 99 ? '99+' : commentCount}
                </span>
            )}
        </button>
    );
};

export default FloatingCommentButton;
