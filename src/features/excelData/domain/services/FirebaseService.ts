import {
	addDoc,
	collection,
	deleteDoc,
	getDocs,
	getFirestore,
} from "firebase/firestore";
import type { ExcelData } from "../entities/ExcelData";

export class FirebaseService {
	private db = getFirestore();

	private async clearCollection(collectionName: string): Promise<void> {
		try {
			const collectionRef = collection(this.db, collectionName);
			const snapshot = await getDocs(collectionRef);

			const deletePromises = snapshot.docs.map((docSnapshot) => {
				return deleteDoc(docSnapshot.ref);
			});

			await Promise.all(deletePromises);
		} catch (error) {
			console.error("컬렉션 정리 실패:", error);
			throw error;
		}
	}

	async saveExcelData(
		data: ExcelData[],
		year: string,
		month: string,
	): Promise<void> {
		const collectionName = `${year}-${month}`;

		try {
			// 1. 기존 컬렉션 데이터 모두 삭제
			await this.clearCollection(collectionName);

			// 2. 새 데이터 저장

			const collectionRef = collection(this.db, collectionName);

			const savePromises = data.map((item, _) => {
				return addDoc(collectionRef, item);
			});

			await Promise.all(savePromises);
		} catch (error) {
			// 상세 에러 정보 출력
			if (error instanceof Error) {
			}

			throw error;
		}
	}
}
