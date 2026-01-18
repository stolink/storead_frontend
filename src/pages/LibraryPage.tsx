/**
 * 내 서재 페이지 (Glassmorphism Redesign)
 * 프리미엄 디자인, 감성적인 상호작용, 압도적인 비주얼
 */
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Trash2,
  Sparkles,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  BookMarked,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { useLibrary, useRemoveFromLibrary } from "@/hooks/useLibrary";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { useThemeStore } from "@/stores/useTheme";
import { useDiscoveryWorks } from "@/hooks/useDiscovery";
import { MiniBookCard } from "@/components/home/MiniBookCard";
import { cn } from "@/lib/utils";
import { useState } from "react";

/**
 * 내 서재 페이지 컴포넌트
 */
export const LibraryPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { openAuthModal } = useAuthModalStore();
  const { data: library, isLoading } = useLibrary();
  const removeFromLibrary = useRemoveFromLibrary();
  const navigate = useNavigate();
  const { theme } = useThemeStore();

  // 추천 작품 (Empty State용)
  const { data: recommendations } = useDiscoveryWorks({
    sort: "popular",
    limit: 6,
  });

  const [filter, setFilter] = useState<"all" | "reading" | "completed">("all");

  // 배경 그라데이션 스타일 (테마별)
  const getAmbientBackground = () => {
    switch (theme) {
      case "dark":
        return "bg-[radial-gradient(circle_at_50%_10%,_rgba(60,40,30,0.4),_transparent_70%)]";
      case "sepia":
        return "bg-[radial-gradient(circle_at_50%_10%,_rgba(180,83,9,0.1),_transparent_70%)]";
      case "ivory":
        return "bg-[radial-gradient(circle_at_50%_10%,_rgba(210,180,140,0.2),_transparent_70%)]";
      default:
        return "bg-[radial-gradient(circle_at_50%_10%,_rgba(200,200,255,0.1),_transparent_70%)]";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Ambient Background */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            getAmbientBackground(),
          )}
        />

        <div className="relative z-10 text-center p-8 max-w-md w-full glass-card rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl">
          <div className="w-20 h-20 mx-auto bg-mocha-100/30 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/50">
            <BookOpen className="h-10 w-10 text-mocha-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3 font-serif">
            나만의 서재를 만들어보세요
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            감명 깊은 이야기를 수집하고,
            <br />
            당신의 독서 여정을 기록하세요.
          </p>
          <Button
            onClick={() => openAuthModal("/library")}
            className="w-full h-12 rounded-xl bg-mocha-600 hover:bg-mocha-700 text-white font-medium shadow-lg hover:shadow-mocha-600/30 transition-all hover:-translate-y-0.5"
          >
            로그인하고 시작하기
          </Button>
        </div>
      </div>
    );
  }

  // 필터링된 목록
  const filteredLibrary =
    library?.filter((item) => {
      if (!item.work) return false;
      if (filter === "all") return true;
      // 임시 로직: 실제 데이터에 독서 상태가 있다면 그것을 사용
      // 여기서는 랜덤하게 상태를 가정하지 않고 전체를 보여주되, 추후 필드 추가 시 연동
      return true;
    }) || [];

  return (
    <div
      className={cn(
        "min-h-screen relative transition-colors duration-700",
        theme === "dark" ? "bg-[#0F0F12]" : "bg-[#FDFBF7]",
      )}
    >
      {/* Ambient Backgrounds */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className={cn(
            "absolute top-[-10%] left-[20%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-40 mix-blend-soft-light animate-pulse-slow",
            theme === "dark" ? "bg-indigo-900/30" : "bg-blue-200/40",
          )}
        />
        <div
          className={cn(
            "absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-30 mix-blend-soft-light",
            theme === "dark" ? "bg-mocha-900/20" : "bg-amber-200/30",
          )}
        />
      </div>

      <main className="container mx-auto px-6 py-24 relative z-10">
        {/* Header Section */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 mb-2"
            >
              <span className="px-3 py-1 rounded-full bg-mocha-500/10 text-mocha-600 text-xs font-bold uppercase tracking-wider border border-mocha-500/10">
                My Collection
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-4xl md:text-5xl font-black font-serif text-espresso-900 dark:text-white tracking-tight"
            >
              {user?.nickname || "독자"}님의 서재
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-emerald-800/60 dark:text-zinc-400 max-w-lg leading-relaxed text-sm md:text-base font-medium"
            >
              총{" "}
              <span className="text-mocha-600 font-bold">
                {library?.length || 0}
              </span>
              개의 이야기가 당신을 기다리고 있습니다.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-3 p-1.5 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/40 dark:border-white/5 shadow-sm"
          >
            {(["all", "reading", "completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300",
                  filter === tab
                    ? "bg-white dark:bg-zinc-800 text-mocha-600 shadow-md transform scale-105"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-white/30",
                )}
              >
                {tab === "all"
                  ? "전체"
                  : tab === "reading"
                    ? "읽는 중"
                    : "완결"}
              </button>
            ))}
          </motion.div>
        </header>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex justify-center py-32">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-mocha-200 border-t-mocha-500 animate-spin" />
              <div className="absolute inset-0 rounded-full blur-md bg-mocha-500/20 animate-pulse" />
            </div>
          </div>
        ) : filteredLibrary.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-white/40 to-white/10 dark:from-zinc-900/40 dark:to-zinc-900/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-xl"
          >
            <div className="w-24 h-24 bg-gradient-to-tr from-mocha-100 to-amber-50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(200,150,100,0.2)] animate-float">
              <BookOpen className="h-10 w-10 text-mocha-600/80" />
            </div>
            <h2 className="text-2xl font-bold text-espresso-900 dark:text-white mb-2">
              아직 서재가 비어있네요
            </h2>
            <p className="text-zinc-500 mb-8 max-w-xs text-center leading-relaxed">
              취향에 맞는 작품을 찾아 서재를 채워보세요.
              <br />
              새로운 세계가 기다리고 있습니다.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-espresso-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white rounded-full px-8 h-12 text-base font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              작품 탐색하기
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-12">
            <BentoGrid columns={4} gap="lg">
              {filteredLibrary
                .filter((item) => !!item.work)
                .map((item, idx) => (
                  <BentoCard
                    key={item.id}
                    priority={idx === 0 ? "featured" : "standard"}
                    title={item.work!.title}
                    image={item.work!.coverImageUrl}
                    className="group"
                    badge={
                      <div className="flex flex-col items-start gap-2">
                        {item.work!.status === "COMPLETED" && (
                          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-yellow-400" />
                            완결작
                          </span>
                        )}
                        <span className="glass px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-tight text-espresso-900 bg-white/90 backdrop-blur-md shadow-sm">
                          {idx === 0 ? "Recently Read" : "Library"}
                        </span>
                      </div>
                    }
                    footer={
                      <div className="flex justify-between items-center w-full">
                        {/* Progress Bar (Visual Mockup) */}
                        <div className="flex-1 mr-4">
                          <div className="flex justify-between text-[10px] text-zinc-500 mb-1 font-medium">
                            <span>Progress</span>
                            <span>{Math.floor(Math.random() * 90) + 10}%</span>
                          </div>
                          <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.floor(Math.random() * 90) + 10}%`,
                              }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full bg-mocha-500"
                            />
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              confirm(
                                "정말 이 작품을 서재에서 삭제하시겠습니까?",
                              )
                            ) {
                              removeFromLibrary.mutate(item.workId);
                            }
                          }}
                          className="p-2 rounded-full hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    }
                    onClick={() => navigate(`/works/${item.work!.id}`)}
                  />
                ))}
            </BentoGrid>
          </div>
        )}

        {/* Recommendations Section (Bottom) */}
        {recommendations && recommendations.data.length > 0 && (
          <section className="mt-32">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-gradient-to-br from-mocha-500 to-amber-600 rounded-xl shadow-lg shadow-mocha-500/20 text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-espresso-900 dark:text-white">
                  새로운 발견
                </h3>
                <p className="text-sm text-zinc-500">
                  당신의 취향을 저격할 작품들
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {recommendations.data.map((work) => (
                <MiniBookCard
                  key={work.id}
                  work={work}
                  className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm p-3 rounded-2xl border border-white/20 hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-all"
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default LibraryPage;
