import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, Book, Sparkles } from "lucide-react";
import type { Work, Chapter } from "@/types";
import { BookCard } from "@/components/home/BookCard";
import { MiniBookCard } from "@/components/home/MiniBookCard";
import { ChapterAccessBadge } from "@/components/common/ChapterAccessBadge";
import { DisplayStarRating } from "@/components/rating/DisplayStarRating";
import {
  usePublicAuthorWorks,
  useTagBasedRecommendations,
} from "@/hooks/useDiscovery";
import { cn } from "@/lib/utils";

interface WorkDetailTabsProps {
  work: Work;
  chapters: Chapter[];
  onChapterClick: (chapter: Chapter) => void;
  sortOrder: "asc" | "desc";
  onSortToggle: (order: "asc" | "desc") => void;
}

type TabType = "chapters" | "author" | "recommend";

export function WorkDetailTabs({
  work,
  chapters,
  onChapterClick,
  sortOrder,
  onSortToggle,
}: WorkDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("chapters");

  const { data: authorWorks, isLoading: authorLoading } = usePublicAuthorWorks(
    work.authorId,
  );
  const { data: recommendations, isLoading: recommendLoading } =
    useTagBasedRecommendations();

  // 현재 작품을 작가의 다른 작품 목록에서 제외
  const filteredAuthorWorks =
    authorWorks?.filter((w) => w.id !== work.id) || [];

  const tabs = [
    { id: "chapters", label: "연재 목록", icon: List },
    { id: "author", label: "작가의 다른 작품", icon: Book },
    { id: "recommend", label: "맞춤 추천", icon: Sparkles },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Unique Floating Glass Tab Bar */}
      <div className="flex justify-center">
        <div className="glass-card p-1.5 rounded-2xl flex gap-1 shadow-inner-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                activeTab === tab.id
                  ? "text-white"
                  : "text-mocha-400 hover:text-mocha-600 hover:bg-mocha-50/50",
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-mocha-500 rounded-xl shadow-lg shadow-mocha-500/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <tab.icon
                className={cn(
                  "w-4 h-4 relative z-10",
                  activeTab === tab.id ? "animate-pulse" : "",
                )}
              />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content with Animation */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "chapters" && (
              <div className="space-y-6">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onSortToggle("asc")}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      sortOrder === "asc"
                        ? "bg-mocha-500 text-white shadow-md"
                        : "glass hover:bg-mocha-50 text-mocha-400",
                    )}
                  >
                    1화부터
                  </button>
                  <button
                    onClick={() => onSortToggle("desc")}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      sortOrder === "desc"
                        ? "bg-mocha-500 text-white shadow-md"
                        : "glass hover:bg-mocha-50 text-mocha-400",
                    )}
                  >
                    최신화부터
                  </button>
                </div>

                <div className="grid gap-3">
                  {chapters.map((chapter) => {
                    const chapterRating =
                      chapter.ratingCount > 0
                        ? chapter.ratingSum / chapter.ratingCount / 2
                        : 0;
                    const accessType =
                      chapter.accessType ||
                      (chapter.isFree === false ? "PAID" : "FREE");

                    return (
                      <button
                        key={chapter.id}
                        onClick={() => onChapterClick(chapter)}
                        className="w-full text-left p-4 rounded-xl border border-mocha-100/30 glass hover:bg-white transition-all duration-300 group flex items-center justify-between shadow-sm hover:shadow-md hover:translate-x-1"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-mocha-600 w-12 shrink-0">
                            {chapter.chapterNumber}화
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-espresso-900 group-hover:text-mocha-600 transition-colors">
                              {chapter.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <ChapterAccessBadge
                                accessType={accessType}
                                price={chapter.price}
                                isPurchased={chapter.isPurchased}
                                size="sm"
                              />
                              <span className="text-[10px] text-zinc-400">
                                {new Date(chapter.createdAt).toLocaleDateString(
                                  "ko-KR",
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 bg-mocha-50 px-2 py-1 rounded-md">
                            <DisplayStarRating score={chapterRating} size={3} />
                            <span className="text-xs font-bold text-mocha-600">
                              {chapterRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "author" && (
              <div className="space-y-6">
                {authorLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin h-8 w-8 border-4 border-mocha-500 border-t-transparent rounded-full" />
                  </div>
                ) : filteredAuthorWorks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-mocha-300 italic">
                    <Book className="w-12 h-12 mb-3 opacity-30" />
                    <p>작가의 다른 등록된 작품이 없습니다.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filteredAuthorWorks.map((w) => (
                      <BookCard key={w.id} work={w} showQuickActions={false} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "recommend" && (
              <div className="space-y-6">
                {recommendLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin h-8 w-8 border-4 border-mocha-500 border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {recommendations?.map((w) => (
                      <MiniBookCard key={w.id} work={w} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
