// src/pages/admin/DashboardPage/components/CostTable.tsx

import { Divider, Table } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import { cellStyle } from "../../../../styles";
import { useFuelRepairTable } from "../hooks/useFuelRepairTable";
import { CostSummary } from "./CostSummary";

interface CostTableProps {
	monthId: string;
}

interface TableRow {
	key: string;
	type: "fuel" | "repair";
	date: string;
	driversDbSupplier: string;
	vehicleNumber: string;
	detail: string;
	cost: number;
}

export function CostTable({ monthId }: CostTableProps) {
	const { tableRows, isLoading } = useFuelRepairTable(monthId);

	const initialData = useMemo(() => {
		return tableRows.map((row, index) => ({
			key: `${row.type}-${row.date}-${row.vehicleNumber}-${index}`,
			...row,
		}));
	}, [tableRows]);

	const [filteredRows, setFilteredRows] = useState<TableRow[]>([]);

	useEffect(() => {
		setFilteredRows(initialData);
	}, [initialData]);

	const dataSource = useMemo(() => {
		return tableRows.map((row, index) => ({
			key: `${row.type}-${row.date}-${row.vehicleNumber}-${index}`,
			...row,
		}));
	}, [tableRows]);

	const columns: TableColumnsType<TableRow> = [
		{
			title: "날짜",
			dataIndex: "date",
			sorter: (a, b) => a.date.localeCompare(b.date),
			ellipsis: true,
			onCell: () => ({ style: cellStyle }),
		},
		{
			title: "매입처",
			dataIndex: "driversDbSupplier",
			filters: Array.from(
				new Set(tableRows.map((row) => row.driversDbSupplier)),
			).map((group) => ({
				text: group,
				value: group,
			})),
			onFilter: (value, record) => record.driversDbSupplier === value,
			ellipsis: true,
			onCell: () => ({ style: cellStyle }),
		},
		{
			title: "차량번호",
			dataIndex: "vehicleNumber",
			filters: Array.from(
				new Set(tableRows.map((row) => row.vehicleNumber)),
			).map((vehicleNumber) => ({
				text: vehicleNumber,
				value: vehicleNumber,
			})),
			filterSearch: true,
			onFilter: (value, record) => record.vehicleNumber === value,
			ellipsis: true,
			onCell: () => ({ style: cellStyle }),
		},
		{
			title: "정비 내역 · 주유 단가",
			dataIndex: "detail",
			ellipsis: true,
			onCell: () => ({ style: cellStyle }),
		},
		{
			title: "총 비용",
			dataIndex: "cost",
			sorter: (a, b) => a.cost - b.cost,
			render: (cost: number) => `${cost.toLocaleString()}원`,
			ellipsis: true,
			onCell: () => ({ style: cellStyle }),
		},
	];

	const handleTableChange: TableProps<TableRow>["onChange"] = (
		_pagination,
		_filters,
		_sorter,
		extra,
	) => {
		// 필터링된 데이터를 상태로 저장
		setFilteredRows(extra.currentDataSource);
	};

	return (
		<>
			<CostSummary rows={filteredRows} />
			<Divider />
			<Table<TableRow>
				columns={columns}
				dataSource={dataSource}
				onChange={handleTableChange}
				loading={isLoading}
				pagination={{
					pageSize: 30,
					showSizeChanger: false,
					showQuickJumper: false,
					showTotal: (total) => `${total}개`,
				}}
			/>
		</>
	);
}
