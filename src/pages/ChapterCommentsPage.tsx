/**
 * 챕터 댓글 전용 페이지
 * 대댓글, 좋아요, 정렬(좋아요순/최신순) 지원
 */
import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CommentItemView } from "@/components/comments/CommentItemView";
import { usePublicChapter, usePublicWork } from "@/hooks/useDiscovery";
import {
  useComments,
  useCreateComment,
  useCreateReply,
  useToggleCommentLike,
} from "@/hooks/useComments";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  themeClasses,
  headerThemeClasses,
  backgroundThemeClasses,
  cardThemeClasses,
  dividerThemeClasses,
  type Theme,
} from "@/stores/useTheme";
import { cn } from "@/lib/utils";

type SortBy = "latest" | "popular";

// 테마별 스타일 (ChapterViewerPage와 동일하게 맞춤)
const getThemeStyle = (theme: Theme) => {
  const styles = {
    light: {
      container: "bg-white text-zinc-900",
      text: "text-zinc-900",
      subText: "text-zinc-500",
      bg: "bg-white",
      border: "border-zinc-200",
      accent: "text-mocha-700",
    },
    dark: {
      container: "bg-mocha-900 text-white", // Viewer와 동일한 배경색
      text: "text-white",
      subText: "text-white/60",
      bg: "bg-mocha-900",
      border: "border-white/10",
      accent: "text-mocha-300", // 다크모드에서 잘 보이는 밝은 색
    },
    sepia: {
      container: "bg-amber-50 text-amber-900",
      text: "text-amber-900",
      subText: "text-amber-900/60",
      bg: "bg-amber-50",
      border: "border-amber-200",
      accent: "text-mocha-700",
    },
    ivory: {
      container: "bg-[#FFFFF0] text-[#5D4E37]",
      text: "text-[#5D4E37]",
      subText: "text-[#5D4E37]/60",
      bg: "bg-[#FFFFF0]",
      border: "border-[#E0D5BC]",
      accent: "text-mocha-700",
    },
  };
  return styles[theme];
};

