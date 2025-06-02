import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useGetFuelRecordsByDateQuery } from "../../../../features/fuel/api/fuel.api";
import { useGetRepairRecordsByDateQuery } from "../../../../features/repair/api/repair.api";
import RepairAndFuelTable from "./RepairAndFuelTable";
import SummaryCards from "./SummaryCards";
import type { FilteredData, RepairAndFuelRow } from "./types";

interface Props {
	yearMonth: string; // 'yyyy-mm'
}

const RepairAndFuelSection = ({ yearMonth }: Props) => {
	const { data: repairRecords = [], isLoading: repairLoading } =
		useGetRepairRecordsByDateQuery(yearMonth);
	const { data: fuelRecords = [], isLoading: fuelLoading } =
		useGetFuelRecordsByDateQuery(yearMonth);

	// 필터링된 데이터 상태 관리
	const [filteredData, setFilteredData] = useState<FilteredData>({
		filteredRows: [],
		totalRepairCost: 0,
		totalFuelCost: 0,
		totalCost: 0,
	});

	const rows: RepairAndFuelRow[] = useMemo(
		() =>
			[
				...repairRecords.map((r) => ({
					key: `repair-${r.id}`,
					date: `${r.year}/${r.month}/${r.day}`,
					group: r.group,
					vehicleNumber: r.vehicleNumber,
					descriptionOrFuelPrice: r.repairDescription,
					totalCost: r.repairCost,
					type: "repair" as const,
				})),
				...fuelRecords.map((f) => ({
					key: `fuel-${f.id}`,
					date: `${f.year}/${f.month}/${f.day}`,
					group: f.group,
					vehicleNumber: f.vehicleNumber,
					descriptionOrFuelPrice: f.fuelPrice
						? `${f.fuelPrice.toLocaleString()}원/L`
						: "",
					totalCost: f.totalFuelCost,
					type: "fuel" as const,
				})),
			].sort((a, b) => b.date.localeCompare(a.date)),
		[repairRecords, fuelRecords],
	);

	const handleFilteredDataChange = useCallback((data: FilteredData) => {
		setFilteredData(data);
	}, []);

	return (
		<div>
			<h2>
				정비 · 유류비{" "}
				<span style={{ fontWeight: 400, fontSize: 14, color: "#888" }}>
					기사님들이 직접 입력한 값입니다.
				</span>
			</h2>
			<SummaryCards
				totalCost={filteredData.totalCost}
				totalRepairCost={filteredData.totalRepairCost}
				totalFuelCost={filteredData.totalFuelCost}
			/>
			<RepairAndFuelTable
				rows={rows}
				loading={repairLoading || fuelLoading}
				onFilteredDataChange={handleFilteredDataChange}
			/>
		</div>
	);
};

export default RepairAndFuelSection;
