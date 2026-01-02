/**
 * 작품 상세 페이지
 * 표지, 줄거리, 챕터 리스트, 태그, 정렬
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Bookmark, BookOpen, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublicWork } from "@/hooks/useDiscovery";
import {
  useAddToLibrary,
  useRemoveFromLibrary,
  useIsInLibrary,
} from "@/hooks/useLibrary";
import { useWorkLike, useToggleWorkLike } from "@/hooks/useWorkLike";
import { useReadingProgress } from "@/hooks/useBookmark";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { useThemeStore, backgroundThemeClasses } from "@/stores/useTheme";

// 장르 레이블 매핑
const GENRE_LABELS: Record<string, string> = {
  FANTASY: "판타지",
  ROMANCE: "로맨스",
  MARTIAL_ARTS: "무협",
  THRILLER: "스릴러",
  SF: "SF",
  DRAMA: "드라마",
};

/**
 * 작품 상세 페이지 컴포넌트
 */
export const WorkDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useAuthModalStore();
  const { theme } = useThemeStore();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data: work, isLoading: workLoading } = usePublicWork(id || "");
  const chapters = work?.chapters;
  const { data: readingProgress } = useReadingProgress(id || "");
  const isInLibrary = useIsInLibrary(id || "");
  const addToLibrary = useAddToLibrary();
  const removeFromLibrary = useRemoveFromLibrary();

  // 작품 좋아요
  const { data: likeStatus } = useWorkLike(id || "");
  const toggleWorkLike = useToggleWorkLike();

  const avgRating =
    work && (work.ratingCount || 0) > 0
      ? (work.ratingSum || 0) / (work.ratingCount || 0) / 2
      : 0;

  // 정렬된 챕터 목록
  const sortedChapters = [...(chapters || [])].sort((a, b) => {
    return sortOrder === "asc"
      ? a.chapterNumber - b.chapterNumber
      : b.chapterNumber - a.chapterNumber;
  });

  const handleLibraryToggle = () => {
    if (!id) return;
    if (isInLibrary) {
      removeFromLibrary.mutate(id);
    } else {
      addToLibrary.mutate(id);
    }
  };

  const handleWorkLikeToggle = () => {
    if (!id || !isAuthenticated) return;
    toggleWorkLike.mutate(id);
  };

  const handleContinueReading = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (readingProgress?.lastChapterId) {
      navigate(`/chapters/${readingProgress.lastChapterId}`);
    } else if (chapters && chapters.length > 0) {
      navigate(`/chapters/${chapters[0].id}`);
    }
  };

  // 챕터 클릭 핸들러 - 로그인 체크
  const handleChapterClick = (chapterId: string) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    navigate(`/chapters/${chapterId}`);
  };

  if (workLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${backgroundThemeClasses[theme]}`}
      >
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!work) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${backgroundThemeClasses[theme]}`}
      >
        <p>작품을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${backgroundThemeClasses[theme]}`}>
      <main className="container mx-auto px-6 py-12">
        {/* 히어로 섹션 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 표지 */}
            <div>
              <div className="aspect-[3/4] bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-lg overflow-hidden">
                {work.coverImageUrl ? (
                  <img
                    src={work.coverImageUrl}
                    alt={work.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <BookOpen className="h-16 w-16" />
                  </div>
                )}
              </div>
            </div>

            {/* 작품 정보 */}
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold mb-2">{work.title}</h1>
              <p className="text-zinc-600 mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                작가: {work.authorNickname || work.author?.nickname || "익명"}
              </p>

              {/* 별점 */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(avgRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-zinc-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xl font-semibold">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-zinc-600">
                  ({(work.ratingCount || 0).toLocaleString()}개의 평가)
                </span>
              </div>

              {/* 줄거리 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">작품 소개</h3>
                <p className="text-zinc-700 leading-relaxed">
                  {work.synopsis || "줄거리가 없습니다."}
                </p>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={handleContinueReading}
                >
                  {readingProgress ? "이어 읽기" : "첫 화 보기"}
                </Button>
                {isAuthenticated && (
                  <>
                    <Button
                      size="lg"
                      variant={isInLibrary ? "secondary" : "outline"}
                      onClick={handleLibraryToggle}
                      className={`px-6 ${
                        isInLibrary
                          ? "border-purple-600 bg-purple-50 text-purple-600"
                          : "border-zinc-300 hover:border-purple-600"
                      }`}
                    >
                      <Bookmark
                        className={`w-5 h-5 mr-2 ${
                          isInLibrary ? "fill-purple-600" : ""
                        }`}
                      />
                      {isInLibrary ? "서재에 담김" : "내 서재에 담기"}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleWorkLikeToggle}
                      className={`px-6 ${
                        likeStatus?.isLiked
                          ? "border-red-500 bg-red-50 text-red-500"
                          : "border-zinc-300 hover:border-red-500"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 mr-2 ${
                          likeStatus?.isLiked ? "fill-red-500" : ""
                        }`}
                      />
                      {likeStatus?.likeCount || 0}
                    </Button>
                  </>
                )}
              </div>

              {/* 태그/장르 */}
              <div className="mt-6 flex gap-2 flex-wrap">
                {work.genre && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {GENRE_LABELS[work.genre] || work.genre}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 회차 목록 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">회차 목록</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSortOrder("asc")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  sortOrder === "asc"
                    ? "bg-purple-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                1화부터 보기
              </button>
              <button
                onClick={() => setSortOrder("desc")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  sortOrder === "desc"
                    ? "bg-purple-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                최신화부터 보기
              </button>
            </div>
          </div>

          {chapters?.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              아직 등록된 회차가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {sortedChapters.map((chapter) => {
                const chapterRating =
                  chapter.ratingCount > 0
                    ? chapter.ratingSum / chapter.ratingCount / 2
                    : 0;
                const isRead = false; // TODO: 읽은 챕터 표시

                return (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterClick(chapter.id)}
                    className={`w-full text-left block p-4 rounded-lg border transition-colors ${
                      isRead
                        ? "border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                        : "border-zinc-200 hover:border-purple-600 hover:bg-purple-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-lg font-semibold ${
                            isRead ? "text-zinc-400" : "text-purple-600"
                          }`}
                        >
                          제{chapter.chapterNumber}화
                        </span>
                        <span
                          className={isRead ? "text-zinc-400" : "text-zinc-900"}
                        >
                          {chapter.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm">
                            {chapterRating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm text-zinc-500">
                          {new Date(chapter.createdAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkDetailPage;
