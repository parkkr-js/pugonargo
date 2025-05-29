import { FuelService } from "../services/fuelService";
import type { Fuel } from "../types/fuel.interface";

export interface CreateFuelRecordParams {
	vehicleNumber: string;
	date: string;
	fuelPrice: number;
	fuelAmount: number;
}

export interface GetFuelRecordsParams {
	vehicleNumber: string;
	date: string;
}

export interface DeleteFuelRecordsParams {
	vehicleNumber: string;
	date: string;
}

// ✅ 새로 추가: 개별 관리용 인터페이스들
export interface UpdateFuelRecordParams {
	recordId: string;
	fuelPrice: number;
	fuelAmount: number;
}

export interface DeleteFuelRecordParams {
	recordId: string;
}

export interface GetFuelRecordParams {
	recordId: string;
}

export class FuelUsecase {
	constructor(private fuelService: FuelService = new FuelService()) {}

	// 기존 메서드들 유지
	private calculateTotalCost(fuelPrice: number, fuelAmount: number): number {
		return fuelPrice * fuelAmount;
	}

	private parseDate(dateString: string): {
		year: string;
		month: string;
		day: string;
	} {
		const date = new Date(dateString);
		return {
			year: date.getFullYear().toString(),
			month: String(date.getMonth() + 1).padStart(2, "0"),
			day: String(date.getDate()).padStart(2, "0"),
		};
	}

	private validateFuelData(
		params: CreateFuelRecordParams | UpdateFuelRecordParams,
	): void {
		if ("vehicleNumber" in params && !params.vehicleNumber?.trim()) {
			throw new Error("차량번호는 필수입니다.");
		}

		if ("date" in params && !params.date) {
			throw new Error("날짜는 필수입니다.");
		}

		if (params.fuelPrice < 0) {
			throw new Error("연료 단가는 0 이상이어야 합니다.");
		}

		if (params.fuelAmount < 0) {
			throw new Error("주유량은 0 이상이어야 합니다.");
		}

		if (params.fuelPrice === 0 && params.fuelAmount === 0) {
			throw new Error("단가와 주유량 중 적어도 하나는 0보다 커야 합니다.");
		}

		// 날짜 검증 (생성시에만)
		if ("date" in params) {
			const selectedDate = new Date(params.date);
			const today = new Date();
			today.setHours(23, 59, 59, 999);

			if (selectedDate > today) {
				throw new Error("현재날짜 이후는 입력할 수 없습니다.");
			}
		}
	}

	// 기존 메서드들 유지
	async getFuelRecords(params: GetFuelRecordsParams): Promise<Fuel[]> {
		if (!params.vehicleNumber?.trim()) {
			throw new Error("차량번호는 필수입니다.");
		}

		if (!params.date) {
			throw new Error("날짜는 필수입니다.");
		}

		const { year, month, day } = this.parseDate(params.date);
		const records = await this.fuelService.getFuelRecords(
			params.vehicleNumber,
			year,
			month,
			day,
		);

		return records;
	}

	async createFuelRecord(params: CreateFuelRecordParams): Promise<Fuel> {
		this.validateFuelData(params);

		const totalFuelCost = this.calculateTotalCost(
			params.fuelPrice,
			params.fuelAmount,
		);

		const { year, month, day } = this.parseDate(params.date);

		const now = new Date().toISOString();
		const fuelRecord: Omit<Fuel, "id"> = {
			vehicleNumber: params.vehicleNumber.trim(),
			year,
			month,
			day,
			fuelPrice: params.fuelPrice,
			fuelAmount: params.fuelAmount,
			totalFuelCost,
			createdAt: now,
		};

		const firebaseGeneratedId =
			await this.fuelService.createFuelRecord(fuelRecord);

		return { id: firebaseGeneratedId, ...fuelRecord };
	}

	async deleteFuelRecords(params: DeleteFuelRecordsParams): Promise<void> {
		if (!params.vehicleNumber?.trim()) {
			throw new Error("차량번호는 필수입니다.");
		}

		if (!params.date) {
			throw new Error("날짜는 필수입니다.");
		}

		const { year, month, day } = this.parseDate(params.date);

		const existingRecords = await this.fuelService.getFuelRecords(
			params.vehicleNumber,
			year,
			month,
			day,
		);

		if (existingRecords.length === 0) {
			throw new Error("삭제할 연료 기록이 없습니다.");
		}

		await this.fuelService.deleteFuelRecordsByDate(
			params.vehicleNumber,
			year,
			month,
			day,
		);
	}

	// ✅ 새로 추가: 개별 조회
	async getFuelRecord(params: GetFuelRecordParams): Promise<Fuel> {
		if (!params.recordId?.trim()) {
			throw new Error("기록 ID는 필수입니다.");
		}

		const record = await this.fuelService.getFuelRecordById(params.recordId);

		if (!record) {
			throw new Error("주유 기록을 찾을 수 없습니다.");
		}

		return record;
	}

	// ✅ 새로 추가: 개별 수정
	async updateFuelRecord(params: UpdateFuelRecordParams): Promise<Fuel> {
		if (!params.recordId?.trim()) {
			throw new Error("기록 ID는 필수입니다.");
		}

		this.validateFuelData(params);

		// 기존 기록 조회
		const existingRecord = await this.fuelService.getFuelRecordById(
			params.recordId,
		);
		if (!existingRecord) {
			throw new Error("수정할 주유 기록을 찾을 수 없습니다.");
		}

		// 새로운 총액 계산
		const totalFuelCost = this.calculateTotalCost(
			params.fuelPrice,
			params.fuelAmount,
		);

		// 업데이트할 데이터
		const updateData = {
			fuelPrice: params.fuelPrice,
			fuelAmount: params.fuelAmount,
			totalFuelCost,
		};

		// Firebase에서 수정
		await this.fuelService.updateFuelRecord(params.recordId, updateData);

		// 수정된 데이터 반환
		return {
			...existingRecord,
			...updateData,
			updatedAt: new Date().toISOString(),
		};
	}

	// ✅ 새로 추가: 개별 삭제
	async deleteFuelRecord(params: DeleteFuelRecordParams): Promise<void> {
		if (!params.recordId?.trim()) {
			throw new Error("기록 ID는 필수입니다.");
		}

		// 기록 존재 여부 확인
		const existingRecord = await this.fuelService.getFuelRecordById(
			params.recordId,
		);
		if (!existingRecord) {
			throw new Error("삭제할 주유 기록을 찾을 수 없습니다.");
		}

		await this.fuelService.deleteFuelRecord(params.recordId);
	}
}
