import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export async function deleteRepairRecord(id: string) {
	await deleteDoc(doc(db, "repair", id));
}
