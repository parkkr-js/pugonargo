import dayjs from "dayjs";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";

export async function fetchRepairByMonth(year: number, month: number) {
	const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).format(
		"YYYY-MM-DD",
	);
	const end = dayjs(start).endOf("month").format("YYYY-MM-DD");
	const q = query(
		collection(db, "repair"),
		where("date", ">=", start),
		where("date", "<=", end),
	);
	const snap = await getDocs(q);
	return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
