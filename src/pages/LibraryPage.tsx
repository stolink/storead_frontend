/**
 * 내 서재 페이지
 * BookCard 그리드 레이아웃
 */
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLibrary, useRemoveFromLibrary } from "@/hooks/useLibrary";
import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore, backgroundThemeClasses } from "@/stores/useTheme";
import type { Library } from "@/types";

/**
 * 서재 카드 컴포넌트
 */
const LibraryCard = ({
  item,
  onRemove,
}: {
  item: Library;
  onRemove: () => void;
}) => {
  const navigate = useNavigate();
  const work = item.work;

  if (!work) return null;

  const avgRating =
    work.ratingCount > 0 ? work.ratingSum / work.ratingCount / 2 : 0;

  return (
    <div className="group cursor-pointer relative">
      {/* 표지 이미지 */}
      <div
        className="relative aspect-[3/4] bg-zinc-200 rounded-lg overflow-hidden mb-3 shadow-md hover:shadow-xl transition-shadow"
        onClick={() => navigate(`/works/${work.id}`)}
      >
        {work.coverImageUrl ? (
          <img
            src={work.coverImageUrl}
            alt={work.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-300 to-zinc-400 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-zinc-500" />
          </div>
        )}
        {/* 상태 배지 */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full">
          <span className="text-sm text-zinc-700">읽는 중</span>
        </div>
        {/* 삭제 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>
      {/* 제목 및 정보 */}
      <div className="px-2">
        <h3
          className="text-zinc-900 mb-1 line-clamp-2 group-hover:text-zinc-700 transition-colors font-medium cursor-pointer"
          onClick={() => navigate(`/works/${work.id}`)}
        >
          {work.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span>{avgRating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * 내 서재 페이지 컴포넌트
 */
export const LibraryPage = () => {
  const { isAuthenticated } = useAuthStore();
  const { data: library, isLoading } = useLibrary();
  const removeFromLibrary = useRemoveFromLibrary();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useThemeStore();

  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${backgroundThemeClasses[theme]}`}
      >
        <BookOpen className="h-16 w-16 text-zinc-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">로그인이 필요합니다</h2>
        <p className="text-zinc-500 mb-4">내 서재를 이용하려면 로그인하세요.</p>
        <Button
          onClick={() =>
            navigate("/login", { state: { from: location.pathname } })
          }
          className="bg-purple-600 hover:bg-purple-700"
        >
          로그인
        </Button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${backgroundThemeClasses[theme]}`}>
      <main className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">내 서재</h1>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
          </div>
        ) : library?.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">서재가 비어있습니다</h2>
            <p className="text-zinc-500 mb-4">
              마음에 드는 작품을 서재에 담아보세요.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              작품 둘러보기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {library?.map((item) => (
              <LibraryCard
                key={item.id}
                item={item}
                onRemove={() => removeFromLibrary.mutate(item.workId)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LibraryPage;
