import {
  MapPin,
  Briefcase,
  Users2,
  BookMarked,
  Crown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Character } from "@/types/character";

// 역할별 한글 라벨 (직접 정의하거나 constants에서 가져옴)
const roleLabels: Record<string, { label: string; color: string }> = {
  protagonist: { label: "주인공", color: "bg-primary/20 text-primary border-primary/30" },
  antagonist: { label: "적대자", color: "bg-rose-50 text-rose-600 border-rose-200" },
  mentor: { label: "멘토", color: "bg-amber-50 text-amber-600 border-amber-200" },
  sidekick: { label: "조력자", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  supporting: { label: "조연", color: "bg-stone-100 text-stone-600 border-stone-200" },
  other: { label: "기타", color: "bg-stone-100 text-stone-600 border-stone-200" },
};

interface CharacterHeaderProps {
  character: Character;
  optimisticImageUrl?: string | null;
}

export function CharacterHeader({
  character,
  optimisticImageUrl,
}: CharacterHeaderProps) {
  const roleInfo =
    roleLabels[character.role as keyof typeof roleLabels] || roleLabels.other;

  const profile = character.profile;
  const name = profile?.name || "이름 없음";
  const age = profile?.age;
  const gender = profile?.gender;
  const faction = profile?.faction?.name;

  const fallbackTimestamp = character.meta?.updatedAt || "0";
  const displayImageUrl =
    optimisticImageUrl ||
    (character.imageUrl
      ? `${character.imageUrl}${character.imageUrl.includes("?") ? "&" : "?"}cb=${fallbackTimestamp}`
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
      <div className="magazine-image-container group shadow-xl">
        {displayImageUrl ? (
          <>
            <img
              src={displayImageUrl}
              alt={name}
              className="w-full h-full object-contain bg-cloud-50/50"
            />
            <div className="magazine-image-overlay" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cloud-100 via-cloud-50 to-white">
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
        <div className={cn("floating-badge", roleInfo.color)}>
          {roleInfo.label}
        </div>
      </div>

      {/* Main Identity Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="editorial-name text-4xl font-normal text-espresso-900 break-keep font-heading">
              {name}
            </h1>
            <p className="magazine-caption mt-1.5">
              {gender || "미정"} · {age ? `${age}세` : "나이 미상"}
            </p>
          </div>
        </div>

        {/* Profile Attributes - 2 Column Grid */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
          {profile?.occupation && (
            <div className="editorial-card p-3 hover-lift">
              <div className="flex items-center gap-2 mb-1.5">
                <Briefcase className="h-3.5 w-3.5 text-mocha-500" />
                <span className="editorial-label">직업</span>
              </div>
              <p className="text-sm font-semibold text-espresso-900 leading-snug">
                {profile.occupation}
              </p>
            </div>
          )}

          {profile?.birthplace && (
            <div className="editorial-card p-3 hover-lift">
              <div className="flex items-center gap-2 mb-1.5">
                <MapPin className="h-3.5 w-3.5 text-mocha-500" />
                <span className="editorial-label">출신</span>
              </div>
              <p className="text-sm font-semibold text-espresso-900 leading-snug">
                {profile.birthplace}
              </p>
            </div>
          )}

          {profile?.family && (
            <div className="editorial-card p-3 hover-lift">
              <div className="flex items-center gap-2 mb-1.5">
                <Users2 className="h-3.5 w-3.5 text-mocha-500" />
                <span className="editorial-label">가족</span>
              </div>
              <p className="text-sm font-semibold text-espresso-900 leading-snug">
                {profile.family}
              </p>
            </div>
          )}

          {character.firstAppearance && (
            <div className="editorial-card p-3 hover-lift">
              <div className="flex items-center gap-2 mb-1.5">
                <BookMarked className="h-3.5 w-3.5 text-mocha-500" />
                <span className="editorial-label">첫 등장</span>
              </div>
              <p className="text-sm font-semibold text-espresso-900 leading-snug">
                {character.firstAppearance}
              </p>
            </div>
          )}

          {faction && (
            <div className="editorial-card p-3 hover-lift col-span-2">
              <div className="flex items-center gap-2 mb-1.5">
                <Crown className="h-3.5 w-3.5 text-mocha-500" />
                <span className="editorial-label">소속 세력</span>
              </div>
              <p className="text-sm font-semibold text-espresso-900 leading-snug">
                {faction}
              </p>
            </div>
          )}
        </div>

        {/* Aliases as Editorial Tags */}
        {character.aliases && character.aliases.length > 0 && (
          <div className="pt-3">
            <span className="editorial-label block mb-2">별칭</span>
            <div className="flex flex-wrap gap-1.5">
              {character.aliases.map((alias, idx) => (
                <span key={idx} className="editorial-tag">
                  {alias}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Meta Footer */}
      <div className="mt-auto pt-6 border-t border-stone-100">
        <p className="magazine-caption text-xs">
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
