import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

export interface FuelRecordInput {
	vehicleNumber: string;
	driversDbSupplier: string;
	date: string; // YYYY-MM-DD
	unitPrice: number;
	fuelAmount: number;
	totalFuelCost: number;
}

export async function createFuelRecord(data: FuelRecordInput) {
	await addDoc(collection(db, "fuel"), {
		...data,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});
}
