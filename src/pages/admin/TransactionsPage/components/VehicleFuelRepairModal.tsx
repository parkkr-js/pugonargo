import { Modal, Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import styled from "styled-components";
import type {
	FuelRow,
	RepairRow,
	VehicleFuelRepairRow,
	VehicleFuelRepairSummary,
} from "../../../../types/transaction";
import { useVehicleFuelRepair } from "../hooks/useVehicleFuelRepair";

interface Props {
	vehicleNumber: string;
	open: boolean;
	onClose: () => void;
}

export function VehicleFuelRepairModal({
	vehicleNumber,
	open,
	onClose,
}: Props) {
	const [filteredData, setFilteredData] = useState<VehicleFuelRepairRow[]>([]);
	const { data = [], isLoading } = useVehicleFuelRepair(vehicleNumber, open);

	const filteredRows = useMemo(() => {
		return data.map((row) => {
			if (row.type === "fuel") {
				return {
					type: "fuel" as const,
					date: row.date,
					unitPrice: row.unitPrice,
					totalFuelCost: row.totalFuelCost,
					liter: row.liter,
					id: row.id,
				};
			}
			return {
				type: "repair" as const,
				date: row.date,
				repairCost: row.repairCost,
				memo: row.memo,
				id: row.id,
			};
		}) as VehicleFuelRepairRow[];
	}, [data]);

	const summary = useMemo<VehicleFuelRepairSummary>(() => {
		const rows = filteredData.length > 0 ? filteredData : filteredRows;
		const totalCost = rows.reduce((sum, r) => {
			if (r.type === "fuel") return sum + (r.totalFuelCost || 0);
			return sum + (r.repairCost || 0);
		}, 0);

		const totalRepair = rows
			.filter((r): r is RepairRow => r.type === "repair")
			.reduce((sum, r) => sum + (r.repairCost || 0), 0);

		const totalFuel = rows
			.filter((r): r is FuelRow => r.type === "fuel")
			.reduce((sum, r) => sum + (r.totalFuelCost || 0), 0);

		return { totalCost, totalRepair, totalFuel };
	}, [filteredData, filteredRows]);

	const columns: ColumnsType<VehicleFuelRepairRow> = [
		{
			title: "날짜",
			dataIndex: "date",
			key: "date",
			sorter: (a, b) => a.date.localeCompare(b.date),
			defaultSortOrder: "ascend",
			render: (date: string) => {
				const d = dayjs(date);
				return d.isValid() ? d.format("YY.MM.DD") : date;
			},
			filters: Array.from(
				new Set(filteredRows.map((row) => dayjs(row.date).format("YYYY-MM"))),
			).map((month) => ({
				text: month,
				value: month,
			})),
			onFilter: (value, record) =>
				dayjs(record.date).format("YYYY-MM") === value,
			width: "15%",
		},
		{
			title: "정비 · 유류비",
			dataIndex: "type",
			key: "type",
			render: (_: unknown, row: VehicleFuelRepairRow) => {
				if (row.type === "fuel") {
					return `유류비 (${row.unitPrice.toLocaleString("ko-KR")}원/L)`;
				}
				return `정비비 (${row.memo})`;
			},
			width: "35%",
		},
		{
			title: "총 비용",
			key: "cost",
			sorter: (a, b) => {
				const costA = a.type === "fuel" ? a.totalFuelCost : a.repairCost;
				const costB = b.type === "fuel" ? b.totalFuelCost : b.repairCost;
				return costA - costB;
			},
			render: (_: unknown, row: VehicleFuelRepairRow) => {
				const cost = row.type === "fuel" ? row.totalFuelCost : row.repairCost;
				return cost ? `${cost.toLocaleString("ko-KR")} 원` : "";
			},
			width: "20%",
		},
	];

	const handleTableChange: TableProps<VehicleFuelRepairRow>["onChange"] = (
		_pagination,
		_filters,
		_sorter,
		extra,
	) => {
		setFilteredData(extra.currentDataSource);
	};

	return (
		<Modal
			open={open}
			onCancel={onClose}
			title={`차량번호 ${vehicleNumber} 정비 · 유류비`}
			footer={null}
			width={800}
		>
			<ModalContent>
				<CardRow>
					<StatCard>
						<StatLabel>총 비용</StatLabel>
						<StatValue>
							{summary.totalCost.toLocaleString("ko-KR")} 원
						</StatValue>
					</StatCard>
					<Operator>=</Operator>
					<StatCard>
						<StatLabel>총 정비비용</StatLabel>
						<StatValue>
							{summary.totalRepair.toLocaleString("ko-KR")} 원
						</StatValue>
					</StatCard>
					<Operator>+</Operator>
					<StatCard>
						<StatLabel>총 유류비</StatLabel>
						<StatValue>
							{summary.totalFuel.toLocaleString("ko-KR")} 원
						</StatValue>
					</StatCard>
				</CardRow>
				<TableContainer>
					<Table
						columns={columns}
						dataSource={filteredRows}
						onChange={handleTableChange}
						rowKey={(row: VehicleFuelRepairRow): string =>
							row.id ||
							`${row.date}-${row.type}-${
								row.type === "fuel" ? row.totalFuelCost : row.repairCost
							}`
						}
						rowClassName={(row: VehicleFuelRepairRow) =>
							row.type === "fuel" ? "fuel-row" : "repair-row"
						}
						loading={isLoading}
						pagination={{
							pageSize: 10,
							showSizeChanger: false,
							showQuickJumper: false,
							showTotal: (total) => `${total}개`,
						}}
						size="middle"
					/>
				</TableContainer>
			</ModalContent>
		</Modal>
	);
}

const CardRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	margin-bottom: 24px;
`;

const StatCard = styled.div`
	background: white;
	border-radius: 8px;
	padding: 12px 16px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	position: relative;
	min-width: 180px;
`;

const StatLabel = styled.div`
	color: ${({ theme }) => theme.colors.gray[600]};
	font-size: ${({ theme }) => theme.fontSizes.sm};
	margin-bottom: 8px;
`;

const StatValue = styled.div`
	color: ${({ theme }) => theme.colors.gray[900]};
	font-size: ${({ theme }) => theme.fontSizes.xl};
	font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const Operator = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xl};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	color: ${({ theme }) => theme.colors.gray[400]};
	margin: 0 4px;
	display: flex;
	align-items: center;
	height: 100%;
`;

const ModalContent = styled.div`
	height: 600px;
	padding: 8px;
	display: flex;
	flex-direction: column;
`;

const TableContainer = styled.div`
	flex: 1;
	overflow: auto;
	padding: 0 8px;
`;
