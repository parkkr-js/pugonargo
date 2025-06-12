import { Button, Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import { useMemo, useState } from "react";
import type { TableTransaction } from "../../../../types/transaction";
import { useDriversMap } from "../hooks/useDriversMap";
import { useTransactions } from "../hooks/useTransactions";
import { SummaryCards } from "./SummaryCards";
import { VehicleFuelRepairModal } from "./VehicleFuelRepairModal";

export const TransactionsTable = ({
	startDate,
	endDate,
}: {
	startDate: string;
	endDate: string;
}) => {
	const [filteredData, setFilteredData] = useState<TableTransaction[]>([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

	const { data: transactions = [], isLoading: isTransactionsLoading } =
		useTransactions(startDate, endDate);
	const { data: driversMap = {}, isLoading: isDriversLoading } =
		useDriversMap();

	const isLoading = isTransactionsLoading || isDriversLoading;

	const tableData = useMemo(() => {
		if (isLoading) return [];

		return transactions.map((transaction) => ({
			key: transaction.id,
			date: transaction.date,
			group: driversMap[transaction.vehicleNumber] || null,
			vehicleNumber: transaction.vehicleNumber,
			route: transaction.route,
			weight: transaction.weight,
			unitPrice: Math.round(transaction.unitPrice),
			amount: Math.round(transaction.amount),
			note: transaction.note,
			i: transaction.i,
		}));
	}, [transactions, driversMap, isLoading]);

	const columns: ColumnsType<TableTransaction> = [
		{
			title: "날짜",
			dataIndex: "date",
			key: "date",
			sorter: (a, b) => a.date.localeCompare(b.date),
			width: "15%",
		},
		{
			title: "그룹",
			dataIndex: "group",
			key: "group",
			filters: Array.from(
				new Set(tableData.map((row) => row.group).filter(Boolean)),
			).map((group) => ({
				text: group || "-",
				value: group || "-",
			})),
			onFilter: (value, record) => record.group === value,
			width: "10%",
		},
		{
			title: "차량번호",
			dataIndex: "vehicleNumber",
			key: "vehicleNumber",
			filters: Array.from(
				new Set(tableData.map((row) => row.vehicleNumber)),
			).map((vehicle) => ({
				text: vehicle,
				value: vehicle,
			})),
			filterSearch: true,
			onFilter: (value, record) => record.vehicleNumber === value,
			width: "10%",
			render: (vehicleNumber, record) => {
				const hasGroup = record.group !== "-" && record.group !== null;
				return (
					<Button
						type="link"
						onClick={() => {
							setSelectedVehicle(vehicleNumber);
							setModalOpen(true);
						}}
						disabled={!hasGroup}
						style={{ color: hasGroup ? "inherit" : "#999" }}
					>
						{vehicleNumber}
					</Button>
				);
			},
		},
		{
			// 컬럼의 제목 설정
			title: "운송구간",

			// 테이블 데이터에서 표시할 필드명 지정
			dataIndex: "route",

			// React에서 리스트 렌더링을 위한 고유 키 지정
			key: "route",

			// 정렬 함수: 문자열 비교를 위해 localeCompare 사용
			// a.route와 b.route를 비교하여 알파벳/한글 순서로 정렬
			sorter: (a, b) => a.route.localeCompare(b.route),

			// 필터 옵션 생성
			// 1. tableData.map으로 모든 route 값 추출
			// 2. new Set으로 중복 제거
			// 3. Array.from으로 Set을 배열로 변환
			// 4. map으로 antd Table 필터 형식({text, value})으로 변환
			filters: Array.from(new Set(tableData.map((row) => row.route))).map(
				(route) => ({
					text: route, // 필터 드롭다운에 표시될 텍스트
					value: route, // 실제 필터링에 사용될 값
				}),
			),

			// 필터 드롭다운에 검색 기능 활성화
			filterSearch: true,

			// 필터 적용 시 실행될 함수
			// value: 선택된 필터 값
			// record: 현재 행의 데이터
			// record.route가 선택된 value와 일치하는지 확인
			onFilter: (value, record) => record.route === value,
			width: "20%",
		},
		{
			title: "지급중량",
			dataIndex: "weight",
			key: "weight",
			sorter: (a, b) => a.weight - b.weight,
			render: (weight) => weight.toLocaleString(),
			width: "10%",
		},
		{
			title: "지급단가",
			dataIndex: "unitPrice",
			key: "unitPrice",
			sorter: (a, b) => a.unitPrice - b.unitPrice,
			render: (unitPrice) => unitPrice.toLocaleString(),
			width: "10%",
		},
		{
			title: "금액",
			dataIndex: "amount",
			key: "amount",
			sorter: (a, b) => a.amount - b.amount,
			render: (amount) => amount.toLocaleString(),
			width: "10%",
		},
		{
			title: "비고",
			dataIndex: "note",
			key: "note",
			width: "15%",
		},
	];

	const handleTableChange: TableProps<TableTransaction>["onChange"] = (
		_pagination,
		_filters,
		_sorter,
		extra,
	) => {
		setFilteredData(extra.currentDataSource);
	};

	const handleModalClose = () => {
		setModalOpen(false);
		setSelectedVehicle(null);
	};

	return (
		<>
			<SummaryCards data={filteredData.length > 0 ? filteredData : tableData} />
			<Table
				columns={columns}
				dataSource={tableData}
				onChange={handleTableChange}
				loading={isLoading}
				scroll={{ x: true }}
				pagination={{
					pageSize: 10,
					showSizeChanger: false,
					showQuickJumper: false,
					showTotal: (total) => `${total}개`,
				}}
			/>
			{selectedVehicle && (
				<VehicleFuelRepairModal
					open={modalOpen}
					onClose={handleModalClose}
					vehicleNumber={selectedVehicle}
				/>
			)}
		</>
	);
};
