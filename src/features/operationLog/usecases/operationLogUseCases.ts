import type { OperationLogService } from "../services/operationLogService";
import type {
	OperationLogCalculated,
	OperationLogDocument,
	OperationLogRequest,
} from "../types/operationLog.types";

export class OperationLogUseCases {
	constructor(private readonly operationLogService: OperationLogService) {}

	async getCalculatedOperationLogs(
		request: OperationLogRequest,
	): Promise<OperationLogCalculated[]> {
		try {
			this.validateRequest(request);

			const documents = await this.operationLogService.getOperationLogs(
				request.date,
				request.vehicleNumber,
			);

			return documents.map(this.calculateOperationData);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "운행내역 조회 중 오류가 발생했습니다.";
			throw new Error(message);
		}
	}

	private validateRequest(request: OperationLogRequest): void {
		const datePattern = /^\d{4}-\d{2}-\d{2}$/;

		if (!datePattern.test(request.date)) {
			throw new Error("날짜 형식이 올바르지 않습니다. (yyyy-mm-dd)");
		}

		if (!request.vehicleNumber.trim()) {
			throw new Error("차량번호를 입력해주세요.");
		}
	}

	private calculateOperationData(
		document: OperationLogDocument,
	): OperationLogCalculated {
		const totalAmount = Math.round(
			document.columnQAmount * document.chargeableWeight,
		);
		const commissionFee = Math.round(totalAmount * 0.05);

		return {
			id: document.id,
			transportRoute: document.transportRoute,
			chargeableWeight: document.chargeableWeight,
			totalAmount,
			commissionFee,
			finalAmount: document.columnOAmount,
		};
	}
}
