// src/features/fuel/usecases/fuelUsecase.ts
import { FuelService } from "../services/fuelService";
import type { Fuel } from "../types/fuel.interface";

export interface CreateFuelRecordParams {
	vehicleNumber: string;
	date: string; // 'yyyy-mm-dd' 형식
	fuelPrice: number;
	fuelAmount: number;
}

export interface GetFuelRecordsParams {
	vehicleNumber: string;
	date: string; // 'yyyy-mm-dd' 형식
}

export interface DeleteFuelRecordsParams {
	vehicleNumber: string;
	date: string; // 'yyyy-mm-dd' 형식
}

export class FuelUsecase {
	constructor(private fuelService: FuelService = new FuelService()) {}

	// 비즈니스 로직: 총 연료비 자동 계산
	private calculateTotalCost(fuelPrice: number, fuelAmount: number): number {
		return fuelPrice * fuelAmount;
	}

	// 비즈니스 로직: 날짜 분리
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

	// ✅ UUID 생성 로직 제거! Firebase가 알아서 처리

	// 비즈니스 로직: 데이터 유효성 검증
	private validateFuelData(params: CreateFuelRecordParams): void {
		if (!params.vehicleNumber?.trim()) {
			throw new Error("차량번호는 필수입니다.");
		}

		if (!params.date) {
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

		// 날짜가 미래가 아닌지 검증
		const selectedDate = new Date(params.date);
		const today = new Date();
		today.setHours(23, 59, 59, 999);

		if (selectedDate > today) {
			throw new Error("현재날짜 이후는 입력할 수 없습니다.");
		}
	}

	// 연료 기록 조회 (비즈니스 로직 포함)
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

	// 🎯 연료 기록 생성 (훨씬 간단해짐!)
	async createFuelRecord(params: CreateFuelRecordParams): Promise<Fuel> {
		// 1. 유효성 검증
		this.validateFuelData(params);

		// 2. 비즈니스 계산
		const totalFuelCost = this.calculateTotalCost(
			params.fuelPrice,
			params.fuelAmount,
		);

		// 3. 날짜 분리
		const { year, month, day } = this.parseDate(params.date);

		// 4. 데이터 구성
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

		// 5. 🔥 Firebase가 자동으로 ID 생성해서 저장!
		const firebaseGeneratedId =
			await this.fuelService.createFuelRecord(fuelRecord);

		return { id: firebaseGeneratedId, ...fuelRecord };
	}

	// 연료 기록 삭제 (비즈니스 로직 포함)
	async deleteFuelRecords(params: DeleteFuelRecordsParams): Promise<void> {
		if (!params.vehicleNumber?.trim()) {
			throw new Error("차량번호는 필수입니다.");
		}

		if (!params.date) {
			throw new Error("날짜는 필수입니다.");
		}

		const { year, month, day } = this.parseDate(params.date);

		// 삭제 전 기록 존재 여부 확인
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
}
