// src/features/fuel/services/fuelService.ts
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	orderBy,
	query,
	where,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import type { Fuel } from "../types/fuel.interface";

export class FuelService {
	private readonly collectionName = "fuel";

	// Firebase에서 데이터 조회 (순수한 데이터 접근만)
	async getFuelRecords(
		vehicleNumber: string,
		year: string,
		month: string,
		day: string,
	): Promise<Fuel[]> {
		const q = query(
			collection(db, this.collectionName),
			where("vehicleNumber", "==", vehicleNumber),
			where("year", "==", year),
			where("month", "==", month),
			where("day", "==", day),
			orderBy("createdAt", "desc"),
		);

		const querySnapshot = await getDocs(q);
		return querySnapshot.docs.map(
			(doc) =>
				({
					id: doc.id, // 🎯 Firebase 자동 생성 ID 사용
					...doc.data(),
				}) as Fuel,
		);
	}

	// 🎯 Firebase 자동 ID로 문서 생성 (가장 간단하고 안전한 방식)
	async createFuelRecord(fuelData: Omit<Fuel, "id">): Promise<string> {
		const docRef = await addDoc(collection(db, this.collectionName), fuelData);
		return docRef.id; // Firebase가 자동 생성한 고유 ID 반환
	}

	// Firebase에서 특정 날짜의 모든 연료 기록 삭제
	async deleteFuelRecordsByDate(
		vehicleNumber: string,
		year: string,
		month: string,
		day: string,
	): Promise<void> {
		const records = await this.getFuelRecords(vehicleNumber, year, month, day);

		const deletePromises = records.map((record) =>
			deleteDoc(doc(db, this.collectionName, record.id)),
		);

		await Promise.all(deletePromises);
	}
}
