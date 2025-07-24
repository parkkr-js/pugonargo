import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	Empty,
	Input,
	Spin,
	Table,
	Typography,
	message,
} from "antd";
import { memo, useCallback, useMemo, useState } from "react";
import { cellStyle } from "../../../../styles";
import type { DriveFile } from "../../../../types/sheets";
import { normalizeText } from "../../../../utils/normalizeText";
import { useDispatchProcessing } from "../hooks/useDispatchProcessing";

const { Text } = Typography;

interface SheetNamesListProps {
	sheetNames: string[];
	spreadsheetId?: string;
	accessToken?: string;
	selectedFile?: DriveFile;
	onDateSelect?: (date: string) => void;
}

export const SheetNamesList = memo(
	({
		sheetNames,
		spreadsheetId,
		accessToken,
		selectedFile,
		onDateSelect,
	}: SheetNamesListProps) => {
		const { processDispatch, isProcessing } = useDispatchProcessing();
		const [searchText, setSearchText] = useState("");

		const handleSearch = useCallback((value: string) => {
			setSearchText(value);
		}, []);

		const handleSheetSelect = useCallback(
			async (sheetName: string) => {
				if (!spreadsheetId || !accessToken || !selectedFile) {
					message.error("필수 정보가 누락되었습니다.");
					return;
				}

				try {
					// 배차 데이터 처리 시작
					const result = await processDispatch({
						file: selectedFile,
						sheetName,
						accessToken,
					});

					// 처리된 날짜 설정
					if (onDateSelect && result.docId) {
						onDateSelect(result.docId);
					}

					message.success(
						`${sheetName} 시트의 배차 데이터가 성공적으로 처리되었습니다.`,
					);
				} catch (error) {
					console.error("배차 데이터 처리 실패:", error);
					message.error(
						`배차 데이터 처리 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
					);
				}
			},
			[spreadsheetId, accessToken, selectedFile, processDispatch, onDateSelect],
		);

		const filteredSheetNames = useMemo(() => {
			if (!sheetNames) return [];
			if (!searchText) return sheetNames;

			const normalizedSearchText = normalizeText(searchText);
			return sheetNames.filter((sheetName) =>
				normalizeText(sheetName).includes(normalizedSearchText),
			);
		}, [sheetNames, searchText]);

		const columns = useMemo(
			() => [
				{
					title: "시트명",
					dataIndex: "sheetName",
					key: "sheetName",
					render: (sheetName: string) => (
						<Text strong style={{ fontSize: "14px" }}>
							{sheetName}
						</Text>
					),
					ellipsis: true,
					onCell: () => ({ style: cellStyle }),
				},
				{
					title: "작업",
					key: "actions",
					render: (_: unknown, record: { sheetName: string }) => (
						<Button
							type="primary"
							size="small"
							icon={<DownloadOutlined />}
							onClick={() => handleSheetSelect(record.sheetName)}
							loading={isProcessing}
							disabled={isProcessing}
						>
							{record.sheetName}데이터 처리
						</Button>
					),
					ellipsis: true,
					onCell: () => ({ style: cellStyle }),
				},
			],
			[handleSheetSelect, isProcessing],
		);

		return (
			<Card
				title="시트 목록"
				extra={
					<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
						<Input
							placeholder="시트명 검색"
							prefix={<SearchOutlined />}
							onChange={(e) => handleSearch(e.target.value)}
							style={{ width: 200 }}
							allowClear
						/>
					</div>
				}
			>
				<div style={{ position: "relative", minHeight: 240 }}>
					{/* 오버레이 스피너 */}
					{isProcessing && (
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
					{/* 테이블 */}
					<div
						style={{
							filter: isProcessing ? "blur(2px)" : "none",
							pointerEvents: isProcessing ? "none" : "auto",
						}}
					>
						{!sheetNames || sheetNames.length === 0 ? (
							<Empty
								description="시트를 찾을 수 없습니다"
								image={Empty.PRESENTED_IMAGE_SIMPLE}
							/>
						) : (
							<Table
								columns={columns}
								dataSource={filteredSheetNames.map((sheetName) => ({
									sheetName,
								}))}
								rowKey="sheetName"
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
			</Card>
		);
	},
);

SheetNamesList.displayName = "SheetNamesList";
