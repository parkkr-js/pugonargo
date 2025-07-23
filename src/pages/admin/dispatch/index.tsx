import { CarOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, Card, Spin, message } from "antd";
import { useState } from "react";
import styled from "styled-components";
import { AdminLayout } from "../../../components/layout/AdminLayout";
import type { DriveFile } from "../../../types/sheets";
import { AuthAlert } from "./components/AuthAlert";
import { DriveFilesTable } from "./components/DriveFilesTable";
import { SheetNamesList } from "./components/SheetNamesList";
import { useDriveFiles, useSheetNames } from "./hooks/useDispatchSheets";
import { useGoogleAuth } from "./hooks/useGoogleAuth";

export const DispatchPage = () => {
	const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
	const { accessToken, isAuthenticated, handleAuth, handleLogout } =
		useGoogleAuth();

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
		message.success(`${file.name} 파일이 선택되었습니다.`);
	};

	// 로그아웃 처리
	const handleLogoutClick = () => {
		handleLogout();
		setSelectedFile(null);
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
					{isAuthenticated && (
						<LogoutButton
							type="text"
							icon={<LogoutOutlined />}
							onClick={handleLogoutClick}
						>
							연동 해제
						</LogoutButton>
					)}
				</PageHeader>

				{!isAuthenticated ? (
					<AuthAlert onAuth={handleAuth} />
				) : (
					<>
						{filesError ? (
							<ErrorMessage>
								파일 목록을 불러오는데 실패했습니다:{" "}
								{filesError instanceof Error
									? filesError.message
									: "알 수 없는 오류"}
							</ErrorMessage>
						) : (
							<DriveFilesTable
								data={driveFiles}
								onSelectFile={handleSelectFile}
								selectedFileId={selectedFile?.id || null}
								isLoading={isLoadingFiles}
								onRefresh={refetchFiles}
							/>
						)}

						{selectedFile && (
							<SheetNamesCard
								selectedFile={selectedFile}
								sheetNames={sheetNames}
								isLoadingSheets={isLoadingSheets}
								sheetsError={sheetsError}
							/>
						)}

						<DispatchStatsCard />
						<DispatchHistoryCard />
					</>
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
}: {
	selectedFile: DriveFile;
	sheetNames: string[];
	isLoadingSheets: boolean;
	sheetsError: unknown;
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
				<SheetNamesList sheetNames={sheetNames} />
			)}
		</VerticalStack>
	</Card>
);

// 배차 통계 컴포넌트
const DispatchStatsCard = () => (
	<Card>
		<VerticalStack gap={16}>
			<HorizontalStack>
				<LabelWithSub>
					배차 현황
					<LabelSub>(현재 배차된 차량 목록입니다.)</LabelSub>
				</LabelWithSub>
			</HorizontalStack>
			<CardRow>
				<StatCard>
					<StatLabel>총 차량 수</StatLabel>
					<StatValue>12 대</StatValue>
				</StatCard>
				<StatCard>
					<StatLabel>배차 중</StatLabel>
					<StatValue>8 대</StatValue>
				</StatCard>
				<StatCard>
					<StatLabel>대기 중</StatLabel>
					<StatValue>4 대</StatValue>
				</StatCard>
				<StatCard>
					<StatLabel>이번 달 배차율</StatLabel>
					<StatValue>85%</StatValue>
				</StatCard>
			</CardRow>
		</VerticalStack>
	</Card>
);

