import type { OperationLogCalculated } from "../types/operationLog.types";

export const formatKoreanNumber = (amount: number): string => {
	return new Intl.NumberFormat("ko-KR").format(amount);
};

export const formatWeight = (weight: number): string => {
	return formatKoreanNumber(weight);
};

export const formatCurrency = (amount: number): string => {
	return `${formatKoreanNumber(amount)}원`;
};

export const selectFormattedOperationLog = (
	operationLog: OperationLogCalculated,
) => {
	return {
		id: operationLog.id,
		transportRoute: operationLog.transportRoute,
		chargeableWeight: formatWeight(operationLog.chargeableWeight),
		totalAmount: formatCurrency(operationLog.totalAmount),
		commissionFee: formatCurrency(operationLog.commissionFee),
		finalAmount: formatCurrency(operationLog.finalAmount),
	};
};

export const selectFormattedOperationLogs = (
	operationLogs: OperationLogCalculated[],
) => {
	return operationLogs.map(selectFormattedOperationLog);
};
