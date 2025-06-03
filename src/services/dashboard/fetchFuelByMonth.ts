import dayjs from "dayjs";
import { collection, getDocs, query, where } from "firebase/firestore";
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
	);
	const snap = await getDocs(q);
	return snap.docs.map((doc) => ({
		...(doc.data() as FuelRecord),
		id: doc.id,
	}));
}
