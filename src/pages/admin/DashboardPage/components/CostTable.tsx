import { Button, Input, Table } from "antd";
import type { InputRef } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TablePaginationConfig } from "antd/es/table";
import type { FilterValue } from "antd/es/table/interface";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

	const vehicleSearchInput = useRef<InputRef>(null);

	// 핸들러들 메모이제이션
	const handleChange = useCallback(
		(
			pagination: TablePaginationConfig,
			filters: Record<string, FilterValue | null>,
		) => {
			setFilteredInfo(filters);
		},
		[],
	);

	const handleSearch = useCallback(
		(selectedKeys: string[], confirm: () => void) => {
			confirm();
		},
		[],
	);

	const handleReset = useCallback((clearFilters?: () => void) => {
		clearFilters?.();
	}, []);

	// 필터 옵션들 메모이제이션
	const { vehicleNumberFilters } = useMemo(() => {
		const vehicleNumberFilters = Array.from(
			new Set(rows.map((row) => row.vehicleNumber)),
		).map((number) => ({
			text: number,
			value: number,
		}));

		const dateFilters = Array.from(new Set(rows.map((row) => row.date))).map(
			(date) => ({
				text: date,
				value: date,
			}),
		);

		return { vehicleNumberFilters, dateFilters };
	}, [rows]);

	// 컬럼 정의 메모이제이션
	const columns: ColumnsType<CostTableRow> = useMemo(
		() => [
			{
				title: "날짜",
				dataIndex: "date",
				key: "date",
				sorter: (a, b) => a.date.localeCompare(b.date),
				render: (date: string) => {
					// YYYY-MM-DD 형태를 YY.MM.DD로 변환
					const dateObj = new Date(date);
					const year = dateObj.getFullYear().toString().slice(-2);
					const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
					const day = dateObj.getDate().toString().padStart(2, "0");
					return `${year}.${month}.${day}`;
				},
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
				filterDropdown: ({
					setSelectedKeys,
					selectedKeys,
					confirm,
					clearFilters,
				}) => (
					<div style={{ padding: 8 }}>
						<Input
							ref={vehicleSearchInput}
							placeholder="차량번호 검색"
							value={selectedKeys[0]}
							onChange={(e) =>
								setSelectedKeys(e.target.value ? [e.target.value] : [])
							}
							onPressEnter={() =>
								handleSearch(selectedKeys as string[], confirm)
							}
							style={{ marginBottom: 8, display: "block" }}
						/>
						<Button
							type="primary"
							onClick={() => handleSearch(selectedKeys as string[], confirm)}
							size="small"
							style={{ width: 90, marginRight: 8 }}
						>
							검색
						</Button>
						<Button
							onClick={() => handleReset(clearFilters)}
							size="small"
							style={{ width: 90 }}
						>
							초기화
						</Button>
					</div>
				),
				filterIcon: (filtered: boolean) => (
					<span style={{ color: filtered ? "#1677ff" : undefined }}>🔍</span>
				),
				filterDropdownProps: {
					onOpenChange: (visible: boolean) => {
						if (visible) {
							setTimeout(() => vehicleSearchInput.current?.select(), 100);
						}
					},
				},
				onFilter: (value, record) =>
					record.vehicleNumber
						.toString()
						.toLowerCase()
						.includes((value as string).toLowerCase()),
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
				render: (cost: number) => `${cost.toLocaleString("ko-KR")} 원`,
			},
		],
		[vehicleNumberFilters, filteredInfo, handleSearch, handleReset],
	);

	// 데이터소스 메모이제이션
	const dataSource = useMemo(() => {
		return rows.map((row, index) => ({
			...row,
			key: `${row.type}-${row.date}-${row.vehicleNumber}-${index}`,
		}));
	}, [rows]);

	// 페이지네이션 설정 메모이제이션
	const paginationConfig = useMemo(
		() => ({
			pageSize: 10,
			showSizeChanger: true,
			showTotal: (total: number) => `${total}개`,
		}),
		[],
	);

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
				pagination={paginationConfig}
				onChange={handleChange}
			/>
		</div>
	);
}
