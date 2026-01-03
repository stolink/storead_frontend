/**
 * 챕터 별점 카드 컴포넌트
 * 스크롤 모드 본문 하단에 표시
 */
import { useState, useEffect } from "react";
import { StarRating } from "./StarRating";
import { cn } from "@/lib/utils";
import type { Theme } from "@/stores/useTheme";

interface ChapterRatingCardProps {
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
    /** 현재 테마 */
    theme?: Theme;
}

/**
 * 테마별 카드 배경색
 */
const getCardStyle = (theme: Theme = "light") => {
    const styles = {
        light: {
            bg: "bg-zinc-50",
            border: "border-zinc-200",
            text: "text-zinc-900",
            subText: "text-zinc-500",
        },
        dark: {
            bg: "bg-zinc-800/50",
            border: "border-zinc-700",
            text: "text-zinc-100",
            subText: "text-zinc-400",
        },
        sepia: {
            bg: "bg-amber-100/50",
            border: "border-amber-200",
            text: "text-amber-900",
            subText: "text-amber-700",
        },
        ivory: {
            bg: "bg-[#F5F5DC]/50",
            border: "border-[#D4D4AA]",
            text: "text-[#5D4E37]",
            subText: "text-[#8B7355]",
        },
    };
    return styles[theme];
};

/**
 * 스크롤 모드 하단 별점 카드
 *
 * @example
 * ```tsx
 * <ChapterRatingCard
 *   currentRating={ratingData?.myRating}
 *   avgRating={ratingData?.avgRating || 0}
 *   ratingCount={ratingData?.ratingCount || 0}
 *   onSubmit={handleSubmitRating}
 *   theme={theme}
 * />
 * ```
 */
export const ChapterRatingCard = ({
    currentRating,
    avgRating,
    ratingCount,
    onSubmit,
    isSubmitting = false,
    theme = "light",
}: ChapterRatingCardProps) => {
    // 내부 점수 상태
    const [score, setScore] = useState<number>(currentRating || 0);
    const [submitted, setSubmitted] = useState(false);
    const [showThankYou, setShowThankYou] = useState(!!currentRating);

    // 기존 별점이 있으면 감사 메시지 표시
    useEffect(() => {
        if (currentRating) {
            setScore(currentRating);
            setShowThankYou(true);
        }
    }, [currentRating]);

    // 별점 변경 핸들러
    const handleScoreChange = (newScore: number) => {
        setScore(newScore);
        // 자동 제출
        onSubmit(newScore);
        setSubmitted(true);
        setShowThankYou(true);
    };

    const cardStyle = getCardStyle(theme);

    return (
        <div
            className={cn(
                "w-full rounded-2xl border p-6 transition-all",
                cardStyle.bg,
                cardStyle.border
            )}
        >
            {/* 상단 구분선 (시각적 분리) */}
            <div className="w-12 h-1 bg-mocha-400/30 rounded-full mx-auto mb-4" />

            {/* 가이드 문구 */}
            <p
                className={cn(
                    "text-center text-base font-semibold mb-4",
                    cardStyle.text
                )}
            >
                {showThankYou
                    ? "참여해주셔서 감사합니다! ✨"
                    : "이 회차는 어떠셨나요?"}
            </p>

            {/* 서브 가이드 (별점 전) */}
            {!showThankYou && (
                <p className={cn("text-center text-sm mb-4", cardStyle.subText)}>
                    작품이 재미있으셨나요? 작가님에게 별점을 남겨주세요!
                </p>
            )}

            {/* 별점 영역 */}
            <div className="flex justify-center mb-4">
                <StarRating
                    value={score}
                    onChange={showThankYou && !submitted ? undefined : handleScoreChange}
                    size="lg"
                    readOnly={isSubmitting}
                    showScore
                />
            </div>

            {/* 평균 점수 및 참여 인원 */}
            {ratingCount > 0 && (
                <p className={cn("text-center text-xs", cardStyle.subText)}>
                    평균 {(avgRating / 2).toFixed(1)} ({ratingCount.toLocaleString()}명 참여)
                </p>
            )}
        </div>
    );
};

export default ChapterRatingCard;
