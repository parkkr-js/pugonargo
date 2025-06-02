import { GoogleOAuthProvider } from "@react-oauth/google";
import { App } from "antd";
import { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux"; // 🚀 추가
import type { GoogleSheetFile } from "../features/excelData/domain/entities/ExcelData";
import { FirebaseService } from "../features/excelData/domain/services/FirebaseService";
import { GoogleSheetsService } from "../features/excelData/domain/services/GoogleSheetsService";
import { paymentSummaryApi } from "../features/paymentSummary/api/paymentSummary.api"; // 🚀 추가
import { AuthCard } from "../ui/deskTop/components/manageGoogleSheets/AuthCard";
import { ProcessingCard } from "../ui/deskTop/components/manageGoogleSheets/ProcessingCard";
import { SheetFileList } from "../ui/deskTop/components/manageGoogleSheets/SheetFileList";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
if (!clientId) {
	throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not set");
}

export const ManageGoogleSheetsPage = () => {
	const dispatch = useDispatch(); // 🚀 추가
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

			const sheetsService = new GoogleSheetsService(accessToken);
			const firebaseService = new FirebaseService();

			try {
				// 🚀 1단계: 연월 정보 추출
				const { year, month } =
					await sheetsService.extractYearMonthFromSheet(fileId);

				// 🚀 2단계: 시트 데이터 가져오기
				const data = await sheetsService.fetchSheetData(fileId);

				if (data.length === 0) {
					throw new Error("해당 시트에서 유효한 데이터를 찾을 수 없습니다.");
				}

				// 🚀 3단계: Firebase에 저장
				await firebaseService.saveExcelData(data, year, month);

				// 🚀 4단계: 성공 후 RTK Query 캐시 무효화
				dispatch(
					paymentSummaryApi.util.invalidateTags([
						"AvailableYearMonths", // 연월 목록 갱신
						{ type: "PaymentSummary", id: `${year}-${month}` }, // 해당 연월 데이터 갱신
					]),
				);

				// 🚀 5단계: 성공 메시지
				message.success(
					`${fileName} (${year}-${month}) 데이터가 성공적으로 업로드되었습니다!`,
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
		[accessToken, message, dispatch], // 🚀 dispatch 의존성 추가
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
