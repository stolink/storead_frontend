import {
  Sparkles,
  Zap,
  Target,
  Shield,
  AlertTriangle,
  Compass,
} from "lucide-react";
import type { Character } from "@/types/character";

interface CharacterAdditionalDetailsProps {
  character: Character;
}

const entryConfig = {
  strengths: {
    label: "강점",
    icon: Zap,
    colorClass: "bg-amber-50 border-amber-100 text-amber-900",
  },
  flaws: {
    label: "약점",
    icon: AlertTriangle,
    colorClass: "bg-red-50 border-red-100 text-red-900",
  },
  values: {
    label: "가치관",
    icon: Compass,
    colorClass: "bg-sky-50 border-sky-100 text-sky-900",
  },
};

export function CharacterAdditionalDetails({
  character,
}: CharacterAdditionalDetailsProps) {
  const personality = character.personality;

  if (!personality) return null;

  const entries: {
    key: string;
    label: string;
    value: string[];
    icon: typeof Zap;
    colorClass: string;
  }[] = [];

  if (personality.strengths && personality.strengths.length > 0) {
    entries.push({
      key: "strengths",
      ...entryConfig.strengths,
      value: personality.strengths,
    });
  }

  if (personality.flaws?.length > 0) {
    entries.push({
      key: "flaws",
      ...entryConfig.flaws,
      value: personality.flaws,
    });
  }

  if (personality.values?.length > 0) {
    entries.push({
      key: "values",
      ...entryConfig.values,
      value: personality.values,
    });
  }

  const hasMotivation = character.motivation;
  const hasMood =
    character.currentMood &&
    (character.currentMood.emotion || character.currentMood.trigger);

  if (entries.length === 0 && !hasMotivation && !hasMood) return null;

  return (
    <div className="space-y-6 pt-6 border-t border-stone-100">
      <h3 className="flex items-center gap-2 text-lg font-serif font-bold text-stone-800 border-b border-stone-200 pb-2">
        <Sparkles className="h-4 w-4 text-rose-500/70" />
        추가 정보
      </h3>

      {/* Motivation Section - Pull Quote Style */}
      {hasMotivation && (
        <div className="relative pl-6 py-2 border-l-4 border-rose-200 bg-rose-50/30 rounded-r-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-rose-500" />
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              동기
            </span>
          </div>
          <p className="text-base leading-relaxed font-serif text-stone-800 italic">
            "{character.motivation}"
          </p>
        </div>
      )}

      {/* Current Mood Section */}
      {hasMood && (
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-rose-500/70" />
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                현재 상태
              </span>
            </div>
            {character.currentMood!.intensity > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                강도 {character.currentMood!.intensity}/5
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {character.currentMood!.emotion && (
              <p className="text-lg font-semibold text-stone-900 font-serif">
                {character.currentMood!.emotion}
              </p>
            )}
            {character.currentMood!.trigger && (
              <p className="text-sm text-stone-500">
                <span className="text-stone-400">원인:</span>{" "}
                {character.currentMood!.trigger}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Personality Traits Grid - Color Bar Indicators */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {entries.map(({ key, label, value, icon: Icon, colorClass }) => (
            <div
              key={key}
              className={`p-4 rounded-xl border shadow-sm ${colorClass}`}
            >
              <div className="flex items-center gap-2 mb-3 opacity-80">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {label}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {value.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-sm font-medium after:content-[','] last:after:content-[''] after:opacity-50"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
