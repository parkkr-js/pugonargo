import { useEffect, useState } from "react";
import { GoogleAuthService } from "../../../../services/googleAuthService";

const googleAuthService = new GoogleAuthService();

export const useGoogleAuth = () => {
	const [accessToken, setAccessToken] = useState<string>("");
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

	useEffect(() => {
		const checkAuth = async () => {
			const token = googleAuthService.getStoredAccessToken();
			if (token) {
				const isValid = await googleAuthService.validateToken(token);
				if (isValid) {
					setAccessToken(token);
					setIsAuthenticated(true);
				} else {
					googleAuthService.removeAccessToken();
				}
			}
		};

		checkAuth();
	}, []);

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
