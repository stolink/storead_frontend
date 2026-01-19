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
      <div className="flex flex-col items-center justify-center py-12 text-center bg-transparent border-t border-stone-200/50 mt-4 pt-8">
        <Palette className="h-10 w-10 text-stone-200 mb-2" />
        <p className="text-sm font-bold text-stone-500">외모 정보 없음</p>
        <p className="text-xs text-stone-400 mt-1">
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
    if (typeof value === "object" && value !== null && "artStyle" in value) {
      return (value as any).artStyle || "";
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
      <div className="flex flex-col items-center justify-center py-12 text-center bg-transparent border-t border-mocha-100/50 mt-4 pt-8">
        <Palette className="h-10 w-10 text-mocha-200 mb-2" />
        <p className="text-sm font-bold text-mocha-400">외모 정보 없음</p>
        <p className="text-xs text-mocha-300 mt-1">
          캐릭터의 외모 정보가 아직 입력되지 않았습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        {visualEntries.map(({ key, label, icon, value }) => (
          <div
            key={key}
            className="group flex items-center justify-between p-3 rounded-2xl bg-mocha-50/50 border border-mocha-100/60 shadow-sm hover:bg-white/60 hover:border-mocha-200 hover:scale-[1.02] hover:shadow-md transition-all duration-300 cursor-default backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-lg drop-shadow-sm grayscale-[0.2] group-hover:grayscale-0 transition-all">
                {icon}
              </span>
              <span className="text-sm font-medium text-mocha-400 group-hover:text-mocha-700 transition-colors">
                {label}
              </span>
            </div>

            <p className="text-sm font-bold text-espresso-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[50%] text-right group-hover:text-black">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
