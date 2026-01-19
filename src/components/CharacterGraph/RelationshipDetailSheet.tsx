import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Clock,
  ArrowLeftRight,
  Heart,
  Skull,
  User,
  Zap,
  Shield,
  Target,
  AlertTriangle,
  MessageSquare,
  Info,
} from "lucide-react";
import type { DetailedRelationship } from "@/types/character";
import type { RelationshipLink } from "@/types/characterGraph";
import { cn } from "@/lib/utils";
import { getRelationshipColor } from "./utils";
import { toUIRelationType, RELATION_LABELS } from "./constants";
import { RelationshipRadarChart } from "./components/RelationshipRadarChart";
import { RelationshipTimelineGraph } from "./components/RelationshipTimelineGraph";
import { DeepAnalysisUI } from "./components/DeepAnalysisUI";
import { RelationshipCommentList } from "../character-comment/RelationshipCommentList";

interface RelationshipDetailSheetProps {
  relationship: DetailedRelationship | null;
  isOpen: boolean;
  onClose: () => void;
  sourceName?: string;
  targetName?: string;
  chapterId?: string;
}

interface RelationshipAttributes {
  emotionalBond: number;
  functionalTrust: number;
  valueAlignment: number;
  interdependence: number;
  latentTension: number;
}

interface HistoryEvent {
  eventId?: string;
  type: string;
  chapter?: string | number;
  date?: string;
  title: string;
  reason?: string;
}

// 관계 타입별 아이콘 (UIRelationType 기준)
const RELATION_ICONS: Partial<
  Record<import("@/types").UIRelationType, React.ReactNode>
> = {
  ally: <User className="w-4 h-4" />,
  enemy: <Skull className="w-4 h-4" />,
  rival: <Target className="w-4 h-4" />,
  romantic: <Heart className="w-4 h-4" />,
  family: <Shield className="w-4 h-4" />,
  mentor: <User className="w-4 h-4" />,
  protects: <Shield className="w-4 h-4" />,
  betrayed: <AlertTriangle className="w-4 h-4" />,
  knows: <User className="w-4 h-4" />,
  neutral: <User className="w-4 h-4" />,
  complex: <Zap className="w-4 h-4" />,
};

