import { Button, Card, List, Spin } from "antd";
// src/ui/deskTop/components/manageGoogleSheets/SheetFileList.tsx
import type React from "react";
import type { GoogleSheetFile } from "../../../../features/excelData/domain/entities/ExcelData";

interface SheetFileListProps {
	files: GoogleSheetFile[];
	loading: boolean;
	onSelect: (fileId: string, fileName: string) => void;
	onRefresh: () => void;
}

export const SheetFileList: React.FC<SheetFileListProps> = ({
	files,
	loading,
	onSelect,
	onRefresh,
}) => {
	if (loading) {
		return (
			<Card title="구글 시트 파일 목록">
				<div style={{ textAlign: "center", padding: "40px" }}>
					<Spin size="large" />
					<p style={{ marginTop: "16px" }}>파일 목록을 불러오는 중...</p>
				</div>
			</Card>
		);
	}

	return (
		<Card
			title="구글 시트 파일 목록"
			extra={<Button onClick={onRefresh}>새로고침</Button>}
		>
			<List
				dataSource={files}
				renderItem={(file) => (
					<List.Item
						style={{
							cursor: "pointer",
							padding: "16px",
							border: "1px solid #f0f0f0",
							borderRadius: "8px",
							marginBottom: "8px",
						}}
						onClick={() => onSelect(file.id, file.name)}
						className="hover:bg-gray-50"
					>
						<div
							style={{ display: "flex", alignItems: "center", width: "100%" }}
						>
							<span style={{ fontSize: "24px", marginRight: "16px" }}>📊</span>
							<div style={{ flex: 1 }}>
								<div
									style={{
										fontWeight: "500",
										color: "#1677ff",
										fontSize: "16px",
										marginBottom: "4px",
									}}
								>
									{file.name}
								</div>
								<div style={{ fontSize: "12px", color: "#666" }}>
									구글 스프레드시트 • 클릭하여 데이터 가져오기
								</div>
							</div>
							<Button type="link" size="small">
								선택 →
							</Button>
						</div>
					</List.Item>
				)}
				locale={{ emptyText: "구글 시트 파일이 없습니다." }}
			/>
		</Card>
	);
};
