import type { DispatchData, SheetDataResponse } from "../../types/dispatch";

/**
 * 파일명에서 년도 추출
 *
 * 예시: "배차(2024년) 1월.xlsx" → "2024"
 *
 * @param fileName - Google Drive 파일명
 * @returns 4자리 년도 문자열, 매칭되지 않으면 현재 년도
 */
export function extractYearFromFileName(fileName: string): string {
	const match = fileName.match(/배차\s*\((\d{4})년/);
	return match ? match[1] : new Date().getFullYear().toString();
}

/**
 * 시트 이름에서 날짜 추출 (n월d일 형식)
 *
 * 예시: "7월15일" → "2024-07-15"
 *
 * @param sheetName - 시트 이름 (예: "7월15일", "12월31일")
 * @param fileName - 파일명 (년도 추출용)
 * @returns YYYY-MM-DD 형식의 날짜 문자열
 */
export function extractDateFromSheetName(
	sheetName: string,
	fileName: string,
): string {
	// 시트 이름에서 월/일 추출 (예: "7월15일" → 7, 15)
	const sheetMatch = sheetName.match(/(\d+)월(\d+)일/);
	if (!sheetMatch) {
		return new Date().toISOString().split("T")[0];
	}

	const month = Number.parseInt(sheetMatch[1], 10);
	const day = Number.parseInt(sheetMatch[2], 10);

	// 파일명에서 년도 추출
	const year = extractYearFromFileName(fileName);

	// YYYY-MM-DD 형식으로 변환 (월, 일을 2자리로 패딩)
	const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

	return dateStr;
}

/**
 * 셀 메모 추출 (셀병합 고려)
 *
 * Google Sheets에서 셀병합된 경우 주석이 첫 번째 셀에만 있을 수 있어서,
 * 현재 셀에 주석이 없으면 이전/다음 행에서 주석을 찾아 반환합니다.
 *
 * 처리 대상: 상차지(B열), 하차지(C열)
 * 제외 대상: 경고사항(D열) - 셀 값 자체를 사용하므로 주석 불필요
 *
 * @param originalData - Google Sheets API 원본 데이터
 * @param colIndex - 열 인덱스 (0부터 시작)
 * @param rowIndex - 행 인덱스 (0부터 시작)
 * @returns 셀 메모 문자열 또는 undefined
 */
function extractCellMemo(
	originalData: SheetDataResponse,
	colIndex: number,
	rowIndex: number,
): string | undefined {
	try {
		const rowData = originalData.sheets?.[0]?.data?.[0]?.rowData;

		if (!rowData || !rowData[rowIndex]?.values?.[colIndex]) {
			return undefined;
		}

		const cell = rowData[rowIndex]?.values?.[colIndex];

		// 셀병합된 셀의 경우 주석이 없을 수 있으므로, 이전 행에서 주석을 찾아보기
		let result = cell?.note || undefined;

		// 상차지(B열), 하차지(C열)이고 주석이 없는 경우, 이전 행에서 주석 찾기
		// 경고사항(D열)은 주석이 아니라 셀 값 자체를 사용하므로 제외
		if ((colIndex === 1 || colIndex === 2) && !result) {
			const currentCellValue = cell?.formattedValue || "";

			// 1. 현재 셀에 값이 있는 경우: 같은 셀값을 가진 이전 행에서 주석 찾기
			if (currentCellValue) {
				for (let i = rowIndex - 1; i >= 0; i--) {
					const prevCell = rowData[i]?.values?.[colIndex];
					const prevCellValue = prevCell?.formattedValue || "";

					// 같은 셀값을 가진 행에서만 주석을 가져오기
					if (prevCellValue === currentCellValue && prevCell?.note) {
						result = prevCell.note;
						break;
					}
				}
			}
			// 2. 현재 셀에 값이 없는 경우 (셀병합의 첫 번째 행): 다음 행에서 주석 찾기
			if (!currentCellValue) {
				// 다음 행부터 셀병합 범위를 찾아서 주석 가져오기
				for (let i = rowIndex + 1; i < rowData.length; i++) {
					const nextCell = rowData[i]?.values?.[colIndex];
					const nextCellNote = nextCell?.note;

					// 다음 행에 주석이 있으면 가져옴
					if (nextCellNote) {
						result = nextCellNote;
						break;
					}
				}
			}
		}

		return result;
	} catch (error) {
		return undefined;
	}
}

/**
 * 시트 데이터를 배차 데이터로 파싱
 *
 * 📊 시트 구조 (경고사항 열 추가 후):
 * ┌─────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
 * │ 행  │ A열     │ B열     │ C열     │ D열     │ E열     │ F열     │ G열     │
 * ├─────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
 * │ 4행 │         │         │         │         │         │         │ 매입처1 │
 * │ 5행 │         │         │         │         │         │         │ 차량번호1│
 * │ 6행 │         │         │         │         │         │         │         │
 * │ 7행 │ 배차타입1│ 상차지1 │ 하차지1 │ 경고사항1│ 요청1   │         │ 배차데이터│
 * │ 8행 │ 배차타입2│ 상차지2 │ 하차지2 │ 경고사항2│ 요청2   │         │ 배차데이터│
 * └─────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
 *
 * ⚠️  경고사항 열 추가로 인한 영향:
 * - C열 이후 모든 데이터가 한 열씩 밀려남
 * - F열이 G열로 밀려남 (매입처/차량번호 시작점)
 * - 요청 열은 E열로 이동 (기존 D열에서)
 *
 * 🔍 데이터 추출 순서:
 * 1. 배차타입 (A7~) - 세로로 추출, 셀병합 고려
 * 2. 상차지 (B7~) - 세로로 추출, 셀병합 고려
 * 3. 하차지 (C7~) - 세로로 추출, 셀병합 고려
 * 4. 경고사항 (D7~) - 세로로 추출, 셀병합 고려 (셀 값 사용)
 * 5. 매입처 (G4~) - 가로로 추출, 셀병합 고려
 * 6. 차량번호 (G5~) - 가로로 추출, 셀병합 고려 안함
 * 7. 배차 데이터 생성 (G7~) - 각 매입처/차량별 회전수
 *
 * @param sheetData - 시트의 2차원 배열 데이터
 * @param sheetId - 시트 ID
 * @param fileName - 파일명 (년도 추출용)
 * @param sheetName - 시트명 (날짜 추출용)
 * @param originalData - Google Sheets API 원본 데이터 (메모 추출용)
 * @returns 파싱된 배차 데이터 배열
 */
export const parseSheetToDispatchData = (
	sheetData: unknown[][],
	sheetId: string,
	fileName: string,
	sheetName: string,
	originalData: SheetDataResponse,
): DispatchData[] => {
	const dispatchDataList: DispatchData[] = [];
	const docId = extractDateFromSheetName(sheetName, fileName);

	// 1️⃣ 배차타입 추출 (A7부터 세로로, 셀병합 고려)
	// A열(인덱스 0)에서 7행부터 세로로 데이터를 읽어옴
	// 셀병합된 경우 이전 값이 유지되도록 처리
	const dispatchTypes: string[] = [];
	let currentDispatchType = "";

	for (let i = 6; i < sheetData.length; i++) {
		// A7부터 시작 (인덱스 6 = 7행)
		const cellValue = sheetData[i]?.[0]; // A열 (인덱스 0)
		if (cellValue && typeof cellValue === "string" && cellValue.trim()) {
			currentDispatchType = cellValue.trim();
		}
		if (currentDispatchType) {
			dispatchTypes.push(currentDispatchType);
		}
	}

	// 2️⃣ 상차지 추출 (B7부터 세로로, 셀병합 고려)
	// B열(인덱스 1)에서 7행부터 세로로 데이터를 읽어옴
	// 셀병합된 경우 이전 값이 유지되도록 처리
	const loadingLocations: string[] = [];
	let currentLoadingLocation = "";

	for (let i = 6; i < sheetData.length; i++) {
		// B7부터 시작 (인덱스 6 = 7행)
		const cellValue = sheetData[i]?.[1]; // B열 (인덱스 1)
		if (cellValue && typeof cellValue === "string" && cellValue.trim()) {
			currentLoadingLocation = cellValue.trim();
		}
		if (currentLoadingLocation) {
			loadingLocations.push(currentLoadingLocation);
		}
	}

	// 3️⃣ 하차지 추출 (C7부터 세로로, 셀병합 고려)
	// C열(인덱스 2)에서 7행부터 세로로 데이터를 읽어옴
	// 셀병합된 경우 이전 값이 유지되도록 처리
	const unloadingLocations: string[] = [];
	let currentUnloadingLocation = "";

	for (let i = 6; i < sheetData.length; i++) {
		// C7부터 시작 (인덱스 6 = 7행)
		const cellValue = sheetData[i]?.[2]; // C열 (인덱스 2)
		if (cellValue && typeof cellValue === "string" && cellValue.trim()) {
			currentUnloadingLocation = cellValue.trim();
		}
		if (currentUnloadingLocation) {
			unloadingLocations.push(currentUnloadingLocation);
		}
	}

	// 4️⃣ 경고사항 추출 (D7부터 세로로, 셀병합 고려)
	// D열(인덱스 3)에서 7행부터 세로로 데이터를 읽어옴
	// ⚠️ 경고사항은 주석이 아니라 셀 값 자체를 사용 (extractCellMemo 사용 안함)
	const warnings: string[] = [];
	let currentWarning = "";

	for (let i = 6; i < sheetData.length; i++) {
		// D7부터 시작 (인덱스 6 = 7행)
		const cellValue = sheetData[i]?.[3]; // D열 (인덱스 3)
		if (cellValue && typeof cellValue === "string" && cellValue.trim()) {
			currentWarning = cellValue.trim();
		}
		if (currentWarning) {
			warnings.push(currentWarning);
		}
	}

	// 5️⃣ 매입처 추출 (G4부터 가로로, 셀병합 고려)
	// 4행(인덱스 3)에서 G열(인덱스 6)부터 가로로 데이터를 읽어옴
	// ⚠️ 경고사항 열 추가로 인해 F열에서 G열로 이동 (인덱스 5 → 6)
	const suppliers: string[] = [];
	if (sheetData.length > 3) {
		const row4 = sheetData[3]; // 4행 (인덱스 3)

		let currentSupplier = "";
		for (let i = 6; i < row4.length; i++) {
			// G4부터 시작 (인덱스 6) - 경고사항 열 추가로 인해 F열에서 G열로 이동
			const supplier = row4[i];
			if (supplier && typeof supplier === "string" && supplier.trim()) {
				currentSupplier = supplier.trim();
			}
			if (currentSupplier) {
				suppliers.push(currentSupplier);
			}
		}
	}

	// 6️⃣ 차량번호 추출 (G5부터 가로로, 셀병합 고려 안함)
	// 5행(인덱스 4)에서 G열(인덱스 6)부터 가로로 데이터를 읽어옴
	// ⚠️ 경고사항 열 추가로 인해 F열에서 G열로 이동 (인덱스 5 → 6)
	// 차량번호는 셀병합되지 않으므로 각 셀의 값을 개별적으로 처리
	const vehicleNumbers: string[] = [];
	if (sheetData.length > 4) {
		const row5 = sheetData[4]; // 5행 (인덱스 4)

		for (let i = 6; i < row5.length; i++) {
			// G5부터 시작 (인덱스 6) - 경고사항 열 추가로 인해 F열에서 G열로 이동
			const vehicleNumber = row5[i];
			if (
				vehicleNumber &&
				typeof vehicleNumber === "string" &&
				vehicleNumber.trim()
			) {
				vehicleNumbers.push(vehicleNumber.trim());
			}
		}
	}

	// 7️⃣ 배차 데이터 생성 및 조합
	// 각 매입처/차량 조합에 대해 상하차지 쌍별로 배차 데이터를 생성
	// ⚠️ 경고사항 열 추가로 인해 F열에서 G열로 이동 (인덱스 5 → 6)
	for (let i = 0; i < suppliers.length && i < vehicleNumbers.length; i++) {
		const supplier = suppliers[i];
		const vehicleNumber = vehicleNumbers[i];
		const columnIndex = 6 + i; // G열부터 시작하므로 6 + i (경고사항 열 추가로 인해 F열에서 G열로 이동)

		if (supplier && vehicleNumber) {
			// 각 상하차지 쌍에 대해 배차 데이터 생성
			// 상하차지 개수만큼 반복하여 모든 경로에 대한 배차 정보 생성
			for (
				let j = 0;
				j < Math.min(loadingLocations.length, unloadingLocations.length);
				j++
			) {
				const loadingLocation = loadingLocations[j];
				const unloadingLocation = unloadingLocations[j];
				const dispatchType = dispatchTypes[j] || "기타";
				const rowIndex = 6 + j; // 7행부터 시작하므로 6 + j

				// 해당 차량의 배차 여부 및 회전수 확인
				// 해당 열(매입처/차량)의 해당 행(상하차지 쌍)에 값이 있는지 체크
				let rotationCount = 0;
				if (sheetData[rowIndex]?.[columnIndex]) {
					const cellValue = sheetData[rowIndex][columnIndex];
					// 숫자 값 처리: "1", 1, "2", 2 등
					if (cellValue === "1" || cellValue === 1) {
						rotationCount = 1;
					} else if (
						typeof cellValue === "string" &&
						!Number.isNaN(Number(cellValue))
					) {
						rotationCount = Number(cellValue);
					} else if (typeof cellValue === "number") {
						rotationCount = cellValue;
					}
				}

				if (
					loadingLocation &&
					unloadingLocation &&
					dispatchType &&
					rotationCount > 0
				) {
					// 📝 셀 메모 추출 (상차지, 하차지)
					// extractCellMemo 함수를 사용하여 셀병합 고려한 주석 추출
					const loadingMemo = extractCellMemo(originalData, 1, 6 + j); // B열(인덱스 1), 7행+j
					const unloadingMemo = extractCellMemo(originalData, 2, 6 + j); // C열(인덱스 2), 7행+j

					// ⚠️ 경고사항은 주석이 아니라 셀 값 자체를 사용
					// extractCellMemo 사용하지 않고 직접 셀 값에서 추출
					const warningCell = sheetData[6 + j]?.[3]; // D열(인덱스 3), 7행+j (경고사항)
					const warning =
						typeof warningCell === "string" ? warningCell.trim() : ""; // 문자열인 경우만 사용

					// 🚛 배차 데이터 객체 생성
					// 모든 추출된 정보를 조합하여 DispatchData 타입으로 생성
					const dispatchData: DispatchData = {
						id: docId,
						date: docId,
						sheetId,
						supplier,
						vehicleNumber,
						dispatchType,
						loadingLocation,
						unloadingLocation,
						rotationCount,
						loadingMemo: loadingMemo ?? "",
						unloadingMemo: unloadingMemo ?? "",
						warning: warning ?? "",
					};

					dispatchDataList.push(dispatchData);
				}
			}
		}
	}

	return dispatchDataList;
};
