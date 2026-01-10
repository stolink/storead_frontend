import { describe, it, beforeEach, vi, expect } from "vitest";
import { runApiTest, type ApiTestCase } from "@/test/api-helpers";

const discoveryTests: ApiTestCase[] = [
    { id: "TC-STR-011", description: "메인 배너/추천 조회", method: "GET", url: "/discovery/banner", mockResponse: { body: { data: [{ id: "b1" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
    { id: "TC-STR-012", description: "실시간 랭킹 조회", method: "GET", url: "/discovery/ranking", mockResponse: { body: { data: [{ rank: 1 }] } }, verify: (j) => expect(j.data[0].rank).toBe(1) },
    { id: "TC-STR-013", description: "신작 목록 조회", method: "GET", url: "/discovery/new", mockResponse: { body: { data: [{ id: "w2" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
    { id: "TC-STR-014", description: "완결작 목록 조회", method: "GET", url: "/discovery/completed", mockResponse: { body: { data: [{ id: "w3" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
    { id: "TC-STR-015", description: "통합 검색", method: "GET", url: "/discovery/search", requestUrl: "/discovery/search?keyword=test", mockResponse: { body: { data: { content: [{ title: "Search Result" }] } } }, verify: (j) => expect(j.data.content[0].title).toBe("Search Result") },
    { id: "TC-STR-016", description: "태그 검색", method: "GET", url: "/discovery/tags", requestUrl: "/discovery/tags?tag=Fantasy", mockResponse: { body: { data: [{ tags: ["Fantasy"] }] } }, verify: (j) => expect(j.data[0].tags).toContain("Fantasy") },
    { id: "TC-STR-017", description: "카테고리별 조회", method: "GET", url: "/discovery/category", requestUrl: "/discovery/category?code=ROMANCE", mockResponse: { body: { data: [{ category: "Romance" }] } }, verify: (j) => expect(j.data[0].category).toBe("Romance") },
    { id: "TC-STR-018", description: "작가별 작품 조회", method: "GET", url: "/discovery/author/:id", requestUrl: "/discovery/author/writer1", mockResponse: { body: { data: [{ writer: "Author1" }] } }, verify: (j) => expect(j.data[0].writer).toBe("Author1") }
];

describe("[Discovery] TC-STR-011 ~ 018", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    discoveryTests.forEach(tc => {
        it(`${tc.id}: ${tc.description}`, async () => {
            await runApiTest(tc);
        });
    });
});
