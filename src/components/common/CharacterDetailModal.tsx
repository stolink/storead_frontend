import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Compass,
  UserRound,
  Palette,
  Heart,
  Users,
  BookOpen,
} from "lucide-react";
import type { Character } from "@/types/character";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Hooks & Components
import { useCharacterData } from "./character-detail/hooks/useCharacterData";
import { CharacterHeader } from "./character-detail/components/CharacterHeader";
import { CharacterTraits } from "./character-detail/components/CharacterTraits";
import { CharacterArc } from "./character-detail/components/CharacterArc";
import { CharacterRelationships } from "./character-detail/components/CharacterRelationships";
import { CharacterAppearances } from "./character-detail/components/CharacterAppearances";
import { CharacterAdditionalDetails } from "./character-detail/components/CharacterAdditionalDetails";
import { CharacterVisual } from "./character-detail/components/CharacterVisual";

interface CharacterDetailModalProps {
  character: Character | null;
  /** 현재 챕터 또는 뷰어에서 사용 가능한 전체 캐릭터 목록 (관계 이름 매핑용) */
  allCharacters?: Character[];
  isOpen: boolean;
  onClose: () => void;
}

export function CharacterDetailModal({
  character,
  allCharacters = [],
  isOpen,
  onClose,
}: CharacterDetailModalProps) {
  const { traits, relationships, appearances, arcProgress } = useCharacterData(
    character,
    allCharacters
  );

  if (!character) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl ring-1 ring-black/5">
        {/* Custom Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full p-2 bg-white/80 backdrop-blur-sm border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-white transition-all shadow-sm"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogTitle className="sr-only">
          {character.profile?.name || "캐릭터 상세 정보"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          캐릭터 상세 정보를 확인합니다.
        </DialogDescription>

        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Left Sidebar (Fixed) */}
          <div className="w-full lg:w-[400px] bg-stone-50/50 border-b lg:border-b-0 lg:border-r border-stone-200/60 p-8 flex flex-col overflow-y-auto shrink-0 scrollbar-none">
            <CharacterHeader character={character} />
          </div>

          {/* Right Content (Tabs) */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white/60">
            <Tabs
              defaultValue="overview"
              className="flex-1 flex flex-col rounded-none h-full"
            >
              <div className="border-b border-stone-200/60 px-6 bg-gradient-to-b from-white/80 to-stone-50/30 sticky top-0 z-10 backdrop-blur-md">
                <TabsList className="h-14 w-full justify-start gap-1 bg-transparent p-0">
                  <TabsTrigger
                    value="overview"
                    className="group h-full rounded-none border-b-2 border-transparent px-4 font-medium text-stone-500 transition-all data-[state=active]:border-rose-500 data-[state=active]:text-rose-900 data-[state=active]:font-semibold bg-transparent shadow-none hover:text-stone-900"
                  >
                    <Compass className="h-4 w-4 mr-2 opacity-60 group-data-[state=active]:opacity-100 group-data-[state=active]:text-rose-500 transition-all" />
                    개요
                  </TabsTrigger>
                  <span className="text-stone-300 self-center">·</span>
                  <TabsTrigger
                    value="profile"
                    className="group h-full rounded-none border-b-2 border-transparent px-4 font-medium text-stone-500 transition-all data-[state=active]:border-rose-500 data-[state=active]:text-rose-900 data-[state=active]:font-semibold bg-transparent shadow-none hover:text-stone-900"
                  >
                    <UserRound className="h-4 w-4 mr-2 opacity-60 group-data-[state=active]:opacity-100 group-data-[state=active]:text-rose-500 transition-all" />
                    프로필
                  </TabsTrigger>
                  <span className="text-stone-300 self-center">·</span>
                  <TabsTrigger
                    value="appearance"
                    className="group h-full rounded-none border-b-2 border-transparent px-4 font-medium text-stone-500 transition-all data-[state=active]:border-rose-500 data-[state=active]:text-rose-900 data-[state=active]:font-semibold bg-transparent shadow-none hover:text-stone-900"
                  >
                    <Palette className="h-4 w-4 mr-2 opacity-60 group-data-[state=active]:opacity-100 group-data-[state=active]:text-rose-500 transition-all" />
                    외모
                  </TabsTrigger>
                  <span className="text-stone-300 self-center">·</span>
                  <TabsTrigger
                    value="personality"
                    className="group h-full rounded-none border-b-2 border-transparent px-4 font-medium text-stone-500 transition-all data-[state=active]:border-rose-500 data-[state=active]:text-rose-900 data-[state=active]:font-semibold bg-transparent shadow-none hover:text-stone-900"
                  >
                    <Heart className="h-4 w-4 mr-2 opacity-60 group-data-[state=active]:opacity-100 group-data-[state=active]:text-rose-500 transition-all" />
                    성격
                  </TabsTrigger>
                  <span className="text-stone-300 self-center">·</span>
                  <TabsTrigger
                    value="relationships"
                    className="group h-full rounded-none border-b-2 border-transparent px-4 font-medium text-stone-500 transition-all data-[state=active]:border-rose-500 data-[state=active]:text-rose-900 data-[state=active]:font-semibold bg-transparent shadow-none hover:text-stone-900"
                  >
                    <Users className="h-4 w-4 mr-2 opacity-60 group-data-[state=active]:opacity-100 group-data-[state=active]:text-rose-500 transition-all" />
                    관계
                  </TabsTrigger>
                  <span className="text-stone-300 self-center">·</span>
                  <TabsTrigger
                    value="story"
                    className="group h-full rounded-none border-b-2 border-transparent px-4 font-medium text-stone-500 transition-all data-[state=active]:border-rose-500 data-[state=active]:text-rose-900 data-[state=active]:font-semibold bg-transparent shadow-none hover:text-stone-900"
                  >
                    <BookOpen className="h-4 w-4 mr-2 opacity-60 group-data-[state=active]:opacity-100 group-data-[state=active]:text-rose-500 transition-all" />
                    스토리
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Contents */}
              <ScrollArea className="flex-1 bg-gradient-to-br from-stone-50/20 to-white/20">
                <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 pb-20">
                  {/* OVERVIEW TAB */}
                  <TabsContent
                    value="overview"
                    className="space-y-8 m-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
                    {/* Quick Visuals */}
                    <CharacterVisual appearance={character.appearance} />

                    {/* Quick Story Progress */}
                    <CharacterArc progress={arcProgress} />
                  </TabsContent>

                  {/* PROFILE TAB (New Detailed Fields) */}
                  <TabsContent
                    value="profile"
                    className="space-y-8 m-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
                    {/* Backstory - Pull Quote Style */}
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 text-lg font-serif font-bold text-stone-800 border-b border-stone-200 pb-2">
                        <BookOpen className="h-4 w-4 text-rose-500/70" />
                        배경 스토리
                      </h3>
                      <div className="relative pl-8 py-4 italic font-serif text-lg leading-relaxed text-stone-700 before:content-['\201C'] before:absolute before:left-0 before:top-0 before:text-6xl before:text-stone-200 before:font-serif">
                        {character.profile.backstory ||
                          "아직 입력된 배경 스토리가 없습니다. 캐릭터의 과거, 성장 배경, 중요한 사건들을 기록할 수 있습니다."}
                      </div>
                    </div>
                  </TabsContent>

                  {/* APPEARANCE TAB */}
                  <TabsContent
                    value="appearance"
                    className="space-y-8 m-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
                    <CharacterVisual appearance={character.appearance} />
                  </TabsContent>

                  {/* PERSONALITY TAB */}
                  <TabsContent
                    value="personality"
                    className="space-y-8 m-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
                    <CharacterTraits traits={traits} />
                    <CharacterAdditionalDetails character={character} />
                  </TabsContent>

                  {/* RELATIONSHIPS TAB */}
                  <TabsContent
                    value="relationships"
                    className="space-y-8 m-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
                    <CharacterRelationships relationships={relationships} />
                  </TabsContent>

                  {/* STORY TAB */}
                  <TabsContent
                    value="story"
                    className="space-y-8 m-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
                    <CharacterAppearances appearances={appearances} />
                    <Separator className="bg-stone-200" />
                    <CharacterArc progress={arcProgress} />
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
