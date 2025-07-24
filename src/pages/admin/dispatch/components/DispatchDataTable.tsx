import { Card, Select, Table, Tag } from "antd";
import type React from "react";
import { useState } from "react";
import { cellStyle } from "../../../../styles";
import type {
	DispatchData,
	DispatchDataTableProps,
} from "../../../../types/dispatch";
import {
	useDispatchData,
	useDispatchDataByVehicleAndSupplier,
} from "../hooks/useDispatchData";

const { Option } = Select;

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

	// 텍스트 개행 처리 함수
	const formatTextWithLineBreaks = (text: string) => {
		const lines = text.split("\n");
		return lines.map((line, index) => (
			<div
				key={`line-${line.length}-${line.substring(0, 10)}-${index}`}
				style={{
					marginBottom: index < lines.length - 1 ? "4px" : 0,
				}}
			>
				{line}
			</div>
		));
	};

	const columns = [
		{
			title: "매입처",
			dataIndex: "supplier",
			key: "supplier",
			width: 60,
			render: (text: string) => (
				<div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
					{formatTextWithLineBreaks(text)}
				</div>
			),
			onCell: () => ({ style: cellStyle }),
		},
		{
			title: "차량번호",
			dataIndex: "vehicleNumber",
			key: "vehicleNumber",
			width: 70,
			render: (text: string) => (
				<div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
					{formatTextWithLineBreaks(text)}
				</div>
			),
			onCell: () => ({ style: cellStyle }),
		},
		{
			title: "배차타입",
			dataIndex: "dispatchType",
			key: "dispatchType",
			width: 60,
			render: (text: string) => (
				<div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
					{formatTextWithLineBreaks(text)}
				</div>
			),
			onCell: () => ({ style: cellStyle }),
		},
		{
			title: "상차지",
			dataIndex: "loadingLocation",
			key: "loadingLocation",
			width: 120,
			render: (text: string, record: DispatchData) => (
				<div>
					<div
						style={{
							whiteSpace: "pre-wrap",
							wordBreak: "break-word",
							marginBottom: "4px",
						}}
					>
						{formatTextWithLineBreaks(text)}
					</div>
					{record.loadingMemo && (
						<Tag
							color="blue"
							style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
						>
							{formatTextWithLineBreaks(record.loadingMemo)}
						</Tag>
					)}
				</div>
			),
			onCell: () => ({ style: cellStyle }),
		},
		{
			title: "하차지",
			dataIndex: "unloadingLocation",
			key: "unloadingLocation",
			width: 120,
			render: (text: string, record: DispatchData) => (
				<div>
					<div
						style={{
							whiteSpace: "pre-wrap",
							wordBreak: "break-word",
							marginBottom: "4px",
						}}
					>
						{formatTextWithLineBreaks(text)}
					</div>
					{record.unloadingMemo && (
						<Tag
							color="green"
							style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
						>
							{formatTextWithLineBreaks(record.unloadingMemo)}
						</Tag>
					)}
				</div>
			),
			onCell: () => ({ style: cellStyle }),
		},
		{
			title: "회전 수",
			dataIndex: "rotationCount",
			key: "rotationCount",
			width: 40,
			render: (count: number) => (
				<Tag color={count > 0 ? "red" : "default"}>{count}회</Tag>
			),
			onCell: () => ({ style: cellStyle }),
		},
	];

	// docId를 날짜 형식으로 변환 (YYYY-MM-DD -> YYYY년 MM월 DD일)
	const formatDate = (docId: string) => {
		const date = new Date(docId);
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		return `${year}년 ${month}월 ${day}일`;
	};

	return (
		<Card
			title={`배차 데이터 (${formatDate(docId)})`}
			extra={
				<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
					<div
						style={{
							fontSize: "12px",
							color: "#666",
							fontWeight: "normal",
							marginRight: "8px",
							whiteSpace: "nowrap",
						}}
					>
						매입처와 차량번호를 함께 선택해야 합니다.
					</div>
					<Select
						placeholder="매입처 선택"
						style={{ width: 140 }}
						value={selectedSupplier || undefined}
						onChange={setSelectedSupplier}
						allowClear
						showSearch
						filterOption={(input, option) =>
							(option?.children as unknown as string)
								?.toLowerCase()
								.includes(input.toLowerCase())
						}
					>
						{suppliers.map((supplier) => (
							<Option key={supplier} value={supplier}>
								{supplier}
							</Option>
						))}
					</Select>
					<Select
						placeholder="차량번호 선택"
						style={{ width: 140 }}
						value={selectedVehicle || undefined}
						onChange={setSelectedVehicle}
						allowClear
						showSearch
						filterOption={(input, option) =>
							(option?.children as unknown as string)
								?.toLowerCase()
								.includes(input.toLowerCase())
						}
					>
						{vehicles.map((vehicle) => (
							<Option key={vehicle} value={vehicle}>
								{vehicle}
							</Option>
						))}
					</Select>
				</div>
			}
		>
			<div style={{ position: "relative", minHeight: 240 }}>
				{/* 오버레이 스피너 */}
				{isLoading && (
					<div
						style={{
							position: "absolute",
							zIndex: 2,
							top: 0,
							left: 0,
							width: "100%",
							height: "100%",
							background: "rgba(255,255,255,0.7)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<div style={{ textAlign: "center" }}>
							<div style={{ marginBottom: "8px" }}>
								배차 데이터를 불러오는 중...
							</div>
						</div>
					</div>
				)}
				{/* 테이블 */}
				<div
					style={{
						filter: isLoading ? "blur(2px)" : "none",
						pointerEvents: isLoading ? "none" : "auto",
					}}
				>
					{!displayData || displayData.length === 0 ? (
						<div style={{ textAlign: "center", padding: "48px 0" }}>
							{selectedSupplier && selectedVehicle
								? "선택한 조건에 맞는 배차 데이터가 없습니다."
								: "배차 데이터가 없습니다."}
						</div>
					) : (
						<Table
							columns={columns}
							dataSource={displayData}
							rowKey={(record) =>
								`${record.supplier}-${record.vehicleNumber}-${record.loadingLocation}-${record.unloadingLocation}`
							}
							loading={false}
							pagination={{
								pageSize: 10,
								showSizeChanger: false,
								showQuickJumper: false,
								showTotal: (total) => `${total}개`,
							}}
							scroll={{ x: 1000 }}
							size="small"
						/>
					)}
				</div>
			</div>
		</Card>
	);
};
