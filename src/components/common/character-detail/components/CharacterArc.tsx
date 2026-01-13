import { TrendingUp } from "lucide-react";

interface CharacterArcProps {
  progress: number;
}

export function CharacterArc({ progress }: CharacterArcProps) {
  // 마일스톤 위치 (25%, 50%, 75%)
  const milestones = [25, 50, 75];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest">
          스토리 진행
        </h3>
      </div>

      <div className="p-6 bg-stone-50/50 border border-stone-100 rounded-3xl space-y-6">
        {/* Progress Header */}
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
            캐릭터 아크 진행률
          </span>
          <span className="text-3xl font-black text-stone-900 font-serif">
            {progress}%
          </span>
        </div>

        {/* Progress Bar with Milestones */}
        <div className="relative h-2 w-full bg-stone-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
          {milestones.map((milestone) => (
            <div
              key={milestone}
              className="absolute top-0 w-0.5 h-full bg-white/50"
              style={{ left: `${milestone}%` }}
            />
          ))}
        </div>

        {/* Milestone Labels */}
        <div className="flex justify-between text-[10px] font-bold text-stone-400 px-1 uppercase tracking-tighter">
          <span>시작</span>
          <span>전개</span>
          <span>클라이맥스</span>
          <span>결말</span>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-500 leading-relaxed pt-4 border-t border-stone-200">
          캐릭터의 스토리 아크 진행 상황을 시각화합니다. 시작부터 결말까지의
          여정을 추적하세요.
        </p>
      </div>
    </div>
  );
}
