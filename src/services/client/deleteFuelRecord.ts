import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export async function deleteFuelRecord(id: string) {
	await deleteDoc(doc(db, "fuel", id));
}
