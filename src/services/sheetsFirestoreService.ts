import {
	type DocumentData,
	type DocumentReference,
	type QueryDocumentSnapshot,
	Timestamp,
	type WriteBatch,
	collection,
	doc,
	getDoc,
	getDocs,
	limit,
	orderBy,
	query,
	where,
	writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { MonthlyStats, RawData } from "../types/sheets";
import { calculateMonthlyStats } from "../utils/sheetUtils";

// 유틸리티 함수
const convertToDate = (value: unknown): Date => {
	if (value instanceof Date) return value;
	if (value && typeof value === "object" && "toDate" in value) {
		return (value as { toDate: () => Date }).toDate();
	}
	if (typeof value === "string") return new Date(value);
	return new Date();
};

const formatDate = (date: Date): string => {
	return date.toISOString().split("T")[0];
};

const chunkArray = <T>(array: T[], size: number): T[][] => {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
};

const convertFirestoreDocToRawData = (
	doc: QueryDocumentSnapshot<DocumentData>,
): RawData => {
	const data = doc.data();
	return {
		id: data.id,
		fileId: data.fileId,
		fileName: data.fileName,
		date: formatDate(convertToDate(data.date)),
		d: data.d,
		e: data.e,
		m: data.m,
		n: data.n,
		o: data.o,
		p: data.p,
		i: data.i,
		q: data.q,
		createdAt: convertToDate(data.createdAt),
		updatedAt: convertToDate(data.updatedAt),
	};
};

export class SheetsFirestoreService {
	private readonly rawDataCollection = collection(db, "rawData");
	private readonly monthlyStatsCollection = collection(db, "monthlyStats");
	private readonly IN_OPERATOR_LIMIT = 30;

	/**
	 * 원본 데이터 일괄 저장 (batch write로 성능 최적화)
	 */
	async saveRawDataBatch(data: RawData[]): Promise<void> {
		const batchSize = 500; // Firestore batch limit

		for (let i = 0; i < data.length; i += batchSize) {
			const batch = writeBatch(db);
			const batchData = data.slice(i, i + batchSize);

			for (const item of batchData) {
				const docRef = doc(this.rawDataCollection, item.id);
				batch.set(docRef, {
					...item,
					createdAt: Timestamp.fromDate(item.createdAt),
					updatedAt: Timestamp.fromDate(item.updatedAt),
				});
			}

			await batch.commit();
		}
	}

	/**
	 * 월별 통계 저장/업데이트
	 */
	async saveMonthlyStats(stats: MonthlyStats[]): Promise<void> {
		const batch = writeBatch(db);

		for (const stat of stats) {
			const docRef = doc(this.monthlyStatsCollection, stat.id);
			const existingDoc = await getDoc(docRef);

			if (!existingDoc.exists()) {
				await this.handleNewMonthlyStat(batch, docRef, stat);
			} else {
				await this.handleExistingMonthlyStat(batch, docRef, stat, existingDoc);
			}
		}

		await batch.commit();
	}

	/**
	 * 새로운 월별 통계 처리
	 */
	private async handleNewMonthlyStat(
		batch: WriteBatch,
		docRef: DocumentReference<DocumentData>,
		stat: MonthlyStats,
	): Promise<void> {
		batch.set(docRef, {
			...stat,
			lastUpdated: Timestamp.fromDate(stat.lastUpdated),
		});
	}

	/**
	 * 기존 월별 통계 업데이트
	 */
	private async handleExistingMonthlyStat(
		batch: WriteBatch,
		docRef: DocumentReference<DocumentData>,
		stat: MonthlyStats,
		existingDoc: QueryDocumentSnapshot<DocumentData>,
	): Promise<void> {
		const existingData = existingDoc.data() as MonthlyStats;
		const allIds = [...existingData.rawDataIds, ...stat.rawDataIds];
		const idChunks = chunkArray(allIds, this.IN_OPERATOR_LIMIT);

		const allRawData = await this.fetchRawDataInChunks(idChunks);
		const mergedStats = calculateMonthlyStats(allRawData)[0];

		batch.set(
			docRef,
			{
				...mergedStats,
				lastUpdated: Timestamp.fromDate(new Date()),
			},
			{ merge: true },
		);
	}

	/**
	 * 청크 단위로 RawData 조회
	 */
	private async fetchRawDataInChunks(idChunks: string[][]): Promise<RawData[]> {
		let allRawData: RawData[] = [];

		for (const chunk of idChunks) {
			const q = query(this.rawDataCollection, where("id", "in", chunk));

			const snapshot = await getDocs(q);
			const chunkData = snapshot.docs.map(convertFirestoreDocToRawData);
			allRawData = [...allRawData, ...chunkData];
		}

		return allRawData;
	}

	/**
	 * 특정 연도/월의 원본 데이터 가져오기
	 */
	async getRawDataByMonth(year: number, month: number): Promise<RawData[]> {
		const startDate = new Date(year, month - 1, 1);
		const endDate = new Date(year, month, 0, 23, 59, 59);

		const q = query(
			this.rawDataCollection,
			where("date", ">=", Timestamp.fromDate(startDate)),
			where("date", "<=", Timestamp.fromDate(endDate)),
			orderBy("date"),
		);

		const snapshot = await getDocs(q);
		return snapshot.docs.map(convertFirestoreDocToRawData);
	}

	/**
	 * 월별 통계 데이터 가져오기 (범위 지정)
	 */
	async getMonthlyStats(
		startYear: number,
		startMonth: number,
		endYear: number,
		endMonth: number,
	): Promise<MonthlyStats[]> {
		const startId = `${startYear}-${startMonth.toString().padStart(2, "0")}`;
		const endId = `${endYear}-${endMonth.toString().padStart(2, "0")}`;

		const q = query(
			this.monthlyStatsCollection,
			where("id", ">=", startId),
			where("id", "<=", endId),
			orderBy("id"),
		);

		const snapshot = await getDocs(q);
		return snapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				...data,
				lastUpdated: data.lastUpdated.toDate(),
			} as MonthlyStats;
		});
	}

	/**
	 * 특정 파일의 기존 데이터 삭제 (재처리를 위해)
	 */
	async deleteFileData(fileId: string): Promise<void> {
		const q = query(this.rawDataCollection, where("fileId", "==", fileId));
		const snapshot = await getDocs(q);

		const batch = writeBatch(db);
		for (const doc of snapshot.docs) {
			batch.delete(doc.ref);
		}
		await batch.commit();
	}

	/**
	 * 파일 데이터 처리 완료 후 월별 통계 자동 계산 및 저장
	 */
	async processAndSaveData(rawData: RawData[]): Promise<void> {
		await this.saveRawDataBatch(rawData);
		const monthlyStats = calculateMonthlyStats(rawData);
		await this.saveMonthlyStats(monthlyStats);
	}

	/**
	 * 월별 통계 요약 가져오기 (대시보드용)
	 */
	async getStatsSummary(): Promise<{
		totalRecords: number;
		totalMonths: number;
		latestMonth: string | null;
	}> {
		const q = query(
			this.monthlyStatsCollection,
			orderBy("id", "desc"),
			limit(12),
		);

		const snapshot = await getDocs(q);
		const stats = snapshot.docs.map((doc) => ({
			recordCount: doc.data().recordCount,
			id: doc.data().id,
		}));

		return {
			totalRecords: stats.reduce((sum, stat) => sum + stat.recordCount, 0),
			totalMonths: stats.length,
			latestMonth: stats.length > 0 ? stats[0].id : null,
		};
	}
}
