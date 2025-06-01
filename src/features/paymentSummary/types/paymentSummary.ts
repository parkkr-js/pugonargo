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
	year: string; // "2025"
	month: string; // "01"
	day: string; // "18"
	// createdAt, updatedAt 제거 (실제 Firebase 문서에 없음)
}

export interface PaymentSummaryRequest {
	dateRange: string; // 'yyyy-mm' 또는 'yyyy-mm-dd ~ yyyy-mm-dd'
}

export interface PaymentSummaryResponse {
	summary: PaymentSummary;
	dateRange: string;
	totalDocuments: number;
}
