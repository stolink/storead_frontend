/**
 * 공통 헤더 컴포넌트
 * 검색바, 탭 네비게이션, 사용자 메뉴
 * 전역 테마 지원
 */
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, User } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { useThemeStore, headerThemeClasses } from "@/stores/useTheme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openAuthModal } = useAuthModalStore();
  const { theme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState("");

  // 현재 탭 결정
  const currentTab =
    location.pathname === "/"
      ? "전체"
      : location.pathname === "/library"
      ? "내 서재"
      : location.pathname.startsWith("/author")
      ? "작품 관리"
      : "전체";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 테마별 텍스트 색상
  const textColor =
    theme === "light"
      ? "text-zinc-900"
      : theme === "dark"
      ? "text-zinc-100"
      : "text-amber-900";

  const mutedTextColor =
    theme === "light"
      ? "text-zinc-600"
      : theme === "dark"
      ? "text-zinc-400"
      : "text-amber-700";

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur transition-colors duration-300 ${headerThemeClasses[theme]}`}
    >
      <div className="container mx-auto px-6 py-4">
        {/* 메인 헤더 행 */}
        <div className="flex items-center justify-between gap-8">
          {/* 로고 - 테마와 관계없이 항상 명확하게 표시 */}
          <Link to="/" className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              StoRead
            </span>
          </Link>

          {/* 중앙 검색바 */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${mutedTextColor}`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색"
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:border-purple-600 transition-colors ${
                  theme === "light"
                    ? "border-zinc-300 bg-white text-zinc-900"
                    : theme === "dark"
                    ? "border-zinc-600 bg-zinc-800 text-zinc-100"
                    : "border-amber-300 bg-amber-50 text-amber-900"
                }`}
              />
            </div>
          </form>

          {/* 프로필 아이콘 */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user?.profileImageUrl}
                        alt={user?.nickname}
                      />
                      <AvatarFallback className="bg-zinc-200">
                        <User className="w-5 h-5 text-zinc-700" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.nickname}</p>
                    <p className="text-xs text-zinc-500">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    프로필 설정
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/library")}>
                    내 서재
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/author")}>
                    작품 관리
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center justify-center w-10 h-10 bg-zinc-200 rounded-full hover:bg-zinc-300 transition-colors"
              >
                <User className="w-5 h-5 text-zinc-700" />
              </button>
            )}
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <nav className="flex gap-8 mt-4">
          <Link
            to="/"
            className={`pb-2 border-b-2 transition-colors ${
              currentTab === "전체"
                ? "border-purple-600 text-purple-600"
                : `border-transparent ${mutedTextColor} hover:${textColor}`
            }`}
          >
            전체
          </Link>
          <Link
            to="/library"
            className={`pb-2 border-b-2 transition-colors ${
              currentTab === "내 서재"
                ? "border-purple-600 text-purple-600"
                : `border-transparent ${mutedTextColor} hover:${textColor}`
            }`}
          >
            내 서재
          </Link>
          <Link
            to="/author"
            className={`pb-2 border-b-2 transition-colors ${
              currentTab === "작품 관리"
                ? "border-purple-600 text-purple-600"
                : `border-transparent ${mutedTextColor} hover:${textColor}`
            }`}
          >
            작품 관리
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
