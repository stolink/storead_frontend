import {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
} from "react";
import { throttle } from "lodash-es";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import * as d3 from "d3";

import type { Character, CharacterNode, RelationshipLink } from "@/types";
import { cn } from "@/lib/utils";
import type { ZoomState } from "./types";
import { useImageCache } from "./useImageCache";
import { drawNode } from "./CanvasNodeRenderer";
import { drawLink } from "./CanvasLinkRenderer";
import {
  FORCE_CONFIG,
  ZOOM_CONFIG,
  NODE_SIZES,
  RELATION_PRIORITY,
} from "../constants";
import { generateLinksFromCharacters, calculateRelationCounts } from "../utils";

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
  onReady?: () => void;
  width?: number;
  height?: number;
  className?: string;
  chapterId?: string;
  showSearch?: boolean;
  graphSnapshot?:
    | import("@/adapters/graphSnapshotAdapter").GraphSnapshotDTO
    | null;
}

export interface CanvasGraphRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  focusNode: (nodeId: string) => void;
}

interface DetailedRelationshipLink extends RelationshipLink {
  flowDepth?: number;
  curvature?: number;
  visualPattern?: "standard" | "braided" | "parallel";
  isSuperEdge?: boolean;
  relationTypes?: import("@/types").UIRelationType[];
  originalLinks?: RelationshipLink[];
  events?: unknown[];
  label?: string;
}

