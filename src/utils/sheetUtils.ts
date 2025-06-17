import dayjs from "dayjs";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import type { RawData } from "../types/sheets";

/**
 * Excel 시리얼 날짜를 JavaScript Date로 변환
 * Excel에서는 1900-01-01을 1로 하지만, 실제로는 1899-12-30을 기준으로 함
 */
export const excelSerialToDate = (serial: number): Date => {
	// Excel의 1900년 윤년 버그를 고려한 변환
	const excelEpoch = new Date(1899, 11, 30); // 1899-12-30
	const days = Math.floor(serial);
	const milliseconds = (serial - days) * 24 * 60 * 60 * 1000;

	const result = new Date(
		excelEpoch.getTime() + days * 24 * 60 * 60 * 1000 + milliseconds,
	);
	return result;
};

/**
 * 날짜 문자열이 Excel 시리얼 숫자인지 확인
 */
export const isExcelSerialDate = (value: string | number): boolean => {
	if (typeof value === "number") {
		return value > 1 && value < 100000; // 1900-01-01 ~ 2173년 정도
	}
	if (typeof value === "string") {
		const num = Number.parseFloat(value);
		return !Number.isNaN(num) && num > 1 && num < 100000;
	}
	return false;
};

/**
 * 다양한 날짜 형태를 표준 Date로 변환
 */
export const parseDate = (value: string | number): Date => {
	if (isExcelSerialDate(value)) {
		const serial = typeof value === "string" ? Number.parseFloat(value) : value;
		return excelSerialToDate(serial);
	}

	// 일반 날짜 문자열 처리
	if (typeof value === "string") {
		const date = new Date(value);
		if (!Number.isNaN(date.getTime())) {
			return date;
		}
	}

	throw new Error(`Invalid date format: ${value}`);
};

/**
 * 숫자 값 안전하게 파싱
 */
export const parseNumber = (value: string | number): number => {
	if (typeof value === "number") {
		return Number.isNaN(value) ? 0 : value;
	}
	if (typeof value === "string") {
		const num = Number.parseFloat(value.replace(/,/g, ""));
		return Number.isNaN(num) ? 0 : num;
	}
	return 0;
};

/**
 * 스프레드시트 원시 데이터를 RawData 형태로 변환
 */
export const transformRowToRawData = (
	row: (string | number)[],
	fileId: string,
	fileName: string,
	rowIndex: number,
): RawData => {
	try {
		return {
			id: `${fileId}_${rowIndex}`,
			fileId,
			fileName,
			date: dayjs(parseDate(row[2] || 0)).format("YYYY-MM-DD"), // 반드시 string으로 변환
			d: row[3] as string,
			e: row[4] as string,
			l: row[11] as string,
			i: row[8] as number,
			m: row[12] as number,
			n: row[13] as number,
			o: row[14] as number,
			p: row[15] as string,
			q: row[16] as number,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
	} catch (error) {
		console.error(`Row ${rowIndex} transformation error:`, error);
		throw new Error(`Failed to transform row ${rowIndex}: ${error}`);
	}
};

/**
 * 월별 데이터 필터링
 */
export const filterDataByMonth = (
	data: RawData[],
	year: number,
	month: number,
): RawData[] => {
	return data.filter((item) => {
		const date = new Date(item.date);
		return date.getFullYear() === year && date.getMonth() + 1 === month;
	});
};

export const convertToDate = (value: unknown): Date => {
	if (value instanceof Date) return value;
	if (value && typeof value === "object" && "toDate" in value) {
		return (value as { toDate: () => Date }).toDate();
	}
	if (typeof value === "string") return new Date(value);
	return new Date();
};

export const formatDate = (date: Date): string => {
	return date.toISOString().split("T")[0];
};

export const convertFirestoreDocToRawData = (
	doc: QueryDocumentSnapshot<DocumentData>,
): RawData => {
	const data = doc.data();
	return {
		id: data.id,
		fileId: data.fileId,
		fileName: data.fileName,
		date: formatDate(convertToDate(data.date)),
		d: data.d,
		e: data.e,
		l: data.l,
		m: data.m,
		n: data.n,
		o: data.o,
		p: data.p,
		i: data.i,
		q: data.q,
		createdAt: convertToDate(data.createdAt),
		updatedAt: convertToDate(data.updatedAt),
	};
};
