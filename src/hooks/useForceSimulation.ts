import {
    useEffect,
    useRef,
    useCallback,
    useSyncExternalStore,
    useState,
} from "react";
import * as d3 from "d3";
import type { CharacterNode, RelationshipLink } from "@/types/characterGraph";
import {
    FORCE_CONFIG,
    NODE_SIZES,
} from "@/components/CharacterGraph/constants";

interface UseForceSimulationOptions {
    width: number;
    height: number;
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

export function useForceSimulation(
    initialNodes: CharacterNode[],
    initialLinks: RelationshipLink[],
    options: UseForceSimulationOptions,
): UseForceSimulationReturn {
    const { width, height } = options;
    const [simulation, setSimulation] = useState<d3.Simulation<CharacterNode, RelationshipLink> | null>(null);

    const storeRef = useRef<{
        simulation: d3.Simulation<CharacterNode, RelationshipLink> | null;
        state: SimulationState;
        listeners: Set<() => void>;
    }>({
        simulation: null,
        state: { nodes: [], links: [] },
        listeners: new Set(),
    });

    const simulationRef = useRef<d3.Simulation<CharacterNode, RelationshipLink> | null>(null);

    const getNodeRadius = useCallback((node: CharacterNode): number => {
        if (node.role === "protagonist" || node.role === "antagonist") {
            return NODE_SIZES.protagonist * 0.7;
        }
        return NODE_SIZES.default / 2;
    }, []);

    useEffect(() => {
        if (width <= 0 || height <= 0) return;

        const store = storeRef.current;
        const nodesCopy = initialNodes.map((d) => {
            // Stolink에서 넘어온 고정 좌표(fx, fy)나 일반 좌표(x, y)가 
            // 현재 Storead 컨테이너 범위를 너무 크게 벗어나는 경우(예: 3배 이상) 보정합니다.
            const threshold = Math.max(width, height) * 3;
            const isOffScreen = (val: number | null | undefined) =>
                typeof val === 'number' && (val < -threshold || val > threshold);

            const x = isOffScreen(d.x) ? (width / 2 + (Math.random() - 0.5) * 100) : (typeof d.x === 'number' ? d.x : (width / 2 + (Math.random() - 0.5) * 50));
            const y = isOffScreen(d.y) ? (height / 2 + (Math.random() - 0.5) * 100) : (typeof d.y === 'number' ? d.y : (height / 2 + (Math.random() - 0.5) * 50));

            // fx, fy가 화면 밖이면 무시하여 시뮬레이션이 중앙으로 끌고 오도록 유도합니다.
            const fx = isOffScreen(d.fx) ? undefined : (typeof d.fx === 'number' ? d.fx : undefined);
            const fy = isOffScreen(d.fy) ? undefined : (typeof d.fy === 'number' ? d.fy : undefined);

            return {
                ...d,
                x,
                y,
                fx,
                fy,
            };
        });
        const linksCopy = initialLinks.map((d) => ({ ...d }));

        if (simulationRef.current) {
            simulationRef.current.stop();
        }

        const validNodeIds = new Set(nodesCopy.map((n) => n.id));
        const validLinks = linksCopy.filter((link) => {
            const sourceId = typeof link.source === "object" ? (link.source as any).id || (link.source as any)._id : link.source;
            const targetId = typeof link.target === "object" ? (link.target as any).id || (link.target as any)._id : link.target;
            return validNodeIds.has(sourceId) && validNodeIds.has(targetId);
        });

        const newSimulation = d3
            .forceSimulation<CharacterNode, RelationshipLink>(nodesCopy)
            .force("link", d3.forceLink<CharacterNode, RelationshipLink>(validLinks).id((d) => d.id).distance(FORCE_CONFIG.linkDistance).strength(FORCE_CONFIG.linkStrength))
            .force("charge", d3.forceManyBody<CharacterNode>().strength(FORCE_CONFIG.charge).distanceMin(FORCE_CONFIG.chargeDistanceMin).distanceMax(FORCE_CONFIG.chargeDistanceMax))
            .force("collision", d3.forceCollide<CharacterNode>().radius((d) => getNodeRadius(d) + FORCE_CONFIG.collisionPadding).strength(FORCE_CONFIG.collisionStrength))
            .force("center", d3.forceCenter(width / 2, height / 2).strength(FORCE_CONFIG.centerStrength))
            .force("x", d3.forceX(width / 2).strength(FORCE_CONFIG.positionStrength))
            .force("y", d3.forceY(height / 2).strength(FORCE_CONFIG.positionStrength))
            .alphaDecay(FORCE_CONFIG.alphaDecay)
            .alphaMin(FORCE_CONFIG.alphaMin)
            .velocityDecay(FORCE_CONFIG.velocityDecay);

        // Warm up simulation
        newSimulation.tick(20);

        store.state = { nodes: nodesCopy, links: linksCopy };
        store.listeners.forEach((l) => l());
        simulationRef.current = newSimulation;
        store.simulation = newSimulation;
        setSimulation(newSimulation);

        return () => { newSimulation.stop(); };
    }, [initialNodes, initialLinks, width, height, getNodeRadius]);

    const subscribe = useCallback((onStoreChange: () => void) => {
        const store = storeRef.current;
        store.listeners.add(onStoreChange);
        return () => { store.listeners.delete(onStoreChange); };
    }, []);

    const getSnapshot = useCallback(() => storeRef.current.state, []);
    const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    const reheat = useCallback(() => {
        if (simulationRef.current) simulationRef.current.alpha(0.3).restart();
    }, []);

    return { nodes: state.nodes, links: state.links, reheat, simulation };
}
