import { useMemo } from "react";
import { Users, User, Heart, Swords, Handshake, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface RelationshipUI {
  name: string;
  relation: string;
  type: string;
}

interface CharacterRelationshipsProps {
  relationships: RelationshipUI[];
}

// Section Config
const SECTIONS = [
  {
    id: "romantic",
    title: "연인 & 사랑",
    icon: Heart,
    color: "text-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-100",
    matcher: (type: string) => type === "romantic" || type.includes("love") || type.includes("애정"),
  },
  {
    id: "friendly",
    title: "동료 & 우호",
    icon: Handshake,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    matcher: (type: string) =>
      type === "friendly" ||
      type.includes("ally") ||
      type.includes("friend") ||
      type === "trust" ||
      type.includes("우호"),
  },
  {
    id: "hostile",
    title: "적대 & 경쟁",
    icon: Swords,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
    matcher: (type: string) =>
      type === "hostile" || type.includes("enemy") || type.includes("rival") || type.includes("적대"),
  },
  {
    id: "others",
    title: "기타 관계",
    icon: Users,
    color: "text-stone-500",
    bg: "bg-stone-100",
    border: "border-stone-200",
    matcher: () => true, // Fallback
  },
];

export function CharacterRelationships({
  relationships,
}: CharacterRelationshipsProps) {
  // Group relationships by logic
  const grouped = useMemo(() => {
    const groups: Record<string, RelationshipUI[]> = {
      romantic: [],
      friendly: [],
      hostile: [],
      others: [],
    };

    relationships.forEach((rel) => {
      const type = (rel.type || "").toLowerCase();
      if (SECTIONS[0].matcher(type)) groups.romantic.push(rel);
      else if (SECTIONS[1].matcher(type)) groups.friendly.push(rel);
      else if (SECTIONS[2].matcher(type)) groups.hostile.push(rel);
      else groups.others.push(rel);
    });

    return groups;
  }, [relationships]);

  const isEmpty = relationships.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-stone-100 rounded-3xl">
        <Users className="w-12 h-12 text-stone-200 mb-4" />
        <h3 className="text-lg font-bold text-stone-900">관계 정보 없음</h3>
        <p className="text-sm text-stone-500 mt-1">
          아직 기록된 인물 관계가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-10">
      {/* Introduction Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-stone-50 via-white to-stone-50 border border-stone-100 shadow-sm">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-xl ring-1 ring-stone-900/5">
            <Gem className="w-6 h-6 text-mocha-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">인물 관계도</h2>
            <p className="text-sm text-stone-500 mt-1">
              이 캐릭터를 둘러싼 주요 인물들과의 실시간 관계입니다.
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-mocha-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      {SECTIONS.map((section) => {
        const items = grouped[section.id];
        if (items.length === 0) return null;

        const SectionIcon = section.icon;

        return (
          <div
            key={section.id}
            className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 px-1">
              <span
                className={cn(
                  "p-2 rounded-xl",
                  section.bg
                )}
              >
                <SectionIcon className={cn("w-4 h-4", section.color)} />
              </span>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em]">
                {section.title}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                {items.length}
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((rel, idx) => (
                <div
                  key={`${rel.name}-${idx}`}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl p-5 transition-all duration-300",
                    "bg-white hover:bg-stone-50 border border-stone-100 hover:border-mocha-200",
                    "shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-[0.98]",
                  )}
                >
                  <div className="relative z-10 flex items-start gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner",
                        section.bg,
                        section.color,
                      )}
                    >
                      <User className="w-6 h-6 opacity-70" />
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <h4 className="text-base font-bold text-stone-900 truncate group-hover:text-mocha-700 transition-colors">
                        {rel.name}
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                            section.bg,
                            section.color,
                            section.border,
                          )}
                        >
                          {rel.relation}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
