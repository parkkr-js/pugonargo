import { CarOutlined } from "@ant-design/icons";
import { Card, Spin, message } from "antd";
import { useRef, useState } from "react";
import styled from "styled-components";
import { AdminLayout } from "../../../components/layout/AdminLayout";
import type { DriveFile } from "../../../types/dispatch";
import { AuthAlert } from "./components/AuthAlert";
import { DispatchDataTable } from "./components/DispatchDataTable";
import { DriveFilesTable } from "./components/DriveFilesTable";
import { SheetNamesList } from "./components/SheetNamesList";
import { useDriveFiles, useSheetNames } from "./hooks/useDispatchSheets";
import { useGoogleAuth } from "./hooks/useGoogleAuth";

export const DispatchPage = () => {
	const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const { accessToken, isAuthenticated, handleAuth, handleLogout } =
		useGoogleAuth();

	// 스크롤 참조
	const sheetNamesRef = useRef<HTMLDivElement>(null);
	const dispatchDataRef = useRef<HTMLDivElement>(null);

	// Google Drive 파일 목록 가져오기
	const {
		data: driveFiles = [],
		isLoading: isLoadingFiles,
		error: filesError,
		refetch: refetchFiles,
	} = useDriveFiles(accessToken || null);

	// 선택된 파일의 시트 이름 목록 가져오기
	const {
		data: sheetNames = [],
		isLoading: isLoadingSheets,
		error: sheetsError,
	} = useSheetNames(selectedFile?.id || null, accessToken || null);

	// 파일 선택 처리
	const handleSelectFile = (file: DriveFile) => {
		setSelectedFile(file);
		setSelectedDate(null); // 파일이 변경되면 날짜 초기화
		message.success(`${file.name} 파일이 선택되었습니다.`);

		// 시트 목록으로 스크롤
		setTimeout(() => {
			sheetNamesRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}, 100);
	};

	// 날짜 선택 처리
	const handleDateSelect = (date: string) => {
		setSelectedDate(date);

		// 배차 데이터 테이블로 스크롤
		setTimeout(() => {
			dispatchDataRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}, 100);
	};

	return (
		<AdminLayout>
			<VerticalStack gap={32}>
				<PageHeader>
					<MainTitle>
						<CarOutlined />
						배차 관리
					</MainTitle>
					<SubTitle>차량 배차 현황을 관리해보세요</SubTitle>
				</PageHeader>
				<AuthAlert
					isAuthenticated={isAuthenticated}
					onAuth={handleAuth}
					onLogout={handleLogout}
				/>
				<DriveFilesTable
					data={driveFiles}
					onSelectFile={handleSelectFile}
					selectedFileId={selectedFile?.id || null}
					isLoading={isLoadingFiles}
					onRefresh={refetchFiles}
					isAuthenticated={isAuthenticated}
					filesError={filesError}
				/>

				{selectedFile && isAuthenticated && (
					<div ref={sheetNamesRef}>
						<SheetNamesCard
							selectedFile={selectedFile}
							sheetNames={sheetNames}
							isLoadingSheets={isLoadingSheets}
							sheetsError={sheetsError}
							accessToken={accessToken}
							onDateSelect={handleDateSelect}
						/>
					</div>
				)}

				{selectedDate && (
					<div ref={dispatchDataRef}>
						<DispatchDataTable docId={selectedDate} />
					</div>
				)}
			</VerticalStack>
		</AdminLayout>
	);
};

// 시트 이름 카드 컴포넌트
const SheetNamesCard = ({
	selectedFile,
	sheetNames,
	isLoadingSheets,
	sheetsError,
	accessToken,
	onDateSelect,
}: {
	selectedFile: DriveFile;
	sheetNames: string[];
	isLoadingSheets: boolean;
	sheetsError: unknown;
	accessToken: string;
	onDateSelect: (date: string) => void;
}) => (
	<Card>
		<VerticalStack gap={16}>
			<HorizontalStack>
				<LabelWithSub>
					시트 목록 - {selectedFile.name}
					<LabelSub>(선택된 파일의 시트 목록입니다.)</LabelSub>
				</LabelWithSub>
			</HorizontalStack>
			{isLoadingSheets ? (
				<CenteredBox>
					<Spin size="large" />
				</CenteredBox>
			) : sheetsError ? (
				<ErrorMessage>
					시트 목록을 불러오는데 실패했습니다:{" "}
					{sheetsError instanceof Error
						? sheetsError.message
						: "알 수 없는 오류"}
				</ErrorMessage>
			) : (
				<SheetNamesList
					sheetNames={sheetNames}
					spreadsheetId={selectedFile.id}
					accessToken={accessToken}
					selectedFile={selectedFile}
					onDateSelect={onDateSelect}
				/>
			)}
		</VerticalStack>
	</Card>
);

// 스타일 컴포넌트들
const CenteredBox = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 48px 0;
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

const LabelWithSub = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.lg};
	color: ${({ theme }) => theme.colors.gray[900]};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
`;

const LabelSub = styled.span`
	font-size: 0.92rem;
	color: ${({ theme }) => theme.colors.gray[400]};
	font-weight: 400;
	margin-left: 4px;
`;

const ErrorMessage = styled.div`
	color: ${({ theme }) => theme.colors.semantic.error};
	text-align: center;
	padding: 16px;
	background: ${({ theme }) => theme.colors.semantic.error}10;
	border-radius: ${({ theme }) => theme.borderRadius.md};
	border: 1px solid ${({ theme }) => theme.colors.semantic.error}20;
`;

const VerticalStack = styled.div<{ gap?: number }>`
	display: flex;
	flex-direction: column;
	gap: ${({ gap }) => gap ?? 24}px;
	width: 100%;
`;

const HorizontalStack = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
`;
