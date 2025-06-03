import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Driver } from "../../types/driver";

export async function getDrivers(): Promise<Driver[]> {
	const q = query(collection(db, "drivers"), orderBy("createdAt", "desc"));
	const snapshot = await getDocs(q);
	return snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
		createdAt: doc.data().createdAt.toDate(),
		updatedAt: doc.data().updatedAt.toDate(),
	})) as Driver[];
}
