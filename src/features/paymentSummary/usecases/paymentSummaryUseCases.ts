import type { PaymentSummaryService } from "../services/paymentSummaryService";
import type {
	PaymentDocument,
	PaymentSummary,
	PaymentSummaryRequest,
	PaymentSummaryResponse,
} from "../types/paymentSummary";

export class PaymentSummaryUseCases {
	constructor(private readonly paymentSummaryService: PaymentSummaryService) {}

	async calculatePaymentSummary(
		request: PaymentSummaryRequest,
	): Promise<PaymentSummaryResponse> {
		try {
			this.validateDateRange(request.dateRange);
			const documents = await this.getDocuments(request.dateRange);
			const summary = this.calculateSummary(documents);

			return {
				summary,
				dateRange: request.dateRange,
				totalDocuments: documents.length,
			};
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "지급 요약 계산 중 오류가 발생했습니다.";
			throw new Error(message);
		}
	}

	async checkCollectionExists(yearMonth: string): Promise<boolean> {
		try {
			return await this.paymentSummaryService.checkCollectionExists(yearMonth);
		} catch (error) {
			return false;
		}
	}

	async getAvailableYearMonths(): Promise<string[]> {
		return await this.paymentSummaryService.getAvailableYearMonths();
	}

	private validateDateRange(dateRange: string): void {
		const monthPattern = /^\d{4}-\d{2}$/;
		const dateRangePattern = /^\d{4}-\d{2}-\d{2} ~ \d{4}-\d{2}-\d{2}$/;

		if (!monthPattern.test(dateRange) && !dateRangePattern.test(dateRange)) {
			throw new Error(
				"날짜 형식이 올바르지 않습니다. (yyyy-mm 또는 yyyy-mm-dd ~ yyyy-mm-dd)",
			);
		}

		if (dateRangePattern.test(dateRange)) {
			const [startDateStr, endDateStr] = dateRange.split(" ~ ");
			const startDate = new Date(startDateStr);
			const endDate = new Date(endDateStr);

			if (startDate > endDate) {
				throw new Error("시작 날짜는 종료 날짜보다 이전이어야 합니다.");
			}
		}
	}

	private async getDocuments(dateRange: string): Promise<PaymentDocument[]> {
		const monthPattern = /^\d{4}-\d{2}$/;

		if (monthPattern.test(dateRange)) {
			return await this.paymentSummaryService.getDocumentsByMonth(dateRange);
		}

		const [startDate, endDate] = dateRange.split(" ~ ");
		return await this.paymentSummaryService.getDocumentsByDateRange(
			startDate,
			endDate,
		);
	}

	private calculateSummary(documents: PaymentDocument[]): PaymentSummary {
		const VAT_RATE = 0.1;

		const totalClaimAmountSupply = Math.round(
			documents.reduce((sum, doc) => sum + (doc.columnIAmount || 0), 0),
		);

		const totalPaymentAmountSupply = Math.round(
			documents.reduce((sum, doc) => sum + (doc.columnOAmount || 0), 0),
		);

		const totalClaimAmountIncluding = Math.round(
			totalClaimAmountSupply * (1 + VAT_RATE),
		);

		const totalPaymentAmount = Math.round(
			totalPaymentAmountSupply * (1 + VAT_RATE),
		);

		return {
			totalClaimAmountIncluding,
			totalClaimAmountSupply,
			totalPaymentAmount,
			totalPaymentAmountSupply,
		};
	}
}
