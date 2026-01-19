import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Work } from "@/types";
import { cn } from "@/lib/utils";

interface MiniBookCardProps {
  work: Work;
  badge?: string;
  badgeColor?: "blue" | "red" | "green" | "gold" | "mocha" | "espresso";
  ranking?: number;
  className?: string;
}

export function MiniBookCard({
  work,
  badge,
  badgeColor = "blue",
  ranking,
  className,
}: MiniBookCardProps) {
  const navigate = useNavigate();
  const [now] = useState(() => Date.now());

  const badgeStyles = {
    blue: "bg-blue-500/90 text-white",
    red: "bg-red-500/90 text-white",
    green: "bg-emerald-500/90 text-white",
    gold: "bg-amber-400/90 text-white",
    mocha: "bg-mocha-500/90 text-white",
    espresso: "bg-espresso-600/90 text-white",
  };

  // 3시간 이내 연재 여부 확인
  const isRecentlyUpdated = useMemo(() => {
    const updatedAtTime = new Date(work.updatedAt || work.createdAt).getTime();
    const threeHoursAgo = now - 3 * 60 * 60 * 1000;
    return updatedAtTime > threeHoursAgo;
  }, [work.updatedAt, work.createdAt, now]);

  const displayBadge = badge || (isRecentlyUpdated ? "3h ago" : undefined);
  const displayBadgeColor = badge
    ? badgeColor
    : isRecentlyUpdated
      ? "mocha"
      : badgeColor;

  return (
    <div
      onClick={() => navigate(`/works/${work.id}`)}
      className={cn(
        "group cursor-pointer flex flex-col gap-2 w-full",
        className,
      )}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1">
        {work.coverImageUrl ? (
          <img
            src={work.coverImageUrl}
            alt={work.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
            <span className="text-xs text-zinc-400 font-serif italic">
              No Cover
            </span>
          </div>
        )}

        {/* Gradient Overlay (Always visible but subtle) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Ranking Badge */}
        {ranking && (
          <div className="absolute top-0 left-0 w-8 h-8 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-br-lg">
            <span className="text-white font-bold font-heading italic text-sm">
              {ranking}
            </span>
          </div>
        )}

        {/* Event/Info Badge */}
        {displayBadge && (
          <div
            className={cn(
              "absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold rounded shadow-sm backdrop-blur-sm",
              badgeStyles[displayBadgeColor],
            )}
          >
            {displayBadge}
          </div>
        )}
      </div>

      {/* Text Info (Dense) */}
      <div className="flex flex-col gap-0.5 px-0.5">
        <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 leading-snug group-hover:text-mocha-600 transition-colors">
          {work.status === "COMPLETED" && (
            <span className="text-mocha-600 font-bold mr-1">[완결]</span>
          )}
          {work.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="truncate max-w-[70px]">
            {work.author?.nickname || work.authorNickname}
          </span>
          {work.genre && (
            <>
              <span className="w-0.5 h-0.5 bg-zinc-300 rounded-full" />
              <span className="opacity-80 truncate">{work.genre}</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          {(work.likeCount ?? 0) < 10 ? (
            <span className="text-[10px] font-bold text-mocha-500/80 uppercase tracking-tighter">
              Rising
            </span>
          ) : (
            <div className="text-[10px] text-zinc-400 font-medium">
              ❤️ {formatNumber(work.likeCount ?? 0)}
            </div>
          )}
          {(work.chapterCount ?? 0) > 0 && (
            <span className="text-[10px] text-zinc-400">
              {work.chapterCount}화
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1) + "만";
  if (num >= 1000) return (num / 1000).toFixed(1) + "천";
  return num.toString();
}
