import { MapPin, Briefcase, Users2, BookMarked, Crown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Character } from "@/types/character";

interface CharacterHeaderProps {
  character: Character;
  optimisticImageUrl?: string | null;
}

const roleLabels: Record<string, { label: string; color: string }> = {
  protagonist: {
    label: "주인공",
    color: "bg-rose-100 text-rose-700 border-rose-200",
  },
  antagonist: {
    label: "반동인물",
    color: "bg-stone-800 text-stone-100 border-stone-700",
  },
  supporting: {
    label: "조연",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  mentor: {
    label: "멘토",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  sidekick: {
    label: "조력자",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  other: {
    label: "기타",
    color: "bg-stone-100 text-stone-600 border-stone-200",
  },
};

export function CharacterHeader({
  character,
  optimisticImageUrl,
}: CharacterHeaderProps) {
  const roleInfo = roleLabels[character.role || "other"];

  const profile = character.profile;
  const name = profile?.name || "이름 없음";
  const age = profile?.age;
  const gender = profile?.gender;
  const faction = profile?.faction?.name;

  const fallbackTimestamp = character.meta?.updatedAt || "0";
  const displayImageUrl =
    optimisticImageUrl ||
    (character.imageUrl
      ? `${character.imageUrl}${
          character.imageUrl.includes("?") ? "&" : "?"
        }cb=${fallbackTimestamp}`
      : null);

  // Role emoji mapping
  const roleEmoji =
    character.role === "protagonist"
      ? "🦸"
      : character.role === "antagonist"
      ? "🦹"
      : character.role === "mentor"
      ? "🧙"
      : "👤";

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Magazine-style Image Container */}
      <div className="magazine-image-container group shadow-xl relative aspect-[3/4] overflow-hidden rounded-xl bg-stone-100">
        {displayImageUrl ? (
          <>
            <img
              src={displayImageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 via-stone-50 to-white">
            <span
              className="text-8xl filter drop-shadow-lg select-none opacity-60"
              role="img"
              aria-label={character.role}
            >
              {roleEmoji}
            </span>
          </div>
        )}

        {/* Floating Role Badge */}
        <div
          className={cn(
            "absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm backdrop-blur-md bg-white/80",
            roleInfo.color
          )}
        >
          {roleInfo.label}
        </div>
      </div>

      {/* Main Identity Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-normal text-stone-900 break-keep font-serif">
              {name}
            </h1>
            <p className="text-stone-500 text-sm mt-1.5 font-medium">
              {gender || "미정"} · {age ? `${age}세` : "나이 미상"}
            </p>
          </div>
        </div>

        {/* Profile Attributes - 2 Column Grid */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
          {profile?.occupation && (
            <div className="bg-white p-3 rounded-lg border border-stone-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-1.5">
                <Briefcase className="h-3.5 w-3.5 text-rose-500/70" />
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  직업
                </span>
              </div>
              <p className="text-sm font-semibold text-stone-800 leading-snug">
                {profile.occupation}
              </p>
            </div>
          )}

          {profile?.birthplace && (
            <div className="bg-white p-3 rounded-lg border border-stone-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-1.5">
                <MapPin className="h-3.5 w-3.5 text-rose-500/70" />
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  출신
                </span>
              </div>
              <p className="text-sm font-semibold text-stone-800 leading-snug">
                {profile.birthplace}
              </p>
            </div>
          )}

          {profile?.family && (
            <div className="bg-white p-3 rounded-lg border border-stone-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-1.5">
                <Users2 className="h-3.5 w-3.5 text-rose-500/70" />
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  가족
                </span>
              </div>
              <p className="text-sm font-semibold text-stone-800 leading-snug">
                {profile.family}
              </p>
            </div>
          )}

          {character.firstAppearance && (
            <div className="bg-white p-3 rounded-lg border border-stone-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-1.5">
                <BookMarked className="h-3.5 w-3.5 text-rose-500/70" />
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  첫 등장
                </span>
              </div>
              <p className="text-sm font-semibold text-stone-800 leading-snug">
                {character.firstAppearance}
              </p>
            </div>
          )}

          {faction && (
            <div className="bg-white p-3 rounded-lg border border-stone-100 shadow-sm hover:shadow-md transition-all col-span-2">
              <div className="flex items-center gap-2 mb-1.5">
                <Crown className="h-3.5 w-3.5 text-rose-500/70" />
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  소속 세력
                </span>
              </div>
              <p className="text-sm font-semibold text-stone-800 leading-snug">
                {faction}
              </p>
            </div>
          )}
        </div>

        {/* Aliases as Editorial Tags */}
        {character.aliases && character.aliases.length > 0 && (
          <div className="pt-3">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">
              별칭
            </span>
            <div className="flex flex-wrap gap-1.5">
              {character.aliases.map((alias, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-stone-100 text-stone-600 rounded-md text-xs font-medium border border-stone-200"
                >
                  {alias}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Meta Footer */}
      <div className="mt-auto pt-6 border-t border-stone-100">
        <p className="text-[10px] text-stone-400 font-serif italic text-right">
          마지막 수정:{" "}
          {character.meta?.updatedAt
            ? new Date(character.meta.updatedAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "알 수 없음"}
        </p>
      </div>
    </div>
  );
}
