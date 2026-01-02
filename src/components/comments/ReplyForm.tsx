import { useState, memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ReplyFormProps {
    onSubmit: (content: string) => Promise<void>;
    onCancel: () => void;
    isPending: boolean;
}

export const ReplyForm = memo(({ onSubmit, onCancel, isPending }: ReplyFormProps) => {
    const [content, setContent] = useState('');

    const handleSubmit = useCallback(async () => {
        if (!content.trim()) return;
        await onSubmit(content.trim());
        setContent('');
    }, [content, onSubmit]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    }, []);

    return (
        <div className="mt-3 space-y-2 ml-10">
            <Textarea
                value={content}
                onChange={handleChange}
                placeholder="답글을 입력하세요..."
                className="min-h-[80px] text-sm"
                autoFocus
            />
            <div className="flex justify-end gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                >
                    취소
                </Button>
                <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!content.trim() || isPending}
                >
                    {isPending ? '등록 중...' : '등록'}
                </Button>
            </div>
        </div>
    );
});

ReplyForm.displayName = 'ReplyForm';
