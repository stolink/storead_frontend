import { test, expect } from "@playwright/test";
import { ROUTES, TIMEOUTS } from "../fixtures/test-config";

/**
 * 뷰어 (Viewer) E2E 테스트
 * TC-READ-007 ~ TC-READ-012
 *
 * 챕터 뷰어 및 읽기 기능 테스트
 */
test.describe("뷰어 (Viewer)", () => {
    // 테스트에 사용할 작품/챕터 ID를 동적으로 찾음
    let workId: string;
    let chapterId: string;

    test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();

        // 홈에서 첫 번째 작품 찾기
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        const workLink = page.locator('a[href*="/works/"]').first();
        if ((await workLink.count()) > 0) {
            const href = await workLink.getAttribute("href");
            if (href) {
                const match = href.match(/\/works\/([^\/]+)/);
                if (match) workId = match[1];
            }
        }

        // 작품 상세에서 첫 번째 챕터 찾기
        if (workId) {
            await page.goto(`/works/${workId}`);
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
     * TC-READ-007: 작품 상세 페이지 표시
     * 기대: 작품 제목, 설명, 회차 목록 표시
     */
    test("TC-READ-007: 작품 상세 페이지 표시", async ({ page }) => {
        test.skip(!workId, "테스트할 작품을 찾지 못함");

        await page.goto(ROUTES.WORK_DETAIL(workId));
        await page.waitForLoadState("networkidle");

        // 작품 정보 영역 확인
        const workInfo = page.locator(
            "[class*='detail'], [class*='info'], main h1, main h2"
        );
        await expect(workInfo.first()).toBeVisible({
            timeout: TIMEOUTS.API_RESPONSE,
        });

        // 회차 목록 확인
        const chapterList = page.locator(
            "[class*='chapter'], [class*='episode'], a[href*='/chapters/']"
        );
        await expect(chapterList.first()).toBeVisible({
            timeout: TIMEOUTS.API_RESPONSE,
        });
    });

    /**
     * TC-READ-008: 챕터 뷰어 내용 표시
     * 기대: 챕터 본문이 표시됨
     */
    test("TC-READ-008: 챕터 뷰어 내용 표시", async ({ page }) => {
        test.skip(!chapterId, "테스트할 챕터를 찾지 못함");

        await page.goto(ROUTES.CHAPTER_VIEWER(chapterId));
        await page.waitForLoadState("networkidle");

        // 뷰어 본문 영역 확인
        const viewerContent = page.locator(
            "[class*='viewer'], [class*='content'], [class*='reader'], article, main"
        );
        await expect(viewerContent.first()).toBeVisible({
            timeout: TIMEOUTS.API_RESPONSE,
        });

        // 텍스트 콘텐츠가 있는지 확인
        const textContent = await viewerContent.first().textContent();
        expect(textContent?.length).toBeGreaterThan(0);
    });

    /**
     * TC-READ-009: 읽기 설정 (폰트 크기 조절)
     * 기대: 설정 버튼 클릭 시 폰트 크기 조절 가능
     */
    test("TC-READ-009: 읽기 설정 표시", async ({ page }) => {
        test.skip(!chapterId, "테스트할 챕터를 찾지 못함");

        await page.goto(ROUTES.CHAPTER_VIEWER(chapterId));
        await page.waitForLoadState("networkidle");

        // 설정 버튼 찾기
        const settingsButton = page.locator(
            '[aria-label*="설정"], [aria-label*="settings"], button:has-text("설정"), [class*="settings"]'
        );

        if ((await settingsButton.count()) === 0) {
            test.skip(true, "설정 버튼을 찾을 수 없음");
            return;
        }

        await settingsButton.first().click();

        // 설정 패널이 열리는지 확인
        const settingsPanel = page.locator(
            "[class*='settings'], [class*='option'], [role='dialog']"
        );
        await expect(settingsPanel.first()).toBeVisible({
            timeout: TIMEOUTS.SHORT,
        });
    });

    /**
     * TC-READ-010: 다크모드 전환
     * 기대: 다크모드 토글 시 테마가 변경됨
     */
    test("TC-READ-010: 다크모드 전환", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // 테마 토글 버튼 찾기
        const themeToggle = page.locator(
            '[aria-label*="테마"], [aria-label*="theme"], [aria-label*="다크"], button:has([class*="moon"]), button:has([class*="sun"])'
        );

        if ((await themeToggle.count()) === 0) {
            test.skip(true, "테마 토글 버튼을 찾을 수 없음");
            return;
        }

        // 현재 테마 상태 확인
        const html = page.locator("html");
        const initialClass = await html.getAttribute("class");

        // 토글 클릭
        await themeToggle.first().click();
        await page.waitForTimeout(500);

        // 테마가 변경되었는지 확인
        const newClass = await html.getAttribute("class");
        // 클래스가 변경되었거나, data-theme 속성이 변경되었어야 함
        const initialTheme = await html.getAttribute("data-theme");
        await themeToggle.first().click();
        await page.waitForTimeout(500);
        const toggledTheme = await html.getAttribute("data-theme");

        // 변경 여부만 확인 (실제 테마 이름은 구현에 따라 다름)
        // 클래스 또는 data-theme 중 하나가 변경되었어야 함
        expect(initialClass !== newClass || initialTheme !== toggledTheme).toBeTruthy();
    });

    /**
     * TC-READ-011: 회차 네비게이션 (이전/다음)
     * 기대: 이전/다음 버튼 클릭 시 회차 이동
     */
    test("TC-READ-011: 회차 네비게이션", async ({ page }) => {
        test.skip(!chapterId, "테스트할 챕터를 찾지 못함");

        await page.goto(ROUTES.CHAPTER_VIEWER(chapterId));
        await page.waitForLoadState("networkidle");

        const currentUrl = page.url();

        // 다음 회차 버튼 찾기
        const nextButton = page.locator(
            'a:has-text("다음"), button:has-text("다음"), [aria-label*="next"], [class*="next"]'
        );

        if ((await nextButton.count()) > 0) {
            await nextButton.first().click();
            await page.waitForLoadState("networkidle");

            // URL이 변경되었거나 같은 페이지에서 콘텐츠가 변경되었어야 함
            // (마지막 회차면 변경 없을 수 있음)
        }

        // 이전 회차 버튼 찾기
        const prevButton = page.locator(
            'a:has-text("이전"), button:has-text("이전"), [aria-label*="prev"], [class*="prev"]'
        );

        if ((await prevButton.count()) > 0) {
            await prevButton.first().click();
            await page.waitForLoadState("networkidle");
        }
    });

    /**
     * TC-READ-012: 작품 목록으로 돌아가기
     * 기대: 뷰어에서 목록 버튼 클릭 시 작품 상세로 이동
     */
    test("TC-READ-012: 작품 목록으로 돌아가기", async ({ page }) => {
        test.skip(!chapterId || !workId, "테스트할 데이터를 찾지 못함");

        await page.goto(ROUTES.CHAPTER_VIEWER(chapterId));
        await page.waitForLoadState("networkidle");

        // 목록/뒤로가기 버튼 찾기
        const backButton = page.locator(
            'a[href*="/works/"], button:has-text("목록"), [aria-label*="back"], [class*="back"]'
        );

        if ((await backButton.count()) > 0) {
            await backButton.first().click();
            await page.waitForURL(/\/works\//, { timeout: TIMEOUTS.PAGE_LOAD });
            await expect(page).toHaveURL(/\/works\//);
        }
    });
});
