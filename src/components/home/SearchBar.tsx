/**
 * 검색창 컴포넌트
 * URL 파라미터와 연동하여 검색어 입력 시 자동 검색
 */
import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
    /** 추가 클래스명 */
    className?: string;
    /** 플레이스홀더 텍스트 */
    placeholder?: string;
}

export function SearchBar({
    className,
    placeholder = "작품, 작가 검색...",
}: SearchBarProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get("search") || "";
    const [query, setQuery] = useState(initialQuery);

    // 검색 실행 (URL 파라미터 업데이트)
    const handleSearch = useCallback(() => {
        if (query.trim()) {
            setSearchParams({ search: query.trim() });
        } else {
            // 검색어가 비어있으면 파라미터 제거
            searchParams.delete("search");
            setSearchParams(searchParams);
        }
    }, [query, searchParams, setSearchParams]);

    // Enter 키로 검색
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    // 검색어 초기화
    const handleClear = () => {
        setQuery("");
        searchParams.delete("search");
        setSearchParams(searchParams);
    };

    return (
        <div
            className={cn(
                "relative flex items-center w-full max-w-md",
                className
            )}
        >
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={cn(
                        "w-full h-10 pl-10 pr-10 rounded-lg",
                        "bg-muted/50 border border-border",
                        "text-sm text-foreground placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                        "transition-colors duration-200"
                    )}
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="검색어 지우기"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

export default SearchBar;
