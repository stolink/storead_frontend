// =====================================================
// 🧠 Relationship Deep Analysis Modal (Main Container)
// 관계 심층 분석 + 댓글(토론) 통합 모달
// =====================================================

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
    X,
    MessageSquare,
    Network,
    Maximize2,
    Minimize2,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import type { CharacterNode, RelationshipLink } from "@/types/characterGraph";
import type { RelationshipDeepAnalysisData } from "@/types/relationshipAnalysis";

// Hooks
// import { useRelationshipAnalysis } from "@/hooks/useRelationshipAnalysis"; // TODO: Implement this hook

// Components
import { DeepAnalysisHero } from "./components/DeepAnalysisHero";
import { MoodBackground } from "./components/MoodBackground";
import { InsightsPanel } from "./components/InsightsPanel";
import { RelationshipWarningBanner } from "./components/RelationshipWarningBanner";
import { SharedScenesPanel } from "./components/SharedScenesPanel";
import { RelationshipTimelineGraph } from "./components/RelationshipTimelineGraph";
import { RelationshipCommentList } from "@/components/character-comment/RelationshipCommentList";
import { cn } from "@/lib/utils";

interface RelationshipDeepAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    sourceNode: CharacterNode;
    targetNode: CharacterNode;
    relationId?: string;
    chapterId?: string; // 댓글 시스템을 위한 챕터 ID (없으면 탭 비활성화)
    link?: RelationshipLink; // 댓글 컴포넌트에 전달할 링크 객체
}

// --- Mock Data Generator (Temporary) ---
// 백엔드 API 연결 전까지 사용할 더미 데이터 생성기
function generateMockAnalysisData(
    source: CharacterNode,
    target: CharacterNode,
): RelationshipDeepAnalysisData {
    return {
        sourceCharacter: {
            id: source.id,
            name: source.name,
            imageUrl: source.imageUrl,
        },
        targetCharacter: {
            id: target.id,
            name: target.name,
            imageUrl: target.imageUrl,
        },
        sourceToTargetAttributes: {
            emotionalBond: 7.5,
            functionalTrust: 8.8,
            valueAlignment: 6.2,
            interdependence: 9.0,
            latentTension: 4.5,
        },
        targetToSourceAttributes: {
            emotionalBond: 6.5,
            functionalTrust: 7.2,
            valueAlignment: 5.8,
            interdependence: 8.0,
            latentTension: 3.5,
        },
        asymmetricStrength: {
            sourceToTarget: {
                total: 80,
                factors: [
                    { type: "trust", score: 8, weight: 0.8, category: "friendly" },
                    { type: "admiration", score: 6, weight: 0.6, category: "friendly" },
                ],
            },
            targetToSource: {
                total: 65,
                factors: [
                    { type: "wary", score: 4, weight: 0.4, category: "hostile" },
                    { type: "need", score: 7, weight: 0.7, category: "friendly" },
                ],
            },
        },
        relationshipTypes: ["ALLY", "RIVAL"],
        currentStrength: 80,
        description: `${source.name}와(과) ${target.name}의 관계는 복잡하게 얽혀 있습니다.`,
        since: `Ch.1`,
        timeline: [
            {
                eventId: "e1",
                chapter: 1,
                timestamp: null,
                title: "첫 만남",
                description: "도서관에서의 우연한 만남. 서로의 지식에 감탄함.",
                importance: 6,
                emotionalPolarity: 0.8,
                cumulativeFriendly: 20,
                cumulativeHostile: 0,
                sentimentTrajectory: 20,
            },
        ],
        sharedScenes: [
            {
                eventId: "s1",
                chapter: "3",
                title: "심야의 밀담",
                description: "아무도 없는 복도에서 은밀하게 정보를 교환함.",
                importance: 7,
            },
        ],
        insights: {
            decisiveTrigger: {
                eventId: "e1",
                title: "첫 만남",
                summary: "모든 것의 시작점",
                impact: 8,
            },
            keywords: ["신뢰", "전우애"],
        },
        warnings: [
            {
                type: "asymmetry",
                severity: "medium",
                message: "신뢰도 비대칭 보임",
            },
        ],
    };
}

