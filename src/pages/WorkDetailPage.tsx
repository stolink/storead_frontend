/**
 * 작품 상세 페이지
 * 표지, 줄거리, 챕터 리스트
 */
import { useParams, useNavigate } from "react-router-dom";
import { Star, Heart, BookOpen, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePublicWork } from "@/hooks/useDiscovery";
import {
  useAddToLibrary,
  useRemoveFromLibrary,
  useIsInLibrary,
} from "@/hooks/useLibrary";
import { useReadingProgress } from "@/hooks/useBookmark";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Chapter } from "@/types";

/**
 * 챕터 리스트 아이템
 */
const ChapterItem = ({
  chapter,
  onClick,
}: {
  chapter: Chapter;
  onClick: () => void;
}) => {
  const avgRating =
    chapter.ratingCount > 0 ? chapter.ratingSum / chapter.ratingCount : 0;

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
      onClick={onClick}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-zinc-400 w-12">
            {chapter.chapterNumber}화
          </span>
          <div>
            <h4 className="font-medium">{chapter.title}</h4>
            <p className="text-sm text-zinc-500">
              {new Date(chapter.createdAt).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* 별점 */}
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm">{(avgRating / 2).toFixed(1)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 작품 상세 페이지 컴포넌트
 */
export const WorkDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const { data: work, isLoading: workLoading } = usePublicWork(id || "");
  // 챕터 목록은 work 응답에 포함되어 있음 (work.chapters)
  const chapters = work?.chapters;
  const { data: readingProgress } = useReadingProgress(id || "");
  const isInLibrary = useIsInLibrary(id || "");
  const addToLibrary = useAddToLibrary();
  const removeFromLibrary = useRemoveFromLibrary();

  const avgRating =
    work && work.ratingCount > 0 ? work.ratingSum / work.ratingCount : 0;

  const handleLibraryToggle = () => {
    if (!id) return;
    if (isInLibrary) {
      removeFromLibrary.mutate(id);
    } else {
      addToLibrary.mutate(id);
    }
  };

  const handleContinueReading = () => {
    if (readingProgress?.lastChapterId) {
      navigate(`/chapters/${readingProgress.lastChapterId}`);
    } else if (chapters && chapters.length > 0) {
      navigate(`/chapters/${chapters[0].id}`);
    }
  };

  if (workLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>작품을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* 상단 배너 */}
      <div className="relative">
        {/* 배경 블러 이미지 */}
        {work.coverImageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center blur-xl opacity-30"
            style={{ backgroundImage: `url(${work.coverImageUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-50 dark:to-zinc-900" />

        <div className="relative container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* 표지 */}
            <div className="flex-shrink-0">
              <div className="w-48 aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
                {work.coverImageUrl ? (
                  <img
                    src={work.coverImageUrl}
                    alt={work.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-300 to-zinc-400 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-zinc-500" />
                  </div>
                )}
              </div>
            </div>

            {/* 정보 */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{work.title}</h1>
              <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 mb-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{work.author?.nickname || "익명"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">
                    {(avgRating / 2).toFixed(1)}
                  </span>
                  <span className="text-sm">({work.ratingCount}명)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{chapters?.length || 0}화</span>
                </div>
              </div>

              {/* 줄거리 */}
              <p className="text-zinc-700 dark:text-zinc-300 mb-6 line-clamp-4">
                {work.synopsis}
              </p>

              {/* 액션 버튼 */}
              <div className="flex gap-3">
                <Button size="lg" onClick={handleContinueReading}>
                  {readingProgress ? "이어 읽기" : "첫 화 보기"}
                </Button>
                {isAuthenticated && (
                  <Button
                    size="lg"
                    variant={isInLibrary ? "secondary" : "outline"}
                    onClick={handleLibraryToggle}
                  >
                    <Heart
                      className={`h-5 w-5 mr-2 ${
                        isInLibrary ? "fill-current text-red-500" : ""
                      }`}
                    />
                    {isInLibrary ? "서재에서 제거" : "내 서재에 담기"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 챕터 리스트 */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-4">회차 목록</h2>

        {workLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-4 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : chapters?.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            아직 등록된 회차가 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {chapters
              ?.sort((a, b) => a.chapterNumber - b.chapterNumber)
              .map((chapter) => (
                <ChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  onClick={() => navigate(`/chapters/${chapter.id}`)}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkDetailPage;
