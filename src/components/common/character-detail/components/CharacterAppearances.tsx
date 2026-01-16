import { BookOpen, ChevronRight } from "lucide-react";

interface CharacterAppearancesProps {
  appearances: string[];
}

export function CharacterAppearances({
  appearances,
}: CharacterAppearancesProps) {
  return (
    <div className="space-y-6 flex-1 flex flex-col min-h-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 shrink-0">
          <BookOpen className="h-4 w-4 text-mocha-500" />
          <h3 className="text-sm font-bold text-stone-900/80 uppercase tracking-widest font-heading">
            등장 정보
          </h3>
        </div>
        <div className="flex-1 h-px bg-stone-200/50" />
      </div>

      {appearances.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {appearances.map((chapter, idx) => (
            <div
              key={`chapter-${chapter}-${idx}`}
              className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-200/60 hover:border-mocha-300 shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100">
                  <BookOpen className="h-3.5 w-3.5 text-stone-300" />
                </div>
                <span className="text-sm font-bold text-stone-600 group-hover:text-stone-900 transition-colors">
                  {chapter}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-stone-200 group-hover:text-stone-400 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-stone-200 mb-3" />
          <p className="text-base font-bold text-stone-500">등장 정보 없음</p>
          <p className="text-sm text-stone-400 mt-1 max-w-[240px]">
            이 캐릭터의 등장 정보가 아직 기록되지 않았습니다.
          </p>
        </div>
      )}
    </div>
  );
}
