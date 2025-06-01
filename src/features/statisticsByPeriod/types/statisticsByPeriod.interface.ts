// src/features/statisticsByPeriod/types/statisticsByPeriod.interface.ts

export interface PeriodRange {
	startDate: string; // YYYY-MM-DD 형식
	endDate: string; // YYYY-MM-DD 형식
}

export interface OperationRecord {
	year: string; // "2025" (문자열)
	month: string; // "01", "02", ... "12" (문자열, 2자리)
	day: string; // "01", "02", ... "31" (문자열, 2자리)
	vehicleNumber: string;
	columnQAmount: number; // 단가
	columnOAmount: number; // 공제 후 금액
	chargeableWeight: number; // 중량
	docId: string;
}

export interface FuelRecord {
	year: string; // "2025" (문자열)
	month: string; // "01", "02", ... "12" (문자열, 2자리)
	day: string; // "01", "02", ... "31" (문자열, 2자리)
	vehicleNumber: string;
	totalFuelCost: number; // 총 유류비
}

export interface RepairRecord {
	year: string; // "2025" (문자열)
	month: string; // "01", "02", ... "12" (문자열, 2자리)
	day: string; // "01", "02", ... "31" (문자열, 2자리)
	vehicleNumber: string;
	repairCost: number; // 정비비
}

export interface PeriodStatistics {
	totalAmount: number; // 총 금액 (단가 × 중량의 합)
	managementFee: number; // 지입료 (총 금액의 5%)
	deductedAmount: number; // 공제 후 금액
	totalFuelCost: number; // 총 유류비
	totalRepairCost: number; // 총 정비비
}

export interface StatisticsByPeriodState {
	selectedPeriod: PeriodRange;
	statistics: PeriodStatistics | null;
	isLoading: boolean;
	error: string | null;
}

export interface GetStatisticsParams {
	vehicleNumber: string;
	startDate: string; // YYYY-MM-DD 형식
	endDate: string; // YYYY-MM-DD 형식
}