export function RelationshipDetailSheet({
  relationship,
  isOpen,
  onClose,
  sourceName,
  targetName,
  chapterId,
}: RelationshipDetailSheetProps) {
  const [isCommentMode, setIsCommentMode] = useState(false);

  if (!relationship) return null;

  const {
    type,
    strength,
    description,
    label: relationLabel,
    evolvedFrom,
    bidirectional,
    since,
    history,
  } = relationship;

  // Use relationship.relationType if available, otherwise fallback to type
  const rawType = relationship.relationType || type;
  const displayType = toUIRelationType(rawType);
  const color = getRelationshipColor(displayType, strength);
  const label = RELATION_LABELS[displayType] || displayType;
  const icon = RELATION_ICONS[displayType] || <Activity className="w-4 h-4" />;

  // Convert DetailedRelationship to RelationshipLink for CommentList
  const linkForComments: RelationshipLink = {
    id: relationship.id || `rel-${relationship.source}-${relationship.target}`,
    source: relationship.source,
    target: relationship.target,
    type: (relationship.relationType || type) as RelationshipLink["type"],
    strength: strength,
    description: description,
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setIsCommentMode(false);
        onClose();
      }}
    >
      <SheetContent className="w-[400px] sm:w-[540px] p-0 border-l border-stone-200 flex flex-col">
        {/* Fixed Header */}
        <SheetHeader className="p-6 pb-2 space-y-4 shrink-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={cn("text-white gap-1.5 px-3 py-1")}
              style={{ backgroundColor: color, borderColor: color }}
            >
              {icon}
              {label}
            </Badge>
            {bidirectional && (
              <Badge
                variant="secondary"
                className="gap-1 bg-stone-100 text-stone-600 hover:bg-stone-200"
              >
                <ArrowLeftRight className="w-3 h-3" />
                상호 관계
              </Badge>
            )}
          </div>

          <SheetTitle className="text-2xl font-serif font-bold text-stone-900 leading-tight">
            <span className="block text-stone-500 text-base font-sans font-medium mb-1">
              Source
            </span>
            {sourceName || "Unknown"}
            <span className="block my-2 text-stone-300 text-sm border-b border-dashed" />
            <span className="block text-stone-500 text-base font-sans font-medium mb-1">
              Target
            </span>
            {targetName || "Unknown"}
          </SheetTitle>
        </SheetHeader>

        {/* Content Area with Toggle */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <div className="flex items-center gap-2 p-1 mx-6 mb-2 bg-stone-100/80 rounded-lg p-1">
            <button
              onClick={() => setIsCommentMode(false)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all",
                !isCommentMode
                  ? "bg-white text-espresso-900 shadow-sm"
                  : "text-stone-400 hover:text-stone-600",
              )}
            >
              <Info className="w-4 h-4" />
              관계 분석
            </button>
            <button
              onClick={() => setIsCommentMode(true)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all",
                isCommentMode
                  ? "bg-white text-espresso-900 shadow-sm"
                  : "text-stone-400 hover:text-stone-600",
              )}
            >
              <MessageSquare className="w-4 h-4" />
              댓글 / 토론
            </button>
          </div>

          <ScrollArea className="flex-1">
            <AnimatePresence mode="wait">
              {!isCommentMode ? (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 space-y-8 pb-20"
                >
                  <Separator />

                  {/* Creating a prominant banner for 'Since' info as requested */}
                  {since && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-center gap-3 shadow-sm">
                      <div className="bg-amber-100 p-2 rounded-full text-amber-700">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">
                          Relationship Started
                        </p>
                        <p className="text-stone-800 font-medium">{since}</p>
                      </div>
                    </div>
                  )}

                  {/* Main Description */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
                      관계 설명
                    </h4>
                    {relationLabel || description ? (
                      <p className="text-stone-800 leading-relaxed whitespace-pre-wrap font-sans text-base">
                        {relationLabel || description}
                      </p>
                    ) : (
                      <p className="text-stone-400 italic text-sm">
                        관계에 대한 설명이 없습니다.
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Relationship Dynamics (Radar Chart) */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      관계 다이내믹 분석
                    </h4>
                    <div className="flex justify-center bg-stone-50/50 rounded-2xl py-4 border border-stone-100">
                      <RelationshipRadarChart
                        attributes={
                          (
                            relationship as unknown as {
                              attributes: RelationshipAttributes;
                            }
                          ).attributes || {
                            emotionalBond: Math.min(10, strength + 1),
                            functionalTrust: Math.min(10, strength),
                            valueAlignment: Math.min(
                              10,
                              Math.max(0, 10 - strength),
                            ),
                            interdependence: Math.min(10, strength - 1),
                            latentTension:
                              (relationship as unknown as { tension: number })
                                .tension || 2,
                          }
                        }
                        size={240}
                        color={
                          displayType === "romantic"
                            ? "rose"
                            : displayType === "enemy" ||
                                displayType === "rival" ||
                                displayType === "betrayed"
                              ? "teal"
                              : "mocha"
                        }
                      />
                    </div>
                  </div>

                  {/* Narrative Bond (Timeline Graph) */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      나레이티브 본드 추이
                    </h4>
                    <div className="bg-stone-50/50 rounded-2xl p-4 border border-stone-100">
                      <RelationshipTimelineGraph
                        data={
                          (
                            relationship as unknown as {
                              timeline: import("./components/RelationshipTimelineGraph").RelationshipTimelinePoint[];
                            }
                          ).timeline || []
                        }
                        height={140}
                      />
                    </div>
                  </div>

                  {/* Deep Discovery Analysis UI */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-2 font-heading">
                      <Target className="w-4 h-4" />
                      심층 관계 분석
                    </h4>
                    <DeepAnalysisUI
                      affinityDepth={Math.min(100, (strength || 0) * 10 + 20)}
                      stability={70 + ((strength || 0) > 5 ? 10 : -10)}
                      factors={[
                        {
                          label: "정서적 공감",
                          value: 85,
                          icon: Heart,
                          color: "bg-rose-50 text-rose-600",
                        },
                        {
                          label: "기능적 협력",
                          value: 60,
                          icon: Shield,
                          color: "bg-sage-50 text-sage-600",
                        },
                        {
                          label: "가치관 충돌",
                          value: 20,
                          icon: AlertTriangle,
                          color: "bg-amber-50 text-amber-600",
                        },
                        {
                          label: "운명적 결단",
                          value: 45,
                          icon: Zap,
                          color: "bg-mocha-50 text-mocha-600",
                        },
                      ]}
                    />
                  </div>

                  <Separator />

                  {/* Strength Gauge */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
                        관계 강도
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400">Low</span>
                        <span className="text-lg font-bold text-mocha-500">
                          {strength} / 10
                        </span>
                        <span className="text-xs text-stone-400">High</span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={cn("h-full transition-all duration-500")}
                        style={{
                          width: `${(strength / 10) * 100}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Relationship History Timeline */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      관계 변천사
                    </h4>
                    {history && Array.isArray(history) && history.length > 0 ? (
                      <div className="relative pl-4 space-y-6 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-200">
                        {(history as HistoryEvent[]).map((event, idx) => {
                          const eventColorHex = getRelationshipColor(
                            toUIRelationType(event.type),
                            5,
                          ); // Default strength

                          return (
                            <div
                              key={event.eventId || idx}
                              className="relative"
                            >
                              {/* Timeline Dot */}
                              <div
                                className={cn(
                                  "absolute -left-[13px] top-1.5 w-3 h-3 rounded-full border-2 border-white ring-1 ring-stone-200",
                                )}
                                style={{ backgroundColor: eventColorHex }}
                              />

                              <div className="bg-white p-3 rounded-lg border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                                    {event.chapter || "Legacy Info"}
                                  </span>
                                  {event.date && (
                                    <span className="text-[10px] text-stone-400">
                                      {event.date}
                                    </span>
                                  )}
                                </div>
                                <h5 className="font-semibold text-stone-800 text-sm mb-1">
                                  {event.title}
                                </h5>
                                {event.reason && (
                                  <p className="text-xs text-stone-600 leading-relaxed">
                                    {event.reason}
                                  </p>
                                )}
                                <div className="mt-2 flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 h-5"
                                    style={{ borderColor: "currentColor" }}
                                  >
                                    {RELATION_LABELS[
                                      toUIRelationType(event.type)
                                    ] || event.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-stone-400 italic">
                        관계 변천사가 아직 기록되지 않았습니다.
                      </p>
                    )}
                  </div>

                  {/* Legacy Evolution History (Fallback) */}
                  {evolvedFrom && (
                    <div className="p-4 bg-stone-50 rounded-lg border border-stone-100 space-y-2">
                      <div className="flex items-center gap-2 text-stone-500 mb-2">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm font-medium">이전 관계</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="text-stone-500 bg-white"
                        >
                          {RELATION_LABELS[toUIRelationType(evolvedFrom)] ||
                            evolvedFrom}
                        </Badge>
                        <span className="text-stone-400">→</span>
                        <Badge
                          className={cn("text-white hover:opacity-90")}
                          style={{ backgroundColor: color }}
                        >
                          {label}
                        </Badge>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="comments"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {chapterId ? (
                    <RelationshipCommentList
                      chapterId={chapterId}
                      link={linkForComments}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-stone-400 text-sm">
                      챕터 정보가 없어 댓글을 불러올 수 없습니다.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>

          {/* Fixed Bottom Action for Toggle - removed in favor of top toggle */}
        </div>
      </SheetContent>
    </Sheet>
  );
}
