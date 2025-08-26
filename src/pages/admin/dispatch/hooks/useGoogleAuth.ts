import { useCallback, useEffect, useState } from "react";
import { DispatchGoogleAuthService } from "../../../../services/dispatch/dispatchGoogleAuthService";

/**
 * Google OAuth 상태 관리 훅 (배차 관리용)
 */
const dispatchGoogleAuthService = new DispatchGoogleAuthService();
const TOKEN_CHECK_INTERVAL = 5000;

export const useGoogleAuth = () => {
	const [accessToken, setAccessToken] = useState<string>("");
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

	/** URL 해시에서 토큰 추출 → 저장 */
	const extractAndStoreToken = useCallback(() => {
		const tokenData = dispatchGoogleAuthService.extractTokenFromUrl();
		if (tokenData.access_token) {
			dispatchGoogleAuthService.storeAccessToken(tokenData.access_token);
			window.history.replaceState(null, "", window.location.pathname);
			return true;
		}
		return false;
	}, []);

	/** 토큰 검증 및 인증 상태 갱신 */
	const checkAuth = useCallback(async () => {
		extractAndStoreToken();
		const token = dispatchGoogleAuthService.getStoredAccessToken();
		if (!token) {
			setAccessToken("");
			setIsAuthenticated(false);
			return;
		}
		const isValid = await dispatchGoogleAuthService.validateToken(token);
		if (isValid) {
			setAccessToken(token);
			setIsAuthenticated(true);
		} else {
			dispatchGoogleAuthService.removeAccessToken();
			setAccessToken("");
			setIsAuthenticated(false);
		}
	}, [extractAndStoreToken]);

	useEffect(() => {
		checkAuth();
		const intervalId = setInterval(checkAuth, TOKEN_CHECK_INTERVAL);
		return () => clearInterval(intervalId);
	}, [checkAuth]);

	/** OAuth 시작 */
	const handleAuth = () => {
		dispatchGoogleAuthService.startOAuthFlow();
	};

	/** 로그아웃 */
	const handleLogout = () => {
		dispatchGoogleAuthService.logout();
		setAccessToken("");
		setIsAuthenticated(false);
	};

	return { accessToken, isAuthenticated, handleAuth, handleLogout };
};
