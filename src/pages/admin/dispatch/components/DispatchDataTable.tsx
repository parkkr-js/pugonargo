import { Card, Select, Space, Table, Tag, Typography } from "antd";
import type React from "react";
import { useState } from "react";
import type { DispatchData } from "../../../../services/dispatch/firebaseService";
import {
	useDispatchData,
	useDispatchDataByVehicleAndSupplier,
} from "../hooks/useDispatchData";

const { Title } = Typography;
const { Option } = Select;

interface DispatchDataTableProps {
	docId: string;
}

export const DispatchDataTable: React.FC<DispatchDataTableProps> = ({
	docId,
}) => {
	const [selectedSupplier, setSelectedSupplier] = useState<string>("");
	const [selectedVehicle, setSelectedVehicle] = useState<string>("");

	const { data: allDispatchData, isLoading } = useDispatchData(docId);
	const { data: filteredData } = useDispatchDataByVehicleAndSupplier(
		docId,
		selectedVehicle,
		selectedSupplier,
	);

	// 매입처와 차량번호 목록 추출
	const suppliers = [
		...new Set(allDispatchData?.map((item) => item.supplier) || []),
	];
	const vehicles = [
		...new Set(allDispatchData?.map((item) => item.vehicleNumber) || []),
	];

	// 표시할 데이터 결정
	const displayData =
		selectedSupplier && selectedVehicle ? filteredData : allDispatchData;

	const columns = [
		{
			title: "매입처",
			dataIndex: "supplier",
			key: "supplier",
			width: 120,
		},
		{
			title: "차량번호",
			dataIndex: "vehicleNumber",
			key: "vehicleNumber",
			width: 100,
		},
		{
			title: "배차타입",
			dataIndex: "dispatchType",
			key: "dispatchType",
			width: 100,
		},
		{
			title: "상차지",
			dataIndex: "loadingLocation",
			key: "loadingLocation",
			width: 150,
			render: (text: string, record: DispatchData) => (
				<div>
					<div>{text}</div>
					{record.loadingMemo && <Tag color="blue">{record.loadingMemo}</Tag>}
				</div>
			),
		},
		{
			title: "하차지",
			dataIndex: "unloadingLocation",
			key: "unloadingLocation",
			width: 150,
			render: (text: string, record: DispatchData) => (
				<div>
					<div>{text}</div>
					{record.unloadingMemo && (
						<Tag color="green">{record.unloadingMemo}</Tag>
					)}
				</div>
			),
		},
		{
			title: "로테이션",
			dataIndex: "rotationCount",
			key: "rotationCount",
			width: 80,
			render: (count: number) => (
				<Tag color={count > 0 ? "red" : "default"}>{count}회</Tag>
			),
		},
	];

	return (
		<Card title="배차 데이터" style={{ marginTop: 16 }}>
			<Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
				<Title level={5}>매입처 + 차량번호 조합으로 조회</Title>
				<Space>
					<Select
						placeholder="매입처 선택"
						style={{ width: 200 }}
						value={selectedSupplier}
						onChange={setSelectedSupplier}
						allowClear
					>
						{suppliers.map((supplier) => (
							<Option key={supplier} value={supplier}>
								{supplier}
							</Option>
						))}
					</Select>
					<Select
						placeholder="차량번호 선택"
						style={{ width: 150 }}
						value={selectedVehicle}
						onChange={setSelectedVehicle}
						allowClear
					>
						{vehicles.map((vehicle) => (
							<Option key={vehicle} value={vehicle}>
								{vehicle}
							</Option>
						))}
					</Select>
				</Space>
			</Space>

			<Table
				columns={columns}
				dataSource={displayData || []}
				rowKey={(record) =>
					`${record.supplier}-${record.vehicleNumber}-${record.loadingLocation}-${record.unloadingLocation}`
				}
				loading={isLoading}
				pagination={{
					pageSize: 20,
					showSizeChanger: true,
					showQuickJumper: true,
				}}
				scroll={{ x: 800 }}
				size="small"
			/>
		</Card>
	);
};
