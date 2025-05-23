export interface Driver {
	id: string;
	userId: string;
	vehicleNumber: string;
	groupNumber: number;
	dumpWeight: number;
	passwordHash: string;
	createdAt: string;
	updatedAt?: string;
}

export interface CreateDriverRequest {
	vehicleNumber: string;
	groupNumber: number;
	dumpWeight: number;
}

export interface UpdateDriverRequest {
	id: string;
	groupNumber?: number;
	dumpWeight?: number;
}

export interface CreateDriverResponse {
	driver: Driver;
	password: string;
}
