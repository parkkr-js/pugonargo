/**
 * 배차 데이터 타입 정의
 */
import type { DriveFile } from "./sheets";

export interface DispatchData {
	id: string;
	date: string;
	sheetId: string;
	supplier: string;
	vehicleNumber: string;
	dispatchType: string;
	loadingLocation: string;
	unloadingLocation: string;
	rotationCount: number;
	loadingMemo?: string;
	unloadingMemo?: string;
	warning?: string;
}

/**
 * 배차 데이터 처리 파라미터 타입
 */
export interface ProcessDispatchParams {
	file: DriveFile;
	sheetName: string;
	accessToken: string;
}

/**
 * 배차 데이터 처리 결과 타입
 */
export interface ProcessDispatchResult {
	docId: string;
	processedCount: number;
}

/**
 * 배차 데이터 테이블 Props 타입
 */
export interface DispatchDataTableProps {
	docId: string;
}

/**
 * Google Drive 파일 타입 (sheets.ts에서 재export)
 */
export type { DriveFile };

/**
 * 시트 데이터 응답 타입
 */
export interface SheetDataResponse {
	sheets?: {
		merges?: {
			startRowIndex?: number;
			endRowIndex?: number;
			startColumnIndex?: number;
			endColumnIndex?: number;
		}[];
		data?: {
			rowData?: {
				values?: {
					formattedValue?: string;
					note?: string;
				}[];
			}[];
		}[];
	}[];
}
