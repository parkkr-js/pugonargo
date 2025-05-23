//src/routes/LoginPage.tsx
import { Card, Spin } from "antd";
import { useAuth } from "../features/auth/presentation/hooks/useAuth";
import { LoginForm } from "../ui/login";

const LoginPage = () => {
	const { isLoading, user } = useAuth();

	if (isLoading) {
		return (
			<div
				style={{
					minHeight: "100vh",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					background: "#f0f2f5",
				}}
			>
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div
			style={{
				minHeight: "100vh",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				background: "#f0f2f5",
			}}
		>
			<Card
				style={{
					width: 400,
					boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
					borderRadius: 8,
				}}
			>
				{user && user.userType === "driver" && (
					<div
						style={{ textAlign: "center", marginBottom: 16, color: "#52c41a" }}
					>
						로그인 성공! {user.vehicleNumber} 기사님 환영합니다.
					</div>
				)}
				<LoginForm />
			</Card>
		</div>
	);
};

export default LoginPage;
