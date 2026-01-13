import {
  X,
  Users,
  BookOpen,
  User,
  Heart,
  Skull,
  Network,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Character, RelationshipLink, UIRelationType } from "@/types";
import {
  RELATION_LABELS,
  ROLE_LABELS,
} from "@/components/CharacterGraph/constants";
import { cn } from "@/lib/utils";

// 관계 타입별 색상 클래스
const RELATION_BADGE_COLORS: Record<UIRelationType, string> = {
  friendly: "bg-sage-100 text-sage-700 border-sage-200",
  hostile: "bg-status-error/10 text-status-error border-status-error/20",
  romantic: "bg-mocha-100 text-mocha-700 border-mocha-200",
  family: "bg-stone-100 text-stone-600 border-stone-200",
  neutral: "bg-stone-100 text-stone-400 border-stone-200",
  complex: "bg-mocha-50 text-mocha-500 border-mocha-100",
};

// 관계 타입별 아이콘
const RELATION_ICONS: Record<UIRelationType, React.ReactNode> = {
  friendly: <User className="w-3 h-3" />,
  hostile: <Skull className="w-3 h-3" />,
  romantic: <Heart className="w-3 h-3" />,
  family: <Users className="w-3 h-3" />,
  neutral: <User className="w-3 h-3 opacity-50" />,
  complex: <Network className="w-3 h-3" />,
};

// 역할별 색상
const ROLE_COLORS: Record<string, string> = {
  protagonist: "bg-mocha-500 text-white border-mocha-600",
  antagonist: "bg-status-error text-white border-status-error",
  mentor: "bg-amber-500 text-white border-amber-600",
  sidekick: "bg-sage-500 text-white border-sage-600",
  supporting: "bg-mocha-200 text-mocha-800 border-mocha-300",
  other: "bg-mocha-100 text-mocha-600 border-mocha-200",
};

interface NetworkDetailPanelProps {
  selectedCharacter: Character | null;
  characters: Character[];
  links: RelationshipLink[];
  onClose: () => void;
  onViewProfile?: () => void;
  onNodeClick?: (nodeId: string) => void;
}

export function NetworkDetailPanel({
  selectedCharacter,
  characters,
  links,
  onClose,
  onViewProfile,
  onNodeClick,
}: NetworkDetailPanelProps) {
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
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute right-4 top-4 bottom-4 w-80 z-10 bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden flex flex-col shadow-paper-floating border border-mocha-100 font-body"
    >
      {/* Editorial Header */}
      <div className="p-6 bg-gradient-to-br from-mocha-50 to-cloud-50 border-b border-mocha-100/50">
        <div className="flex items-start justify-between mb-5">
          <Badge
            variant="outline"
            className={cn("text-xs font-medium px-2.5 py-0.5", roleColor)}
          >
            {roleLabel}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-mocha-400 hover:text-mocha-600 hover:bg-mocha-100/50 -mr-2 -mt-2 rounded-full transition-all"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* Profile Image - Larger */}
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-3xl border-2 border-white shadow-paper overflow-hidden shrink-0">
            {selectedCharacter.imageUrl ? (
              <img
                src={selectedCharacter.imageUrl}
                alt={selectedCharacter.profile?.name || ""}
                className="w-full h-full object-cover"
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
            <h3 className="font-display font-bold text-xl truncate text-mocha-900 leading-tight">
              {selectedCharacter.profile?.name || "이름 없음"}
            </h3>
            {selectedCharacter.profile?.faction?.name && (
              <p className="font-serif italic text-xs text-mocha-500 mt-1">
                {selectedCharacter.profile.faction.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats with Icons & Gradient */}
      <div className="px-5 py-4 border-b border-mocha-50 bg-white/30">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-white/50 rounded-xl group hover:shadow-paper transition-all border border-mocha-100/50">
            <div className="flex items-center gap-2 mb-2">
              <Network className="h-4 w-4 text-mocha-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-mocha-400">관계</span>
            </div>
            <div className="text-2xl font-display font-bold text-mocha-900">
              {connectedLinks.length}
            </div>
          </div>
          <div className="p-4 bg-white/50 rounded-xl group hover:shadow-paper transition-all border border-mocha-100/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-mocha-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-mocha-400">등장</span>
            </div>
            <div className="text-2xl font-display font-bold text-mocha-900">
              -
            </div>
          </div>
        </div>
      </div>

      {/* Connected Characters */}
      <ScrollArea className="flex-1 bg-white/10">
        <div className="p-5">
          <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] mb-4 text-mocha-400">
            <Users className="h-3.5 w-3.5" />
            연결된 인물
          </h4>

          {connectedLinks.length > 0 ? (
            <ul className="space-y-3">
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
                  <motion.li
                    key={link.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-3 hover:bg-mocha-50 rounded-xl cursor-pointer group transition-all duration-300 bg-white border border-mocha-100/50 shadow-paper hover:shadow-paper-hover"
                    onClick={() => onNodeClick?.(otherId)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-mocha-50 flex items-center justify-center text-lg border border-mocha-100/30 shadow-sm overflow-hidden group-hover:shadow-md transition-shadow shrink-0">
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
                      <div className="font-bold text-sm text-mocha-900 truncate group-hover:text-mocha-500 transition-colors">
                        {otherChar?.profile?.name || "이름 없음"}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-1.5 text-[10px] px-2 py-0.5 h-5 gap-1 rounded-full font-medium",
                          RELATION_BADGE_COLORS[relType]
                        )}
                      >
                        {RELATION_ICONS[relType]}
                        {RELATION_LABELS[relType]}
                      </Badge>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          ) : (
            <div className="py-12 text-center">
              <Users className="h-8 w-8 text-mocha-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-mocha-400">
                연결된 인물 없음
              </p>
              <p className="text-xs text-mocha-300 mt-1 font-serif italic">
                이 캐릭터와 연결된 관계가 없습니다.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 bg-mocha-50/50 border-t border-mocha-100/50">
        <Button
          variant="default"
          className="w-full bg-mocha-500 hover:bg-mocha-600 text-white font-bold shadow-paper-hover hover:shadow-paper-floating transition-all h-11 rounded-xl"
          onClick={onViewProfile}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          상세 프로필 보기
        </Button>
      </div>
    </motion.div>
  );
}
