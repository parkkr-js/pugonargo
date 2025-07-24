import type { DispatchData } from "./firebaseService";
import type { SheetDataResponse } from "./sheetDataService";

/**
 * 파일명에서 날짜 추출
 */
export function extractDateFromFileName(fileName: string): string {
	const match = fileName.match(/배차\s*\((\d{4})년/);
	const year = match ? match[1] : new Date().getFullYear().toString();
	return `${year}-07-01`; // 임시로 7월 1일로 설정
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
		console.log("=== 셀 메모 추출 디버깅 ===");
		console.log("열 인덱스:", colIndex, "행 인덱스:", rowIndex);

		const rowData = originalData.sheets?.[0]?.data?.[0]?.rowData;
		console.log("rowData 존재:", !!rowData);
		console.log("rowData 길이:", rowData?.length);

		if (!rowData || !rowData[rowIndex]?.values?.[colIndex]) {
			console.log(`셀 데이터 없음: rowData[${rowIndex}]?.values[${colIndex}]`);
			return undefined;
		}

		const cell = rowData[rowIndex]?.values?.[colIndex];
		console.log("셀 데이터:", cell);
		console.log("셀 note:", cell?.note);

		// 셀병합된 셀의 경우 주석이 없을 수 있으므로, 이전 행에서 주석을 찾아보기
		let result = cell?.note || undefined;

		// 상차지(B열)이고 주석이 없는 경우, 이전 행에서 주석 찾기
		if (colIndex === 1 && !result) {
			console.log("상차지 주석이 없음, 이전 행에서 찾기 시도");
			for (let i = rowIndex - 1; i >= 0; i--) {
				const prevCell = rowData[i]?.values?.[colIndex];
				if (prevCell?.note) {
					console.log(`이전 행 ${i}에서 주석 발견:`, prevCell.note);
					result = prevCell.note;
					break;
				}
			}
		}

		console.log("최종 추출된 메모:", result);

		return result;
	} catch (error) {
		console.error("셀 메모 추출 실패:", error);
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
	originalData: SheetDataResponse,
): DispatchData[] => {
	console.log("=== 시트 파싱 시작 ===");
	console.log("시트 데이터 길이:", sheetData.length);
	console.log("파일명:", fileName);

	const dispatchDataList: DispatchData[] = [];
	const docId = extractDateFromFileName(fileName);

	console.log("추출된 날짜:", docId);

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

	console.log("=== 배차타입 추출 ===");
	console.log("배차타입 개수:", dispatchTypes.length);
	console.log("배차타입 목록:", dispatchTypes);

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

	console.log("=== 상차지 추출 ===");
	console.log("상차지 개수:", loadingLocations.length);
	console.log("상차지 목록:", loadingLocations);

	// 3. 하차지 추출 (C7부터 세로로, 셀병합 고려 안함)
	const unloadingLocations: string[] = [];
	for (let i = 6; i < sheetData.length; i++) {
		// C7부터 (인덱스 6)
		const cellValue = sheetData[i]?.[2]; // C열 (인덱스 2)
		if (cellValue && typeof cellValue === "string" && cellValue.trim()) {
			unloadingLocations.push(cellValue.trim());
		}
	}

	console.log("=== 하차지 추출 ===");
	console.log("하차지 개수:", unloadingLocations.length);
	console.log("하차지 목록:", unloadingLocations);

	// 4. 매입처 추출 (F4부터 가로로, 셀병합 고려)
	const suppliers: string[] = [];
	if (sheetData.length > 3) {
		const row4 = sheetData[3]; // 4행 (인덱스 3)
		console.log("4행 전체 데이터:", row4);

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

	console.log("=== 매입처 추출 ===");
	console.log("매입처 개수:", suppliers.length);
	console.log("매입처 목록:", suppliers);

	// 5. 차량번호 추출 (F5부터 가로로, 셀병합 고려 안함)
	const vehicleNumbers: string[] = [];
	if (sheetData.length > 4) {
		const row5 = sheetData[4]; // 5행 (인덱스 4)
		console.log("5행 전체 데이터:", row5);

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

	console.log("=== 차량번호 추출 ===");
	console.log("차량번호 개수:", vehicleNumbers.length);
	console.log("차량번호 목록:", vehicleNumbers);

	// 6. 배차 데이터 생성
	console.log("=== 배차 데이터 생성 시작 ===");

	for (let i = 0; i < suppliers.length && i < vehicleNumbers.length; i++) {
		const supplier = suppliers[i];
		const vehicleNumber = vehicleNumbers[i];
		const columnIndex = 5 + i; // F열부터 시작하므로 5 + i

		console.log(
			`매입처 ${i}:`,
			supplier,
			"차량번호:",
			vehicleNumber,
			"열 인덱스:",
			columnIndex,
		);

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

				console.log(
					`상하차지 쌍 ${j}:`,
					loadingLocation,
					"→",
					unloadingLocation,
					"유형:",
					dispatchType,
					"배차여부:",
					rotationCount,
				);

				if (
					loadingLocation &&
					unloadingLocation &&
					dispatchType &&
					rotationCount > 0
				) {
					// 주석 추출 디버깅
					console.log(`=== 배차 데이터 ${i}-${j} 주석 추출 ===`);
					console.log("상차지:", loadingLocation, "하차지:", unloadingLocation);

					const loadingMemo = extractCellMemo(originalData, 1, 6 + j); // B열, 7행+j
					const unloadingMemo = extractCellMemo(originalData, 2, 6 + j); // C열, 7행+j

					console.log("추출된 상차지 주석:", loadingMemo);
					console.log("추출된 하차지 주석:", unloadingMemo);

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

					console.log("생성된 배차 데이터:", dispatchData);
					dispatchDataList.push(dispatchData);
				}
			}
		}
	}

	console.log("=== 파싱 완료 ===");
	console.log("총 배차 데이터 개수:", dispatchDataList.length);

	return dispatchDataList;
};
