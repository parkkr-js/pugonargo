import { TableOutlined } from "@ant-design/icons";
import { message } from "antd";
import { useState } from "react";
import styled from "styled-components";
import { AdminLayout } from "../../../components/layout/AdminLayout";
import { useDriveFiles, useProcessExcelFile } from "../../../hooks/useSheets";
import type { DriveFile } from "../../../types/sheets";
import { AuthAlert } from "./components/AuthAlert";
import { DriveFilesTable } from "./components/DriveFilesTable";
import { useGoogleAuth } from "./hooks/useGoogleAuth";

export const SheetsPage = () => {
	const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
	const { accessToken, isAuthenticated, handleAuth, handleLogout } =
		useGoogleAuth();

	// 훅들
	const {
		data: driveFiles,
		isFetching: fetchingFiles,
		refetch: refetchFiles,
	} = useDriveFiles(accessToken);
	const processFileMutation = useProcessExcelFile();

	// 파일 처리 실행
	const handleProcessFile = async (file: DriveFile) => {
		if (!accessToken) {
			message.error("Google 인증이 필요합니다.");
			return;
		}

		setSelectedFileId(file.id);

		try {
			const result = await processFileMutation.mutateAsync({
				fileId: file.id,
				fileName: file.name,
				accessToken,
			});

			message.success(
				`${file.name} 처리 완료! (${result.processedRows}건 처리됨)`,
			);
		} catch (error) {
			message.error(
				`파일 처리 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
			);
		} finally {
			setSelectedFileId(null);
		}
	};

	return (
		<AdminLayout>
			<VerticalStack gap={32}>
				<PageHeader>
					<MainTitle>
						<TableOutlined />
						연동 시트 관리
					</MainTitle>
					<SubTitle>데이터를 불러올 시트를 관리하세요</SubTitle>
				</PageHeader>
				<AuthAlert
					isAuthenticated={isAuthenticated}
					onAuth={handleAuth}
					onLogout={handleLogout}
				/>
				<DriveFilesTable
					files={driveFiles}
					isLoading={fetchingFiles}
					isAuthenticated={isAuthenticated}
					selectedFileId={selectedFileId}
					isProcessing={processFileMutation.isPending}
					onRefresh={refetchFiles}
					onProcessFile={handleProcessFile}
				/>
			</VerticalStack>
		</AdminLayout>
	);
};
const VerticalStack = styled.div<{ gap?: number }>`
	display: flex;
	flex-direction: column;
	gap: ${({ gap }) => gap ?? 24}px;
	width: 100%;
`;

const PageHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: 24px;
`;

const MainTitle = styled.h1`
	font-size: ${({ theme }) => theme.fontSizes["2xl"]};
	font-weight: 700;
	color: ${({ theme }) => theme.colors.primary};
	margin: 0;
	display: flex;
	align-items: center;
	gap: 8px;
`;

const SubTitle = styled.span`
	font-size: 1rem;
	color: ${({ theme }) => theme.colors.gray[600]};
	font-weight: 400;
`;