const CanvasGraph = forwardRef<CanvasGraphRef, CanvasGraphProps>(
  (
    {
      characters,
      links: linksProp,
      onNodeClick,
      onLinkClick,
      className,
      chapterId,
      showSearch = true,
      graphSnapshot,
      onReady,
    },
    ref,
  ) => {
    const graphRef = useRef<ForceGraphMethods>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const nodeCharacterMapRef = useRef<Map<string, Character>>(new Map());

    const onNodeClickRef = useRef(onNodeClick);

    useLayoutEffect(() => {
      onNodeClickRef.current = onNodeClick;
    });

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

    const [zoomState, setZoomState] = useState<ZoomState>({
      scale: 1,
      x: 0,
      y: 0,
    });
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [highlightNodes, setHighlightNodes] = useState<Set<string>>(
      new Set(),
    );
    const [highlightLinks, setHighlightLinks] = useState<Set<string>>(
      new Set(),
    );
    const [hoverNode, setHoverNode] = useState<CharacterNode | null>(null);

    const [animationPhase, setAnimationPhase] = useState(0);

    const [relationTypeFilter, setRelationTypeFilter] = useState<
      string | "all"
    >("all");
    const [showMainOnly, setShowMainOnly] = useState(false);

    const [deepAnalysisData, setDeepAnalysisData] = useState<{
      source: CharacterNode;
      target: CharacterNode;
      link: DetailedRelationshipLink;
    } | null>(null);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

    const [tooltipState, setTooltipState] = useState<{
      show: boolean;
      x: number;
      y: number;
      data: DetailedRelationshipLink | null;
    }>({ show: false, x: 0, y: 0, data: null });

    useEffect(() => {
      let frameId: number;
      let lastTime = 0;
      const targetFPS = 24;
      const frameInterval = 1000 / targetFPS;

      const animate = (currentTime: number) => {
        if (currentTime - lastTime >= frameInterval) {
          setAnimationPhase((prev) => (prev + 0.015) % 1);
          lastTime = currentTime;
        }
        frameId = requestAnimationFrame(animate);
      };

      frameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frameId);
    }, []);

    const imageCache = useImageCache(characters);

    const { initialNodes, initialLinks } = useMemo(() => {
      const nodes: CharacterNode[] = characters.map((char, index) => {
        const nodeId = char._id || `temp-${index}`;
        const seed = nodeId
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return {
          id: nodeId,
          name: char.profile?.name || "Unknown",
          role: char.role,
          group: char.profile?.faction?.name || "무소속",
          imageUrl: char.imageUrl,
          relationCount: 0,
          status: char.status,
          x: width / 2 + ((seed % 100) / 100 - 0.5) * 100,
          y: height / 2 + (((seed * 1.3) % 100) / 100 - 0.5) * 100,
        };
      });

      const links =
        linksProp && linksProp.length > 0
          ? linksProp.map((l) => ({ ...l }))
          : generateLinksFromCharacters(characters);

      links.forEach((l, idx) => {
        if (!l.id) {
          const sId =
            typeof l.source === "string"
              ? l.source
              : (l.source as { id: string } | undefined)?.id || "unknown";
          const tId =
            typeof l.target === "string"
              ? l.target
              : (l.target as { id: string } | undefined)?.id || "unknown";
          l.id = `rel-${sId}-${tId}-${idx}`;
        }
      });

      const counts = calculateRelationCounts(links);

      nodes.forEach((n) => {
        n.relationCount = counts[n.id] || 0;
      });

      return { initialNodes: nodes, initialLinks: links };
    }, [characters, linksProp, width, height]);

    useEffect(() => {
      nodeCharacterMapRef.current.clear();
      characters.forEach((char) => {
        if (char._id) nodeCharacterMapRef.current.set(char._id, char);
      });
    }, [characters]);

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

      const getLinkId = (
        sourceOrTarget: string | { id: string } | object,
      ): string => {
        if (typeof sourceOrTarget === "string") return sourceOrTarget;
        if (
          typeof sourceOrTarget === "object" &&
          sourceOrTarget !== null &&
          "id" in sourceOrTarget
        ) {
          return (sourceOrTarget as { id: string }).id;
        }
        return "";
      };

      const filtered = initialLinks
        .filter(
          (l) =>
            validNodeIds.has(getLinkId(l.source)) &&
            validNodeIds.has(getLinkId(l.target)) &&
            internalFilter(l),
        )
        .map(
          (l) =>
            ({ ...l, flowDepth: -1, curvature: 0 }) as DetailedRelationshipLink,
        );

      const protagonist = processedNodes.find((n) => n.role === "protagonist");
      const startNodeId = protagonist?.id || processedNodes[0]?.id;

      if (startNodeId) {
        const adj = new Map<string, string[]>();
        filtered.forEach((l) => {
          const s = getLinkId(l.source);
          const t = getLinkId(l.target);
          if (!adj.has(s)) adj.set(s, []);
          if (!adj.has(t)) adj.set(t, []);
          adj.get(s)!.push(t);
          adj.get(t)!.push(s);
        });

        const queue: { id: string; depth: number }[] = [
          { id: startNodeId, depth: 0 },
        ];
        const visited = new Set([startNodeId]);
        const depths = new Map([[startNodeId, 0]]);

        while (queue.length > 0) {
          const { id, depth } = queue.shift()!;
          (adj.get(id) || []).forEach((nextId) => {
            if (!visited.has(nextId)) {
              visited.add(nextId);
              depths.set(nextId, depth + 1);
              queue.push({ id: nextId, depth: depth + 1 });
            }
          });
        }

        filtered.forEach((l) => {
          const s = getLinkId(l.source);
          const t = getLinkId(l.target);
          const sD = depths.get(s);
          const tD = depths.get(t);
          if (sD !== undefined && tD !== undefined) {
            l.flowDepth = Math.min(sD, tD);
            if (sD > tD) {
              const temp = l.source;
              l.source = l.target;
              l.target = temp;
            }
          }
        });
      }

      const pairMap = new Map<string, DetailedRelationshipLink[]>();
      filtered.forEach((l) => {
        const s = getLinkId(l.source);
        const t = getLinkId(l.target);
        const key = [s, t].sort().join("-");
        if (!pairMap.has(key)) pairMap.set(key, []);
        pairMap.get(key)!.push(l);
      });

      const finalLinks: DetailedRelationshipLink[] = [];

      pairMap.forEach((group) => {
        const len = group.length;
        const allTypes = new Set<import("@/types").UIRelationType>();
        group.forEach((l) => {
          if (l.relationTypes && l.relationTypes.length > 0) {
            l.relationTypes.forEach((t) => allTypes.add(t));
          } else if (l.type) {
            allTypes.add(l.type);
          }
        });

        const isMixed = allTypes.size > 1;
        const hash = String(group[0].id)
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const direction = hash % 2 === 0 ? 1 : -1;
        const curvature = 0.15 * direction;

        const groupSources = new Set(group.map((l) => getLinkId(l.source)));
        const isReciprocal = groupSources.size > 1;
        const isExplicitBidirectional = group.some((l) => l.bidirectional);
        const isBidirectional = isReciprocal || isExplicitBidirectional;

        if (len > 1 || isMixed) {
          const base = group[0];
          const typesArray = Array.from(allTypes);

          typesArray.sort((a, b) => {
            const pA =
              RELATION_PRIORITY[a as keyof typeof RELATION_PRIORITY] ?? 99;
            const pB =
              RELATION_PRIORITY[b as keyof typeof RELATION_PRIORITY] ?? 99;
            return pA - pB;
          });

          const primaryType = typesArray[0] || base.type;

          const superEdge: DetailedRelationshipLink = {
            ...base,
            type: primaryType as RelationshipLink["type"],
            relationTypes: typesArray,
            strength: Math.max(...group.map((l) => l.strength)),
            curvature: curvature,
            flowDepth: base.flowDepth ?? -1,
            isSuperEdge: true,
            originalLinks: group,
            visualPattern: (isMixed ? "braided" : "parallel") as
              | "braided"
              | "parallel",
            bidirectional: isBidirectional,
          };
          finalLinks.push(superEdge);
        } else {
          const link = group[0];
          link.curvature = curvature;
          link.visualPattern = "standard";
          link.isSuperEdge = false;
          finalLinks.push(link);
        }
      });

      return finalLinks;
    }, [initialLinks, processedNodes, internalFilter]);

    const graphData = useMemo(
      () => ({
        nodes: processedNodes,
        links: processedLinks,
      }),
      [processedNodes, processedLinks],
    );

    useEffect(() => {
      const fg = graphRef.current;
      if (!fg) return;

      const chargeForce = fg.d3Force(
        "charge",
      ) as unknown as d3.ForceManyBody<CharacterNode>;
      if (chargeForce) {
        chargeForce
          .strength(FORCE_CONFIG.charge)
          .distanceMin(FORCE_CONFIG.chargeDistanceMin)
          .distanceMax(FORCE_CONFIG.chargeDistanceMax);
      }

      const linkForce = fg.d3Force("link") as unknown as d3.ForceLink<
        CharacterNode,
        DetailedRelationshipLink
      >;
      if (linkForce) {
        linkForce
          .distance((link) => {
            const type = (link.type as string) || "neutral";
            let configKey: keyof typeof FORCE_CONFIG.dynamic = "neutral";

            if (["friendly", "ally", "classmate"].includes(type))
              configKey = "ally";
            else if (["hostile", "enemy", "rival"].includes(type))
              configKey = "enemy";
            else if (["master_servant", "teacher", "mentor"].includes(type))
              configKey = "mentor";
            else if (["protects", "shield"].includes(type))
              configKey = "protects";
            else if (["family", "sibling", "child", "parent"].includes(type))
              configKey = "family";
            else if (["romantic", "love", "lover"].includes(type))
              configKey = "romantic";
            else if (["neutral", "knows", "stranger"].includes(type))
              configKey = "neutral";
            else if (["betrayed", "betrayal"].includes(type))
              configKey = "betrayed";
            else if (["complex"].includes(type)) configKey = "complex";

            const dynamicConfig =
              FORCE_CONFIG.dynamic[
                configKey as keyof typeof FORCE_CONFIG.dynamic
              ] || FORCE_CONFIG.dynamic.neutral;

            const baseDistance = dynamicConfig.distance;
            const strengthVal = link.strength || 1;

            if (configKey === "enemy" || configKey === "betrayed") {
              return baseDistance * (1 + (strengthVal - 1) * 0.1);
            } else if (
              configKey === "ally" ||
              configKey === "romantic" ||
              configKey === "family"
            ) {
              return Math.max(
                20,
                baseDistance * (1 - (strengthVal - 1) * 0.05),
              );
            }
            return baseDistance;
          })
          .strength((link) => {
            const type = (link.type as string) || "neutral";
            let configKey: keyof typeof FORCE_CONFIG.dynamic = "neutral";

            if (["friendly", "ally", "classmate"].includes(type))
              configKey = "ally";
            else if (["hostile", "enemy", "rival"].includes(type))
              configKey = "enemy";
            else if (["family", "mentor"].includes(type)) configKey = "family";
            else if (["romantic"].includes(type)) configKey = "romantic";

            const dynamicConfig =
              FORCE_CONFIG.dynamic[
                configKey as keyof typeof FORCE_CONFIG.dynamic
              ] || FORCE_CONFIG.dynamic.neutral;

            const baseStrength = dynamicConfig.strength;
            const strengthVal = link.strength || 1;
            return Math.min(1, baseStrength * (1 + (strengthVal - 1) * 0.075));
          });
      }

      const centerForce = fg.d3Force(
        "center",
      ) as unknown as d3.ForceCenter<CharacterNode>;
      if (centerForce) {
        centerForce.strength(FORCE_CONFIG.centerStrength);
      }

      fg.d3Force(
        "collide",
        d3
          .forceCollide<CharacterNode>()
          .radius((node) => {
            const role = node.role || "other";
            const size =
              role === "protagonist"
                ? NODE_SIZES.protagonist
                : NODE_SIZES.default;
            return size / 2 + FORCE_CONFIG.collisionPadding;
          })
          .strength(FORCE_CONFIG.collisionStrength) as any,
      );

      fg.d3ReheatSimulation();
    }, []);

    useEffect(() => {
      const timer = setTimeout(() => {
        if (graphRef.current) {
          graphRef.current.zoomToFit(0, 200);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (graphRef.current) {
                graphRef.current.zoomToFit(0, 150);
              }
              if (onReady) onReady();
            });
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }, [initialNodes, onReady]);

    const handleEngineStop = useCallback(() => {}, []);

    const handleNodeHover = useCallback(
      (node: CharacterNode | null) => {
        if (
          (!node && !hoverNode) ||
          (node && hoverNode && node.id === hoverNode.id)
        )
          return;

        setHoverNode(node);
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
          const getLinkId = (
            sourceOrTarget: string | { id: string } | object,
          ): string => {
            if (typeof sourceOrTarget === "string") return sourceOrTarget;
            if (
              typeof sourceOrTarget === "object" &&
              sourceOrTarget !== null &&
              "id" in sourceOrTarget
            ) {
              return (sourceOrTarget as { id: string }).id;
            }
            return "";
          };
          const sId = getLinkId(link.source);
          const tId = getLinkId(link.target);

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

    const handleNodeClick = useCallback((node: CharacterNode) => {
      const char = nodeCharacterMapRef.current.get(node.id);
      if (char && onNodeClickRef.current) {
        onNodeClickRef.current(char);
      }
      setSelectedNodeId(node.id);
      graphRef.current?.centerAt(node.x, node.y, 400);
      graphRef.current?.zoom(1.25, 400);
    }, []);

    const handleSearchSelect = useCallback(
      (char: Character) => {
        const node = processedNodes.find(
          (n) => n.id === (char._id || (char as unknown as { id: string }).id),
        );
        if (node) handleNodeClick(node);
      },
      [processedNodes, handleNodeClick],
    );

    const handleSearchHighlight = useCallback((ids: string[] | null) => {
      setHighlightNodes(ids ? new Set(ids) : new Set());
    }, []);

    const handleLinkHover = useCallback(
      (
        link: DetailedRelationshipLink | null,
        prevLink: DetailedRelationshipLink | null,
      ) => {
        if (link === prevLink) return;
        if (link) {
          setTooltipState((prev) => ({ ...prev, show: true, data: link }));
          if (containerRef.current)
            containerRef.current.style.cursor = "pointer";
        } else {
          setTooltipState((prev) => ({ ...prev, show: false, data: null }));
          if (containerRef.current)
            containerRef.current.style.cursor = "default";
        }
      },
      [],
    );

    const handleLinkClick = useCallback(
      (link: DetailedRelationshipLink) => {
        if (onLinkClick) {
          onLinkClick(link);
        }
        const getLinkId = (
          sourceOrTarget: string | { id: string } | object,
        ): string => {
          if (typeof sourceOrTarget === "string") return sourceOrTarget;
          if (
            typeof sourceOrTarget === "object" &&
            sourceOrTarget !== null &&
            "id" in sourceOrTarget
          ) {
            return (sourceOrTarget as { id: string }).id;
          }
          return "";
        };
        const sId = getLinkId(link.source);
        const tId = getLinkId(link.target);

        const sNode = processedNodes.find((n) => n.id === sId);
        const tNode = processedNodes.find((n) => n.id === tId);

        if (sNode && tNode) {
          setDeepAnalysisData({
            source: sNode,
            target: tNode,
            link: link,
          });
          setIsAnalysisOpen(true);
          setTooltipState((prev) => ({ ...prev, show: false }));
        }
      },
      [processedNodes, onLinkClick],
    );

    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (tooltipState.show) {
          setTooltipState((prev) => ({
            ...prev,
            x: e.clientX,
            y: e.clientY,
          }));
        }
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [tooltipState.show]);

    const nodeCanvasObject = useCallback(
      (
        node: CharacterNode,
        ctx: CanvasRenderingContext2D,
        globalScale: number,
      ) => {
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
        });
      },
      [highlightNodes, selectedNodeId, hoverNode, imageCache],
    );

    const linkCanvasObject = useCallback(
      (
        link: DetailedRelationshipLink,
        ctx: CanvasRenderingContext2D,
        globalScale: number,
      ) => {
        const isHighlighted = highlightLinks.has(link.id);
        const isDimmed = highlightLinks.size > 0 && !isHighlighted;

        drawLink({
          ctx,
          link,
          globalScale,
          state: { isSelected: false, isHighlighted, isDimmed },
          animationPhase,
        });
      },
      [highlightLinks, animationPhase],
    );

    const drawGroupClouds = useCallback(
      (ctx: CanvasRenderingContext2D) => {
        const groups = new Map<string, CharacterNode[]>();
        processedNodes.forEach((node) => {
          if (node.group && node.group !== "무소속") {
            if (!groups.has(node.group)) groups.set(node.group, []);
            groups.get(node.group)!.push(node);
          }
        });

        groups.forEach((members) => {
          if (members.length < 2) return;

          const avgX =
            members.reduce((sum, n) => sum + (n.x || 0), 0) / members.length;
          const avgY =
            members.reduce((sum, n) => sum + (n.y || 0), 0) / members.length;

          let maxDist = 40;
          members.forEach((n) => {
            const dx = (n.x || 0) - avgX;
            const dy = (n.y || 0) - avgY;
            maxDist = Math.max(maxDist, Math.sqrt(dx * dx + dy * dy) + 20);
          });

          ctx.save();
          ctx.beginPath();
          ctx.arc(avgX, avgY, maxDist, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(164, 119, 100, 0.05)";
          ctx.fill();
          ctx.strokeStyle = "rgba(164, 119, 100, 0.1)";
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.restore();
        });
      },
      [processedNodes],
    );

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
        const node = processedNodes.find((n) => n.id === nodeId);
        if (node) handleNodeClick(node);
      },
    }));

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full h-full bg-cloud-50 overflow-hidden",
          className,
        )}
      >
        <TiledBackground zoomState={zoomState} className="absolute inset-0" />

        <ForceGraph2D
          ref={graphRef as unknown as React.MutableRefObject<ForceGraphMethods>}
          width={width}
          height={height}
          graphData={graphData}
          nodeLabel={() => ""}
          linkLabel={() => ""}
          nodeCanvasObject={
            nodeCanvasObject as unknown as (
              node: object,
              ctx: CanvasRenderingContext2D,
              globalScale: number,
            ) => void
          }
          linkCanvasObject={
            linkCanvasObject as unknown as (
              link: object,
              ctx: CanvasRenderingContext2D,
              globalScale: number,
            ) => void
          }
          onRenderFramePre={(ctx) => drawGroupClouds(ctx)}
          warmupTicks={50}
          cooldownTicks={200}
          cooldownTime={1500}
          d3AlphaDecay={FORCE_CONFIG.alphaDecay}
          d3AlphaMin={FORCE_CONFIG.alphaMin}
          d3VelocityDecay={FORCE_CONFIG.velocityDecay}
          onEngineStop={handleEngineStop}
          enableNodeDrag={true}
          onNodeClick={
            handleNodeClick as unknown as (
              node: object,
              event: MouseEvent,
            ) => void
          }
          nodeCanvasObjectMode={() => "replace"}
          nodePointerAreaPaint={(
            node: unknown,
            color: string,
            ctx: CanvasRenderingContext2D,
          ) => {
            const n = node as CharacterNode;
            const radius =
              (n.role === "protagonist"
                ? NODE_SIZES.protagonist
                : NODE_SIZES.default) / 2;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(n.x!, n.y!, radius, 0, 2 * Math.PI);
            ctx.fill();
          }}
          onNodeHover={
            handleNodeHover as unknown as (
              node: object | null,
              prevNode: object | null,
            ) => void
          }
          onLinkClick={
            handleLinkClick as unknown as (
              link: object,
              event: MouseEvent,
            ) => void
          }
          linkCanvasObjectMode={() => "replace"}
          linkPointerAreaPaint={(
            link: unknown,
            color: string,
            ctx: CanvasRenderingContext2D,
          ) => {
            const l = link as DetailedRelationshipLink;
            const s = l.source as CharacterNode;
            const t = l.target as CharacterNode;
            if (!s || !t || s.x === undefined || t.x === undefined) return;

            if (!s || !t || s.x === undefined || t.x === undefined) return;

            // Calculate normal vector for perpendicular offset

            ctx.lineWidth = 18;
            ctx.strokeStyle = color;
            ctx.lineCap = "round";
            ctx.beginPath();
            if (
              s.x !== undefined &&
              s.y !== undefined &&
              t.x !== undefined &&
              t.y !== undefined
            ) {
              const midX = (s.x + t.x) / 2;
              const midY = (s.y + t.y) / 2;
              const dx = t.x - s.x;
              const dy = t.y - s.y;
              const curvature = l.curvature || 0;

              const controlX = midX - dy * curvature;
              const controlY = midY + dx * curvature;

              ctx.moveTo(s.x, s.y);
              ctx.quadraticCurveTo(controlX, controlY, t.x, t.y);
            }
            ctx.stroke();
          }}
          onLinkHover={
            handleLinkHover as unknown as (
              link: object | null,
              prevLink: object | null,
            ) => void
          }
          onZoom={useMemo(
            () =>
              throttle((transform: { k: number; x: number; y: number }) => {
                requestAnimationFrame(() => {
                  setZoomState({
                    scale: transform.k,
                    x: transform.x,
                    y: transform.y,
                  });
                });
              }, 16),
            [],
          )}
          minZoom={ZOOM_CONFIG.min}
          maxZoom={ZOOM_CONFIG.max}
        />

        <NetworkControls
          relationTypeFilter={
            relationTypeFilter as import("@/types").UIRelationType | "all"
          }
          onFilterChange={setRelationTypeFilter}
          showMainOnly={showMainOnly}
          onShowMainOnlyChange={setShowMainOnly}
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
            events={
              (
                tooltipState.data as {
                  events?: import("@/types/characterGraph").HistoryEvent[];
                }
              ).events || []
            }
            sourceName={(tooltipState.data.source as CharacterNode).name}
            targetName={(tooltipState.data.target as CharacterNode).name}
            sourceImage={(tooltipState.data.source as CharacterNode).imageUrl}
            targetImage={(tooltipState.data.target as CharacterNode).imageUrl}
            type={tooltipState.data.type}
            types={tooltipState.data.relationTypes}
            strength={tooltipState.data.strength}
            description={
              tooltipState.data.label || tooltipState.data.description
            }
            onEventClick={() => {}}
            onOpenDeepAnalysis={() => handleLinkClick(tooltipState.data!)}
            onMouseEnter={() => {}}
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
