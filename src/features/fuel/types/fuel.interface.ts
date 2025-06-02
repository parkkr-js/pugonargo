// src/features/fuel/types/fuel.interface.ts

// 기본 엔티티 타입
export interface Fuel {
	id: string;
	vehicleNumber: string;
	year: string;
	month: string;
	day: string;
	fuelAmount: number; // 주유량
	fuelPrice: number; // 단가
	totalFuelCost: number; // 총주유비 주유량 * 단가
	createdAt: string;
	updatedAt?: string;
}

// Usecase 파라미터 타입들
export interface CreateFuelRecordParams {
	vehicleNumber: string;
	date: string;
	fuelPrice: number;
	fuelAmount: number;
}

export interface GetFuelRecordsParams {
	vehicleNumber: string;
	date: string;
}

export interface UpdateFuelRecordParams {
	recordId: string;
	fuelPrice: number;
	fuelAmount: number;
}

export interface DeleteFuelRecordParams {
	recordId: string;
}

export interface GetFuelRecordParams {
	recordId: string;
}
