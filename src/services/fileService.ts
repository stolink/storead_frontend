import api from "@/api/client";
import { UPLOAD_TYPES, type UploadType } from "@/constants/upload";

/**
 * 파일 업로드 서비스
 */
export const fileService = {
    /**
     * 단일 파일 업로드
     * @param file 업로드할 파일 객체
     * @param type 파일 유형 (UPLOAD_TYPES.COVER, UPLOAD_TYPES.COMMON 등)
     */
    upload: async (file: File, type: UploadType = UPLOAD_TYPES.COMMON): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        const { data } = await api.post("/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        // 백엔드 응답: { code, status, data: { url: "..." } }
        return data.data;
    },
};
