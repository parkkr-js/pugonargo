import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
	useLoginMutation,
	useLogoutMutation,
	useRestoreSessionQuery,
} from "../../application/api/auth.api";
import type { LoginCredentials } from "../../domain/entities/AuthTypes";

export const useAuth = () => {
	const navigate = useNavigate();

	// RTK Query 훅 사용
	const { data: user, isLoading: isRestoring } = useRestoreSessionQuery(
		undefined,
		{
			refetchOnMountOrArgChange: true,
			refetchOnFocus: true,
		},
	);
	const [login, { isLoading: isLoggingIn }] = useLoginMutation();
	const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

	const handleLogin = useCallback(
		async (credentials: LoginCredentials) => {
			try {
				const result = await login(credentials).unwrap();

				if (result.userType === "admin") {
					navigate("/admin", { replace: true });
				} else {
					navigate("/driver", { replace: true });
				}
			} catch (error) {
				console.error("Login error in useAuth:", error);
				throw error;
			}
		},
		[login, navigate],
	);

	const handleLogout = useCallback(async () => {
		try {
			await logout().unwrap();
			navigate("/login", { replace: true });
		} catch (error) {
			console.error("Logout error:", error);
			throw error;
		}
	}, [logout, navigate]);

	const isAuthenticated = !!user;
	const isAdmin = user?.userType === "admin";
	const isDriver = user?.userType === "driver";
	const isLoading = isLoggingIn || isLoggingOut || isRestoring;

	return {
		user,
		isLoading,
		isAuthenticated,
		isAdmin,
		isDriver,
		login: handleLogin,
		logout: handleLogout,
	};
};
