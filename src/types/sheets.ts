// 구글 드라이브 파일 정보
export interface DriveFile {
	id: string;
	name: string;
	mimeType: string;
	modifiedTime: string;
	size?: string;
}

// 원본 데이터 (14행부터의 각 행)
export interface RawData {
	id: string;
	fileId: string; // 원본 스프레드시트 ID
	fileName: string;
	date: Date; // C열 (날짜, Excel 시리얼 → Date 변환됨)
	d: string | number; // D열
	e: string | number; // E열
	m: string | number; // M열
	n: string | number; // N열
	o: number; // O열 (월별 집계용)
	p: string | number; // P열
	i: number; // I열 (월별 집계용)
	createdAt: Date;
	updatedAt: Date;
}

// 월별 집계 데이터 (I열, O열 합계)
export interface MonthlyStats {
	id: string; // YYYY-MM 형태
	year: number;
	month: number;
	totalI: number; // I열 합계
	totalO: number; // O열 합계
	recordCount: number; // 데이터 건수
	lastUpdated: Date;
}

// API 응답 타입들
export interface DriveFilesResponse {
	files: DriveFile[];
}

export interface SheetValuesResponse {
	values: (string | number)[][];
}

// 프론트엔드 상태 관리용
export interface SheetsState {
	driveFiles: DriveFile[];
	processing: boolean;
	selectedFileId: string | null;
	monthlyData: MonthlyStats[];
	isLoading: boolean;
	error: string | null;
}
