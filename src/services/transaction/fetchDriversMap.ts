import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { DriversMap } from "../../types/transaction";

export async function fetchDriversMap(): Promise<DriversMap> {
	const snapshot = await getDocs(collection(db, "drivers"));
	const map: DriversMap = {};
	for (const doc of snapshot.docs) {
		const data = doc.data();
		if (data.vehicleNumber) {
			map[data.vehicleNumber] = data.group || null;
		}
	}
	return map;
}
