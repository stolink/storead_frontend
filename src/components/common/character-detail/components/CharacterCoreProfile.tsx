import { User, Shield, Briefcase, Hash } from "lucide-react";
import type { Character } from "@/types/character";

interface CharacterCoreProfileProps {
    character: Character;
}

export function CharacterCoreProfile({ character }: CharacterCoreProfileProps) {
    const profile = character.profile;

    const fields = [
        { label: "직업", value: profile.occupation || (character as any).occupation, icon: Briefcase },
        { label: "소속", value: profile.faction?.name || (character as any).faction?.name, icon: Shield },
        { label: "나이", value: profile.age || (character as any).age, icon: Hash },
        { label: "성별", value: profile.gender || (character as any).gender, icon: User },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-200/50 pb-4">
                <span className="text-xl">👤</span>
                <h3 className="text-sm font-bold text-stone-900/80 uppercase tracking-widest font-heading">
                    핵심 프로필
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {fields.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 transform transition-transform hover:scale-[1.02]">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-stone-100">
                                <Icon className="h-4 w-4 text-stone-600" />
                            </div>
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter">{label}</span>
                        </div>
                        <p className="text-sm font-bold text-stone-900 truncate">
                            {value || <span className="text-stone-300 font-normal italic">정보 없음</span>}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
