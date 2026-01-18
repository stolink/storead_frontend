/**
 * 실시간 순위 컴포넌트
 * 순위 변동 시 롤링 애니메이션 적용
 * 30초마다 자동 갱신
 */
import { useMemo, useLayoutEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Work } from "@/types";
import { RankingItem } from "./RankingItem";
import { Skeleton } from "@/components/ui/skeleton";

interface RankingListProps {
  works: Work[];
  title?: string;
  moreLink?: string;
  limit?: number; // Added limit prop
}

/**
 * 실시간 인기 순위 컴포넌트
 * - likeCount 기준 정렬
 * - 순위 변동 시 하이라이트 애니메이션
 * - 상위 3위 골드 배경
 */
export const RankingList = ({
  works,
  title = "실시간 인기 순위",
  moreLink,
  limit = 10,
}: RankingListProps) => {
  const navigate = useNavigate();

  // 1. Memoize sorted works (works passed are assumed to be valid/filtered)
  // 데이터 변경 시에만 재정렬 수행
  const sortedWorks = useMemo(() => {
    return [...works]
      .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      .slice(0, limit);
  }, [works, limit]);

  const handleItemClick = useCallback(
    (id: string) => {
      navigate(`/works/${id}`);
    },
    [navigate],
  );

  const prevWorksRef = useRef<Work[]>([]);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevRectsRef = useRef<Map<string, DOMRect>>(new Map());
  const animationFrameIds = useRef<number[]>([]);
  const timerIds = useRef<number[]>([]);

  // 2. FLIP Animation using useLayoutEffect
  // DOM 업데이트 후 브라우저 페인팅 전에 실행되어 깜빡임 방지
  useLayoutEffect(() => {
    const currentRects = new Map<string, DOMRect>();

    // Measure new positions
    sortedWorks.forEach((work) => {
      const el = itemRefs.current.get(work.id);
      if (el) {
        currentRects.set(work.id, el.getBoundingClientRect());
      }
    });

    // Calculate and apply transforms
    sortedWorks.forEach((work) => {
      const el = itemRefs.current.get(work.id);
      const prevRect = prevRectsRef.current.get(work.id);

      if (el && prevRect) {
        const newRect = currentRects.get(work.id);
        if (newRect) {
          const dy = prevRect.top - newRect.top;

          // 위치가 변했다면 Invert (이전 위치로 강제 이동 및 트랜지션 제거)
          if (dy !== 0) {
            el.style.transform = `translateY(${dy}px)`;
            el.style.transition = "none";
            el.style.willChange = "transform"; // 최적화: 애니메이션 중에만 will-change 적용

            // Play (다음 프레임에 원래 위치로 이동 및 트랜지션 복구)
            const id1 = requestAnimationFrame(() => {
              const id2 = requestAnimationFrame(() => {
                el.style.transform = "";
                el.style.transition = ""; // CSS 클래스(duration-600 ease-organic) 적용
              });
              animationFrameIds.current.push(id2);
            });
            animationFrameIds.current.push(id1);

            // Cleanup will-change after animation
            // duration(600ms)보다 약간 여유있게 설정
            const timerId = window.setTimeout(() => {
              if (el) el.style.willChange = "auto";
            }, 700);
            timerIds.current.push(timerId);
          }
        }
      }
    });

    // Save current rects and works for next comparison
    prevRectsRef.current = currentRects;
    prevWorksRef.current = sortedWorks;

    return () => {
      animationFrameIds.current.forEach(cancelAnimationFrame);
      animationFrameIds.current = [];
      timerIds.current.forEach(clearTimeout);
      timerIds.current = [];
    };
  }, [sortedWorks]);

  // Rank change icon logic
  const getRankChangeIcon = (workId: string, currentIndex: number) => {
    if (prevWorksRef.current.length === 0)
      return <span className="text-mocha-300">-</span>;

    const prevIndex = prevWorksRef.current.findIndex((w) => w.id === workId);
    if (prevIndex === -1)
      return (
        <span className="text-emerald-500 text-xs font-bold animate-pulse">
          NEW
        </span>
      );

    if (prevIndex > currentIndex)
      return (
        <span className="text-red-500 font-bold">
          ▲ {prevIndex - currentIndex}
        </span>
      );
    if (prevIndex < currentIndex)
      return (
        <span className="text-blue-500 font-bold">
          ▼ {currentIndex - prevIndex}
        </span>
      );

    return <span className="text-mocha-300">-</span>;
  };

  if (sortedWorks.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden sticky top-24 transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div
          onClick={() => moreLink && navigate(moreLink)}
          className={
            moreLink ? "flex items-center gap-1 cursor-pointer group" : ""
          }
        >
          <h3 className="text-lg font-heading font-bold text-ink dark:text-white group-hover:text-mocha-600 transition-colors">
            {title}
          </h3>
          {moreLink && (
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-mocha-600 transition-colors" />
          )}
        </div>
        <span className="text-xs text-mocha-400 dark:text-zinc-500 flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          실시간
        </span>
      </div>

      {/* Ranking Items */}
      <div className="space-y-2 relative px-6">
        {sortedWorks.map((work, index) => (
          <RankingItem
            key={work.id}
            ref={(el) => {
              if (el) itemRefs.current.set(work.id, el);
              else itemRefs.current.delete(work.id);
            }}
            work={work}
            index={index}
            rankChange={getRankChangeIcon(work.id, index)}
            onClick={handleItemClick}
          />
        ))}
      </div>

      {/* View Full Ranking Button */}
      {moreLink && (
        <div
          onClick={() => navigate(moreLink)}
          className="mt-4 mx-4 mb-4 py-3 px-4 glass rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-mocha-50/50 transition-all group"
        >
          <span className="text-sm font-medium text-mocha-600 group-hover:text-mocha-700 transition-colors">
            전체 순위 보기
          </span>
          <ChevronRight className="w-4 h-4 text-mocha-400 group-hover:text-mocha-600 transition-colors" />
        </div>
      )}
    </div>
  );
};

export const RankingListSkeleton = () => (
  <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
    <div className="p-6 pb-4 flex justify-between items-center">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-12" />
    </div>
    <div className="space-y-4 px-6 mt-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-7 h-7 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RankingList;
