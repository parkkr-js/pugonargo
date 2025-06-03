import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";

export function useMonthList() {
	const [months, setMonths] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const unsubscribe = onSnapshot(
			collection(db, "monthlyStats"),
			(snapshot) => {
				const monthList = snapshot.docs.map((doc) => doc.id).sort();
				setMonths(monthList);
				setIsLoading(false);
			},
			(error) => {
				setError(error as Error);
				setIsLoading(false);
			},
		);

		return () => unsubscribe();
	}, []);

	return { data: months, isLoading, error };
}
