import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export async function fetchMonthList() {
	const snap = await getDocs(collection(db, "monthlyStats"));
	return snap.docs.map((doc) => doc.id).sort();
}
