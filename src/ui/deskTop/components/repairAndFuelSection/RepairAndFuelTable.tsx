import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type React from "react";
import { useCallback, useEffect, useMemo } from "react";
import type { FilteredData, RepairAndFuelRow } from "./types";

interface Props {
	rows: RepairAndFuelRow[];
	loading: boolean;
	onFilteredDataChange: (data: FilteredData) => void;
}

const RepairAndFuelTable = ({ rows, loading, onFilteredDataChange }: Props) => {
	// 동적 필터링 값 생성
	const groupFilters = useMemo(
		() =>
			Array.from(new Set(rows.map((r) => r.group)))
				.filter(Boolean)
				.map((g) => ({ text: g, value: g })),
		[rows],
	);

	const vehicleFilters = useMemo(
		() =>
			Array.from(new Set(rows.map((r) => r.vehicleNumber)))
				.filter(Boolean)
				.map((v) => ({ text: v, value: v })),
		[rows],
	);

	const dateFilters = useMemo(
		() =>
			Array.from(new Set(rows.map((r) => r.date)))
				.filter(Boolean)
				.sort((a, b) => b.localeCompare(a)) // 최신 날짜 우선
				.map((d) => ({ text: d, value: d })),
		[rows],
	);

	const columns: ColumnsType<RepairAndFuelRow> = [
		{
			title: "Date",
			dataIndex: "date",
			sorter: (a, b) => a.date.localeCompare(b.date),
			filters: dateFilters,
			onFilter: (value, record) => record.date === value,
			filterSearch: true,
		},
		{
			title: "그룹",
			dataIndex: "group",
			filters: groupFilters,
			onFilter: (value, record) => record.group === value,
			sorter: (a, b) => a.group.localeCompare(b.group),
		},
		{
			title: "차량번호",
			dataIndex: "vehicleNumber",
			sorter: (a, b) => a.vehicleNumber.localeCompare(b.vehicleNumber),
			filters: vehicleFilters,
			onFilter: (value, record) => record.vehicleNumber === value,
			filterSearch: true,
		},
		{
			title: "정비 내역 · 주유 단가",
			dataIndex: "descriptionOrFuelPrice",
			sorter: (a, b) =>
				a.descriptionOrFuelPrice.localeCompare(b.descriptionOrFuelPrice),
		},
		{
			title: "총 비용",
			dataIndex: "totalCost",
			sorter: (a, b) => (a.totalCost || 0) - (b.totalCost || 0),
			render: (v) => (v ? `${v.toLocaleString()} 원` : ""),
		},
	];

	// 필터링된 데이터 계산 함수
	const calculateFilteredData = useCallback(
		(filteredRows: RepairAndFuelRow[]): FilteredData => {
			const totalRepairCost = filteredRows
				.filter((row) => row.type === "repair")
				.reduce((sum, row) => sum + (row.totalCost || 0), 0);

			const totalFuelCost = filteredRows
				.filter((row) => row.type === "fuel")
				.reduce((sum, row) => sum + (row.totalCost || 0), 0);

			return {
				filteredRows,
				totalRepairCost,
				totalFuelCost,
				totalCost: totalRepairCost + totalFuelCost,
			};
		},
		[],
	);

	// 테이블 필터/정렬 변경 시 호출
	const handleTableChange: TableProps<RepairAndFuelRow>["onChange"] = (
		pagination,
		filters,
		sorter,
		extra,
	) => {
		const filteredData = calculateFilteredData(extra.currentDataSource || []);
		onFilteredDataChange(filteredData);
	};

	// 초기 데이터 전달
	useEffect(() => {
		const initialData = calculateFilteredData(rows);
		onFilteredDataChange(initialData);
	}, [rows, onFilteredDataChange, calculateFilteredData]);

	return (
		<Table
			columns={columns}
			dataSource={rows}
			loading={loading}
			pagination={{ pageSize: 10 }}
			rowKey="key"
			onChange={handleTableChange}
		/>
	);
};

export default RepairAndFuelTable;
