import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchFuelByMonth } from "../../../../services/dashboard/fetchFuelByMonth";
import { fetchRepairByMonth } from "../../../../services/dashboard/fetchRepairByMonth";
import type { FuelRecord } from "../../../driver/components/FuelRecordCard";
import type { RepairRecord } from "../../../driver/components/RepairRecordCard";

export function useFuelRepairTable(
	monthId: string,
	driversMap: Record<string, string> = {},
) {
	const [sortKey, setSortKey] = useState<string>("date");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [filter, setFilter] = useState<{
		date?: string;
		vehicleNumber?: string;
	}>({});

	const [year, month] = monthId.split("-").map(Number);
	const fuelQuery = useQuery({
		queryKey: ["fuel", monthId],
		queryFn: () => fetchFuelByMonth(year, month),
		enabled: !!monthId,
	});
	const repairQuery = useQuery({
		queryKey: ["repair", monthId],
		queryFn: () => fetchRepairByMonth(year, month),
		enabled: !!monthId,
	});

	const fuel = useMemo(
		() => (fuelQuery.data ?? []) as FuelRecord[],
		[fuelQuery.data],
	);
	const repair = useMemo(
		() => (repairQuery.data ?? []) as RepairRecord[],
		[repairQuery.data],
	);

	// fuel/repair를 테이블 row로 변환
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

	return {
		tableRows,
		totalRepair: repair.reduce((sum, r) => sum + (r.repairCost ?? 0), 0),
		totalFuel: fuel.reduce((sum, f) => sum + (f.totalFuelCost ?? 0), 0),
		totalCost:
			repair.reduce((sum, r) => sum + (r.repairCost ?? 0), 0) +
			fuel.reduce((sum, f) => sum + (f.totalFuelCost ?? 0), 0),
		sortKey,
		setSortKey,
		sortOrder,
		setSortOrder,
		filter,
		setFilter,
	};
}
