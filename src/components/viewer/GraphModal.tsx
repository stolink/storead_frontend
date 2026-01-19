/**
 * 관계도 모달 컴포넌트 (Warm & Soft UI)
 * CharacterGraph를 모달로 표시
 */
import { useState, useMemo, useEffect, useRef } from "react";
import { X, Network, Users, Link2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CharacterGraph } from "@/components/CharacterGraph";
import { NetworkDetailPanelD3 } from "@/components/CharacterGraph/NetworkDetailPanelD3";
import { HelpTooltip } from "@/components/CharacterGraph/HelpTooltip";
import { CharacterDetailModal } from "@/components/common/CharacterDetailModal";
import type { Character } from "@/types/character";
import type { RelationshipLink } from "@/types/characterGraph";
import type { GraphSnapshotDTO } from "@/adapters/graphSnapshotAdapter";

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
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isGraphReady, setIsGraphReady] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);

  const mountTimeRef = useRef(0);

  // 로딩 단계 시뮬레이션
  useEffect(() => {
    if (!isOpen || isGraphReady) return;

    const step2Timer = setTimeout(() => setLoadingStep(2), 600);
    const step3Timer = setTimeout(() => setLoadingStep(3), 1200);

    return () => {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
    };
  }, [isOpen, isGraphReady]);

  // Safety: Force remove loading overlay after 3s
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsGraphReady(false);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingStep(1);
      mountTimeRef.current = Date.now();
      const timer = setTimeout(() => setIsGraphReady(true), 3000);
      return () => clearTimeout(timer);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsGraphReady(false);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingStep(1);
    }
  }, [isOpen]);

  // Convert Character[] to CharacterNode[] for CharacterGraph
  const memoizedNodes = useMemo(
    () =>
      characters.map((c) => ({
        ...c,
        id: c._id || (c as unknown as { id: string }).id,
        _id: c._id || (c as unknown as { id: string }).id, // Ensure both are present for compatibility
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
            className="relative w-full h-full max-w-[95vw] max-h-[90vh] bg-mocha-50/98 border-none rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Loading Overlay (Modal Level) - Covers Header/Content/Footer */}
            <AnimatePresence>
              {!isGraphReady && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 z-[9999] flex items-center justify-center bg-mocha-50"
                >
                  <div className="flex flex-col items-center gap-6">
                    {/* Animated Network Icon */}
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="p-4 bg-white rounded-2xl shadow-mocha-sm border border-mocha-100"
                    >
                      <Network className="w-12 h-12 text-mocha-500" />
                    </motion.div>

                    {/* Step-by-Step Message */}
                    <div className="text-center space-y-2">
                      <p className="font-bold text-espresso-900">
                        관계도를 구성하고 있습니다
                      </p>
                      <motion.p
                        key={loadingStep}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-mocha-500 font-medium"
                      >
                        {loadingStep === 1 && "캐릭터 정보 로딩 중..."}
                        {loadingStep === 2 && "관계 데이터 분석 중..."}
                        {loadingStep === 3 && "그래프 배치 계산 중..."}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* [FIX] Close Button Moved into Header for consistent layout */}

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-mocha-100/30 bg-paper/60 backdrop-blur-lg z-10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-mocha-500 flex items-center justify-center shadow-mocha-sm">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-espresso-900 font-serif tracking-tight">
                    인물 관계도
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-mocha-500 font-medium font-serif">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {characters.length}명의 인물
                    </span>
                    <span className="text-mocha-200">•</span>
                    <span className="flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      {links.length}개의 관계
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <HelpTooltip />
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-mocha-100 rounded-full transition-colors text-mocha-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-hidden bg-mocha-50">
              <div className="absolute inset-0">
                <CharacterGraph
                  characters={memoizedNodes as Character[]}
                  links={links}
                  onNodeClick={(char: Character) => {
                    const charId = char?._id || (char as unknown as { id: string })?.id;
                    const selectedId =
                      selectedCharacter?._id;

                    if (
                      selectedCharacter &&
                      String(selectedId) === String(charId)
                    ) {
                      setIsCharacterDetailOpen(true);
                    } else {
                      setSelectedCharacter(char);
                    }
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
            <footer className="p-4 border-t border-mocha/10 shrink-0 bg-paper/60 backdrop-blur-lg">
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