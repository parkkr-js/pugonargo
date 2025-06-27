import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { DriversMap } from "../../types/transaction";

export async function fetchDriversMap(): Promise<DriversMap> {
	const snapshot = await getDocs(collection(db, "drivers"));
	const map: DriversMap = {};
	for (const doc of snapshot.docs) {
		const data = doc.data();
		if (data.vehicleNumber && data.driversDbSupplier) {
			map[data.vehicleNumber] = {
				driversDbSupplier: data.driversDbSupplier,
				vehicleNumber: data.vehicleNumber,
			};
		}
	}
	return map;
}
