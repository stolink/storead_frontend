import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { type Work } from "@/types";
import { BentoCard } from "@/components/ui/bento-grid";
import { GENRE_LABELS } from "@/constants/genres";

interface ScrollableSectionProps {
  title: string;
  works: Work[];
  moreLink: string;
  className?: string;
  onEndReached?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

export function ScrollableSection({
  title,
  works,
  moreLink,
  className,
  onEndReached,
  hasNextPage,
  isFetchingNextPage,
}: ScrollableSectionProps) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth * 0.8;
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (
      scrollRef.current &&
      onEndReached &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // Check if scrolled near the end (horizontal)
      if (scrollLeft + clientWidth >= scrollWidth - 200) {
        onEndReached();
      }
    }
  };

  return (
    <section className={`py-8 ${className} group relative`}>
      {/* Header */}
      <div className="container mx-auto px-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl text-amber-600 dark:text-amber-400 shadow-inner">
            <Crown className="w-6 h-6" />
          </div>
          <Link
            to={moreLink}
            className="group flex items-center gap-1 cursor-pointer"
          >
            <h2 className="text-3xl font-black font-heading text-zinc-900 dark:text-zinc-100 group-hover:text-mocha-600 transition-colors tracking-tight">
              {title}
            </h2>
            <ChevronRight className="w-6 h-6 text-zinc-300 group-hover:text-mocha-600 transition-colors mt-1" />
          </Link>
        </div>

        {/* Navigation Arrows */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-6 pb-8 no-scrollbar scroll-smooth w-full"
        style={{ scrollPaddingLeft: "1.5rem", scrollPaddingRight: "1.5rem" }}
      >
        {works.map((work) => (
          <div
            key={work.id}
            className="snap-start shrink-0 w-[200px] md:w-[240px]"
          >
            {/* Reusing BentoCard but enabling standard layout always */}
            <div className="h-full">
              <BentoCard
                priority="standard"
                title={work.title}
                description={work.authorNickname}
                image={work.coverImageUrl}
                badge={
                  work.genre && GENRE_LABELS[work.genre] ? (
                    <span className="glass px-2 py-1 text-xs font-bold rounded-lg text-espresso-900 shadow-sm">
                      {GENRE_LABELS[work.genre]}
                    </span>
                  ) : null
                }
                layoutId={`work-scroll-${work.id}`}
                className="cursor-pointer h-full hover:-translate-y-1 transition-transform duration-300"
                onClick={() => navigate(`/works/${work.id}`)}
              />
            </div>
          </div>
        ))}

        {isFetchingNextPage && (
          <div className="snap-start shrink-0 w-[200px] flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-mocha-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* 'View All' Card or End Spacer */}
        {!hasNextPage && (
          <div className="snap-start shrink-0 w-[160px] flex items-center justify-center">
            <Link
              to={moreLink}
              className="group/link flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-mocha-300 dark:hover:border-mocha-700 hover:bg-mocha-50/50 dark:hover:bg-mocha-900/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover/link:scale-110 transition-transform">
                <ChevronRight className="w-6 h-6 text-zinc-400 group-hover/link:text-mocha-500" />
              </div>
              <span className="text-sm font-bold text-zinc-500 group-hover/link:text-mocha-600">
                전체 보기
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Absolute Arrows (Overlay Style - Optional Choice, sticking to Header arrows for cleaner look,
                but user asked for arrows "One line with arrows".
                Header arrows are cleaner for mobile/desktop hybrid.
                But let's add overlay arrows that appear on hover for Desktop) */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg opacity-0 md:group-hover:opacity-100 transition-opacity disabled:opacity-0"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6 text-zinc-800 dark:text-zinc-200" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg opacity-0 md:group-hover:opacity-100 transition-opacity disabled:opacity-0"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6 text-zinc-800 dark:text-zinc-200" />
      </button>
    </section>
  );
}
