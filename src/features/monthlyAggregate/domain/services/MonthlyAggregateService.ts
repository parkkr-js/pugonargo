// import { doc, getDoc, setDoc } from "firebase/firestore";
// import { db } from "../../firebase/firebaseConfig";
// import type { MonthlyAggregate } from "./types";

// export const monthlyAggregateApi = {
// 	async save(monthlyAggregate: MonthlyAggregate): Promise<void> {
// 		const docRef = doc(
// 			db,
// 			"monthlyAggregates",
// 			`${monthlyAggregate.year}-${monthlyAggregate.month}`,
// 		);
// 		await setDoc(docRef, monthlyAggregate);
// 	},

// 	async findByYearAndMonth(
// 		year: string,
// 		month: string,
// 	): Promise<MonthlyAggregate | null> {
// 		const docRef = doc(db, "monthlyAggregates", `${year}-${month}`);
// 		const docSnap = await getDoc(docRef);

// 		if (docSnap.exists()) {
// 			return docSnap.data() as MonthlyAggregate;
// 		}

// 		return null;
// 	},
// };
export {};
