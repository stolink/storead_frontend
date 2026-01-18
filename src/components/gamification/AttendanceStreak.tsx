import React from "react";
import { Calendar, Flame } from "lucide-react";

import { useUserGamification } from "@/hooks/useGamification";

export const AttendanceStreak = () => {
  const { data: gamification, isLoading } = useUserGamification();

  if (isLoading || !gamification) {
    return (
      <div className="animate-pulse">
        <div className="h-4 w-24 bg-white/20 rounded mb-2" />
        <div className="h-1 w-full bg-white/20 rounded" />
      </div>
    );
  }

  const streak = gamification.attendanceStreak;

  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
          <span className="text-xs font-bold">{streak}일 연속 출석</span>
        </div>
        <Calendar className="w-3.5 h-3.5 opacity-60" />
      </div>

      <div className="grid grid-cols-7 gap-1">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full ${
              i < streak ? "bg-white" : "bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
