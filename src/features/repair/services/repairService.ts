import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	updateDoc,
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
		console.log("Service getRepairRecords params:", {
			vehicleNumber,
			year,
			month,
			day,
		});

		const q = query(
			collection(db, this.collectionName),
			where("vehicleNumber", "==", vehicleNumber),
			where("year", "==", year),
			where("month", "==", month),
			where("day", "==", day),
			orderBy("createdAt", "desc"),
		);

		const querySnapshot = await getDocs(q);
		console.log("Service querySnapshot size:", querySnapshot.size);
		console.log(
			"Service querySnapshot docs:",
			querySnapshot.docs.map((doc) => doc.data()),
		);

		const records = querySnapshot.docs.map(
			(doc) =>
				({
					id: doc.id,
					...doc.data(),
				}) as Repair,
		);

		console.log("Service getRepairRecords result:", records);
		return records;
	}

	// 개별 수리 내역 조회
	async getRepairRecord(recordId: string): Promise<Repair | null> {
		const docRef = doc(db, this.collectionName, recordId);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			return { id: docSnap.id, ...docSnap.data() } as Repair;
		}
		return null;
	}

	// Firebase 자동 ID로 문서 생성
	async createRepairRecord(repairData: Omit<Repair, "id">): Promise<string> {
		const docRef = await addDoc(
			collection(db, this.collectionName),
			repairData,
		);
		return docRef.id; // Firebase가 자동 생성한 고유 ID 반환
	}

	// 개별 수리 내역 수정
	async updateRepairRecord(
		recordId: string,
		repairData: Repair,
	): Promise<void> {
		const docRef = doc(db, this.collectionName, recordId);
		const { id, ...updateData } = repairData;
		await updateDoc(docRef, updateData);
	}

	// 개별 수리 내역 삭제
	async deleteRepairRecord(recordId: string): Promise<void> {
		const docRef = doc(db, this.collectionName, recordId);
		await deleteDoc(docRef);
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
