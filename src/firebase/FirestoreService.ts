import type { Firestore } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

export class FirestoreService {
	private db: Firestore;

	constructor(db: Firestore) {
		this.db = db;
	}

	async listYearMonthCollections(): Promise<string[]> {
		try {
			const functions = getFunctions();
			const getYearMonthCollections = httpsCallable(
				functions,
				"getYearMonthCollections",
			);
			const result = await getYearMonthCollections();
			return result.data as string[];
		} catch (error) {
			console.error("컬렉션 목록 조회 실패:", error);
			return [];
		}
	}
}
