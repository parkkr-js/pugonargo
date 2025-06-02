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
import type { Fuel, FuelWithGroup } from "../types/fuel.interface";

export class FuelService {
	private readonly collectionName = "fuel";

	// 날짜별 조회
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
					id: doc.id,
					...doc.data(),
				}) as Fuel,
		);
	}

	// 문서 생성
	async createFuelRecord(fuelData: Omit<Fuel, "id">): Promise<string> {
		const docRef = await addDoc(collection(db, this.collectionName), fuelData);
		return docRef.id;
	}

	// 개별 문서 조회
	async getFuelRecordById(recordId: string): Promise<Fuel | null> {
		try {
			const docRef = doc(db, this.collectionName, recordId);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				return {
					id: docSnap.id,
					...docSnap.data(),
				} as Fuel;
			}
			return null;
		} catch (error) {
			console.error("Failed to get fuel record by ID:", error);
			throw new Error("주유 기록을 찾을 수 없습니다.");
		}
	}

	// 개별 문서 수정
	async updateFuelRecord(
		recordId: string,
		updateData: Partial<Omit<Fuel, "id" | "createdAt">>,
	): Promise<void> {
		try {
			const docRef = doc(db, this.collectionName, recordId);
			const updatedData = {
				...updateData,
				updatedAt: new Date().toISOString(),
			};

			await updateDoc(docRef, updatedData);
		} catch (error) {
			console.error("Failed to update fuel record:", error);
			throw new Error("주유 기록 수정에 실패했습니다.");
		}
	}

	// 개별 문서 삭제
	async deleteFuelRecord(recordId: string): Promise<void> {
		try {
			const docRef = doc(db, this.collectionName, recordId);
			await deleteDoc(docRef);
		} catch (error) {
			console.error("Failed to delete fuel record:", error);
			throw new Error("주유 기록 삭제에 실패했습니다.");
		}
	}

	// yyyy-mm 형식의 날짜로 조회
	async getFuelRecordsByDate(
		year: string,
		month: string,
	): Promise<FuelWithGroup[]> {
		const q = query(
			collection(db, this.collectionName),
			where("year", "==", year),
			where("month", "==", month),
			orderBy("createdAt", "desc"),
		);

		const querySnapshot = await getDocs(q);
		const fuels = querySnapshot.docs.map(
			(doc) =>
				({
					id: doc.id,
					...doc.data(),
				}) as Fuel,
		);

		//2. 각 주유 내역에 대한 운전자 그룹 정보 조회
		const fuelsWithGroup = await Promise.all(
			fuels.map(async (fuel) => {
				const driverQuery = query(
					collection(db, "drivers"),
					where("vehicleNumber", "==", fuel.vehicleNumber),
				);
				const driverSnapshot = await getDocs(driverQuery);
				const group = driverSnapshot.docs[0]?.data().group || "unknown";

				return {
					...fuel,
					group,
				} as FuelWithGroup;
			}),
		);

		return fuelsWithGroup;
	}
}
