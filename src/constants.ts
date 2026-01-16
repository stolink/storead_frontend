/**
 * 전역 상수 정의
 */

/**
 * 외부 에디터 서버 URL
 * 호스트명에 따라 배포 환경(Dev/Release) 또는 로컬 환경 주소를 동적으로 결정합니다.
 */
const getEditorUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:5173';

    const hostname = window.location.hostname;

    // 배포 환경 체크
    if (hostname.includes('dev.stolink.link')) {
        return 'https://dev.stolink.link';
    }

    if (hostname.includes('stolink.link')) {
        return 'https://stolink.link';
    }

    // 기본 로컬 환경
    return import.meta.env.VITE_STOLINK_URL || 'http://localhost:5173';
};

export const EXTERNAL_EDITOR_URL = getEditorUrl();
