import type {
	BatchGetResponse,
	ExcelData,
	GoogleSheetFile,
	SheetValueRange,
} from "../entities/ExcelData";

export class GoogleSheetsService {
	private accessToken: string;

	constructor(accessToken: string) {
		this.accessToken = accessToken;
	}

	async fetchGoogleSheetFiles(): Promise<GoogleSheetFile[]> {
		// 구글 스프레드시트 + Excel 파일 모두 가져오기
		const query =
			"(mimeType='application/vnd.google-apps.spreadsheet' or mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') and trashed=false";

		const response = await fetch(
			`https://www.googleapis.com/drive/v3/files?pageSize=100&fields=files(id,name,mimeType,owners,shared,trashed)&q=${encodeURIComponent(query)}&orderBy=name`,
			{
				headers: { Authorization: `Bearer ${this.accessToken}` },
			},
		);

		if (!response.ok) {
			throw new Error("구글 드라이브 접근 실패");
		}

		const data: { files: GoogleSheetFile[] } = await response.json();
		return data.files || [];
	}

	// Excel 파일을 구글 스프레드시트로 변환하는 메서드
	private async convertExcelToGoogleSheet(
		excelFileId: string,
		originalName: string,
	): Promise<string> {
		const response = await fetch(
			`https://www.googleapis.com/drive/v3/files/${excelFileId}/copy`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					mimeType: "application/vnd.google-apps.spreadsheet",
					name: `임시변환_${originalName}`,
				}),
			},
		);

		if (!response.ok) {
			throw new Error("Excel 파일을 구글 스프레드시트로 변환하지 못했습니다.");
		}

		const convertedFile = await response.json();
		return convertedFile.id; // 변환된 구글 시트 ID 반환
	}

	// 변환된 임시 파일 삭제
	private async deleteTemporaryFile(fileId: string): Promise<void> {
		try {
			await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${this.accessToken}` },
			});
		} catch (error) {
			// 에러가 발생해도 메인 로직에는 영향 없도록 함
		}
	}

	// 파일 타입 확인 메서드
	private async getFileMimeType(fileId: string): Promise<string> {
		const response = await fetch(
			`https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType,name`,
			{
				headers: { Authorization: `Bearer ${this.accessToken}` },
			},
		);

		if (!response.ok) {
			throw new Error("파일 정보를 가져올 수 없습니다.");
		}

		const fileInfo = await response.json();
		return fileInfo.mimeType;
	}

	async extractYearMonthFromSheet(
		spreadsheetId: string,
	): Promise<{ year: string; month: string }> {
		let actualSpreadsheetId = spreadsheetId;
		let tempFileId: string | null = null;

		try {
			// 파일 타입 확인
			const mimeType = await this.getFileMimeType(spreadsheetId);

			// Excel 파일인 경우 변환 수행
			if (
				mimeType ===
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			) {
				tempFileId = await this.convertExcelToGoogleSheet(
					spreadsheetId,
					"temp",
				);
				actualSpreadsheetId = tempFileId;
			}

			const response = await fetch(
				`https://sheets.googleapis.com/v4/spreadsheets/${actualSpreadsheetId}/values/B3:J3`,
				{
					headers: { Authorization: `Bearer ${this.accessToken}` },
				},
			);

			if (!response.ok) {
				throw new Error("시트에서 연월 정보 추출 실패");
			}

			const data: SheetValueRange = await response.json();
			const values = data.values?.[0];

			if (!values || values.length === 0) {
				throw new Error("B3:J3 범위에서 데이터를 찾을 수 없습니다");
			}

			// 'yyyy년 mm월 거래명세서' 형식에서 연월 추출
			let titleText = "";
			for (const cell of values) {
				if (cell?.includes("년") && cell?.includes("월")) {
					titleText = cell;
					break;
				}
			}

			if (!titleText) {
				throw new Error("거래명세서 제목을 찾을 수 없습니다");
			}

			const yearMonthMatch = titleText.match(/(\d{4})년\s*(\d{1,2})월/);
			if (!yearMonthMatch) {
				throw new Error("연월 형식을 파싱할 수 없습니다");
			}

			const year = yearMonthMatch[1];
			const month = yearMonthMatch[2].padStart(2, "0");

			return { year, month };
		} finally {
			// 임시 변환 파일이 있다면 정리
			if (tempFileId) {
				await this.deleteTemporaryFile(tempFileId);
			}
		}
	}

	async fetchSheetData(spreadsheetId: string): Promise<ExcelData[]> {
		let actualSpreadsheetId = spreadsheetId;
		let tempFileId: string | null = null;

		try {
			// 파일 타입 확인
			const mimeType = await this.getFileMimeType(spreadsheetId);

			// Excel 파일인 경우 변환 수행
			if (
				mimeType ===
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			) {
				tempFileId = await this.convertExcelToGoogleSheet(
					spreadsheetId,
					"temp",
				);
				actualSpreadsheetId = tempFileId;
			}

			// 필요한 범위들 정의 (14행부터 끝까지)
			const ranges = [
				"C14:C", // 날짜
				"D14:D", // 차량번호
				"E14:E", // 운송구간
				"L14:L", // 그룹
				"M14:M", // 지급 중량
				"N14:N", // 지급 단가
				"O14:O", // 금액
				"P14:P", // 비고
			];

			const response = await fetch(
				`https://sheets.googleapis.com/v4/spreadsheets/${actualSpreadsheetId}/values:batchGet?ranges=${ranges
					.map((r) => encodeURIComponent(r))
					.join("&ranges=")}&valueRenderOption=UNFORMATTED_VALUE`,
				{
					headers: { Authorization: `Bearer ${this.accessToken}` },
				},
			);

			if (!response.ok) {
				throw new Error("시트 데이터 가져오기 실패");
			}

			const batchData: BatchGetResponse = await response.json();
			const valueRanges = batchData.valueRanges;

			// 각 열의 데이터 추출
			const extractColumnData = (rangeIndex: number): string[] => {
				const range = valueRanges[rangeIndex];
				if (!range.values) return [];

				const extracted = range.values.map((row) => {
					let cellValue = row[0];
					if (rangeIndex === 0 && typeof cellValue === "number") {
						// Excel 시리얼 날짜를 JavaScript Date로 변환 (1899-12-30 기준)
						const excelEpochUTC = Date.UTC(1899, 11, 30);
						const jsDate = new Date(
							excelEpochUTC + cellValue * 24 * 60 * 60 * 1000,
						);
						cellValue = jsDate.toISOString().split("T")[0]; // yyyy-mm-dd 형식
					}
					return cellValue?.toString() || "";
				});

				return extracted;
			};

			const dateValues = extractColumnData(0); // C열
			const vehicleNumbers = extractColumnData(1); // D열
			const transportRoutes = extractColumnData(2); // E열
			const groups = extractColumnData(3); // L열
			const weights = extractColumnData(4); // M열
			const unitPrices = extractColumnData(5); // N열
			const amounts = extractColumnData(6); // O열
			const memos = extractColumnData(7); // P열

			// 데이터 변환
			const excelData: ExcelData[] = [];
			const maxLength = Math.max(
				dateValues.length,
				vehicleNumbers.length,
				transportRoutes.length,
				groups.length,
				weights.length,
			);

			for (let i = 0; i < maxLength; i++) {
				const dateStr = dateValues[i]?.trim();
				if (!dateStr) continue;

				let year: string;
				let month: string;
				let day: string;

				// yyyy-mm-dd 형식
				if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
					[year, month, day] = dateStr.split("-");
				}
				// yyyy/mm/dd 형식
				else if (dateStr.match(/^\d{4}\/\d{1,2}\/\d{1,2}$/)) {
					[year, month, day] = dateStr.split("/");
				}
				// yyyy. mm. dd 형식 (공백 포함)
				else if (dateStr.match(/^\d{4}\.\s*\d{1,2}\.\s*\d{1,2}$/)) {
					const parts = dateStr.split(".").map((part) => part.trim());
					[year, month, day] = parts;
				}
				// mm/dd 형식 (연도 없음) - 처리하지 않고 건너뛰기
				else if (dateStr.match(/^\d{1,2}\/\d{1,2}$/)) {
					continue;
				}
				// 기타 형식들 처리
				else {
					continue;
				}

				const vehicleNumber = vehicleNumbers[i]?.trim() || "";
				const transportRoute = transportRoutes[i]?.trim() || "";

				// 필수 데이터 검증
				if (!vehicleNumber && !transportRoute) {
					continue;
				}

				const rowData: ExcelData = {
					year,
					month: month.padStart(2, "0"),
					day: day.padStart(2, "0"),
					group: groups[i]?.trim() || "",
					vehicleNumber: vehicleNumber || "",
					transportRoute: transportRoute || "",
					chargeableWeight: Number(weights[i]) || 0,
					unitPrice: unitPrices[i] ? Number(unitPrices[i]) : 0,
					amount: amounts[i] ? Number(amounts[i]) : 0,
					memo: memos[i]?.trim() || "",
				};

				excelData.push(rowData);
			}

			console.log(`전송할 최종 데이터 (${excelData.length}개):`);
			if (excelData.length > 0) {
				console.log("  첫 항목:", excelData[0]);
				console.log("  마지막 항목:", excelData[excelData.length - 1]);
			}
			return excelData;
		} finally {
			// 임시 변환 파일이 있다면 정리
			if (tempFileId) {
				await this.deleteTemporaryFile(tempFileId);
			}
		}
	}
}
