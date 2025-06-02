// src/features/excelData/domain/services/FirebaseService.ts
import {
	collection,
	doc,
	getDocs,
	getFirestore,
	setDoc,
	writeBatch,
} from "firebase/firestore";
import type { ExcelData } from "../entities/ExcelData";

export class FirebaseService {
	private db = getFirestore();

	private async clearSubCollection(year: string, month: string): Promise<void> {
		try {
			const yearMonth = `${year}-${month}`;
			const recordsRef = collection(
				this.db,
				"operations",
				yearMonth,
				"records",
			);
			const snapshot = await getDocs(recordsRef);

			if (snapshot.empty) {
				console.log(`📝 ${yearMonth} 기존 데이터 없음`);
				return;
			}

			// 🚀 배치 삭제 사용 (최대 500개씩 처리)
			const BATCH_SIZE = 500;
			const docs = snapshot.docs;

			for (let i = 0; i < docs.length; i += BATCH_SIZE) {
				const batch = writeBatch(this.db);
				const batchDocs = docs.slice(i, i + BATCH_SIZE);

				batchDocs.map((docSnapshot) => batch.delete(docSnapshot.ref));

				await batch.commit();
			}
		} catch (error) {
			console.error("서브컬렉션 정리 실패:", error);
			throw error;
		}
	}

	// 배치 저장
	async saveExcelData(
		data: ExcelData[],
		year: string,
		month: string,
	): Promise<void> {
		const startTime = performance.now();

		const yearMonth = `${year}-${month}`;

		try {
			// 1단계: 병렬 처리 - 기존 데이터 정리와 메타데이터 저장
			const clearPromise = this.clearSubCollection(year, month);

			const metadataPromise = (async () => {
				const operationDocRef = doc(this.db, "operations", yearMonth);
				await setDoc(
					operationDocRef,
					{
						year,
						month,
						yearMonth,
						updatedAt: new Date().toISOString(),
						recordCount: data.length,
					},
					{ merge: true },
				);
				console.log(`📄 ${yearMonth} 메타데이터 저장 완료`);
			})();

			// 병렬 실행
			await Promise.all([clearPromise, metadataPromise]);

			// 2단계: 배치 저장 (Firebase 최대 성능 활용)
			if (data.length === 0) {
				return;
			}

			const batchStartTime = performance.now();

			const BATCH_SIZE = 500; // Firebase 배치 최대 크기
			const recordsRef = collection(
				this.db,
				"operations",
				yearMonth,
				"records",
			);

			// 배치별 병렬 처리
			const batchPromises: Promise<void>[] = [];

			for (let i = 0; i < data.length; i += BATCH_SIZE) {
				const batchData = data.slice(i, i + BATCH_SIZE);
				const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

				const batchPromise = (async () => {
					const batch = writeBatch(this.db);

					for (const item of batchData) {
						const docRef = doc(recordsRef);
						batch.set(docRef, item);
					}

					await batch.commit();
					console.log(
						`✅ 배치 ${batchNumber} 저장 완료 (${batchData.length}개)`,
					);
				})();

				batchPromises.push(batchPromise);

				// 동시 배치 수 제한 (Firebase 부하 방지)
				if (batchPromises.length >= 3) {
					// 최대 3개 배치 동시 실행
					await Promise.all(batchPromises);
					batchPromises.length = 0; // 배열 초기화
				}
			}
			// 남은 배치들 처리
			if (batchPromises.length > 0) {
				await Promise.all(batchPromises);
			}

			const batchTime = Math.round(performance.now() - batchStartTime);
			const totalTime = Math.round(performance.now() - startTime);

			console.log(`💾 배치 저장 완료 (${batchTime}ms)`);
			console.log(`✅ 전체 저장 완료: ${data.length}개 문서 (${totalTime}ms)`);

			// 성능 분석 로그
			const docsPerSecond = Math.round((data.length / totalTime) * 1000);
			console.log(`📊 저장 성능: ${docsPerSecond}개/초`);
		} catch (error) {
			console.error(`❌ ${yearMonth} 데이터 저장 실패:`, error);
			throw error;
		}
	}

