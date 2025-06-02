import {
	PlayCircleOutlined,
	ReloadOutlined,
	TableOutlined,
} from "@ant-design/icons";
import {
	Alert,
	Button,
	Card,
	Empty,
	Spin,
	Table,
	Typography,
	message,
} from "antd";
import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { useDriveFiles, useProcessExcelFile } from "../../hooks/useSheets";
import { GoogleAuthService } from "../../services/googleAuthService";
import type { DriveFile } from "../../types/sheets";

const { Title, Paragraph, Text } = Typography;

const googleAuthService = new GoogleAuthService();

export const SheetsPage = () => {
	const [accessToken, setAccessToken] = useState<string>("");
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

	// 인증 상태 확인
	useEffect(() => {
		const checkAuth = async () => {
			const token = googleAuthService.getStoredAccessToken();
			if (token) {
				const isValid = await googleAuthService.validateToken(token);
				if (isValid) {
					setAccessToken(token);
					setIsAuthenticated(true);
				} else {
					googleAuthService.removeAccessToken();
				}
			}
		};

		checkAuth();
	}, []);

	// 훅들
	const {
		data: driveFiles,
		isLoading: loadingFiles,
		refetch: refetchFiles,
	} = useDriveFiles(accessToken);
	const processFileMutation = useProcessExcelFile();

	// Google Drive 파일 테이블 컬럼
	const driveFilesColumns = [
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
			render: (time: string) => (
				<Text type="secondary">
					{new Date(time).toLocaleDateString("ko-KR")}
				</Text>
			),
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
					loading={
						processFileMutation.isPending && selectedFileId === record.id
					}
					disabled={!isAuthenticated || processFileMutation.isPending}
				>
					처리
				</Button>
			),
		},
	];

	// Google 인증 시작
	const handleGoogleAuth = () => {
		googleAuthService.startOAuthFlow();
	};

	// Google 로그아웃
	const handleGoogleLogout = () => {
		googleAuthService.logout();
		setAccessToken("");
		setIsAuthenticated(false);
	};

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
			<div>
				{/* 페이지 헤더 */}
				<div style={{ marginBottom: "24px" }}>
					<Title
						level={2}
						style={{
							margin: 0,
							display: "flex",
							alignItems: "center",
							gap: "8px",
						}}
					>
						<TableOutlined />
						연동 시트 관리
					</Title>
					<Paragraph type="secondary" style={{ margin: "8px 0 0 0" }}>
						Google Drive의 Excel 파일을 선택하여 시스템에 동기화하세요
					</Paragraph>
				</div>

				{/* 인증 상태 */}
				{!isAuthenticated ? (
					<Alert
						message="Google 인증 필요"
						description="Google Drive와 Sheets API 사용을 위한 인증이 필요합니다."
						type="warning"
						showIcon
						style={{ marginBottom: "24px" }}
						action={
							<Button type="primary" onClick={handleGoogleAuth}>
								Google 인증하기
							</Button>
						}
					/>
				) : (
					<Alert
						message="Google 인증 완료"
						description="Google Drive와 Sheets API에 성공적으로 연결되었습니다."
						type="success"
						showIcon
						style={{ marginBottom: "24px" }}
						action={<Button onClick={handleGoogleLogout}>인증 해제</Button>}
					/>
				)}

				{/* Google Drive 파일 목록 */}
				<Card
					title="Google Drive Excel 파일"
					extra={
						<Button
							icon={<ReloadOutlined />}
							onClick={() => refetchFiles()}
							loading={loadingFiles}
							size="small"
							disabled={!isAuthenticated}
						>
							새로고침
						</Button>
					}
				>
					{!isAuthenticated ? (
						<Empty
							description="Google 인증이 필요합니다"
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						/>
					) : loadingFiles ? (
						<div style={{ textAlign: "center", padding: "40px 0" }}>
							<Spin size="large" />
						</div>
					) : !driveFiles || driveFiles.length === 0 ? (
						<Empty
							description="Excel 파일이 없습니다"
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						/>
					) : (
						<Table
							columns={driveFilesColumns}
							dataSource={driveFiles}
							rowKey="id"
							size="small"
							pagination={{
								pageSize: 10,
								showSizeChanger: false,
								showQuickJumper: false,
							}}
						/>
					)}
				</Card>
			</div>
		</AdminLayout>
	);
};
