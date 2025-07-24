import {
	DownloadOutlined,
	ReloadOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { Button, Card, Empty, Input, Spin, Table, Typography } from "antd";
import dayjs from "dayjs";
import { memo, useCallback, useMemo, useState } from "react";
import { cellStyle } from "../../../../styles";
import type { DriveFile } from "../../../../types/sheets";
import { isDispatchFile } from "../../../../utils/fileValidation";
import { normalizeText } from "../../../../utils/normalizeText";

const { Text } = Typography;

interface DriveFilesTableProps {
	data: DriveFile[];
	onSelectFile: (file: DriveFile) => void;
	selectedFileId: string | null;
	isLoading?: boolean;
	onRefresh?: () => void;
	isAuthenticated?: boolean;
	filesError?: unknown;
}

export const DriveFilesTable = memo(
	({
		data,
		onSelectFile,
		selectedFileId,
		isLoading = false,
		onRefresh,
		isAuthenticated = false,
		filesError,
	}: DriveFilesTableProps) => {
		const [searchText, setSearchText] = useState("");

		const handleSearch = useCallback((value: string) => {
			setSearchText(value);
		}, []);

		const handleFileSelect = useCallback(
			(file: DriveFile) => {
				onSelectFile(file);
			},
			[onSelectFile],
		);

		const filteredFiles = useMemo(() => {
			if (!data) return [];
			if (!searchText) return data;

			const normalizedSearchText = normalizeText(searchText);
			return data.filter((file) =>
				normalizeText(file.name).includes(normalizedSearchText),
			);
		}, [data, searchText]);

		const columns = useMemo(
			() => [
				{
					title: "파일명",
					dataIndex: "name",
					key: "name",
					render: (name: string) => (
						<Text strong style={{ fontSize: "14px" }}>
							{name}
						</Text>
					),
					ellipsis: true,
					onCell: () => ({ style: cellStyle }),
				},
				{
					title: "수정일",
					dataIndex: "modifiedTime",
					key: "modifiedTime",
					render: (time: string) => {
						const d = dayjs(time);
						const isToday = d.isSame(dayjs(), "day");
						return (
							<Text type="secondary">
								{isToday ? d.format("h:mm A") : d.format("YYYY. MM. DD")}
							</Text>
						);
					},
					ellipsis: true,
					onCell: () => ({ style: cellStyle }),
				},
				{
					title: "크기",
					dataIndex: "size",
					key: "size",
					render: (size?: string) => (
						<Text type="secondary">
							{size ? `${Math.round(Number(size) / 1024)} KB` : "-"}
						</Text>
					),
					ellipsis: true,
					onCell: () => ({ style: cellStyle }),
				},
				{
					title: "작업",
					key: "actions",
					render: (record: DriveFile) => {
						const isDispatch = isDispatchFile(record.name);
						const isSelected = selectedFileId === record.id;

						// 버튼 텍스트 결정
						let buttonText = "선택";
						if (isSelected) {
							buttonText = "선택됨";
						} else if (!isDispatch) {
							buttonText = "배차 파일 아님";
						}

						return (
							<Button
								type="primary"
								size="small"
								icon={isDispatch ? <DownloadOutlined /> : ""}
								onClick={() => handleFileSelect(record)}
								disabled={!isDispatch || isSelected}
								title={!isDispatch ? "배차 파일만 선택 가능합니다" : ""}
							>
								{buttonText}
							</Button>
						);
					},
					ellipsis: true,
					onCell: () => ({ style: cellStyle }),
				},
			],
			[selectedFileId, handleFileSelect],
		);

		return (
			<Card
				title="Google Drive Excel 파일"
				extra={
					<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
						<Input
							placeholder="파일명 검색"
							prefix={<SearchOutlined />}
							onChange={(e) => handleSearch(e.target.value)}
							style={{ width: 200 }}
							allowClear
						/>
						<Button
							icon={<ReloadOutlined />}
							onClick={onRefresh}
							loading={isLoading}
							size="small"
							disabled={!isAuthenticated}
						>
							새로고침
						</Button>
					</div>
				}
			>
				{!isAuthenticated ? (
					<Empty
						description="Google 인증이 필요합니다"
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					/>
				) : filesError ? (
					<Empty
						description="파일 목록을 불러오는데 실패했습니다"
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					/>
				) : (
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
								<Spin size="large" />
							</div>
						)}
						{/* 리스트 */}
						<div
							style={{
								filter: isLoading ? "blur(2px)" : "none",
								pointerEvents: isLoading ? "none" : "auto",
							}}
						>
							{!data || data.length === 0 ? (
								<Empty
									description="Excel/시트 파일이 없습니다"
									image={Empty.PRESENTED_IMAGE_SIMPLE}
								/>
							) : (
								<Table
									columns={columns}
									dataSource={filteredFiles}
									rowKey="id"
									size="small"
									pagination={{
										pageSize: 10,
										showSizeChanger: false,
										showQuickJumper: false,
										showTotal: (total) => `${total}개`,
									}}
								/>
							)}
						</div>
					</div>
				)}
			</Card>
		);
	},
);

DriveFilesTable.displayName = "DriveFilesTable";
