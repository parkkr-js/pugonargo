import { Card, Col, Modal, Row, Statistic, Table } from "antd";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useVehicleFuelRepair } from "../hooks/useVehicleFuelRepair";

interface BaseRow {
	date: string;
	id?: string;
}

interface FuelRow extends BaseRow {
	type: "fuel";
	unitPrice: number;
	totalFuelCost: number;
	liter?: number;
}

interface RepairRow extends BaseRow {
	type: "repair";
	repairCost: number;
	memo: string;
}

type VehicleFuelRepairRow = FuelRow | RepairRow;

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

	// 합계 계산
	const totalCost = filteredRows.reduce((sum, r) => {
		if (r.type === "fuel") return sum + (r.totalFuelCost || 0);
		return sum + (r.repairCost || 0);
	}, 0);

	const totalRepair = filteredRows
		.filter((r): r is RepairRow => r.type === "repair")
		.reduce((sum, r) => sum + (r.repairCost || 0), 0);

	const totalFuel = filteredRows
		.filter((r): r is FuelRow => r.type === "fuel")
		.reduce((sum, r) => sum + (r.totalFuelCost || 0), 0);

	const columns = [
		{
			title: "날짜",
			dataIndex: "date",
			key: "date",
			sorter: (a: VehicleFuelRepairRow, b: VehicleFuelRepairRow) =>
				a.date.localeCompare(b.date),
			defaultSortOrder: "ascend" as const,
			render: (date: string) => {
				const d = dayjs(date);
				return d.isValid() ? d.format("YY.MM.DD") : date;
			},
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
		},
		{
			title: "총 비용",
			key: "cost",
			sorter: (a: VehicleFuelRepairRow, b: VehicleFuelRepairRow) => {
				const costA = a.type === "fuel" ? a.totalFuelCost : a.repairCost;
				const costB = b.type === "fuel" ? b.totalFuelCost : b.repairCost;
				return costA - costB;
			},
			render: (_: unknown, row: VehicleFuelRepairRow) => {
				const cost = row.type === "fuel" ? row.totalFuelCost : row.repairCost;
				return cost ? `${cost.toLocaleString("ko-KR")} 원` : "";
			},
		},
	];

	return (
		<Modal
			open={open}
			onCancel={onClose}
			title={`차량번호 ${vehicleNumber} 정비 · 유류비`}
			footer={null}
			width={700}
		>
			<div style={{ marginBottom: 16 }}>
				<Row gutter={16}>
					<Col span={8}>
						<Card>
							<Statistic
								title="총 비용"
								value={`${totalCost.toLocaleString("ko-KR")} 원`}
							/>
						</Card>
					</Col>
					<Col span={8}>
						<Card>
							<Statistic
								title="총 정비비용"
								value={`${totalRepair.toLocaleString("ko-KR")} 원`}
							/>
						</Card>
					</Col>
					<Col span={8}>
						<Card>
							<Statistic
								title="총 유류비"
								value={`${totalFuel.toLocaleString("ko-KR")} 원`}
							/>
						</Card>
					</Col>
				</Row>
			</div>
			<Table
				columns={columns}
				dataSource={filteredRows}
				rowKey={(row: VehicleFuelRepairRow): string =>
					row.id ||
					`${row.date}-${row.type}-${row.type === "fuel" ? row.totalFuelCost : row.repairCost}`
				}
				rowClassName={(row: VehicleFuelRepairRow) =>
					row.type === "fuel" ? "fuel-row" : "repair-row"
				}
				loading={isLoading}
				pagination={{
					pageSize: 10,
					showSizeChanger: false,
					showQuickJumper: false,
				}}
				size="middle"
			/>
		</Modal>
	);
}
