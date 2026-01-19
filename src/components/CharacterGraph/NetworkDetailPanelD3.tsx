import { motion } from "framer-motion";
import {
  X,
  Users,
  BookOpen,
  User,
  Heart,
  Skull,
  Network,
  TrendingUp,
  Brain,
  Activity,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Character, RelationshipLink } from "@/types";
import { RELATION_LABELS, ROLE_LABELS } from "./constants";
import { cn } from "@/lib/utils";

// 관계 타입별 색상 클래스
const RELATION_BADGE_COLORS: Record<string, string> = {
  friendly: "bg-emerald-500 text-white border-emerald-500",
  hostile: "bg-rose-500 text-white border-rose-500",
  romantic: "bg-pink-400 text-white border-pink-400",
};

// 관계 타입별 아이콘
const RELATION_ICONS: Record<string, React.ReactNode> = {
  friendly: <User className="w-3 h-3" />,
  hostile: <Skull className="w-3 h-3" />,
  romantic: <Heart className="w-3 h-3" />,
};

// 역할별 색상
const ROLE_COLORS: Record<string, string> = {
  protagonist: "bg-primary/10 text-primary border-primary/30",
  antagonist: "bg-rose-50 text-rose-600 border-rose-200",
  mentor: "bg-amber-50 text-amber-600 border-amber-200",
  sidekick: "bg-emerald-50 text-emerald-600 border-emerald-200",
  supporting: "bg-stone-100 text-stone-600 border-stone-200",
  other: "bg-stone-100 text-stone-600 border-stone-200",
};

interface NetworkDetailPanelD3Props {
  selectedCharacter: Character | null;
  characters: Character[];
  links: RelationshipLink[];
  onClose: () => void;
  onViewProfile: () => void;
}

