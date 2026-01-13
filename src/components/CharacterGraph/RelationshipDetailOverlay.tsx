// =====================================================
// 🧠 Relationship Detail Overlay (Inline Version)
// 인라인 오버레이 형태로 그래프 위에 직접 표시
// =====================================================

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    MessageSquare,
    Network,
    Maximize2,
    Minimize2,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { CharacterNode, RelationshipLink } from "@/types/characterGraph";
import type { RelationshipDeepAnalysisData } from "@/types/relationshipAnalysis";

// Components
import { DeepAnalysisHero } from "./RelationshipDeepAnalysis/components/DeepAnalysisHero";
import { MoodBackground } from "./RelationshipDeepAnalysis/components/MoodBackground";
import { InsightsPanel } from "./RelationshipDeepAnalysis/components/InsightsPanel";
import { RelationshipWarningBanner } from "./RelationshipDeepAnalysis/components/RelationshipWarningBanner";
import { SharedScenesPanel } from "./RelationshipDeepAnalysis/components/SharedScenesPanel";
import { RelationshipTimelineGraph } from "./RelationshipDeepAnalysis/components/RelationshipTimelineGraph";
import { RelationshipCommentList } from "@/components/character-comment/RelationshipCommentList";
import { cn } from "@/lib/utils";

interface RelationshipDetailOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    sourceNode: CharacterNode;
    targetNode: CharacterNode;
    relationId?: string;
    chapterId?: string;
    link?: RelationshipLink;
}

// --- Mock Data Generator (Temporary) ---
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

export function RelationshipDetailOverlay({
    isOpen,
    onClose,
    sourceNode,
    targetNode,
    relationId,
    chapterId,
    link,
}: RelationshipDetailOverlayProps) {
    const [activeTab, setActiveTab] = useState<"analysis" | "comments">("analysis");
    const [isFullscreen, setIsFullscreen] = useState(false);

    const data = useMemo(
        () => generateMockAnalysisData(sourceNode, targetNode),
        [sourceNode, targetNode],
    );

    useEffect(() => {
        if (isOpen) setActiveTab("analysis");
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className={cn(
                        "absolute inset-4 z-[100] overflow-hidden bg-cloud-50/95 backdrop-blur-xl border border-mocha-100/50 shadow-[0_24px_64px_rgba(60,40,30,0.2)] rounded-3xl flex flex-col isolate",
                        isFullscreen && "inset-0 rounded-none z-[110]"
                    )}
                >
                    <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                        <MoodBackground
                            type={data.relationshipTypes}
                            className="w-full h-full"
                        />
                    </div>

                    {/* Header */}
                    <div className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-mocha-100/30 bg-white/40 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Network className="w-5 h-5 text-mocha-600" />
                                <h2 className="text-lg font-bold text-espresso-900 font-serif tracking-tight">
                                    Relationship Insight
                                </h2>
                            </div>
                            <Separator orientation="vertical" className="h-4 bg-mocha-200" />
                            <div className="flex items-center gap-2 text-sm text-espresso-600">
                                <span className="font-semibold">{sourceNode.name}</span>
                                <span className="text-mocha-400">↔</span>
                                <span className="font-semibold">{targetNode.name}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-mocha-500 hover:text-mocha-900 hover:bg-white/50 rounded-full"
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
                                className="h-8 w-8 text-mocha-500 hover:text-mocha-900 hover:bg-white/50 rounded-full"
                                onClick={onClose}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <Tabs
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as any)}
                        className="flex-1 flex flex-col min-h-0 relative z-10"
                    >
                        <div className="px-6 pt-2 border-b border-mocha-100/30 bg-white/20 backdrop-blur-sm">
                            <TabsList className="bg-transparent gap-6 p-0 h-auto">
                                <TabsTrigger
                                    value="analysis"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-mocha-900 rounded-none px-2 py-3 text-mocha-500 data-[state=active]:text-mocha-900 font-serif font-bold transition-all text-base"
                                >
                                    관계 분석
                                </TabsTrigger>
                                <TabsTrigger
                                    value="comments"
                                    disabled={!chapterId}
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-mocha-900 rounded-none px-2 py-3 text-mocha-500 data-[state=active]:text-mocha-900 font-serif font-bold transition-all text-base flex items-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    토론/댓글
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent
                            value="analysis"
                            className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden overscroll-contain"
                        >
                            <ScrollArea className="h-full w-full">
                                <div className="p-0 pb-20">
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

                                    <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                                        <div className="lg:col-span-8 flex flex-col gap-6">
                                            {data.warnings && data.warnings.length > 0 && (
                                                <RelationshipWarningBanner warnings={data.warnings} />
                                            )}

                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-6"
                                            >
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-lg font-bold text-espresso-900 font-serif">
                                                        Relationship Timeline
                                                    </h3>
                                                </div>
                                                <RelationshipTimelineGraph
                                                    data={data.timeline}
                                                    height={300}
                                                    animationDelay={0.5}
                                                />
                                            </motion.div>
                                        </div>

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

                        <TabsContent
                            value="comments"
                            className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden bg-white/50 overscroll-contain"
                        >
                            <div className="h-full w-full max-w-4xl mx-auto p-6">
                                {chapterId && link ? (
                                    <RelationshipCommentList
                                        chapterId={chapterId}
                                        link={link as any}
                                        relationId={relationId}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-mocha-400">
                                        <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                                        <p>댓글을 불러올 수 없습니다. (Chapter ID missing)</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
