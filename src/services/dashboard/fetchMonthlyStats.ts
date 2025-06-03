import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export async function fetchMonthlyStats(monthId: string) {
	const ref = doc(db, "monthlyStats", monthId);
	const snap = await getDoc(ref);
	if (!snap.exists()) return null;
	return snap.data();
}
