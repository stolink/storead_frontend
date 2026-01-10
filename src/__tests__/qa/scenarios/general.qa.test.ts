import { describe, it, beforeEach, vi, expect } from "vitest";
import { runApiTest, type ApiTestCase } from "@/test/api-helpers";

const libraryTests: ApiTestCase[] = [
    { id: "TC-STR-026", description: "내 서재 목록", method: "GET", url: "/library", mockResponse: { body: { data: [{ id: "l1" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
    { id: "TC-STR-027", description: "서재에 작품 추가", method: "POST", url: "/library/:workId", requestUrl: "/library/w1", mockResponse: { body: { success: true } } },
    { id: "TC-STR-028", description: "서재에서 작품 삭제", method: "DELETE", url: "/library/:workId", requestUrl: "/library/w1", mockResponse: { body: { success: true } } },
    { id: "TC-STR-029", description: "최근 본 작품 목록", method: "GET", url: "/history", mockResponse: { body: { data: [{ workId: "w1" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
    { id: "TC-STR-030", description: "최근 본 작품 삭제", method: "DELETE", url: "/history/:workId", requestUrl: "/history/w1", mockResponse: { body: { success: true } } },
    { id: "TC-STR-031", description: "읽은 회차 표시", method: "POST", url: "/history/chapter/:id", requestUrl: "/history/chapter/c1", mockResponse: { body: { success: true } } }
];

const socialTests: ApiTestCase[] = [
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
];

const paymentTests: ApiTestCase[] = [
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
];

const miscTests: ApiTestCase[] = [
    { id: "TC-STR-057", description: "공지사항 목록", method: "GET", url: "/notice", mockResponse: { body: { data: [{ id: "n1" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
    { id: "TC-STR-058", description: "공지사항 상세", method: "GET", url: "/notice/:id", requestUrl: "/notice/n1", mockResponse: { body: { data: { content: "Details" } } }, verify: (j) => expect(j.data.content).toBe("Details") },
    { id: "TC-STR-059", description: "FAQ 목록", method: "GET", url: "/faq", mockResponse: { body: { data: [{ question: "Q1" }] } }, verify: (j) => expect(j.data.length).toBe(1) },
    { id: "TC-STR-060", description: "1:1 문의 등록", method: "POST", url: "/inquiry", mockResponse: { body: { success: true } } },
    { id: "TC-STR-061", description: "앱 버전 체크", method: "GET", url: "/version", mockResponse: { body: { data: { version: "1.0.0" } } }, verify: (j) => expect(j.data.version).toBe("1.0.0") }
];

describe("General Storead API Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("[Library] TC-STR-026 ~ 031", () => {
        libraryTests.forEach(tc => it(`${tc.id}: ${tc.description}`, () => runApiTest(tc)));
    });

    describe("[Social] TC-STR-032 ~ 041", () => {
        socialTests.forEach(tc => it(`${tc.id}: ${tc.description}`, () => runApiTest(tc)));
    });

    describe("[Payment] TC-STR-042 ~ 056", () => {
        paymentTests.forEach(tc => it(`${tc.id}: ${tc.description}`, () => runApiTest(tc)));
    });

    describe("[Misc] TC-STR-057 ~ 061", () => {
        miscTests.forEach(tc => it(`${tc.id}: ${tc.description}`, () => runApiTest(tc)));
    });
});
