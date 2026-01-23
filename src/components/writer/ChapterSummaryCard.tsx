/**
 * ChapterSummaryCard - 배포될 챕터 정보 요약 카드
 * 병합 여부, 섹션 수, 인물관계도 포함 여부 등을 표시
 */
import { useState } from "react";
import { FileText, Network, Layers, List, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Draft } from "@/hooks/useDraft";

interface ChapterSummaryCardProps {
    draft: Draft | undefined;
    className?: string;
    onPreviewGraph?: () => void;
}

/**
 * 배포될 챕터 정보를 요약하여 보여주는 카드
 *
 * @example
 * <ChapterSummaryCard draft={draft} />
 */
export function ChapterSummaryCard({ draft, className, onPreviewGraph }: ChapterSummaryCardProps) {
    const [showList, setShowList] = useState(false);

    if (!draft) return null;

    const sectionCount = draft.documentIds?.length || 1;
    const isMerged = draft.isMerged || false;
    const hasGraph = !!draft.graphSnapshot;

    return (
        <div
            className={`bg-mocha-50/50 border border-mocha-200 rounded-xl p-5 space-y-4 shadow-sm ${className || ""}`}
        >
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-mocha-900 font-bold">
                    <FileText className="w-4.5 h-4.5 text-mocha-500" />
                    <span>게시 요약</span>
                </div>
                {hasGraph && onPreviewGraph && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPreviewGraph}
                        className="h-8 bg-paper border-mocha-200 text-mocha-700 hover:bg-mocha-100 hover:text-mocha-900 transition-all text-xs gap-1.5 shadow-sm"
                    >
                        <Network className="w-3.5 h-3.5" />
                        인물관계도 미리보기
                    </Button>
                )}
            </div>

            {/* 섹션 정보 */}
            <div className="space-y-3">
                {/* 병합 여부 */}
                <div>
                    <div className="flex items-center justify-between text-sm text-mocha-700 bg-white/60 p-3 rounded-lg border border-mocha-100/50">
                        <div className="flex items-center gap-2.5">
                            <Layers className="w-4.5 h-4.5 text-mocha-400" />
                            {isMerged ? (
                                <span>
                                    📚 <strong>{sectionCount}개</strong>의 섹션이 병합됩니다
                                </span>
                            ) : (
                                <span>
                                    📄 <strong>{sectionCount}개</strong>의 섹션이 게시됩니다
                                </span>
                            )}
                        </div>
                        {isMerged && (
                            <button
                                onClick={() => setShowList(!showList)}
                                className="flex items-center gap-1 text-[11px] font-bold text-mocha-500 hover:text-mocha-700 transition-colors bg-mocha-100/50 px-2.5 py-1 rounded-md"
                            >
                                <List className="w-3 h-3" />
                                {showList ? "닫기" : "목록 보기"}
                                {showList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                        )}
                    </div>

                    {/* 섹션 목록 */}
                    {showList && isMerged && (
                        <div className="mt-2 bg-white/40 p-3 rounded-lg border border-mocha-100/50 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <p className="text-[10px] uppercase tracking-wider text-mocha-400 font-bold mb-1 ml-1">병합 대상 섹션</p>
                            <ul className="space-y-1.5">
                                {draft.title?.split(',').map((t, i) => (
                                    <li key={i} className="text-xs text-mocha-600 flex items-start gap-2 px-1">
                                        <span className="w-4.5 h-4.5 rounded-full bg-mocha-100 text-mocha-500 flex items-center justify-center text-[9px] font-bold mt-0.5 flex-shrink-0">{i + 1}</span>
                                        <span className="flex-1 line-clamp-1 py-0.5">{t.trim() || "제목 없는 섹션"}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* 인물관계도 포함 안내 */}
                {hasGraph && (
                    <div className="flex items-center gap-2.5 text-xs text-mocha-500 px-3 py-1">
                        <div className="w-1 h-1 bg-sage-500 rounded-full" />
                        <span>인물관계도 데이터가 포함되어 게시됩니다.</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChapterSummaryCard;
