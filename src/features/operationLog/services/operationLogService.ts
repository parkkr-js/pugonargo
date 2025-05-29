import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import type { OperationLogDocument } from "../types/operationLog.types";

export class OperationLogService {
	async getOperationLogs(
		date: string, // yyyy-mm-dd
		vehicleNumber: string,
	): Promise<OperationLogDocument[]> {
		try {
			const [year, month, day] = date.split("-");
			const currentYearMonth = `${year}-${month}`;

			// 다음 달 계산
			const nextMonth = new Date(
				Number.parseInt(year),
				Number.parseInt(month),
				1,
			);
			const nextYearMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;

			const allDocuments: OperationLogDocument[] = [];

			// 현재 달 조회
			try {
				const currentMonthDocs = await this.getDocumentsFromCollection(
					currentYearMonth,
					year,
					month,
					day,
					vehicleNumber,
				);
				allDocuments.push(...currentMonthDocs);
			} catch (error) {
				console.warn(
					`컬렉션 operations/${currentYearMonth}/records를 찾을 수 없습니다.`,
				);
			}

			// 다음 달 조회
			try {
				const nextMonthDocs = await this.getDocumentsFromCollection(
					nextYearMonth,
					year,
					month,
					day,
					vehicleNumber,
				);
				allDocuments.push(...nextMonthDocs);
			} catch (error) {
				console.warn(
					`컬렉션 operations/${nextYearMonth}/records를 찾을 수 없습니다.`,
				);
			}

			return allDocuments;
		} catch (error) {
			console.error("운행내역 조회 실패:", error);
			throw new Error("운행내역을 불러오는데 실패했습니다.");
		}
	}

	private async getDocumentsFromCollection(
		yearMonth: string,
		year: string,
		month: string,
		day: string,
		vehicleNumber: string,
	): Promise<OperationLogDocument[]> {
		const collectionRef = collection(db, "operations", yearMonth, "records");

		const q = query(
			collectionRef,
			where("year", "==", year),
			where("month", "==", month),
			where("day", "==", day),
			where("vehicleNumber", "==", vehicleNumber),
		);

		const querySnapshot = await getDocs(q);

		return querySnapshot.docs.map(
			(docSnapshot) =>
				({
					id: docSnapshot.id,
					...docSnapshot.data(),
				}) as OperationLogDocument,
		);
	}
}
