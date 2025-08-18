import { useCallback, useEffect, useState } from "react";
import { DispatchGoogleAuthService } from "../../../../services/dispatch/dispatchGoogleAuthService";

const dispatchGoogleAuthService = new DispatchGoogleAuthService();
const TOKEN_CHECK_INTERVAL = 5000; // 5초마다 체크 (더 자주 체크)

export const useGoogleAuth = () => {
	const [accessToken, setAccessToken] = useState<string>("");
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

	// URL 해시에서 토큰 추출 및 저장
	const extractAndStoreToken = useCallback(() => {
		const tokenData = dispatchGoogleAuthService.extractTokenFromUrl();

		if (tokenData.access_token) {
			dispatchGoogleAuthService.storeAccessToken(tokenData.access_token);
			// URL에서 해시 제거
			window.history.replaceState(null, "", window.location.pathname);
			return true;
		}
		return false;
	}, []);

	// 토큰 상태 체크 함수
	const checkAuth = useCallback(async () => {
		// URL에서 토큰 추출 시도
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

	const handleAuth = () => {
		dispatchGoogleAuthService.startOAuthFlow();
	};

	const handleLogout = () => {
		dispatchGoogleAuthService.logout();
		setAccessToken("");
		setIsAuthenticated(false);
	};

	return {
		accessToken,
		isAuthenticated,
		handleAuth,
		handleLogout,
	};
};
