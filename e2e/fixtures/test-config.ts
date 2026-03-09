/**
 * Storead E2E 테스트 공통 설정 및 테스트 계정 정보
 */

// 테스트용 계정 정보 (독자 계정)
export const TEST_READER = {
    email: "reader@gmail.com",
    password: "qlalfqjsgh1~",
};

// 공통 URL 경로
export const ROUTES = {
    HOME: "/",
    RANKING: "/ranking",
    CATEGORY: (genreId: string) => `/category/${genreId}`,
    WORK_DETAIL: (workId: string) => `/works/${workId}`,
    CHAPTER_VIEWER: (chapterId: string) => `/chapters/${chapterId}`,
    WRITE: "/write",
    AUTH: "/oauth2/callback",
};

// 테스트 타임아웃 설정
export const TIMEOUTS = {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 30000,
    API_RESPONSE: 15000,
    PAGE_LOAD: 20000,
};

// 테스트용 작품/회차 ID (실제 DB에 존재해야 함, 없으면 동적 탐색)
export const TEST_DATA = {
    WORK_ID: "", // 테스트 중 동적으로 찾음
    CHAPTER_ID: "", // 테스트 중 동적으로 찾음
};

// 장르 ID 매핑
export const GENRES = {
    FANTASY: "fantasy",
    ROMANCE: "romance",
    ACTION: "action",
    DRAMA: "drama",
};
