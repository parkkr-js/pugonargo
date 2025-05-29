export interface ExcelData {
	/** 날짜 정보 */
	year: string;
	month: string;
	day: string;

	/** 그룹 (L열14행부터 끝까지) */
	group: string;

	/** 차량번호 (D열14행부터 끝까지) */
	vehicleNumber: string;

	/** 운송구간 (E열14행부터 끝까지) */
	transportRoute: string;

	/** 지급 중량 (M열14행부터 끝까지) */
	chargeableWeight: number;

	/** 지급 단가 (N열14행부터 끝까지) */
	unitPrice?: number;

	/** 금액 (O열14행부터 끝까지) */
	columnOAmount?: number;

	/** 금액 (I열14행부터 끝까지) */
	columnIAmount?: number;

	columnQAmount?: number;

	/** 비고 (P열14행부터 끝까지) */
	memo?: string;
}

export interface GoogleSheetFile {
	id: string;
	name: string;
	mimeType: string;
}

export interface SheetValueRange {
	values?: string[][];
}

export interface BatchGetResponse {
	valueRanges: SheetValueRange[];
}
