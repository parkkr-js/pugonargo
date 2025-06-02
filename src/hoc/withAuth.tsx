import { Spin } from "antd";
import type { ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

// 인증이 필요한 컴포넌트를 감싸는 HOC
export function withAuth<P extends object>(
	WrappedComponent: ComponentType<P>,
): ComponentType<P> {
	return function AuthenticatedComponent(props: P) {
		const { isAuthenticated, isLoading } = useAuthStore();

		// 로딩 중일 때
		if (isLoading) {
			return (
				<div
					style={{
						height: "100vh",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Spin size="large" />
				</div>
			);
		}

		// 인증되지 않은 경우 로그인 페이지로 리다이렉트
		if (!isAuthenticated) {
			return <Navigate to="/login" replace />;
		}

		// 인증된 경우 원래 컴포넌트 렌더링
		return <WrappedComponent {...props} />;
	};
}
