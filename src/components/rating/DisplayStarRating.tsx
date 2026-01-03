import { Star } from "lucide-react";

interface DisplayStarRatingProps {
    score: number; // 0 ~ 5.0 base score
    size?: number; // icon size (default: 20 -> w-5 h-5)
    className?: string;
}

export function DisplayStarRating({
    score,
    size = 5,
    className = "",
}: DisplayStarRatingProps) {
    // 아이콘 크기 클래스 매핑 (w-4, w-5 등)
    const sizeClass = size === 4 ? "w-4 h-4" : "w-5 h-5";

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {[1, 2, 3, 4, 5].map((index) => {
                const diff = score - (index - 1);
                let starContent;

                // 0.8 이상: 꽉 찬 별
                if (diff >= 0.8) {
                    starContent = (
                        <Star
                            className={`${sizeClass} fill-yellow-400 text-yellow-400`}
                        />
                    );
                }
                // 0.4 이상 0.8 미만: 반 별
                else if (diff >= 0.4) {
                    starContent = (
                        <div className={`relative ${sizeClass}`}>
                            {/* 배경: 빈 별 */}
                            <Star
                                className={`absolute top-0 left-0 ${sizeClass} text-zinc-300`}
                            />
                            {/* 전경: 반 채워진 별 */}
                            <div
                                className={`absolute top-0 left-0 w-[50%] overflow-hidden h-full`}
                            >
                                <Star
                                    className={`${sizeClass} fill-yellow-400 text-yellow-400`}
                                />
                            </div>
                        </div>
                    );
                }
                // 0.4 미만: 빈 별
                else {
                    starContent = (
                        <Star className={`${sizeClass} text-zinc-300`} />
                    );
                }

                return <div key={index}>{starContent}</div>;
            })}
        </div>
    );
}
