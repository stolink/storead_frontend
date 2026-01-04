import { TrendingUp } from "lucide-react";

interface CharacterArcProps {
  progress: number;
}

export function CharacterArc({ progress }: CharacterArcProps) {
  // 마일스톤 위치 (25%, 50%, 75%)
  const milestones = [25, 50, 75];

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-serif font-bold text-stone-800 border-b border-stone-200 pb-2">
        <TrendingUp className="h-4 w-4 text-rose-500/70" />
        스토리 진행
      </h3>

      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
        {/* Progress Header */}
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            캐릭터 아크 진행률
          </span>
          <span className="text-2xl font-semibold text-stone-900 font-serif">
            {progress}%
          </span>
        </div>

        {/* Progress Bar with Milestones */}
        <div className="relative h-2 bg-stone-100 rounded-full overflow-visible mt-2 mb-6">
          <div
            className="absolute top-0 left-0 h-full bg-stone-800 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
          {milestones.map((milestone) => (
            <div
              key={milestone}
              className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-white border border-stone-200/50 rounded-full z-10"
              style={{ left: `${milestone}%` }}
            />
          ))}
        </div>

        {/* Milestone Labels */}
        <div className="flex justify-between text-[10px] text-stone-400 px-1 font-medium">
          <span>시작</span>
          <span>전개</span>
          <span>클라이맥스</span>
          <span>결말</span>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-500 pt-2 border-t border-stone-100 leading-relaxed font-serif">
          캐릭터의 스토리 아크 진행 상황을 시각화합니다. 시작부터 결말까지의
          여정을 추적하세요.
        </p>
      </div>
    </div>
  );
}
