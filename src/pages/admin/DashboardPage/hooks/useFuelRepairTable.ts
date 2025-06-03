import dayjs from "dayjs";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../../../../lib/firebase";
import type { FuelRecord } from "../../../driver/components/FuelRecordCard";
import type { RepairRecord } from "../../../driver/components/RepairRecordCard";

export function useFuelRepairTable(
	monthId: string,
	driversMap: Record<string, string> = {},
) {
	const [fuel, setFuel] = useState<FuelRecord[]>([]);
	const [repair, setRepair] = useState<RepairRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!monthId) return;

		const [year, month] = monthId.split("-").map(Number);
		const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).format(
			"YYYY-MM-DD",
		);
		const end = dayjs(start).endOf("month").format("YYYY-MM-DD");

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
			setFuel(fuelData);
			setIsLoading(false);
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
			setRepair(repairData);
			setIsLoading(false);
		});

		// 클린업 함수
		return () => {
			fuelUnsubscribe();
			repairUnsubscribe();
		};
	}, [monthId]);

	const tableRows = useMemo(() => {
		const fuelRows = fuel.map((f) => ({
			type: "fuel" as const,
			date: f.date,
			group: driversMap[f.vehicleNumber] || "-",
			vehicleNumber: f.vehicleNumber,
			detail: f.unitPrice ? `${f.unitPrice.toLocaleString()}원` : "-",
			cost: f.totalFuelCost ?? 0,
		}));
		const repairRows = repair.map((r) => ({
			type: "repair" as const,
			date: r.date,
			group: driversMap[r.vehicleNumber] || "-",
			vehicleNumber: r.vehicleNumber,
			detail: r.memo || "-",
			cost: r.repairCost ?? 0,
		}));
		return [...fuelRows, ...repairRows];
	}, [fuel, repair, driversMap]);

	return { tableRows, isLoading };
}
