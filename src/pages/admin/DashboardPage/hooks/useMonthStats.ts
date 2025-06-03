import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";

export function useMonthStats(monthId: string) {
	const [data, setData] = useState<{ totalI: number; totalO: number } | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!monthId) {
			setData(null);
			setIsLoading(false);
			return;
		}

		const unsubscribe = onSnapshot(
			doc(db, "monthlyStats", monthId),
			(doc) => {
				if (!doc.exists()) {
					setData(null);
				} else {
					const stats = doc.data();
					setData({
						totalI: stats.totalI ?? 0,
						totalO: stats.totalO ?? 0,
					});
				}
				setIsLoading(false);
			},
			(error) => {
				setError(error as Error);
				setIsLoading(false);
			},
		);

		return () => unsubscribe();
	}, [monthId]);

	return { data, isLoading, error };
}
