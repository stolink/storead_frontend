import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import { useAuthStore } from "@/stores/useAuthStore";

interface UserGamification {
  level: number;
  exp: number; // current exp
  maxExp: number; // exp needed for next level
  title: string;
  attendanceStreak: number;
  isTodayChecked: boolean;
}

/**
 * 유저의 게이미피케이션 정보 (레벨, 경험치, 출석) 조회
 * GET /api/users/me/gamification
 */
export const useUserGamification = () => {
  const { isAuthenticated, user } = useAuthStore();

  return useQuery<UserGamification>({
    queryKey: ["userGamification", user?.id],
    queryFn: async () => {
      try {
        const { data } = await api.get("/users/me/gamification");
        return data.data;
      } catch {
        // 백엔드 API 미구현 시 데모 데이터 반환
        return {
          level: 12,
          exp: 650,
          maxExp: 1000,
          title: user?.nickname || "정독자",
          attendanceStreak: 5,
          isTodayChecked: true,
        };
      }
    },
    enabled: isAuthenticated,
    staleTime: 60000, // 1분간 캐시
  });
};

/**
 * 오늘 출석 체크
 * POST /api/users/me/attendance
 */
export const useCheckAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/users/me/attendance");
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userGamification"] });
    },
  });
};
