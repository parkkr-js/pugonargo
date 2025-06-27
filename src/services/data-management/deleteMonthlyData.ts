import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	query,
	where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export const deleteMonthlyData = async (monthId: string): Promise<void> => {
	try {
		// 1. monthlyStats에서 해당 월 데이터 삭제
		const monthlyStatsRef = doc(db, "monthlyStats", monthId);
		await deleteDoc(monthlyStatsRef);

		// 2. rowdata에서 해당 년월의 모든 데이터 삭제
		const rowdataRef = collection(db, "rowdata");
		const q = query(
			rowdataRef,
			where("date", ">=", `${monthId}-01`),
			where("date", "<=", `${monthId}-31`),
		);
		const querySnapshot = await getDocs(q);

		// 배치 삭제를 위한 Promise 배열
		const deletePromises: Promise<void>[] = [];

		for (const docSnapshot of querySnapshot.docs) {
			deletePromises.push(deleteDoc(docSnapshot.ref));
		}

		// 모든 삭제 작업을 병렬로 실행
		await Promise.all(deletePromises);
	} catch (error) {
		throw new Error(`${monthId} 월 데이터 삭제에 실패했습니다.`);
	}
};
