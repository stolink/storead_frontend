import {
    useRef,
    useEffect,
    useState,
    useMemo,
    useCallback,
    forwardRef,
    useImperativeHandle,
} from "react";
import { throttle } from "lodash-es";
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
    NODE_SIZES,
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
    links?: RelationshipLink[];
    onNodeClick?: (character: Character) => void;
    onLinkClick?: (link: RelationshipLink | null) => void;
    selectedLink?: RelationshipLink | null;
    width?: number;
    height?: number;
    className?: string;
    chapterId?: string;
    showSearch?: boolean;
    /** graphSnapshot (stolink에서 전달된 심층 분석 데이터 포함) */
    graphSnapshot?: import('@/adapters/graphSnapshotAdapter').GraphSnapshotDTO | null;
}

export interface CanvasGraphRef {
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    focusNode: (nodeId: string) => void;
}

const CanvasGraph = forwardRef<CanvasGraphRef, CanvasGraphProps>(
    ({ characters, links: linksProp, onNodeClick, onLinkClick, className, chapterId, showSearch = true, graphSnapshot }, ref) => {
        const graphRef = useRef<ForceGraphMethods>();
        const containerRef = useRef<HTMLDivElement>(null);
        const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
        const nodeCharacterMapRef = useRef<Map<string, Character>>(new Map());

        // [FIX] 콜백 Ref: 부모로부터 전달받은 핸들러를 Ref로 관리하여 의존성 제거 (시뮬레이션 드리프트 방지)
        const onNodeClickRef = useRef(onNodeClick);
        onNodeClickRef.current = onNodeClick;

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
        const [relationTypeFilter, setRelationTypeFilter] = useState<string | "all">("all");
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
        const imageCache = useImageCache(characters);

        // 1. Initial Data Generation
        const { initialNodes, initialLinks } = useMemo(() => {
            const nodes: CharacterNode[] = characters.map((char, index) => {
                const nodeId = char._id || `temp-${index}`;
                return {
                    id: nodeId,
                    name: char.profile?.name || "Unknown",
                    role: char.role,
                    group: char.profile?.faction?.name || "무소속",
                    imageUrl: char.imageUrl,
                    relationCount: 0,
                    status: char.status,
                    // Bloom 효과: 중앙 부근에서 시작
                    x: width / 2 + (Math.random() - 0.5) * 100,
                    y: height / 2 + (Math.random() - 0.5) * 100,
                };
            });

            const links = linksProp && linksProp.length > 0
                ? linksProp.map(l => ({ ...l }))
                : generateLinksFromCharacters(characters);

            // [STABILITY] Fix: Ensure links have stable IDs if missing
            links.forEach((l, idx) => {
                if (!l.id) {
                    const sId = typeof l.source === 'string' ? l.source : (l.source as { id: string } | undefined)?.id || 'unknown';
                    const tId = typeof l.target === 'string' ? l.target : (l.target as { id: string } | undefined)?.id || 'unknown';
                    l.id = `rel-${sId}-${tId}-${idx}`;
                }
            });

            const counts = calculateRelationCounts(links);

            nodes.forEach((n) => {
                n.relationCount = counts[n.id] || 0;
            });

            return { initialNodes: nodes, initialLinks: links };
        }, [characters, linksProp, width, height]);

        // [FIX] Closure Issues: Update node character map
        useEffect(() => {
            nodeCharacterMapRef.current.clear();
            characters.forEach(char => {
                if (char._id) nodeCharacterMapRef.current.set(char._id, char);
            });
        }, [characters]);

        // 2. Filtering Logic
        const internalFilter = useCallback(
            (link: RelationshipLink) => {
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
            const filtered = initialLinks.filter(
                (l) =>
                    validNodeIds.has(typeof l.source === 'object' ? (l.source as any).id : l.source as string) &&
                    validNodeIds.has(typeof l.target === 'object' ? (l.target as any).id : l.target as string) &&
                    internalFilter(l)
            ).map(l => ({ ...l, flowDepth: 0, curvature: 0 }));

            // 1. BFS for Flow Depth (Stolink Parity)
            const protagonist = processedNodes.find(n => n.role === 'protagonist');
            const startNodeId = protagonist?.id || processedNodes[0]?.id;

            if (startNodeId) {
                const adj = new Map<string, string[]>();
                filtered.forEach(l => {
                    const s = typeof l.source === 'object' ? (l.source as any).id : l.source as string;
                    const t = typeof l.target === 'object' ? (l.target as any).id : l.target as string;
                    if (!adj.has(s)) adj.set(s, []);
                    if (!adj.has(t)) adj.set(t, []);
                    adj.get(s)!.push(t);
                    adj.get(t)!.push(s);
                });

                const queue: { id: string, depth: number }[] = [{ id: startNodeId, depth: 0 }];
                const visited = new Set([startNodeId]);
                const depths = new Map([[startNodeId, 0]]);

                while (queue.length > 0) {
                    const { id, depth } = queue.shift()!;
                    (adj.get(id) || []).forEach(nextId => {
                        if (!visited.has(nextId)) {
                            visited.add(nextId);
                            depths.set(nextId, depth + 1);
                            queue.push({ id: nextId, depth: depth + 1 });
                        }
                    });
                }

                filtered.forEach(l => {
                    const s = typeof l.source === 'object' ? (l.source as any).id : l.source as string;
                    const t = typeof l.target === 'object' ? (l.target as any).id : l.target as string;
                    const sD = depths.get(s);
                    const tD = depths.get(t);
                    l.flowDepth = (sD !== undefined && tD !== undefined) ? Math.min(sD, tD) : (sD ?? tD ?? 0);
                });
            }

            // 2. Universal Curvature (Stolink Parity)
            const pairMap = new Map<string, any[]>();
            filtered.forEach(l => {
                const s = typeof l.source === 'object' ? (l.source as any).id : l.source as string;
                const t = typeof l.target === 'object' ? (l.target as any).id : l.target as string;
                const key = [s, t].sort().join('-');
                if (!pairMap.has(key)) pairMap.set(key, []);
                pairMap.get(key)!.push(l);
            });

            pairMap.forEach(group => {
                const len = group.length;
                group.sort((a, b) => a.id.localeCompare(b.id));
                const spacing = 0.25;

                if (len === 1) {
                    const hash = group[0].id.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
                    group[0].curvature = 0.15 * (hash % 2 === 0 ? 1 : -1);
                } else {
                    group.forEach((l, i) => {
                        let c = (i - (len - 1) / 2) * spacing;
                        if (Math.abs(c) < 0.05) c = 0.15;
                        l.curvature = c;
                        const s = typeof l.source === 'object' ? (l.source as any).id : l.source as string;
                        const t = typeof l.target === 'object' ? (l.target as any).id : l.target as string;
                        if (s > t) l.curvature *= -1;
                    });
                }
            });

            return filtered;
        }, [initialLinks, processedNodes, internalFilter]);

        // [FIX] graphData 객체 메모이제이션 - 리렌더링 시 시뮬레이션 초기화(드리프트) 방지 핵심
        // [STABILITY] node/link 정렬 또는 ID 기반 매핑을 고려할 수 있으나, 
        // 현재는 상위 processedNodes/Links가 변경될 때만 참조가 바뀌도록 유지
        const graphData = useMemo(() => ({
            nodes: processedNodes,
            links: processedLinks
        }), [processedNodes, processedLinks]);

        // === Force Simulation Config ===
        // [FIX] 초기 마운트 시 1회만 실행하여 React 무한 루프 방지
        // stolink 패턴 참고: 의존성 배열을 빈 배열로 설정
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
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);


        // === Interaction Handlers ===
        const handleEngineStop = useCallback(() => {
            const fg = graphRef.current as any;
            if (!fg) return;

            // [FIX] d3Simulation 메서드 존재 여부 확인 (버전에 따라 다를 수 있음)
            const sim = fg.d3Simulation?.() || fg.getD3Simulation?.();
            if (sim) {
                console.log("[D3] Simulation Stabilized. Freezing nodes...");
                sim.nodes().forEach((node: any) => {
                    if (node.x !== undefined && node.y !== undefined) {
                        node.fx = node.x;
                        node.fy = node.y;
                    }
                });
                sim.alpha(0); // [FIX] 명시적으로 Alpha를 0으로 설정하여 완전 정지
                sim.stop();
            }
        }, []);

        const handleNodeHover = useCallback(
            (node: any) => {
                if ((!node && !hoverNode) || (node && hoverNode && node.id === hoverNode.id)) return;

                setHoverNode(node || null);
                if (containerRef.current) {
                    containerRef.current.style.cursor = node ? "pointer" : "default";
                }

                if (!node) {
                    setHighlightNodes(new Set());
                    setHighlightLinks(new Set());
                    return;
                }

                const newHighlightNodes = new Set<string>();
                const newHighlightLinks = new Set<string>();

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

                setHighlightNodes(newHighlightNodes);
                setHighlightLinks(newHighlightLinks);
            },
            [processedLinks, hoverNode],
        );

        const handleNodeClick = useCallback(
            (node: CharacterNode) => {
                // [FIX] Stolink Parity: nodeCharacterMapRef를 통한 정밀 매핑으로 이전 프로필 노출 방지
                const char = nodeCharacterMapRef.current.get(node.id);
                if (char && onNodeClickRef.current) {
                    onNodeClickRef.current(char);
                }
                setSelectedNodeId(node.id);
                graphRef.current?.centerAt(node.x, node.y, 400);
                graphRef.current?.zoom(2.5, 400);
            },
            [], // [FIX] 의존성 배열 비움 - Ref 사용으로 안정적 참조 유지
        );

        // [FIX] CharacterSearchOverlay 콜백을 useCallback으로 메모이제이션하여 무한 루프 방지
        // 인라인 함수는 매 렌더링마다 새 참조를 생성하여 useEffect 재실행을 유발함
        const handleSearchSelect = useCallback(
            (char: Character) => {
                const node = processedNodes.find(n => n.id === char._id);
                if (node) handleNodeClick(node);
            },
            [processedNodes, handleNodeClick],
        );

        const handleSearchHighlight = useCallback(
            (ids: string[] | null) => {
                setHighlightNodes(ids ? new Set(ids) : new Set());
            },
            [],
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
                if (onLinkClick) {
                    onLinkClick(link);
                }
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
            [processedNodes, onLinkClick]
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

        const drawGroupClouds = useCallback((ctx: CanvasRenderingContext2D) => {
            const groups = new Map<string, CharacterNode[]>();
            processedNodes.forEach(node => {
                if (node.group && node.group !== "무소속") {
                    if (!groups.has(node.group)) groups.set(node.group, []);
                    groups.get(node.group)!.push(node);
                }
            });

            groups.forEach((members) => {
                if (members.length < 2) return;

                const avgX = members.reduce((sum, n) => sum + (n.x || 0), 0) / members.length;
                const avgY = members.reduce((sum, n) => sum + (n.y || 0), 0) / members.length;

                let maxDist = 40;
                members.forEach(n => {
                    const dx = (n.x || 0) - avgX;
                    const dy = (n.y || 0) - avgY;
                    maxDist = Math.max(maxDist, Math.sqrt(dx * dx + dy * dy) + 20);
                });

                ctx.save();
                ctx.beginPath();
                ctx.arc(avgX, avgY, maxDist, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(164, 119, 100, 0.05)"; // Mocha color with very low opacity
                ctx.fill();

                // Subtle Border
                ctx.strokeStyle = "rgba(164, 119, 100, 0.1)";
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.restore();
            });
        }, [processedNodes]);

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
                if (node) handleNodeClick(node);
            }
        }));

        return (
            <div ref={containerRef} className={cn("relative w-full h-full bg-cloud-50 overflow-hidden", className)}>
                <TiledBackground zoomState={zoomState} className="absolute inset-0" />

                <ForceGraph2D
                    ref={graphRef as any}
                    width={width}
                    height={height}
                    graphData={graphData as any}
                    nodeLabel={() => ""}
                    linkLabel={() => ""}
                    nodeCanvasObject={nodeCanvasObject}
                    linkCanvasObject={linkCanvasObject}
                    onRenderFramePre={(ctx) => drawGroupClouds(ctx)}
                    warmupTicks={50}
                    cooldownTicks={200}
                    cooldownTime={1500}
                    d3AlphaDecay={FORCE_CONFIG.alphaDecay}
                    d3AlphaMin={FORCE_CONFIG.alphaMin}
                    d3VelocityDecay={FORCE_CONFIG.velocityDecay}
                    {...({ clickDistanceThreshold: 6 } as any)} // [FIX] Stolink 사양인 6으로 조정하여 클릭 조작성 향상
                    onEngineStop={handleEngineStop}
                    enableNodeDrag={false} // 드래그 완전 비활성화
                    onNodeClick={handleNodeClick as any}
                    nodeCanvasObjectMode={() => "replace"}
                    // [FIX] Hit Area 설정: 노드 실제 크기와 동일 (링크 클릭 가능하도록)
                    nodePointerAreaPaint={(
                        node: any,
                        color: string,
                        ctx: CanvasRenderingContext2D
                    ) => {
                        // 노드 크기와 동일하게 설정하여 인접 링크 클릭 가능
                        const radius = (node.role === "protagonist" ? NODE_SIZES.protagonist : NODE_SIZES.default) / 2;
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
                        ctx.fill();
                    }}
                    onNodeHover={handleNodeHover}
                    onLinkClick={handleLinkClick as any}
                    linkCanvasObjectMode={() => "replace"}
                    // [NEW] Hit Area 설정: 링크 클릭 범위 확장 및 곡선 일치 (12px 두께)
                    linkPointerAreaPaint={(
                        link: any,
                        color: string,
                        ctx: CanvasRenderingContext2D
                    ) => {
                        const s = link.source;
                        const t = link.target;
                        if (!s || !t || s.x === undefined || t.x === undefined) return;

                        const curvature = link.curvature || 0;
                        const midX = (s.x + t.x) / 2;
                        const midY = (s.y + t.y) / 2;
                        const dx = t.x - s.x;
                        const dy = t.y - s.y;
                        const controlX = midX - dy * curvature;
                        const controlY = midY + dx * curvature;

                        ctx.lineWidth = 18; // [FIX] 더 넓은 클릭 영역으로 조작성 향상
                        ctx.strokeStyle = color;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(s.x, s.y);
                        ctx.quadraticCurveTo(controlX, controlY, t.x, t.y);
                        ctx.stroke();
                    }}
                    onLinkHover={handleLinkHover}
                    onZoom={useMemo(() => throttle((transform: { k: number; x: number; y: number }) => {
                        // [FIX] throttle + requestAnimationFrame으로 줌 이벤트 과부하 방지
                        requestAnimationFrame(() => {
                            setZoomState({
                                scale: transform.k,
                                x: transform.x,
                                y: transform.y
                            });
                        });
                    }, 16), [])}
                    minZoom={ZOOM_CONFIG.min}
                    maxZoom={ZOOM_CONFIG.max}
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

                {showSearch && (
                    <CharacterSearchOverlay
                        characters={characters}
                        onSelect={handleSearchSelect}
                        onSearch={handleSearchHighlight}
                    />
                )}

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
                        onOpenDeepAnalysis={() => handleLinkClick(tooltipState.data)}
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
                        graphSnapshot={graphSnapshot}
                    />
                )}
            </div>
        );
    },
);

CanvasGraph.displayName = "CanvasGraph";

export { CanvasGraph };
