// src/features/paymentSummary/types/paymentSummary.ts

export interface PaymentSummary {
	totalClaimAmountIncluding: number; // 총 청구금액(부가세 포함)
	totalClaimAmountSupply: number; // 총 청구금액(공급가)
	totalPaymentAmount: number; // 총 지급금액(부가세 포함)
	totalPaymentAmountSupply: number; // 총 지급금액(공급가)
}

export interface PaymentDocument {
	id: string;
	columnIAmount: number; // I열 금액 (청구금액)
	columnOAmount: number; // O열 금액 (지급금액)
	date: string; // 날짜 (yyyy-mm-dd 형식)
	createdAt: string;
	updatedAt?: string;
}

export interface PaymentSummaryRequest {
	dateRange: string; // 'yyyy-mm' 또는 'yyyy-mm-dd ~ yyyy-mm-dd'
}

export interface PaymentSummaryResponse {
	summary: PaymentSummary;
	dateRange: string;
	totalDocuments: number;
}
