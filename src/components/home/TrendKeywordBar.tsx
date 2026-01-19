
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export const TrendKeywordBar = () => {
  const keywords = [
    { id: "1", label: "아카데미", count: "HOT" },
    { id: "2", label: "복수", count: "UP" },
    { id: "3", label: "성좌", count: "NEW" },
    { id: "4", label: "집착", count: "" },
    { id: "5", label: "먼치킨", count: "" },
    { id: "6", label: "후회물", count: "" },
    { id: "7", label: "게임판타지", count: "" },
    { id: "8", label: "착각계", count: "" },
    { id: "10", label: "로맨스판타지", count: "" },
  ];

  // Duplicate list for seamless loop
  const marqueeKeywords = [...keywords, ...keywords, ...keywords];

  return (
    <div className="container mx-auto px-6 mb-8">
      <div className="flex items-center gap-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 pl-2 pr-4 border-r border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <TrendingUp className="w-4 h-4 text-mocha-500" />
          <span className="text-xs font-black text-espresso-900 dark:text-zinc-100 whitespace-nowrap">
            지금 뜨는 키워드
          </span>
        </div>

        <div className="flex-1 overflow-hidden relative mask-linear-fade">
          {/* Gradient Masks for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-white/50 to-transparent dark:from-zinc-900/50" />
          <div className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-white/50 to-transparent dark:from-zinc-900/50" />

          <motion.div
            className="flex gap-2 py-1 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              ease: "linear",
              duration: 30,
              repeat: Infinity,
            }}
          >
            {marqueeKeywords.map((kw, idx) => (
              <Link
                key={`${kw.id}-${idx}`}
                to={`/category/ALL?search=${encodeURIComponent(kw.label)}`}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-mocha-500 hover:text-white transition-all whitespace-nowrap"
              >
                <span className="text-[11px] font-bold text-zinc-600 group-hover:text-white">
                  #{kw.label}
                </span>
                {kw.count && (
                  <span
                    className={`text-[8px] font-black px-1 rounded-sm ${
                      kw.count === "HOT"
                        ? "bg-red-500 text-white"
                        : kw.count === "UP"
                          ? "bg-blue-500 text-white"
                          : "bg-emerald-500 text-white"
                    }`}
                  >
                    {kw.count}
                  </span>
                )}
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
