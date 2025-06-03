import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export async function fetchDriversMap() {
	const snapshot = await getDocs(collection(db, "drivers"));
	const map: Record<string, { group: string; name: string }> = {};
	for (const doc of snapshot.docs) {
		const data = doc.data();
		if (data.vehicleNumber) {
			map[data.vehicleNumber] = {
				group: data.group || "-",
				name: data.name || "-",
			};
		}
	}
	return map;
}
