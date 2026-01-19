
import { HistoryStack } from "./HistoryStack";
import { MiniRankingTab } from "./MiniRankingTab";
import { AttendanceStreak } from "../gamification/AttendanceStreak";
import { ReaderLevelBar } from "../gamification/ReaderLevelBar";

export const StickySidebar = () => {
  return (
    <aside className="hidden xl:flex flex-col gap-6 w-[220px] sticky top-24 self-start">
      {/* Gamification Widgets (Placeholders for now) */}
      <div className="bg-gradient-to-br from-mocha-500 to-mocha-700 rounded-3xl p-5 shadow-lg shadow-mocha-500/20 overflow-hidden relative">
        <div className="relative z-10">
          <ReaderLevelBar />
          <div className="mt-4 pt-4 border-t border-white/10">
            <AttendanceStreak />
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </div>

      <MiniRankingTab />

      <HistoryStack />
    </aside>
  );
};
