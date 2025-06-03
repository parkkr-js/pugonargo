export interface DailyDriveRecord {
	id: string;
	m: number;
	q: number;
	o: number;
	e: string;
}

export interface FuelRecord {
	id: string;
	vehicleNumber: string;
	date: string;
	unitPrice: number;
	fuelAmount: number;
	totalFuelCost: number;
}

export interface RepairRecord {
	id: string;
	vehicleNumber: string;
	date: string;
	repairCost: number;
	memo: string;
}
