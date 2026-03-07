import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "홈", path: "/" },
  { label: "판타지", path: "/category/FANTASY" },
  { label: "로맨스", path: "/category/ROMANCE" },
  { label: "무협", path: "/category/MARTIAL_ARTS" },
  { label: "랭킹", path: "/ranking" },
];

export function CategoryNavbar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10",
        className,
      )}
    >
      <div className="container mx-auto px-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 py-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold shadow-md transform scale-105"
                    : "bg-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
