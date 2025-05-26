import { GoogleOAuthProvider } from "@react-oauth/google";
import { App } from "antd";
import { useCallback, useMemo, useState } from "react";
import type { GoogleSheetFile } from "../features/excelData/domain/entities/ExcelData";
import { FirebaseService } from "../features/excelData/domain/services/FirebaseService";
import { GoogleSheetsService } from "../features/excelData/domain/services/GoogleSheetsService";
import { AuthCard } from "../ui/deskTop/components/manageGoogleSheets/AuthCard";
import { ProcessingCard } from "../ui/deskTop/components/manageGoogleSheets/ProcessingCard";
import { SheetFileList } from "../ui/deskTop/components/manageGoogleSheets/SheetFileList";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
if (!clientId) {
	throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not set");
}

export const ManageGoogleSheetsPage = () => {
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [googleSheetFiles, setGoogleSheetFiles] = useState<GoogleSheetFile[]>(
		[],
	);
	const [loading, setLoading] = useState(false);
	const [processing, setProcessing] = useState(false);
	const { message } = App.useApp();

	const fetchGoogleSheetFiles = useCallback(
		async (token?: string) => {
			const currentToken = token || accessToken;
			if (!currentToken) return;

			setLoading(true);
			try {
				const service = new GoogleSheetsService(currentToken);
				const files = await service.fetchGoogleSheetFiles();
				setGoogleSheetFiles(files);

				if (files.length === 0) {
					message.info("구글 드라이브에 스프레드시트 파일이 없습니다.");
				}
			} catch (error) {
				message.error("구글 시트 파일 목록을 불러오지 못했습니다.");
			} finally {
				setLoading(false);
			}
		},
		[accessToken, message],
	);

	const handleAuthSuccess = useCallback(
		async (token: string) => {
			setAccessToken(token);
			message.success("구글 계정에 성공적으로 연결되었습니다.");
			await fetchGoogleSheetFiles(token);
		},
		[fetchGoogleSheetFiles, message],
	);

	const handleAuthError = useCallback(() => {
		setAccessToken(null);
		setGoogleSheetFiles([]);
		message.error("구글 로그인에 실패했습니다.");
	}, [message]);

	const handleFileSelect = useCallback(
		async (fileId: string, fileName: string) => {
			if (!accessToken) {
				message.error("인증이 필요합니다.");
				return;
			}

			setProcessing(true);

			try {
				const sheetsService = new GoogleSheetsService(accessToken);
				const firebaseService = new FirebaseService();

				const { year, month } =
					await sheetsService.extractYearMonthFromSheet(fileId);
				const data = await sheetsService.fetchSheetData(fileId);

				if (data.length === 0) {
					message.warning("해당 시트에서 유효한 데이터를 찾을 수 없습니다.");
					return;
				}

				await firebaseService.saveExcelData(data, year, month);

				message.success(
					`${fileName}의 데이터 ${data.length}개를 ${year}-${month} 컬렉션에 성공적으로 저장했습니다.`,
				);
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "시트 데이터 처리에 실패했습니다.";
				message.error(errorMessage);
			} finally {
				setProcessing(false);
			}
		},
		[accessToken, message],
	);

	const handleRefresh = useCallback(() => {
		fetchGoogleSheetFiles();
	}, [fetchGoogleSheetFiles]);

	const memoizedAuthCard = useMemo(
		() => (
			<AuthCard
				accessToken={accessToken}
				loading={loading}
				onAuthSuccess={handleAuthSuccess}
				onAuthError={handleAuthError}
			/>
		),
		[accessToken, loading, handleAuthSuccess, handleAuthError],
	);

	return (
		<GoogleOAuthProvider clientId={clientId}>
			<div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
				{memoizedAuthCard}

				{accessToken && (
					<SheetFileList
						files={googleSheetFiles}
						loading={loading || processing}
						onSelect={handleFileSelect}
						onRefresh={handleRefresh}
					/>
				)}

				{processing && <ProcessingCard />}
			</div>
		</GoogleOAuthProvider>
	);
};
