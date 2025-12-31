/**
 * 별점 입력 컴포넌트
 * 1~10점 선택 가능, 호버 프리뷰, 읽기 전용 모드 지원
 */
import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    /** 현재 점수 (1~10) */
    value: number;
    /** 점수 변경 핸들러 (없으면 읽기 전용) */
    onChange?: (value: number) => void;
    /** 읽기 전용 모드 */
    readOnly?: boolean;
    /** 크기 */
    size?: 'sm' | 'md' | 'lg';
    /** 점수 텍스트 표시 여부 */
    showScore?: boolean;
    /** 평가 인원 표시 */
    ratingCount?: number;
    /** 추가 클래스 */
    className?: string;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
};

/**
 * 별점 컴포넌트
 * 별 5개로 1~10점을 표현 (반별 지원)
 *
 * @example
 * ```tsx
 * // 입력 모드
 * <StarRating value={rating} onChange={setRating} />
 *
 * // 읽기 전용 (평균 점수 표시)
 * <StarRating value={avgRating} readOnly showScore ratingCount={100} />
 * ```
 */
export const StarRating = ({
    value,
    onChange,
    readOnly = false,
    size = 'md',
    showScore = false,
    ratingCount,
    className,
}: StarRatingProps) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    // 표시할 점수 (호버 중이면 호버값, 아니면 실제값)
    const displayValue = hoverValue ?? value;

    // 별 클릭 핸들러 (각 별당 2점씩)
    const handleClick = (starIndex: number, isHalf: boolean) => {
        if (readOnly || !onChange) return;
        const newValue = starIndex * 2 + (isHalf ? 1 : 2);
        onChange(Math.min(10, Math.max(1, newValue)));
    };

    // 마우스 호버 핸들러
    const handleMouseMove = (
        e: React.MouseEvent<HTMLDivElement>,
        starIndex: number
    ) => {
        if (readOnly) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const isHalf = e.clientX - rect.left < rect.width / 2;
        setHoverValue(starIndex * 2 + (isHalf ? 1 : 2));
    };

    const handleMouseLeave = () => {
        setHoverValue(null);
    };

    // 별 렌더링
    const renderStar = (index: number) => {
        const fillPercentage = Math.min(
            100,
            Math.max(0, ((displayValue - index * 2) / 2) * 100)
        );

        return (
            <div
                key={index}
                className={cn(
                    'relative cursor-pointer',
                    readOnly && 'cursor-default',
                    sizeClasses[size]
                )}
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const isHalf = e.clientX - rect.left < rect.width / 2;
                    handleClick(index, isHalf);
                }}
                onMouseMove={(e) => handleMouseMove(e, index)}
            >
                {/* 빈 별 (배경) */}
                <Star
                    className={cn(
                        'absolute inset-0',
                        sizeClasses[size],
                        'text-zinc-300 dark:text-zinc-600'
                    )}
                />
                {/* 채워진 별 (클리핑) */}
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${fillPercentage}%` }}
                >
                    <Star
                        className={cn(
                            sizeClasses[size],
                            'text-yellow-400 fill-yellow-400'
                        )}
                    />
                </div>
            </div>
        );
    };

    return (
        <div
            className={cn('flex items-center gap-1', className)}
            onMouseLeave={handleMouseLeave}
        >
            {/* 5개의 별 */}
            <div className="flex">
                {[0, 1, 2, 3, 4].map(renderStar)}
            </div>

            {/* 점수 텍스트 */}
            {showScore && (
                <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-semibold">{(displayValue / 2).toFixed(1)}</span>
                    <span className="text-zinc-400">/5</span>
                    {ratingCount !== undefined && (
                        <span className="ml-1 text-xs text-zinc-400">
                            ({ratingCount.toLocaleString()}명)
                        </span>
                    )}
                </span>
            )}

            {/* 호버 시 점수 미리보기 (입력 모드) */}
            {!readOnly && hoverValue !== null && (
                <span className="ml-2 text-sm font-medium text-yellow-500">
                    {hoverValue}점
                </span>
            )}
        </div>
    );
};

export default StarRating;
