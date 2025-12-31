/**
 * 내 서재 페이지
 */
import { useNavigate } from 'react-router-dom';
import { BookOpen, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLibrary, useRemoveFromLibrary } from '@/hooks/useLibrary';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Library } from '@/types';

/**
 * 서재 아이템 카드
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

    const avgRating = work.ratingCount > 0 ? work.ratingSum / work.ratingCount : 0;

    return (
        <Card className="group">
            <CardContent className="p-4 flex gap-4">
                {/* 표지 */}
                <div
                    className="w-20 aspect-[3/4] rounded overflow-hidden cursor-pointer flex-shrink-0"
                    onClick={() => navigate(`/works/${work.id}`)}
                >
                    {work.coverImageUrl ? (
                        <img
                            src={work.coverImageUrl}
                            alt={work.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-zinc-400" />
                        </div>
                    )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                    <h3
                        className="font-bold truncate cursor-pointer hover:text-indigo-600"
                        onClick={() => navigate(`/works/${work.id}`)}
                    >
                        {work.title}
                    </h3>
                    <p className="text-sm text-zinc-500 mb-2">
                        {work.author?.nickname || '익명'}
                    </p>
                    <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm">{(avgRating / 2).toFixed(1)}</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/works/${work.id}`)}
                    >
                        이어 읽기
                    </Button>
                </div>

                {/* 삭제 버튼 */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={onRemove}
                >
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            </CardContent>
        </Card>
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

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                <BookOpen className="h-16 w-16 text-zinc-300 mb-4" />
                <h2 className="text-xl font-semibold mb-2">로그인이 필요합니다</h2>
                <p className="text-zinc-500 mb-4">내 서재를 이용하려면 로그인하세요.</p>
                <Button onClick={() => navigate('/login')}>로그인</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">내 서재</h1>

                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                ) : library?.length === 0 ? (
                    <div className="text-center py-16">
                        <BookOpen className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">서재가 비어있습니다</h2>
                        <p className="text-zinc-500 mb-4">
                            마음에 드는 작품을 서재에 담아보세요.
                        </p>
                        <Button onClick={() => navigate('/')}>작품 둘러보기</Button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {library?.map((item) => (
                            <LibraryCard
                                key={item.id}
                                item={item}
                                onRemove={() => removeFromLibrary.mutate(item.workId)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryPage;
