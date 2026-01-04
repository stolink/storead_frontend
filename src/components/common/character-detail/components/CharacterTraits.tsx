import { Heart, Sparkles } from "lucide-react";

interface CharacterTraitsProps {
  traits: string[];
}

export function CharacterTraits({ traits }: CharacterTraitsProps) {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-serif font-bold text-stone-800 border-b border-stone-200 pb-2">
        <Heart className="h-4 w-4 text-rose-500/70" />
        성격 특성
      </h3>

      {traits.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {traits.map((trait, idx) => (
            <span
              key={idx}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-full text-sm text-stone-700 shadow-sm hover:border-rose-200 hover:text-rose-700 hover:bg-rose-50 transition-all font-medium"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <Sparkles className="h-3 w-3 text-rose-300" />
              {trait}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-200">
          <Heart className="h-8 w-8 mb-2 opacity-20" />
          <p className="text-sm font-medium">성격 특성 없음</p>
          <p className="text-xs opacity-70 mt-1">
            등록된 성격 특성이 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
