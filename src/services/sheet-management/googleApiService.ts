import type { DriveFile } from "../../types/sheets";

export class GoogleApiService {
	private accessToken: string;

	constructor(accessToken: string) {
		this.accessToken = accessToken;
	}

	/**
	 * Google Drive에서 Excel 파일 및 구글 시트 파일 목록 가져오기 (휴지통 제외)
	 */
	async getDriveExcelFiles(): Promise<DriveFile[]> {
		try {
			// 휴지통에 있지 않은 Excel 파일과 구글 시트 파일만 가져오기
			const query =
				"(mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' or mimeType='application/vnd.ms-excel' or mimeType='application/vnd.google-apps.spreadsheet') and trashed=false";

			const response = await fetch(
				`https://www.googleapis.com/drive/v3/files?pageSize=100&fields=files(id,name,mimeType,modifiedTime,size)&q=${encodeURIComponent(query)}&orderBy=modifiedTime desc`,
				{
					headers: { Authorization: `Bearer ${this.accessToken}` },
				},
			);

			if (!response.ok) {
				throw new Error("구글 드라이브 접근 실패");
			}

			const data: { files: DriveFile[] } = await response.json();
			return data.files || [];
		} catch (error) {
			throw new Error(`Failed to get drive files: ${error}`);
		}
	}

