// =====================================================
// 🔍 Relationship Deep Analysis UI Component
// 유대 깊이(Affinity Depth) 및 관계 팩터 시각화
// =====================================================

import { motion } from "framer-motion";
import { Zap, Shield, Target, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RelationshipFactor {
    label: string;
    value: number; // 0 ~ 100
    icon: typeof Zap;
    color: string;
}

interface DeepAnalysisUIProps {
    affinityDepth: number; // 0 ~ 100
    stability: number; // 0 ~ 100
    factors: RelationshipFactor[];
    className?: string;
}

export function DeepAnalysisUI({
    affinityDepth,
    stability,
    factors,
    className,
}: DeepAnalysisUIProps) {
    return (
        <div className={cn("space-y-8 p-6 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-paper", className)}>
            {/* Affinity Depth Hero */}
            <div className="relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br from-mocha-900 to-espresso-900 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Target className="w-32 h-32" />
                </div>

                <div className="relative z-10 space-y-2">
                    <p className="text-mocha-200 text-xs font-bold uppercase tracking-[0.2em]">Affinity Depth</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-5xl font-heading tracking-tighter">{affinityDepth}%</h2>
                        <span className="text-mocha-300 text-sm font-medium">유대 심도</span>
                    </div>

                    <div className="w-full h-1.5 bg-white/10 rounded-full mt-6 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${affinityDepth}%` }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                            className="h-full bg-gradient-to-r from-mocha-400 to-white"
                        />
                    </div>
                </div>
            </div>

            {/* Stability Gauge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-white/80 border border-cloud-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sage-50 rounded-xl">
                            <Shield className="w-4 h-4 text-sage-600" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">관계 안정성</p>
                            <p className="text-sm font-bold text-stone-800">{stability}% Stable</p>
                        </div>
                    </div>
                    <div className="w-16 h-1 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-sage-500" style={{ width: `${stability}%` }} />
                    </div>
                </div>

                <div className="p-5 rounded-3xl bg-white/80 border border-cloud-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-50 rounded-xl">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">잠재적 갈등</p>
                            <p className="text-sm font-bold text-stone-800">{100 - stability}% Potential</p>
                        </div>
                    </div>
                    <div className="w-16 h-1 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500" style={{ width: `${100 - stability}%` }} />
                    </div>
                </div>
            </div>

            {/* Factors Grid */}
            <div className="space-y-4">
                <h4 className="px-2 text-xs font-black text-espresso-900 uppercase tracking-[0.2em] opacity-40">Relationship Factors</h4>
                <div className="grid grid-cols-2 gap-3">
                    {factors.map((factor, idx) => (
                        <div key={idx} className="group p-4 rounded-2xl bg-white/50 border border-white/80 hover:bg-white hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={cn("p-2 rounded-lg", factor.color)}>
                                    <factor.icon className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-stone-600 truncate">{factor.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${factor.value}%` }}
                                        transition={{ delay: 0.5 + idx * 0.1 }}
                                        className="h-full bg-espresso-900"
                                    />
                                </div>
                                <span className="text-[10px] font-black text-espresso-900 font-mono italic">{factor.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DeepAnalysisUI;
