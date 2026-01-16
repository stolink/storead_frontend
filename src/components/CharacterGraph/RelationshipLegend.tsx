import { memo } from "react";
import { type UIRelationType, RELATION_LABELS, RELATION_COLORS } from "./constants";
import { Label } from "@/components/ui/label";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface RelationshipLegendProps {
    relationTypeFilter?: UIRelationType | "all";
    onFilterChange?: (type: UIRelationType | "all") => void;
    hoveredType?: UIRelationType | null;
    onHoverType?: (type: UIRelationType | null) => void;
}

export const RelationshipLegend = memo(function RelationshipLegend({
    relationTypeFilter = "all",
    onFilterChange,
    hoveredType,
    onHoverType,
}: RelationshipLegendProps) {
    const relationTypes: UIRelationType[] = [
        "friendly",
        "hostile",
        "romantic",
        "family",
        "neutral",
        "complex",
    ];

    return (
        <div className="flex flex-col gap-3 p-4 bg-cloud-50/80 backdrop-blur-md border border-mocha-100/50 rounded-xl shadow-lg transition-all hover:shadow-xl animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-1">
                <Layers className="w-3.5 h-3.5 text-stone-400" />
                <Label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    관계 유형 (범례)
                </Label>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {relationTypes.map((type) => {
                    const color = RELATION_COLORS[type];
                    const isActive =
                        relationTypeFilter === "all" || relationTypeFilter === type;

                    return (
                        <button
                            key={type}
                            onClick={() =>
                                onFilterChange?.(relationTypeFilter === type ? "all" : type)
                            }
                            onMouseEnter={() => onHoverType?.(type)}
                            onMouseLeave={() => onHoverType?.(null)}
                            className={cn(
                                "px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all text-left flex items-center gap-2 border w-full",
                                isActive
                                    ? "bg-white border-stone-200 text-stone-700 shadow-sm"
                                    : "bg-stone-50 text-stone-400 border-transparent hover:bg-white"
                            )}
                            style={{
                                borderColor: isActive ? color : "transparent",
                                opacity:
                                    hoveredType && hoveredType !== type && relationTypeFilter === "all"
                                        ? 0.5
                                        : 1,
                            }}
                        >
                            <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: color }}
                            />
                            <span className="truncate">{RELATION_LABELS[type]}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});
