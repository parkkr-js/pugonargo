export type RepairAndFuelRow = {
	key: string;
	date: string;
	group: string;
	vehicleNumber: string;
	descriptionOrFuelPrice: string;
	totalCost: number;
	type: "repair" | "fuel";
};

export interface FilteredData {
	filteredRows: RepairAndFuelRow[];
	totalRepairCost: number;
	totalFuelCost: number;
	totalCost: number;
}
