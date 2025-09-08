import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GoogleApiService } from "../../../../services/sheet-management/googleApiService";
import { SheetsFirestoreService } from "../../../../services/sheet-management/sheetsFirestoreService";
import type { DriveFile } from "../../../../types/sheets";
import { transformRowToRawData } from "../../../../utils/sheetUtils";

const STALE_TIME = {
	DRIVE_FILES: 5 * 60 * 1000, // 5분
	MONTHLY_STATS: 10 * 60 * 1000, // 10분
	STATS_SUMMARY: 5 * 60 * 1000, // 5분
} as const;

// 서비스 인스턴스
const firestoreService = new SheetsFirestoreService();

// Query Keys
export const sheetsKeys = {
	all: ["sheets"] as const,
	driveFiles: () => [...sheetsKeys.all, "driveFiles"] as const,
	monthlyStats: (
		startYear: number,
		startMonth: number,
		endYear: number,
		endMonth: number,
	) =>
		[
			...sheetsKeys.all,
			"monthlyStats",
			startYear,
			startMonth,
			endYear,
			endMonth,
		] as const,
	statsSummary: () => [...sheetsKeys.all, "statsSummary"] as const,
	rawData: (year: number, month: number) =>
		[...sheetsKeys.all, "rawData", year, month] as const,
};

// Google Drive Excel 파일 목록 조회
export const useDriveFiles = (accessToken?: string) => {
	return useQuery({
		queryKey: sheetsKeys.driveFiles(),
		queryFn: async (): Promise<DriveFile[]> => {
			if (!accessToken) throw new Error("Access token is required");
			const apiService = new GoogleApiService(accessToken);
			return apiService.getDriveExcelFiles();
		},
		enabled: !!accessToken,
		staleTime: STALE_TIME.DRIVE_FILES,
		refetchOnWindowFocus: false,
	});
};

// 월별 통계 데이터 조회
export const useMonthlyStats = (
	startYear: number,
	startMonth: number,
	endYear: number,
	endMonth: number,
) => {
	return useQuery({
		queryKey: sheetsKeys.monthlyStats(startYear, startMonth, endYear, endMonth),
		queryFn: () =>
			firestoreService.getMonthlyStats(
				startYear,
				startMonth,
				endYear,
				endMonth,
			),
		staleTime: STALE_TIME.MONTHLY_STATS,
	});
};

// 통계 요약 조회 (대시보드용)
export const useStatsSummary = () => {
	return useQuery({
		queryKey: sheetsKeys.statsSummary(),
		queryFn: () => firestoreService.getStatsSummary(),
		staleTime: STALE_TIME.STATS_SUMMARY,
	});
};

// Excel 파일 처리
export const useProcessExcelFile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			fileId,
			fileName,
			accessToken,
		}: {
			fileId: string;
			fileName: string;
			accessToken: string;
		}) => {
			const apiService = new GoogleApiService(accessToken);
			const rawRows = await apiService.getSheetData(fileId);

			await firestoreService.deleteFileData(fileId);

			const transformedData = rawRows.map((row, index) =>
				transformRowToRawData(row, fileId, fileName, index + 14),
			);

			await firestoreService.processAndSaveData(transformedData, fileName);

			return {
				processedRows: transformedData.length,
				totalRows: rawRows.length,
				fileName,
			};
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: sheetsKeys.statsSummary(),
			});
		},
		onError: (error) => {
			console.error("File processing failed:", error);
		},
	});
};

// 특정 월의 원본 데이터 조회
export const useRawDataByMonth = (year: number, month: number) => {
	return useQuery({
		queryKey: sheetsKeys.rawData(year, month),
		queryFn: () => firestoreService.getRawDataByMonth(year, month),
		enabled: year > 0 && month > 0 && month <= 12,
		staleTime: STALE_TIME.MONTHLY_STATS,
	});
};
