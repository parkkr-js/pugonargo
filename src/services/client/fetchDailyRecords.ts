import dayjs from "dayjs";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type {
	DailyDriveRecord,
	FuelRecord,
	RepairRecord,
} from "../../types/driverRecord";

export async function fetchDailyRecords(vehicleNumber: string, date: Date) {
	const dateStr = dayjs(date).format("YYYY-MM-DD");

	const rowQ = query(
		collection(db, "rawData"),
		where("d", "==", vehicleNumber),
		where("date", "==", dateStr),
	);
	const rowSnap = await getDocs(rowQ);

	const driveRecords: DailyDriveRecord[] = rowSnap.docs.map(
		(doc) =>
			({
				id: doc.id,
				...doc.data(),
			}) as DailyDriveRecord,
	);

	// fuel
	const fuelQ = query(
		collection(db, "fuel"),
		where("vehicleNumber", "==", vehicleNumber),
		where("date", "==", dateStr),
	);
	const fuelSnap = await getDocs(fuelQ);

	const fuelRecords: FuelRecord[] = fuelSnap.docs.map(
		(doc) =>
			({
				id: doc.id,
				...doc.data(),
			}) as FuelRecord,
	);

	// repair
	const repairQ = query(
		collection(db, "repair"),
		where("vehicleNumber", "==", vehicleNumber),
		where("date", "==", dateStr),
	);
	const repairSnap = await getDocs(repairQ);

	const repairRecords: RepairRecord[] = repairSnap.docs.map(
		(doc) =>
			({
				id: doc.id,
				...doc.data(),
			}) as RepairRecord,
	);

	return {
		driveRecords,
		fuelRecords,
		repairRecords,
	};
}
