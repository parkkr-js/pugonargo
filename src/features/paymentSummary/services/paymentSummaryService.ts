import {
	type Timestamp,
	collection,
	getDocs,
	query,
	where,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import type { PaymentDocument } from "../types/paymentSummary";

interface FirebasePaymentDoc {
	columnIAmount: number;
	columnOAmount: number;
	date: string;
	createdAt: Timestamp;
	updatedAt?: Timestamp;
}

const serializeTimestamp = (
	timestamp: Timestamp | undefined,
): string | undefined => {
	return timestamp?.toDate()?.toISOString();
};

const serializeTimestampRequired = (
	timestamp: Timestamp | undefined,
): string => {
	return timestamp?.toDate()?.toISOString() || new Date().toISOString();
};

export class PaymentSummaryService {
	// operations/2025-01/records 형태로 변경된 구조 적용
	async getDocumentsByMonth(yearMonth: string): Promise<PaymentDocument[]> {
		try {
			const collectionRef = collection(db, "operations", yearMonth, "records");
			const querySnapshot = await getDocs(collectionRef);

			return querySnapshot.docs.map((docSnapshot) => {
				const data = docSnapshot.data() as FirebasePaymentDoc;

				return {
					id: docSnapshot.id,
					columnIAmount: data.columnIAmount || 0,
					columnOAmount: data.columnOAmount || 0,
					date: data.date,
					createdAt: serializeTimestampRequired(data.createdAt),
					updatedAt: serializeTimestamp(data.updatedAt),
				} satisfies PaymentDocument;
			});
		} catch (error) {
			console.error(`컬렉션 operations/${yearMonth}/records 조회 실패:`, error);
			throw new Error(`${yearMonth} 데이터를 불러오는데 실패했습니다.`);
		}
	}

	async getDocumentsByDateRange(
		startDate: string,
		endDate: string,
	): Promise<PaymentDocument[]> {
		try {
			const collections = this.getCollectionsFromDateRange(startDate, endDate);
			const allDocuments: PaymentDocument[] = [];

			for (const yearMonth of collections) {
				try {
					const collectionRef = collection(
						db,
						"operations",
						yearMonth,
						"records",
					);

					const q = query(
						collectionRef,
						where("date", ">=", startDate),
						where("date", "<=", endDate),
					);

					const querySnapshot = await getDocs(q);

					const documents = querySnapshot.docs.map((docSnapshot) => {
						const data = docSnapshot.data() as FirebasePaymentDoc;

						return {
							id: docSnapshot.id,
							columnIAmount: data.columnIAmount || 0,
							columnOAmount: data.columnOAmount || 0,
							date: data.date,
							createdAt: serializeTimestampRequired(data.createdAt),
							updatedAt: serializeTimestamp(data.updatedAt),
						} satisfies PaymentDocument;
					});

					allDocuments.push(...documents);
				} catch (error) {
					console.warn(
						`컬렉션 operations/${yearMonth}/records를 찾을 수 없습니다.`,
					);
				}
			}

			return allDocuments;
		} catch (error) {
			console.error("날짜 범위 조회 실패:", error);
			throw new Error("날짜 범위 데이터를 불러오는데 실패했습니다.");
		}
	}

	async checkCollectionExists(yearMonth: string): Promise<boolean> {
		try {
			const collectionRef = collection(db, "operations", yearMonth, "records");
			const querySnapshot = await getDocs(collectionRef);
			return !querySnapshot.empty;
		} catch (error) {
			return false;
		}
	}

	async getAvailableYearMonths(): Promise<string[]> {
		try {
			const operationsRef = collection(db, "operations");
			const snapshot = await getDocs(operationsRef);

			const yearMonths = snapshot.docs
				.map((doc) => doc.id)
				.filter((id) => /^\d{4}-\d{2}$/.test(id))
				.sort();

			return yearMonths;
		} catch (error) {
			console.error("가용 연월 목록 조회 실패:", error);
			throw new Error("가용 연월 목록을 가져오는데 실패했습니다.");
		}
	}

	private getCollectionsFromDateRange(
		startDate: string,
		endDate: string,
	): string[] {
		const collections = new Set<string>();
		const start = new Date(startDate);
		const end = new Date(endDate);
		const current = new Date(start);

		while (current <= end) {
			const yearMonth = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
			collections.add(yearMonth);
			current.setMonth(current.getMonth() + 1);
		}

		return Array.from(collections);
	}
}
