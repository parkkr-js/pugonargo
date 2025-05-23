export {};
// import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
// import { Button, List, Modal, Table, message } from "antd";
// import type React from "react";
// import { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import type { MonthlyAggregate } from "../../domain/entities/MonthlyAggregate";
// import { MonthlyAggregateRepository } from "../../firebase/repositories/monthlyAggregateRepository";
// import type { RootState } from "../store";
// import { setMonthlyAggregate } from "../store/slices/monthlyAggregateSlice";

// const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
// if (!clientId) {
// 	throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not set");
// }

// export const MonthlyAggregatePage: React.FC = () => {
// 	const dispatch = useDispatch();
// 	const monthlyAggregate = useSelector(
// 		(state: RootState) => state.monthlyAggregate.data,
// 	);
// 	const [loading, setLoading] = useState(false);
// 	const [token, setToken] = useState<string | null>(null);
// 	const [excelFiles, setExcelFiles] = useState<{ id: string; name: string }[]>(
// 		[],
// 	);
// 	const [fileModalOpen, setFileModalOpen] = useState(false);

// 	const login = useGoogleLogin({
// 		scope:
// 			"https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets.readonly",
// 		onSuccess: async (tokenResponse) => {
// 			setToken(tokenResponse.access_token);
// 			await fetchExcelFiles(tokenResponse.access_token);
// 		},
// 		onError: () => {
// 			setToken(null);
// 			setExcelFiles([]);
// 		},
// 	});

// 	const fetchExcelFiles = async (accessToken: string) => {
// 		setLoading(true);
// 		try {
// 			const res = await fetch(
// 				"https://www.googleapis.com/drive/v3/files?pageSize=50&fields=files(id,name,mimeType)",
// 				{ headers: { Authorization: `Bearer ${accessToken}` } },
// 			);
// 			const data = await res.json();
// 			const files = (data.files || []).filter(
// 				(file: { mimeType?: string; name?: string }) =>
// 					file.mimeType ===
// 						"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
// 					file.name?.endsWith(".xlsx"),
// 			);
// 			setExcelFiles(files);
// 			setFileModalOpen(true);
// 		} catch (e) {
// 			message.error("엑셀 파일 목록을 불러오지 못했습니다.");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	const handleFileSelect = async (fileId: string) => {
// 		if (!token) return;
// 		setLoading(true);
// 		try {
// 			// 1. 엑셀 파일을 구글 시트로 변환
// 			const copyRes = await fetch(
// 				`https://www.googleapis.com/drive/v3/files/${fileId}/copy`,
// 				{
// 					method: "POST",
// 					headers: {
// 						Authorization: `Bearer ${token}`,
// 						"Content-Type": "application/json",
// 					},
// 					body: JSON.stringify({
// 						mimeType: "application/vnd.google-apps.spreadsheet",
// 						name: "임시변환시트",
// 					}),
// 				},
// 			);
// 			const copyData = await copyRes.json();
// 			const spreadsheetId = copyData.id;

// 			// 2. 시트에서 셀 값 읽기
// 			const range = [
// 				"B3", // 제목
// 				"E11",
// 				"E12",
// 				"L11:M11",
// 				"L12:M12",
// 			];
// 			const sheetsRes = await fetch(
// 				`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${range
// 					.map((r) => encodeURIComponent(r))
// 					.join("&ranges=")}`,
// 				{ headers: { Authorization: `Bearer ${token}` } },
// 			);
// 			const sheetsData = await sheetsRes.json();
// 			const [b3, e11, e12, l11m11, l12m12]: [
// 				string[],
// 				string[],
// 				string[],
// 				string[],
// 				string[],
// 			] = sheetsData.valueRanges.map(
// 				(v: { values?: string[][] }) => v.values?.[0] || [],
// 			);
// 			const [title] = b3;
// 			const match = title?.match(/(\d{4})년 (\d{1,2})월/);
// 			if (!match) throw new Error("B3 셀에서 연월을 찾을 수 없습니다.");
// 			const year = match[1];
// 			const month = match[2];
// 			const totalAmountWithTax = Number(
// 				(e11[0] || "0").replace(/[^0-9.-]/g, ""),
// 			);
// 			const totalPaymentAmount = Number(
// 				(e12[0] || "0").replace(/[^0-9.-]/g, ""),
// 			);
// 			const totalPaymentSupplyAmount = l11m11.reduce(
// 				(sum: number, v: string) =>
// 					sum + Number((v || "0").replace(/[^0-9.-]/g, "")),
// 				0,
// 			);
// 			const totalSupplyAmount = l12m12.reduce(
// 				(sum: number, v: string) =>
// 					sum + Number((v || "0").replace(/[^0-9.-]/g, "")),
// 				0,
// 			);

