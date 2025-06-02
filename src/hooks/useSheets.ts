import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GoogleApiService } from "../services/googleApiService";
import { SheetsFirestoreService } from "../services/sheetsFirestoreService";
import type { DriveFile } from "../types/sheets";
import { transformRowToRawData } from "../utils/sheetUtils";

// 서비스 인스턴스들
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
};

/**
 * Google Drive Excel 파일 목록 조회
 */
export const useDriveFiles = (accessToken?: string) => {
	return useQuery({
		queryKey: sheetsKeys.driveFiles(),
		queryFn: async (): Promise<DriveFile[]> => {
			if (!accessToken) {
				throw new Error("Access token is required");
			}
			const apiService = new GoogleApiService(accessToken);
			return apiService.getDriveExcelFiles();
		},
		enabled: !!accessToken,
		staleTime: 5 * 60 * 1000, // 5분
		refetchOnWindowFocus: false,
	});
};

/**
 * 월별 통계 데이터 조회
 */
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
		staleTime: 10 * 60 * 1000, // 10분
	});
};

/**
 * 통계 요약 조회 (대시보드용)
 */
export const useStatsSummary = () => {
	return useQuery({
		queryKey: sheetsKeys.statsSummary(),
		queryFn: () => firestoreService.getStatsSummary(),
		staleTime: 5 * 60 * 1000, // 5분
	});
};

/**
 * Excel 파일 처리 (단순화)
 */
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

			// 1. 시트 데이터 읽기 (Excel 파일 자동 변환 및 임시 파일 정리 포함)
			const rawRows = await apiService.getSheetData(fileId);

			// 2. 기존 데이터 삭제 (같은 파일 재처리시)
			await firestoreService.deleteFileData(fileId);

			// 3. 데이터 변환 및 저장
			const transformedData = rawRows.map((row, index) =>
				transformRowToRawData(row, fileId, fileName, index + 14),
			);

			// 4. DB에 저장 (배치 처리)
			await firestoreService.processAndSaveData(transformedData);

			return {
				processedRows: transformedData.length,
				totalRows: rawRows.length,
				fileName,
			};
		},
		onSuccess: () => {
			// 캐시 무효화
			void queryClient.invalidateQueries({
				queryKey: sheetsKeys.statsSummary(),
			});
		},
		onError: (error) => {
			console.error("File processing failed:", error);
		},
	});
};

/**
 * 특정 월의 원본 데이터 조회
 */
export const useRawDataByMonth = (year: number, month: number) => {
	return useQuery({
		queryKey: [...sheetsKeys.all, "rawData", year, month],
		queryFn: () => firestoreService.getRawDataByMonth(year, month),
		enabled: year > 0 && month > 0 && month <= 12,
		staleTime: 10 * 60 * 1000, // 10분
	});
};
