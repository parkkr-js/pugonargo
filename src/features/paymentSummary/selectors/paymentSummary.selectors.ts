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

export const selectVatAmount = (summary: PaymentSummary | null) => {
	if (!summary) return { claimVat: 0, paymentVat: 0 };

	return {
		claimVat:
			summary.totalClaimAmountIncluding - summary.totalClaimAmountSupply,
		paymentVat: summary.totalPaymentAmount - summary.totalPaymentAmountSupply,
	};
};

export const selectAmountDifference = (summary: PaymentSummary | null) => {
	if (!summary) return { supplyDifference: 0, includingDifference: 0 };

	return {
		supplyDifference:
			summary.totalClaimAmountSupply - summary.totalPaymentAmountSupply,
		includingDifference:
			summary.totalClaimAmountIncluding - summary.totalPaymentAmount,
	};
};
