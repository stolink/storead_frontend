import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { useThemeStore } from "@/stores/useTheme";

interface ViewedWork {
  id: string;
  title: string;
  thumbnail: string;
}

const STORAGE_KEY = "storead_recent_history";

export const HistoryStack = () => {
  const [history, setHistory] = useState<ViewedWork[]>([]);
  const { theme } = useThemeStore();

  useEffect(() => {
    const loadHistory = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setHistory(JSON.parse(stored).slice(0, 5));
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      }
    };

    loadHistory();
    // Listen for storage changes in the same tab (custom event)
    window.addEventListener("history-update", loadHistory);
    return () => window.removeEventListener("history-update", loadHistory);
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800">
      <h3 className="text-xs font-black text-espresso-900 dark:text-zinc-100 mb-4 uppercase tracking-widest flex items-center gap-2">
        <div className="w-1 h-3 bg-mocha-500 rounded-full" />
        최근 본 작품
      </h3>
      <div className="flex flex-col gap-3">
        {history.map((work) => (
          <Link
            key={work.id}
            to={`/works/${work.id}`}
            className="flex gap-3 items-center group"
          >
            <div className="w-10 h-14 rounded-md overflow-hidden bg-zinc-100 shrink-0 shadow-sm">
              <img
                src={work.coverImageUrl}
                alt={work.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[11px] font-bold text-espresso-900 dark:text-zinc-100 truncate group-hover:text-mocha-500">
                {work.title}
              </h4>
              <p className="text-[9px] text-zinc-400 truncate">
                {work.authorNickname}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Helper function to add items to history
export const addToHistory = (work: ViewedWork) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  let history: ViewedWork[] = stored ? JSON.parse(stored) : [];

  // Remove existing and add to front
  history = history.filter((h) => h.id !== work.id);
  history.unshift(work);

  // Keep last 10
  history = history.slice(0, 10);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  window.dispatchEvent(new Event("history-update"));
};
