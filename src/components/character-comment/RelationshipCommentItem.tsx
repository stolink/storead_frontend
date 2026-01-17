import { memo } from "react";
import { Heart, CornerDownRight, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useReplies } from "@/hooks/useComments";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types";

import { getRelativeTime } from "@/utils/date";

interface RelationshipCommentItemProps {
  comment: Comment;
  activeRelationId: string;
  isReply?: boolean;
  onToggleLike: (commentId: string, parentId?: string | null) => void;
  onSetReplyTo: (replyTo: { id: string; name: string }) => void;
}

export const RelationshipCommentItem = memo(
  ({
    comment,
    activeRelationId,
    isReply = false,
    onToggleLike,
    onSetReplyTo,
  }: RelationshipCommentItemProps) => {
    // 대댓글 데이터 페칭 (부모인 경우에만)
    const { data: remoteReplies, isLoading: isLoadingReplies } = useReplies(
      comment.id,
      (comment.replyCount || 0) > 0,
    );
    const replies = remoteReplies || [];

    return (
      <div className="space-y-4">
        <div
          className={cn(
            "group flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
            isReply &&
              "ml-10 pl-6 border-l-2 border-mocha-100/50 relative bg-mocha-50/20 py-2 rounded-r-2xl",
          )}
        >
          {isReply && (
            <div className="absolute left-0 top-6 -ml-[15px]">
              <CornerDownRight className="w-4 h-4 text-mocha-300" />
            </div>
          )}

          <Avatar
            className={cn(
              "shrink-0 border-2 border-white shadow-paper transform transition-transform group-hover:scale-105",
              isReply ? "h-8 w-8" : "h-10 w-10",
            )}
          >
            <AvatarImage src={comment.author?.profileImageUrl} />
            <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold uppercase text-xs">
              {comment.author?.nickname?.[0] || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-espresso-900 tracking-tight">
                {comment.author?.nickname || "익명"}
              </span>
              <span className="text-[10px] text-stone-400 shrink-0 font-medium">
                {getRelativeTime(comment.createdAt)}
              </span>
            </div>

            <div className="bg-white px-5 py-4 rounded-[1.25rem] rounded-tl-none border border-stone-100 shadow-paper group-hover:shadow-paper-hover group-hover:border-mocha-100/30 transition-all duration-500">
              <p className="text-sm leading-relaxed text-espresso-700 break-words whitespace-pre-wrap font-serif">
                {comment.content}
              </p>
            </div>

            <div className="flex items-center gap-6 px-1">
              {!isReply && (
                <button
                  onClick={() => onToggleLike(comment.id, comment.parentId)}
                  className={cn(
                    "flex items-center gap-1.5 text-[11px] font-bold transition-all hover:scale-105",
                    comment.isLiked
                      ? "text-red-500"
                      : "text-stone-400 hover:text-stone-600",
                  )}
                >
                  <Heart
                    className={cn(
                      "h-3.5 w-3.5",
                      comment.isLiked && "fill-[#EF4444] text-[#EF4444]",
                    )}
                  />
                  {comment.likeCount > 0 ? comment.likeCount : "좋아요"}
                </button>
              )}
              {!isReply && (
                <button
                  onClick={() =>
                    onSetReplyTo({
                      id: comment.id,
                      name: comment.author?.nickname || "익명",
                    })
                  }
                  className="text-[11px] font-bold text-stone-400 hover:text-mocha-600 transition-all"
                >
                  답글 달기
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 대댓글 로딩 상태 */}
        {isLoadingReplies && (
          <div className="ml-14 py-2">
            <Loader2 className="h-4 w-4 animate-spin text-mocha-200" />
          </div>
        )}

        {/* 대댓글 재귀 렌더링 */}
        {replies.length > 0 && (
          <div className="space-y-4">
            {replies.map((reply: Comment) => (
              <RelationshipCommentItem
                key={reply.id}
                comment={reply}
                activeRelationId={activeRelationId}
                isReply
                onToggleLike={onToggleLike}
                onSetReplyTo={onSetReplyTo}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

RelationshipCommentItem.displayName = "RelationshipCommentItem";