export const ChapterCommentsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // 뷰어와 동일한 테마 설정을 사용하기 위해 localStorage에서 읽어옴
  const [theme] = useState<Theme>(
    () => (localStorage.getItem("viewer_theme") as Theme) || "light",
  );
  const { isAuthenticated, user } = useAuthStore();

  const [sortBy, setSortBy] = useState<SortBy>("latest");
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // 데이터 페칭
  const { data: chapter } = usePublicChapter(id || "");
  const { data: work } = usePublicWork(chapter?.workId || "");
  // sortBy를 API에 전달하여 서버사이드 정렬 적용
  const apiSort = sortBy === "popular" ? "likes" : "latest";
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useComments(id || "", undefined, apiSort);
  const createComment = useCreateComment(id || "");
  const createReply = useCreateReply(id || "");
  const toggleLike = useToggleCommentLike(id || "", undefined, apiSort);

  // 댓글 평탄화 및 정렬
  const allComments = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const sortedComments = useMemo(() => {
    const topLevelComments = allComments.filter((c) => c.parentId === null);
    return [...topLevelComments].sort((a, b) => {
      if (sortBy === "popular") {
        return b.likeCount - a.likeCount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [allComments, sortBy]);

  // 테마 스타일 가져오기
  const styles = getThemeStyle(theme);

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated || !id) return;
    try {
      await createComment.mutateAsync({
        chapterId: id || "",
        content: newComment.trim(),
      });
      setNewComment("");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    }
  };

  // 대댓글 작성 (useCallback으로 안정화)
  // ✅ useCreateReply 훅을 사용하여 올바른 엔드포인트(POST /comments/{parentId}/replies) 호출
  const handleSubmitReply = useCallback(
    async (parentId: string) => {
      console.log("[DEBUG] handleSubmitReply called:", {
        parentId,
        replyContent,
        isAuthenticated,
      });
      if (!replyContent.trim() || !isAuthenticated) {
        console.log("[DEBUG] Reply skipped - validation failed");
        return;
      }
      try {
        console.log("[DEBUG] Calling createReply.mutateAsync...");
        await createReply.mutateAsync({
          parentId,
          content: replyContent.trim(),
        });
        console.log("[DEBUG] createReply.mutateAsync completed");
        setReplyContent("");
        setReplyTo(null);
      } catch (error) {
        console.error("대댓글 작성 실패:", error);
      }
    },
    [replyContent, isAuthenticated, createReply],
  );

  // 좋아요 토글 핸들러 (useCallback으로 안정화)
  const handleToggleLike = useCallback(
    (commentId: string, parentId?: string | null) => {
      toggleLike.mutate({ commentId, parentId });
    },
    [toggleLike],
  );

  // 답글 대상 설정 핸들러 (useCallback으로 안정화)
  const handleSetReplyTo = useCallback((commentId: string | null) => {
    setReplyTo(commentId);
  }, []);

  // 답글 내용 변경 핸들러 (useCallback으로 안정화)
  const handleReplyContentChange = useCallback((content: string) => {
    setReplyContent(content);
  }, []);

  return (
    <div
      className={cn(
        "min-h-screen transition-colors",
        styles.container,
        // 다크 테마일 경우 부모 요소에 dark 클래스 추가하여 하위 컴포넌트(CommentItemView 등)의 다크 모드 스타일 지원
        theme === "dark" && "dark",
      )}
    >
      {/* 헤더 */}
      <header
        className={cn(
          "sticky top-0 z-40 backdrop-blur-sm border-b",
          styles.bg,
          "bg-opacity-80",
          styles.border,
        )}
      >
        <div className="flex items-center px-4 h-14">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className={cn("ml-2")}>
            <p className={cn("text-xs", styles.subText)}>{work?.title}</p>
            <p className={cn("text-sm font-serif", styles.text)}>
              {chapter?.chapterNumber}화 댓글
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-24">
        {/* 정렬 필터 */}
        <div
          className={cn(
            "flex items-center justify-between py-4 border-b",
            styles.border,
          )}
        >
          <span className={cn("font-serif font-medium", styles.text)}>
            댓글 <span className={cn(styles.accent)}>{allComments.length}</span>
          </span>
          <div className={cn("flex items-center gap-2 text-sm", styles.text)}>
            <button
              onClick={() => setSortBy("latest")}
              className={cn(sortBy === "latest" ? "font-medium" : "opacity-50")}
            >
              최신순
            </button>
            <span className="opacity-30">|</span>
            <button
              onClick={() => setSortBy("popular")}
              className={cn(
                sortBy === "popular" ? "font-medium" : "opacity-50",
              )}
            >
              좋아요순
            </button>
          </div>
        </div>

        {/* 댓글 목록 */}
        <div className={cn("divide-y", styles.border)}>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin opacity-50" />
            </div>
          ) : sortedComments.length === 0 ? (
            <div className={cn("text-center py-16 opacity-50", styles.text)}>
              <p className="mb-2 font-serif">아직 댓글이 없습니다.</p>
              <p className="text-sm">첫 번째 댓글을 남겨보세요!</p>
            </div>
          ) : (
            sortedComments.map((comment) => (
              <CommentItemView
                key={comment.id}
                comment={comment}
                replyToId={replyTo}
                replyContent={replyContent}
                allComments={allComments}
                dividerClass={styles.border}
                onToggleLike={handleToggleLike}
                onSetReplyTo={handleSetReplyTo}
                onReplyContentChange={handleReplyContentChange}
                onSubmitReply={handleSubmitReply}
              />
            ))
          )}
        </div>

        {/* 더보기 */}
        {hasNextPage && (
          <div className="flex justify-center py-4">
            <Button
              variant="ghost"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "더보기"
              )}
            </Button>
          </div>
        )}
      </main>

      {/* 하단 고정 입력창 */}
      {isAuthenticated ? (
        <div
          className={cn(
            "fixed bottom-0 left-0 right-0 border-t backdrop-blur-sm p-4",
            styles.bg,
            "bg-opacity-95",
            styles.border,
          )}
        >
          <div className="max-w-2xl mx-auto flex gap-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback>
                {user?.nickname?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className={cn(
                "flex-1 bg-transparent border rounded-full px-4 py-2 text-sm outline-none",
                "focus:ring-2 focus:ring-mocha-400",
                styles.border,
                styles.text,
              )}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
            />
            <Button
              size="icon"
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || createComment.isPending}
              className="rounded-full bg-mocha-500 hover:bg-mocha-700 text-paper shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "fixed bottom-0 left-0 right-0 border-t backdrop-blur-sm p-4 text-center text-sm opacity-60",
            styles.bg,
            styles.text,
            styles.border,
          )}
        >
          댓글을 작성하려면 로그인하세요.
        </div>
      )}
    </div>
  );
};

export default ChapterCommentsPage;
