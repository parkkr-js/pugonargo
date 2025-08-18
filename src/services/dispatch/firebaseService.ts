import {
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	setDoc,
	where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { DispatchData } from "../../types/dispatch";

/**
 * 배차 데이터를 Firebase에 저장 (배열로 저장)
 */
export async function saveDispatchData(
	docId: string,
	dispatchDataList: DispatchData[],
): Promise<void> {
	try {
		const docRef = doc(db, "dispatch", docId);
		await setDoc(
			docRef,
			{
				date: docId,
				dispatchDataList: dispatchDataList,
			},
			{ merge: true },
		);
	} catch (error) {
		throw new Error(`배차 데이터 저장 실패: ${error}`);
	}
}

/**
 * 특정 날짜의 모든 배차 데이터 조회
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

/**
 * 특정 차량번호와 매입처의 배차 데이터 조회
 */
export async function getDispatchByVehicleAndSupplier(
	date: string,
	vehicleNumber: string,
	supplier: string,
): Promise<DispatchData[]> {
	try {
		const allData = await getDispatchByDate(date);
		return allData.filter(
			(data) =>
				data.vehicleNumber === vehicleNumber && data.supplier === supplier,
		);
	} catch (error) {
		throw new Error(`특정 차량/매입처 배차 데이터 조회 실패: ${error}`);
	}
}

/**
 * 특정 차량번호의 모든 배차 데이터 조회
 */
export async function getDispatchByVehicle(
	vehicleNumber: string,
): Promise<DispatchData[]> {
	try {
		const dispatchRef = collection(db, "dispatch");
		const q = query(
			dispatchRef,
			where("vehicleNumber", "==", vehicleNumber),
			orderBy("date", "desc"),
		);

		const querySnapshot = await getDocs(q);
		const results: DispatchData[] = [];

		for (const docSnapshot of querySnapshot.docs) {
			const data = docSnapshot.data();
			if (data.vehicleNumber === vehicleNumber) {
				results.push(data as DispatchData);
			}
		}

		return results;
	} catch (error) {
		throw new Error(`차량별 배차 데이터 조회 실패: ${error}`);
	}
}