export function RelationshipDeepAnalysisModal({
    isOpen,
    onClose,
    sourceNode,
    targetNode,
    chapterId,
    link,
}: RelationshipDeepAnalysisModalProps) {
    const [activeTab, setActiveTab] = useState<"analysis" | "comments">("analysis");
    const [isFullscreen, setIsFullscreen] = useState(false);

    const data = useMemo(
        () => generateMockAnalysisData(sourceNode, targetNode),
        [sourceNode, targetNode],
    );

    // Reset tab when modal opens
    useEffect(() => {
        if (isOpen) setActiveTab("analysis");
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className={cn(
                    "max-w-6xl w-[95vw] p-0 gap-0 overflow-hidden bg-[#FDFBF7]", // Cloud-50 equivalent
                    "border-none shadow-2xl rounded-xl",
                    isFullscreen ? "w-screen h-screen max-w-none rounded-none" : "h-[90vh]",
                    "flex flex-col",
                )}
            >
                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                    <MoodBackground
                        type={data.relationshipTypes}
                        className="w-full h-full"
                    />
                </div>

                {/* Header (Toolbar) */}
                <div className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-black/5 bg-white/40 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Network className="w-5 h-5 text-espresso-600" />
                            <h2 className="text-lg font-bold text-espresso-900 font-serif tracking-tight">
                                Deep Analysis
                            </h2>
                        </div>
                        <Separator orientation="vertical" className="h-4 bg-espresso-200" />
                        <div className="flex items-center gap-2 text-sm text-espresso-600">
                            <span className="font-semibold">{sourceNode.name}</span>
                            <span className="text-espresso-400">↔</span>
                            <span className="font-semibold">{targetNode.name}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-espresso-500 hover:text-espresso-900 hover:bg-black/5"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                            {isFullscreen ? (
                                <Minimize2 className="w-4 h-4" />
                            ) : (
                                <Maximize2 className="w-4 h-4" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-espresso-500 hover:text-espresso-900 hover:bg-black/5"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Main Content Area with Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as any)}
                    className="flex-1 flex flex-col min-h-0 relative z-10"
                >
                    {/* Tab List */}
                    <div className="px-6 pt-2 border-b border-black/5 bg-white/20 backdrop-blur-sm">
                        <TabsList className="bg-transparent gap-6 p-0 h-auto">
                            <TabsTrigger
                                value="analysis"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-espresso-900 rounded-none px-2 py-3 text-espresso-500 data-[state=active]:text-espresso-900 font-serif font-bold transition-all text-base"
                            >
                                관계 분석 (Analysis)
                            </TabsTrigger>
                            <TabsTrigger
                                value="comments"
                                disabled={!chapterId}
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-espresso-900 rounded-none px-2 py-3 text-espresso-500 data-[state=active]:text-espresso-900 font-serif font-bold transition-all text-base flex items-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                토론 (Comments)
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Analysis Content */}
                    <TabsContent
                        value="analysis"
                        className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden"
                    >
                        <ScrollArea className="h-full w-full">
                            <div className="p-0 pb-20">
                                {/* Hero Section */}
                                <DeepAnalysisHero
                                    sourceCharacter={data.sourceCharacter}
                                    targetCharacter={data.targetCharacter}
                                    asymmetricStrength={data.asymmetricStrength}
                                    relationshipTypes={data.relationshipTypes}
                                    description={data.description}
                                    since={data.since}
                                    onClose={onClose}
                                    className="mb-8"
                                />

                                {/* Dashboard Grid */}
                                <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Left Column: Timeline & Scenes (8 cols) */}
                                    <div className="lg:col-span-8 flex flex-col gap-6">
                                        {/* Warning Banner */}
                                        {data.warnings && data.warnings.length > 0 && (
                                            <RelationshipWarningBanner warnings={data.warnings} />
                                        )}

                                        {/* Timeline Graph */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-6"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-bold text-espresso-900 font-serif">
                                                    Relationship Timeline
                                                </h3>
                                                <div className="text-xs font-medium text-espresso-400">
                                                    감정 궤적 & 주요 사건
                                                </div>
                                            </div>
                                            <RelationshipTimelineGraph
                                                data={data.timeline}
                                                height={320}
                                                animationDelay={0.5}
                                            />
                                        </motion.div>
                                    </div>

                                    {/* Right Column: Insights & Shared Scenes (4 cols) */}
                                    <div className="lg:col-span-4 flex flex-col gap-6">
                                        <InsightsPanel
                                            insights={data.insights}
                                            asymmetricStrength={data.asymmetricStrength}
                                            animationDelay={0.3}
                                        />

                                        <SharedScenesPanel
                                            scenes={data.sharedScenes || []}
                                            className="bg-white/60"
                                        />
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    {/* Comments Content */}
                    <TabsContent
                        value="comments"
                        className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden bg-white/50"
                    >
                        <div className="h-full w-full max-w-4xl mx-auto p-6">
                            {chapterId && link ? (
                                <RelationshipCommentList chapterId={chapterId} link={link} />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-espresso-400">
                                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                                    <p>댓글을 불러올 수 없습니다. (Chapter ID missing)</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

export default RelationshipDeepAnalysisModal;
