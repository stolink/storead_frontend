/**
 * 하단 고정 댓글 입력창
 * 테마 연동 + 개선된 플레이스홀더
 */
import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateComment } from '@/hooks/useComments';
import { useAuthStore } from '@/stores/useAuthStore';
import {
    useThemeStore,
    cardThemeClasses,
    dividerThemeClasses,
} from '@/stores/useTheme';
import { cn } from '@/lib/utils';

interface StickyCommentInputProps {
    chapterId: string;
}

export const StickyCommentInput = ({ chapterId }: StickyCommentInputProps) => {
    const [content, setContent] = useState('');
    const { isAuthenticated, user } = useAuthStore();
    const { theme } = useThemeStore();
    const createComment = useCreateComment();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !isAuthenticated) return;

        try {
            await createComment.mutateAsync({
                chapterId,
                data: { content: content.trim() },
            });
            setContent('');
        } catch (error) {
            console.error('댓글 작성 실패:', error);
        }
    };

    if (!isAuthenticated) {
        return (
            <div
                className={cn(
                    'fixed bottom-0 left-0 right-0 z-50 p-4 border-t backdrop-blur-sm',
                    cardThemeClasses[theme],
                    dividerThemeClasses[theme]
                )}
            >
                <div className="max-w-4xl mx-auto text-center text-sm opacity-60">
                    댓글을 작성하려면 로그인하세요.
                </div>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                'fixed bottom-0 left-0 right-0 z-50 p-4 border-t backdrop-blur-sm',
                cardThemeClasses[theme],
                dividerThemeClasses[theme]
            )}
        >
            <div className="max-w-4xl mx-auto flex gap-3 items-center">
                {/* 프로필 이니셜 */}
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-medium shrink-0">
                    {user?.nickname?.charAt(0) || 'U'}
                </div>

                {/* 입력창 */}
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="작품에 대한 감상을 남겨보세요"
                    className={cn(
                        'flex-1 bg-transparent border rounded-full px-4 py-2',
                        'focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none',
                        'transition-all font-serif text-sm',
                        dividerThemeClasses[theme]
                    )}
                />

                {/* 전송 버튼 */}
                <Button
                    type="submit"
                    size="icon"
                    disabled={!content.trim() || createComment.isPending}
                    className="rounded-full bg-purple-600 hover:bg-purple-700 shrink-0"
                >
                    <Send className="w-4 h-4 text-white" />
                </Button>
            </div>
        </form>
    );
};

export default StickyCommentInput;
