import {
  useEffect,
  useRef,
  useCallback,
  useSyncExternalStore,
  useState,
} from "react";
import * as d3 from "d3";
import type { CharacterNode, RelationshipLink } from "@/types";
import {
  FORCE_CONFIG,
  NODE_SIZES,
} from "@/components/CharacterGraph/constants";

interface UseForceSimulationOptions {
  width: number;
  height: number;
  enableGrouping?: boolean;
}

interface SimulationState {
  nodes: CharacterNode[];
  links: RelationshipLink[];
}

interface UseForceSimulationReturn {
  nodes: CharacterNode[];
  links: RelationshipLink[];
  reheat: () => void;
  simulation: d3.Simulation<CharacterNode, RelationshipLink> | null;
}

/**
 * D3 Force Simulation을 관리하는 훅
 * Obsidian 스타일의 부드럽고 유동적인 물리 시뮬레이션
 */
export function useForceSimulation(
  initialNodes: CharacterNode[],
  initialLinks: RelationshipLink[],
  options: UseForceSimulationOptions,
): UseForceSimulationReturn {
  const { width, height, enableGrouping = false } = options;

  // 시뮬레이션과 상태를 저장하는 store
  const [simulation, setSimulation] = useState<d3.Simulation<
    CharacterNode,
    RelationshipLink
  > | null>(null);

  // 시뮬레이션과 상태를 저장하는 store (내부 로직 및 useSyncExternalStore용)
  const storeRef = useRef<{
    simulation: d3.Simulation<CharacterNode, RelationshipLink> | null;
    state: SimulationState;
    listeners: Set<() => void>;
  }>({
    simulation: null,
    state: { nodes: [], links: [] },
    listeners: new Set(),
  });

  const simulationRef = useRef<d3.Simulation<
    CharacterNode,
    RelationshipLink
  > | null>(null);

  // 노드 반지름 계산
  const getNodeRadius = useCallback((node: CharacterNode): number => {
    // Leader 노드 크기 증가 (가시성 확보)
    if (node.role === "protagonist" || node.role === "antagonist") {
      return NODE_SIZES.protagonist * 0.7;
    }
    return NODE_SIZES.default / 2;
  }, []);

  // 시뮬레이션 초기화/업데이트
  useEffect(() => {
    const store = storeRef.current;

    // 노드/링크 복사
    const nodesCopy = initialNodes.map((d) => ({
      ...d,
      x: d.fx !== undefined ? d.fx : (d.x !== undefined ? d.x : width / 2 + (Math.random() - 0.5) * 50),
      y: d.fy !== undefined ? d.fy : (d.y !== undefined ? d.y : height / 2 + (Math.random() - 0.5) * 50),
    }));
    // [CLEANING] 노드 목록에 존재하지 않는 ID를 참조하는 링크 필터링
    const validNodeIds = new Set(nodesCopy.map((n) => n.id || (n as any)._id));
    const validLinks = initialLinks.filter((link: any) => {
      const sourceId = typeof link.source === "object" ? (link.source as any).id || (link.source as any)._id : link.source;
      const targetId = typeof link.target === "object" ? (link.target as any).id || (link.target as any)._id : link.target;
      return validNodeIds.has(sourceId) && validNodeIds.has(targetId);
    }).map(l => ({ ...l }));

    if (simulationRef.current) {
      // If we already have a simulation, just update data sparingly
      const sim = simulationRef.current;
      sim.nodes(nodesCopy as any);
      (sim.force("link") as d3.ForceLink<any, any>).links(validLinks);

      // Update forces
      sim.force("center", d3.forceCenter(width / 2, height / 2).strength(FORCE_CONFIG.centerStrength));
      sim.force("x", d3.forceX(width / 2).strength(FORCE_CONFIG.positionStrength));
      sim.force("y", d3.forceY(height / 2).strength(FORCE_CONFIG.positionStrength));

      sim.alpha(0.3).restart();

      store.state = { nodes: [...nodesCopy] as any, links: [...validLinks] };
      store.listeners.forEach((l) => l());
      return;
    }

    // 새 시뮬레이션 생성
    const newSimulation = d3
      .forceSimulation<CharacterNode, RelationshipLink>(nodesCopy as any)
      .force(
        "link",
        d3
          .forceLink<CharacterNode, RelationshipLink>(validLinks)
          .id((d: any) => d.id || d._id)
          .distance(FORCE_CONFIG.linkDistance)
          .strength(FORCE_CONFIG.linkStrength),
      )
      .force(
        "charge",
        d3
          .forceManyBody<CharacterNode>()
          .strength(FORCE_CONFIG.charge)
          .distanceMin(FORCE_CONFIG.chargeDistanceMin)
          .distanceMax(FORCE_CONFIG.chargeDistanceMax),
      )
      .force(
        "collision",
        d3
          .forceCollide<CharacterNode>()
          .radius((d) => getNodeRadius(d) + FORCE_CONFIG.collisionPadding)
          .strength(FORCE_CONFIG.collisionStrength),
      )
      .alphaDecay(FORCE_CONFIG.alphaDecay) // Use configured decay
      .alphaMin(FORCE_CONFIG.alphaMin)
      .velocityDecay(0.6);

    // === Force-directed 레이아웃 (기본) ===
    newSimulation
      .force(
        "center",
        d3
          .forceCenter(width / 2, height / 2)
          .strength(FORCE_CONFIG.centerStrength),
      )
      .force(
        "y",
        d3.forceY(height / 2).strength(FORCE_CONFIG.positionStrength),
      );

    // [New] Grouping Force (Faction-based)
    if (enableGrouping) {
      const groups = Array.from(
        new Set(nodesCopy.map((n) => n.group).filter((g) => g && g !== "무소속")),
      ) as string[];
      groups.sort();

      if (groups.length > 0) {
        const groupCenters = new Map<string, { x: number; y: number }>();
        const angleStep = (2 * Math.PI) / groups.length;
        const radius = Math.min(width, height) * 0.4;

        groups.forEach((group, index) => {
          const angle = index * angleStep;
          groupCenters.set(group, {
            x: width / 2 + Math.cos(angle) * radius,
            y: height / 2 + Math.sin(angle) * radius,
          });
        });

        newSimulation
          .force(
            "x",
            d3
              .forceX<CharacterNode>()
              .x((node) => {
                const center = groupCenters.get(node.group || "");
                return center ? center.x : width / 2;
              })
              .strength(0.1),
          )
          .force(
            "y",
            d3
              .forceY<CharacterNode>()
              .y((node) => {
                const center = groupCenters.get(node.group || "");
                return center ? center.y : height / 2;
              })
              .strength(0.1),
          );
      } else {
        // Fallback to default position force if no groups found
        newSimulation
          .force("x", d3.forceX(width / 2).strength(FORCE_CONFIG.positionStrength))
          .force("y", d3.forceY(height / 2).strength(FORCE_CONFIG.positionStrength));
      }
    } else {
      // Default: Center nodes
      newSimulation
        .force("x", d3.forceX(width / 2).strength(FORCE_CONFIG.positionStrength))
        .force("y", d3.forceY(height / 2).strength(FORCE_CONFIG.positionStrength));
    }

    // [Pre-warming]
    newSimulation.tick(10);

    // Initial State Sync
    store.state = { nodes: [...nodesCopy] as any, links: [...validLinks] };
    store.listeners.forEach((listener) => listener());

    // Update Refs & State
    simulationRef.current = newSimulation;
    store.simulation = newSimulation;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSimulation(newSimulation);

    // [Auto-stop] 시뮬레이션 종료 시 리스너 알림 및 물리 정지 강화
    newSimulation.on("end", () => {
      // console.log("[D3] Simulation Stabilized.");
      newSimulation.stop(); // 명시적 정지로 지터 방지
    });

    // [Auto-stop] Force stop after 5 seconds to prevent jitter
    const timer = setTimeout(() => {
      newSimulation.stop();
    }, 5000);

    return () => {
      clearTimeout(timer);
      newSimulation.stop();
    };
  }, [width, height, getNodeRadius, enableGrouping]); // Removed initialNodes, initialLinks to prevent constant restart

  // 중앙 포스 업데이트 (리사이즈 시)
  useEffect(() => {
    const store = storeRef.current;
    if (store.simulation) {
      store.simulation.alpha(0.3).restart();
    }
  }, [width, height]);

  // useSyncExternalStore로 상태 동기화
  const subscribe = useCallback((onStoreChange: () => void) => {
    const store = storeRef.current;
    store.listeners.add(onStoreChange);
    return () => {
      store.listeners.delete(onStoreChange);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    return storeRef.current.state;
  }, []);

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // 시뮬레이션 재가열 함수
  const reheat = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.3).restart();
    }
  }, []);

  return {
    nodes: state.nodes,
    links: state.links,
    reheat,
    simulation,
  };
}
