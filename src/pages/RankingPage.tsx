/**
 * 랭킹 페이지
 * /ranking
 *
 * 기능:
 * - 기간별 랭킹 탭 (실시간, 일간, 주간, 월간)
 * - 장르별 필터
 * - 순위 표시 리스트 (1-3위 강조, 4위~ 리스트)
 * - 한국어 로컬라이제이션 적용 완료
 */
import { useState } from "react";
import { useRankings } from "@/hooks/useDiscovery";
import {
  Loader2,
  BarChart3,
  Crown,
  Star,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Work } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const PERIOD_TABS = [
  { label: "실시간", value: "REALTIME" },
  { label: "일간", value: "DAILY" },
  { label: "주간", value: "WEEKLY" },
  { label: "월간", value: "MONTHLY" },
  { label: "역대", value: "ALL-TIME" },
];

const GENRE_TABS = [
  { label: "전체", value: "" },
  { label: "판타지", value: "FANTASY" },
  { label: "로맨스", value: "ROMANCE" },
  { label: "무협", value: "MARTIAL_ARTS" },
  { label: "현대판타지", value: "MODERN_FANTASY" },
];

export const RankingPage = () => {
  const [period, setPeriod] = useState<string>("REALTIME");
  const [genre, setGenre] = useState<string>("");
  const [accessType, setAccessType] = useState<string>("");
  const [showAll, setShowAll] = useState(false);

  const { data: worksData, isLoading } = useRankings(period, genre, accessType);
  const works = worksData?.data || [];

  // Top 3 separation
  const top3 = works.slice(0, 3);
  const rest = showAll ? works.slice(3) : works.slice(3, 10); // Show 4-10 initially

  return (
    <div className="w-full space-y-12 pb-20 font-sans text-ink dark:text-zinc-100">
      {/* Header Section - Espresso Theme (Warm Dark) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-espresso-900 shadow-2xl"
      >
        {/* Decorative Grid / Texture - Subtle mocha tint */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#A4776412_1px,transparent_1px),linear-gradient(to_bottom,#A4776412_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-mocha-400/20 to-transparent pointer-events-none" />

        <div className="relative z-10 px-10 py-16 md:py-20 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
          <div className="text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-heading font-black mb-4 tracking-tight text-white"
            >
              실시간 랭킹
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-mocha-100/80 font-medium text-xl max-w-xl"
            >
              지금, 독자들이 가장 열광하는 스토리를 만나보세요.
            </motion.p>
          </div>

          {/* Period Tabs embedded in Header - High contrast active state */}
          <div className="flex flex-col gap-4">
            <div className="bg-white/10 p-1.5 rounded-2xl border border-white/10 flex shadow-inner backdrop-blur-xl no-scrollbar overflow-x-auto max-w-full">
              {PERIOD_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setPeriod(tab.value)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    period === tab.value
                      ? "bg-white text-espresso-900 shadow-xl scale-105"
                      : "text-mocha-100/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 무료/유료 필터 추가 */}
            <div className="bg-black/10 p-1 rounded-xl flex self-center md:self-end">
              {[
                { label: "전체", value: "" },
                { label: "무료", value: "FREE" },
                { label: "유료", value: "PAID" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setAccessType(filter.value)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    accessType === filter.value
                      ? "bg-mocha-500 text-white shadow-md"
                      : "text-mocha-100/50 hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Genre Filters - Mocha Palette Alignment */}
      <div className="flex justify-center md:justify-start gap-3 overflow-x-auto scrollbar-hide py-2 px-1">
        {GENRE_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setGenre(tab.value)}
            className={`px-6 py-3 rounded-full text-xs font-black border-2 transition-all whitespace-nowrap uppercase tracking-widest shadow-sm ${
              genre === tab.value
                ? "bg-mocha-600 text-white border-mocha-600 shadow-lg scale-105"
                : "bg-white dark:bg-zinc-800 border-mocha-100 dark:border-zinc-700 text-mocha-500 hover:border-mocha-300 hover:text-mocha-700 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-40">
          <Loader2 className="w-12 h-12 animate-spin text-mocha-300" />
        </div>
      ) : (
        <div className="space-y-16">
          {/* Top 3 Hero Section */}
          <AnimatePresence mode="wait">
            {top3.length > 0 && (
              <motion.div
                key={period + genre}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className={`grid gap-10 items-end px-2 ${
                  top3.length === 1
                    ? "grid-cols-1 max-w-md mx-auto"
                    : top3.length === 2
                      ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto"
                      : "grid-cols-1 md:grid-cols-3"
                }`}
              >
                {top3[1] && <TopRankCard work={top3[1]} rank={2} delay={0.2} />}
                {top3[0] && (
                  <TopRankCard
                    work={top3[0]}
                    rank={1}
                    isMain={top3.length >= 3}
                    delay={0}
                  />
                )}
                {top3[2] && <TopRankCard work={top3[2]} rank={3} delay={0.3} />}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ranking List (4-100) - Sharper Borders with Mocha tint */}
          <div className="bg-white dark:bg-zinc-900/40 rounded-[2rem] shadow-xl border border-mocha-100 dark:border-zinc-800 overflow-hidden">
            {rest.map((work, idx) => (
              <RankingListItem
                key={work.id}
                work={work}
                rank={showAll ? 4 + idx : 4 + idx}
                index={idx}
              />
            ))}

            {!showAll && works.length > 10 && (
              <div className="p-8 border-t border-mocha-50 dark:border-zinc-800 text-center bg-mocha-50/20 dark:bg-white/5">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full max-w-md mx-auto h-14 text-mocha-700 dark:text-white border-2 border-mocha-100 dark:border-zinc-700 hover:border-mocha-600 hover:bg-white dark:hover:border-zinc-400 font-black tracking-tight rounded-2xl"
                  onClick={() => setShowAll(true)}
                >
                  8위 ~ 100위 전체 보기
                </Button>
              </div>
            )}

            {rest.length === 0 && top3.length === 0 && (
              <div className="py-40 text-center flex flex-col items-center justify-center gap-6">
                <div className="p-6 rounded-full bg-mocha-50 dark:bg-zinc-800 text-mocha-300 dark:text-zinc-600">
                  <BarChart3 className="w-16 h-16 stroke-[1.5]" />
                </div>
                <p className="font-heading text-2xl text-mocha-300 dark:text-zinc-600">
                  집계된 랭킹 데이터가 없습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components

function TopRankCard({
  work,
  rank,
  isMain = false,
  delay = 0,
}: {
  work: Work;
  rank: number;
  isMain?: boolean;
  delay?: number;
}) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      onClick={() => navigate(`/works/${work.id}`)}
      className={`relative group cursor-pointer flex flex-col items-center ${isMain ? "-mt-0 md:-mt-12 z-10 scale-105" : "scale-95 translate-y-4"}`}
    >
      {/* Rank Badge - Mocha / Espresso Tones */}
      <div
        className={`absolute -top-6 z-20 flex items-center justify-center font-black font-heading text-white shadow-2xl transition-transform duration-300 group-hover:scale-110 ${
          rank === 1
            ? "w-24 h-24 text-4xl bg-espresso-900 dark:bg-zinc-100 text-white dark:text-espresso-900 rounded-3xl"
            : rank === 2
              ? "w-16 h-16 text-2xl bg-mocha-600 rounded-2xl"
              : "w-16 h-16 text-2xl bg-mocha-400 rounded-2xl"
        }`}
      >
        <span className="relative z-10">{rank}</span>
        {rank === 1 && (
          <div className="absolute -top-8 animate-bounce">
            <Crown className="w-10 h-10 fill-amber-400 text-amber-500 drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div
        className={`w-full bg-white dark:bg-zinc-800 rounded-[2.5rem] overflow-hidden transition-all duration-500 transform group-hover:-translate-y-4 shadow-2xl border-2 ${
          isMain
            ? "border-mocha-200 dark:border-zinc-100"
            : "border-mocha-50 dark:border-zinc-700"
        }`}
      >
        <div className="relative bg-mocha-50 dark:bg-zinc-900 overflow-hidden aspect-[3/4]">
          {work.coverImageUrl ? (
            <motion.img
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.8 }}
              src={work.coverImageUrl}
              alt={work.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BarChart3 className="w-12 h-12 text-mocha-100" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-espresso-900 via-espresso-900/40 to-transparent opacity-90" />

          <div className="absolute bottom-0 left-0 right-0 p-8 text-white text-center">
            <h3
              className={`font-black font-heading leading-none mb-3 line-clamp-2 ${isMain ? "text-3xl" : "text-xl"}`}
            >
              {work.title}
            </h3>
            <p className="text-mocha-100 font-bold text-sm tracking-wide">
              {work.author?.nickname || work.authorNickname}
              {work.status === "COMPLETED" && (
                <span className="ml-2 text-mocha-300 text-xs">| 완결</span>
              )}
            </p>
            {isMain && (
              <div className="mt-5 flex gap-4 justify-center text-xs font-black text-white/90">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {(work.ratingSum / (work.ratingCount || 1)).toFixed(1)}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                  {(work.likeCount ?? 0).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RankingListItem({
  work,
  rank,
  index,
}: {
  work: Work;
  rank: number;
  index: number;
}) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/works/${work.id}`)}
      className="group flex items-center gap-6 p-6 md:p-8 hover:bg-mocha-50/30 dark:hover:bg-white/5 transition-all cursor-pointer border-b border-mocha-50 dark:border-zinc-800 last:border-0 relative overflow-hidden"
    >
      <div
        className={`
        w-12 text-center font-heading font-black text-3xl md:text-4xl transition-colors
        ${rank <= 3 ? "text-mocha-600 dark:text-white" : "text-mocha-100 dark:text-zinc-700 group-hover:text-mocha-300"}
      `}
      >
        {rank}
      </div>

      <div className="w-20 md:w-24 aspect-[3/4] bg-mocha-50 dark:bg-zinc-900 rounded-2xl overflow-hidden shrink-0 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-2 border border-mocha-100 dark:border-zinc-800">
        {work.coverImageUrl && (
          <img
            src={work.coverImageUrl}
            alt={work.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <h4 className="font-black text-xl md:text-2xl text-ink dark:text-zinc-100 truncate mb-2 group-hover:translate-x-1 transition-transform">
          {work.title}
        </h4>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-black text-mocha-500 dark:text-zinc-300">
            {work.author?.nickname || work.authorNickname}
          </span>
          <span className="px-3 py-1 rounded-full bg-mocha-50 dark:bg-zinc-800 text-[10px] font-black text-mocha-400 dark:text-zinc-400 border border-mocha-100 dark:border-zinc-700 uppercase tracking-tighter">
            {work.genre || "NONE"}
          </span>
          {work.status === "COMPLETED" && (
            <span className="px-2 py-1 rounded text-[10px] font-black bg-mocha-600 text-white uppercase tracking-tighter shadow-sm">
              완결
            </span>
          )}
          {work.status === "HIATUS" && (
            <span className="px-2 py-1 rounded text-[10px] font-black bg-zinc-500 text-white uppercase tracking-tighter shadow-sm">
              휴재
            </span>
          )}
        </div>
      </div>

      <div className="hidden md:flex flex-col items-end gap-2 min-w-[140px]">
        {(work.likeCount ?? 0) < 50 ? (
          <div className="bg-mocha-100/50 dark:bg-mocha-900/20 px-3 py-1.5 rounded-lg border border-mocha-200/50">
            <span className="text-[10px] font-black text-mocha-600 uppercase tracking-widest">
              Rising ✨
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-ink dark:text-white font-black text-base bg-mocha-50/50 dark:bg-white/5 px-4 py-2 rounded-xl border border-mocha-100 dark:border-zinc-800">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{(work.ratingSum / (work.ratingCount || 1)).toFixed(1)}</span>
          </div>
        )}
        <div className="text-xs text-mocha-300 dark:text-zinc-600 font-bold flex items-center gap-2 px-1">
          <Heart className="w-3.5 h-3.5 stroke-[2.5]" />
          {(work.likeCount ?? 0).toLocaleString()}
        </div>
      </div>

      {/* Mobile only stats */}
      <div className="md:hidden flex flex-col items-end gap-1 text-xs font-medium text-zinc-400">
        <span className="flex items-center gap-1">
          <span className="text-yellow-500">★</span> 4.8
        </span>
      </div>
    </motion.div>
  );
}

export default RankingPage;
