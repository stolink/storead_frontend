/**
 * 관계도 모달 컴포넌트
 * CharacterGraph를 모달로 표시
 */
import { useState } from "react";
import { X } from "lucide-react";
import { CharacterGraph } from "@/components/CharacterGraph";
import { NetworkDetailPanel } from "@/components/viewer/NetworkDetailPanel";
import type { Character } from "@/types/character";
import type { RelationshipLink } from "@/types/characterGraph";

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  links: RelationshipLink[];
  chapterNumber?: number;
}

export function GraphModal({
  isOpen,
  onClose,
  characters,
  links,
  chapterNumber,
}: GraphModalProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] m-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              캐릭터 관계도
            </h2>
            {chapterNumber && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                제 {chapterNumber}화 시점
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Graph Container */}
        <div className="flex-1 overflow-hidden relative">
          {characters.length > 0 ? (
            <>
              <CharacterGraph
                characters={characters}
                links={links}
                showSearch={true}
                onNodeClick={(char) => {
                  console.log("Selected character:", char);
                  setSelectedCharacter(char);
                }}
              />
              {selectedCharacter && (
                <NetworkDetailPanel
                  selectedCharacter={selectedCharacter}
                  characters={characters}
                  links={links}
                  onClose={() => setSelectedCharacter(null)}
                  onNodeClick={(nodeId: string) => {
                    const nextChar = characters.find((c) => c._id === nodeId);
                    if (nextChar) setSelectedCharacter(nextChar);
                  }}
                  onViewProfile={() => {
                    console.log(
                      "View profile clicked for:",
                      selectedCharacter.profile.name
                    );
                  }}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-zinc-500 dark:text-zinc-400">
                이 챕터에는 관계도가 없습니다.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="p-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
            💡 노드를 클릭하면 캐릭터 정보를 볼 수 있습니다.
          </p>
        </footer>
      </div>
    </div>
  );
}
