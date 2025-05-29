export interface Repair {
	id: string;
	vehicleNumber: string;
	year: string;
	month: string;
	day: string;
	repairCost: number; // 정비비용
	repairDescription: string; // 정비내용
	createdAt: string;
	updatedAt?: string;
}

// 수리 내역 생성을 위한 파라미터 타입
export interface CreateRepairRecordRequest {
	vehicleNumber: string;
	date: string; // 'yyyy-mm-dd' 형식
	repairCost: number;
	repairDescription: string;
}

// 수리 내역 조회를 위한 파라미터 타입
export interface GetRepairRecordsRequest {
	vehicleNumber: string;
	date: string; // 'yyyy-mm-dd' 형식
}

// 수리 내역 삭제를 위한 파라미터 타입
export interface DeleteRepairRecordsRequest {
	vehicleNumber: string;
	date: string; // 'yyyy-mm-dd' 형식
}

// 수리 통계 타입
export interface RepairStatistics {
	totalCost: number;
	recordCount: number;
}

// 폼 데이터 타입
export interface RepairFormData {
	repairCost: number;
	repairDescription: string;
}
