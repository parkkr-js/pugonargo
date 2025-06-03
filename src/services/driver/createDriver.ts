import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Driver } from "../../types/driver";

export async function createDriver(
	data: Omit<Driver, "id" | "createdAt" | "updatedAt">,
) {
	await addDoc(collection(db, "drivers"), {
		...data,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});
}
