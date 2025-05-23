// src/features/drivers/domain/interfaces/DriverRepository.ts
import type {
	CreateDriverRequest,
	CreateDriverResponse,
	Driver,
	UpdateDriverRequest,
} from "../entities/Driver";

export interface DriverRepository {
	getAllDrivers(): Promise<Driver[]>;
	createDriver(data: CreateDriverRequest): Promise<CreateDriverResponse>;
	updateDriver(data: UpdateDriverRequest): Promise<Driver>;
	deleteDriver(driverId: string): Promise<void>;
	checkVehicleNumberExists(vehicleNumber: string): Promise<boolean>;
}
