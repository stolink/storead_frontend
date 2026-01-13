import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { CharacterRelationships } from "./character-detail/components/CharacterRelationships";
import { CharacterAppearances } from "./character-detail/components/CharacterAppearances";
import { CharacterAdditionalDetails } from "./character-detail/components/CharacterAdditionalDetails";
import { CharacterVisual } from "./character-detail/components/CharacterVisual";
import { CharacterCoreProfile } from "./character-detail/components/CharacterCoreProfile";

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
  const { traits, relationships, appearances } = useCharacterData(
    character,
    allCharacters
  );

  if (!character) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl h-[90vh] p-0 gap-0 overflow-hidden !bg-transparent shadow-none border-none ring-0 sm:rounded-3xl duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 [&>button]:hidden">
        {/* Visibility Hidden for SR */}
        <DialogTitle className="sr-only">
          {character.profile?.name || "캐릭터"} 상세 정보
        </DialogTitle>
        <DialogDescription className="sr-only">
          캐릭터의 상세 프로필, 외모, 성격, 관계 정보를 확인합니다.
        </DialogDescription>

        {/* Main Container Wrapper - stolink Style Glassmorphism (Light Theme) */}
        <div className="relative w-full h-full flex flex-col lg:flex-row bg-[#F9F7F2] rounded-none sm:rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-stone-200 isolate">
          {/* Living Background (Light Cream) */}
          <div className="absolute inset-0 -z-10 bg-white/40 opacity-50">
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-b from-mocha-100/40 to-white/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDuration: '10s' }} />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-stone-100/20 to-white/10 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
          </div>

          {/* Paper Texture Overlay */}
          <div className="absolute inset-0 -z-0 opacity-[0.4] pointer-events-none mix-blend-soft-light bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-125" />

          {/* Left Sidebar (Fixed Identity Panel) - Light Theme Sidebar */}
          <div className="w-full lg:w-[380px] bg-gradient-to-b from-paper/80 to-paper/70 backdrop-filter border-b lg:border-b-0 lg:border-r border-stone-200/50 p-10 flex flex-col overflow-y-auto shrink-0 scrollbar-hide z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <CharacterHeader
              character={character}
            />
          </div>

          {/* Right Content (Tabs) */}
          <div className="flex-1 flex flex-col overflow-hidden bg-transparent relative z-0">
            <Tabs
              defaultValue="overview"
              className="flex-1 min-h-0 flex flex-col rounded-none"
            >
              {/* ✨ Light Pill Tab Bar */}
              <div className="px-6 py-4 bg-white/50 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-stone-100/50 shadow-sm">
                <TabsList className="h-11 w-auto justify-start gap-1.5 bg-stone-100/50 p-1 rounded-full border border-stone-200/50 shadow-inner overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
                  <TabItem value="overview" icon={Compass} label="개요" />
                  <TabItem value="profile" icon={UserRound} label="프로필" />
                  <TabItem value="appearance" icon={Palette} label="외모" />
                  <TabItem value="personality" icon={Heart} label="성격" />
                  <TabItem value="relationships" icon={Users} label="관계" />
                  <TabItem value="biography" icon={BookOpen} label="기록" />
                </TabsList>

                {/* Right Side Actions (Close only) */}
                <div className="ml-auto flex items-center gap-2 pr-2">
                  <button
                    onClick={onClose}
                    className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <TabsContent
                value="overview"
                className="flex-1 m-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden"
              >
                <ScrollArea className="h-full">
                  <div className="p-8 lg:p-12 max-w-5xl mx-auto flex flex-col min-h-full space-y-10 pb-24">
                    {/* [1] 핵심 프로필 & 외모 특징 (2-Column Grid) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="p-1 px-1">
                        <CharacterCoreProfile character={character} />
                      </div>
                      <div className="p-1 px-1">
                        <CharacterVisual appearance={character.appearance} />
                      </div>
                    </div>

                    {/* [3] 등장 정보 (Appearances - Bottom Section) */}
                    <div className="pt-4 flex-1 flex flex-col">
                      <CharacterAppearances appearances={appearances} />
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* PROFILE TAB */}
              <TabsContent
                value="profile"
                className="flex-1 m-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden overscroll-contain"
              >
                <ScrollArea className="h-full">
                  <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-12 pb-24">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-stone-200/50 pb-3">
                        <BookOpen className="h-4 w-4 text-mocha-500" />
                        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest font-heading">
                          배경 스토리
                        </h3>
                      </div>
                      <div className="relative pl-8 py-4 italic font-serif text-lg leading-relaxed text-stone-700 before:content-['\201C'] before:absolute before:left-0 before:top-0 before:text-6xl before:text-stone-100 before:font-serif">
                        {character.profile.backstory ||
                          "아직 입력된 배경 스토리가 없습니다."}
                      </div>
                    </div>
                    <CharacterAdditionalDetails
                      character={character}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* APPEARANCE TAB */}
              <TabsContent
                value="appearance"
                className="flex-1 m-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden overscroll-contain"
              >
                <ScrollArea className="h-full">
                  <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-12 pb-24">
                    <div className="p-1 px-1">
                      <CharacterVisual
                        appearance={character.appearance}
                      />
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* PERSONALITY TAB */}
              <TabsContent
                value="personality"
                className="flex-1 m-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden overscroll-contain"
              >
                <ScrollArea className="h-full">
                  <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-12 pb-24">
                    <CharacterTraits
                      traits={traits}
                    />
                    <CharacterAdditionalDetails character={character} />
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* RELATIONSHIPS TAB */}
              <TabsContent
                value="relationships"
                className="flex-1 m-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden overscroll-contain"
              >
                <ScrollArea className="h-full">
                  <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-12 pb-24">
                    <CharacterRelationships relationships={relationships} />
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* BIOGRAPHY TAB */}
              <TabsContent
                value="biography"
                className="flex-1 m-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden overscroll-contain"
              >
                <ScrollArea className="h-full">
                  <div className="p-8 lg:p-12 max-w-4xl mx-auto flex flex-col min-h-full space-y-12 pb-24">
                    <div className="flex-1 flex flex-col">
                      <CharacterAppearances appearances={appearances} />
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper Component for Tabs
function TabItem({
  value,
  icon: Icon,
  label,
}: {
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className="group relative h-9 px-6 rounded-full font-bold text-stone-400 transition-all
      data-[state=active]:text-white data-[state=active]:bg-[#5C3D2E] data-[state=active]:shadow-lg
      hover:text-stone-900 hover:bg-stone-200/50"
    >
      <span className="relative z-10 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 opacity-70 group-data-[state=active]:opacity-100 transition-opacity" />
        <span className="text-sm tracking-tight">{label}</span>
      </span>
    </TabsTrigger>
  );
}
