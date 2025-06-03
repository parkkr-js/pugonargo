import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { RepairRecordInput } from "./createRepairRecord";

export async function updateRepairRecord(
	id: string,
	data: Partial<RepairRecordInput>,
) {
	await updateDoc(doc(db, "repair", id), {
		...data,
		updatedAt: serverTimestamp(),
	});
}
