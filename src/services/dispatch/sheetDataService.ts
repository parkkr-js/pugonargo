/**
 * Google Sheets API를 사용하여 시트 데이터를 추출하는 서비스
 */

export interface SheetDataResponse {
	sheets?: {
		data?: {
			rowData?: {
				values?: {
					formattedValue?: string;
					note?: string;
				}[];
			}[];
		}[];
	}[];
}

/**
 * 시트 데이터 추출
 */
export async function fetchSheetData(
	spreadsheetId: string,
	sheetName: string,
	accessToken: string,
): Promise<{ sheetData: unknown[][]; originalData: SheetDataResponse }> {
	try {
		// 먼저 파일 타입 확인
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
		let actualSpreadsheetId = spreadsheetId;

		// Excel 파일인 경우 Google Sheets로 변환
		if (
			mimeType ===
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
			mimeType === "application/vnd.ms-excel"
		) {
			console.log("Excel 파일을 Google Sheets로 변환 중...");

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
						name: `임시변환_${Date.now()}`,
					}),
				},
			);

			if (!convertResponse.ok) {
				throw new Error(`Excel 변환 실패: ${convertResponse.status}`);
			}

			const convertedFile = await convertResponse.json();
			actualSpreadsheetId = convertedFile.id;
			console.log("변환된 파일 ID:", actualSpreadsheetId);

			// 임시 파일이므로 나중에 삭제
			setTimeout(async () => {
				try {
					await fetch(
						`https://www.googleapis.com/drive/v3/files/${actualSpreadsheetId}`,
						{
							method: "DELETE",
							headers: { Authorization: `Bearer ${accessToken}` },
						},
					);
					console.log("임시 변환 파일 삭제 완료");
				} catch (error) {
					console.error("임시 파일 삭제 실패:", error);
				}
			}, 30000); // 30초 후 삭제
		}

		// 시트 데이터 가져오기
		const response = await fetch(
			`https://sheets.googleapis.com/v4/spreadsheets/${actualSpreadsheetId}?ranges=${encodeURIComponent(`${sheetName}!A:Z`)}&fields=sheets.data.rowData.values.formattedValue,sheets.data.rowData.values.note`,
			{
				headers: { Authorization: `Bearer ${accessToken}` },
			},
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error("API 응답:", errorText);
			throw new Error(`API 호출 실패: ${response.status} - ${errorText}`);
		}

		const data: SheetDataResponse = await response.json();

		if (!data.sheets?.[0]?.data?.[0]?.rowData) {
			throw new Error("시트 데이터를 찾을 수 없습니다.");
		}

		// 2차원 배열로 변환
		const sheetData: unknown[][] = [];
		const rowData = data.sheets[0].data[0].rowData;

		console.log("=== 시트 데이터 변환 시작 ===");
		console.log("원본 rowData 길이:", rowData.length);

		for (let i = 0; i < rowData.length; i++) {
			const row = rowData[i];
			const rowValues: unknown[] = [];

			if (row.values) {
				for (let j = 0; j < row.values.length; j++) {
					const cell = row.values[j];
					if (cell.formattedValue !== undefined) {
						rowValues.push(cell.formattedValue);
					} else {
						rowValues.push("");
					}
				}
			}

			sheetData.push(rowValues);

			// 처음 몇 행만 로그 출력
			if (i < 10) {
				console.log(`행 ${i}:`, rowValues.slice(0, 10)); // 처음 10개 셀만 출력
			}
		}

		console.log("=== 시트 데이터 변환 완료 ===");
		console.log("변환된 sheetData 길이:", sheetData.length);

		return { sheetData, originalData: data };
	} catch (error) {
		console.error("시트 데이터 가져오기 실패:", error);
		throw new Error(`시트 데이터 가져오기 실패: ${error}`);
	}
}

/**
 * 셀 메모 추출
 */
export function extractCellMemo(
	sheetData: SheetDataResponse,
	colIndex: number,
	rowIndex: number,
): string | undefined {
	try {
		const rowData = sheetData.sheets?.[0]?.data?.[0]?.rowData;
		if (!rowData || !rowData[rowIndex]?.values?.[colIndex]) {
			return undefined;
		}

		const cell = rowData[rowIndex]?.values?.[colIndex];
		return cell?.note || undefined;
	} catch (error) {
		console.error("셀 메모 추출 실패:", error);
		return undefined;
	}
}
