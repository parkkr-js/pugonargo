import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { MonthlyStatsListItem } from "../../types/dataManagement";

export const fetchMonthlyStats = async (): Promise<MonthlyStatsListItem[]> => {
	try {
		const monthlyStatsRef = collection(db, "monthlyStats");
		const q = query(monthlyStatsRef, orderBy("id", "desc"));
		const querySnapshot = await getDocs(q);

		const monthlyStats: MonthlyStatsListItem[] = [];
		for (const doc of querySnapshot.docs) {
			const data = doc.data();
			monthlyStats.push({
				id: data.id,
				recordCount: data.recordCount,
			});
		}

		return monthlyStats;
	} catch (error) {
		throw new Error("월별 통계 데이터 조회에 실패했습니다.");
	}
};
