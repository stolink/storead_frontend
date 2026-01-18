import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RELATION_LABELS,
  RELATION_COLORS_HEX,
  type UIRelationType,
} from "./constants";
import { cn } from "@/lib/utils";

interface NetworkControlsProps {
  relationTypeFilter: UIRelationType | "all";
  onFilterChange: (value: UIRelationType | "all") => void;
  /** 주요 캐릭터만 보기 필터 */
  showMainOnly?: boolean;
  onShowMainOnlyChange?: (enabled: boolean) => void;
  enableGrouping?: boolean;
  onGroupingChange?: (enabled: boolean) => void;
}

/**
 * 네트워크 그래프 컨트롤 패널
 * - 관계 타입 필터
 * - 범례 (인터랙티브)
 */
export function NetworkControls({
  relationTypeFilter,
  onFilterChange,
  showMainOnly = false,
  onShowMainOnlyChange,
  enableGrouping = false,
  onGroupingChange,
}: NetworkControlsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const activeFilterLabel =
    relationTypeFilter === "all"
      ? "모든 관계"
      : RELATION_LABELS[relationTypeFilter];

  const relationTypes = Object.keys(RELATION_LABELS) as UIRelationType[];

  return (
    <>
      {/* 좌측 컨트롤 패널 */}
      <div className="bg-paper/80 backdrop-blur-md border border-mocha-100/50 rounded-xl overflow-hidden shadow-lg">
        {/* 헤더 - 토글 가능 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-mocha-500" />
            <span className="text-[10px] font-semibold text-mocha-900 uppercase tracking-wider">
              컨트롤
            </span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-3.5 w-3.5 text-mocha-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-3 pt-0 space-y-4">
                {/* 필터 드롭다운 */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-mocha-600 uppercase tracking-wider">
                    필터
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-full justify-between gap-1 h-8 text-xs bg-white/50 hover:bg-white border-mocha-100",
                          relationTypeFilter !== "all" &&
                            "border-mocha-300 bg-mocha-50",
                        )}
                      >
                        <span className="flex items-center gap-1.5">
                          {relationTypeFilter !== "all" && (
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor:
                                  RELATION_COLORS_HEX[relationTypeFilter],
                              }}
                            />
                          )}
                          <span className="font-medium text-mocha-900">
                            {activeFilterLabel}
                          </span>
                        </span>
                        <ChevronDown className="h-3 w-3 text-mocha-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-40 bg-white/95 backdrop-blur-lg border-mocha-100"
                    >
                      <DropdownMenuRadioGroup
                        value={relationTypeFilter}
                        onValueChange={(v) =>
                          onFilterChange(v as UIRelationType | "all")
                        }
                      >
                        <DropdownMenuRadioItem
                          value="all"
                          className="cursor-pointer text-xs text-mocha-800"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-gradient-to-br from-cloud-200 to-stone-100 flex items-center justify-center">
                              <span className="w-1 h-1 rounded-full bg-cloud-400" />
                            </span>
                            모든 관계
                          </span>
                        </DropdownMenuRadioItem>
                        {relationTypes.map((type) => (
                          <DropdownMenuRadioItem
                            key={type}
                            value={type}
                            className="cursor-pointer text-xs text-mocha-800"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full flex items-center justify-center"
                                style={{
                                  backgroundColor: `${RELATION_COLORS_HEX[type]}20`,
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{
                                    backgroundColor: RELATION_COLORS_HEX[type],
                                  }}
                                />
                              </span>
                              {RELATION_LABELS[type]}
                            </span>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* 초기화 버튼 */}
                  {relationTypeFilter !== "all" && (
                    <button
                      onClick={() => onFilterChange("all")}
                      className="w-full text-[10px] text-mocha-400 hover:text-mocha-600 transition-colors text-center py-1"
                    >
                      초기화
                    </button>
                  )}
                </div>

                {/* 주요 캐릭터만 필터 */}
                {onShowMainOnlyChange && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-semibold text-mocha-600 uppercase tracking-wider">
                        주요 캐릭터만
                      </Label>
                      <Switch
                        checked={showMainOnly}
                        onChange={onShowMainOnlyChange}
                        size="sm"
                      />
                    </div>
                    <p className="text-[9px] text-mocha-400 leading-tight">
                      주인공, 적대자 및 소수 정예 캐릭터만 표시
                    </p>
                  </div>
                )}

                {/* 그룹 토글 */}
                {onGroupingChange && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-semibold text-mocha-600 uppercase tracking-wider">
                        그룹 보기
                      </Label>
                      <Switch
                        checked={enableGrouping}
                        onChange={onGroupingChange}
                        size="sm"
                      />
                    </div>
                    <p className="text-[9px] text-mocha-400 leading-tight">
                      세력/진영별로 노드를 밀집시킵니다
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 우측 상단 Insights Panel Toggle (기능 비활성화 상태) */}
      <div className="absolute right-3 top-3 z-20 flex gap-2">
        {/* Buttons removed for presentation clarity */}
      </div>
    </>
  );
}
