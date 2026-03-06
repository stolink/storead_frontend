/**
 * 북 카드 컴포넌트
 * 작품 표지와 제목을 표시하는 카드
 *
 * 기능:
 * - 호버 시 퀵 액션 오버레이 표시 (관심 등록, 첫 화 보기)
 * - 장르 태그 Glassmorphism 효과로 가독성 개선
 */
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Play } from "lucide-react";
import type { Work } from "@/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
// import { useAddToLibrary, useIsInLibrary } from '@/hooks/useLibrary';
import { Button } from "@/components/ui/button";
import { GENRE_LABELS } from "@/constants/genres";

interface BookCardProps {
  work: Work;
  category?: string;
  showQuickActions?: boolean; // 퀵 액션 오버레이 표시 여부
}

export function BookCard({
  work,
  category,
  showQuickActions = true,
}: BookCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useAuthModalStore();
  const [isHovered, setIsHovered] = useState(false);
  const [now] = useState(() => Date.now());

  // NEW 뱃지 노출 여부 (임계점: 7일)
  const isNew = useMemo(() => {
    const createdAtTime = new Date(work.createdAt).getTime();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    return createdAtTime > sevenDaysAgo;
  }, [work.createdAt, now]);

  // 장르 레이블 (category가 있으면 그것을, 없으면 work.genre 사용)
  const genreLabel =
    category || (work.genre ? GENRE_LABELS[work.genre] || work.genre : null);

  // 첫 화 보기 핸들러
  const handleFirstChapter = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openAuthModal(window.location.pathname);
      return;
    }

    // 작품 상세 페이지로 이동 (첫 화는 상세페이지에서 선택)
    navigate(`/works/${work.id}`);
  };

  // Spotlight 효과를 위한 마우스 추적
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--mouse-x", `${x}%`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}%`);
  };

  return (
    <Link
      to={`/works/${work.id}`}
      className="group cursor-pointer block spotlight-effect"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* 표지 이미지 (3:4 비율) - Glass Card 스타일 */}
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3 glass-card hover-glow transition-all duration-300">
        {work.coverImageUrl ? (
          <img
            src={work.coverImageUrl}
            alt={work.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-organic"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-mocha-200 to-mocha-400 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-mocha-600" />
          </div>
        )}

        {/* 장르 및 상태 태그 - Glassmorphism 효과로 가독성 개선 */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {genreLabel && (
            <div className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider glass text-espresso-900 shadow-sm border border-white/20">
              {genreLabel}
            </div>
          )}
          {work.status === "COMPLETED" && (
            <div className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-mocha-600 text-white shadow-sm border border-mocha-400/50">
              완결
            </div>
          )}
          {work.isFree === false && (
            <div className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-sm border border-amber-400/50">
              PAID
            </div>
          )}
          {work.status === "HIATUS" && (
            <div className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-500 text-white shadow-sm border border-zinc-400/50">
              휴재
            </div>
          )}
        </div>

        {/* 상태 배지 (HOT, NEW) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-10 pointer-events-none">
          {/* HOT Badge: likes > 50 (임시 기준) */}
          {(work.likeCount || 0) >= 50 && (
            <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
              HOT
            </div>
          )}
          {/* NEW Badge: created within 7 days */}
          {isNew && (
            <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              NEW
            </div>
          )}
        </div>

        {/* 퀵 액션 오버레이 - 호버 시 표시 */}
        {showQuickActions && (
          <div
            className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* 하단 그라데이션 배경 */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.5) 40%, transparent 100%)",
              }}
            />

            {/* 액션 버튼들 */}
            <div className="relative z-10 p-3 flex gap-2">
              {/* 첫 화 보기 버튼 */}
              <Button
                size="sm"
                className="flex-1 h-9 bg-mocha-500 hover:bg-mocha-600 text-white font-medium text-sm rounded-full"
                onClick={handleFirstChapter}
              >
                <Play className="w-4 h-4 mr-1.5 fill-current" />첫 화 보기
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 제목 및 정보 */}
      <div className="px-1">
        <h3 className="text-espresso-900 mb-0.5 line-clamp-2 group-hover:text-mocha-600 transition-colors font-medium leading-snug">
          {work.title}
        </h3>
        <div className="flex items-center justify-between mb-1.5">
          {(work.author?.nickname || work.authorNickname) && (
            <p className="text-xs text-mocha-400 font-medium">
              {work.author?.nickname || work.authorNickname}
            </p>
          )}
        </div>

        {/* Consolidated Micro Tags (#hashtags) */}
        <div className="flex flex-wrap gap-1.5 mt-2 h-[24px] overflow-hidden">
          {(
            (work as unknown as { tags?: string[] }).tags || [
              "#회귀",
              "#먼치킨",
              "#사이다",
            ]
          )
            .slice(0, 3)
            .map((tag, i) => (
              <span
                key={i}
                className="text-[9px] font-bold text-mocha-400 group-hover:text-mocha-600 transition-colors"
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
        </div>
      </div>
    </Link>
  );
}

export default BookCard;
