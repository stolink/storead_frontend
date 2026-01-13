import {
  useRef,
  useState,
  useMemo,
  memo,
  useCallback,
  useEffect,
} from "react";
import type {
  CharacterNode,
  RelationshipLink,
  UIRelationType,
  Character,
} from "@/types";

// Components
import { NodeRenderer } from "@/components/CharacterGraph/NodeRenderer";
import { LinkRenderer } from "@/components/CharacterGraph/LinkRenderer";
import { NetworkControls } from "@/components/CharacterGraph/NetworkControls";
import { TiledBackground } from "@/components/CharacterGraph/TiledBackground";
import { CharacterSearchOverlay } from "./CharacterSearchOverlay";
import { RelationshipLegend } from "./RelationshipLegend";

import { RelationshipDetailOverlay } from "./RelationshipDetailOverlay";
import { cn } from "@/lib/utils";

// Hooks
import { useForceSimulation } from "@/hooks/useCharacterGraphSimulation";
import { useZoom } from "@/hooks/useCharacterGraphZoom";
import { useDrag } from "@/hooks/useCharacterGraphDrag";
import { useResize } from "@/hooks/useCharacterGraphResize";

interface CharacterGraphProps {
  characters: CharacterNode[];
  links: RelationshipLink[];
  onNodeClick?: (char: Character) => void;
  onLinkClick?: (link: RelationshipLink | null) => void;
  selectedLink?: RelationshipLink | null;
  /** 주요 캐릭터만 보기 필터 */
  isDeepAnalysisOpen?: boolean;
  className?: string;
  isSearchActive?: boolean;
  showSearch?: boolean; // Added for compatibility
  useStolinkStyle?: boolean;
  chapterId?: string;
}

