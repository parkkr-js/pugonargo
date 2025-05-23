import { Spin } from "antd";
import type { ComponentProps } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/presentation/hooks/useAuth";

type WrappedComponentProps = ComponentProps<React.ComponentType>;

export const withAuth = (
	WrappedComponent: React.ComponentType<WrappedComponentProps>,
	requireAdmin = false,
) => {
	const WithAuthComponent: React.FC<WrappedComponentProps> = (props) => {
		const { isAuthenticated, isAdmin, isLoading } = useAuth();
		const location = useLocation();

		if (isLoading) {
			return (
				<div
					style={{
						height: "100vh",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Spin size="large" />
				</div>
			);
		}

		if (!isAuthenticated) {
			return <Navigate to="/login" state={{ from: location }} replace />;
		}

		if (requireAdmin && !isAdmin) {
			return <Navigate to="/driver" replace />;
		}

		return <WrappedComponent {...props} />;
	};

	return WithAuthComponent;
};
