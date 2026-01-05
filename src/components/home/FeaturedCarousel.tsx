/**
 * 추천 캐러셀 컴포넌트
 * 메인 페이지 상단의 추천 작품 슬라이드
 */
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Work } from "@/types";

interface FeaturedCarouselProps {
  works: Work[];
}

export function FeaturedCarousel({ works }: FeaturedCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

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
      prev === 0 ? featuredWorks.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredWorks.length);
  };

  if (featuredWorks.length === 0) {
    return null;
  }

  return (
    <div className="relative h-full w-full bg-zinc-100 overflow-hidden rounded-lg shadow-lg">
      <div className="relative h-full w-full bg-white">
        {/* 캐러셀 슬라이드 */}
        <div
          className="flex transition-transform duration-500 ease-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {featuredWorks.map((work) => {
            const avgRating =
              work.ratingCount > 0
                ? work.ratingSum / work.ratingCount / 2
                : 0;

            return (
              <Link
                key={work.id}
                to={`/works/${work.id}`}
                className="min-w-full h-full relative flex items-center"
              >
                {/* 배경 이미지 */}
                {work.coverImageUrl ? (
                  <img
                    src={work.coverImageUrl}
                    alt={work.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-mocha-400 to-mocha-700" />
                )}

                {/* 다크 그라데이션 오버레이 - 텍스트 가독성 확보 */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.45) 35%, rgba(0, 0, 0, 0.15) 65%, transparent 100%)'
                  }}
                />

                {/* 콘텐츠 오버레이 */}
                <div className="relative z-10 px-12 w-full max-w-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl text-white drop-shadow-md">
                      {avgRating.toFixed(1)}
                    </span>
                  </div>
                  <h2 className="text-4xl font-bold mb-3 text-white drop-shadow-lg">
                    {work.title}
                  </h2>
                  <p className="text-xl text-white/90 line-clamp-2 drop-shadow-md">
                    {work.synopsis || work.author?.nickname}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 네비게이션 버튼 */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg z-20"
          aria-label="이전 슬라이드"
        >
          <ChevronLeft className="w-6 h-6 text-zinc-700" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg z-20"
          aria-label="다음 슬라이드"
        >
          <ChevronRight className="w-6 h-6 text-zinc-700" />
        </button>

        {/* 인디케이터 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {featuredWorks.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${index === currentSlide
                ? "bg-zinc-900 w-8"
                : "bg-zinc-400 w-2 hover:bg-zinc-600"
                }`}
              aria-label={`슬라이드 ${index + 1}로 이동`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeaturedCarousel;
