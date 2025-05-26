import type {
	CreateDriverRequest,
	CreateDriverResponse,
	Driver,
	UpdateDriverRequest,
} from "../../domain/entities/Driver";
import { DriverError, DriverErrorCodes } from "../../domain/errors/DriverError";
import type { DriverRepository } from "../../domain/interfaces/DriverRepository";

export class DriverUseCases {
	constructor(private readonly driverRepository: DriverRepository) {}

	async validateCreateDriverData(data: CreateDriverRequest): Promise<void> {
		if (!data.vehicleNumber.trim()) {
			throw new DriverError(
				"차량번호는 필수입니다.",
				DriverErrorCodes.INVALID_VEHICLE_NUMBER,
			);
		}
		if (!/^\d{4}$/.test(data.vehicleNumber)) {
			throw new DriverError(
				"차량번호는 4자리 숫자여야 합니다.",
				DriverErrorCodes.INVALID_VEHICLE_NUMBER,
			);
		}
		if (!data.group.trim() || !/^#\d{1,2}$/.test(data.group)) {
			throw new DriverError(
				"그룹은 #1~#10 형식이어야 합니다.",
				DriverErrorCodes.INVALID_GROUP,
			);
		}
		if (data.dumpWeight <= 0) {
			throw new DriverError(
				"덤프중량은 양수여야 합니다.",
				DriverErrorCodes.INVALID_DUMP_WEIGHT,
			);
		}

		const isDuplicate = await this.driverRepository.checkVehicleNumberExists(
			data.vehicleNumber,
		);
		if (isDuplicate) {
			throw new DriverError(
				`이미 등록된 차량번호(${data.vehicleNumber})입니다.`,
				DriverErrorCodes.DUPLICATE_VEHICLE_NUMBER,
				{ vehicleNumber: data.vehicleNumber },
			);
		}
	}

	async validateUpdateDriverData(data: UpdateDriverRequest): Promise<void> {
		if (!data.id) {
			throw new DriverError(
				"수정할 기사의 ID가 필요합니다.",
				DriverErrorCodes.NOT_FOUND,
			);
		}

		if (
			data.vehicleNumber === undefined &&
			data.group === undefined &&
			data.dumpWeight === undefined
		) {
			throw new DriverError(
				"수정할 정보가 없습니다.",
				DriverErrorCodes.INVALID_VEHICLE_NUMBER,
			);
		}

		if (data.vehicleNumber !== undefined) {
			if (!data.vehicleNumber.trim()) {
				throw new DriverError(
					"차량번호는 비워둘 수 없습니다.",
					DriverErrorCodes.INVALID_VEHICLE_NUMBER,
				);
			}
			if (!/^\d{4}$/.test(data.vehicleNumber)) {
				throw new DriverError(
					"수정할 차량번호는 4자리 숫자여야 합니다.",
					DriverErrorCodes.INVALID_VEHICLE_NUMBER,
				);
			}

			const drivers = await this.driverRepository.getAllDrivers();
			const currentDriver = drivers.find((driver) => driver.id === data.id);

			if (currentDriver && currentDriver.vehicleNumber !== data.vehicleNumber) {
				const isDuplicate =
					await this.driverRepository.checkVehicleNumberExists(
						data.vehicleNumber,
					);
				if (isDuplicate) {
					throw new DriverError(
						`이미 등록된 차량번호(${data.vehicleNumber})입니다.`,
						DriverErrorCodes.DUPLICATE_VEHICLE_NUMBER,
						{ vehicleNumber: data.vehicleNumber },
					);
				}
			}
		}

		if (data.group !== undefined) {
			if (!data.group.trim() || !/^#\d{1,2}$/.test(data.group)) {
				throw new DriverError(
					"수정할 그룹은 #1~#10 형식이어야 합니다.",
					DriverErrorCodes.INVALID_GROUP,
				);
			}
		}

		if (data.dumpWeight !== undefined && data.dumpWeight <= 0) {
			throw new DriverError(
				"수정할 덤프중량은 양수여야 합니다.",
				DriverErrorCodes.INVALID_DUMP_WEIGHT,
			);
		}
	}

	async getAllDrivers(): Promise<Driver[]> {
		return this.driverRepository.getAllDrivers();
	}

	async createDriver(data: CreateDriverRequest): Promise<CreateDriverResponse> {
		await this.validateCreateDriverData(data);
		return this.driverRepository.createDriver(data);
	}

	async updateDriver(data: UpdateDriverRequest): Promise<Driver> {
		await this.validateUpdateDriverData(data);
		return this.driverRepository.updateDriver(data);
	}

	async deleteDriver(driverId: string): Promise<void> {
		if (!driverId) {
			throw new DriverError(
				"삭제할 기사의 ID가 필요합니다.",
				DriverErrorCodes.NOT_FOUND,
			);
		}
		return this.driverRepository.deleteDriver(driverId);
	}
}
