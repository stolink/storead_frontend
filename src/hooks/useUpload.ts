import { useMutation } from "@tanstack/react-query";
import { fileService } from "@/services/fileService";

/**
 * 파일 업로드용 TanStack Query 훅
 */
export const useUpload = () => {
    return useMutation({
        mutationFn: ({ file, type }: { file: File; type?: string }) =>
            fileService.upload(file, type),
    });
};
