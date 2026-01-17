/**
 * 프로필 수정 페이지
 * 사용자 정보 조회 및 수정
 */
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMe, useUpdateProfile } from "@/hooks/useAuth";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// 유효성 검사 스키마
const profileSchema = z.object({
  nickname: z.string().min(2, "닉네임은 최소 2자 이상이어야 합니다"),
  profileImageUrl: z
    .string()
    .url("올바른 URL 형식이 아닙니다")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(200, "자기소개는 200자 이하로 입력해주세요").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user, isLoading, error } = useMe();
  const updateProfile = useUpdateProfile();
  const { openAuthModal } = useAuthModalStore();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: "",
      profileImageUrl: "",
      bio: "",
    },
  });

  // 사용자 데이터 로드 시 폼에 반영
  useEffect(() => {
    if (user) {
      form.reset({
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl || "",
        bio: "",
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile.mutateAsync({
        nickname: data.nickname,
        profileImageUrl: data.profileImageUrl || undefined,
        bio: data.bio || undefined,
      });
      // 성공 메시지 또는 이전 페이지로 이동
      navigate(-1);
    } catch (err) {
      console.error("프로필 수정 실패:", err);
    }
  };

  // 프로필 이미지 미리보기
  const previewImageUrl = form.watch("profileImageUrl");
  const previewNickname = form.watch("nickname");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-red-500">프로필을 불러오는데 실패했습니다.</p>
        <Button onClick={() => openAuthModal(location.pathname)}>
          로그인하기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8">
      <div className="max-w-xl mx-auto px-4">
        <Card>
          <CardHeader>
            <button
              onClick={() => navigate(-1)}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-2 text-sm"
            >
              ← 뒤로 가기
            </button>
            <CardTitle>프로필 수정</CardTitle>
            <CardDescription>프로필 정보를 수정하세요</CardDescription>
          </CardHeader>
          <CardContent>
            {/* 프로필 미리보기 */}
            <div className="flex items-center gap-4 mb-8 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Avatar className="h-16 w-16">
                <AvatarImage src={previewImageUrl} alt={previewNickname} />
                <AvatarFallback className="text-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {previewNickname?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">
                  {previewNickname || "닉네임"}
                </p>
                <p className="text-sm text-zinc-500">{user.email}</p>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* 닉네임 */}
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>닉네임</FormLabel>
                      <FormControl>
                        <Input placeholder="닉네임" {...field} />
                      </FormControl>
                      <FormDescription>
                        다른 사용자에게 보여지는 이름입니다
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 프로필 이미지 URL */}
                <FormField
                  control={form.control}
                  name="profileImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>프로필 이미지 URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/avatar.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        프로필 사진 URL을 입력하세요 (선택)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 자기소개 */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>자기소개</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="간단한 자기소개를 입력하세요"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/200자
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 버튼 */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(-1)}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? "저장 중..." : "저장"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
