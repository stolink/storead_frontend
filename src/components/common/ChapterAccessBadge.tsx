/**
 * 챕터 접근 유형 배지 컴포넌트
 * 
 * 무료/유료/독점 상태를 시각적으로 표시합니다.
 * - FREE: 녹색 배지 - 무료
 * - PAID: 황금색 배지 - 유료 (가격 표시)
 * - EXCLUSIVE: 보라색 배지 - 독점
 */
import { Coins, Crown, Gift } from 'lucide-react';

export type ChapterAccessType = 'FREE' | 'PAID' | 'EXCLUSIVE';

interface ChapterAccessBadgeProps {
    /** 접근 유형 */
    accessType: ChapterAccessType;
    /** 크레딧 가격 (유료인 경우) */
    price?: number;
    /** 구매 완료 여부 */
    isPurchased?: boolean;
    /** 배지 크기 */
    size?: 'sm' | 'md';
}

// 접근 유형별 스타일 설정
const accessTypeStyles: Record<ChapterAccessType, {
    bg: string;
    text: string;
    hoverBg: string;
    label: string;
    Icon: typeof Coins | typeof Crown | typeof Gift | null;
}> = {
    FREE: {
        bg: 'bg-sage-500',
        text: 'text-white',
        hoverBg: 'hover:bg-sage-600',
        label: '무료',
        Icon: Gift,
    },
    PAID: {
        bg: 'bg-amber-500',
        text: 'text-white',
        hoverBg: 'hover:bg-amber-600',
        label: '', // 가격이 레이블 역할
        Icon: Coins,
    },
    EXCLUSIVE: {
        bg: 'bg-purple-500',
        text: 'text-white',
        hoverBg: 'hover:bg-purple-600',
        label: '독점',
        Icon: Crown,
    },
};

export function ChapterAccessBadge({
    accessType,
    price,
    isPurchased = false,
    size = 'sm',
}: ChapterAccessBadgeProps) {
    const style = accessTypeStyles[accessType];
    const IconComponent = style.Icon;

    // 크기별 스타일
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs gap-1',
        md: 'px-3 py-1 text-sm gap-1.5',
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
    };

    // 구매 완료인 경우 다른 스타일 적용
    if (isPurchased) {
        return (
            <span
                className={`
                    inline-flex items-center rounded-full font-medium
                    bg-zinc-200 text-zinc-600
                    ${sizeClasses[size]}
                `}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-sage-500 mr-1" />
                구매완료
            </span>
        );
    }

    // 레이블 결정 (유료인 경우 가격 표시)
    const displayLabel = accessType === 'PAID' && price
        ? `${price}C`
        : style.label;

    return (
        <span
            className={`
                inline-flex items-center rounded-full font-medium
                ${style.bg} ${style.text}
                ${sizeClasses[size]}
            `}
        >
            {IconComponent && (
                <IconComponent className={iconSizes[size]} />
            )}
            {displayLabel}
        </span>
    );
}

export default ChapterAccessBadge;
