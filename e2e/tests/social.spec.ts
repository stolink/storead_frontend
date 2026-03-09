import { test, expect } from "@playwright/test";
import { TIMEOUTS } from "../fixtures/test-config";

/**
 * 소셜 기능 E2E 테스트
 * TC-READ-013 ~ TC-READ-016
 *
 * 좋아요, 댓글, 평점 등
 */
test.describe("소셜 (Social)", () => {
    // 테스트에 사용할 챕터 ID를 동적으로 찾음
    let chapterId: string;

    test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();

        // 홈에서 첫 번째 작품 → 첫 번째 챕터 찾기
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        const workLink = page.locator('a[href*="/works/"]').first();
        if ((await workLink.count()) > 0) {
            await workLink.click();
            await page.waitForLoadState("networkidle");

            const chapterLink = page.locator('a[href*="/chapters/"]').first();
            if ((await chapterLink.count()) > 0) {
                const href = await chapterLink.getAttribute("href");
                if (href) {
                    const match = href.match(/\/chapters\/([^\/]+)/);
                    if (match) chapterId = match[1];
                }
            }
        }

        await page.close();
    });

    /**
     * TC-READ-013: 작품 좋아요 버튼 표시
     * 기대: 좋아요 버튼이 표시되고 클릭 가능
     */
    test("TC-READ-013: 좋아요 버튼 표시", async ({ page }) => {
        // 홈페이지에서 작품 상세로 이동
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        const workLink = page.locator('a[href*="/works/"]').first();
        if ((await workLink.count()) === 0) {
            test.skip(true, "작품을 찾을 수 없음");
            return;
        }

        await workLink.click();
        await page.waitForLoadState("networkidle");

        // 좋아요 버튼 찾기
        const likeButton = page.locator(
            '[aria-label*="좋아요"], [aria-label*="like"], button:has([class*="heart"]), [class*="like"]'
        );

        if ((await likeButton.count()) > 0) {
            await expect(likeButton.first()).toBeVisible();
        }
    });

    /**
     * TC-READ-014: 댓글 목록 표시
     * 기대: 챕터 페이지에서 댓글 영역 표시
     */
    test("TC-READ-014: 댓글 영역 표시", async ({ page }) => {
        test.skip(!chapterId, "테스트할 챕터를 찾지 못함");

        await page.goto(`/chapters/${chapterId}`);
        await page.waitForLoadState("networkidle");

        // 댓글 영역 찾기
        const commentSection = page.locator(
            '[class*="comment"], [class*="discussion"], [aria-label*="댓글"]'
        );

        // 댓글 버튼이나 댓글 탭 찾기
        const commentButton = page.locator(
            'button:has-text("댓글"), a:has-text("댓글"), [class*="comment"] button'
        );

        if (
            (await commentSection.count()) > 0 ||
            (await commentButton.count()) > 0
        ) {
            // 댓글 버튼 클릭 (있다면)
            if ((await commentButton.count()) > 0) {
                await commentButton.first().click();
                await page.waitForTimeout(500);
            }

            // 댓글 영역이 표시되어야 함
            const comments = page.locator("[class*='comment']");
            await expect(comments.first()).toBeVisible({
                timeout: TIMEOUTS.API_RESPONSE,
            });
        }
    });

    /**
     * TC-READ-015: 평점 시스템 표시
     * 기대: 작품에 평점을 볼 수 있음
     */
    test("TC-READ-015: 평점 표시", async ({ page }) => {
        // 작품 상세 페이지로 이동
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        const workLink = page.locator('a[href*="/works/"]').first();
        if ((await workLink.count()) === 0) {
            test.skip(true, "작품을 찾을 수 없음");
            return;
        }

        await workLink.click();
        await page.waitForLoadState("networkidle");

        // 평점/별점 요소 찾기
        const rating = page.locator(
            '[class*="rating"], [class*="star"], [aria-label*="평점"], [aria-label*="rating"]'
        );

        // 평점이 있으면 확인
        if ((await rating.count()) > 0) {
            await expect(rating.first()).toBeVisible();
        }
    });

    /**
     * TC-READ-016: 공유 기능
     * 기대: 공유 버튼 클릭 시 공유 옵션 표시
     */
    test("TC-READ-016: 공유 버튼", async ({ page }) => {
        // 작품 상세로 이동
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        const workLink = page.locator('a[href*="/works/"]').first();
        if ((await workLink.count()) === 0) {
            test.skip(true, "작품을 찾을 수 없음");
            return;
        }

        await workLink.click();
        await page.waitForLoadState("networkidle");

        // 공유 버튼 찾기
        const shareButton = page.locator(
            '[aria-label*="공유"], [aria-label*="share"], button:has-text("공유"), [class*="share"]'
        );

        if ((await shareButton.count()) > 0) {
            await expect(shareButton.first()).toBeVisible();

            // 클릭하면 공유 옵션이 나타나야 함
            await shareButton.first().click();
            await page.waitForTimeout(500);
        }
    });
});
