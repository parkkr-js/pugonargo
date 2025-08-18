/**
 * 배차 관련 파일인지 확인하는 함수
 * @param fileName 파일명
 * @returns 배차 파일 여부
 */
export const isDispatchFile = (fileName: string): boolean => {
	// 파일명 앞뒤 공백 제거 및 유니코드 정규화
	const normalizedFileName = fileName.trim().normalize("NFC");

	const startsWithDispatch = normalizedFileName.startsWith("배차");
	const containsDispatch = normalizedFileName.includes("배차");

	return startsWithDispatch || containsDispatch;
};

/**
 * 파일 선택 시 배차 파일 검증
 * @param file 선택된 파일
 * @returns 검증 결과
 */
export const validateDispatchFile = (file: { name: string; id: string }) => {
	if (!isDispatchFile(file.name)) {
		throw new Error(
			'배차 파일만 선택 가능합니다. 파일명이 "배차"로 시작하는 파일을 선택해주세요.',
		);
	}
	return true;
};
