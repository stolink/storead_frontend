import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Layers } from "lucide-react";
import { type Work } from "@/types";
import { MiniBookCard } from "./MiniBookCard";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-container";

interface ThemeTab {
  id: string;
  label: string;
}

interface DenseThemeSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  works: Work[];
  tabs?: ThemeTab[];
  onTabChange?: (tabId: string) => void;
  viewAllLink?: string;
  maxItems?: number;
  className?: string;
}

export function DenseThemeSection({
  title,
  subtitle,
  icon,
  works,
  tabs,
  onTabChange,
  viewAllLink,
  maxItems = 12,
  className,
}: DenseThemeSectionProps) {
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const displayWorks = works.slice(0, maxItems);

  return (
    <section className={`py-8 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        {/* Header Area */}
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-mocha-100 dark:bg-zinc-800 rounded-lg text-mocha-600 dark:text-mocha-400">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-heading font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              {title}
              {viewAllLink && (
                <Link
                  to={viewAllLink}
                  className="text-zinc-400 hover:text-mocha-500 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              )}
            </h2>
            {subtitle && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Tabs Area */}
        {tabs && (
          <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg self-start md:self-auto overflow-x-auto max-w-full no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                                    px-4 py-1.5 rounded-md text-sm font-bold whitespace-nowrap transition-all
                                    ${
                                      activeTab === tab.id
                                        ? "bg-white dark:bg-zinc-700 text-mocha-600 shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                    }
                                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Grid */}
      <StaggerContainer
        key={activeTab}
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-8"
      >
        {displayWorks.length > 0 ? (
          displayWorks.map((work, idx) => (
            <StaggerItem key={work.id}>
              <MiniBookCard
                work={work}
                ranking={
                  idx < 3 && title.includes("Rank") ? idx + 1 : undefined
                }
                badge={idx === 0 ? "Best" : undefined}
                badgeColor="gold"
              />
            </StaggerItem>
          ))
        ) : (
          // Empty State Check
          <div className="col-span-full py-12 text-center text-zinc-400 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">준비된 작품이 없습니다.</p>
          </div>
        )}
      </StaggerContainer>
    </section>
  );
}
