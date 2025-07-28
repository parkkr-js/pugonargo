/**
 * 환경별 Google OAuth 리디렉션 URL 생성
 */
export const getGoogleRedirectUri = (): string => {
	const currentUrl = window.location.origin;

	// 개발 환경 (preview 채널)인지 확인
	const isPreviewChannel = currentUrl.includes("--preview-");

	if (isPreviewChannel) {
		// 개발 환경: 현재 URL + /auth/callback
		return `${currentUrl}/auth/callback`;
	}

	// 운영 환경: 환경변수 사용
	return (
		process.env.REACT_APP_GOOGLE_REDIRECT_URI || `${currentUrl}/auth/callback`
	);
};

/**
 * 현재 환경이 개발 환경인지 확인
 */
export const isDevelopmentEnvironment = (): boolean => {
	const currentUrl = window.location.origin;
	return currentUrl.includes("--preview-");
};
