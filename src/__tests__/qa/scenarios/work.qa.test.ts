/**
 * QA 테스트 케이스: 내 작품 관리 (TC-STR-WRK)
 *
 * 1. 내 작품 삭제 (TC-STR-WRK-001)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@/test/utils";
import { useDeleteWork } from "@/hooks/useWorks";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";

const API_URL = "/api";

describe("[TC-STR-WRK] 내 작품 관리 테스트", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("TC-STR-WRK-001: 내 작품 삭제", () => {
        /**
         * 사전 조건: 작가 계정으로 로그인, 삭제할 작품 존재
         * 테스트 시나리오: 1.작품 관리 진입 2.삭제 버튼 클릭 3.최종 확인
         * 기대 결과: API(DELETE /api/works/:id) 호출 성공 및 목록에서 삭제
         */
        it("작가가 자신의 작품을 삭제하면 성공해야 함", async () => {
            const workId = "w1";
            let deleteCalled = false;

            server.use(
                http.delete(`${API_URL}/works/${workId}`, () => {
                    deleteCalled = true;
                    return HttpResponse.json({ success: true });
                })
            );

            const { result } = renderHook(() => useDeleteWork());

            // 삭제 시뮬레이션
            result.current.mutate(workId);

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(deleteCalled).toBe(true);
        });

        it("삭제 API 실패 시 에러 상태를 반환해야 함", async () => {
            const workId = "w-fail";

            server.use(
                http.delete(`${API_URL}/works/${workId}`, () => {
                    return new HttpResponse(null, { status: 500 });
                })
            );

            const { result } = renderHook(() => useDeleteWork());

            result.current.mutate(workId);

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });
        });
    });
});
