import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, TrendingUp, Sparkles, Plus } from "lucide-react";
import { useRankings } from "@/hooks/useDiscovery";
import { Skeleton } from "@/components/ui/skeleton";

type RankingType = "REALTIME" | "DAILY" | "NEW";

export const MiniRankingTab = () => {
  const [activeTab, setActiveTab] = useState<RankingType>("REALTIME");

  // Note: Backend might need specific mapping for "DAILY" and "NEW" if not exactly these keys
  const { data, isLoading } = useRankings(activeTab);
  const items = data?.data?.slice(0, 5) || [];

  const tabs = [
    {
      id: "REALTIME",
      label: "실시간",
      icon: <TrendingUp className="w-3 h-3" />,
    },
    { id: "DAILY", label: "일간", icon: <Trophy className="w-3 h-3" /> },
    { id: "NEW", label: "신작", icon: <Sparkles className="w-3 h-3" /> },
  ];

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl p-3.5 shadow-sm border border-zinc-100 dark:border-zinc-800">
      <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as RankingType)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
              activeTab === tab.id
                ? "bg-white dark:bg-zinc-700 text-mocha-600 dark:text-mocha-400 shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading
          ? [...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <Skeleton className="w-4 h-4 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full rounded" />
                </div>
              </div>
            ))
          : items.map((work, index) => (
              <Link
                key={work.id}
                to={`/works/${work.id}`}
                className="flex gap-3 items-center group"
              >
                <span
                  className={`text-xs font-black w-4 text-center ${
                    index < 3 ? "text-mocha-500" : "text-zinc-400"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate group-hover:text-mocha-500 transition-colors">
                  {work.title}
                </span>
              </Link>
            ))}
      </div>

      <Link
        to="/ranking"
        className="mt-4 flex items-center justify-center gap-1 w-full py-2 text-[10px] font-bold text-zinc-400 hover:text-mocha-500 transition-colors border-t border-zinc-50 dark:border-zinc-800"
      >
        <Plus className="w-3 h-3" />
        더보기
      </Link>
    </div>
  );
};
