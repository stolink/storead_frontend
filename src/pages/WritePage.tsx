/**
 * WritePage - 커뮤니티 배포 게시 확인 페이지
 * Stolink에서 리다이렉트되어 Draft 데이터를 확인하고 게시하는 페이지
 */
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { useThemeStore, backgroundThemeClasses } from "@/stores/useTheme";
import { useDraft, useDeleteDraft } from "@/hooks/useDraft";
import { usePublish } from "@/hooks/usePublish";
import { useWorkByProjectId } from "@/hooks/useWorks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraphModal } from "@/components/viewer/GraphModal";
import { adaptGraphSnapshot } from "@/adapters/graphSnapshotAdapter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  FileText,
  BookOpen,
  CheckCircle,
  Loader2,
  Network,
} from "lucide-react";

export const WritePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const draftId = searchParams.get("draftId");

  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useAuthModalStore();
  const { theme } = useThemeStore();

  // 수동 입력 제목 상태
  const [editedTitle, setEditedTitle] = useState("");
  // 관계도 모달 상태
  const [showGraphModal, setShowGraphModal] = useState(false);

  // Draft 조회
  const {
    data: draft,
    isLoading: isDraftLoading,
    isError: isDraftError,
    error: draftError,
  } = useDraft(isAuthenticated ? draftId : null);

  // Draft 제목 초기화 (한 번만 실행되도록 draft.id를 의존성에 포함)
  useEffect(() => {
    if (draft?.title && !editedTitle) {
      setEditedTitle(draft.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.id]);

  // 기존 Work 조회
  const { data: workData, isLoading: isWorkLoading } = useWorkByProjectId(
    draft?.projectId || null
  );
  // useWorkByProjectId 응답이 이제 { works: [...] }이므로 접근 방식 변경
  const existingWork = (workData as any)?.works?.[0];

  // 본문 미리보기 텍스트 추출 (HTML 태그 제거)
  const previewText = draft?.content
    ? draft.content.replace(/<[^>]*>/g, "").slice(0, 500)
    : "";

  // 게시/취소 mutation
  const publishMutation = usePublish();
  const deleteDraftMutation = useDeleteDraft();

  // 로그인 체크: 미로그인 시 모달 오픈
  useEffect(() => {
    if (!isAuthenticated && draftId) {
      openAuthModal(`/write?draftId=${draftId}`);
    }
  }, [isAuthenticated, openAuthModal, draftId]);

  // 게시하기 핸들러
  const handlePublish = async () => {
    if (!draftId) return;

    try {
      const result = await publishMutation.mutateAsync({
        draftId,
        title: editedTitle, // ✅ 수정한 제목 전달
      });
      // 생성된 챕터 페이지로 이동
      navigate(`/chapters/${result.chapterId}`);
    } catch (error) {
      console.error("게시 실패:", error);
    }
  };

  // 취소 핸들러
  const handleCancel = async () => {
    if (!draftId) {
      navigate("/");
      return;
    }

    try {
      await deleteDraftMutation.mutateAsync(draftId);
    } catch (error) {
      // Draft 삭제 실패해도 홈으로 이동
      console.error("Draft 삭제 실패:", error);
    }
    navigate("/");
  };

  // draftId가 없는 경우 에러 표시
  if (!draftId) {
    return (
      <div
        className={`min-h-screen ${backgroundThemeClasses[theme]} flex items-center justify-center p-4`}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">잘못된 요청</CardTitle>
            <CardDescription>
              draftId가 누락되었습니다. 작가 서비스에서 다시 배포해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              홈으로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 미로그인 상태 표시
  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen ${backgroundThemeClasses[theme]} flex items-center justify-center p-4`}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>
              게시를 진행하려면 먼저 로그인해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => openAuthModal(`/write?draftId=${draftId}`)}>
              로그인하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Draft 로딩 중
  if (isDraftLoading) {
    return (
      <div
        className={`min-h-screen ${backgroundThemeClasses[theme]} flex items-center justify-center p-4`}
      >
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">
              Draft 데이터를 불러오는 중...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Draft 조회 에러 (만료 등)
  if (isDraftError) {
    const errorMessage =
      (draftError as any)?.response?.status === 404
        ? "Draft를 찾을 수 없습니다. 링크가 만료되었거나 이미 게시되었을 수 있습니다."
        : "Draft를 불러오는 데 실패했습니다.";

    return (
      <div
        className={`min-h-screen ${backgroundThemeClasses[theme]} flex items-center justify-center p-4`}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <CardTitle className="text-amber-600">링크 만료</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              홈으로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 메인 화면: 게시 확인
  return (
    <div
      className={`min-h-screen ${backgroundThemeClasses[theme]} flex items-center justify-center p-4`}
    >
      <Card className="w-full max-w-lg shadow-xl border-none">
        <CardHeader className="text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">게시 확인</CardTitle>
              <CardDescription className="text-sm">
                작가 서비스에서 전달된 콘텐츠를 확인하세요.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Draft 정보 표시 */}
          <div className="space-y-3">
            {/* 작품 제목 */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>게시할 작품</span>
              </div>
              {isWorkLoading ? (
                <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded" />
              ) : (
                <p className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  {existingWork?.title || "새 웹소설"}
                </p>
              )}
            </div>

            {/* 섹션 제목 */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>게시할 섹션</span>
              </div>
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="섹션 제목을 입력하세요"
                className="font-bold text-lg text-zinc-900 dark:text-zinc-100 border-none bg-transparent px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-400"
              />
            </div>

            {/* 인물관계도 포함 여부 */}
            {draft?.graphSnapshot && (
              <button
                onClick={() => {
                  console.log("[DEBUG] 버튼 클릭됨");
                  console.log("[DEBUG] graphSnapshot:", draft.graphSnapshot);
                  console.log(
                    "[DEBUG] adaptedData:",
                    adaptGraphSnapshot(draft.graphSnapshot as any)
                  );
                  setShowGraphModal(true);
                  console.log("[DEBUG] showGraphModal 상태:", true);
                }}
                className="w-full flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors cursor-pointer"
              >
                <Network className="w-4 h-4 ml-1" />
                <span className="text-sm font-bold">
                  📊 인물관계도 보기 (클릭)
                </span>
              </button>
            )}

            {/* 본문 미리보기 */}
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <p className="text-xs font-bold text-zinc-400 mb-2">
                본문 미리보기
              </p>
              <div className="line-clamp-4 leading-relaxed text-zinc-600 dark:text-zinc-400 text-sm">
                {previewText}
                {draft?.content &&
                draft.content.replace(/<[^>]*>/g, "").length > 500
                  ? "..."
                  : ""}
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {publishMutation.isError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm font-bold text-center">
              {(publishMutation.error as any)?.response?.status === 409
                ? "이미 게시된 챕터입니다."
                : "게시 중 오류가 발생했습니다. 다시 시도해주세요."}
            </div>
          )}

          {/* 버튼 영역 */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              className="h-11 rounded-full border-zinc-200 dark:border-zinc-700 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800"
              onClick={handleCancel}
              disabled={
                publishMutation.isPending || deleteDraftMutation.isPending
              }
            >
              {deleteDraftMutation.isPending ? "취소 중..." : "취소"}
            </Button>
            <Button
              className="h-11 rounded-full bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold shadow-lg shadow-purple-200 dark:shadow-none transition-all active:scale-[0.98]"
              onClick={handlePublish}
              disabled={
                publishMutation.isPending || deleteDraftMutation.isPending
              }
            >
              {publishMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>게시하기</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 관계도 모달 - 기존 GraphModal 컴포넌트 사용 */}
      <GraphModal
        isOpen={showGraphModal}
        onClose={() => setShowGraphModal(false)}
        characters={
          draft?.graphSnapshot
            ? adaptGraphSnapshot(draft.graphSnapshot as any)?.characters ?? []
            : []
        }
        links={
          draft?.graphSnapshot
            ? adaptGraphSnapshot(draft.graphSnapshot as any)?.links ?? []
            : []
        }
      />
    </div>
  );
};

export default WritePage;
