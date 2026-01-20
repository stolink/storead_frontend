import { memo, forwardRef } from "react";
import type { Work } from "@/types";

interface RankingItemProps {
  work: Work;
  index: number;
  rankChange: React.ReactNode;
  onClick: (id: string) => void;
}

export const RankingItem = memo(
  forwardRef<HTMLDivElement, RankingItemProps>(
    ({ work, index, rankChange, onClick }, ref) => {
      return (
        <div
          ref={ref}
          onClick={() => onClick(work.id)}
          className={`
                flex items-center gap-3 p-3 rounded-lg cursor-pointer
                hover:bg-mocha-50 dark:hover:bg-zinc-700
                transition-all duration-600 ease-organic
            `}
        >
          <span
            className={`
                w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm flex-shrink-0
                font-heading transition-colors duration-300 shadow-sm
                ${
                  index === 0
                    ? "bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 text-white shadow-amber-500/30"
                    : index === 1
                      ? "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 text-white shadow-slate-500/30"
                      : index === 2
                        ? "bg-gradient-to-br from-orange-300 via-orange-400 to-orange-600 text-white shadow-orange-500/30"
                        : "bg-mocha-100 dark:bg-zinc-800 text-mocha-600 dark:text-zinc-400"
                }
            `}
          >
            {index + 1}
          </span>

          <span className="w-8 text-center text-xs flex-shrink-0 font-medium h-5 flex items-center justify-center">
            {rankChange}
          </span>

          <div className="flex-1 min-w-0">
            <p
              className="font-medium text-ink dark:text-white line-clamp-2 text-sm font-body leading-tight mb-0.5"
              title={work.title}
            >
              {work.title}
            </p>
            <p className="text-xs text-mocha-500 dark:text-zinc-400 truncate">
              {work.authorNickname || work.author?.nickname || "작가"}
            </p>
          </div>

          <div className="text-right text-xs text-mocha-500 dark:text-zinc-400 flex-shrink-0 flex flex-col items-end">
            <span className="flex items-center gap-1 font-medium">
              ❤️ {work.likeCount || 0}
            </span>
          </div>
        </div>
      );
    },
  ),
);

RankingItem.displayName = "RankingItem";
