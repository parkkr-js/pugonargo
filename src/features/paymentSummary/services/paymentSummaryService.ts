// src/features/paymentSummary/services/PaymentSummaryService.ts
import {
	collectionGroup,
	getDocs,
	orderBy,
	query,
	where,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import type { PaymentDocument } from "../types/paymentSummary";

interface FirebasePaymentDoc {
	columnIAmount: number;
	columnOAmount: number;
	columnQAmount?: number;
	year: string;
	month: string;
	day: string;
	chargeableWeight?: number;
	group?: string;
	memo?: string;
	transportRoute?: string;
	unitPrice?: number;
	vehicleNumber?: string;
}

export class PaymentSummaryService {
	/**
	 * 월별 데이터 조회 (yyyy-mm 형식)
	 * Collection Group과 인덱스를 활용하여 모든 records 컬렉션에서
	 * 해당 년월 데이터를 효율적으로 조회
	 */
	async getDocumentsByMonth(yearMonth: string): Promise<PaymentDocument[]> {
		try {
			const [targetYear, targetMonth] = yearMonth.split("-");

			// Collection Group을 사용하여 모든 records 컬렉션에서 한번에 조회
			// Firebase 인덱스 활용: year Ascending, month Ascending
			const recordsRef = collectionGroup(db, "records");
			const q = query(
				recordsRef,
				where("year", "==", targetYear),
				where("month", "==", targetMonth),
				orderBy("year"),
				orderBy("month"),
				orderBy("day"),
			);

			const querySnapshot = await getDocs(q);

			return querySnapshot.docs.map((docSnapshot) => {
				const data = docSnapshot.data() as FirebasePaymentDoc;

				return {
					id: docSnapshot.id,
					columnIAmount: data.columnIAmount || 0,
					columnOAmount: data.columnOAmount || 0,
					year: data.year,
					month: data.month,
					day: data.day,
				} satisfies PaymentDocument;
			});
		} catch (error) {
			console.error(`${yearMonth} 월별 데이터 조회 실패:`, error);
			throw new Error(`${yearMonth} 데이터를 불러오는데 실패했습니다.`);
		}
	}

	/**
	 * 날짜 범위별 데이터 조회 (yyyy-mm-dd ~ yyyy-mm-dd 형식)
	 * Collection Group과 복합 인덱스를 활용하여 효율적인 범위 조회
	 */
	async getDocumentsByDateRange(
		startDate: string,
		endDate: string,
	): Promise<PaymentDocument[]> {
		try {
			const [startYear, startMonth, startDay] = startDate.split("-");
			const [endYear, endMonth, endDay] = endDate.split("-");

			// Collection Group을 사용하여 모든 records 컬렉션에서 한번에 조회
			const recordsRef = collectionGroup(db, "records");

			// 단일 월 범위인 경우 최적화된 쿼리 사용
			if (startYear === endYear && startMonth === endMonth) {
				return await this.getDocumentsForSingleMonth(
					startYear,
					startMonth,
					startDay,
					endDay,
				);
			}

			// 복수 월 범위인 경우 년도별로 분할 조회 후 클라이언트 필터링
			const q = query(
				recordsRef,
				where("year", ">=", startYear),
				where("year", "<=", endYear),
				orderBy("year"),
				orderBy("month"),
				orderBy("day"),
			);

			const querySnapshot = await getDocs(q);

			return querySnapshot.docs
				.map((docSnapshot) => {
					const data = docSnapshot.data() as FirebasePaymentDoc;
					return {
						id: docSnapshot.id,
						columnIAmount: data.columnIAmount || 0,
						columnOAmount: data.columnOAmount || 0,
						year: data.year,
						month: data.month,
						day: data.day,
					} satisfies PaymentDocument;
				})
				.filter((doc) => {
					// year, month, day를 조합하여 날짜 범위 필터링
					const docDate = `${doc.year}-${doc.month}-${doc.day}`;
					return docDate >= startDate && docDate <= endDate;
				});
		} catch (error) {
			console.error("날짜 범위 조회 실패:", error);
			throw new Error("날짜 범위 데이터를 불러오는데 실패했습니다.");
		}
	}

	/**
	 * 단일 월 내 날짜 범위 조회 최적화
	 * Firebase 인덱스를 최대한 활용하여 효율적인 쿼리 수행
	 */
	private async getDocumentsForSingleMonth(
		year: string,
		month: string,
		startDay: string,
		endDay: string,
	): Promise<PaymentDocument[]> {
		try {
			const recordsRef = collectionGroup(db, "records");

			// Firebase 복합 인덱스 활용: year, month, day 순서대로 필터링
			const q = query(
				recordsRef,
				where("year", "==", year),
				where("month", "==", month),
				where("day", ">=", startDay),
				where("day", "<=", endDay),
				orderBy("day"),
			);

			const querySnapshot = await getDocs(q);

			return querySnapshot.docs.map((docSnapshot) => {
				const data = docSnapshot.data() as FirebasePaymentDoc;

				return {
					id: docSnapshot.id,
					columnIAmount: data.columnIAmount || 0,
					columnOAmount: data.columnOAmount || 0,
					year: data.year,
					month: data.month,
					day: data.day,
				} satisfies PaymentDocument;
			});
		} catch (error) {
			console.warn(
				`단일 월 범위 조회 실패: ${year}-${month}, ${startDay}~${endDay}`,
			);
			return [];
		}
	}

	/**
	 * 컬렉션 존재 여부 확인
	 * 특정 연월의 데이터가 있는지 Collection Group으로 빠르게 확인
	 */
	async checkCollectionExists(yearMonth: string): Promise<boolean> {
		try {
			const [targetYear, targetMonth] = yearMonth.split("-");

			// Collection Group을 사용하여 해당 년월 데이터 존재 여부 확인
			const recordsRef = collectionGroup(db, "records");
			const q = query(
				recordsRef,
				where("year", "==", targetYear),
				where("month", "==", targetMonth),
				orderBy("year"),
				orderBy("month"),
			);

			const querySnapshot = await getDocs(q);
			return !querySnapshot.empty;
		} catch (error) {
			console.warn(`컬렉션 존재 확인 실패: ${yearMonth}`);
			return false;
		}
	}

	/**
	 * 사용 가능한 연월 목록 조회
	 * Collection Group을 사용하여 모든 records에서 고유한 year-month 조합 추출
	 */
	async getAvailableYearMonths(): Promise<string[]> {
		try {
			// Collection Group을 사용하여 모든 records 조회
			const recordsRef = collectionGroup(db, "records");
			const q = query(recordsRef, orderBy("year"), orderBy("month"));

			const snapshot = await getDocs(q);

			// 고유한 year-month 조합을 Set으로 수집
			const yearMonthSet = new Set<string>();

			for (const doc of snapshot.docs) {
				const data = doc.data() as FirebasePaymentDoc;
				if (data.year && data.month) {
					const yearMonth = `${data.year}-${data.month}`;
					yearMonthSet.add(yearMonth);
				}
			}

			// Set을 배열로 변환하고 정렬
			return Array.from(yearMonthSet).sort();
		} catch (error) {
			console.error("가용 연월 목록 조회 실패:", error);
			throw new Error("가용 연월 목록을 가져오는데 실패했습니다.");
		}
	}

	/**
	 * 특정 차량의 데이터 조회 (추가 기능)
	 * vehicleNumber 인덱스를 활용한 차량별 데이터 조회
	 */
	async getDocumentsByVehicle(
		vehicleNumber: string,
		yearMonth?: string,
	): Promise<PaymentDocument[]> {
		try {
			const recordsRef = collectionGroup(db, "records");
			let q: ReturnType<typeof query>;

			if (yearMonth) {
				const [year, month] = yearMonth.split("-");
				// 복합 인덱스 활용: year, month, vehicleNumber
				q = query(
					recordsRef,
					where("year", "==", year),
					where("month", "==", month),
					where("vehicleNumber", "==", vehicleNumber),
					orderBy("day"),
				);
			} else {
				// vehicleNumber 인덱스만 활용
				q = query(
					recordsRef,
					where("vehicleNumber", "==", vehicleNumber),
					orderBy("year"),
					orderBy("month"),
					orderBy("day"),
				);
			}

			const querySnapshot = await getDocs(q);

			return querySnapshot.docs.map((docSnapshot) => {
				const data = docSnapshot.data() as FirebasePaymentDoc;

				return {
					id: docSnapshot.id,
					columnIAmount: data.columnIAmount || 0,
					columnOAmount: data.columnOAmount || 0,
					year: data.year,
					month: data.month,
					day: data.day,
				} satisfies PaymentDocument;
			});
		} catch (error) {
			console.error(`차량 ${vehicleNumber} 데이터 조회 실패:`, error);
			throw new Error(
				`차량 ${vehicleNumber} 데이터를 불러오는데 실패했습니다.`,
			);
		}
	}
}
