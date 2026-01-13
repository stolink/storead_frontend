import {
    useRef,
    useEffect,
    useState,
    useMemo,
    useCallback,
    forwardRef,
    useImperativeHandle,
} from "react";
import ForceGraph2D, {
    type ForceGraphMethods,
} from "react-force-graph-2d";
import * as d3 from "d3";

import type {
    Character,
    CharacterNode,
    RelationshipLink,
} from "@/types";
import { cn } from "@/lib/utils";
import type { ZoomState } from "./types";
import { useImageCache } from "./useImageCache";
import { drawNode } from "./CanvasNodeRenderer";
import { drawLink } from "./CanvasLinkRenderer";
import {
    FORCE_CONFIG,
    ZOOM_CONFIG,
} from "../constants";
import {
    generateLinksFromCharacters,
    calculateRelationCounts,
} from "../utils";

import { TiledBackground } from "../TiledBackground";
import { NetworkControls } from "../NetworkControls";
import { CharacterSearchOverlay } from "../CharacterSearchOverlay";
import { RelationshipEventTooltip } from "../RelationshipEventTooltip";
import { RelationshipDeepAnalysisModal } from "../RelationshipDeepAnalysis";

interface CanvasGraphProps {
    characters: Character[];
    onNodeClick?: (character: Character) => void;
    width?: number;
    height?: number;
    className?: string;
    chapterId?: string;
}

export interface CanvasGraphRef {
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    focusNode: (nodeId: string) => void;
}

