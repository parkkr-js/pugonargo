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
			unitPrice: transaction.unitPrice,
			amount: transaction.amount,
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
			title: "운송구간",
			dataIndex: "route",
			key: "route",
			sorter: (a, b) => a.route.localeCompare(b.route),
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
