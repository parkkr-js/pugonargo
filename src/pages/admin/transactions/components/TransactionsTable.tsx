import { Button, Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import { useMemo, useState } from "react";
import { cellStyle } from "../../../../styles";
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
			supplier: transaction.supplier,
			vehicleNumber: transaction.vehicleNumber,
			route: transaction.route,
			weight: transaction.weight,
			unitPrice: Math.round(transaction.unitPrice),
			amount: Math.round(transaction.amount),
			note: transaction.note,
			i: transaction.i,
		}));
	}, [transactions, isLoading]);

	const columns: ColumnsType<TableTransaction> = [
		{
			title: "날짜",
			dataIndex: "date",
			key: "date",
			sorter: (a, b) => a.date.localeCompare(b.date),
			ellipsis: true,
			onCell: () => ({ style: cellStyle }),
		},
		{
			title: "매입처",
			dataIndex: "supplier",
			key: "supplier",
			sorter: (a, b) => a.supplier.localeCompare(b.supplier),
			filters: Array.from(new Set(tableData.map((row) => row.supplier))).map(
				(supplier) => ({
					text: supplier,
					value: supplier,
				}),
			),
			filterSearch: true,
			onFilter: (value, record) => record.supplier === value,
			ellipsis: true,
			onCell: () => ({ style: cellStyle }),
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
			ellipsis: true,
			onCell: () => ({ style: cellStyle }),
			render: (vehicleNumber, record) => {
				const driverData = driversMap[vehicleNumber];
				const hasMatchingDriver =
					driverData &&
					driverData.driversDbSupplier === record.supplier &&
					driverData.vehicleNumber === vehicleNumber;

				return (
					<Button
						type="link"
						onClick={() => {
							setSelectedVehicle(vehicleNumber);
							setModalOpen(true);
						}}
						disabled={!hasMatchingDriver}
						style={{ color: hasMatchingDriver ? "inherit" : "#999" }}
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
			filters: Array.from(new Set(tableData.map((row) => row.route))).map(
				(route) => ({
					text: route,
					value: route,
				}),
			),
			filterSearch: true,
			onFilter: (value, record) => record.route === value,
			ellipsis: true,
			onCell: () => ({ style: cellStyle }),
		},
		{
			title: "지급중량",
			dataIndex: "weight",
			key: "weight",
			sorter: (a, b) => a.weight - b.weight,
			render: (weight) => weight.toLocaleString(),
			ellipsis: true,
			onCell: () => ({ style: cellStyle }),
		},
		{
			title: "지급단가",
			dataIndex: "unitPrice",
			key: "unitPrice",
			sorter: (a, b) => a.unitPrice - b.unitPrice,
			render: (unitPrice) => unitPrice.toLocaleString(),
			ellipsis: true,
			onCell: () => ({ style: cellStyle }),
		},
		{
			title: "금액",
			dataIndex: "amount",
			key: "amount",
			sorter: (a, b) => a.amount - b.amount,
			render: (amount) => amount.toLocaleString(),
			ellipsis: true,
			onCell: () => ({ style: cellStyle }),
		},
		{
			title: "비고",
			dataIndex: "note",
			key: "note",
			ellipsis: true,
			onCell: () => ({ style: cellStyle }),
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
					pageSize: 30,
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
