import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";

interface DriverInfo {
	name: string;
	group: string;
}

export function useDriversMap() {
	const [driversMap, setDriversMap] = useState<Record<string, DriverInfo>>({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const unsubscribe = onSnapshot(
			collection(db, "drivers"),
			(snapshot) => {
				const map: Record<string, DriverInfo> = {};
				for (const doc of snapshot.docs) {
					const data = doc.data();
					if (data.vehicleNumber) {
						map[data.vehicleNumber] = {
							name: data.name,
							group: data.group || "-",
						};
					}
				}
				setDriversMap(map);
				setIsLoading(false);
			},
			(error) => {
				setError(error as Error);
				setIsLoading(false);
			},
		);

		return () => unsubscribe();
	}, []);

	return { data: driversMap, isLoading, error };
}
