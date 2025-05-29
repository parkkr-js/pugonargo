export interface Driver {
	id: string;
	userId: string;
	vehicleNumber: string;
	group: string;
	dumpWeight: number;
	password: string;
	createdAt: string;
	updatedAt?: string;
}

export interface CreateDriverRequest {
	vehicleNumber: string;
	group: string;
	dumpWeight: number;
	password: string;
	userId: string;
}

export interface UpdateDriverRequest {
	id: string;
	vehicleNumber?: string;
	group?: string;
	dumpWeight?: number;
}

export interface CreateDriverResponse {
	driver: Driver;
	password: string;
}
