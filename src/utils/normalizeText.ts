// 한글 검색을 위한 유니코드 정규화 함수
export const normalizeText = (text: string): string => {
	return text.normalize("NFKC").toLowerCase();
};
