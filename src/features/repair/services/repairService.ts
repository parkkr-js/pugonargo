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

interface RepairWithGroup extends Repair {
	group: string;
}

export class RepairService {
	private readonly collectionName = "repair";

	// Firebase에서 데이터 조회
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

		const records = querySnapshot.docs.map(
			(doc) =>
				({
					id: doc.id,
					...doc.data(),
				}) as Repair,
		);

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

	// yyyy-mm 형식의 날짜로 조회
	async getRepairRecordsByDate(
		year: string,
		month: string,
	): Promise<RepairWithGroup[]> {
		// 1. 수리 내역 조회
		const q = query(
			collection(db, this.collectionName),
			where("year", "==", year),
			where("month", "==", month),
			orderBy("day", "asc"),
			orderBy("createdAt", "desc"),
		);

		const querySnapshot = await getDocs(q);
		const repairs = querySnapshot.docs.map(
			(doc) =>
				({
					id: doc.id,
					...doc.data(),
				}) as Repair,
		);

		// 2. 각 수리 내역에 대한 운전자 그룹 정보 조회
		const repairsWithGroup = await Promise.all(
			repairs.map(async (repair) => {
				const driverQuery = query(
					collection(db, "drivers"),
					where("vehicleNumber", "==", repair.vehicleNumber),
				);
				const driverSnapshot = await getDocs(driverQuery);
				const group = driverSnapshot.docs[0]?.data().group || "unknown";

				return {
					...repair,
					group,
				} as RepairWithGroup;
			}),
		);

		return repairsWithGroup;
	}
}