// 배차 이력 컴포넌트
const DispatchHistoryCard = () => (
	<Card>
		<VerticalStack gap={16}>
			<HorizontalStack>
				<LabelWithSub>
					배차 이력
					<LabelSub>(과거 배차 기록을 확인할 수 있습니다.)</LabelSub>
				</LabelWithSub>
			</HorizontalStack>
			<HistoryContainer>
				<HistoryItem>
					<HistoryDate>2024-01-15</HistoryDate>
					<HistoryContent>
						<VehicleInfo>차량번호: 12가3456</VehicleInfo>
						<DriverInfo>기사: 김철수</DriverInfo>
						<RouteInfo>경로: 서울 → 부산</RouteInfo>
					</HistoryContent>
					<StatusBadge status="completed">완료</StatusBadge>
				</HistoryItem>
				<HistoryItem>
					<HistoryDate>2024-01-14</HistoryDate>
					<HistoryContent>
						<VehicleInfo>차량번호: 34나5678</VehicleInfo>
						<DriverInfo>기사: 이영희</DriverInfo>
						<RouteInfo>경로: 대구 → 광주</RouteInfo>
					</HistoryContent>
					<StatusBadge status="in-progress">진행중</StatusBadge>
				</HistoryItem>
				<HistoryItem>
					<HistoryDate>2024-01-13</HistoryDate>
					<HistoryContent>
						<VehicleInfo>차량번호: 56다7890</VehicleInfo>
						<DriverInfo>기사: 박민수</DriverInfo>
						<RouteInfo>경로: 인천 → 대전</RouteInfo>
					</HistoryContent>
					<StatusBadge status="completed">완료</StatusBadge>
				</HistoryItem>
			</HistoryContainer>
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
	justify-content: space-between;
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

const LogoutButton = styled(Button)`
	color: ${({ theme }) => theme.colors.gray[600]};
	
	&:hover {
		color: ${({ theme }) => theme.colors.gray[800]};
	}
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

const CardRow = styled.div`
	display: flex;
	gap: 16px;
`;

const StatCard = styled.div`
	flex: 1;
	background: ${({ theme }) => theme.colors.background.secondary};
	border-radius: ${({ theme }) => theme.borderRadius.xl};
	padding: 16px 12px;
	text-align: center;
	box-shadow: ${({ theme }) => theme.shadows.xs};
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const StatLabel = styled.div`
	color: ${({ theme }) => theme.colors.gray[600]};
	font-size: ${({ theme }) => theme.fontSizes.sm};
	margin-bottom: 8px;
	font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const StatValue = styled.div`
	color: ${({ theme }) => theme.colors.primary};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	font-size: ${({ theme }) => theme.fontSizes.xl};
`;

const HistoryContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const HistoryItem = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px;
	background: ${({ theme }) => theme.colors.background.secondary};
	border-radius: ${({ theme }) => theme.borderRadius.md};
	border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const HistoryDate = styled.div`
	font-weight: ${({ theme }) => theme.fontWeights.medium};
	color: ${({ theme }) => theme.colors.gray[700]};
	min-width: 100px;
`;

const HistoryContent = styled.div`
	flex: 1;
	margin: 0 16px;
`;

const VehicleInfo = styled.div`
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	color: ${({ theme }) => theme.colors.text.primary};
	margin-bottom: 4px;
`;

const DriverInfo = styled.div`
	color: ${({ theme }) => theme.colors.gray[600]};
	font-size: ${({ theme }) => theme.fontSizes.sm};
	margin-bottom: 2px;
`;

const RouteInfo = styled.div`
	color: ${({ theme }) => theme.colors.gray[600]};
	font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const StatusBadge = styled.div<{
	status: "completed" | "in-progress" | "pending";
}>`
	padding: 4px 12px;
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	font-size: ${({ theme }) => theme.fontSizes.sm};
	font-weight: ${({ theme }) => theme.fontWeights.medium};
	background: ${({ status, theme }) => {
		switch (status) {
			case "completed":
				return theme.colors.gray[100];
			case "in-progress":
				return theme.colors.gray[200];
			case "pending":
				return theme.colors.gray[300];
			default:
				return theme.colors.gray[200];
		}
	}};
	color: ${({ status, theme }) => {
		switch (status) {
			case "completed":
				return theme.colors.gray[700];
			case "in-progress":
				return theme.colors.gray[800];
			case "pending":
				return theme.colors.gray[900];
			default:
				return theme.colors.gray[600];
		}
	}};
`;
