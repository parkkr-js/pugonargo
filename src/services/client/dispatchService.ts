import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { DispatchData } from "../../types/dispatch";

/**
 * 특정 날짜의 모든 배차 데이터 조회 (기사님용)
 */
export async function getDispatchByDate(date: string): Promise<DispatchData[]> {
	try {
		const docRef = doc(db, "dispatch", date);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const data = docSnap.data();
			// dispatchDataList 배열에서 배차 데이터 추출
			if (data.dispatchDataList && Array.isArray(data.dispatchDataList)) {
				return data.dispatchDataList;
			}
			// 기존 형식 호환성 (단일 객체인 경우)
			if (data.vehicleNumber) {
				return [data as DispatchData];
			}
		}
		return [];
	} catch (error) {
		throw new Error(`배차 데이터 조회 실패: ${error}`);
	}
}
