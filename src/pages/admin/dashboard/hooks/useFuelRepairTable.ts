import dayjs from "dayjs";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../../../../lib/firebase";
import type { FuelRecord, RepairRecord } from "../../../../types/driverRecord";

interface DataState {
	fuel: FuelRecord[];
	repair: RepairRecord[];
}

export function useFuelRepairTable(monthId: string) {
	const [data, setData] = useState<DataState>({ fuel: [], repair: [] });
	const [isLoading, setIsLoading] = useState(true);
	const [loadedCollections, setLoadedCollections] = useState<Set<string>>(
		new Set(),
	);

	useEffect(() => {
		if (!monthId) return;

		const [year, month] = monthId.split("-").map(Number);
		const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).format(
			"YYYY-MM-DD",
		);
		const end = dayjs(start).endOf("month").format("YYYY-MM-DD");

		// 초기 상태 리셋
		setData({ fuel: [], repair: [] });
		setLoadedCollections(new Set());
		setIsLoading(true);

		// Fuel 데이터 실시간 구독
		const fuelQuery = query(
			collection(db, "fuel"),
			where("date", ">=", start),
			where("date", "<=", end),
		);
		const fuelUnsubscribe = onSnapshot(fuelQuery, (snapshot) => {
			const fuelData = snapshot.docs.map((doc) => ({
				...(doc.data() as FuelRecord),
				id: doc.id,
			}));
			setData((prev) => ({ ...prev, fuel: fuelData }));
			setLoadedCollections((prev) => {
				const newSet = new Set(prev);
				newSet.add("fuel");
				return newSet;
			});
		});

		// Repair 데이터 실시간 구독
		const repairQuery = query(
			collection(db, "repair"),
			where("date", ">=", start),
			where("date", "<=", end),
		);
		const repairUnsubscribe = onSnapshot(repairQuery, (snapshot) => {
			const repairData = snapshot.docs.map((doc) => ({
				...(doc.data() as RepairRecord),
				id: doc.id,
			}));
			setData((prev) => ({ ...prev, repair: repairData }));
			setLoadedCollections((prev) => {
				const newSet = new Set(prev);
				newSet.add("repair");
				return newSet;
			});
		});

		// 클린업 함수
		return () => {
			fuelUnsubscribe();
			repairUnsubscribe();
		};
	}, [monthId]);

	// 두 컬렉션 모두 로드되었는지 확인
	useEffect(() => {
		if (loadedCollections.size === 2) {
			setIsLoading(false);
		}
	}, [loadedCollections]);

	const tableRows = useMemo(() => {
		const fuelRows = data.fuel.map((f) => ({
			type: "fuel" as const,
			date: f.date,
			driversDbSupplier: f.driversDbSupplier,
			vehicleNumber: f.vehicleNumber,
			detail: f.unitPrice ? `${f.unitPrice.toLocaleString()}원` : "-",
			cost: f.totalFuelCost ?? 0,
		}));
		const repairRows = data.repair.map((r) => ({
			type: "repair" as const,
			date: r.date,
			driversDbSupplier: r.driversDbSupplier,
			vehicleNumber: r.vehicleNumber,
			detail: r.memo || "-",
			cost: r.repairCost ?? 0,
		}));
		return [...fuelRows, ...repairRows];
	}, [data]);

	return { tableRows, isLoading };
}
