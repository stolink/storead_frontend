import { http, HttpResponse } from "msw";

const API_URL = "/api";

export const handlers = [
    // --- Storead Specific APIs ---

    // Discovery / Search
    http.get(`/discovery/search`, ({ request }) => {
        const url = new URL(request.url);
        const keyword = url.searchParams.get("keyword");
        const page = url.searchParams.get("page");

        return HttpResponse.json({
            data: {
                content: [
                    {
                        id: "work-1",
                        title: "판타지 대작",
                        author: "작가1",
                        genre: "fantasy",
                        viewCount: 150,
                        likeCount: 10,
                    },
                    {
                        id: "work-2",
                        title: "판타지 소설",
                        author: "작가2",
                        genre: "fantasy",
                        viewCount: 100,
                        likeCount: 5,
                    },
                ],
                totalElements: 25,
                totalPages: 3,
                currentPage: parseInt(page || "0"),
                keyword: keyword,
            },
        });
    }),

    // Works / Chapters Read
    http.get(`${API_URL}/chapters/:cid`, ({ params }) => {
        return HttpResponse.json({
            data: {
                id: params.cid,
                title: "제1화: 시작",
                content: "<p>이야기가 시작됩니다...</p>",
                writerName: "작가 홍길동",
                workTitle: "판타지 대작",
                chapterNumber: 1,
                viewCount: 1234,
                publishedAt: "2025-01-01T00:00:00Z",
            },
        });
    }),

    // Comments
    http.post(`${API_URL}/chapters/:cid/comments`, async ({ request }) => {
        const body = (await request.json()) as { content: string };
        return HttpResponse.json(
            {
                data: {
                    id: "comment-uuid",
                    content: body.content,
                    author: "Test User",
                    createdAt: new Date().toISOString(),
                },
            },
            { status: 201 },
        );
    }),

    // Ratings
    http.post(`${API_URL}/chapters/:id/rating`, async ({ request }) => {
        const body = (await request.json()) as { score: number };
        return HttpResponse.json({
            data: {
                score: body.score,
                averageRating: 4.8,
                totalRatings: 150,
            },
        });
    }),

    // Auth (Minimal for context)
    http.get(`${API_URL}/auth/me`, () => {
        return HttpResponse.json({
            data: {
                id: "user-id",
                email: "test@example.com",
                nickname: "Test User",
                role: "USER"
            }
        });
    })
];
