import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/admin/DashboardPage";
import { DriversPage } from "../pages/admin/DriversPage";
import { SheetsPage } from "../pages/admin/SheetsPage";
import { TransactionsPage } from "../pages/admin/TransactionsPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { OAuthCallbackPage } from "../pages/auth/OAuthCallbackPage";
import DriverPage from "../pages/driver";
import { useAuthStore } from "../stores/authStore";

// 루트 경로 리다이렉트 컴포넌트
const RootRedirect = () => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	// 로그인된 사용자의 역할에 따라 리다이렉트
	if (user?.role === "admin") {
		return <Navigate to="/dashboard" replace />;
	}

	if (user?.role === "driver") {
		return <Navigate to="/driver" replace />;
	}

	// 기본적으로 로그인 페이지로
	return <Navigate to="/login" replace />;
};

export const AppRouter = () => {
	return (
		<BrowserRouter>
			<Routes>
				{/* 루트 경로 */}
				<Route path="/" element={<RootRedirect />} />

				{/* 인증 관련 */}
				<Route path="/login" element={<LoginPage />} />
				<Route path="/auth/callback" element={<OAuthCallbackPage />} />

				{/* 관리자 페이지 */}
				<Route path="/dashboard" element={<DashboardPage />} />
				<Route path="/transactions" element={<TransactionsPage />} />
				<Route path="/drivers" element={<DriversPage />} />
				<Route path="/sheets" element={<SheetsPage />} />

				{/* 기사 페이지 */}
				<Route path="/driver" element={<DriverPage />} />

				{/* 404 페이지 - 기본 리다이렉트 */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
};
