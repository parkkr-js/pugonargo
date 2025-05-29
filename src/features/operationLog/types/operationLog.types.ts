export interface OperationLogDocument {
	id: string;
	chargeableWeight: number;
	columnIAmount: number;
	columnOAmount: number;
	columnQAmount: number;
	day: string;
	group: string;
	memo: string;
	month: string;
	transportRoute: string;
	unitPrice: number;
	vehicleNumber: string;
	year: string;
}

export interface OperationLogRequest {
	date: string; // yyyy-mm-dd
	vehicleNumber: string;
}

export interface OperationLogCalculated {
	id: string;
	transportRoute: string;
	chargeableWeight: number;
	totalAmount: number; // columnQAmount * chargeableWeight
	commissionFee: number; // 총 금액 * 0.05
	finalAmount: number; // columnOAmount
}
