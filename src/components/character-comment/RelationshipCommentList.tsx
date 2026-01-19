import { useRef, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare, CornerDownRight } from "lucide-react";
import {
  useComments,
  useCreateComment,
  useToggleCommentLike,
} from "@/hooks/useComments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { RelationshipLink } from "@/types/characterGraph";
import { RelationshipCommentItem } from "./RelationshipCommentItem";

interface RelationshipCommentListProps {
  chapterId: string;
  link: RelationshipLink;
  relationId?: string;
}

export function RelationshipCommentList({
  chapterId,
  link,
  relationId,
}: RelationshipCommentListProps) {
  const activeRelationId = relationId || link?.id;
  const [content, setContent] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "likes">("latest");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(
    null,
  );
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useComments(
      String(chapterId),
      activeRelationId ? String(activeRelationId) : undefined,
      sortBy,
    );

  const queryClient = useQueryClient();
  const prevRelationIdRef = useRef(activeRelationId);

  // Reset state when relation changes
  useEffect(() => {
    if (prevRelationIdRef.current !== activeRelationId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContent("");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReplyTo(null);
      prevRelationIdRef.current = activeRelationId;
    }

    // Cache clear logic
    queryClient.removeQueries({
      queryKey: [
        "comments",
        String(chapterId),
        activeRelationId ? String(activeRelationId) : undefined,
      ],
    });
  }, [activeRelationId, chapterId, queryClient]);

  const createComment = useCreateComment(
    String(chapterId),
    activeRelationId ? String(activeRelationId) : undefined,
  );
  const toggleLike = useToggleCommentLike(
    String(chapterId),
    activeRelationId ? String(activeRelationId) : undefined,
    sortBy,
  );

  const comments = data?.pages.flatMap((page) => page.data) || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createComment.mutate(
      {
        content: content.trim(),
        parentId: replyTo?.id,
      },
      {
        onSuccess: () => {
          setContent("");
          setReplyTo(null);
        },
      },
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F7F2]">
      {/* Sorting Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/40 bg-white/50 backdrop-blur-md">
        <h3 className="text-xs font-black text-espresso-900 uppercase tracking-[0.2em] opacity-40">
          {comments.length} Comments
        </h3>
        <div className="flex bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setSortBy("latest")}
            className={cn(
              "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
              sortBy === "latest"
                ? "bg-white text-espresso-900 shadow-sm"
                : "text-stone-400 hover:text-stone-600",
            )}
          >
            최신순
          </button>
          <button
            onClick={() => setSortBy("likes")}
            className={cn(
              "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
              sortBy === "likes"
                ? "bg-white text-espresso-900 shadow-sm"
                : "text-stone-400 hover:text-stone-600",
            )}
          >
            추천순
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-6">
        <div className="py-8 space-y-10">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-mocha-400" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-stone-300" />
              </div>
              <h4 className="text-base font-bold text-stone-900">
                아직 의견이 없습니다
              </h4>
              <p className="text-sm text-stone-500 mt-1 max-w-[240px]">
                이 관계에 대한 첫 번째 소감을 남겨보세요.
              </p>
            </div>
          ) : (
            comments.map((comment, idx) => (
              <RelationshipCommentItem
                key={`RelationshipCommentList-${activeRelationId}-${comment.id || idx}`}
                comment={comment}
                activeRelationId={String(activeRelationId)}
                onToggleLike={(id, parentId) =>
                  toggleLike.mutate({ commentId: id, parentId })
                }
                onSetReplyTo={setReplyTo}
              />
            ))
          )}

          <div ref={loadMoreRef} className="h-10" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-mocha-400" />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Section */}
      <div className="shrink-0 p-6 bg-white border-t border-stone-200/40 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        {replyTo && (
          <div className="flex items-center justify-between px-4 py-2 mb-3 bg-mocha-50/50 rounded-xl border border-mocha-100/50 animate-in slide-in-from-bottom-2">
            <p className="text-[11px] font-bold text-mocha-700">
              <span className="opacity-60">Replying to</span> {replyTo.name}
            </p>
            <button
              onClick={() => setReplyTo(null)}
              className="text-[11px] font-black text-mocha-400 hover:text-mocha-600"
            >
              CANCEL
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              replyTo
                ? `${replyTo.name}님에게 답글 남기기...`
                : "이 관계에 대한 당신의 생각은?"
            }
            className="flex-1 h-12 rounded-2xl bg-stone-50 border-stone-200 focus:bg-white focus:ring-mocha-500 transition-all font-serif"
            disabled={createComment.isPending}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing && e.key === "Enter") {
                e.preventDefault();
              }
            }}
          />
          <Button
            type="submit"
            disabled={!content.trim() || createComment.isPending}
            className="h-12 w-12 rounded-2xl shrink-0 bg-espresso-900 hover:bg-black active:scale-95 transition-all p-0 shadow-lg"
          >
            {createComment.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <CornerDownRight className="h-5 w-5" />
            )}
          </Button>
        </form>
        <p className="text-[10px] font-medium text-stone-400 mt-3 px-1">
          타인을 배려하는 예쁜 말을 사용해주세요. 부적절한 내용은 제재될 수
          있습니다.
        </p>
      </div>
    </div>
  );
}
