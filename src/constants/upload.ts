/**
 * 파일 업로드 타입 상수
 * 오타 방지 및 유지보수성 향상
 */
export const UPLOAD_TYPES = {
    /** 일반 파일 (기본값) */
    COMMON: "common",
    /** 작품 표지 이미지 */
    COVER: "cover",
} as const;

/** 파일 업로드 타입 유니온 */
export type UploadType = (typeof UPLOAD_TYPES)[keyof typeof UPLOAD_TYPES];
