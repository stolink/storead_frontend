import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Draft } from "@/hooks/useDraft";

interface DraftQuickEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    draft: Draft | null;
    onSave: (updatedDraft: Partial<Draft>) => Promise<void>;
}

export function DraftQuickEditModal({
    isOpen,
    onClose,
    draft,
    onSave,
}: DraftQuickEditModalProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (draft) {
            setTitle(draft.title || "");
            setContent(draft.content || "");
        }
    }, [draft]);

    const handleSave = async () => {
        if (!draft) return;
        setIsSaving(true);
        try {
            await onSave({ title, content });
            onClose();
        } catch (error) {
            console.error("저장 실패:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>항목 수정</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">제목</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목을 입력하세요"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">내용 (미리보기)</label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="내용을 입력하세요"
                            className="min-h-[200px] resize-none"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        취소
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "저장 중..." : "저장"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
