/**
 * 운송 금액 계산 유틸리티
 * 모든 금액 계산에서 일관된 반올림 정책을 적용합니다.
 */

export interface DriveCalculation {
	amount: number;
	deduction: number;
	afterDeduction: number;
}

export interface PeriodCalculation {
	totalAmount: number;
	totalDeduction: number;
	totalFuelCost: number;
	totalRepairCost: number;
	afterDeduction: number;
}

export interface MonthlyCalculation {
	totalGH: number; // G*H 합계 (청구금액)
	totalMN: number; // M*N 합계 (지급금액)
	totalGHWithTax: number; // (G*H 합계) * 1.1
	totalMNWithTax: number; // (M*N 합계) * 1.1
}

/**
 * 개별 운송 레코드의 금액 계산
 * @param quantity 지급중량
 * @param unitPrice 단가
 * @returns 계산된 금액 정보
 */
export function calculateDriveAmount(
	quantity: number,
	unitPrice: number,
): DriveCalculation {
	const amount = Math.round(quantity * unitPrice);
	const deduction = Math.round(amount * 0.05);
	const afterDeduction = amount - deduction;

	return {
		amount,
		deduction,
		afterDeduction,
	};
}

/**
 * 기간별 통계 계산
 * @param driveRecords 운송 레코드 배열
 * @param fuelRecords 연료 레코드 배열
 * @param repairRecords 정비 레코드 배열
 * @returns 기간별 통계 정보
 */
export function calculatePeriodStats(
	driveRecords: Array<{ q: number; m: number }>,
	fuelRecords: Array<{ totalFuelCost: number }>,
	repairRecords: Array<{ repairCost: number }>,
): PeriodCalculation {
	// 운송 금액 계산
	let totalAmount = 0;
	let totalDeduction = 0;

	for (const record of driveRecords) {
		const calculation = calculateDriveAmount(record.m, record.q);
		totalAmount += calculation.amount;
		totalDeduction += calculation.deduction;
	}

	// 연료비 계산
	const totalFuelCost = fuelRecords.reduce(
		(sum, record) => sum + (record.totalFuelCost || 0),
		0,
	);

	// 정비비 계산
	const totalRepairCost = repairRecords.reduce(
		(sum, record) => sum + (record.repairCost || 0),
		0,
	);

	// 공제 후 금액 계산
	const afterDeduction =
		totalAmount - totalDeduction - totalFuelCost - totalRepairCost;

	return {
		totalAmount,
		totalDeduction,
		totalFuelCost,
		totalRepairCost,
		afterDeduction,
	};
}

/**
 * 월별 통계 계산 (G*H, M*N)
 * @param rawData 원본 데이터 배열
 * @returns 월별 통계 정보
 */
export function calculateMonthlyStats(
	rawData: Array<{ g: number; h: number; m: number; n: number }>,
): MonthlyCalculation {
	let totalGH = 0;
	let totalMN = 0;

	for (let i = 0; i < rawData.length; i++) {
		const record = rawData[i];

		// G*H 계산 (청구금액)
		const ghAmount = Math.round(record.g * record.h);
		totalGH += ghAmount;

		// M*N 계산 (지급금액)
		const mnAmount = Math.round(record.m * record.n);
		totalMN += mnAmount;
	}

	// 부가세 포함 계산
	const totalGHWithTax = Math.round(totalGH * 1.1);
	const totalMNWithTax = Math.round(totalMN * 1.1);

	return {
		totalGH,
		totalMN,
		totalGHWithTax,
		totalMNWithTax,
	};
}
