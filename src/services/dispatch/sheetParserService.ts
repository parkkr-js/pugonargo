import type { DispatchData } from "./firebaseService";
import type { SheetDataResponse } from "./sheetDataService";

/**
 * 파일명에서 년도 추출
 */
export function extractYearFromFileName(fileName: string): string {
	const match = fileName.match(/배차\s*\((\d{4})년/);
	return match ? match[1] : new Date().getFullYear().toString();
}

/**
 * 시트 이름에서 날짜 추출 (n월d일 형식)
 */
export function extractDateFromSheetName(
	sheetName: string,
	fileName: string,
): string {
	// 시트 이름에서 월/일 추출 (예: "7월15일" -> 7, 15)
	const sheetMatch = sheetName.match(/(\d+)월(\d+)일/);
	if (!sheetMatch) {
		return new Date().toISOString().split("T")[0];
	}

	const month = Number.parseInt(sheetMatch[1], 10);
	const day = Number.parseInt(sheetMatch[2], 10);

	// 파일명에서 년도 추출
	const year = extractYearFromFileName(fileName);

	// YYYY-MM-DD 형식으로 변환
	const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

	return dateStr;
}

/**
 * 셀 메모 추출 (셀병합 고려)
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

		// 상차지(B열) 또는 하차지(C열)이고 주석이 없는 경우, 이전 행에서 주석 찾기
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

	// 1. 배차타입 추출 (A7부터 세로로, 셀병합 고려)
	const dispatchTypes: string[] = [];
	let currentDispatchType = "";

	for (let i = 6; i < sheetData.length; i++) {
		// A7부터 (인덱스 6)
		const cellValue = sheetData[i]?.[0]; // A열 (인덱스 0)
		if (cellValue && typeof cellValue === "string" && cellValue.trim()) {
			currentDispatchType = cellValue.trim();
		}
		if (currentDispatchType) {
			dispatchTypes.push(currentDispatchType);
		}
	}

	// 2. 상차지 추출 (B7부터 세로로, 셀병합 고려)
	const loadingLocations: string[] = [];
	let currentLoadingLocation = "";

	for (let i = 6; i < sheetData.length; i++) {
		// B7부터 (인덱스 6)
		const cellValue = sheetData[i]?.[1]; // B열 (인덱스 1)
		if (cellValue && typeof cellValue === "string" && cellValue.trim()) {
			currentLoadingLocation = cellValue.trim();
		}
		if (currentLoadingLocation) {
			loadingLocations.push(currentLoadingLocation);
		}
	}

	// 3. 하차지 추출 (C7부터 세로로, 셀병합 고려)
	const unloadingLocations: string[] = [];
	let currentUnloadingLocation = "";

	for (let i = 6; i < sheetData.length; i++) {
		// C7부터 (인덱스 6)
		const cellValue = sheetData[i]?.[2]; // C열 (인덱스 2)
		if (cellValue && typeof cellValue === "string" && cellValue.trim()) {
			currentUnloadingLocation = cellValue.trim();
		}
		if (currentUnloadingLocation) {
			unloadingLocations.push(currentUnloadingLocation);
		}
	}

	// 4. 매입처 추출 (F4부터 가로로, 셀병합 고려)
	const suppliers: string[] = [];
	if (sheetData.length > 3) {
		const row4 = sheetData[3]; // 4행 (인덱스 3)

		let currentSupplier = "";
		for (let i = 5; i < row4.length; i++) {
			// F4부터 (인덱스 5)
			const supplier = row4[i];
			if (supplier && typeof supplier === "string" && supplier.trim()) {
				currentSupplier = supplier.trim();
			}
			if (currentSupplier) {
				suppliers.push(currentSupplier);
			}
		}
	}

	// 5. 차량번호 추출 (F5부터 가로로, 셀병합 고려 안함)
	const vehicleNumbers: string[] = [];
	if (sheetData.length > 4) {
		const row5 = sheetData[4]; // 5행 (인덱스 4)

		for (let i = 5; i < row5.length; i++) {
			// F5부터 (인덱스 5)
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

	// 6. 배차 데이터 생성
	for (let i = 0; i < suppliers.length && i < vehicleNumbers.length; i++) {
		const supplier = suppliers[i];
		const vehicleNumber = vehicleNumbers[i];
		const columnIndex = 5 + i; // F열부터 시작하므로 5 + i

		if (supplier && vehicleNumber) {
			// 각 상하차지 쌍에 대해 배차 데이터 생성
			for (
				let j = 0;
				j < Math.min(loadingLocations.length, unloadingLocations.length);
				j++
			) {
				const loadingLocation = loadingLocations[j];
				const unloadingLocation = unloadingLocations[j];
				const dispatchType = dispatchTypes[j] || "기타";
				const rowIndex = 6 + j; // 7행부터 시작하므로 6 + j

				// 해당 차량의 배차 여부 확인 (해당 열의 해당 행에 값이 있는지)
				let rotationCount = 0;
				if (sheetData[rowIndex]?.[columnIndex]) {
					const cellValue = sheetData[rowIndex][columnIndex];
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
					const loadingMemo = extractCellMemo(originalData, 1, 6 + j); // B열, 7행+j
					const unloadingMemo = extractCellMemo(originalData, 2, 6 + j); // C열, 7행+j

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
					};

					dispatchDataList.push(dispatchData);
				}
			}
		}
	}

	return dispatchDataList;
};
