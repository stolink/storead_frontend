import { useMutation } from "@tanstack/react-query";
import { fileService } from "@/services/fileService";
import type { UploadType } from "@/constants/upload";

/**
 * 파일 업로드용 TanStack Query 훅
 * @example
 * const upload = useUpload();
 * upload.mutateAsync({ file, type: UPLOAD_TYPES.COVER });
 */
export const useUpload = () => {
    return useMutation({
        mutationFn: ({ file, type }: { file: File; type?: UploadType }) =>
            fileService.upload(file, type),
    });
};
