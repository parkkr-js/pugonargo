// src/features/paymentSummary/selectors/paymentSummary.selectors.ts
import type { PaymentSummary } from "../types/paymentSummary";

export const formatKoreanCurrency = (amount: number): string => {
	return `${new Intl.NumberFormat("ko-KR").format(amount)} 원`;
};

export const selectFormattedPaymentSummary = (
	summary: PaymentSummary | null,
) => {
	if (!summary) {
		return {
			totalClaimAmountIncluding: "0 원",
			totalClaimAmountSupply: "0 원",
			totalPaymentAmount: "0 원",
			totalPaymentAmountSupply: "0 원",
		};
	}

	return {
		totalClaimAmountIncluding: formatKoreanCurrency(
			summary.totalClaimAmountIncluding,
		),
		totalClaimAmountSupply: formatKoreanCurrency(
			summary.totalClaimAmountSupply,
		),
		totalPaymentAmount: formatKoreanCurrency(summary.totalPaymentAmount),
		totalPaymentAmountSupply: formatKoreanCurrency(
			summary.totalPaymentAmountSupply,
		),
	};
};
