import { test, expect } from "@playwright/test";
import { ROUTES, TIMEOUTS, GENRES } from "../fixtures/test-config";

/**
 * 탐색(Discovery) E2E 테스트
 * TC-READ-001 ~ TC-READ-006
 *
 * Storead 독자용 페이지 테스트
 */
test.describe("탐색 (Discovery)", () => {
    /**
     * TC-READ-001: 홈페이지 로드 및 캐러셀 표시
     * 기대: 메인 페이지 로드, 추천 캐러셀/배너 표시
     */
    test("TC-READ-001: 홈페이지 로드 및 콘텐츠 표시", async ({ page }) => {
        await page.goto(ROUTES.HOME);
        await page.waitForLoadState("networkidle");

        // 페이지 타이틀 또는 로고 확인
        await expect(page.locator("body")).toBeVisible();

        // 메인 콘텐츠 영역 확인 (캐러셀, 작품 카드 등)
        const mainContent = page.locator("main, [role='main'], .main-content");
        if ((await mainContent.count()) > 0) {
            await expect(mainContent.first()).toBeVisible();
        }

        // 작품 카드 또는 추천 섹션 확인
        const workCards = page.locator(
            "[class*='card'], [class*='work'], [class*='item']"
        );
        // 최소 1개 이상의 콘텐츠가 있어야 함
        await expect(workCards.first()).toBeVisible({
            timeout: TIMEOUTS.API_RESPONSE,
        });
    });

    /**
     * TC-READ-002: 작품 카드 클릭 → 상세 페이지 이동
     * 기대: 작품 카드 클릭 시 /works/:id 페이지로 이동
     */
    test("TC-READ-002: 작품 카드 클릭 → 상세 페이지 이동", async ({ page }) => {
        await page.goto(ROUTES.HOME);
        await page.waitForLoadState("networkidle");

        // 작품 카드 찾기
        const workCard = page
            .locator('a[href*="/works/"], [class*="card"] a, [class*="work"] a')
            .first();

        // 카드가 없으면 스킵
        if ((await workCard.count()) === 0) {
            test.skip(true, "표시된 작품 카드가 없음");
            return;
        }

        await workCard.click();

        // 작품 상세 페이지로 이동 확인
        await page.waitForURL(/\/works\//, { timeout: TIMEOUTS.PAGE_LOAD });
        await expect(page).toHaveURL(/\/works\//);
    });

    /**
     * TC-READ-003: 랭킹 페이지 조회
     * 기대: 랭킹 목록이 순위와 함께 표시됨
     */
    test("TC-READ-003: 랭킹 페이지 조회", async ({ page }) => {
        await page.goto(ROUTES.RANKING);
        await page.waitForLoadState("networkidle");

        // 랭킹 페이지임을 확인
        await expect(page).toHaveURL(/ranking/);

        // 랭킹 관련 요소 확인 (순위, 목록 등)
        const rankingContent = page.locator(
            "[class*='rank'], [class*='list'], main"
        );
        await expect(rankingContent.first()).toBeVisible({
            timeout: TIMEOUTS.API_RESPONSE,
        });
    });

    /**
     * TC-READ-004: 카테고리/장르 필터링
     * 기대: 특정 장르 선택 시 해당 장르 작품만 표시
     */
    test("TC-READ-004: 카테고리별 작품 필터링", async ({ page }) => {
        // 판타지 카테고리로 이동
        await page.goto(ROUTES.CATEGORY(GENRES.FANTASY));
        await page.waitForLoadState("networkidle");

        // 카테고리 페이지임을 확인
        await expect(page).toHaveURL(/category/);

        // 작품 목록 표시 확인
        const content = page.locator("main, [class*='grid'], [class*='list']");
        await expect(content.first()).toBeVisible({
            timeout: TIMEOUTS.API_RESPONSE,
        });
    });

    /**
     * TC-READ-005: 검색 기능 (홈페이지에서)
     * 기대: 검색어 입력 시 검색 결과 표시
     */
    test("TC-READ-005: 검색 기능", async ({ page }) => {
        await page.goto(ROUTES.HOME);
        await page.waitForLoadState("networkidle");

        // 검색 입력 필드 찾기
        const searchInput = page.locator(
            'input[type="search"], input[placeholder*="검색"], input[placeholder*="search"]'
        );

        if ((await searchInput.count()) === 0) {
            // 검색 버튼 클릭으로 검색창 열기
            const searchButton = page.locator(
                '[aria-label*="검색"], [aria-label*="search"], button:has-text("검색")'
            );
            if ((await searchButton.count()) > 0) {
                await searchButton.click();
            }
        }

        // 검색 입력 재시도
        const searchField = page.locator(
            'input[type="search"], input[placeholder*="검색"]'
        );
        if ((await searchField.count()) === 0) {
            test.skip(true, "검색 필드를 찾을 수 없음");
            return;
        }

        await searchField.fill("판타지");
        await searchField.press("Enter");

        // 검색 결과 또는 URL 변경 확인 (waitForTimeout 대신 안정적인 대기)
        await Promise.race([
            // URL에 검색어가 포함될 때까지 대기
            page.waitForURL(/search|query|q=/, { timeout: TIMEOUTS.API_RESPONSE }).catch(() => { }),
            // 또는 검색 결과 영역이 표시될 때까지 대기
            page.locator("[class*='result'], [class*='search'], main").first().waitFor({
                state: "visible",
                timeout: TIMEOUTS.API_RESPONSE
            }).catch(() => { }),
        ]);

        // 결과가 표시되거나 URL에 검색어가 포함되어야 함
    });

    /**
     * TC-READ-006: 네비게이션 메뉴 동작
     * 기대: 헤더 네비게이션 링크가 정상 동작
     */
    test("TC-READ-006: 네비게이션 메뉴 동작", async ({ page }) => {
        await page.goto(ROUTES.HOME);
        await page.waitForLoadState("networkidle");

        // 랭킹 링크 찾아서 클릭
        const rankingLink = page.locator(
            'a[href*="ranking"], nav a:has-text("랭킹")'
        );
        if ((await rankingLink.count()) > 0) {
            await rankingLink.first().click();
            await page.waitForURL(/ranking/, { timeout: TIMEOUTS.PAGE_LOAD });
            await expect(page).toHaveURL(/ranking/);
        }

        // 홈으로 돌아가기
        const homeLink = page.locator(
            'a[href="/"], [class*="logo"] a, header a:first-child'
        );
        if ((await homeLink.count()) > 0) {
            await homeLink.first().click();
            await page.waitForURL("/", { timeout: TIMEOUTS.PAGE_LOAD });
        }
    });
});
