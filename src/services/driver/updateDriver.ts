import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Driver } from "../../types/driver";

export async function updateDriver(id: string, data: Partial<Driver>) {
	await updateDoc(doc(db, "drivers", id), {
		...data,
		updatedAt: serverTimestamp(),
	});
}
