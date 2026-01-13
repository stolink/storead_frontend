import { Palette } from "lucide-react";
import type { CharacterAppearance } from "@/types/character";

interface CharacterVisualProps {
  appearance: CharacterAppearance | undefined;
}

const visualFieldConfig: { key: keyof CharacterAppearance; label: string; icon: string }[] = [
  { key: "physique", label: "체격", icon: "💪" },
  { key: "skinTone", label: "피부톤", icon: "✨" },
  { key: "hairStyle", label: "헤어 스타일", icon: "💇" },
  { key: "hairColor", label: "헤어 컬러", icon: "🎨" },
  { key: "eyes", label: "눈", icon: "👁️" },
  { key: "nose", label: "코", icon: "👃" },
  { key: "mouth", label: "입", icon: "👄" },
  { key: "expression", label: "표정", icon: "🎭" },
];

export function CharacterVisual({
  appearance,
}: CharacterVisualProps) {
  // Guard clause for empty/blank values
  const hasVisualData = appearance && visualFieldConfig.some(config => {
    const value = appearance[config.key];
    return Array.isArray(value) ? value.length > 0 : !!value;
  });

  if (!appearance || !hasVisualData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-transparent border-t border-stone-200/50 mt-4 pt-8">
        <Palette className="h-10 w-10 text-stone-200 mb-2" />
        <p className="text-sm font-bold text-stone-500">외모 정보 없음</p>
        <p className="text-xs text-stone-400 mt-1">
          캐릭터의 외모 정보가 아직 입력되지 않았습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-stone-200/50 pb-4">
        <Palette className="h-4 w-4 text-mocha-400" />
        <h3 className="text-sm font-bold text-stone-900/80 uppercase tracking-widest font-heading">
          외모 특징
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visualFieldConfig.map(({ key, label, icon }, idx) => {
          const value = appearance[key];

          // Handle arrays and objects safely
          let displayValue = "";
          if (Array.isArray(value)) {
            displayValue = value.join(", ");
          } else if (typeof value === "string") {
            displayValue = value;
          }

          if (!displayValue) return null;

          return (
            <div key={`${key}-${idx}`} className="p-3 rounded-xl border border-dashed border-espresso-900/10 bg-white flex flex-col gap-1 shadow-sm transition-all">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{icon}</span>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-tighter">{label}</span>
              </div>
              <p className="text-xs font-bold text-white/90 truncate">
                {displayValue}
              </p>
            </div>
          );
        })}
      </div>

      {/* attire and scarsTattoos as special tags */}
      {([...(appearance.attire || []), ...(appearance.scarsTattoos || [])].length > 0) && (
        <div className="pt-4 border-t border-stone-200/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sx text-stone-400">🧥</span>
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">의상 및 특징</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[...(appearance.attire || []), ...(appearance.scarsTattoos || [])].map(
              (item, i) => (
                <span
                  key={`appearance-tag-${item}-${i}`}
                  className="px-3 py-1.5 rounded-full bg-black/20 text-white/70 text-[11px] font-bold border border-white/5"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
