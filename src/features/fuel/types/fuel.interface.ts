// src/features/fuel/types/fuel.interface.ts
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

// 연료 기록 생성을 위한 파라미터 타입
export interface CreateFuelRecordRequest {
	vehicleNumber: string;
	date: string; // 'yyyy-mm-dd' 형식
	fuelPrice: number;
	fuelAmount: number;
}

// 연료 기록 조회를 위한 파라미터 타입
export interface GetFuelRecordsRequest {
	vehicleNumber: string;
	date: string; // 'yyyy-mm-dd' 형식
}

// 연료 기록 삭제를 위한 파라미터 타입
export interface DeleteFuelRecordsRequest {
	vehicleNumber: string;
	date: string; // 'yyyy-mm-dd' 형식
}

// 연료 통계 타입
export interface FuelStatistics {
	totalCost: number;
	totalAmount: number;
	averagePrice: number;
	recordCount: number;
}

// 폼 데이터 타입
export interface FuelFormData {
	fuelPrice: number;
	fuelAmount: number;
}
