/**
 * 공개 홈 페이지
 * 작품 탐색, 검색, 필터링
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDiscoveryWorks, useSearchWorks } from '@/hooks/useDiscovery';
import type { Genre, Work } from '@/types';

const GENRE_FILTERS: { value: Genre | 'ALL'; label: string }[] = [
    { value: 'ALL', label: '전체' },
    { value: 'FANTASY', label: '판타지' },
    { value: 'ROMANCE', label: '로맨스' },
    { value: 'MARTIAL_ARTS', label: '무협' },
    { value: 'THRILLER', label: '스릴러' },
    { value: 'SF', label: 'SF' },
    { value: 'DRAMA', label: '드라마' },
];

/**
 * 작품 카드 컴포넌트
 */
const WorkCard = ({ work }: { work: Work }) => {
    const navigate = useNavigate();
    const avgRating = work.ratingCount > 0 ? work.ratingSum / work.ratingCount : 0;

    return (
        <Card
            className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
            onClick={() => navigate(`/works/${work.id}`)}
        >
            {/* 표지 이미지 */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                {work.coverImageUrl ? (
                    <img
                        src={work.coverImageUrl}
                        alt={work.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-zinc-400" />
                    </div>
                )}
                {/* 장르 배지 */}
                <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium bg-black/60 text-white rounded">
                    {GENRE_FILTERS.find((g) => g.value === work.genre)?.label || work.genre}
                </span>
            </div>

            <CardContent className="p-4">
                {/* 제목 */}
                <h3 className="font-bold text-lg mb-1 truncate">{work.title}</h3>
                {/* 작가 */}
                <p className="text-sm text-zinc-500 mb-2">
                    {work.author?.nickname || '익명 작가'}
                </p>
                {/* 별점 */}
                <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">
                        {(avgRating / 2).toFixed(1)}
                    </span>
                    <span className="text-xs text-zinc-400">
                        ({work.ratingCount.toLocaleString()})
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};

/**
 * 홈 페이지 컴포넌트
 */
export const HomePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [genre, setGenre] = useState<Genre | 'ALL'>('ALL');
    const [isSearching, setIsSearching] = useState(false);

    const discoveryParams = genre === 'ALL' ? {} : { genre };
    const { data: discoveryData, isLoading: discoveryLoading } =
        useDiscoveryWorks(discoveryParams);
    const { data: searchData, isLoading: searchLoading } = useSearchWorks(
        isSearching ? searchQuery : ''
    );

    const works = isSearching ? searchData?.data : discoveryData?.data;
    const isLoading = isSearching ? searchLoading : discoveryLoading;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsSearching(true);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setIsSearching(false);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            {/* 헤더 배너 */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">AI 스마트 스토리</h1>
                    <p className="text-lg opacity-90 mb-8">
                        고퀄리티 설정과 정합성이 검증된 작품을 만나보세요
                    </p>

                    {/* 검색 바 */}
                    <form
                        onSubmit={handleSearch}
                        className="max-w-xl mx-auto flex gap-2"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="제목, 작가명으로 검색..."
                                className="pl-10 h-12 bg-white text-zinc-900"
                            />
                        </div>
                        <Button type="submit" size="lg" variant="secondary">
                            검색
                        </Button>
                    </form>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* 검색 중 표시 */}
                {isSearching && (
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-lg">
                            <span className="font-semibold">"{searchQuery}"</span> 검색 결과
                        </p>
                        <Button variant="ghost" onClick={clearSearch}>
                            전체 보기로 돌아가기
                        </Button>
                    </div>
                )}

                {/* 장르 필터 */}
                {!isSearching && (
                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                        {GENRE_FILTERS.map((g) => (
                            <Button
                                key={g.value}
                                variant={genre === g.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setGenre(g.value)}
                            >
                                {g.label}
                            </Button>
                        ))}
                    </div>
                )}

                {/* 작품 그리드 */}
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                ) : works?.length === 0 ? (
                    <div className="text-center py-16 text-zinc-500">
                        작품이 없습니다.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {works?.map((work) => (
                            <WorkCard key={work.id} work={work} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
