import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Transaction } from "../../types/transaction";

export async function fetchTransactions(
	startDate: string,
	endDate: string,
): Promise<Transaction[]> {
	const q = query(
		collection(db, "rawData"),
		where("date", ">=", startDate),
		where("date", "<=", endDate),
	);
	const snapshot = await getDocs(q);
	return snapshot.docs.map((doc) => {
		const data = doc.data();
		return {
			id: doc.id,
			date: data.date,
			vehicleNumber: data.d,
			route: data.e,
			supplier: data.l,
			weight: data.m,
			unitPrice: data.n,
			amount: data.o,
			note: data.p,
			i: data.i,
		};
	});
}
