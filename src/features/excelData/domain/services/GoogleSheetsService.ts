// src/features/excelData/domain/services/GoogleSheetsService.ts
import type {
	BatchGetResponse,
	ExcelData,
	GoogleSheetFile,
	SheetValueRange,
} from "../entities/ExcelData";

export class GoogleSheetsService {
	private accessToken: string;
	private cache: Map<string, any> = new Map(); // 🚀 캐시 추가

	constructor(accessToken: string) {
		this.accessToken = accessToken;
	}

	async fetchGoogleSheetFiles(): Promise<GoogleSheetFile[]> {
		// 🚀 최적화: 캐시 확인
		const cacheKey = "googleSheetFiles";
		if (this.cache.has(cacheKey)) {
			console.log("📦 캐시에서 파일 목록 반환");
			return this.cache.get(cacheKey);
		}

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
		const files = data.files || [];

		// 🚀 캐시 저장 (5분간 유지)
		this.cache.set(cacheKey, files);
		setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);

		return files;
	}

	// 🚀 최적화: Excel 파일을 구글 스프레드시트로 변환 (병렬 처리 준비)
	private async convertExcelToGoogleSheet(
		excelFileId: string,
		originalName: string,
	): Promise<string> {
		// 캐시 확인 - 이미 변환된 파일이 있는지 체크
		const cacheKey = `converted_${excelFileId}`;
		if (this.cache.has(cacheKey)) {
			console.log("📦 캐시에서 변환된 파일 ID 반환");
			return this.cache.get(cacheKey);
		}

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
					name: `임시변환_${originalName}_${Date.now()}`, // 🚀 타임스탬프로 고유성 보장
				}),
			},
		);

		if (!response.ok) {
			let errorInfo = "";
			try {
				const errorBody = await response.json();
				errorInfo = JSON.stringify(errorBody, null, 2);
				console.error("Google Drive API 에러 상세:", errorInfo);
			} catch (jsonError) {
				errorInfo = await response.text();
				console.error("Google Drive API 에러 응답:", errorInfo);
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

		// 🚀 변환된 파일 ID 캐시 (30분간 유지)
		this.cache.set(cacheKey, convertedFile.id);
		setTimeout(() => this.cache.delete(cacheKey), 30 * 60 * 1000);

		return convertedFile.id;
	}

	// 🚀 최적화: 비동기 삭제로 변경
	private async deleteTemporaryFile(fileId: string): Promise<void> {
		// 메인 로직을 블록하지 않도록 백그라운드에서 실행
		setTimeout(async () => {
			try {
				await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
					method: "DELETE",
					headers: { Authorization: `Bearer ${this.accessToken}` },
				});
				console.log(`🗑️ 임시 파일 삭제 완료: ${fileId}`);
			} catch (error) {
				console.warn(`임시 파일 삭제 실패: ${fileId}`, error);
			}
		}, 1000); // 1초 후 삭제 (메인 로직 완료 후)
	}

	// 🚀 최적화: 파일 정보 캐싱
	private async getFileMimeType(fileId: string): Promise<string> {
		const cacheKey = `mimeType_${fileId}`;
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey);
		}

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

		// 캐시 저장 (1시간 유지)
		this.cache.set(cacheKey, fileInfo.mimeType);
		setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);

		return fileInfo.mimeType;
	}

	// 🚀 최적화: 연월 추출 캐싱 및 병렬 처리
	async extractYearMonthFromSheet(
		spreadsheetId: string,
	): Promise<{ year: string; month: string }> {
		const cacheKey = `yearMonth_${spreadsheetId}`;
		if (this.cache.has(cacheKey)) {
			console.log("📦 캐시에서 연월 정보 반환");
			return this.cache.get(cacheKey);
		}

		let actualSpreadsheetId = spreadsheetId;
		let tempFileId: string | null = null;

		try {
			// 🚀 병렬 처리: 파일 타입 확인과 동시에 다른 작업 준비
			const [mimeType] = await Promise.all([
				this.getFileMimeType(spreadsheetId),
				// 필요시 다른 병렬 작업 추가 가능
			]);

			// Excel 파일인 경우 변환 수행
			if (
				mimeType ===
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			) {
				console.log("📄 Excel 파일 감지, 변환 시작...");
				tempFileId = await this.convertExcelToGoogleSheet(
					spreadsheetId,
					"temp",
				);
				actualSpreadsheetId = tempFileId;
				console.log("✅ Excel 변환 완료");
			}

			console.log("📥 시트에서 연월 정보 추출 중...");
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
			const result = { year, month };

			// 🚀 결과 캐싱 (1시간 유지)
			this.cache.set(cacheKey, result);
			setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);

			console.log(`✅ 연월 추출 완료: ${year}-${month}`);
			return result;
		} finally {
			// 🚀 비동기 정리 (메인 로직 블록하지 않음)
			if (tempFileId) {
				this.deleteTemporaryFile(tempFileId);
			}
		}
	}

	// 🚀 최대 최적화: 시트 데이터 가져오기
	async fetchSheetData(spreadsheetId: string): Promise<ExcelData[]> {
		console.log("🚀 시트 데이터 가져오기 시작...");
		const startTime = performance.now();

		let actualSpreadsheetId = spreadsheetId;
		let tempFileId: string | null = null;

		try {
			// 🚀 1단계: 파일 타입 확인 (캐시 활용)
			console.log("📋 파일 타입 확인 중...");
			const mimeType = await this.getFileMimeType(spreadsheetId);

			// 🚀 2단계: Excel 변환 (필요시)
			if (
				mimeType ===
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			) {
				console.log("📄 Excel 파일 변환 중...");
				const conversionStart = performance.now();
				tempFileId = await this.convertExcelToGoogleSheet(
					spreadsheetId,
					"temp",
				);
				actualSpreadsheetId = tempFileId;
				console.log(
					`✅ Excel 변환 완료 (${Math.round(performance.now() - conversionStart)}ms)`,
				);
			}

			// 🚀 3단계: 병렬 데이터 가져오기 (가장 중요한 최적화)
			console.log("📊 시트 데이터 가져오기 중...");
			const dataFetchStart = performance.now();

			// 필요한 범위들 정의 (14행부터 끝까지)
			const ranges = [
				"C14:C", // 날짜
				"D14:D", // 차량번호
				"E14:E", // 운송구간
				"L14:L", // 그룹
				"M14:M", // 지급 중량
				"N14:N", // 지급 단가
				"O14:O", // 금액 (O열)
				"I14:I", // 금액 (I열)
				"P14:P", // 비고
				"Q14:Q", // 금액 (Q열)
			];

			// 🚀 한 번의 API 호출로 모든 범위 가져오기 (기존 방식 유지하되 성능 측정)
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
			console.log(
				`📥 데이터 가져오기 완료 (${Math.round(performance.now() - dataFetchStart)}ms)`,
			);

			// 🚀 4단계: 데이터 변환 최적화
			console.log("🔄 데이터 변환 중...");
			const transformStart = performance.now();

			const valueRanges = batchData.valueRanges;

			// 🚀 최적화된 컬럼 데이터 추출 함수
			const extractColumnData = (rangeIndex: number): string[] => {
				const range = valueRanges[rangeIndex];
				if (!range.values) return [];

				// 🚀 map 사용으로 성능 향상
				return range.values.map((row) => {
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
			};

			// 🚀 병렬로 모든 컬럼 데이터 추출
			const [
				dateValues,
				vehicleNumbers,
				transportRoutes,
				groups,
				weights,
				unitPrices,
				columnOAmount,
				columnIAmount,
				memos,
				columnQAmount,
			] = await Promise.all([
				Promise.resolve(extractColumnData(0)), // C열
				Promise.resolve(extractColumnData(1)), // D열
				Promise.resolve(extractColumnData(2)), // E열
				Promise.resolve(extractColumnData(3)), // L열
				Promise.resolve(extractColumnData(4)), // M열
				Promise.resolve(extractColumnData(5)), // N열
				Promise.resolve(extractColumnData(6)), // O열
				Promise.resolve(extractColumnData(7)), // I열
				Promise.resolve(extractColumnData(8)), // P열
				Promise.resolve(extractColumnData(9)), // Q열
			]);

			// 🚀 5단계: 효율적인 데이터 변환
			const excelData: ExcelData[] = [];
			const maxLength = Math.max(
				dateValues.length,
				vehicleNumbers.length,
				transportRoutes.length,
				groups.length,
				weights.length,
			);

			// 🚀 for 루프로 성능 최적화 (forEach보다 빠름)
			for (let i = 0; i < maxLength; i++) {
				const dateStr = dateValues[i]?.trim();
				if (!dateStr) continue;

				let year: string;
				let month: string;
				let day: string;

				// 🚀 정규식 매칭 최적화
				if (dateStr.includes("-")) {
					// yyyy-mm-dd 형식
					[year, month, day] = dateStr.split("-");
				} else if (dateStr.includes("/")) {
					// yyyy/mm/dd 형식
					[year, month, day] = dateStr.split("/");
				} else if (dateStr.includes(".")) {
					// yyyy. mm. dd 형식 (공백 포함)
					const parts = dateStr.split(".").map((part) => part.trim());
					[year, month, day] = parts;
				} else {
					// 기타 형식들은 건너뛰기
					continue;
				}

				const vehicleNumber = vehicleNumbers[i]?.trim() || "";
				const transportRoute = transportRoutes[i]?.trim() || "";

				// 필수 데이터 검증
				if (!vehicleNumber && !transportRoute) {
					continue;
				}

				// 🚀 숫자 파싱 최적화
				const iAmountStr = columnIAmount[i]?.toString() || "";
				const iAmountMatch = iAmountStr.match(/[\d,]+/);
				const parsedIAmount = iAmountMatch
					? Number(iAmountMatch[0].replace(/,/g, ""))
					: 0;

				// 🚀 객체 생성 최적화
				const rowData: ExcelData = {
					year,
					month: month.padStart(2, "0"),
					day: day.padStart(2, "0"),
					group: groups[i]?.trim() || "",
					vehicleNumber: vehicleNumber || "",
					transportRoute: transportRoute || "",
					chargeableWeight: Number(weights[i]) || 0,
					unitPrice: unitPrices[i] ? Number(unitPrices[i]) : 0,
					columnIAmount: parsedIAmount,
					columnOAmount: columnOAmount[i] ? Number(columnOAmount[i]) : 0,
					memo: memos[i]?.trim() || "",
					columnQAmount: columnQAmount[i] ? Number(columnQAmount[i]) : 0,
				};

				excelData.push(rowData);
			}

			const transformTime = Math.round(performance.now() - transformStart);
			const totalTime = Math.round(performance.now() - startTime);

			console.log(`🔄 데이터 변환 완료 (${transformTime}ms)`);
			console.log(`✅ 전체 작업 완료 (${totalTime}ms)`);
			console.log(`📊 최종 데이터: ${excelData.length}개 항목`);

			if (excelData.length > 0) {
				console.log("  첫 항목:", excelData[0]);
				console.log("  마지막 항목:", excelData[excelData.length - 1]);
			}

			return excelData;
		} finally {
			// 🚀 비동기 정리 (메인 로직 블록하지 않음)
			if (tempFileId) {
				this.deleteTemporaryFile(tempFileId);
			}
		}
	}

	// 🚀 캐시 클리어 메서드 (필요시 사용)
	clearCache(): void {
		this.cache.clear();
		console.log("🧹 캐시 클리어 완료");
	}
}
