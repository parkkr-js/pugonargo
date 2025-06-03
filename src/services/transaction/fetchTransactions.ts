import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";

export async function fetchTransactions(startDate: string, endDate: string) {
	const q = query(
		collection(db, "rawData"),
		where("date", ">=", startDate),
		where("date", "<=", endDate),
	);
	const snapshot = await getDocs(q);
	return snapshot.docs.map((doc) => doc.data());
}