export function NetworkDetailPanelD3({
  selectedCharacter,
  characters,
  links,
  onClose,
  onViewProfile,
}: NetworkDetailPanelD3Props) {
  if (!selectedCharacter) return null;

  // 연결된 링크 찾기
  const connectedLinks = links.filter((link) => {
    const sourceId =
      typeof link.source === "string" ? link.source : link.source.id;
    const targetId =
      typeof link.target === "string" ? link.target : link.target.id;
    return (
      sourceId === selectedCharacter._id || targetId === selectedCharacter._id
    );
  });

  const roleLabel = ROLE_LABELS[selectedCharacter.role || "other"];
  const roleColor = ROLE_COLORS[selectedCharacter.role || "other"];

  return (
    <div className="absolute right-4 top-4 bottom-4 w-80 z-20 bg-paper/95 backdrop-blur-xl border border-mocha-100/50 rounded-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 shadow-paper-floating">
      <div className="p-6 bg-paper/40 border-b border-mocha-100/30">
        <div className="flex items-start justify-between mb-5">
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", roleColor)}
          >
            {roleLabel}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-mocha-400 hover:text-mocha-600 hover:bg-mocha-50 -mr-2 -mt-2 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div
          className="flex items-center gap-4 cursor-pointer group/profile"
          onClick={onViewProfile}
        >
          {/* Profile Image - Larger */}
          <div className="w-20 h-20 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center text-3xl shadow-sm overflow-hidden text-stone-400 group-hover/profile:border-mocha-300 transition-colors">
            {selectedCharacter.imageUrl ? (
              <img
                src={selectedCharacter.imageUrl}
                alt={selectedCharacter.profile?.name || ""}
                className="w-full h-full object-cover group-hover/profile:scale-105 transition-transform"
              />
            ) : selectedCharacter.role === "protagonist" ? (
              "🦸"
            ) : selectedCharacter.role === "antagonist" ? (
              "🦹"
            ) : selectedCharacter.role === "mentor" ? (
              "🧙"
            ) : (
              "👤"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-mocha-900 truncate tracking-tight group-hover/profile:text-mocha-600 transition-colors">
              {selectedCharacter.profile?.name || "이름 없음"}
            </h3>
            {selectedCharacter.profile?.faction?.name && (
              <p className="text-xs italic text-stone-400 mt-1">
                {selectedCharacter.profile.faction.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats with Icons & Gradient */}
      <div className="px-5 py-4 border-b border-mocha-50">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-mocha-50/50 border border-mocha-100 rounded-xl group hover:border-mocha-200 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Network className="h-4 w-4 text-mocha-500" />
              <span className="text-[10px] font-bold text-mocha-400 uppercase tracking-widest">
                관계 인물
              </span>
            </div>
            <div className="text-2xl font-bold text-mocha-900">
              {connectedLinks.length}
            </div>
          </div>
          <div className="p-4 bg-mocha-50/50 border border-mocha-100 rounded-xl group hover:border-mocha-200 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-mocha-500" />
              <span className="text-[10px] font-bold text-mocha-400 uppercase tracking-widest">
                등장 횟수
              </span>
            </div>
            <div className="text-2xl font-bold text-mocha-900">-</div>
          </div>
        </div>
      </div>

      {/* Soul Inspector Section (Premium) */}
      <div className="px-5 py-5 border-b border-mocha-50 space-y-5 bg-mocha-50/30">
        {(() => {
          const profilePersonality = selectedCharacter.profile?.personality;
          const corePersonality = selectedCharacter.personality;

          let traits: string[] = [];
          if (Array.isArray(profilePersonality)) {
            traits = profilePersonality;
          } else if (
            corePersonality &&
            Array.isArray(corePersonality.coreTraits)
          ) {
            traits = corePersonality.coreTraits;
          }

          const mood = selectedCharacter.currentMood;
          const archetypeSelection =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (selectedCharacter as any).archetype || "Unknown";

          return (
            <>
              {/* Mental State & Emotion Glow */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-mocha-400" />
                    심리 상태 (Soul State)
                  </h4>
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold px-2 py-0 h-5 bg-white border-mocha-100"
                  >
                    {archetypeSelection}
                  </Badge>
                </div>

                <div className="relative p-3 rounded-xl border border-mocha-100 bg-white/50 shadow-sm overflow-hidden">
                  {/* Background Mood Color Glow */}
                  <div
                    className={cn(
                      "absolute top-0 right-0 w-16 h-16 blur-2xl opacity-20 transition-all duration-1000",
                      {
                        "bg-emerald-400":
                          !mood?.emotion ||
                          mood.emotion === "Happy" ||
                          mood.emotion === "Calm",
                        "bg-rose-400":
                          mood?.emotion === "Angry" ||
                          mood?.emotion === "Hostile",
                        "bg-blue-400": mood?.emotion === "Sad",
                        "bg-amber-400":
                          mood?.emotion === "Anxious" ||
                          mood?.emotion === "Fear",
                      },
                    )}
                  />

                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-semibold text-mocha-700">
                      {mood?.emotion || "평온함"}
                    </span>
                    <span className="text-[10px] text-mocha-400 font-medium">
                      강도: {mood?.intensity || 5}/10
                    </span>
                  </div>
                  <div className="mt-2 h-1 w-full bg-mocha-50 rounded-full overflow-hidden relative z-10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(mood?.intensity || 5) * 10}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        {
                          "bg-emerald-500":
                            !mood?.emotion ||
                            mood.emotion === "Happy" ||
                            mood.emotion === "Calm",
                          "bg-rose-500":
                            mood?.emotion === "Angry" ||
                            mood?.emotion === "Hostile",
                          "bg-blue-500": mood?.emotion === "Sad",
                          "bg-amber-500":
                            mood?.emotion === "Anxious" ||
                            mood?.emotion === "Fear",
                        },
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Core Traits & Values */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Brain className="w-3 h-3 text-mocha-400" />
                  핵심 기질 & 가치관
                </h4>
                <div className="flex flex-wrap gap-2">
                  {traits.length > 0 ? (
                    traits.slice(0, 6).map((trait: string, i: number) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="px-2.5 py-1 bg-white border border-mocha-100 rounded-lg text-[11px] text-mocha-600 font-medium shadow-sm active:shadow-none transition-shadow"
                      >
                        {trait}
                      </motion.span>
                    ))
                  ) : (
                    <div className="w-full py-4 text-center border border-dashed border-stone-300 rounded-xl">
                      <p className="text-[10px] text-stone-400">
                        학습된 성격 데이터가 없습니다
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Character Motive / Secret (if available) */}
              {selectedCharacter.motivation && (
                <div className="p-3 bg-mocha-50/30 border border-mocha-100 rounded-xl relative overflow-hidden group">
                  <h4 className="text-[9px] font-bold text-mocha-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    행동 동기
                  </h4>
                  <p className="text-xs text-mocha-700 leading-relaxed italic line-clamp-2">
                    "{selectedCharacter.motivation}"
                  </p>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Connected Characters */}
      <ScrollArea className="flex-1">
        <div className="p-5">
          <h4 className="text-xs font-bold text-mocha-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-mocha-400" />
            연결된 인물
          </h4>

          {connectedLinks.length > 0 ? (
            <ul className="space-y-2">
              {connectedLinks.map((link, idx) => {
                const sourceId =
                  typeof link.source === "string"
                    ? link.source
                    : link.source.id;
                const targetId =
                  typeof link.target === "string"
                    ? link.target
                    : link.target.id;
                const otherId =
                  sourceId === selectedCharacter._id ? targetId : sourceId;
                const otherChar = characters.find((c) => c._id === otherId);
                const relType = link.type;

                return (
                  <li
                    key={link.id || idx}
                    className="flex flex-col gap-2 p-3 bg-white/50 border border-mocha-100 rounded-xl hover:shadow-md hover:border-mocha-200 cursor-pointer group transition-all"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mocha-50 to-white flex items-center justify-center text-lg border border-mocha-100 shadow-sm overflow-hidden group-hover:shadow-md transition-shadow">
                        {otherChar?.imageUrl ? (
                          <img
                            src={otherChar.imageUrl}
                            alt={otherChar.profile?.name || ""}
                            className="w-full h-full object-cover"
                          />
                        ) : otherChar?.role === "antagonist" ? (
                          "🦹"
                        ) : otherChar?.role === "mentor" ? (
                          "🧙"
                        ) : (
                          "👤"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-mocha-800 truncate group-hover:text-mocha-600 transition-colors">
                          {otherChar?.profile?.name || "이름 없음"}
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "mt-1.5 text-[10px] px-2 py-0.5 h-5 gap-1 rounded-full",
                            RELATION_BADGE_COLORS[relType] ||
                              "bg-mocha-200 text-mocha-600",
                          )}
                        >
                          {RELATION_ICONS[relType]}
                          {RELATION_LABELS[relType] || relType}
                        </Badge>
                      </div>
                      <div className="text-[10px] font-bold text-mocha-400">
                        {link.strength}/10
                      </div>
                    </div>

                    {/* Strength Bar */}
                    <div className="w-full h-1 bg-mocha-50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(link.strength || 5) * 10}%` }}
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          RELATION_BADGE_COLORS[relType]?.split(" ")[0] ||
                            "bg-mocha-500",
                        )}
                      />
                    </div>

                    {/* Short Summary (if exists) */}
                    {link.description && (
                      <p className="text-[10px] text-mocha-400 line-clamp-1 italic">
                        {link.description}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-8 text-center border border-dashed border-mocha-200 rounded-xl">
              <Users className="h-8 w-8 text-mocha-200 mx-auto mb-2" />
              <p className="text-sm text-mocha-500">연결된 인물 없음</p>
              <p className="text-xs text-mocha-400">
                이 캐릭터와 연결된 관계가 없습니다.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-5 bg-paper/40 border-t border-mocha-100/30 pb-8">
        <Button
          variant="default"
          className="w-full h-12 rounded-xl !bg-mocha-500 hover:!bg-mocha-400 !text-white shadow-paper hover:shadow-paper-floating transition-all duration-300 font-bold flex items-center justify-center gap-2 group"
          onClick={onViewProfile}
        >
          <BookOpen className="h-4 w-4 group-hover:scale-110 transition-transform" />
          상세 프로필 보기
        </Button>
      </div>
    </div>
  );
}
