import { Button, Input, Table } from "antd";
import type { InputRef } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useMemo, useRef } from "react";

export interface TableRow {
	date: string;
	group: string;
	d: string;
	e: string;
	m: number;
	n: number;
	o: number;
	p: string;
	[key: string]: unknown;
}

export function TransactionsTable({
	rows,
	loading,
	onVehicleClick,
}: {
	rows: TableRow[];
	loading: boolean;
	onVehicleClick: (vehicleNumber: string) => void;
}) {
	const searchInput = useRef<InputRef>(null);

	// 필터 옵션들을 메모이제이션 - rows가 바뀔 때만 재계산
	const { groupFilters, vehicleNumberFilters } = useMemo(() => {
		const groupFilters = Array.from(new Set(rows.map((row) => row.group))).map(
			(g) => ({
				text: g,
				value: g,
			}),
		);
		const vehicleNumberFilters = Array.from(
			new Set(rows.map((row) => row.d)),
		).map((d) => ({
			text: d,
			value: d,
		}));

		return { groupFilters, vehicleNumberFilters };
	}, [rows]);

	// 이벤트 핸들러들 메모이제이션
	const handleSearch = useCallback(
		(selectedKeys: string[], confirm: () => void, dataIndex: string) => {
			confirm();
		},
		[],
	);

	const handleReset = useCallback((clearFilters?: () => void) => {
		clearFilters?.();
	}, []);

	// 컬럼 정의를 메모이제이션 - 필터와 핸들러가 바뀔 때만 재생성
	const columns: ColumnsType<TableRow> = useMemo(
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
				filters: groupFilters,
				onFilter: (value, record) => record.group === value,
				sorter: (a, b) => a.group.localeCompare(b.group),
			},
			{
				title: "차량번호",
				dataIndex: "d",
				key: "d",
				filters: vehicleNumberFilters,
				sorter: (a, b) => a.d.localeCompare(b.d),
				filterDropdown: ({
					setSelectedKeys,
					selectedKeys,
					confirm,
					clearFilters,
				}) => (
					<div style={{ padding: 8 }}>
						<Input
							ref={searchInput}
							placeholder="차량번호 검색"
							value={selectedKeys[0]}
							onChange={(e) =>
								setSelectedKeys(e.target.value ? [e.target.value] : [])
							}
							onPressEnter={() =>
								handleSearch(selectedKeys as string[], confirm, "d")
							}
							style={{ marginBottom: 8, display: "block" }}
						/>
						<Button
							type="primary"
							onClick={() =>
								handleSearch(selectedKeys as string[], confirm, "d")
							}
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
							setTimeout(() => searchInput.current?.select(), 100);
						}
					},
				},
				onFilter: (value, record) =>
					record.d
						.toString()
						.toLowerCase()
						.includes((value as string).toLowerCase()),
				render: (d: string) => (
					<button
						type="button"
						style={{
							background: "none",
							border: "none",
							color: "#1677ff",
							cursor: "pointer",
							padding: 0,
						}}
						onClick={() => onVehicleClick(d)}
					>
						{d}
					</button>
				),
			},
			{
				title: "운송구간",
				dataIndex: "e",
				key: "e",
				sorter: (a, b) => a.e.localeCompare(b.e),
			},
			{
				title: "지급중량",
				dataIndex: "m",
				key: "m",
				sorter: (a, b) => a.m - b.m,
			},
			{
				title: "지급단가",
				dataIndex: "n",
				key: "n",
				sorter: (a, b) => a.n - b.n,
				render: (value: number) => Math.round(value).toLocaleString("ko-KR"),
			},
			{
				title: "금액",
				dataIndex: "o",
				key: "o",
				sorter: (a, b) => a.o - b.o,
				render: (value: number) => Math.round(value).toLocaleString("ko-KR"),
			},
			{
				title: "비고",
				dataIndex: "p",
				key: "p",
				sorter: (a, b) => (a.p || "").localeCompare(b.p || ""),
			},
		],
		[
			groupFilters,
			vehicleNumberFilters,
			handleSearch,
			handleReset,
			onVehicleClick,
		],
	);

	// 페이지네이션 설정 메모이제이션
	const paginationConfig = useMemo(
		() => ({
			pageSize: 10,
			showSizeChanger: true,
			showTotal: (total: number) => `${total}개`,
		}),
		[],
	);

	return (
		<Table
			columns={columns}
			dataSource={rows}
			rowKey={(row) => `${row.date}-${row.d}-${row.e}`}
			loading={loading}
			pagination={paginationConfig}
		/>
	);
}
