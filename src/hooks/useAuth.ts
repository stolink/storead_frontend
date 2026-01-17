/**
 * 인증(Auth) 관련 TanStack Query 훅
 * 내 정보 조회, 프로필 수정
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import { useAuthStore } from "@/stores/useAuthStore";
import type { User } from "@/types";

/**
 * 내 정보 조회
 * GET /api/auth/me
 */
export const useMe = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery<User>({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      const user = data.data || data;

      // [Fix] 백엔드 필드명 불일치(avatarUrl vs profileImageUrl) 대응
      // 기존 사진이 사라지는 문제 방지
      if (!user.profileImageUrl && user.avatarUrl) {
        user.profileImageUrl = user.avatarUrl;
      }
      return user;
    },
    // 로그인 상태일 때만 요청
    enabled: isAuthenticated,
    // 5분마다 갱신
    staleTime: 5 * 60 * 1000,
  });
};

interface UpdateProfileParams {
  nickname?: string;
  profileImageUrl?: string;
  bio?: string;
}

/**
 * 프로필 수정
 * PATCH /api/auth/me
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async (params: UpdateProfileParams) => {
      // [Fix] 백엔드가 avatarUrl을 기대할 수 있으므로 두 필드 모두 전송
      const payload = {
        ...params,
        avatarUrl: params.profileImageUrl,
      };

      const { data } = await api.patch("/auth/me", payload);
      // 백엔드 응답 형식에 따라 data.data 또는 data 반환
      const updatedUser = (data.data || data) as User;

      // 응답 데이터도 정규화
      if (!updatedUser.profileImageUrl && (updatedUser as any).avatarUrl) {
        updatedUser.profileImageUrl = (updatedUser as any).avatarUrl;
      }

      return updatedUser;
    },
    onSuccess: (updatedUser) => {
      // 캐시 업데이트
      queryClient.setQueryData(["me"], updatedUser);
      // Zustand 스토어도 업데이트
      updateUser(updatedUser);
      // me 쿼리 무효화하여 최신 데이터 다시 페칭
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};
