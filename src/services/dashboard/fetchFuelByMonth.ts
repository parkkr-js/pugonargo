import dayjs from "dayjs";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { FuelRecord } from "../../pages/driver/components/FuelRecordCard";

export async function fetchFuelByMonth(
	year: number,
	month: number,
): Promise<FuelRecord[]> {
	const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).format(
		"YYYY-MM-DD",
	);
	const end = dayjs(start).endOf("month").format("YYYY-MM-DD");
	const q = query(
		collection(db, "fuel"),
		where("date", ">=", start),
		where("date", "<=", end),
		orderBy("date", "asc"),
	);
	const snap = await getDocs(q);
	return snap.docs.map((doc) => ({
		id: doc.id,
		date: doc.data().date,
		vehicleNumber: doc.data().vehicleNumber,
		detail: doc.data().detail,
		cost: doc.data().cost,
		unitPrice: doc.data().unitPrice,
		fuelAmount: doc.data().fuelAmount,
		totalFuelCost: doc.data().totalFuelCost,
	}));
}