	/**
	 * Excel 파일을 구글 스프레드시트로 변환 (임시)
	 */
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
					name: `변환된_${originalName}`,
				}),
			},
		);

		if (!response.ok) {
			let errorInfo = "";
			try {
				const errorBody = await response.json();
				errorInfo = JSON.stringify(errorBody, null, 2);
			} catch {
				errorInfo = await response.text();
			}

			if (response.status === 403) {
				throw new Error(
					`Google Drive 파일에 대한 복사 권한이 없습니다. 파일 소유자에게 문의하거나 편집 권한을 요청하세요.\n상세 정보: ${errorInfo || "없음"}`,
				);
			}

			throw new Error(
				`Excel 파일을 구글 스프레드시트로 변환하지 못했습니다 (상태: ${response.status}).\n상세 정보: ${errorInfo || "없음"}`,
			);
		}

		const convertedFile = await response.json();
		return convertedFile.id;
	}

	/**
	 * 임시 변환 파일 삭제
	 */
	private async deleteTemporaryFile(fileId: string): Promise<void> {
		try {
			await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${this.accessToken}` },
			});
		} catch (error) {
			// 임시 파일 삭제 실패는 무시
		}
	}

	/**
	 * 파일 타입 확인
	 */
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

	/**
	 * 구글 시트에서 지정된 범위의 데이터 가져오기
	 */
	async getSheetData(sheetId: string): Promise<(string | number)[][]> {
		let actualSpreadsheetId = sheetId;
		let tempFileId: string | null = null;

		try {
			// 파일 타입 확인
			const mimeType = await this.getFileMimeType(sheetId);

			// Excel 파일인 경우 변환 수행
			if (
				mimeType ===
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			) {
				tempFileId = await this.convertExcelToGoogleSheet(sheetId, "temp");
				actualSpreadsheetId = tempFileId;
			}

			// 필요한 범위들 정의 (14행부터 끝까지)
			const ranges = [
				"C14:C", // 날짜
				"D14:D", // 차량번호
				"E14:E", // 운송구간
				"G14:G", // 중량
				"H14:H", // 청구 단가
				"L14:L", // 매입처
				"M14:M", // 지급 중량
				"N14:N", // 지급 단가
				"P14:P", // 비고
				"Q14:Q", // 지급 금액
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
				throw new Error(
					`시트 데이터 가져오기 실패: ${response.status} ${response.statusText}`,
				);
			}

			const batchData = await response.json();
			const valueRanges = batchData.valueRanges || [];

			// 각 열의 데이터 추출
			const extractColumnData = (rangeIndex: number): (string | number)[] => {
				const range = valueRanges[rangeIndex];
				if (!range?.values) return [];

				return range.values.map((row: (string | number)[]) => {
					const cellValue = row[0];

					// Excel 시리얼 날짜는 그대로 전달 (transformRowToRawData에서 처리)
					if (rangeIndex === 0 && typeof cellValue === "number") {
						return cellValue;
					}

					return cellValue?.toString() || "";
				});
			};

			// 각 열별 데이터 추출
			const dateValues = extractColumnData(0); // C열
			const vehicleNumbers = extractColumnData(1); // D열
			const transportRoutes = extractColumnData(2); // E열
			const weights = extractColumnData(3); // G열
			const billingUnitPrices = extractColumnData(4); // H열
			const suppliers = extractColumnData(5); // L열
			const payOutweights = extractColumnData(6); // M열
			const unitPrices = extractColumnData(7); // N열
			const memos = extractColumnData(8); // P열
			const payoutAmount = extractColumnData(9); // Q열

			// 가장 긴 열을 기준으로 행 개수 결정
			const maxLength = Math.max(
				dateValues.length,
				vehicleNumbers.length,
				transportRoutes.length,
				weights.length,
			);

			// 데이터 변환
			const rows: (string | number)[][] = [];
			for (let i = 0; i < maxLength; i++) {
				const dateStr = dateValues[i]?.toString().trim();
				if (!dateStr) continue;

				const vehicleNumber = vehicleNumbers[i]?.toString().trim() || "";
				const transportRoute = transportRoutes[i]?.toString().trim() || "";

				// 필수 데이터 검증
				if (!vehicleNumber && !transportRoute) {
					continue;
				}

				const row: (string | number)[] = [];
				// C, D, E, L, M, N, O, I, P, Q 순서로 배치
				row[2] = dateValues[i] || ""; // C열 (string)
				row[3] = vehicleNumbers[i] || ""; // D열 (string)
				row[4] = transportRoutes[i] || ""; // E열 (string)
				row[6] = Number(weights[i]) || 0; // G열 (number)
				row[7] = Number(billingUnitPrices[i]) || 0; // H열 (number)
				row[11] = suppliers[i] || ""; // L열 (string)
				row[12] = Number(payOutweights[i]) || 0; // M열 (number)
				row[13] = Number(unitPrices[i]) || 0; // N열 (number)
				row[15] = memos[i] || ""; // P열 (string)
				row[16] = Number(payoutAmount[i]) || 0; // Q열 (number)

				rows.push(row);
			}

			return rows;
		} catch (error) {
			throw new Error(`Failed to get sheet data: ${error}`);
		} finally {
			// 임시 변환 파일이 있다면 정리
			if (tempFileId) {
				await this.deleteTemporaryFile(tempFileId);
			}
		}
	}

	/**
	 * 구글 시트의 시트 목록 가져오기
	 */
	async getSheetNames(sheetId: string): Promise<string[]> {
		let actualSpreadsheetId = sheetId;
		let tempFileId: string | null = null;

		try {
			// 파일 타입 확인
			const mimeType = await this.getFileMimeType(sheetId);

			// Excel 파일인 경우 변환 수행
			if (
				mimeType ===
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			) {
				tempFileId = await this.convertExcelToGoogleSheet(sheetId, "temp");
				actualSpreadsheetId = tempFileId;
			}

			const response = await fetch(
				`https://sheets.googleapis.com/v4/spreadsheets/${actualSpreadsheetId}?fields=sheets.properties.title`,
				{
					headers: { Authorization: `Bearer ${this.accessToken}` },
				},
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`Failed to get sheet names: ${response.status} - ${errorText}`,
				);
			}

			const data = await response.json();
			const sheets = data.sheets || [];
			const sheetNames = sheets
				.filter(
					(sheet: { properties?: { title?: string } }) =>
						sheet.properties?.title,
				)
				.map(
					(sheet: { properties: { title: string } }) => sheet.properties.title,
				)
				.filter((sheetName: string) => {
					// mm월dd일 형식이 포함되어 있는지 확인 (예: "7월15일", "7월1일 (화)")
					const datePattern = /\d{1,2}월\d{1,2}일/;
					const isValidDateSheet = datePattern.test(sheetName);

					return isValidDateSheet;
				});

			return sheetNames;
		} catch (error) {
			throw new Error(`Failed to get sheet names: ${error}`);
		} finally {
			// 임시 변환 파일이 있다면 정리
			if (tempFileId) {
				await this.deleteTemporaryFile(tempFileId);
			}
		}
	}

	/**
	 * 파일 삭제
	 */
	async deleteFile(fileId: string): Promise<void> {
		try {
			await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${this.accessToken}` },
			});
		} catch (error) {
			throw new Error(`Failed to delete file: ${error}`);
		}
	}

	/**
	 * 구글 시트의 메타데이터 가져오기
	 */
	async getSheetMetadata(sheetId: string) {
		try {
			const response = await fetch(
				`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=properties,sheets.properties`,
				{
					headers: { Authorization: `Bearer ${this.accessToken}` },
				},
			);

			if (!response.ok) {
				throw new Error(`Failed to get sheet metadata: ${response.status}`);
			}

			return response.json();
		} catch (error) {
			throw new Error(`Failed to get sheet metadata: ${error}`);
		}
	}
}