const CanvasGraph = forwardRef<CanvasGraphRef, CanvasGraphProps>(
    ({ characters, onNodeClick, className, chapterId }, ref) => {
        const graphRef = useRef<ForceGraphMethods>();
        const containerRef = useRef<HTMLDivElement>(null);
        const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

        // Manual ResizeObserver implementation to avoid usehooks-ts dependency issues
        useEffect(() => {
            if (!containerRef.current) return;
            const ro = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (entry) {
                    setDimensions({
                        width: entry.contentRect.width,
                        height: entry.contentRect.height,
                    });
                }
            });
            ro.observe(containerRef.current);
            return () => ro.disconnect();
        }, []);

        const { width, height } = dimensions;

        // === State ===
        const [zoomState, setZoomState] = useState<ZoomState>({
            scale: 1,
            x: 0,
            y: 0,
        });
        const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
        const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
        const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());
        const [hoverNode, setHoverNode] = useState<CharacterNode | null>(null);

        // Filter State
        const [relationTypeFilter, setRelationTypeFilter] = useState<
            string | "all"
        >("all");
        const [showMainOnly, setShowMainOnly] = useState(false);

        // Insights State
        const [showTension, setShowTension] = useState(false);
        const [showLogicCheck, setShowLogicCheck] = useState(false);

        // Modal State
        const [deepAnalysisData, setDeepAnalysisData] = useState<{
            source: CharacterNode;
            target: CharacterNode;
            link: RelationshipLink;
        } | null>(null);
        const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

        // Tooltip State
        const [tooltipState, setTooltipState] = useState<{
            show: boolean;
            x: number;
            y: number;
            data: any | null;
        }>({ show: false, x: 0, y: 0, data: null });

        // === Data Processing ===
        const characterMap = useMemo(() => {
            return new Map(characters.map((c) => [c._id, c]));
        }, [characters]);

        const imageCache = useImageCache(characters);

        // 1. Initial Data Generation
        const { initialNodes, initialLinks } = useMemo(() => {
            const nodes: CharacterNode[] = characters.map((char) => ({
                id: char._id,
                name: char.profile?.name || "Unknown",
                role: char.role,
                group: char.profile?.faction?.name || "무소속",
                imageUrl: char.imageUrl,
                relationCount: 0, // Calculated below
                status: char.status,
            }));

            const links = generateLinksFromCharacters(characters);
            const counts = calculateRelationCounts(links);

            nodes.forEach((n) => {
                n.relationCount = counts[n.id] || 0;
            });

            return { initialNodes: nodes, initialLinks: links };
        }, [characters]);

        // 2. Filtering Logic
        const internalFilter = useCallback(
            (link: RelationshipLink) => {
                // Main Filter
                if (relationTypeFilter !== "all" && link.type !== relationTypeFilter)
                    return false;

                return true;
            },
            [relationTypeFilter],
        );

        const processedNodes = useMemo(() => {
            let nodes = initialNodes;

            if (showMainOnly) {
                nodes = nodes.filter(
                    (n) =>
                        n.role === "protagonist" ||
                        n.role === "antagonist" ||
                        (n.relationCount || 0) >= 5,
                );
            }

            return nodes;
        }, [initialNodes, showMainOnly]);

        const processedLinks = useMemo(() => {
            const validNodeIds = new Set(processedNodes.map((n) => n.id));

            // Filter links connected to valid nodes
            const filtered = initialLinks.filter(
                (l) =>
                    validNodeIds.has(l.source as string) &&
                    validNodeIds.has(l.target as string) &&
                    internalFilter(l),
            );

            // Super Edge Processing (Bundling)
            const pairMap = new Map<string, RelationshipLink[]>();

            filtered.forEach((link) => {
                const s = link.source as string;
                const t = link.target as string;
                const key = s < t ? `${s}-${t}` : `${t}-${s}`;
                if (!pairMap.has(key)) pairMap.set(key, []);
                pairMap.get(key)!.push(link);
            });

            const finalLinks: RelationshipLink[] = [];

            pairMap.forEach((group) => {
                const len = group.length;
                if (len === 0) return;

                // Relation Types in this bundle
                const types = group.map((l) => l.type);
                const uniqueTypes = Array.from(new Set(types));
                const isMixed = uniqueTypes.length > 1;

                if (len > 1 || isMixed) {
                    // Create Super Edge
                    // Combine attributes
                    const base = group[0];
                    const superLink: RelationshipLink = {
                        ...base,
                        id: `super-${base.source}-${base.target}`,
                        visualPattern: "braided", // Default to braided for multiple
                        relationTypes: types, // Pass all types for coloring strands
                        label: `${len} Relationships`,
                        strength: Math.max(...group.map((l) => l.strength)),
                        // Combine history/events if needed
                        events: group.flatMap((l) => (l as any).events || []),
                    };

                    // If all same type, use parallel pattern
                    if (!isMixed) {
                        superLink.visualPattern = "parallel";
                    }

                    finalLinks.push(superLink);
                } else {
                    // Single Link
                    finalLinks.push(group[0]);
                }
            });

            return finalLinks;
        }, [initialNodes, initialLinks, processedNodes, internalFilter]);

        // === Force Simulation Config ===
        useEffect(() => {
            const fg = graphRef.current;
            if (!fg) return;

            fg.d3Force("charge")
                ?.strength(FORCE_CONFIG.charge)
                .distanceMax(FORCE_CONFIG.chargeDistanceMax);

            fg.d3Force("link")
                ?.distance((link: any) => {
                    let dist: number = FORCE_CONFIG.linkDistance;
                    if (link.type && FORCE_CONFIG.dynamic[link.type as keyof typeof FORCE_CONFIG.dynamic]) {
                        dist = FORCE_CONFIG.dynamic[link.type as keyof typeof FORCE_CONFIG.dynamic].distance;
                    }
                    return dist * (1 - link.strength * 0.03);
                })
                .strength((link: any) => {
                    let str: number = FORCE_CONFIG.linkStrength;
                    if (link.type && FORCE_CONFIG.dynamic[link.type as keyof typeof FORCE_CONFIG.dynamic]) {
                        str = FORCE_CONFIG.dynamic[link.type as keyof typeof FORCE_CONFIG.dynamic].strength;
                    }
                    return str;
                });

            fg.d3Force("center", d3.forceCenter(0, 0).strength(FORCE_CONFIG.centerStrength));

            fg.d3ReheatSimulation();
        }, [processedNodes, processedLinks]);


        // === Interaction Handlers ===

        const handleNodeHover = useCallback(
            (node: any) => {
                setHoverNode(node || null);
                if (containerRef.current) {
                    containerRef.current.style.cursor = node ? "pointer" : "default";
                }

                const newHighlightNodes = new Set<string>();
                const newHighlightLinks = new Set<string>();

                if (node) {
                    newHighlightNodes.add(node.id);
                    processedLinks.forEach((link) => {
                        const sId = typeof link.source === 'object' ? (link.source as any).id : link.source;
                        const tId = typeof link.target === 'object' ? (link.target as any).id : link.target;

                        if (sId === node.id || tId === node.id) {
                            newHighlightLinks.add(link.id);
                            newHighlightNodes.add(sId);
                            newHighlightNodes.add(tId);
                        }
                    });
                }

                setHighlightNodes(newHighlightNodes);
                setHighlightLinks(newHighlightLinks);
            },
            [processedLinks],
        );

        const handleNodeClick = useCallback(
            (node: CharacterNode) => {
                console.log("Node Clicked:", node);
                setSelectedNodeId(node.id);

                const char = characterMap.get(node.id);
                if (char && onNodeClick) {
                    onNodeClick(char);
                }

                graphRef.current?.centerAt(node.x, node.y, 400);
                graphRef.current?.zoom(2.5, 400);
            },
            [characterMap, onNodeClick],
        );

        const handleLinkHover = useCallback(
            (link: any, prevLink: any) => {
                if (link === prevLink) return;
                if (link) {
                    setTooltipState(prev => ({ ...prev, show: true, data: link }));
                    if (containerRef.current) containerRef.current.style.cursor = "pointer";
                } else {
                    setTooltipState(prev => ({ ...prev, show: false, data: null }));
                    if (containerRef.current) containerRef.current.style.cursor = "default";
                }
            },
            []
        );

        const handleLinkClick = useCallback(
            (link: any) => {
                const sNode = typeof link.source === 'object' ? link.source : processedNodes.find(n => n.id === link.source);
                const tNode = typeof link.target === 'object' ? link.target : processedNodes.find(n => n.id === link.target);

                if (sNode && tNode) {
                    setDeepAnalysisData({
                        source: sNode as CharacterNode,
                        target: tNode as CharacterNode,
                        link: link
                    });
                    setIsAnalysisOpen(true);
                    setTooltipState(prev => ({ ...prev, show: false }));
                }
            },
            [processedNodes]
        );

        useEffect(() => {
            const handleMouseMove = (e: MouseEvent) => {
                if (tooltipState.show) {
                    setTooltipState(prev => ({
                        ...prev,
                        x: e.clientX,
                        y: e.clientY
                    }));
                }
            };
            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }, [tooltipState.show]);


        // === Renderers ===
        const nodeCanvasObject = useCallback(
            (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                const isSelected = node.id === selectedNodeId;
                const isHighlighted = highlightNodes.has(node.id);
                const isDimmed = highlightNodes.size > 0 && !isHighlighted;
                const isHovered = node === hoverNode;

                drawNode({
                    ctx,
                    node,
                    globalScale,
                    state: { isSelected, isHighlighted, isDimmed, isHovered },
                    imageCache,
                    showLogicCheck,
                });
            },
            [highlightNodes, selectedNodeId, hoverNode, imageCache, showLogicCheck],
        );

        const linkCanvasObject = useCallback(
            (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                const isHighlighted = highlightLinks.has(link.id);
                const isDimmed = highlightLinks.size > 0 && !isHighlighted;

                // Phase for Flow Animation
                const animationPhase = (Date.now() % 1000) / 1000;

                drawLink({
                    ctx,
                    link,
                    globalScale,
                    state: { isSelected: false, isHighlighted, isDimmed },
                    animationPhase,
                    showTension,
                    showLogicCheck,
                });
            },
            [highlightLinks, showTension, showLogicCheck],
        );


        // === Exposed Ref Methods ===
        useImperativeHandle(ref, () => ({
            zoomIn: () => {
                const currentZoom = graphRef.current?.zoom() || 1;
                graphRef.current?.zoom(currentZoom * 1.2, 400);
            },
            zoomOut: () => {
                const currentZoom = graphRef.current?.zoom() || 1;
                graphRef.current?.zoom(currentZoom / 1.2, 400);
            },
            resetZoom: () => {
                graphRef.current?.zoomToFit(400, 50);
            },
            focusNode: (nodeId: string) => {
                const node = processedNodes.find(n => n.id === nodeId);
                if (node) {
                    handleNodeClick(node);
                } else {
                    console.info("Character not found in current view");
                }
            }
        }));


        return (
            <div
                ref={containerRef}
                className={cn("relative w-full h-full bg-[#e8e4dc] overflow-hidden", className)}
            >
                <TiledBackground zoomState={zoomState} className="absolute inset-0" />

                <ForceGraph2D
                    ref={graphRef}
                    width={width}
                    height={height}
                    graphData={{ nodes: processedNodes as any, links: processedLinks as any }}

                    nodeLabel={() => ""}
                    linkLabel={() => ""}

                    nodeCanvasObject={nodeCanvasObject}
                    linkCanvasObject={linkCanvasObject}

                    // Physics
                    cooldownTicks={100}
                    d3AlphaDecay={FORCE_CONFIG.alphaDecay}
                    d3VelocityDecay={FORCE_CONFIG.velocityDecay}

                    // Interaction
                    onNodeClick={handleNodeClick as any}
                    onNodeHover={handleNodeHover}
                    onLinkClick={handleLinkClick as any}
                    onLinkHover={handleLinkHover}

                    onZoom={(transform) => {
                        setZoomState({
                            scale: transform.k,
                            x: transform.x,
                            y: transform.y
                        });
                    }}

                    minZoom={ZOOM_CONFIG.min}
                    maxZoom={ZOOM_CONFIG.max}

                    linkDirectionalArrowLength={3.5}
                    linkDirectionalArrowRelPos={1}
                />

                <NetworkControls
                    relationTypeFilter={relationTypeFilter as any}
                    onFilterChange={setRelationTypeFilter}
                    showMainOnly={showMainOnly}
                    onShowMainOnlyChange={setShowMainOnly}
                    showTension={showTension}
                    onToggleTension={setShowTension}
                    showLogicCheck={showLogicCheck}
                    onToggleLogicCheck={setShowLogicCheck}
                />

                <CharacterSearchOverlay
                    characters={characters}
                    onSelect={(char) => {
                        const node = processedNodes.find(n => n.id === char._id);
                        if (node) handleNodeClick(node);
                        else console.info("Character filtered out or not in graph.");
                    }}
                    onSearch={(ids) => {
                        if (ids) {
                            setHighlightNodes(new Set(ids));
                        } else {
                            setHighlightNodes(new Set());
                        }
                    }}
                />

                {tooltipState.show && tooltipState.data && (
                    <RelationshipEventTooltip
                        x={tooltipState.x}
                        y={tooltipState.y}
                        events={(tooltipState.data as any).events || []}
                        sourceName={(tooltipState.data.source as CharacterNode).name}
                        targetName={(tooltipState.data.target as CharacterNode).name}
                        sourceImage={(tooltipState.data.source as CharacterNode).imageUrl}
                        targetImage={(tooltipState.data.target as CharacterNode).imageUrl}
                        type={tooltipState.data.type}
                        types={(tooltipState.data as any).relationTypes}
                        strength={tooltipState.data.strength}
                        description={tooltipState.data.label || tooltipState.data.description}
                        onEventClick={() => { }}
                        onOpenDeepAnalysis={() => {
                            handleLinkClick(tooltipState.data);
                        }}
                        onMouseEnter={() => { }}
                    />
                )}

                {deepAnalysisData && deepAnalysisData.link && (
                    <RelationshipDeepAnalysisModal
                        isOpen={isAnalysisOpen}
                        onClose={() => setIsAnalysisOpen(false)}
                        sourceNode={deepAnalysisData.source}
                        targetNode={deepAnalysisData.target}
                        relationId={deepAnalysisData.link.id}
                        chapterId={chapterId}
                        link={deepAnalysisData.link}
                    />
                )}
            </div>
        );
    },
);

CanvasGraph.displayName = "CanvasGraph";

export { CanvasGraph };
