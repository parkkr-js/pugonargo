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
	d: string; // D열 (차량번호)
	e: string; // E열 (운송구간)
	g: number; // G열 (중량)
	h: number; // H열 (청구 단가)
	l: string; // L열 (매입처)
	m: number; // M열 (지급 중량)
	n: number; // N열 (지급 단가)
	p: string; // P열 (비고)
	q: number; // Q열 (지급 금액)
	createdAt: Date;
	updatedAt: Date;
}

// 월별 집계 데이터 (G*H 합계, M*N 합계)
export interface MonthlyStats {
	id: string; // YYYY-MM 형태
	year: number;
	month: number;
	totalGH: number; // G*H 합계 (청구금액)
	totalMN: number; // M*N 합계 (지급금액)
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
