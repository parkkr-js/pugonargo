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
import type { Repair } from "../types/repair.interface";

export class RepairService {
	private readonly collectionName = "repair";

	// Firebase에서 데이터 조회 (순수한 데이터 접근만)
	async getRepairRecords(
		vehicleNumber: string,
		year: string,
		month: string,
		day: string,
	): Promise<Repair[]> {
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
					id: doc.id, // Firebase 자동 생성 ID 사용
					...doc.data(),
				}) as Repair,
		);
	}

	// Firebase 자동 ID로 문서 생성
	async createRepairRecord(repairData: Omit<Repair, "id">): Promise<string> {
		const docRef = await addDoc(
			collection(db, this.collectionName),
			repairData,
		);
		return docRef.id; // Firebase가 자동 생성한 고유 ID 반환
	}

	// Firebase에서 특정 날짜의 모든 수리 내역 삭제
	async deleteRepairRecordsByDate(
		vehicleNumber: string,
		year: string,
		month: string,
		day: string,
	): Promise<void> {
		const records = await this.getRepairRecords(
			vehicleNumber,
			year,
			month,
			day,
		);

		const deletePromises = records.map((record) =>
			deleteDoc(doc(db, this.collectionName, record.id)),
		);

		await Promise.all(deletePromises);
	}
}
