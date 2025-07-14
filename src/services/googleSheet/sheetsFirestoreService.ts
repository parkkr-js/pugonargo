// src/services/googleSheet/sheetsFirestoreService.ts

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
import { db } from "../../lib/firebase";
import type { MonthlyStats, RawData } from "../../types/sheets";
import { calculateMonthlyStats } from "../../utils/calculationUtils";
import { readCounter } from "../../utils/firestoreReadCounter";
import { convertFirestoreDocToRawData } from "../../utils/sheetUtils";

// 상수 정의
const BATCH_SIZE = {
	FIRESTORE: 500,
	IN_OPERATOR: 30,
} as const;

export class SheetsFirestoreService {
	private readonly rawDataCollection = collection(db, "rawData");
	private readonly monthlyStatsCollection = collection(db, "monthlyStats");

	// 원본 데이터 일괄 저장
	async saveRawDataBatch(data: RawData[]): Promise<void> {
		for (let i = 0; i < data.length; i += BATCH_SIZE.FIRESTORE) {
			const batch = writeBatch(db);
			const batchData = data.slice(i, i + BATCH_SIZE.FIRESTORE);

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

	// 월별 통계 저장/업데이트
	async saveMonthlyStats(stats: MonthlyStats[]): Promise<void> {
		const batch = writeBatch(db);

		for (const stat of stats) {
			const docRef = doc(this.monthlyStatsCollection, stat.id);
			const existingDoc = await getDoc(docRef);
			readCounter.increment(1, "check_existing_monthly_stat");

			if (!existingDoc.exists()) {
				await this.handleNewMonthlyStat(batch, docRef, stat);
			} else {
				await this.handleExistingMonthlyStat(batch, docRef, stat, existingDoc);
			}
		}

		await batch.commit();
	}

	// 새로운 월별 통계 처리
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

	// 기존 월별 통계 업데이트
	private async handleExistingMonthlyStat(
		batch: WriteBatch,
		docRef: DocumentReference<DocumentData>,
		stat: MonthlyStats,
		existingDoc: QueryDocumentSnapshot<DocumentData>,
	): Promise<void> {
		const existingData = existingDoc.data() as MonthlyStats;
		const allIds = Array.from(
			new Set([...existingData.rawDataIds, ...stat.rawDataIds]),
		);

		batch.set(
			docRef,
			{
				...stat,
				rawDataIds: allIds,
				lastUpdated: Timestamp.fromDate(new Date()),
			},
			{ merge: true },
		);
	}

	// 특정 연도/월의 원본 데이터 가져오기
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
		readCounter.increment(snapshot.docs.length, "get_raw_data_by_month");
		return snapshot.docs.map(convertFirestoreDocToRawData);
	}

	// 월별 통계 데이터 가져오기 (범위 지정)
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
		readCounter.increment(snapshot.docs.length, "get_monthly_stats");
		return snapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				...data,
				lastUpdated: data.lastUpdated.toDate(),
			} as MonthlyStats;
		});
	}

	// 특정 파일의 기존 데이터 삭제
	async deleteFileData(fileId: string): Promise<void> {
		const q = query(this.rawDataCollection, where("fileId", "==", fileId));
		const snapshot = await getDocs(q);
		readCounter.increment(snapshot.docs.length, "delete_file_data");

		const batch = writeBatch(db);
		for (const doc of snapshot.docs) {
			batch.delete(doc.ref);
		}
		await batch.commit();
	}

	// 특정 월의 통계 데이터 가져오기
	async getMonthlyStat(
		year: number,
		month: number,
	): Promise<MonthlyStats | null> {
		const monthId = `${year}-${String(month).padStart(2, "0")}`;
		const docRef = doc(this.monthlyStatsCollection, monthId);
		const docSnap = await getDoc(docRef);
		readCounter.increment(1, "get_monthly_stat");

		if (!docSnap.exists()) return null;

		const data = docSnap.data();
		return {
			...data,
			lastUpdated: data.lastUpdated.toDate(),
		} as MonthlyStats;
	}

	// 파일 데이터 처리 및 저장
	async processAndSaveData(
		rawData: RawData[],
		fileName: string,
	): Promise<void> {
		readCounter.reset();

		await this.saveRawDataBatch(rawData);

		const monthlyMap = this.groupDataByMonth(rawData);
		await this.processMonthlyData(monthlyMap, fileName);

		readCounter.printSummary();
	}

	// 데이터를 월별로 그룹화
	private groupDataByMonth(rawData: RawData[]): Map<string, RawData[]> {
		const monthlyMap = new Map<string, RawData[]>();

		for (const data of rawData) {
			const date = new Date(data.date);
			const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

			if (!monthlyMap.has(key)) {
				monthlyMap.set(key, []);
			}
			monthlyMap.get(key)?.push(data);
		}

		return monthlyMap;
	}

	// 월별 데이터 처리
	private async processMonthlyData(
		monthlyMap: Map<string, RawData[]>,
		fileName: string,
	): Promise<void> {
		for (const [monthKey, monthData] of monthlyMap) {
			if (!monthData.length) continue;

			const [year, month] = monthKey.split("-").map(Number);
			const existingStats = await this.getMonthlyStat(year, month);
			const existingIds = new Set(existingStats?.rawDataIds || []);
			const newData = monthData.filter((data) => !existingIds.has(data.id));

			if (newData.length > 0) {
				const newStats = this.calculateMonthlyStats(newData);

				if (existingStats) {
					await this.updateExistingStats(
						existingStats,
						newStats,
						newData,
						fileName,
					);
				} else {
					await this.saveMonthlyStats([newStats]);
				}
			}
		}
	}

	// 기존 통계 업데이트
	private async updateExistingStats(
		existingStats: MonthlyStats,
		newStats: MonthlyStats,
		newData: RawData[],
		fileName: string,
	): Promise<void> {
		await this.saveMonthlyStats([
			{
				...existingStats,
				recordCount: existingStats.recordCount + newStats.recordCount,
				totalGH: existingStats.totalGH + newStats.totalGH,
				totalMN: existingStats.totalMN + newStats.totalMN,
				lastUpdated: new Date(),
				sourceFiles: Array.from(
					new Set([...existingStats.sourceFiles, fileName]),
				),
				rawDataIds: [
					...existingStats.rawDataIds,
					...newData.map((data) => data.id),
				],
			},
		]);
	}

	// 월별 통계 계산
	private calculateMonthlyStats(rawData: RawData[]): MonthlyStats {
		const date = new Date(rawData[0].date);

		// 새로운 계산 방식 적용
		const calculation = calculateMonthlyStats(
			rawData.map((data) => ({
				g: data.g,
				h: data.h,
				m: data.m,
				n: data.n,
			})),
		);

		return {
			id: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
			year: date.getFullYear(),
			month: date.getMonth() + 1,
			recordCount: rawData.length,
			totalGH: calculation.totalGH,
			totalMN: calculation.totalMN,
			lastUpdated: new Date(),
			sourceFiles: [rawData[0].fileName],
			rawDataIds: rawData.map((data) => data.id),
		};
	}

	// 월별 통계 요약 가져오기
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
		readCounter.increment(snapshot.docs.length, "get_stats_summary");

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
