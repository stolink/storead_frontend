import React from "react";
import { PenLine, Headset, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

export const FloatingActionButton = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-50">
      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-zinc-100 dark:border-zinc-700 text-zinc-500 hover:text-mocha-500 transition-all hover:scale-110"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      {/* Write Button (Nudge) */}
      <Link
        to="/write"
        className="group relative w-12 h-12 flex items-center justify-center rounded-full bg-mocha-600 shadow-xl shadow-mocha-500/20 text-white transition-all hover:scale-110 hover:rotate-3"
      >
        <PenLine className="w-5 h-5" />
        <span className="absolute right-full mr-3 px-2 py-1 rounded bg-zinc-900 text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          작품 쓰러 가기
        </span>
      </Link>

      {/* Support Button */}
      <Link
        to="/support"
        className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-zinc-100 dark:border-zinc-700 text-zinc-500 hover:text-mocha-500 transition-all hover:scale-110"
      >
        <Headset className="w-5 h-5" />
      </Link>
    </div>
  );
};
