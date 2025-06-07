import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { VehicleFuelRepairRow } from "../../types/transaction";

export const fetchVehicleFuelRepair = async (
	vehicleNumber: string,
): Promise<VehicleFuelRepairRow[]> => {
	const fuelRef = collection(db, "fuel");
	const repairRef = collection(db, "repair");

	const [fuelSnapshot, repairSnapshot] = await Promise.all([
		getDocs(query(fuelRef, where("vehicleNumber", "==", vehicleNumber))),
		getDocs(query(repairRef, where("vehicleNumber", "==", vehicleNumber))),
	]);

	const fuelRows = fuelSnapshot.docs.map((doc) => ({
		id: doc.id,
		type: "fuel" as const,
		date: doc.data().date,
		unitPrice: doc.data().unitPrice,
		totalFuelCost: doc.data().totalFuelCost,
		liter: doc.data().liter,
	}));

	const repairRows = repairSnapshot.docs.map((doc) => ({
		id: doc.id,
		type: "repair" as const,
		date: doc.data().date,
		repairCost: doc.data().repairCost,
		memo: doc.data().memo,
	}));

	return [...fuelRows, ...repairRows].sort((a, b) =>
		a.date.localeCompare(b.date),
	);
};
