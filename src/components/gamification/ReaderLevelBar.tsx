import { Trophy } from "lucide-react";

import { useUserGamification } from "@/hooks/useGamification";

export const ReaderLevelBar = () => {
  const { data: gamification, isLoading } = useUserGamification();

  if (isLoading || !gamification) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20" />
          <div className="space-y-1">
            <div className="w-12 h-2 bg-white/20 rounded" />
            <div className="w-20 h-3 bg-white/20 rounded" />
          </div>
        </div>
        <div className="h-1.5 w-full bg-white/20 rounded-full" />
      </div>
    );
  }

  const { level, exp, maxExp, title } = gamification;
  const expPercentage = Math.round((exp / maxExp) * 100);

  return (
    <div className="text-white">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
          <span className="text-[10px] font-black italic">Lv.{level}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold opacity-70 uppercase tracking-tighter">
            닉네임
          </span>
          <span className="text-sm font-black leading-tight flex items-center gap-1">
            {title}
            <Trophy className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[9px] font-bold opacity-80">
          <span>EXP</span>
          <span>{expPercentage}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-1000"
            style={{ width: `${expPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