// 			const aggregate: MonthlyAggregate = {
// 				year,
// 				month,
// 				totalAmountWithTax,
// 				totalPaymentAmount,
// 				totalPaymentSupplyAmount,
// 				totalSupplyAmount,
// 			};

// 			// 3. 파이어스토어에 저장 (업서트)
// 			const repo = new MonthlyAggregateRepository();
// 			await repo.save(aggregate);
// 			dispatch(setMonthlyAggregate(aggregate));
// 			message.success("월별 집계 데이터를 성공적으로 저장했습니다.");
// 			setFileModalOpen(false);
// 		} catch (e) {
// 			console.error(e);
// 			message.error(
// 				e instanceof Error ? e.message : "엑셀 데이터 처리에 실패했습니다.",
// 			);
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	const columns = [
// 		{
// 			title: "년도",
// 			dataIndex: "year",
// 			key: "year",
// 		},
// 		{
// 			title: "월",
// 			dataIndex: "month",
// 			key: "month",
// 		},
// 		{
// 			title: "총 세금 포함 금액",
// 			dataIndex: "totalAmountWithTax",
// 			key: "totalAmountWithTax",
// 			render: (value: number) => value.toLocaleString(),
// 		},
// 		{
// 			title: "총 지불 금액",
// 			dataIndex: "totalPaymentAmount",
// 			key: "totalPaymentAmount",
// 			render: (value: number) => value.toLocaleString(),
// 		},
// 		{
// 			title: "총 지불 공급 금액",
// 			dataIndex: "totalPaymentSupplyAmount",
// 			key: "totalPaymentSupplyAmount",
// 			render: (value: number) => value.toLocaleString(),
// 		},
// 		{
// 			title: "총 공급 금액",
// 			dataIndex: "totalSupplyAmount",
// 			key: "totalSupplyAmount",
// 			render: (value: number) => value.toLocaleString(),
// 		},
// 	];

// 	return (
// 		<GoogleOAuthProvider clientId={clientId}>
// 			<Button
// 				type="primary"
// 				onClick={() => (token ? fetchExcelFiles(token) : login())}
// 				loading={loading}
// 				style={{ marginBottom: 16 }}
// 			>
// 				엑셀 파일 가져오기
// 			</Button>
// 			<Modal
// 				title="엑셀 파일 선택"
// 				open={fileModalOpen}
// 				onCancel={() => setFileModalOpen(false)}
// 				footer={null}
// 			>
// 				<List
// 					dataSource={excelFiles}
// 					renderItem={(item) => (
// 						<List.Item>
// 							<button
// 								type="button"
// 								onClick={() => handleFileSelect(item.id)}
// 								style={{
// 									background: "none",
// 									border: "none",
// 									color: "#1677ff",
// 									cursor: "pointer",
// 									padding: 0,
// 								}}
// 							>
// 								{item.name}
// 							</button>
// 						</List.Item>
// 					)}
// 				/>
// 			</Modal>
// 			<Table
// 				columns={columns}
// 				dataSource={monthlyAggregate ? [monthlyAggregate] : []}
// 				rowKey={(record: MonthlyAggregate) => `${record.year}-${record.month}`}
// 			/>
// 		</GoogleOAuthProvider>
// 	);
// };
