import { Users, User, ChevronRight } from "lucide-react";

interface Relationship {
  name: string;
  relation: string;
}

interface CharacterRelationshipsProps {
  relationships: Relationship[];
}

// 관계 유형에 따른 색상 클래스 결정
const getRelationshipClass = (relation: string): string => {
  const lowerRelation = relation.toLowerCase();
  if (
    lowerRelation.includes("적") ||
    lowerRelation.includes("hostile") ||
    lowerRelation.includes("enemy")
  ) {
    return "bg-rose-50 border-rose-100 text-rose-900";
  }
  if (
    lowerRelation.includes("연인") ||
    lowerRelation.includes("romantic") ||
    lowerRelation.includes("love")
  ) {
    return "bg-pink-50 border-pink-100 text-pink-900";
  }
  if (
    lowerRelation.includes("친구") ||
    lowerRelation.includes("동료") ||
    lowerRelation.includes("friendly") ||
    lowerRelation.includes("ally")
  ) {
    return "bg-blue-50 border-blue-100 text-blue-900";
  }
  return "bg-white border-stone-100 text-stone-900";
};

export function CharacterRelationships({
  relationships,
}: CharacterRelationshipsProps) {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-serif font-bold text-stone-800 border-b border-stone-200 pb-2">
        <Users className="h-4 w-4 text-rose-500/70" />
        인물 관계
      </h3>

      {relationships.length > 0 ? (
        <div className="space-y-2">
          {relationships.map((rel, idx) => {
            const relationClass = getRelationshipClass(rel.relation);
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border shadow-sm flex items-center gap-4 transition-all hover:shadow-md cursor-default ${relationClass}`}
                style={{
                  animationDelay: `${idx * 50}ms`,
                }}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm border border-black/5 flex items-center justify-center text-stone-400 shrink-0">
                  <User className="h-5 w-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold transition-colors">
                    {rel.name}
                  </p>
                  {rel.relation && (
                    <p className="text-xs opacity-70 mt-0.5 font-medium">
                      {rel.relation}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRight className="h-4 w-4 opacity-30 shrink-0" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-200">
          <Users className="h-8 w-8 mb-2 opacity-20" />
          <p className="text-sm font-medium">관계 정보 없음</p>
          <p className="text-xs opacity-70 mt-1">
            이 캐릭터의 관계 정보가 아직 설정되지 않았습니다.
          </p>
        </div>
      )}
    </div>
  );
}
