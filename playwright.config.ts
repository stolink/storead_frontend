import { defineConfig, devices } from "@playwright/test";

/**
 * Storead Frontend Playwright E2E 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    // 테스트 디렉토리
    testDir: "./e2e",

    // 테스트 파일 패턴
    testMatch: "**/*.spec.ts",

    // 병렬 실행 설정
    fullyParallel: true,

    // CI에서 재시도
    retries: process.env.CI ? 2 : 0,

    // 병렬 워커 수
    workers: process.env.CI ? 1 : undefined,

    // 리포터 설정
    reporter: [
        ["html", { outputFolder: "playwright-report" }],
        ["json", { outputFile: "test-results/e2e-results.json" }],
        ["list"],
    ],

    // 공통 설정
    use: {
        // 기본 URL (storead는 5174 포트)
        baseURL: "http://localhost:5174",

        // 스크린샷 (실패 시에만)
        screenshot: "only-on-failure",

        // 트레이스 (재시도 시에만)
        trace: "on-first-retry",

        // 비디오 녹화 (실패 시에만)
        video: "on-first-retry",
    },

    // 브라우저 프로젝트 설정
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],

    // 개발 서버 자동 실행 (선택사항)
    // webServer: {
    //   command: 'npm run dev',
    //   url: 'http://localhost:5174',
    //   reuseExistingServer: !process.env.CI,
    // },
});
