/**
 * 랭킹 페이지
 * /ranking
 * 
 * 기능:
 * - 기간별 랭킹 탭 (실시간, 일간, 주간, 월간)
 * - 장르별 필터
 * - 순위 표시 리스트
 */
import { useState } from 'react';
import { useRankings } from '@/hooks/useDiscovery';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PERIOD_TABS = [
    { label: '실시간', value: 'REALTIME' },
    { label: '일간', value: 'DAILY' },
    { label: '주간', value: 'WEEKLY' },
    { label: '월간', value: 'MONTHLY' },
    { label: '전체', value: 'ALL-TIME' }
];

const GENRE_TABS = [
    { label: '전체', value: '' }, // API에서 null/empty로 처리
    { label: '판타지', value: 'FANTASY' },
    { label: '로맨스', value: 'ROMANCE' },
    { label: '무협', value: 'MARTIAL_ARTS' },
    { label: '현대판타지', value: 'MODERN_FANTASY' },
    // 필요 시 추가
];

export const RankingPage = () => {
    const [period, setPeriod] = useState<string>('REALTIME');
    const [genre, setGenre] = useState<string>('');
    const [showAll, setShowAll] = useState(false);

    const { data: worksData, isLoading } = useRankings(period, genre);
    const works = worksData?.data || [];

    // Top 3 separation
    const top3 = works.slice(0, 3);
    const rest = showAll ? works.slice(3) : works.slice(3, 7); // Show 4-7 initially, then all

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-20 font-sans">
            {/* Header */}
            <div className="bg-zinc-900 text-white pt-12 pb-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                <div className="container mx-auto px-6 relative z-10">
                    <h1 className="text-5xl font-heading font-black mb-4 tracking-tight">Ranking</h1>
                    <p className="text-zinc-400 font-serif italic text-lg max-w-xl">
                        Discover the most popular novels of the {period.toLowerCase()}. Updated in real-time.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-16 relative z-20">
                {/* Visual Tabs and Filters */}
                <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-4 mb-12 flex flex-col md:flex-row items-center justify-between gap-4 border border-zinc-100 dark:border-zinc-700">
                    {/* Period Tabs */}
                    <div className="flex bg-zinc-100 dark:bg-zinc-700 p-1 rounded-xl">
                        {PERIOD_TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setPeriod(tab.value)}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${period === tab.value
                                    ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Genre Filters */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-full">
                        {/* All Genre Dropdown could be here, strict to tabs for now as per requirement */}
                        {GENRE_TABS.map((tab) => (
                            <button
                                key={tab.label}
                                onClick={() => setGenre(tab.value)}
                                className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors whitespace-nowrap uppercase tracking-wider ${genre === tab.value
                                    ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900'
                                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-zinc-300" />
                    </div>
                ) : (
                    <>
                        {/* Top 3 Hero Section */}
                        {top3.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-end">
                                {/* 2nd Place */}
                                {top3[1] && <TopRankCard work={top3[1]} rank={2} />}

                                {/* 1st Place (Center, Largest) */}
                                {top3[0] && <TopRankCard work={top3[0]} rank={1} isMain />}

                                {/* 3rd Place */}
                                {top3[2] && <TopRankCard work={top3[2]} rank={3} />}
                            </div>
                        )}

                        {/* Ranking List (4-100) */}
                        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700 overflow-hidden">
                            {rest.map((work, idx) => (
                                <RankingListItem
                                    key={work.id}
                                    work={work}
                                    rank={showAll ? 4 + idx : 4 + idx}
                                />
                            ))}

                            {/* Show More Button */}
                            {!showAll && works.length > 7 && (
                                <div className="p-4 border-t border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                                    <Button
                                        variant="outline"
                                        className="w-full py-6 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-all font-bold tracking-wide uppercase"
                                        onClick={() => setShowAll(true)}
                                    >
                                        Show Ranks 8-100
                                    </Button>
                                </div>
                            )}

                            {rest.length === 0 && top3.length === 0 && (
                                <div className="py-20 text-center text-zinc-400 font-serif italic">
                                    No ranking data available for this period.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// Helper Components
import { useNavigate } from 'react-router-dom';
import type { Work } from '@/types';

function TopRankCard({ work, rank, isMain = false }: { work: Work, rank: number, isMain?: boolean }) {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/works/${work.id}`)}
            className={`relative group cursor-pointer flex flex-col items-center ${isMain ? '-mt-12 md:-mt-24 z-10' : ''}`}
        >
            {/* Rank Badge */}
            <div className={`absolute -top-4 z-20 flex items-center justify-center font-black font-heading text-white shadow-xl ${rank === 1 ? 'w-16 h-16 text-3xl bg-yellow-400 rounded-full ring-4 ring-white dark:ring-zinc-900 transform -translate-y-1/2' :
                'w-12 h-12 text-xl bg-zinc-800 rounded-full ring-4 ring-white dark:ring-zinc-900 shadow-lg'
                }`}>
                {rank}
            </div>

            {/* Card Content */}
            <div className={`w-full bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2 ${isMain ? 'ring-4 ring-yellow-400/20' : ''
                }`}>
                <div className={`relative bg-zinc-200 ${isMain ? 'aspect-[3/4]' : 'aspect-[4/5]'}`}>
                    {work.coverImageUrl && (
                        <img src={work.coverImageUrl} alt={work.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className={`font-bold font-heading leading-tight mb-1 ${isMain ? 'text-2xl' : 'text-lg'}`}>{work.title}</h3>
                        <p className="text-zinc-300 text-sm font-medium">{work.author?.nickname || work.authorNickname}</p>
                    </div>
                </div>
                {isMain && (
                    <div className="p-4 bg-yellow-50 dark:bg-zinc-800/80 border-t border-yellow-100 dark:border-zinc-700">
                        <button className="w-full py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors uppercase tracking-wide text-sm">
                            Read Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function RankingListItem({ work, rank }: { work: Work, rank: number }) {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/works/${work.id}`)}
            className="flex items-center gap-6 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer border-b border-zinc-100 dark:border-zinc-700 last:border-0"
        >
            <div className="w-12 text-center font-heading font-bold text-2xl text-zinc-300">{rank}</div>

            <div className="w-16 h-20 bg-zinc-200 rounded-lg overflow-hidden shrink-0 shadow-md">
                {work.coverImageUrl && (
                    <img src={work.coverImageUrl} alt={work.title} className="w-full h-full object-cover" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 truncate mb-1">{work.title}</h4>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{work.author?.nickname || work.authorNickname}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-300" />
                    <span>{work.genre}</span>
                </div>
            </div>

            <div className="flex flex-col items-end gap-1 min-w-[100px] text-right">
                <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                    <span>★</span>
                    <span>{(work.ratingSum / (work.ratingCount || 1)).toFixed(1)}</span>
                </div>
                <div className="text-xs text-zinc-400 font-medium">
                    ♥ {work.likeCount}
                </div>
            </div>
        </div>
    );
}

export default RankingPage;
