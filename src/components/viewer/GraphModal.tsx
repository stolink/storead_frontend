/**
 * 관계도 모달 컴포넌트
 * CharacterGraph를 모달로 표시
 */
import { useState, useMemo, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CharacterGraph } from "@/components/CharacterGraph";
import { NetworkDetailPanelD3 } from "@/components/CharacterGraph/NetworkDetailPanelD3";
import { CharacterDetailModal } from "@/components/common/CharacterDetailModal";
import type { Character } from "@/types/character";
import type { RelationshipLink } from "@/types/characterGraph";
import type { GraphSnapshotDTO } from "@/adapters/graphSnapshotAdapter";
import { cn } from "@/lib/utils";

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  links: RelationshipLink[];
  // chapterNumber removed
  chapterId?: string; // chapterId as string for comment API
  /** graphSnapshot (stolink에서 전달된 심층 분석 데이터 포함) */
  graphSnapshot?: GraphSnapshotDTO | null;
}

export function GraphModal({
  isOpen,
  onClose,
  characters,
  links,
  // chapterNumber removed
  chapterId,
  graphSnapshot,
}: GraphModalProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [isCharacterDetailOpen, setIsCharacterDetailOpen] = useState(false);

  const [selectedLink, setSelectedLink] = useState<RelationshipLink | null>(
    null,
  );
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false); // [RESTORED]
  const [isGraphReady, setIsGraphReady] = useState(false); // [NEW] Loading State

  const mountTimeRef = useRef(Date.now());

  // [Safety] Force remove loading overlay after 3s to prevent getting stuck
  // [Safety] Force remove loading overlay after 3s to prevent getting stuck
  useEffect(() => {
    if (isOpen) {
      setIsGraphReady(false);
      mountTimeRef.current = Date.now();
      const timer = setTimeout(() => setIsGraphReady(true), 3000);
      return () => clearTimeout(timer);
    } else {
      // [FIX] Reset state when closed so it starts fresh next time
      setIsGraphReady(false);
    }
  }, [isOpen]);

  // Convert Character[] to CharacterNode[] for CharacterGraph
  const memoizedNodes = useMemo(
    () =>
      characters.map((c) => ({
        ...c,
        id: c._id || (c as any).id,
        _id: c._id || (c as any).id, // Ensure both are present for compatibility
        name: c.profile?.name || "Unnamed",
      })),
    [characters],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full h-full max-w-[95vw] max-h-[90vh] bg-cloud-50 border-none rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Loading Overlay (Modal Level) - Covers Header/Content/Footer */}
            <div
              className={cn(
                "absolute inset-0 z-[9999] flex items-center justify-center bg-[#F1F0EC] transition-opacity duration-300",
                isGraphReady ? "opacity-0 pointer-events-none" : "opacity-100",
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-mocha-200 border-t-mocha-500 rounded-full animate-spin" />
                <span className="text-mocha-600 text-sm font-medium animate-pulse">
                  관계도 구성 중...
                </span>
              </div>
            </div>

            {/* [FIX] Close Button Moved to Top-Level for Z-Index Safety */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-mocha/10 rounded-full transition-colors text-mocha z-[10000]"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-mocha/10 bg-white/50 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-mocha/10 flex items-center justify-center">
                  <span className="text-xl">🕸️</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-espresso">
                    인물 관계도
                  </h2>
                  <p className="text-xs text-mocha/60">
                    모든 인물의 연결 고리를 시각화합니다
                  </p>
                </div>
              </div>
              {/* Button moved out */}
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-hidden bg-cloud-50">
              <div className="absolute inset-0">
                <CharacterGraph
                  characters={memoizedNodes as any}
                  links={links}
                  onNodeClick={(node: any) => {
                    const char =
                      characters.find(
                        (c: any) =>
                          String(c._id) === String(node.id) ||
                          String(c.id) === String(node.id) ||
                          String(c._id) === String(node._id) ||
                          String(c.id) === String(node._id),
                      ) || null;
                    setSelectedCharacter(char);
                  }}
                  onLinkClick={(link) => {
                    setSelectedLink(link);
                    if (link) setIsCommentModalOpen(true);
                    else setIsCommentModalOpen(false);
                  }}
                  selectedLink={selectedLink}
                  isDeepAnalysisOpen={isCommentModalOpen}
                  chapterId={chapterId}
                  graphSnapshot={graphSnapshot}
                  onReady={() => {
                    const elapsed = Date.now() - mountTimeRef.current;
                    const minDuration = 500; // Minimum 0.5s loading
                    if (elapsed < minDuration) {
                      setTimeout(
                        () => setIsGraphReady(true),
                        minDuration - elapsed,
                      );
                    } else {
                      setIsGraphReady(true);
                    }
                  }}
                />
                <AnimatePresence>
                  {selectedCharacter && (
                    <NetworkDetailPanelD3
                      selectedCharacter={selectedCharacter}
                      characters={characters}
                      links={links}
                      onClose={() => setSelectedCharacter(null)}
                      onViewProfile={() => {
                        setIsCharacterDetailOpen(true);
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <footer className="p-4 border-t border-mocha/10 shrink-0 bg-white/30">
              <p className="text-xs text-mocha/50 text-center font-serif italic">
                💡 노드나 관계선을 클릭하면 상세 정보와 의견을 볼 수 있습니다.
              </p>
            </footer>
          </motion.div>
        </motion.div>
      )}

      {/* Character Profile Modal - Step 2 */}
      {isCharacterDetailOpen && selectedCharacter && (
        <CharacterDetailModal
          character={selectedCharacter}
          allCharacters={characters}
          isOpen={isCharacterDetailOpen}
          onClose={() => setIsCharacterDetailOpen(false)}
        />
      )}
    </AnimatePresence>
  );
}
