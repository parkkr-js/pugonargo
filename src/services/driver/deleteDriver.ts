import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export async function deleteDriver(id: string) {
	await deleteDoc(doc(db, "drivers", id));
}
