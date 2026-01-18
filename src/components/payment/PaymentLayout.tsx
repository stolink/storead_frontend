import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

interface PaymentLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PaymentLayout({ children, className }: PaymentLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F0F4EF] relative overflow-hidden flex items-center justify-center p-4 isolate">
      {/* Home Button */}
      <div className="absolute top-8 left-8 z-50">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-espresso-900 hover:bg-white/60 transition-all shadow-sm group font-medium"
        >
          <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm">Home</span>
        </Link>
      </div>
      {/* Dynamic Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden -z-20">
        <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-[#A47764] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-[#7A9878] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] bg-[#F3EAC0] rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Noise Texture & Vignette */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-sage-50/80 pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={cn("relative w-full max-w-5xl z-10", className)}
      >
        {children}
      </motion.div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-radial-gradient {
            background-image: radial-gradient(circle at center, transparent 0%, #F0F4EF 100%);
        }
      `}</style>
    </div>
  );
}
