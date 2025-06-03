import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TablePaginationConfig } from "antd/es/table";
import type { FilterValue } from "antd/es/table/interface";
import { useEffect, useMemo, useState } from "react";

interface CostTableRow {
	type: "fuel" | "repair";
	date: string;
	group: string;
	vehicleNumber: string;
	detail: string;
	cost: number;
}

interface CostTableProps {
	rows: CostTableRow[];
	onFilteredRowsChange?: (filteredRows: CostTableRow[]) => void;
}

export function CostTable({ rows, onFilteredRowsChange }: CostTableProps) {
	const [filteredInfo, setFilteredInfo] = useState<
		Record<string, FilterValue | null>
	>({});

	const handleChange = (
		pagination: TablePaginationConfig,
		filters: Record<string, FilterValue | null>,
	) => {
		setFilteredInfo(filters);
	};

	const vehicleNumberFilters = useMemo(() => {
		const uniqueNumbers = Array.from(
			new Set(rows.map((row) => row.vehicleNumber)),
		);
		return uniqueNumbers.map((number) => ({
			text: number,
			value: number,
		}));
	}, [rows]);

	const dateFilters = useMemo(() => {
		const uniqueDates = Array.from(new Set(rows.map((row) => row.date)));
		return uniqueDates.map((date) => ({
			text: date,
			value: date,
		}));
	}, [rows]);

	const columns: ColumnsType<CostTableRow> = [
		{
			title: "Date.",
			dataIndex: "date",
			key: "date",
			sorter: (a, b) => a.date.localeCompare(b.date),
			filters: dateFilters,
			filteredValue: filteredInfo.date || null,
			onFilter: (value, record) => record.date === value,
		},
		{
			title: "그룹",
			dataIndex: "group",
			key: "group",
			sorter: (a, b) => a.group.localeCompare(b.group),
		},
		{
			title: "차량번호",
			dataIndex: "vehicleNumber",
			key: "vehicleNumber",
			sorter: (a, b) => a.vehicleNumber.localeCompare(b.vehicleNumber),
			filters: vehicleNumberFilters,
			filteredValue: filteredInfo.vehicleNumber || null,
			onFilter: (value, record) => record.vehicleNumber === value,
		},
		{
			title: "정비 내역 · 주유 단가",
			dataIndex: "detail",
			key: "detail",
		},
		{
			title: "총 비용",
			dataIndex: "cost",
			key: "cost",
			sorter: (a, b) => a.cost - b.cost,
			render: (cost: number) => `${cost.toLocaleString()} 원`,
		},
	];

	const dataSource = useMemo(() => {
		return rows.map((row, index) => ({
			...row,
			key: `${row.type}-${row.date}-${row.vehicleNumber}-${index}`,
		}));
	}, [rows]);

	// 필터링된 데이터가 변경될 때마다 부모 컴포넌트에 알림
	useEffect(() => {
		if (onFilteredRowsChange) {
			const filteredRows = dataSource.filter((row) => {
				const dateFilter = filteredInfo.date;
				const vehicleNumberFilter = filteredInfo.vehicleNumber;

				const matchesDate = !dateFilter || dateFilter.includes(row.date);
				const matchesVehicleNumber =
					!vehicleNumberFilter ||
					vehicleNumberFilter.includes(row.vehicleNumber);

				return matchesDate && matchesVehicleNumber;
			});

			onFilteredRowsChange(filteredRows);
		}
	}, [dataSource, filteredInfo, onFilteredRowsChange]);

	return (
		<div
			style={{
				background: "#fff",
				borderRadius: 12,
				boxShadow: "0 1px 4px 0 rgba(0,0,0,0.03)",
				padding: 16,
			}}
		>
			<Table
				columns={columns}
				dataSource={dataSource}
				pagination={false}
				onChange={handleChange}
			/>
		</div>
	);
}
