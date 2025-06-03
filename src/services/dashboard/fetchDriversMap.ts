import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export async function fetchDriversMap() {
	const snap = await getDocs(collection(db, "drivers"));
	const map: Record<string, string> = {};
	for (const doc of snap.docs) {
		const { vehicleNumber, group } = doc.data();
		map[vehicleNumber] = group;
	}
	return map;
}
