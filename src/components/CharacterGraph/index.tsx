import {
  useMemo,
  memo,
  useRef,
} from "react";
import type {
  CharacterNode,
  RelationshipLink,
  Character,
} from "@/types";
import type { GraphSnapshotDTO } from "@/adapters/graphSnapshotAdapter";

// Components
import { CanvasGraph, type CanvasGraphRef } from "./CanvasGraph";
import { cn } from "@/lib/utils";
import { RelationshipLegend } from "./RelationshipLegend";

interface CharacterGraphProps {
  characters: CharacterNode[];
  links: RelationshipLink[];
  onNodeClick?: (char: Character) => void;
  onLinkClick?: (link: RelationshipLink | null) => void;
  selectedLink?: RelationshipLink | null;
  isDeepAnalysisOpen?: boolean;
  className?: string;
  isSearchActive?: boolean;
  showSearch?: boolean;
  useStolinkStyle?: boolean;
  chapterId?: string;
  /** graphSnapshot (stolink에서 전달된 심층 분석 데이터 포함) */
  graphSnapshot?: GraphSnapshotDTO | null;
}

export const CharacterGraph = memo(function CharacterGraph({
  characters,
  links,
  onNodeClick,
  onLinkClick,
  selectedLink,
  className,
  showSearch = true,
  chapterId,
  graphSnapshot,
}: CharacterGraphProps) {
  const canvasRef = useRef<CanvasGraphRef>(null);

  // CharacterNode[] -> Character[] conversion for CanvasGraph compatibility if needed
  // CanvasGraph expects Character[] but currently nodes are passed as characters prop.
  // We need to ensure the structure matches what CanvasGraph expects.
  const mappedCharacters = useMemo(() => {
    return characters.map(node => ({
      _id: node.id,
      imageUrl: node.imageUrl,
      role: node.role,
      status: node.status,
      profile: {
        name: node.name,
        // Add other nested profile fields if necessary
      }
    } as unknown as Character));
  }, [characters]);

  return (
    <div className={cn("w-full h-full relative overflow-hidden bg-cloud-50", className)}>
      <CanvasGraph
        ref={canvasRef}
        characters={mappedCharacters}
        links={links}
        onNodeClick={onNodeClick}
        onLinkClick={onLinkClick}
        selectedLink={selectedLink}
        chapterId={chapterId}
        showSearch={showSearch}
        graphSnapshot={graphSnapshot}
        className="w-full h-full"
      />

      {/* Legend remains as an overlay if needed, although CanvasGraph has its own controls */}
      <div className="absolute left-4 bottom-4 z-20 pointer-events-auto">
        <RelationshipLegend />
      </div>

      {/* Manual Zoom Controls - CanvasGraph has zoom support in its internal methods */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
        <button
          onClick={() => canvasRef.current?.zoomIn()}
          className="p-2 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full shadow-sm hover:shadow-md hover:bg-white text-stone-600 transition-all font-bold w-10 h-10 flex items-center justify-center"
        >
          +
        </button>
        <button
          onClick={() => canvasRef.current?.zoomOut()}
          className="p-2 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full shadow-sm hover:shadow-md hover:bg-white text-stone-600 transition-all font-bold w-10 h-10 flex items-center justify-center"
        >
          -
        </button>
        <button
          onClick={() => canvasRef.current?.resetZoom()}
          className="px-3 py-2 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full shadow-sm hover:shadow-md hover:bg-white text-stone-600 text-xs font-bold transition-all h-10"
        >
          Reset
        </button>
      </div>
    </div>
  );
});
