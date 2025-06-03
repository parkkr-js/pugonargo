import {
	Timestamp,
	collection,
	doc,
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

export class SheetsFirestoreService {
	private rawDataCollection = collection(db, "rawData");
	private monthlyStatsCollection = collection(db, "monthlyStats");

	/**
	 * 원본 데이터 일괄 저장 (batch write로 성능 최적화)
	 */
	async saveRawDataBatch(data: RawData[]): Promise<void> {
		const batchSize = 500; // Firestore batch limit

		for (let i = 0; i < data.length; i += batchSize) {
			// 각 루프마다 새로운 batch 생성
			const batch = writeBatch(db);
			const batchData = data.slice(i, i + batchSize);

			for (const item of batchData) {
				const docRef = doc(this.rawDataCollection, item.id);
				batch.set(docRef, {
					...item,
					// date는 string 그대로 저장
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
			batch.set(
				docRef,
				{
					...stat,
					lastUpdated: Timestamp.fromDate(stat.lastUpdated),
				},
				{ merge: true },
			);
		}

		await batch.commit();
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
		return snapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				...data,
				date: data.date.toDate(),
				createdAt: data.createdAt.toDate(),
				updatedAt: data.updatedAt.toDate(),
			} as RawData;
		});
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
		// 1. 원본 데이터 저장
		await this.saveRawDataBatch(rawData);

		// 2. 월별 통계 계산
		const monthlyStats = calculateMonthlyStats(rawData);

		// 3. 월별 통계 저장/업데이트
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
		// 최근 12개월 통계만 조회
		const q = query(
			this.monthlyStatsCollection,
			orderBy("id", "desc"),
			limit(12),
		);

		const snapshot = await getDocs(q);
		const stats = snapshot.docs.map((doc) => doc.data() as MonthlyStats);

		return {
			totalRecords: stats.reduce((sum, stat) => sum + stat.recordCount, 0),
			totalMonths: stats.length,
			latestMonth: stats.length > 0 ? stats[0].id : null,
		};
	}
}
