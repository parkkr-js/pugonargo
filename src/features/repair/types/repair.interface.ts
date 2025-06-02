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

export interface CreateRepairRecordParams {
	vehicleNumber: string;
	date: string; // 'yyyy-mm-dd' 형식
	repairCost: number;
	repairDescription: string;
}

export interface GetRepairRecordsParams {
	vehicleNumber: string;
	date: string; // 'yyyy-mm-dd' 형식
}

export interface GetRepairRecordParams {
	recordId: string;
}

export interface UpdateRepairRecordParams {
	recordId: string;
	repairCost: number;
	repairDescription: string;
}

export interface DeleteRepairRecordParams {
	recordId: string;
}

export interface RepairWithGroup extends Repair {
	group: string;
}
