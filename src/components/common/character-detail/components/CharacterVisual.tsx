import { Palette } from "lucide-react";
import type { CharacterAppearance } from "@/types/character";

interface CharacterVisualProps {
  appearance: CharacterAppearance | undefined;
}

const visualFieldConfig: {
  key: keyof CharacterAppearance;
  label: string;
  icon: string;
}[] = [
  { key: "physique", label: "체격", icon: "💪" },
  { key: "skinTone", label: "피부", icon: "✨" },
  { key: "eyes", label: "눈", icon: "👁️" },
  { key: "nose", label: "코", icon: "👃" },
  { key: "mouth", label: "입", icon: "👄" },
  { key: "hairStyle", label: "헤어스타일", icon: "💇" },
  { key: "hairColor", label: "머리색", icon: "🎨" },
  { key: "attire", label: "의상", icon: "👔" },
  { key: "expression", label: "표정", icon: "😊" },
  { key: "scarsTattoos", label: "특징", icon: "⭐" },
];

export function CharacterVisual({ appearance }: CharacterVisualProps) {
  if (!appearance) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-200">
        <Palette className="h-8 w-8 mb-2 opacity-20" />
        <p className="text-sm font-medium">외모 정보 없음</p>
        <p className="text-xs opacity-70 mt-1">
          캐릭터의 외모 정보가 아직 입력되지 않았습니다.
        </p>
      </div>
    );
  }

  const getFieldValue = (key: keyof CharacterAppearance): string => {
    const value = appearance[key];
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "object" && value !== null) {
      // Handle styleContext: { artStyle: string }
      if ("artStyle" in value) {
        return (value as { artStyle: string }).artStyle || "";
      }
      return JSON.stringify(value);
    }
    return (value as string) || "";
  };

  const visualEntries = visualFieldConfig
    .map(({ key, label, icon }) => ({
      key,
      label,
      icon,
      value: getFieldValue(key),
    }))
    .filter((entry) => entry.value);

  if (visualEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-200">
        <Palette className="h-8 w-8 mb-2 opacity-20" />
        <p className="text-sm font-medium">외모 정보 없음</p>
        <p className="text-xs opacity-70 mt-1">
          캐릭터의 외모 정보가 아직 입력되지 않았습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-serif font-bold text-stone-800 border-b border-stone-200 pb-2">
        <Palette className="h-4 w-4 text-rose-500/70" />
        외모
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {visualEntries.map(({ key, label, icon, value }) => (
          <div
            key={key}
            className="bg-white p-3 rounded-lg border border-stone-200 shadow-sm hover:shadow-md hover:border-rose-100 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm opacity-70 group-hover:opacity-100 transition-opacity">
                {icon}
              </span>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                {label}
              </span>
            </div>
            <p className="text-sm font-medium text-stone-800 leading-snug break-keep">
              {value || "-"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
