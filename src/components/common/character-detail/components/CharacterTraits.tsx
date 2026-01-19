import { Heart, Sparkles } from "lucide-react";

interface CharacterTraitsProps {
  traits: string[];
}

export function CharacterTraits({ traits }: CharacterTraitsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
        <Heart className="h-4 w-4 text-mocha-500" />
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest">
          성격 특성
        </h3>
      </div>

      {traits.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {traits.map((trait, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-mocha-100/30 border border-mocha-200/50 text-sm font-medium text-espresso-700 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 backdrop-blur-sm"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <Sparkles className="h-3.5 w-3.5 text-mocha-400" />
              {trait}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-mocha-100/50 rounded-3xl bg-paper/30">
          <Heart className="h-10 w-10 text-mocha-200 mb-2" />
          <p className="text-sm font-bold text-mocha-400">성격 특성 없음</p>
          <p className="text-xs text-mocha-300 mt-1">
            캐릭터의 성격을 정의하는 특성이 아직 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
