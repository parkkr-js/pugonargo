/**
 * 배차 시트 데이터 수집
 * - Drive 파일 타입 확인(Excel → Google Sheets 변환 필요시 변환)
 * - Sheets API로 values(formattedValue, note) + merges 메타데이터 조회
 * - merges 범위를 좌상단 값으로 채워 2차원 배열로 반환
 */
import type { SheetDataResponse } from "../../types/dispatch";

/**
 * 지정 시트의 values와 원본 응답 반환
 */
export async function fetchSheetData(
	spreadsheetId: string,
	sheetName: string,
	accessToken: string,
): Promise<{ sheetData: unknown[][]; originalData: SheetDataResponse }> {
	try {
		// 파일 타입 확인 (Excel → Google Sheets 변환 처리)
		const fileResponse = await fetch(
			`https://www.googleapis.com/drive/v3/files/${spreadsheetId}?fields=mimeType`,
			{
				headers: { Authorization: `Bearer ${accessToken}` },
			},
		);

		if (!fileResponse.ok) {
			throw new Error(`파일 정보 가져오기 실패: ${fileResponse.status}`);
		}

		const fileData = await fileResponse.json();
		const mimeType = fileData.mimeType;
		const originalName = fileData.name || "unknown";
		let actualSpreadsheetId = spreadsheetId;

		if (
			mimeType ===
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
			mimeType === "application/vnd.ms-excel"
		) {
			const convertResponse = await fetch(
				`https://www.googleapis.com/drive/v3/files/${spreadsheetId}/copy`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${accessToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						mimeType: "application/vnd.google-apps.spreadsheet",
						name: `변환된_${originalName}`,
					}),
				},
			);

			if (!convertResponse.ok) {
				throw new Error(`Excel 변환 실패: ${convertResponse.status}`);
			}

			const convertedFile = await convertResponse.json();
			actualSpreadsheetId = convertedFile.id;

			// 임시 파일 삭제는 실패해도 무시
			setTimeout(async () => {
				try {
					await fetch(
						`https://www.googleapis.com/drive/v3/files/${actualSpreadsheetId}`,
						{
							method: "DELETE",
							headers: { Authorization: `Bearer ${accessToken}` },
						},
					);
				} catch {}
			}, 3000);
		}

		// values + merges 조회
		const response = await fetch(
			`https://sheets.googleapis.com/v4/spreadsheets/${actualSpreadsheetId}?ranges=${encodeURIComponent(`${sheetName}!A:Z`)}&fields=sheets.merges,sheets.data.rowData.values.formattedValue,sheets.data.rowData.values.note`,
			{
				headers: { Authorization: `Bearer ${accessToken}` },
			},
		);

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`API 호출 실패: ${response.status} - ${errorText}`);
		}

		const data: SheetDataResponse = await response.json();
		if (!data.sheets?.[0]?.data?.[0]?.rowData) {
			throw new Error("시트 데이터를 찾을 수 없습니다.");
		}

		// values → 2차원 배열
		const sheetData: unknown[][] = [];
		const rowData = data.sheets[0].data[0].rowData;
		for (let i = 0; i < rowData.length; i++) {
			const row = rowData[i];
			const rowValues: unknown[] = [];
			if (row.values) {
				for (let j = 0; j < row.values.length; j++) {
					const cell = row.values[j];
					rowValues.push(
						cell.formattedValue !== undefined ? cell.formattedValue : "",
					);
				}
			}
			sheetData.push(rowValues);
		}

		// merges로 병합 영역 채우기 (좌상단 값으로)
		const merges = data.sheets?.[0]?.merges ?? [];
		for (const merge of merges) {
			const sr = merge.startRowIndex ?? 0;
			const er = merge.endRowIndex ?? 0;
			const sc = merge.startColumnIndex ?? 0;
			const ec = merge.endColumnIndex ?? 0;
			const master = sheetData[sr]?.[sc];
			for (let r = sr; r < er; r++) {
				for (let c = sc; c < ec; c++) {
					if (r === sr && c === sc) continue;
					if (sheetData[r]) sheetData[r][c] = master ?? sheetData[r][c];
				}
			}
		}

		return { sheetData, originalData: data };
	} catch (error) {
		throw new Error(`시트 데이터 가져오기 실패: ${error}`);
	}
}
