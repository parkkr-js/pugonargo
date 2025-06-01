import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	getFirestore,
	setDoc,
} from "firebase/firestore";
import type { ExcelData } from "../entities/ExcelData";

export class FirebaseService {
	private db = getFirestore();

	// operations/{year-month}/records/{docId}
	private async clearSubCollection(year: string, month: string): Promise<void> {
		try {
			// operations/{year-month}/records 서브컬렉션 정리
			const yearMonth = `${year}-${month}`;
			const recordsRef = collection(
				this.db,
				"operations",
				yearMonth,
				"records",
			);
			const snapshot = await getDocs(recordsRef);

			const deletePromises = snapshot.docs.map((docSnapshot) => {
				return deleteDoc(docSnapshot.ref);
			});

			await Promise.all(deletePromises);
			console.log(`${yearMonth} records 서브컬렉션 정리 완료`);
		} catch (error) {
			console.error("서브컬렉션 정리 실패:", error);
			throw error;
		}
	}

	// 🚀 메인 저장 함수 - 개선된 구조 사용
	async saveExcelData(
		data: ExcelData[],
		year: string,
		month: string,
	): Promise<void> {
		const yearMonth = `${year}-${month}`;

		try {
			// 1. 기존 records 서브컬렉션 정리 (덮어쓰기)
			await this.clearSubCollection(year, month);

			// 2. operations/{year-month} 문서 생성/업데이트
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
			); // merge: true로 기존 데이터 유지하면서 업데이트

			// 3. operations/{year-month}/records 서브컬렉션에 데이터 저장
			const recordsRef = collection(
				this.db,
				"operations",
				yearMonth,
				"records",
			);
			const savePromises = data.map((item) => {
				return addDoc(recordsRef, item);
			});

			await Promise.all(savePromises);

			console.log(`${yearMonth} 데이터 저장 완료: ${data.length}개 문서`);
		} catch (error) {
			console.error(`${yearMonth} 데이터 저장 실패:`, error);
			throw error;
		}
	}

	// 📝 연도-월 컬렉션 관리 (기존 로직 유지)
	async saveYearMonthCollection(year: string, month: string): Promise<void> {
		const collectionName = "yearMonthCollection";

		try {
			const collectionRef = collection(this.db, collectionName);
			const snapshot = await getDocs(collectionRef);
			const existingDocs = snapshot.docs.map((doc) => doc.data());
			const yearMonthString = `${year}-${month}`;

			// 중복 체크 후 저장
			if (!existingDocs.some((doc) => doc.yearMonth === yearMonthString)) {
				await addDoc(collectionRef, {
					yearMonth: yearMonthString,
					createdAt: new Date().toISOString(),
				});
				console.log(`yearMonthCollection에 ${yearMonthString} 추가됨`);
			} else {
				console.log(`yearMonthCollection에 ${yearMonthString} 이미 존재함`);
			}
		} catch (error) {
			console.error("연도-월 컬렉션 저장 실패:", error);
			throw error;
		}
	}

	// 🎯 새로운 함수: Collection Group 쿼리를 위한 데이터 조회
	async getRecordsByCollectionGroup(): Promise<ExcelData[]> {
		try {
			// collectionGroup을 사용하여 모든 'records' 서브컬렉션에서 데이터 조회
			const recordsRef = collection(this.db, "records"); // Collection Group 쿼리
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

			return allRecords;
		} catch (error) {
			console.error("Collection Group 쿼리 실패:", error);
			throw error;
		}
	}

	// 🔍 특정 연도-월 데이터 조회
	async getRecordsByYearMonth(
		year: string,
		month: string,
	): Promise<ExcelData[]> {
		try {
			const yearMonth = `${year}-${month}`;
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

			return records;
		} catch (error) {
			console.error(`${year}-${month} 데이터 조회 실패:`, error);
			throw error;
		}
	}

	// 📊 저장된 연도-월 목록 조회
	async getAllYearMonths(): Promise<string[]> {
		try {
			const operationsRef = collection(this.db, "operations");
			const snapshot = await getDocs(operationsRef);

			const yearMonths = snapshot.docs.map((doc) => doc.id);
			return yearMonths.sort(); // 정렬하여 반환
		} catch (error) {
			console.error("연도-월 목록 조회 실패:", error);
			throw error;
		}
	}
}
