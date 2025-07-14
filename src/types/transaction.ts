export interface Transaction {
	id: string;
	date: string;
	vehicleNumber: string;
	route: string;
	supplier: string;
	weight: number;
	billingUnitPrices: number;
	payOutweights: number;
	unitPrice: number;
	payoutAmount: number;
	note: string;
}

export interface DriversMap {
	[vehicleNumber: string]: {
		driversDbSupplier: string;
		vehicleNumber: string;
	};
}

export interface TableTransaction {
	key: string;
	date: string;
	vehicleNumber: string;
	route: string;
	supplier: string;
	weight: number;
	billingUnitPrices: number;
	payOutweights: number;
	unitPrice: number;
	payoutAmount: number;
	note: string;
}

export interface Summary {
	totalWithTax: number;
	totalWithoutTax: number;
	totalPaid: number;
	totalPaidWithoutTax: number;
}

export interface BaseRow {
	date: string;
	id?: string;
}

export interface FuelRow extends BaseRow {
	type: "fuel";
	unitPrice: number;
	totalFuelCost: number;
	liter?: number;
}

export interface RepairRow extends BaseRow {
	type: "repair";
	repairCost: number;
	memo: string;
}

export type VehicleFuelRepairRow = FuelRow | RepairRow;

export interface VehicleFuelRepairSummary {
	totalCost: number;
	totalRepair: number;
	totalFuel: number;
}