export const CharacterGraph = memo(function CharacterGraph({
  characters,
  links: linksProp,
  onNodeClick,
  onLinkClick,
  selectedLink,
  isDeepAnalysisOpen = false,
  className,
  isSearchActive = false,
  showSearch = false,
  useStolinkStyle = true,
  chapterId,
}: CharacterGraphProps) {
  const activeSearch = isSearchActive || showSearch;
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  // 1. Dimensions
  const { width, height } = useResize(containerRef);

  // 2. State for highlighting and filters
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [highlightedLink, setHighlightedLink] = useState<string | null>(null);
  const [relationTypeFilter, setRelationTypeFilter] = useState<UIRelationType | "all">("all");
  const [showMainOnly, setShowMainOnly] = useState(false);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[] | null>(null);

  // Dummy states for mandatory sub-component props (AI features disabled)
  const [enableGrouping, setEnableGrouping] = useState(false);

  // Character lookup map for overlay
  const nodeCharacterMapRef = useRef<Map<string, CharacterNode>>(new Map());

  // 1. D3 Force Simulation
  const { simulation, nodes, links, reheat } = useForceSimulation(
    characters as any,
    linksProp,
    {
      width: width || 800,
      height: height || 600,
      enableGrouping,
    }
  );

  useEffect(() => {
    const map = new Map<string, CharacterNode>();
    nodes.forEach(n => map.set(n.id, n));
    nodeCharacterMapRef.current = map;
  }, [nodes]);

  // Reheat simulation when modal/overlay opens/closes for fluid UX
  useEffect(() => {
    if (simulation) {
      // Small delay to wait for container/modal transition completion
      const timer = setTimeout(() => {
        reheat();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [simulation, isDeepAnalysisOpen, reheat]);

  // 4. Zoom Hook
  const { zoomState, zoomIn, zoomOut, resetZoom, centerAt } = useZoom(svgRef, gRef);

  // 5. Drag Hook
  const { dragBehavior, handleUnpin } = useDrag({
    simulation,
  });

  // Handlers
  const handleNodeClick = useCallback((node: CharacterNode) => {
    onNodeClick?.(node as unknown as Character);

    // Auto-center on click
    if (node.x && node.y) {
      centerAt(node.x, node.y, 1.2);
    }
  }, [onNodeClick, centerAt]);

  const handleLinkClick = useCallback((link: RelationshipLink) => {
    onLinkClick?.(link);
  }, [onLinkClick]);

  // Filtered Lists
  const filteredNodes = useMemo(() => {
    let result = nodes;
    if (showMainOnly) {
      result = result.filter(n => n.role === 'protagonist' || n.role === 'antagonist');
    }
    return result;
  }, [nodes, showMainOnly]);

  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      if (relationTypeFilter !== "all" && link.type !== relationTypeFilter) return false;

      const sId = typeof link.source === 'object' ? (link.source as CharacterNode).id : link.source;
      const tId = typeof link.target === 'object' ? (link.target as CharacterNode).id : link.target;

      const sExists = filteredNodes.find(n => n.id === sId);
      const tExists = filteredNodes.find(n => n.id === tId);

      return sExists && tExists;
    });
  }, [links, relationTypeFilter, filteredNodes]);

  // Prepare searchable data
  const searchableCharacters = useMemo(() => {
    return characters.map(c => ({
      _id: c.id,
      profile: { name: (c as any).profile?.name || c.name },
      role: c.role,
      imageUrl: c.imageUrl,
    } as unknown as Character));
  }, [characters]);

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full relative overflow-hidden bg-cloud-50 z-0 stolink-graph-container reset-css", className)}
    >
      {/* Background */}
      <TiledBackground
        zoomState={zoomState}
        className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-multiply"
      />

      {/* Parchment Vignette & Border Overlay - Synchronized with Stolink Style */}
      <div className="absolute inset-0 z-[5] pointer-events-none ring-0 outline-none" />
      <div className="absolute inset-0 z-[6] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150" />
      <div className="absolute inset-0 z-[7] pointer-events-none border-none m-3 rounded-[1.5rem]" />

      {/* Z-Index Layer Stack: Interaction Blocker for Overlay */}
      {(selectedLink || isDeepAnalysisOpen) && (
        <div
          className="absolute inset-0 z-[40] bg-black/5 backdrop-blur-[2px] transition-all duration-500 animate-in fade-in"
          onClick={() => {
            // Close deep analysis or clear link on background click
            onLinkClick?.(null);
          }}
        />
      )}

      {/* Search Overlay */}
      {activeSearch && (
        <CharacterSearchOverlay
          characters={searchableCharacters}
          onSelect={(char) => {
            const foundNode = nodes.find(n => (n as any).id === char._id || (n as any)._id === char._id);
            if (foundNode) {
              handleNodeClick(foundNode as any);
            }
          }}
          onSearch={setHighlightedNodeIds}
        />
      )}

      {/* Network Controls & Legend Layer */}
      <div className="absolute left-4 top-4 bottom-4 z-20 flex flex-col justify-between pointer-events-none w-64">
        <div className="pointer-events-auto">
          <NetworkControls
            relationTypeFilter={relationTypeFilter}
            onFilterChange={setRelationTypeFilter}
            showMainOnly={showMainOnly}
            onShowMainOnlyChange={setShowMainOnly}
            showTension={false}
            onToggleTension={() => { }}
            showLogicCheck={false}
            onToggleLogicCheck={() => { }}
            enableGrouping={enableGrouping}
            onGroupingChange={setEnableGrouping}
          />
        </div>

        <div className="pointer-events-auto">
          <RelationshipLegend
            relationTypeFilter={relationTypeFilter}
            onFilterChange={setRelationTypeFilter}
          />
        </div>
      </div>



      {/* SVG Graph */}
      <svg
        ref={svgRef}
        width={width || 0}
        height={height || 0}
        className="cursor-grab active:cursor-grabbing relative z-10 w-full h-full"
      >
        <g ref={gRef}>
          {filteredLinks.map((link, idx) => {
            const isHighlighted = highlightedLink === link.id;
            const isSearchMatch = highlightedNodeIds ?
              (highlightedNodeIds.includes(typeof link.source === 'object' ? link.source.id : link.source) &&
                highlightedNodeIds.includes(typeof link.target === 'object' ? link.target.id : link.target)) : true;
            const isDimmed = (!!highlightedNode && !isHighlighted &&
              (typeof link.source === 'object' ? link.source.id : link.source) !== highlightedNode &&
              (typeof link.target === 'object' ? link.target.id : link.target) !== highlightedNode) ||
              (!!highlightedNodeIds && !isSearchMatch);

            return (
              <LinkRenderer
                key={`link-${link.id || idx}-${idx}`}
                link={link}
                isHighlighted={isHighlighted}
                isDimmed={isDimmed}
                isFiltered={false}
                onClick={handleLinkClick}
                onHover={setHighlightedLink}
              />
            );
          })}

          {filteredNodes.map((node, idx) => (
            <NodeRenderer
              key={`node-${node.id || idx}-${idx}`}
              node={node}
              isSelected={false}
              isHighlighted={highlightedNode === node.id || !!highlightedNodeIds?.includes(node.id)}
              isDimmed={(!!highlightedNode && highlightedNode !== node.id) || (!!highlightedNodeIds && !highlightedNodeIds.includes(node.id))}
              onClick={handleNodeClick}
              onDoubleClick={handleUnpin}
              onHover={setHighlightedNode}
              dragBehavior={dragBehavior}
              useStolinkStyle={useStolinkStyle}
            />
          ))}
        </g>
      </svg>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
        <button onClick={zoomIn} className="p-2 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full shadow-sm hover:shadow-md hover:bg-white text-stone-600 transition-all font-bold" title="확대">+</button>
        <button onClick={zoomOut} className="p-2 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full shadow-sm hover:shadow-md hover:bg-white text-stone-600 transition-all font-bold" title="축소">-</button>
        <button onClick={resetZoom} className="px-3 py-2 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full shadow-sm hover:shadow-md hover:bg-white text-stone-600 text-xs font-bold transition-all" title="초기화">Reset</button>
      </div>

      {/* Relationship Detail Overlay */}
      {selectedLink && (
        <RelationshipDetailOverlay
          isOpen={isDeepAnalysisOpen}
          onClose={() => onLinkClick?.(null)}
          sourceNode={nodeCharacterMapRef.current.get(typeof selectedLink.source === 'object' ? selectedLink.source.id : selectedLink.source) as any}
          targetNode={nodeCharacterMapRef.current.get(typeof selectedLink.target === 'object' ? selectedLink.target.id : selectedLink.target) as any}
          relationId={selectedLink.id}
          link={selectedLink}
          chapterId={chapterId}
        />
      )}
    </div>
  );
});
