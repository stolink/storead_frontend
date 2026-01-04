import { Book, Library, PenTool, LogOut, Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { SearchBar } from "@/components/home/SearchBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * 글로벌 헤더 컴포넌트
 * - 로고 클릭 시 홈으로 이동
 * - 로그인 상태에 따라 프로필/로그인 버튼 분기
 */
export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { openAuthModal } = useAuthModalStore();

  // 내 작품(작가 대시보드)으로 변경, 내 서재 유지
  const navItems = [
    { label: "내 작품", href: "/author", icon: PenTool },
    { label: "내 서재", href: "/library", icon: Library },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 max-w-7xl">
        {/* Logo Area - 클릭 시 홈으로 이동 */}
        <Link
          to="/"
          className="flex items-center gap-2 mr-8 transition-opacity hover:opacity-80"
        >
          <Book className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold font-heading text-foreground tracking-tight">
            Storead
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-2 transition-colors hover:text-primary",
                location.pathname === item.href
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Search Bar - 네비게이션과 프로필 사이 */}
        <div className="flex-1 flex justify-center px-4 max-w-md mx-auto">
          <SearchBar className="hidden md:flex w-full" />
        </div>

        {/* Right Actions - 로그인 상태 분기 */}
        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback className="bg-mocha-700 text-paper font-medium">
                      {user?.nickname?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user?.nickname || "사용자"}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  프로필 수정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/library")}>
                  내 서재
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/author")}>
                  내 작품 관리
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/credits/charge")}
                  className="text-mocha-600 font-medium"
                >
                  <Sparkles className="h-4 w-4 mr-2 text-mocha-500" />
                  크레딧 충전
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openAuthModal(undefined, "login")}
              >
                로그인
              </Button>
              <Button
                size="sm"
                onClick={() => openAuthModal(undefined, "register")}
              >
                회원가입
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
