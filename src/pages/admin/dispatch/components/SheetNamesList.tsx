import { Button, List, Tag, message } from "antd";
import styled from "styled-components";
import type { DriveFile } from "../../../../types/sheets";
import { useDispatchProcessing } from "../hooks/useDispatchProcessing";

interface SheetNamesListProps {
	sheetNames: string[];
	spreadsheetId?: string;
	accessToken?: string;
	selectedFile?: DriveFile;
	onDateSelect?: (date: string) => void;
}

export const SheetNamesList = ({
	sheetNames,
	spreadsheetId,
	accessToken,
	selectedFile,
	onDateSelect,
}: SheetNamesListProps) => {
	const { processDispatch, isProcessing } = useDispatchProcessing();

	const handleSheetSelect = async (sheetName: string) => {
		console.log("handleSheetSelect 호출됨:", {
			spreadsheetId,
			accessToken: accessToken ? "있음" : "없음",
			selectedFile: selectedFile ? "있음" : "없음",
			sheetName,
		});

		if (!spreadsheetId || !accessToken || !selectedFile) {
			console.log("필수 정보가 없습니다:", {
				spreadsheetId: !!spreadsheetId,
				accessToken: !!accessToken,
				selectedFile: !!selectedFile,
			});
			return;
		}

		try {
			console.log(`시트 선택: ${sheetName}`);

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
	};

	return (
		<Container>
			<Title>시트 목록</Title>
			<List
				dataSource={sheetNames}
				renderItem={(sheetName) => (
					<List.Item>
						<Tag
							color="blue"
							style={{
								fontSize: "14px",
								padding: "8px 12px",
								cursor: "pointer",
							}}
							onClick={() => handleSheetSelect(sheetName)}
						>
							{sheetName}
						</Tag>
						<Button
							type="primary"
							size="small"
							onClick={() => handleSheetSelect(sheetName)}
							loading={isProcessing}
							disabled={isProcessing}
							style={{ marginLeft: "8px" }}
						>
							배차 데이터 처리
						</Button>
					</List.Item>
				)}
				locale={{
					emptyText: "시트를 찾을 수 없습니다.",
				}}
			/>
		</Container>
	);
};

const Container = styled.div`
	padding: 16px;
	background: ${({ theme }) => theme.colors.background.secondary};
	border-radius: ${({ theme }) => theme.borderRadius.md};
	border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const Title = styled.h3`
	margin: 0 0 16px 0;
	font-size: ${({ theme }) => theme.fontSizes.lg};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	color: ${({ theme }) => theme.colors.text.primary};
`;
