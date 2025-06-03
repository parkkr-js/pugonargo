import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

export interface RepairRecordInput {
	vehicleNumber: string;
	date: string; // YYYY-MM-DD
	repairCost: number;
	memo: string;
}

export async function createRepairRecord(data: RepairRecordInput) {
	await addDoc(collection(db, "repair"), {
		...data,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});
}
