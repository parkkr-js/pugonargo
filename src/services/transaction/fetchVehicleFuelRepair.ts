import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface FuelData {
	date: string;
	unitPrice: number;
	totalFuelCost: number;
	liter?: number;
	id?: string;
}

interface RepairData {
	date: string;
	repairCost: number;
	memo: string;
	id?: string;
}

export async function fetchVehicleFuelRepair(vehicleNumber: string) {
	const fuelQ = query(
		collection(db, "fuel"),
		where("vehicleNumber", "==", vehicleNumber),
	);
	const fuelSnap = await getDocs(fuelQ);
	const fuelRows = fuelSnap.docs.map((doc) => {
		const d = doc.data() as FuelData;
		return {
			type: "fuel" as const,
			date: d.date,
			unitPrice: d.unitPrice,
			totalFuelCost: d.totalFuelCost,
			liter: d.liter,
			id: doc.id,
		};
	});

	const repairQ = query(
		collection(db, "repair"),
		where("vehicleNumber", "==", vehicleNumber),
	);
	const repairSnap = await getDocs(repairQ);
	const repairRows = repairSnap.docs.map((doc) => {
		const d = doc.data() as RepairData;
		return {
			type: "repair" as const,
			date: d.date,
			repairCost: d.repairCost,
			memo: d.memo,
			id: doc.id,
		};
	});

	return [...fuelRows, ...repairRows];
}
