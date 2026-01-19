/**
 * 추천 캐러셀 컴포넌트
 * 메인 페이지 상단의 추천 작품 슬라이드
 */
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Work } from "@/types";

interface FeaturedCarouselProps {
  works: Work[];
}

export function FeaturedCarousel({ works }: FeaturedCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Genre & Status Translation Maps
  const GENRE_LABELS: Record<string, string> = {
    FANTASY: "판타지",
    ROMANCE: "로맨스",
    MARTIAL_ARTS: "무협",
    THRILLER: "스릴러",
    SF: "SF",
    DRAMA: "드라마",
    HEROIC_FANTASY: "영웅 판타지",
    DARK_FANTASY: "다크 판타지",
    URBAN_FANTASY: "어반 판타지",
    HIGH_FANTASY: "하이 판타지",
    ISEKAI: "이세계",
    MODERN_FANTASY: "현대 판타지",
    TRADITIONAL_FANTASY: "전통 판타지",
    ROMANCE_FANTASY: "로맨스 판타지",
    COMEDY: "코미디",
    HORROR: "호러",
    OTHER: "기타",
  };

  const STATUS_LABELS: Record<string, string> = {
    ONGOING: "연재중",
    HIATUS: "휴재",
    COMPLETED: "완결",
  };

  // 최대 5개만 표시
  const featuredWorks = works ? works.slice(0, 5) : [];

  // 자동 슬라이드 (5초마다)
  useEffect(() => {
    if (featuredWorks.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredWorks.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [featuredWorks.length]);

  const goToPrevious = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? featuredWorks.length - 1 : prev - 1,
    );
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredWorks.length);
  };

  if (featuredWorks.length === 0) {
    return null;
  }

  return (
    <div className="relative h-full w-full">
      {/* Main Carousel (Full width within container) */}
      <div className="relative h-full w-full overflow-hidden rounded-2xl glass-card-elevated grain-overlay bg-black">
        <div className="relative h-full w-full">
          {/* 캐러셀 슬라이드 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 w-full h-full"
            >
              {[featuredWorks[currentSlide]].map((work) => {
                const avgRating =
                  work.ratingCount > 0
                    ? work.ratingSum / work.ratingCount / 2
                    : 0;

                return (
                  <Link
                    key={work.id}
                    to={`/works/${work.id}`}
                    className="w-full h-full relative flex items-center group"
                  >
                    {/* Background Image with Ken Burns Effect */}
                    <div className="absolute inset-0 overflow-hidden">
                      {work.coverImageUrl ? (
                        <motion.img
                          src={work.coverImageUrl}
                          alt={work.title}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 6, ease: "easeOut" }}
                          className="w-full h-full object-cover opacity-80"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-mocha-400 to-mocha-700" />
                      )}
                    </div>

                    {/* Dark Gradient Overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0,0,0,0.2) 100%)",
                      }}
                    />

                    {/* Content Overlay with Staggered Animation */}
                    <div className="relative z-10 px-12 w-full max-w-4xl">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="flex items-center gap-2 mb-4"
                      >
                        <div className="flex bg-yellow-400/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-yellow-400/30">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1.5" />
                          <span className="text-lg font-bold text-yellow-400 leading-none">
                            {avgRating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-white/80 text-sm font-bold tracking-wide uppercase bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
                          {GENRE_LABELS[work.genre] || "장르 없음"}
                        </span>
                        <span className="text-white/80 text-sm font-bold tracking-wide uppercase bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
                          {STATUS_LABELS[work.status] || "상태 없음"}
                        </span>
                      </motion.div>

                      <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.4,
                          duration: 0.6,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="text-6xl font-black mb-6 text-white drop-shadow-2xl tracking-tight leading-tight"
                      >
                        {work.title}
                      </motion.h2>

                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-xl text-white/90 line-clamp-2 max-w-2xl drop-shadow-lg font-medium leading-relaxed mb-8"
                      >
                        {work.synopsis || work.author?.nickname}
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <button className="bg-white text-black hover:bg-mocha-100 px-8 py-3.5 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                          지금 읽기
                        </button>
                      </motion.div>
                    </div>
                  </Link>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* 네비게이션 버튼 - Glass 스타일 */}
          <button
            onClick={(e) => {
              e.preventDefault();
              goToPrevious();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/20 hover:scale-110 z-20 text-white/50 hover:text-white"
            aria-label="이전 슬라이드"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              goToNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/20 hover:scale-110 z-20 text-white/50 hover:text-white"
            aria-label="다음 슬라이드"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* 인디케이터 - Mocha 색상 */}
          <div className="absolute bottom-8 left-12 flex gap-3 z-20">
            {featuredWorks.map((_, index) => (
              <div key={index} className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide(index);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 overflow-hidden relative ${
                    index === currentSlide
                      ? "bg-white/20 w-16"
                      : "bg-white/30 w-3 hover:bg-white/60"
                  }`}
                  aria-label={`슬라이드 ${index + 1}로 이동`}
                >
                  {index === currentSlide && (
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "linear" }}
                      className="absolute inset-0 bg-mocha-400 h-full"
                    />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeaturedCarousel;
