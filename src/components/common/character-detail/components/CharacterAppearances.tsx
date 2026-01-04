import { BookOpen, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CharacterAppearancesProps {
  appearances: string[];
}

export function CharacterAppearances({
  appearances,
}: CharacterAppearancesProps) {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-serif font-bold text-stone-800 border-b border-stone-200 pb-2">
        <BookOpen className="h-4 w-4 text-rose-500/70" />
        등장 정보
      </h3>

      {appearances.length > 0 ? (
        <div className="space-y-3">
          {appearances.slice(0, 5).map((chapter, idx) => (
            <div
              key={idx}
              className="group animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="block bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:shadow-md hover:border-rose-100 transition-all cursor-default">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-stone-900 group-hover:text-rose-600 transition-colors">
                      {chapter}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          ))}

          {appearances.length > 5 && (
            <div className="flex items-center justify-center pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                <MoreHorizontal className="h-4 w-4" />
                모두 보기 ({appearances.length}개)
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-200">
          <BookOpen className="h-8 w-8 mb-2 opacity-20" />
          <p className="text-sm font-medium">등장 정보 없음</p>
          <p className="text-xs opacity-70 mt-1">
            이 캐릭터의 등장 정보가 아직 기록되지 않았습니다.
          </p>
        </div>
      )}
    </div>
  );
}
