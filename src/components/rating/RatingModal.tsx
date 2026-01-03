/**
 * 별점 모달 컴포넌트
 * 페이지 모드에서 헤더의 별점 아이콘 클릭 시 표시
 */
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { cn } from "@/lib/utils";

interface RatingModalProps {
    /** 모달 열림 상태 */
    open: boolean;
    /** 모달 닫힘 핸들러 */
    onOpenChange: (open: boolean) => void;
    /** 현재 내 별점 (1~10, 없으면 null) */
    currentRating: number | null;
    /** 평균 별점 */
    avgRating: number;
    /** 참여 인원 */
    ratingCount: number;
    /** 별점 제출 핸들러 */
    onSubmit: (score: number) => void;
    /** 제출 중 상태 */
    isSubmitting?: boolean;
}

/**
 * 별점 입력 모달
 *
 * @example
 * ```tsx
 * <RatingModal
 *   open={showRatingModal}
 *   onOpenChange={setShowRatingModal}
 *   currentRating={ratingData?.myRating}
 *   avgRating={ratingData?.avgRating || 0}
 *   ratingCount={ratingData?.ratingCount || 0}
 *   onSubmit={handleSubmitRating}
 * />
 * ```
 */
export const RatingModal = ({
    open,
    onOpenChange,
    currentRating,
    avgRating,
    ratingCount,
    onSubmit,
    isSubmitting = false,
}: RatingModalProps) => {
    // 내부 점수 상태 (모달 열릴 때 초기화)
    const [score, setScore] = useState<number>(currentRating || 0);
    const [submitted, setSubmitted] = useState(false);

    // 모달 열릴 때 점수 초기화
    useEffect(() => {
        if (open) {
            setScore(currentRating || 0);
            setSubmitted(false);
        }
    }, [open, currentRating]);

    // 제출 핸들러
    const handleSubmit = () => {
        if (score > 0) {
            onSubmit(score);
            setSubmitted(true);
            // 잠시 후 모달 닫기
            setTimeout(() => {
                onOpenChange(false);
            }, 800);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] p-6">
                <DialogHeader className="text-center">
                    <DialogTitle className="text-xl font-semibold">
                        이 회차는 어떠셨나요?
                    </DialogTitle>
                    <DialogDescription className="text-sm text-zinc-500">
                        별점을 선택해주세요 (1~10점)
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 flex flex-col items-center gap-4">
                    {/* 별점 입력 */}
                    <StarRating
                        value={score}
                        onChange={setScore}
                        size="lg"
                        showScore
                    />

                    {/* 현재 평균 점수 */}
                    {ratingCount > 0 && (
                        <p className="text-sm text-zinc-400">
                            현재 평균: ⭐ {(avgRating / 2).toFixed(1)} ({ratingCount.toLocaleString()}명 참여)
                        </p>
                    )}

                    {/* 제출 완료 메시지 */}
                    {submitted && (
                        <p className="text-sm text-purple-600 font-medium animate-pulse">
                            ✨ 평가 감사합니다!
                        </p>
                    )}
                </div>

                {/* 제출 버튼 */}
                <Button
                    onClick={handleSubmit}
                    disabled={score === 0 || isSubmitting || submitted}
                    className={cn(
                        "w-full py-3 rounded-xl font-medium transition-all",
                        "bg-purple-600 hover:bg-purple-700 text-white",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    {isSubmitting ? "제출 중..." : submitted ? "완료!" : "평가 완료"}
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default RatingModal;
