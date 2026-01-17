/**
 * 댓글 아이템 뷰 컴포넌트 (ChapterCommentsPage 전용)
 * 렌더 함수 외부에 분리하여 포커스 유실 문제 해결
 */
import { memo } from "react";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types";
import { useReplies } from "@/hooks/useComments";

interface CommentItemViewProps {
  /** 댓글 데이터 */
  comment: Comment;
  /** 대댓글 여부 */
  isReply?: boolean;
  /** 현재 답글 대상 댓글 ID */
  replyToId: string | null;
  /** 답글 내용 */
  replyContent: string;
  /** 전체 댓글 목록 (대댓글 필터링용) */
  allComments: Comment[];
  /** 테마 클래스 */
  dividerClass: string;
  /** 좋아요 토글 핸들러 */
  onToggleLike: (commentId: string) => void;
  /** 답글 대상 설정 핸들러 */
  onSetReplyTo: (commentId: string | null) => void;
  /** 답글 내용 변경 핸들러 */
  onReplyContentChange: (content: string) => void;
  /** 답글 제출 핸들러 */
  onSubmitReply: (parentId: string) => void;
  /** 현재 테마 */
  theme: string;
}

/**
 * 상대 시간 계산 유틸리티
 */
const getRelativeTime = (date: string): string => {
  if (!date) return "";
  const now = new Date();
  // 서버에서 UTC로 내려오지만 'Z'가 없는 경우를 대비하여 처리
  // (예: "2024-01-18T10:00:00") -> "2024-01-18T10:00:00Z"
  const safeDate = date.replace(" ", "T");
  const commentDate = new Date(
    safeDate.endsWith("Z") ? safeDate : `${safeDate}Z`,
  );

  const diffMs = now.getTime() - commentDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return commentDate.toLocaleDateString("ko-KR");
};

/**
 * 댓글 아이템 뷰 컴포넌트
 * memo로 감싸서 불필요한 리렌더링 방지
 */
export const CommentItemView = memo(
  ({
    comment,
    isReply = false,
    replyToId,
    replyContent,
    allComments,
    dividerClass,
    onToggleLike,
    onSetReplyTo,
    onReplyContentChange,
    onSubmitReply,
    theme,
  }: CommentItemViewProps) => {
    // 테마별 입력창 스타일 정의
    const getThemeInputStyle = (currentTheme: string) => {
      switch (currentTheme) {
        case "dark":
          return "bg-mocha-800 text-mocha-50 border-mocha-700 placeholder:text-mocha-300";
        case "sepia":
          return "bg-[#F4ECD8] text-amber-900 border-amber-200 placeholder:text-amber-900/40";
        case "ivory":
          return "bg-[#F5F5DC] text-[#5D4E37] border-amber-200 placeholder:text-[#5D4E37]/40";
        case "light":
        default:
          return "bg-white text-zinc-900 border-stone-200 placeholder:text-stone-400";
      }
    };

    const inputStyle = getThemeInputStyle(theme);

    // 대댓글 데이터 페칭
    // 백엔드의 getComments는 최상위 댓글만 반환하므로, 대댓글은 별도로 가져와야 함
    const { data: remoteReplies } = useReplies(
      comment.id,
      (comment.replyCount || 0) > 0,
    );
    const replies = remoteReplies || [];

    return (
      <div className={cn("py-4 group", isReply && "ml-12 mt-2")}>
        <div className="flex items-start gap-4">
          <Avatar
            className={cn(
              "h-10 w-10 ring-2 ring-white shadow-sm transition-transform group-hover:scale-105",
              isReply && "h-8 w-8",
            )}
          >
            <AvatarImage
              src={comment.author?.profileImageUrl}
              className="object-cover"
            />
            <AvatarFallback className="bg-mocha-100 text-mocha-700">
              {comment.author?.nickname?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-espresso-900 dark:text-zinc-100">
                  {comment.author?.nickname || "익명"}
                </span>
                <span className="text-[11px] text-stone-400 font-medium">
                  {getRelativeTime(comment.createdAt)}
                </span>
              </div>
            </div>

            <p className="text-[14.5px] leading-relaxed text-espresso-900/90 dark:text-zinc-200 whitespace-pre-wrap break-words font-body">
              {comment.content}
            </p>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-5 mt-3">
              {!isReply && (
                <button
                  onClick={() => onToggleLike(comment.id)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold transition-all hover:scale-105",
                    comment.isLiked
                      ? "text-red-500"
                      : "text-stone-400 hover:text-stone-600",
                  )}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-all",
                      comment.isLiked && "fill-current animate-in zoom-in-50",
                    )}
                  />
                  <span>{comment.likeCount}</span>
                </button>
              )}

              {!isReply && (
                <button
                  onClick={() =>
                    onSetReplyTo(replyToId === comment.id ? null : comment.id)
                  }
                  className="text-xs font-semibold text-stone-400 hover:text-mocha-500 transition-colors"
                >
                  답글 달기
                </button>
              )}
            </div>

            {/* 대댓글 입력 */}
            {replyToId === comment.id && (
              <div
                className={cn(
                  "mt-4 p-4 rounded-xl border animate-in slide-in-from-top-2 duration-300",
                  theme === "dark"
                    ? "bg-mocha-900 border-mocha-700"
                    : theme === "sepia"
                      ? "bg-amber-100/50 border-amber-200"
                      : theme === "ivory"
                        ? "bg-[#FFFFF0] border-amber-200"
                        : "bg-cloud-50 border-mocha-100",
                )}
              >
                <Textarea
                  value={replyContent}
                  onChange={(e) => onReplyContentChange(e.target.value)}
                  placeholder="생각을 공유해주세요..."
                  className={cn(
                    "min-h-[80px] text-sm resize-none focus:ring-mocha-400",
                    inputStyle,
                  )}
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSetReplyTo(null)}
                    className="text-stone-500"
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onSubmitReply(comment.id)}
                    className="bg-mocha-500 hover:bg-mocha-600 text-white shadow-sm"
                  >
                    등록하기
                  </Button>
                </div>
              </div>
            )}

            {/* 대댓글 목록 (재귀 렌더링) */}
            {replies.length > 0 && (
              <div className="mt-4 space-y-2 relative">
                {/* 계층 구조 연계선 */}
                <div className="absolute left-[-26px] top-0 bottom-4 w-[2px] bg-mocha-100 rounded-full" />

                {replies.map((reply) => (
                  <CommentItemView
                    key={reply.id}
                    comment={reply}
                    isReply
                    replyToId={replyToId}
                    replyContent={replyContent}
                    allComments={allComments}
                    dividerClass={dividerClass}
                    onToggleLike={onToggleLike}
                    onSetReplyTo={onSetReplyTo}
                    onReplyContentChange={onReplyContentChange}
                    onSubmitReply={onSubmitReply}
                    theme={theme}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

CommentItemView.displayName = "CommentItemView";

export default CommentItemView;
