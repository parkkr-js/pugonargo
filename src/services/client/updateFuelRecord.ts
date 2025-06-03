import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { FuelRecordInput } from "./createFuelRecord";

export async function updateFuelRecord(
	id: string,
	data: Partial<FuelRecordInput>,
) {
	await updateDoc(doc(db, "fuel", id), {
		...data,
		updatedAt: serverTimestamp(),
	});
}
