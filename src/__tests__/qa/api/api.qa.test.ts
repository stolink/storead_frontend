/**
 * QA API 테스트 케이스 (Storead Comprehensive)
 * Range: TC-STR-001 ~ TC-STR-061
 */
import { describe, it, beforeEach, vi, expect } from "vitest";
import { runApiTest, type ApiTestCase } from "@/test/api-helpers";

const testGroups: { title: string; tests: ApiTestCase[] }[] = [
    {
        title: "[Auth/User] TC-STR-001 ~ 010",
        tests: [
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
        ]
    },
    {
        title: "[Discovery] TC-STR-011 ~ 018",
        tests: [
            { id: "TC-STR-011", description: "메인 배너/추천 조회", method: "GET", url: "/discovery/banner", mockResponse: { body: { data: [{ id: "b1" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
            { id: "TC-STR-012", description: "실시간 랭킹 조회", method: "GET", url: "/discovery/ranking", mockResponse: { body: { data: [{ rank: 1 }] } }, verify: (j) => expect(j.data[0].rank).toBe(1) },
            { id: "TC-STR-013", description: "신작 목록 조회", method: "GET", url: "/discovery/new", mockResponse: { body: { data: [{ id: "w2" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
            { id: "TC-STR-014", description: "완결작 목록 조회", method: "GET", url: "/discovery/completed", mockResponse: { body: { data: [{ id: "w3" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
            { id: "TC-STR-015", description: "통합 검색", method: "GET", url: "/discovery/search", requestUrl: "/discovery/search?keyword=test", mockResponse: { body: { data: { content: [{ title: "Search Result" }] } } }, verify: (j) => expect(j.data.content[0].title).toBe("Search Result") },
            { id: "TC-STR-016", description: "태그 검색", method: "GET", url: "/discovery/tags", requestUrl: "/discovery/tags?tag=Fantasy", mockResponse: { body: { data: [{ tags: ["Fantasy"] }] } }, verify: (j) => expect(j.data[0].tags).toContain("Fantasy") },
            { id: "TC-STR-017", description: "카테고리별 조회", method: "GET", url: "/discovery/category", requestUrl: "/discovery/category?code=ROMANCE", mockResponse: { body: { data: [{ category: "Romance" }] } }, verify: (j) => expect(j.data[0].category).toBe("Romance") },
            { id: "TC-STR-018", description: "작가별 작품 조회", method: "GET", url: "/discovery/author/:id", requestUrl: "/discovery/author/writer1", mockResponse: { body: { data: [{ writer: "Author1" }] } }, verify: (j) => expect(j.data[0].writer).toBe("Author1") }
        ]
    },
    {
        title: "[Work/Viewer] TC-STR-019 ~ 025",
        tests: [
            { id: "TC-STR-019", description: "작품 상세 정보", method: "GET", url: "/works/:id", requestUrl: "/works/w1", mockResponse: { body: { data: { title: "Detail Work" } } }, verify: (j) => expect(j.data.title).toBe("Detail Work") },
            { id: "TC-STR-020", description: "회차 목록 조회", method: "GET", url: "/works/:id/chapters", requestUrl: "/works/w1/chapters", mockResponse: { body: { data: [{ id: "c1" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
            { id: "TC-STR-021", description: "첫 회차 조회", method: "GET", url: "/works/:id/first", requestUrl: "/works/w1/first", mockResponse: { body: { data: { id: "c1" } } }, verify: (j) => expect(j.data.id).toBe("c1") },
            { id: "TC-STR-022", description: "다음 회차 조회", method: "GET", url: "/chapters/:id/next", requestUrl: "/chapters/c1/next", mockResponse: { body: { data: { id: "c2" } } }, verify: (j) => expect(j.data.id).toBe("c2") },
            { id: "TC-STR-023", description: "이전 회차 조회", method: "GET", url: "/chapters/:id/prev", requestUrl: "/chapters/c1/prev", mockResponse: { body: { data: { id: "c0" } } }, verify: (j) => expect(j.data.id).toBe("c0") },
            { id: "TC-STR-024", description: "뷰어 설정 저장", method: "POST", url: "/viewer/settings", mockResponse: { body: { success: true } } },
            { id: "TC-STR-025", description: "뷰어 설정 조회", method: "GET", url: "/viewer/settings", mockResponse: { body: { data: { fontSize: 16 } } }, verify: (j) => expect(j.data.fontSize).toBe(16) }
        ]
    },
    {
        title: "[Library] TC-STR-026 ~ 031",
        tests: [
            { id: "TC-STR-026", description: "내 서재 목록", method: "GET", url: "/library", mockResponse: { body: { data: [{ id: "l1" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
            { id: "TC-STR-027", description: "서재에 작품 추가", method: "POST", url: "/library/:workId", requestUrl: "/library/w1", mockResponse: { body: { success: true } } },
            { id: "TC-STR-028", description: "서재에서 작품 삭제", method: "DELETE", url: "/library/:workId", requestUrl: "/library/w1", mockResponse: { body: { success: true } } },
            { id: "TC-STR-029", description: "최근 본 작품 목록", method: "GET", url: "/history", mockResponse: { body: { data: [{ workId: "w1" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
            { id: "TC-STR-030", description: "최근 본 작품 삭제", method: "DELETE", url: "/history/:workId", requestUrl: "/history/w1", mockResponse: { body: { success: true } } },
            { id: "TC-STR-031", description: "읽은 회차 표시", method: "POST", url: "/history/chapter/:id", requestUrl: "/history/chapter/c1", mockResponse: { body: { success: true } } }
        ]
    },
    {
        title: "[Social] TC-STR-032 ~ 041",
        tests: [
            { id: "TC-STR-032", description: "작품 좋아요", method: "POST", url: "/likes/work/:id", requestUrl: "/likes/work/w1", mockResponse: { body: { success: true } } },
            { id: "TC-STR-033", description: "작품 좋아요 취소", method: "DELETE", url: "/likes/work/:id", requestUrl: "/likes/work/w1", mockResponse: { body: { success: true } } },
            { id: "TC-STR-034", description: "회차 좋아요", method: "POST", url: "/likes/chapter/:id", requestUrl: "/likes/chapter/c1", mockResponse: { body: { success: true } } },
            { id: "TC-STR-035", description: "회차 좋아요 취소", method: "DELETE", url: "/likes/chapter/:id", requestUrl: "/likes/chapter/c1", mockResponse: { body: { success: true } } },
            { id: "TC-STR-036", description: "댓글 작성", method: "POST", url: "/chapters/:id/comments", requestUrl: "/chapters/c1/comments", mockResponse: { status: 201, body: { data: { id: "cmt1", content: "Good" } } }, expectedStatus: 201 },
            { id: "TC-STR-037", description: "댓글 목록 조회", method: "GET", url: "/chapters/:id/comments", requestUrl: "/chapters/c1/comments", mockResponse: { body: { data: [{ id: "cmt1" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
            { id: "TC-STR-038", description: "댓글 수정", method: "PATCH", url: "/comments/:id", requestUrl: "/comments/cmt1", mockResponse: { body: { data: { content: "Edited" } } }, verify: (j) => expect(j.data.content).toBe("Edited") },
            { id: "TC-STR-039", description: "댓글 삭제", method: "DELETE", url: "/comments/:id", requestUrl: "/comments/cmt1", mockResponse: { body: { success: true } } },
            { id: "TC-STR-040", description: "대댓글 작성", method: "POST", url: "/comments/:id/reply", requestUrl: "/comments/cmt1/reply", mockResponse: { status: 201, body: { data: { id: "reply1" } } }, expectedStatus: 201 },
            { id: "TC-STR-041", description: "별점 등록/수정", method: "POST", url: "/chapters/:id/rating", requestUrl: "/chapters/c1/rating", mockResponse: { body: { data: { score: 5 } } }, verify: (j) => expect(j.data.score).toBe(5) }
        ]
    },
    {
        title: "[Payment] TC-STR-042 ~ 056",
        tests: [
            { id: "TC-STR-042", description: "코인 잔액 조회", method: "GET", url: "/payment/balance", mockResponse: { body: { data: { coin: 100 } } }, verify: (j) => expect(j.data.coin).toBe(100) },
            { id: "TC-STR-043", description: "충전 상품 목록 조회", method: "GET", url: "/payment/products", mockResponse: { body: { data: [{ id: "prod1" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
            { id: "TC-STR-044", description: "결제 요청", method: "POST", url: "/payment/request", mockResponse: { body: { data: { orderId: "ord1" } } }, verify: (j) => expect(j.data.orderId).toBe("ord1") },
            { id: "TC-STR-045", description: "결제 승인", method: "POST", url: "/payment/approve", mockResponse: { body: { data: { status: "COMPLETED" } } }, verify: (j) => expect(j.data.status).toBe("COMPLETED") },
            { id: "TC-STR-046", description: "결제 취소/환불 요청", method: "POST", url: "/payment/cancel", mockResponse: { body: { success: true } } },
            { id: "TC-STR-047", description: "결제 내역 조회", method: "GET", url: "/payment/history", mockResponse: { body: { data: [{ amount: 10000 }] } }, verify: (j) => expect(j.data[0].amount).toBe(10000) },
            { id: "TC-STR-048", description: "코인 사용", method: "POST", url: "/payment/use", mockResponse: { body: { success: true } } },
            { id: "TC-STR-049", description: "코인 사용 내역 조회", method: "GET", url: "/payment/usage", mockResponse: { body: { data: [{ amount: 3 }] } }, verify: (j) => expect(j.data[0].amount).toBe(3) },
            { id: "TC-STR-050", description: "구매한 회차 목록", method: "GET", url: "/library/purchased", mockResponse: { body: { data: [{ chapterId: "c2" }] } }, verify: (j) => expect(j.data[0].chapterId).toBe("c2") },
            { id: "TC-STR-051", description: "보너스 코인 지급", method: "POST", url: "/payment/bonus/give", mockResponse: { body: { success: true } } },
            { id: "TC-STR-052", description: "보너스 코인 만료 확인", method: "GET", url: "/payment/bonus/expiring", mockResponse: { body: { data: { amount: 10 } } }, verify: (j) => expect(j.data.amount).toBe(10) },
            { id: "TC-STR-053", description: "쿠폰 등록", method: "POST", url: "/coupons/register", mockResponse: { body: { success: true } } },
            { id: "TC-STR-054", description: "쿠폰 목록", method: "GET", url: "/coupons", mockResponse: { body: { data: [{ code: "WELCOME" }] } }, verify: (j) => expect(j.data[0].code).toBe("WELCOME") },
            { id: "TC-STR-055", description: "포인트 전환", method: "POST", url: "/payment/convert", mockResponse: { body: { data: { convertedCoin: 10 } } }, verify: (j) => expect(j.data.convertedCoin).toBe(10) },
            { id: "TC-STR-056", description: "정기 구독 신청", method: "POST", url: "/payment/subscribe", mockResponse: { body: { success: true } } }
        ]
    },
    {
        title: "[Misc] TC-STR-057 ~ 061",
        tests: [
            { id: "TC-STR-057", description: "공지사항 목록", method: "GET", url: "/notice", mockResponse: { body: { data: [{ id: "n1" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
            { id: "TC-STR-058", description: "공지사항 상세", method: "GET", url: "/notice/:id", requestUrl: "/notice/n1", mockResponse: { body: { data: { content: "Details" } } }, verify: (j) => expect(j.data.content).toBe("Details") },
            { id: "TC-STR-059", description: "FAQ 목록", method: "GET", url: "/faq", mockResponse: { body: { data: [{ question: "Q1" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
            { id: "TC-STR-060", description: "1:1 문의 등록", method: "POST", url: "/inquiry", mockResponse: { body: { success: true } } },
            { id: "TC-STR-061", description: "앱 버전 체크", method: "GET", url: "/version", mockResponse: { body: { data: { version: "1.0.0" } } }, verify: (j) => expect(j.data.version).toBe("1.0.0") }
        ]
    }
];

describe("Storead API Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    testGroups.forEach(group => {
        describe(group.title, () => {
            group.tests.forEach(tc => {
                it(`${tc.id}: ${tc.description}`, async () => {
                    await runApiTest(tc);
                });
            });
        });
    });
});
