import { useCallback, useEffect, useState } from "react";
import { GoogleAuthService } from "../../../../services/sheet-management/googleAuthService";

const googleAuthService = new GoogleAuthService();

// 토큰 만료 체크 간격 (1초)
const TOKEN_CHECK_INTERVAL = 1000;

export const useGoogleAuth = () => {
	const [accessToken, setAccessToken] = useState<string>("");
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

	// 토큰 상태 체크 함수
	const checkAuth = useCallback(async () => {
		const token = googleAuthService.getStoredAccessToken();
		if (token) {
			const isValid = await googleAuthService.validateToken(token);
			if (isValid) {
				setAccessToken(token);
				setIsAuthenticated(true);
			} else {
				googleAuthService.removeAccessToken();
				setAccessToken("");
				setIsAuthenticated(false);
			}
		} else {
			setAccessToken("");
			setIsAuthenticated(false);
		}
	}, []);

	useEffect(() => {
		// 초기 체크
		checkAuth();

		// 주기적 체크 설정
		const intervalId = setInterval(checkAuth, TOKEN_CHECK_INTERVAL);

		// 클린업
		return () => clearInterval(intervalId);
	}, [checkAuth]);

	const handleAuth = () => {
		googleAuthService.startOAuthFlow();
	};

	const handleLogout = () => {
		googleAuthService.logout();
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