	// 성능 모니터링이 추가된 기존 메서드들
	async getRecordsByCollectionGroup(): Promise<ExcelData[]> {
		try {
			const startTime = performance.now();

			const recordsRef = collection(this.db, "records");
			const snapshot = await getDocs(recordsRef);

			const allRecords = snapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					year: data.year,
					month: data.month,
					day: data.day,
					group: data.group,
					vehicleNumber: data.vehicleNumber,
					transportRoute: data.transportRoute,
					chargeableWeight: data.chargeableWeight,
					unitPrice: data.unitPrice,
					columnOAmount: data.columnOAmount,
					columnIAmount: data.columnIAmount,
					columnQAmount: data.columnQAmount,
					memo: data.memo,
				} as ExcelData;
			});

			const endTime = Math.round(performance.now() - startTime);
			console.log(
				`✅ Collection Group 쿼리 완료: ${allRecords.length}개 (${endTime}ms)`,
			);

			return allRecords;
		} catch (error) {
			console.error("Collection Group 쿼리 실패:", error);
			throw error;
		}
	}

	async getRecordsByYearMonth(
		year: string,
		month: string,
	): Promise<ExcelData[]> {
		try {
			const yearMonth = `${year}-${month}`;
			console.log(`🔍 ${yearMonth} 데이터 조회 시작...`);
			const startTime = performance.now();

			const recordsRef = collection(
				this.db,
				"operations",
				yearMonth,
				"records",
			);
			const snapshot = await getDocs(recordsRef);

			const records = snapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					year: data.year,
					month: data.month,
					day: data.day,
					group: data.group,
					vehicleNumber: data.vehicleNumber,
					transportRoute: data.transportRoute,
					chargeableWeight: data.chargeableWeight,
					unitPrice: data.unitPrice,
					columnOAmount: data.columnOAmount,
					columnIAmount: data.columnIAmount,
					columnQAmount: data.columnQAmount,
					memo: data.memo,
				} as ExcelData;
			});

			const endTime = Math.round(performance.now() - startTime);
			console.log(
				`✅ ${yearMonth} 데이터 조회 완료: ${records.length}개 (${endTime}ms)`,
			);

			return records;
		} catch (error) {
			console.error(`${year}-${month} 데이터 조회 실패:`, error);
			throw error;
		}
	}

	// 🚀 최적화: 캐시 활용 가능한 연월 목록 조회
	async getAllYearMonths(): Promise<string[]> {
		try {
			const startTime = performance.now();

			const operationsRef = collection(this.db, "operations");
			const snapshot = await getDocs(operationsRef);

			const yearMonths = snapshot.docs.map((doc) => doc.id);
			const sortedYearMonths = yearMonths.sort();

			const endTime = Math.round(performance.now() - startTime);
			console.log(
				`✅ 연월 목록 조회 완료: ${sortedYearMonths.length}개 (${endTime}ms)`,
			);

			return sortedYearMonths;
		} catch (error) {
			console.error("연도-월 목록 조회 실패:", error);
			throw error;
		}
	}

	// 🚀 새로운 메서드: 전체 프로세스 성능 측정
	async saveWithPerformanceTracking(
		data: ExcelData[],
		year: string,
		month: string,
	): Promise<{ totalTime: number; itemsPerSecond: number }> {
		const startTime = performance.now();

		await this.saveExcelData(data, year, month);

		const totalTime = Math.round(performance.now() - startTime);
		const itemsPerSecond = Math.round((data.length / totalTime) * 1000);

		return { totalTime, itemsPerSecond };
	}

	// 🚀 새로운 메서드: 메모리 사용량 최적화된 대용량 저장
	async saveLargeDataset(
		data: ExcelData[],
		year: string,
		month: string,
		onProgress?: (progress: number) => void,
	): Promise<void> {
		console.log(`🚀 대용량 데이터 저장 시작: ${data.length}개 항목`);

		const CHUNK_SIZE = 1000; // 메모리 효율성을 위한 청크 크기
		const totalChunks = Math.ceil(data.length / CHUNK_SIZE);

		// 첫 번째 청크 처리 시 기존 데이터 정리
		for (let i = 0; i < totalChunks; i++) {
			const chunk = data.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
			const progress = Math.round(((i + 1) / totalChunks) * 100);

			console.log(
				`📦 청크 ${i + 1}/${totalChunks} 처리 중... (${chunk.length}개)`,
			);

			if (i === 0) {
				// 첫 번째 청크에서만 기존 데이터 정리
				await this.saveExcelData(chunk, year, month);
			} else {
				// 나머지 청크는 추가만
				await this.appendExcelData(chunk, year, month);
			}

			onProgress?.(progress);
			console.log(`✅ 청크 ${i + 1} 완료 (진행률: ${progress}%)`);

			// 🚀 메모리 정리를 위한 잠깐의 휴식
			if (i < totalChunks - 1) {
				await new Promise((resolve) => setTimeout(resolve, 10));
			}
		}

		console.log(`✅ 대용량 데이터 저장 완료: ${data.length}개 항목`);
	}

	// 🚀 새로운 메서드: 데이터 추가 (기존 삭제하지 않음)
	private async appendExcelData(
		data: ExcelData[],
		year: string,
		month: string,
	): Promise<void> {
		const yearMonth = `${year}-${month}`;
		const BATCH_SIZE = 500;

		const recordsRef = collection(this.db, "operations", yearMonth, "records");

		for (let i = 0; i < data.length; i += BATCH_SIZE) {
			const batchData = data.slice(i, i + BATCH_SIZE);
			const batch = writeBatch(this.db);

			for (const item of batchData) {
				const docRef = doc(recordsRef);
				batch.set(docRef, item);
			}

			await batch.commit();
		}
	}
}
