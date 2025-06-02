import { RepairService } from "../services/repairService";
import type {
	CreateRepairRecordParams,
	DeleteRepairRecordParams,
	GetRepairRecordParams,
	GetRepairRecordsParams,
	Repair,
	RepairWithGroup,
	UpdateRepairRecordParams,
} from "../types/repair.interface";

export class RepairUsecase {
	constructor(private repairService: RepairService = new RepairService()) {}

	// 비즈니스 로직: 날짜 분리
	private parseDate(dateString: string): {
		year: string;
		month: string;
		day: string;
	} {
		console.log("parseDate input:", dateString);
		const date = new Date(dateString);
		console.log("parseDate date object:", date);
		const result = {
			year: date.getFullYear().toString(),
			month: String(date.getMonth() + 1).padStart(2, "0"),
			day: String(date.getDate()).padStart(2, "0"),
		};
		console.log("parseDate result:", result);
		return result;
	}

	// 비즈니스 로직: 데이터 유효성 검증
	private validateRepairData(params: CreateRepairRecordParams): void {
		if (!params.vehicleNumber?.trim()) {
			throw new Error("차량번호는 필수입니다.");
		}

		if (!params.date) {
			throw new Error("날짜는 필수입니다.");
		}

		if (params.repairCost < 0) {
			throw new Error("정비비용은 0 이상이어야 합니다.");
		}

		if (!params.repairDescription?.trim()) {
			throw new Error("정비내용은 필수입니다.");
		}

		// 날짜가 미래가 아닌지 검증
		const selectedDate = new Date(params.date);
		const today = new Date();
		today.setHours(23, 59, 59, 999);

		if (selectedDate > today) {
			throw new Error("현재날짜 이후는 입력할 수 없습니다.");
		}
	}

	// 수리 내역 조회 (비즈니스 로직 포함)
	async getRepairRecords(params: GetRepairRecordsParams): Promise<Repair[]> {
		console.log("Usecase getRepairRecords params:", params);

		if (!params.vehicleNumber?.trim()) {
			throw new Error("차량번호는 필수입니다.");
		}

		if (!params.date) {
			throw new Error("날짜는 필수입니다.");
		}

		const { year, month, day } = this.parseDate(params.date);
		console.log("Parsed date:", { year, month, day });

		const records = await this.repairService.getRepairRecords(
			params.vehicleNumber,
			year,
			month,
			day,
		);

		console.log("Usecase getRepairRecords result:", records);
		return records;
	}

	// 개별 수리 내역 조회
	async getRepairRecord(params: GetRepairRecordParams): Promise<Repair> {
		if (!params.recordId) {
			throw new Error("기록 ID는 필수입니다.");
		}

		const record = await this.repairService.getRepairRecord(params.recordId);
		if (!record) {
			throw new Error("해당 수리 내역을 찾을 수 없습니다.");
		}

		return record;
	}

	// 수리 내역 생성
	async createRepairRecord(params: CreateRepairRecordParams): Promise<Repair> {
		// 1. 유효성 검증
		this.validateRepairData(params);

		// 2. 날짜 분리
		const { year, month, day } = this.parseDate(params.date);

		// 3. 데이터 구성
		const now = new Date().toISOString();
		const repairRecord: Omit<Repair, "id"> = {
			vehicleNumber: params.vehicleNumber.trim(),
			year,
			month,
			day,
			repairCost: params.repairCost,
			repairDescription: params.repairDescription.trim(),
			createdAt: now,
		};

		// 4. Firebase가 자동으로 ID 생성해서 저장!
		const firebaseGeneratedId =
			await this.repairService.createRepairRecord(repairRecord);

		return { id: firebaseGeneratedId, ...repairRecord };
	}

	// 개별 수리 내역 수정
	async updateRepairRecord(params: UpdateRepairRecordParams): Promise<Repair> {
		if (!params.recordId) {
			throw new Error("기록 ID는 필수입니다.");
		}

		if (params.repairCost < 0) {
			throw new Error("정비비용은 0 이상이어야 합니다.");
		}

		if (!params.repairDescription?.trim()) {
			throw new Error("정비내용은 필수입니다.");
		}

		const existingRecord = await this.repairService.getRepairRecord(
			params.recordId,
		);
		if (!existingRecord) {
			throw new Error("해당 수리 내역을 찾을 수 없습니다.");
		}

		const updatedRecord: Repair = {
			...existingRecord,
			repairCost: params.repairCost,
			repairDescription: params.repairDescription.trim(),
		};

		await this.repairService.updateRepairRecord(params.recordId, updatedRecord);
		return updatedRecord;
	}

	// 개별 수리 내역 삭제
	async deleteRepairRecord(params: DeleteRepairRecordParams): Promise<void> {
		if (!params.recordId) {
			throw new Error("기록 ID는 필수입니다.");
		}

		const existingRecord = await this.repairService.getRepairRecord(
			params.recordId,
		);
		if (!existingRecord) {
			throw new Error("해당 수리 내역을 찾을 수 없습니다.");
		}

		await this.repairService.deleteRepairRecord(params.recordId);
	}

	// yyyy-mm 형식의 날짜로 조회
	async getRepairRecordsByDate(date: string): Promise<RepairWithGroup[]> {
		if (!date) {
			throw new Error("날짜는 필수입니다.");
		}

		// 날짜 형식 검증 (YYYY-MM)
		const dateRegex = /^\d{4}-\d{2}$/;
		if (!dateRegex.test(date)) {
			throw new Error("날짜는 YYYY-MM 형식이어야 합니다.");
		}

		const [year, month] = date.split("-");
		console.log("Parsed date for group records:", { year, month });

		const records = await this.repairService.getRepairRecordsByDate(
			year,
			month,
		);

		console.log("Usecase getRepairRecordsByDate result:", records);
		return records;
	}
}
