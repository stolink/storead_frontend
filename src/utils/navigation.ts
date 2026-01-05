import { EXTERNAL_EDITOR_URL } from '@/constants';

/**
 * Stolink 에디터 URL 생성
 * @param projectId 프로젝트 ID (없으면 라이브러리로 이동)
 * @param documentId 문서(챕터) ID (선택 사항)
 */
export const getExternalEditorUrl = (projectId?: string | null, documentId?: string | null): string => {
    if (!projectId) {
        return `${EXTERNAL_EDITOR_URL}/library`;
    }

    const baseUrl = `${EXTERNAL_EDITOR_URL}/projects/${projectId}/editor`;

    if (documentId) {
        return `${baseUrl}?documentId=${documentId}`;
    }

    return baseUrl;
};
