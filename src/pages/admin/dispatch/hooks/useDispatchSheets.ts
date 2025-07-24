import { useQuery } from "@tanstack/react-query";
import { GoogleApiService } from "../../../../services/sheet-management/googleApiService";

// Query Keys
export const dispatchKeys = {
	all: ["dispatch"] as const,
	driveFiles: () => [...dispatchKeys.all, "driveFiles"] as const,
	sheetNames: (fileId: string) =>
		[...dispatchKeys.all, "sheetNames", fileId] as const,
};

// Google Drive 파일 목록 가져오기
export const useDriveFiles = (accessToken: string | null) => {
	return useQuery({
		queryKey: dispatchKeys.driveFiles(),
		queryFn: async () => {
			if (!accessToken) {
				throw new Error("Access token is required");
			}
			const apiService = new GoogleApiService(accessToken);
			return apiService.getDriveExcelFiles();
		},
		enabled: !!accessToken,
		staleTime: 5 * 60 * 1000, // 5분
	});
};

// 시트 이름 목록 가져오기
export const useSheetNames = (
	fileId: string | null,
	accessToken: string | null,
) => {
	return useQuery({
		queryKey: dispatchKeys.sheetNames(fileId || ""),
		queryFn: async () => {
			if (!accessToken || !fileId) {
				throw new Error("Access token and file ID are required");
			}
			const apiService = new GoogleApiService(accessToken);
			return apiService.getSheetNames(fileId);
		},
		enabled: !!accessToken && !!fileId,
		staleTime: 5 * 60 * 1000, // 5분
	});
};
