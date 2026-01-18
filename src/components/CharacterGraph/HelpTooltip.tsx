import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function HelpTooltip() {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="p-2 hover:bg-mocha/10 rounded-full transition-colors text-mocha-500">
            <HelpCircle className="w-5 h-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="w-64 p-4 bg-white/95 backdrop-blur-sm border-mocha-100 shadow-xl rounded-xl"
        >
          <div className="space-y-2">
            <h4 className="font-bold text-espresso-900 text-sm">
              그래프 조작 가이드
            </h4>
            <ul className="text-xs text-mocha-600 space-y-1 content-list">
              <li>
                • <b>드래그</b>: 화면 이동 (전체 그래프)
              </li>
              <li>
                • <b>휠/핀치</b>: 확대 및 축소
              </li>
              <li>
                • <b>인물 클릭</b>: 인물 상세 정보 및 연결 관계 확인
              </li>
              <li>
                • <b>관계선 클릭</b>: 두 인물 간의 대화 및 서사 분석
              </li>
              <li>
                • <b>타임라인</b>: 이야기 흐름에 따른 관계 변화 확인
              </li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
