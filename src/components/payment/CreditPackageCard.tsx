import type { CreditPackage } from "@/types/payment";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Check, Sparkles, Crown } from "lucide-react";
import type { MouseEvent } from "react";

interface CreditPackageCardProps {
  packageData: CreditPackage;
  selected: boolean;
  onSelect: (id: number) => void;
}

export function CreditPackageCard({
  packageData,
  selected,
  onSelect,
}: CreditPackageCardProps) {
  const totalCredit = packageData.creditAmount + packageData.bonusCredit;
  const isBestValue = packageData.bonusCredit > 0 && packageData.price >= 30000;

  // Spotlight Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      onClick={() => onSelect(packageData.id)}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative rounded-3xl border border-transparent bg-white/40 p-1 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
        selected ? "scale-[1.02]" : ""
      )}
      style={
        {
          // Optional: Add tilt if desired, but keeping it subtle here
        }
      }
    >
      {/* Moving Spotlight Gradient Border */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(164, 119, 100, 0.4),
              transparent 80%
            )
          `,
        }}
      />

      {/* Main Content Container */}
      <div
        className={cn(
          "relative h-full overflow-hidden rounded-[22px] bg-white/60 backdrop-blur-xl p-6 transition-colors",
          selected
            ? "bg-white/90 shadow-2xl shadow-mocha-900/10 ring-1 ring-mocha-500/20"
            : "hover:bg-white/80"
        )}
      >
        {/* Subtle Noise Texture on Card */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] mix-blend-multiply pointer-events-none" />

        {/* Selection Indicator (Top Right) */}
        <div
          className={cn(
            "absolute top-5 right-5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 z-10",
            selected
              ? "bg-mocha-500 scale-110 shadow-lg shadow-mocha-500/30"
              : "bg-mocha-100/50"
          )}
        >
          <motion.div initial={false} animate={{ scale: selected ? 1 : 0 }}>
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </motion.div>
        </div>

        {/* Header Tags */}
        <div className="flex flex-col items-start gap-2 mb-6">
          {packageData.isPopular && (
            <Badge className="bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 border-0 shadow-lg shadow-amber-500/20 px-3 py-1 text-xs">
              <Crown className="w-3 h-3 mr-1 fill-current" />
              PREMIUM CHOICE
            </Badge>
          )}
          {!packageData.isPopular && isBestValue && (
            <Badge
              variant="outline"
              className="border-mocha-400 text-mocha-600 bg-mocha-50/50"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              BEST VALUE
            </Badge>
          )}
        </div>

        {/* Title & Price */}
        <div className="relative z-10">
          <h3 className="text-sm font-medium text-mocha-600 tracking-wide uppercase mb-1">
            {packageData.name}
          </h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-bold font-serif text-espresso-900 tracking-tight">
              {Number(packageData.price).toLocaleString()}
            </span>
            <span className="text-lg text-mocha-400 font-light">WON</span>
          </div>

          <div className="space-y-3 pt-6 border-t border-mocha-100/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-mocha-500">기본 제공</span>
              <span className="font-semibold text-espresso-900 font-mono">
                {packageData.creditAmount.toLocaleString()} C
              </span>
            </div>
            {packageData.bonusCredit > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 보너스
                </span>
                <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded font-mono">
                  +{packageData.bonusCredit.toLocaleString()} C
                </span>
              </div>
            )}
          </div>

          {/* Total Bottom Bar */}
          <div
            className={cn(
              "mt-6 p-4 rounded-xl flex justify-between items-center transition-colors",
              selected
                ? "bg-mocha-50 text-mocha-900"
                : "bg-gray-50 text-gray-500"
            )}
          >
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total
            </span>
            <span className="text-xl font-bold tabular-nums">
              {totalCredit.toLocaleString()} C
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
