import { describe, it, beforeEach, vi, expect } from "vitest";
import { runApiTest, type ApiTestCase } from "@/test/api-helpers";

const authTests: ApiTestCase[] = [
    { id: "TC-STR-001", description: "회원가입 (독자)", method: "POST", url: "/auth/register", mockResponse: { status: 201, body: { data: { id: "u-new", email: "reader@test.com" } } }, expectedStatus: 201 },
    { id: "TC-STR-002", description: "로그인", method: "POST", url: "/auth/login", mockResponse: { body: { data: { accessToken: "token" } } }, verify: (j) => expect(j.data.accessToken).toBe("token") },
    { id: "TC-STR-003", description: "로그아웃", method: "POST", url: "/auth/logout", mockResponse: { body: { success: true } } },
    { id: "TC-STR-004", description: "토큰 갱신", method: "POST", url: "/auth/refresh", mockResponse: { body: { data: { accessToken: "new-token" } } } },
    { id: "TC-STR-005", description: "내 정보 조회", method: "GET", url: "/users/me", mockResponse: { body: { data: { nickname: "Reader" } } }, verify: (j) => expect(j.data.nickname).toBe("Reader") },
    { id: "TC-STR-006", description: "프로필 수정", method: "PATCH", url: "/users/me", mockResponse: { body: { data: { nickname: "NewNick" } } }, verify: (j) => expect(j.data.nickname).toBe("NewNick") },
    { id: "TC-STR-007", description: "비밀번호 변경", method: "PATCH", url: "/users/me/password", mockResponse: { body: { success: true } } },
    { id: "TC-STR-008", description: "알림 설정 조회", method: "GET", url: "/users/me/notifications", mockResponse: { body: { data: { email: true } } }, verify: (j) => expect(j.data.email).toBe(true) },
    { id: "TC-STR-009", description: "알림 설정 수정", method: "PATCH", url: "/users/me/notifications", mockResponse: { body: { data: { email: false } } }, verify: (j) => expect(j.data.email).toBe(false) },
    { id: "TC-STR-010", description: "회원 탈퇴", method: "DELETE", url: "/users/me", mockResponse: { body: { success: true } } }
];

describe("[Auth/User] TC-STR-001 ~ 010", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    authTests.forEach(tc => {
        it(`${tc.id}: ${tc.description}`, async () => {
            await runApiTest(tc);
        });
    });
});
