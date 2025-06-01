// src/features/paymentSummary/usecases/paymentSummaryUseCases.ts
import { PaymentSummaryService } from "../services/paymentSummaryService";
import type {
	PaymentDocument,
	PaymentSummary,
	PaymentSummaryRequest,
	PaymentSummaryResponse,
} from "../types/paymentSummary";

export class PaymentSummaryUseCases {
	private readonly paymentSummaryService: PaymentSummaryService;

	constructor() {
		// UseCase에서 Service 인스턴스를 직접 생성하여 단방향 흐름 보장
		this.paymentSummaryService = new PaymentSummaryService();
	}

	/**
	 * 지급 요약 계산 메인 메서드
	 * yyyy-mm 또는 yyyy-mm-dd ~ yyyy-mm-dd 형식 모두 지원
	 */
	async calculatePaymentSummary(
		request: PaymentSummaryRequest,
	): Promise<PaymentSummaryResponse> {
		try {
			// 1. 날짜 형식 검증
			this.validateDateRange(request.dateRange);

			// 2. 요청된 날짜 형식에 따라 적절한 데이터 조회
			const documents = await this.getDocuments(request.dateRange);

			// 3. 조회된 문서들로부터 요약 통계 계산
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

	/**
	 * 컬렉션 존재 여부 확인
	 */
	async checkCollectionExists(yearMonth: string): Promise<boolean> {
		try {
			return await this.paymentSummaryService.checkCollectionExists(yearMonth);
		} catch (error) {
			return false;
		}
	}

	/**
	 * 사용 가능한 연월 목록 조회
	 */
	async getAvailableYearMonths(): Promise<string[]> {
		return await this.paymentSummaryService.getAvailableYearMonths();
	}

	/**
	 * 날짜 범위 형식 검증
	 * yyyy-mm 또는 yyyy-mm-dd ~ yyyy-mm-dd 형식만 허용
	 */
	private validateDateRange(dateRange: string): void {
		const monthPattern = /^\d{4}-\d{2}$/; // yyyy-mm 형식
		const dateRangePattern = /^\d{4}-\d{2}-\d{2} ~ \d{4}-\d{2}-\d{2}$/; // yyyy-mm-dd ~ yyyy-mm-dd 형식

		// 두 형식 중 하나도 맞지 않으면 에러
		if (!monthPattern.test(dateRange) && !dateRangePattern.test(dateRange)) {
			throw new Error(
				"날짜 형식이 올바르지 않습니다. (yyyy-mm 또는 yyyy-mm-dd ~ yyyy-mm-dd)",
			);
		}

		// 날짜 범위 형식인 경우 시작일과 종료일의 논리적 유효성 검사
		if (dateRangePattern.test(dateRange)) {
			const [startDateStr, endDateStr] = dateRange.split(" ~ ");
			const startDate = new Date(startDateStr);
			const endDate = new Date(endDateStr);

			if (startDate > endDate) {
				throw new Error("시작 날짜는 종료 날짜보다 이전이어야 합니다.");
			}
		}
	}

	/**
	 * 날짜 형식에 따라 적절한 서비스 메서드 호출
	 * - yyyy-mm: 월별 조회 (이월 데이터 포함)
	 * - yyyy-mm-dd ~ yyyy-mm-dd: 날짜 범위 조회
	 */
	private async getDocuments(dateRange: string): Promise<PaymentDocument[]> {
		const monthPattern = /^\d{4}-\d{2}$/;

		// 월별 조회 (yyyy-mm 형식)
		if (monthPattern.test(dateRange)) {
			return await this.paymentSummaryService.getDocumentsByMonth(dateRange);
		}

		// 날짜 범위 조회 (yyyy-mm-dd ~ yyyy-mm-dd 형식)
		const [startDate, endDate] = dateRange.split(" ~ ");
		return await this.paymentSummaryService.getDocumentsByDateRange(
			startDate,
			endDate,
		);
	}

	/**
	 * 문서들로부터 지급 요약 통계 계산
	 * - 총 청구금액(공급가): columnIAmount 합계
	 * - 총 지급금액(공급가): columnOAmount 합계
	 * - 부가세 포함 금액: 공급가 * 1.1 (VAT 10%)
	 *
	 * 계산 방식은 기존과 동일하며, year/month/day 필드로 변경된 데이터 구조에 맞춰 동작
	 */
	private calculateSummary(documents: PaymentDocument[]): PaymentSummary {
		const VAT_RATE = 0.1; // 부가세율 10%

		// 총 청구금액(공급가) = I열 금액들의 합계
		const totalClaimAmountSupply = Math.round(
			documents.reduce((sum, doc) => sum + (doc.columnIAmount || 0), 0),
		);

		// 총 지급금액(공급가) = O열 금액들의 합계
		const totalPaymentAmountSupply = Math.round(
			documents.reduce((sum, doc) => sum + (doc.columnOAmount || 0), 0),
		);

		// 총 청구금액(부가세 포함) = 공급가 * (1 + VAT율)
		const totalClaimAmountIncluding = Math.round(
			totalClaimAmountSupply * (1 + VAT_RATE),
		);

		// 총 지급금액(부가세 포함) = 공급가 * (1 + VAT율)
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
