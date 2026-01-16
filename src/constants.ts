/**
 * 전역 상수 정의
 */

/**
 * 외부 에디터 서버 URL
 * 호스트명에 따라 배포 환경(Dev/Release) 또는 로컬 환경 주소를 동적으로 결정합니다.
 */
const ENV_CONFIGS = [
    { host: 'dev.stolink.link', url: 'https://dev.stolink.link' },
    { host: 'stolink.link', url: 'https://stolink.link' },
];

const getEditorUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:5173';

    const hostname = window.location.hostname;
    const config = ENV_CONFIGS.find(c => hostname.includes(c.host));

    if (config) return config.url;

    // 기본 로컬 환경
    return import.meta.env.VITE_STOLINK_URL || 'http://localhost:5173';
};

export const EXTERNAL_EDITOR_URL = getEditorUrl();
