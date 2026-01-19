import { Library, PenTool, LogOut, Sparkles, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { SearchBar } from "@/components/home/SearchBar";
import { useCredits } from "@/hooks/useCredits";
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
  const { credits } = useCredits();

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
    <header className="sticky top-0 z-50 w-full border-b border-mocha-100/50 glass-warm transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center px-4 max-w-7xl">
        {/* Logo Area - 클릭 시 홈으로 이동 */}
        <Link
          to="/"
          className="flex items-center gap-2.5 mr-8 transition-all hover:opacity-90 active:scale-95"
        >
          <div className="relative w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-mocha-100 overflow-hidden group-hover:shadow-md transition-shadow">
            <img
              src="/logo.png"
              alt="StoRead Logo"
              className="w-full h-full object-cover scale-110"
            />
          </div>
          <span className="text-xl font-bold font-heading text-mocha-900 tracking-tight">
            StoRead
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
                  : "text-muted-foreground",
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 rounded-full hover:bg-mocha-50 shadow-md hover:shadow-lg transition-all p-0 border-transparent bg-white"
                >
                  <Avatar className="h-9 w-9 cursor-pointer border-2 border-white/50 shadow-sm transition-transform hover:scale-105">
                    <AvatarImage
                      src={
                        user?.profileImageUrl || "/avatars/default-avatar.png"
                      }
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-mocha-400 to-mocha-600 text-white flex items-center justify-center">
                      <User className="h-4.5 w-4.5 text-white" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-2 bg-white border border-stone-200 shadow-xl rounded-xl"
              >
                <div className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-mocha-500 flex items-center justify-center shrink-0 shadow-inner">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-bold text-espresso-900 truncate">
                        {user?.nickname || "사용자"}
                      </p>
                      <p className="text-xs text-stone-500 truncate font-medium">
                        {user?.email || "user@storead.com"}
                      </p>
                    </div>
                  </div>
                  {/* 크레딧 잔액 표시 섹션 추가 */}
                  <div className="mt-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-bold text-amber-800">
                        보유 크레딧
                      </span>
                    </div>
                    <span className="text-sm font-black text-amber-700">
                      {(credits?.balance ?? 0).toLocaleString()} C
                    </span>
                  </div>
                </div>

                <DropdownMenuSeparator className="my-1 bg-stone-100" />

                <div className="p-1 space-y-0.5">
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="px-3 py-2.5 rounded-lg hover:bg-mocha-50 focus:bg-mocha-50 cursor-pointer font-medium text-stone-600"
                  >
                    <User className="h-4 w-4 mr-2.5 text-mocha-400" />
                    프로필 관리
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/library")}
                    className="px-3 py-2.5 rounded-lg hover:bg-mocha-50 focus:bg-mocha-50 cursor-pointer font-medium text-stone-600"
                  >
                    <Library className="h-4 w-4 mr-2.5 text-mocha-400" />내 서재
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/author")}
                    className="px-3 py-2.5 rounded-lg hover:bg-mocha-50 focus:bg-mocha-50 cursor-pointer font-medium text-stone-600"
                  >
                    <PenTool className="h-4 w-4 mr-2.5 text-mocha-400" />
                    작가 대시보드
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="my-1 bg-stone-100" />

                <div className="p-1">
                  <DropdownMenuItem
                    onClick={() => navigate("/credits/charge")}
                    className="px-3 py-2.5 rounded-lg hover:bg-amber-50 focus:bg-amber-50 cursor-pointer font-medium text-amber-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2.5 text-amber-500" />
                    크레딧 충전
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="my-1 bg-stone-100" />

                <div className="p-1">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-2.5" />
                    로그아웃
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openAuthModal(undefined, "login")}
                className="text-stone-600 hover:text-mocha-700 hover:bg-mocha-50"
              >
                로그인
              </Button>
              <Button
                size="sm"
                onClick={() => openAuthModal(undefined, "register")}
                className="bg-mocha-500 hover:bg-mocha-600 text-white shadow-sm"
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
