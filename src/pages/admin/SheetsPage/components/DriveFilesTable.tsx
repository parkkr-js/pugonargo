import {
	PlayCircleOutlined,
	ReloadOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { Button, Card, Empty, Input, Spin, Table, Typography } from "antd";
import dayjs from "dayjs";
import { memo, useCallback, useMemo, useState } from "react";
import type { DriveFile } from "../../../../types/sheets";
import { normalizeText } from "../../../../utils/normalizeText";

const { Text } = Typography;

interface DriveFilesTableProps {
	files: DriveFile[] | undefined;
	isLoading: boolean;
	isAuthenticated: boolean;
	selectedFileId: string | null;
	isProcessing: boolean;
	onRefresh: () => void;
	onProcessFile: (file: DriveFile) => void;
}

export const DriveFilesTable = memo(
	({
		files,
		isLoading,
		isAuthenticated,
		selectedFileId,
		isProcessing,
		onRefresh,
		onProcessFile,
	}: DriveFilesTableProps) => {
		const [searchText, setSearchText] = useState("");

		// 처리 버튼(case1-1 해당 월의 데이터가 없을 때)
		const handleProcessFile = useCallback(
			(file: DriveFile) => {
				onProcessFile(file);
			},
			[onProcessFile],
		);

		const handleSearch = useCallback((value: string) => {
			setSearchText(value);
		}, []);

		const filteredFiles = useMemo(() => {
			if (!files) return [];
			if (!searchText) return files;

			const normalizedSearchText = normalizeText(searchText);
			return files.filter((file) =>
				normalizeText(file.name).includes(normalizedSearchText),
			);
		}, [files, searchText]);

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
				},
				{
					title: "작업",
					key: "actions",
					render: (record: DriveFile) => (
						<Button
							type="primary"
							size="small"
							icon={<PlayCircleOutlined />}
							onClick={() => handleProcessFile(record)}
							loading={isProcessing && selectedFileId === record.id}
							disabled={!isAuthenticated || isProcessing}
						>
							처리
						</Button>
					),
				},
			],
			[isProcessing, selectedFileId, isAuthenticated, handleProcessFile],
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
							{!files || files.length === 0 ? (
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
