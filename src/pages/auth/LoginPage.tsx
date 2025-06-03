import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, Space, Typography } from "antd";
import { Navigate } from "react-router-dom";
import { useUnifiedLogin } from "../../hooks/useAuth";
import { useAuthStore } from "../../stores/authStore";
import type { UnifiedLoginRequest } from "../../types/auth";

const { Title, Text } = Typography;

export const LoginPage = () => {
	const { isAuthenticated, isLoading, user } = useAuthStore();
	const unifiedLogin = useUnifiedLogin();

	// 이미 로그인된 경우 역할에 따라 리다이렉트
	if (isAuthenticated && user) {
		const redirectPath = user.role === "admin" ? "/dashboard" : "/driver";
		return <Navigate to={redirectPath} replace />;
	}

	// 통합 로그인 처리
	const handleLogin = async (values: UnifiedLoginRequest) => {
		try {
			await unifiedLogin.mutateAsync(values);
		} catch (error) {
			// 에러는 mutation에서 처리됨
		}
	};

	return (
		<div
			style={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#f5f5f5",
			}}
		>
			<Card
				style={{
					width: 400,
					boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
				}}
			>
				<Space direction="vertical" size="large" style={{ width: "100%" }}>
					{/* 헤더 */}
					<div style={{ textAlign: "center" }}>
						<Title level={2}>푸고나르고</Title>
						<Text type="secondary">관리 시스템</Text>
					</div>

					{/* 로그인 폼 */}
					<Form
						name="unified-login"
						onFinish={handleLogin}
						layout="vertical"
						size="large"
					>
						<Form.Item
							name="username"
							rules={[{ required: true, message: "아이디를 입력해주세요" }]}
						>
							<Input
								prefix={<UserOutlined />}
								placeholder="아이디 (관리자는 이메일, 기사는 아이디)"
								disabled={isLoading}
							/>
						</Form.Item>

						<Form.Item
							name="password"
							rules={[{ required: true, message: "비밀번호를 입력해주세요" }]}
						>
							<Input.Password
								prefix={<LockOutlined />}
								placeholder="비밀번호"
								disabled={isLoading}
							/>
						</Form.Item>

						{unifiedLogin.isError && (
							<Alert
								message={
									unifiedLogin.error instanceof Error
										? unifiedLogin.error.message
										: "로그인에 실패했습니다"
								}
								type="error"
								showIcon
								style={{ marginBottom: 16 }}
							/>
						)}

						<Form.Item>
							<Button
								type="primary"
								htmlType="submit"
								loading={isLoading}
								block
							>
								로그인
							</Button>
						</Form.Item>
					</Form>

					{/* 하단 텍스트 */}
					<div style={{ textAlign: "center" }}>
						<Text type="secondary" style={{ fontSize: "12px" }}>
							문의사항이 있으시면 관리자에게 연락해주세요
						</Text>
					</div>
				</Space>
			</Card>
		</div>
	);
};
