import type { DispatchData, SheetDataResponse } from "../../types/dispatch";

/**
 * 배차 시트 파싱
 * - 상단 헤더: 4행 매입처(G~), 5행 차량번호(G~)
 * - 본문: 7행부터 A:배차타입, B:상차지, C:하차지, D:경고사항, G~:회전수
 * - 경계: A열(배차타입) 첫 공백 행까지, 매입처는 4행 마지막 유효 헤더 열까지
 */
export function extractYearFromFileName(fileName: string): string {
	const match = fileName.match(/배차\s*\((\d{4})년/);
	return match ? match[1] : new Date().getFullYear().toString();
}

/** 시트 이름(7월15일) → YYYY-MM-DD */
export function extractDateFromSheetName(
	sheetName: string,
	fileName: string,
): string {
	const sheetMatch = sheetName.match(/(\d+)월(\d+)일/);
	if (!sheetMatch) return new Date().toISOString().split("T")[0];
	const month = Number.parseInt(sheetMatch[1], 10);
	const day = Number.parseInt(sheetMatch[2], 10);
	const year = extractYearFromFileName(fileName);
	return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** 상/하차지 메모 추출: 병합 메타 우선, 없으면 상향 스캔 */
function extractCellMemo(
	originalData: SheetDataResponse,
	colIndex: number,
	rowIndex: number,
): string | undefined {
	try {
		const sheet = originalData.sheets?.[0];
		const rowData = sheet?.data?.[0]?.rowData;
		if (!rowData) return undefined;
		const merges = sheet?.merges ?? [];
		for (const merge of merges) {
			const sr = merge.startRowIndex ?? 0;
			const er = merge.endRowIndex ?? 0;
			const sc = merge.startColumnIndex ?? 0;
			const ec = merge.endColumnIndex ?? 0;
			if (rowIndex >= sr && rowIndex < er && colIndex >= sc && colIndex < ec) {
				const anchor = rowData[sr]?.values?.[sc];
				if (anchor?.note) return anchor.note;
				break;
			}
		}
		const currentCell = rowData[rowIndex]?.values?.[colIndex];
		if (currentCell?.note) return currentCell.note;
		for (let i = rowIndex - 1; i >= 0; i--) {
			const cell = rowData[i]?.values?.[colIndex];
			if (cell?.formattedValue) return cell.note;
		}
		return undefined;
	} catch (error) {
		console.error("extractCellMemo 에러:", error);
		return undefined;
	}
}

/** 시트 → 배차 데이터 리스트 */
export const parseSheetToDispatchData = (
	sheetData: unknown[][],
	sheetId: string,
	fileName: string,
	sheetName: string,
	originalData: SheetDataResponse,
): DispatchData[] => {
	const dispatchDataList: DispatchData[] = [];
	const docId = extractDateFromSheetName(sheetName, fileName);

	// 행 경계: 배차타입(A열) 첫 공백
	const lastRowIndex = (() => {
		let last = 5;
		for (let i = 6; i < sheetData.length; i++) {
			const v = sheetData[i]?.[0];
			const s = typeof v === "string" ? v.trim() : "";
			if (!s) break;
			last = i;
		}
		return last;
	})();
	if (lastRowIndex < 6) return dispatchDataList;

	// A열: 배차타입
	const dispatchTypes: string[] = [];
	let currentDispatchType = "";
	for (let i = 6; i <= lastRowIndex; i++) {
		const cellValue = sheetData[i]?.[0];
		if (cellValue && typeof cellValue === "string" && cellValue.trim()) {
			currentDispatchType = cellValue.trim();
		}
		if (currentDispatchType) dispatchTypes.push(currentDispatchType);
	}

	// B열: 상차지
	const loadingLocations: string[] = [];
	let currentLoadingLocation = "";
	for (let i = 6; i <= lastRowIndex; i++) {
		const cellValue = sheetData[i]?.[1];
		if (cellValue && typeof cellValue === "string" && cellValue.trim()) {
			currentLoadingLocation = cellValue.trim();
		}
		if (currentLoadingLocation) loadingLocations.push(currentLoadingLocation);
	}

	// C열: 하차지
	const unloadingLocations: string[] = [];
	let currentUnloadingLocation = "";
	for (let i = 6; i <= lastRowIndex; i++) {
		const cellValue = sheetData[i]?.[2];
		if (cellValue && typeof cellValue === "string" && cellValue.trim()) {
			currentUnloadingLocation = cellValue.trim();
		}
		if (currentUnloadingLocation)
			unloadingLocations.push(currentUnloadingLocation);
	}

	// D열: 경고사항 (셀 값 사용)
	const warnings: string[] = [];
	let currentWarning = "";
	for (let i = 6; i <= lastRowIndex; i++) {
		const cellValue = sheetData[i]?.[3];
		if (cellValue && typeof cellValue === "string" && cellValue.trim()) {
			currentWarning = cellValue.trim();
		}
		if (currentWarning) warnings.push(currentWarning);
	}

	// 헤더 경계: 4행(G~) 마지막 유효 열
	const suppliers: string[] = [];
	let lastHeaderCol = 5;
	if (sheetData.length > 3) {
		const row4 = sheetData[3];
		for (let i = row4.length - 1; i >= 6; i--) {
			const v = row4[i];
			if (typeof v === "string" && v.trim().length > 0) {
				lastHeaderCol = i;
				break;
			}
		}
		for (let i = 6; i <= lastHeaderCol; i++) {
			const supplier = row4[i];
			suppliers.push(typeof supplier === "string" ? supplier.trim() : "");
		}
	}

	// 5행: 차량번호 (G..lastHeaderCol)
	const vehicleNumbers: string[] = [];
	if (sheetData.length > 4) {
		const row5 = sheetData[4];
		for (let i = 6; i <= lastHeaderCol && i < row5.length; i++) {
			const vehicleNumber = row5[i];
			vehicleNumbers.push(
				vehicleNumber && typeof vehicleNumber === "string"
					? vehicleNumber.trim()
					: "",
			);
		}
	}

	// 데이터 생성
	for (let i = 0; i < suppliers.length && i < vehicleNumbers.length; i++) {
		const supplier = suppliers[i];
		const vehicleNumber = vehicleNumbers[i];
		const columnIndex = 6 + i;
		if (supplier && vehicleNumber) {
			for (
				let j = 0;
				j <
				Math.min(
					loadingLocations.length,
					unloadingLocations.length,
					lastRowIndex - 6 + 1,
				);
				j++
			) {
				const loadingLocation = loadingLocations[j];
				const unloadingLocation = unloadingLocations[j];
				const dispatchType = dispatchTypes[j] || "기타";
				const rowIndex = 6 + j;
				let rotationCount = 0;
				if (sheetData[rowIndex]?.[columnIndex]) {
					const cellValue = sheetData[rowIndex][columnIndex];
					if (cellValue === "1" || cellValue === 1) rotationCount = 1;
					else if (
						typeof cellValue === "string" &&
						!Number.isNaN(Number(cellValue))
					)
						rotationCount = Number(cellValue);
					else if (typeof cellValue === "number") rotationCount = cellValue;
				}
				if (
					loadingLocation &&
					unloadingLocation &&
					dispatchType &&
					rotationCount > 0
				) {
					const loadingMemo = extractCellMemo(originalData, 1, 6 + j) ?? "";
					const unloadingMemo = extractCellMemo(originalData, 2, 6 + j) ?? "";
					const warningCell = sheetData[6 + j]?.[3];
					const warning =
						typeof warningCell === "string" ? warningCell.trim() : "";
					dispatchDataList.push({
						id: docId,
						date: docId,
						sheetId,
						supplier,
						vehicleNumber,
						dispatchType,
						loadingLocation,
						unloadingLocation,
						rotationCount,
						loadingMemo,
						unloadingMemo,
						warning,
					});
				}
			}
		}
	}

	return dispatchDataList;
};
