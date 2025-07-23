import {
	DownloadOutlined,
	ReloadOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { Button, Card, Empty, Input, Spin, Table, Typography } from "antd";
import dayjs from "dayjs";
import { memo, useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { cellStyle } from "../../../../styles";
import type { DriveFile } from "../../../../types/sheets";
import { normalizeText } from "../../../../utils/normalizeText";

const { Text } = Typography;

interface DriveFilesTableProps {
	data: DriveFile[];
	onSelectFile: (file: DriveFile) => void;
	selectedFileId: string | null;
	isLoading?: boolean;
	onRefresh?: () => void;
}

export const DriveFilesTable = memo(
	({
		data,
		onSelectFile,
		selectedFileId,
		isLoading = false,
		onRefresh,
	}: DriveFilesTableProps) => {
		const [searchText, setSearchText] = useState("");

		const handleSearch = useCallback((value: string) => {
			setSearchText(value);
		}, []);

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
					render: (record: DriveFile) => (
						<Button
							type="primary"
							size="small"
							icon={<DownloadOutlined />}
							onClick={() => onSelectFile(record)}
							disabled={selectedFileId === record.id}
						>
							{selectedFileId === record.id ? "선택됨" : "선택"}
						</Button>
					),
					ellipsis: true,
					onCell: () => ({ style: cellStyle }),
				},
			],
			[selectedFileId, onSelectFile],
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
						{onRefresh && (
							<Button
								icon={<ReloadOutlined />}
								onClick={onRefresh}
								loading={isLoading}
								size="small"
							>
								새로고침
							</Button>
						)}
					</div>
				}
			>
				<div style={{ position: "relative", minHeight: 240 }}>
					{isLoading && (
						<LoadingOverlay>
							<Spin size="large" />
						</LoadingOverlay>
					)}
					<TableContainer isLoading={isLoading}>
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
					</TableContainer>
				</div>
			</Card>
		);
	},
);

DriveFilesTable.displayName = "DriveFilesTable";

const LoadingOverlay = styled.div`
	position: absolute;
	z-index: 2;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(255, 255, 255, 0.7);
	display: flex;
	align-items: center;
	justify-content: center;
`;

const TableContainer = styled.div<{ isLoading: boolean }>`
	filter: ${({ isLoading }) => (isLoading ? "blur(2px)" : "none")};
	pointer-events: ${({ isLoading }) => (isLoading ? "none" : "auto")};
`;
