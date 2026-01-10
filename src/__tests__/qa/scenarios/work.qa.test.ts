import { describe, it, beforeEach, vi, expect } from "vitest";
import { runApiTest, type ApiTestCase } from "@/test/api-helpers";

const workTests: ApiTestCase[] = [
    { id: "TC-STR-019", description: "작품 상세 정보", method: "GET", url: "/works/:id", requestUrl: "/works/w1", mockResponse: { body: { data: { title: "Detail Work" } } }, verify: (j) => expect(j.data.title).toBe("Detail Work") },
    { id: "TC-STR-020", description: "회차 목록 조회", method: "GET", url: "/works/:id/chapters", requestUrl: "/works/w1/chapters", mockResponse: { body: { data: [{ id: "c1" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
    { id: "TC-STR-021", description: "첫 회차 조회", method: "GET", url: "/works/:id/first", requestUrl: "/works/w1/first", mockResponse: { body: { data: { id: "c1" } } }, verify: (j) => expect(j.data.id).toBe("c1") },
    { id: "TC-STR-022", description: "다음 회차 조회", method: "GET", url: "/chapters/:id/next", requestUrl: "/chapters/c1/next", mockResponse: { body: { data: { id: "c2" } } }, verify: (j) => expect(j.data.id).toBe("c2") },
    { id: "TC-STR-023", description: "이전 회차 조회", method: "GET", url: "/chapters/:id/prev", requestUrl: "/chapters/c1/prev", mockResponse: { body: { data: { id: "c0" } } }, verify: (j) => expect(j.data.id).toBe("c0") },
    { id: "TC-STR-024", description: "뷰어 설정 저장", method: "POST", url: "/viewer/settings", mockResponse: { body: { success: true } } },
    { id: "TC-STR-025", description: "뷰어 설정 조회", method: "GET", url: "/viewer/settings", mockResponse: { body: { data: { fontSize: 16 } } }, verify: (j) => expect(j.data.fontSize).toBe(16) }
];

describe("[Work/Viewer] TC-STR-019 ~ 025", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    workTests.forEach(tc => {
        it(`${tc.id}: ${tc.description}`, async () => {
            await runApiTest(tc);
        });
    });
});
