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
	date: string; // C열 (날짜, YYYY-MM-DD string)
	d: string; // D열
	e: string; // E열
	m: number; // M열
	n: number; // N열
	o: number; // O열 (월별 집계용)
	p: string; // P열
	i: number; // I열 (월별 집계용)
	q: number; // Q열
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
	sourceFiles: string[]; // 데이터가 포함된 파일 목록
	rawDataIds: string[]; // 해당 월의 rawData 문서 ID들
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
