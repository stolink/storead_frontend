// =====================================================
// 🧠 Relationship Deep Analysis Modal (Main Container)
// 관계 심층 분석 + 댓글(토론) 통합 모달
// =====================================================

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import type { CharacterNode, RelationshipLink } from "@/types/characterGraph";
import type { GraphSnapshotDTO } from "@/adapters/graphSnapshotAdapter";

// Hooks
import { useRelationshipAnalysis } from "@/hooks/useRelationshipAnalysis";

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
    /** graphSnapshot (stolink에서 전달된 심층 분석 데이터 포함) */
    graphSnapshot?: GraphSnapshotDTO | null;
}

export function RelationshipDeepAnalysisModal({
    isOpen,
    onClose,
    sourceNode,
    targetNode,
    chapterId,
    link,
    graphSnapshot,
}: RelationshipDeepAnalysisModalProps) {
    const [activeTab, setActiveTab] = useState<"analysis" | "comments">("analysis");
    const [isFullscreen, setIsFullscreen] = useState(false);

    // [LOADING] Simulated loading state for polished UI transition
    const [isInternalLoading, setIsInternalLoading] = useState(true);
    const [loadingStep, setLoadingStep] = useState(1);

    // [REFACTOR] graphSnapshot에서 stolink 심층 분석 데이터 조회
    const { data } = useRelationshipAnalysis(sourceNode, targetNode, graphSnapshot);

    // Loading simulation effect
    useEffect(() => {
        if (!isOpen) {
            setIsInternalLoading(true);
            setLoadingStep(1);
            return;
        }

        setIsInternalLoading(true);
        setLoadingStep(1);

        const step2Timer = setTimeout(() => setLoadingStep(2), 700);
        const step3Timer = setTimeout(() => setLoadingStep(3), 1400);
        const finishTimer = setTimeout(() => setIsInternalLoading(false), 2200);

        return () => {
            clearTimeout(step2Timer);
            clearTimeout(step3Timer);
            clearTimeout(finishTimer);
        };
    }, [isOpen]);

    // [FIX] early return 제거: 분석 데이터가 없더라도 모달 프레임은 열려야 함 (댓글 등 이용 가능)
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
                {/* Loading Overlay */}
                <AnimatePresence>
                    {isInternalLoading && (
                        <motion.div
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#FDFBF7] backdrop-blur-md"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                    rotate: [0, 10, -10, 0],
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="mb-6 p-5 bg-white rounded-3xl shadow-xl border border-mocha-100/50"
                            >
                                <Network className="w-12 h-12 text-mocha-500" />
                            </motion.div>

                            <div className="text-center space-y-3">
                                <h3 className="text-xl font-bold text-espresso-900 font-serif">
                                    관계를 심층 분석하고 있습니다
                                </h3>
                                <div className="h-6 overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={loadingStep}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-mocha-500 font-medium font-serif italic"
                                        >
                                            {loadingStep === 1 && "캐릭터 간의 서사 데이터를 수집 중..."}
                                            {loadingStep === 2 && "감정 궤적과 주요 사건을 재구성 중..."}
                                            {loadingStep === 3 && "심층 인사이트를 도출하는 중..."}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Minimal progress bar */}
                            <div className="mt-8 w-48 h-1 bg-mocha-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-mocha-500"
                                    initial={{ width: "0%" }}
                                    animate={{ 
                                        width: loadingStep === 1 ? "30%" : loadingStep === 2 ? "65%" : "100%" 
                                    }}
                                    transition={{ duration: 0.8 }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                    {data && (
                        <MoodBackground
                            type={data.relationshipTypes}
                            className="w-full h-full"
                        />
                    )}
                </div>

                {/* Header (Toolbar) */}
                <div className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-black/5 bg-white/40 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Network className="w-5 h-5 text-espresso-600" />
                            <DialogTitle className="text-lg font-bold text-espresso-900 font-serif tracking-tight">
                                Deep Analysis
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                캐릭터 간의 심층 관계 분석 및 감정 변화를 시각화합니다.
                            </DialogDescription>
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
                    key={isOpen ? "open" : "closed"}
                    defaultValue="analysis"
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as "analysis" | "comments")}
                    className="flex-1 flex flex-col min-h-0 relative z-10"
                >
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

                    <TabsContent
                        value="analysis"
                        className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden"
                    >
                        {data ? (
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
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-espresso-400 p-12 text-center">
                                <Network className="w-16 h-16 mb-4 opacity-10 animate-pulse text-espresso-300" />
                                <h4 className="text-xl font-bold text-espresso-800 font-serif mb-2">Deep Analysis Unavailable</h4>
                                <p className="max-w-md text-espresso-500/80 leading-relaxed italic">
                                    이 관계에 대한 심층 분석 데이터가 아직 생성되지 않았거나,<br />
                                    단순화된 스냅샷으로 배포된 챕터입니다.<br />
                                    <span className="mt-2 block not-italic font-medium text-mocha-500">대신 '토론' 탭에서 독자들과 의견을 나누어보세요!</span>
                                </p>
                            </div>
                        )}
                    </TabsContent>

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